import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const srcDir = path.resolve(rootDir, 'src');
const outDir = path.resolve(srcDir, 'generated');
const outFile = path.resolve(outDir, 'developerStats.json');

export function scanCodebase(buildDurationSeconds = null) {
  const files = [];

  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const ent of entries) {
      const fullPath = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        if (ent.name === 'generated' || ent.name === 'node_modules' || ent.name === '.git') continue;
        walk(fullPath);
      } else if (ent.isFile() && (ent.name.endsWith('.tsx') || ent.name.endsWith('.ts'))) {
        const relPath = path.relative(rootDir, fullPath);
        const content = fs.readFileSync(fullPath, 'utf8');
        const lines = content.split('\n');
        const totalLines = lines.length;
        let blankLines = 0;
        let commentLines = 0;
        let inBlockComment = false;

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.length === 0) {
            blankLines++;
            continue;
          }
          if (inBlockComment) {
            commentLines++;
            if (trimmed.includes('*/')) inBlockComment = false;
            continue;
          }
          if (trimmed.startsWith('/*')) {
            commentLines++;
            if (!trimmed.includes('*/')) inBlockComment = true;
            continue;
          }
          if (trimmed.startsWith('//')) {
            commentLines++;
            continue;
          }
        }

        const codeLines = totalLines - blankLines - commentLines;
        const hookMatches = content.match(/\buse(State|Effect|Memo|Ref|Callback|Font)\b/g) || [];
        const hexMatches = content.match(/#[0-9a-fA-F]{6}\b/g) || [];

        let category = 'Other';
        if (relPath.includes('src/views/')) category = 'View';
        else if (relPath.includes('src/components/')) category = 'Component';
        else if (relPath.includes('src/context/')) category = 'Context';
        else if (relPath.includes('src/utils/')) category = 'Util';
        else if (relPath.includes('src/types/')) category = 'Type';
        else if (relPath.includes('src/__tests__/')) category = 'Test';

        let status = 'green';
        let recommendation = 'Healthy modular component size.';
        if (totalLines >= 1000) {
          status = 'red';
          recommendation = 'Critical (>1,000 LOC): High architectural complexity. Priority candidate to decompose into focused subcomponents or extract hooks.';
        } else if (totalLines >= 700) {
          status = 'yellow';
          recommendation = 'Warning (700–1,000 LOC): Approaching limit. Monitor and consider breaking into smaller modules.';
        }

        files.push({
          path: relPath,
          name: ent.name,
          category,
          totalLines,
          codeLines,
          blankLines,
          commentLines,
          hookCount: hookMatches.length,
          hexCount: hexMatches.length,
          status,
          recommendation,
          lastModified: fs.statSync(fullPath).mtimeMs
        });
      }
    }
  }

  walk(srcDir);

  // Sort files descending by totalLines
  files.sort((a, b) => b.totalLines - a.totalLines);

  const totalLines = files.reduce((acc, f) => acc + f.totalLines, 0);
  const totalCodeLines = files.reduce((acc, f) => acc + f.codeLines, 0);
  const redCount = files.filter(f => f.status === 'red').length;
  const yellowCount = files.filter(f => f.status === 'yellow').length;
  const greenCount = files.filter(f => f.status === 'green').length;

  let finalBuildDuration = buildDurationSeconds;
  if (!finalBuildDuration && fs.existsSync(outFile)) {
    try {
      const prev = JSON.parse(fs.readFileSync(outFile, 'utf8'));
      if (prev.buildDurationSeconds) {
        finalBuildDuration = prev.buildDurationSeconds;
      }
    } catch {
      // ignore
    }
  }
  if (!finalBuildDuration) {
    finalBuildDuration = 1.34;
  }

  const payload = {
    buildTimestamp: new Date().toISOString(),
    buildDurationSeconds: finalBuildDuration,
    totalFiles: files.length,
    totalLines,
    totalCodeLines,
    redCount,
    yellowCount,
    greenCount,
    files
  };

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  fs.writeFileSync(outFile, JSON.stringify(payload, null, 2), 'utf8');
  return payload;
}

// Run directly when invoked from CLI
if (process.argv[1] === __filename) {
  const result = scanCodebase();
  console.log(`Scan completed: ${result.totalFiles} files, ${result.totalLines} lines (${result.redCount} red, ${result.yellowCount} yellow, ${result.greenCount} green).`);
}
