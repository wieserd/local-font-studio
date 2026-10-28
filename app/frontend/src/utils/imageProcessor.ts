export interface ImageProcessOptions {
  threshold: number; // 0 to 255
  invert: boolean;
  removeBg: boolean;
  denoise: number; // 0 to 5
}

export interface GridCell {
  index: number;
  row: number;
  col: number;
  x: number;
  y: number;
  width: number;
  height: number;
  suggestedChar: string;
  dataUrl: string;
}

export const fileToDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Creates binary mask (1 = ink, 0 = paper) from image
 */
export const getBinaryMask = (
  img: HTMLImageElement,
  options: ImageProcessOptions
): { binary: Uint8Array; width: number; height: number } => {
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);

  const imgData = ctx.getImageData(0, 0, img.width, img.height);
  const data = imgData.data;
  const { threshold, invert, removeBg } = options;

  const binary = new Uint8Array(img.width * img.height);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    let gray = 0.299 * r + 0.587 * g + 0.114 * b;
    if (a < 50 && removeBg) {
      gray = 255;
    }

    const isInk = invert ? gray >= threshold : gray < threshold;
    binary[i / 4] = isInk ? 1 : 0;
  }

  return { binary, width: img.width, height: img.height };
};

/**
 * Connected Component Flood Fill around a click point to snap to a letter
 */
export const detectInkBoundingBox = (
  binary: Uint8Array,
  width: number,
  height: number,
  startX: number,
  startY: number
): { x: number; y: number; width: number; height: number } | null => {
  // If clicked on white space, search in a small radius for nearby ink
  let cx = Math.floor(startX);
  let cy = Math.floor(startY);

  if (binary[cy * width + cx] === 0) {
    let found = false;
    for (let r = 1; r <= 15 && !found; r++) {
      for (let dy = -r; dy <= r && !found; dy++) {
        for (let dx = -r; dx <= r && !found; dx++) {
          const nx = cx + dx;
          const ny = cy + dy;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            if (binary[ny * width + nx] === 1) {
              cx = nx;
              cy = ny;
              found = true;
            }
          }
        }
      }
    }
    if (!found) return null;
  }

  // BFS flood fill
  const visited = new Uint8Array(width * height);
  const queueX = [cx];
  const queueY = [cy];
  visited[cy * width + cx] = 1;

  let minX = cx, maxX = cx, minY = cy, maxY = cy;
  let head = 0;
  const maxPixels = 100000;

  while (head < queueX.length && queueX.length < maxPixels) {
    const px = queueX[head];
    const py = queueY[head];
    head++;

    if (px < minX) minX = px;
    if (px > maxX) maxX = px;
    if (py < minY) minY = py;
    if (py > maxY) maxY = py;

    const neighbors = [
      [px + 1, py],
      [px - 1, py],
      [px, py + 1],
      [px, py - 1],
      [px + 1, py + 1],
      [px - 1, py - 1],
      [px + 1, py - 1],
      [px - 1, py + 1],
    ];

    for (let i = 0; i < neighbors.length; i++) {
      const [nx, ny] = neighbors[i];
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const nidx = ny * width + nx;
        if (!visited[nidx] && binary[nidx] === 1) {
          visited[nidx] = 1;
          queueX.push(nx);
          queueY.push(ny);
        }
      }
    }
  }

  // Add a 4px breathing margin around the detected letter
  const pad = 4;
  const x = Math.max(0, minX - pad);
  const y = Math.max(0, minY - pad);
  const w = Math.min(width - x, (maxX - minX + 1) + pad * 2);
  const h = Math.min(height - y, (maxY - minY + 1) + pad * 2);

  if (w < 4 || h < 4) return null;

  return { x, y, width: w, height: h };
};

/**
 * Crops a sub-region from an image into a data URL
 */
export const cropRegionToDataUrl = (
  img: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  options: ImageProcessOptions
): string => {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  const ctx = canvas.getContext('2d')!;

  ctx.drawImage(
    img,
    Math.round(x),
    Math.round(y),
    Math.round(width),
    Math.round(height),
    0,
    0,
    canvas.width,
    canvas.height
  );

  processCanvas(ctx, canvas.width, canvas.height, options);
  return canvas.toDataURL('image/png');
};

/**
 * Applies binarization, inversion, thresholding and despeckling
 */
export const processCanvas = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: ImageProcessOptions
) => {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  const { threshold, invert, removeBg, denoise } = options;

  const binary = new Uint8Array(width * height);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    let gray = 0.299 * r + 0.587 * g + 0.114 * b;
    if (a < 50 && removeBg) {
      gray = 255;
    }

    const isInk = invert ? gray >= threshold : gray < threshold;
    binary[i / 4] = isInk ? 1 : 0;
  }

  if (denoise > 0) {
    const cleaned = new Uint8Array(binary);
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        if (binary[idx] === 1) {
          let count = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx !== 0 || dy !== 0) {
                if (binary[(y + dy) * width + (x + dx)] === 1) count++;
              }
            }
          }
          if (count < denoise) {
            cleaned[idx] = 0;
          }
        }
      }
    }
    binary.set(cleaned);
  }

  for (let idx = 0; idx < binary.length; idx++) {
    const i = idx * 4;
    if (binary[idx] === 1) {
      data[i] = 18;
      data[i + 1] = 22;
      data[i + 2] = 30;
      data[i + 3] = 255;
    } else {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return binary;
};

/**
 * Creates illustrative sample lettering sheet if needed
 */
export const createSampleAlphabetSheet = (): string => {
  const canvas = document.createElement('canvas');
  canvas.width = 900;
  canvas.height = 700;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#f8f9fa';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;

  const rows = 5;
  const cols = 6;
  const cellW = canvas.width / cols;
  const cellH = canvas.height / rows;

  for (let r = 0; r <= rows; r++) {
    ctx.beginPath();
    ctx.moveTo(0, r * cellH);
    ctx.lineTo(canvas.width, r * cellH);
    ctx.stroke();
  }
  for (let c = 0; c <= cols; c++) {
    ctx.beginPath();
    ctx.moveTo(c * cellW, 0);
    ctx.lineTo(c * cellW, canvas.height);
    ctx.stroke();
  }

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 72px "Trebuchet MS", "Lucida Sans", "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  letters.forEach((letter, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = col * cellW + cellW / 2;
    const cy = row * cellH + cellH / 2;

    ctx.save();
    ctx.translate(cx, cy);
    const angle = ((i * 17) % 7 - 3) * (Math.PI / 180);
    ctx.rotate(angle);
    ctx.fillText(letter, 0, 0);
    ctx.restore();
  });

  return canvas.toDataURL('image/png');
};
