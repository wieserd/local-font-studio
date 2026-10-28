import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

import { scanCodebase } from './scripts/scanCodebase.js';

function optimizeLucideImports(): Plugin {
  const iconMap: Record<string, string> = {};

  return {
    name: 'optimize-lucide-imports',
    enforce: 'pre',
    buildStart() {
      try {
        const lucidePkgPath = path.resolve('node_modules/lucide-react/dist/esm/lucide-react.js');
        if (fs.existsSync(lucidePkgPath)) {
          const content = fs.readFileSync(lucidePkgPath, 'utf8');
          for (const line of content.split('\n')) {
            const match = line.match(/from '\.\/icons\/([^']+)'/);
            if (!match) continue;
            const file = match[1];
            const aliasMatches = line.matchAll(/default as (\w+)/g);
            for (const a of aliasMatches) {
              iconMap[a[1]] = file;
            }
          }
        }
      } catch (e) {
        console.warn('Could not build Lucide icon map', e);
      }
    },
    transform(code, id) {
      if (!id.includes('/src/') || !code.includes('lucide-react')) return null;

      const importRegex = /import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"];?/g;
      if (!importRegex.test(code)) return null;

      return code.replace(importRegex, (_, importsStr) => {
        const specifiers = importsStr.split(',').map((s: string) => s.trim()).filter(Boolean);
        const replacements: string[] = [];

        for (const spec of specifiers) {
          const [orig, alias] = spec.split(/\s+as\s+/).map((s: string) => s.trim());
          const localName = alias || orig;
          const iconFile = iconMap[orig];

          if (iconFile) {
            replacements.push(`import ${localName} from 'lucide-react/dist/esm/icons/${iconFile}';`);
          } else {
            replacements.push(`import { ${spec} } from 'lucide-react';`);
          }
        }

        return replacements.join('\n');
      });
    }
  };
}

function developerTelemetryPlugin(): Plugin {
  let buildStartTime = 0;

  return {
    name: 'developer-telemetry',
    buildStart() {
      buildStartTime = performance.now();
    },
    closeBundle() {
      if (buildStartTime > 0) {
        const durationSec = Number(((performance.now() - buildStartTime) / 1000).toFixed(2));
        scanCodebase(durationSec);
      }
    },
    configureServer() {
      scanCodebase();
    }
  };
}

export default defineConfig({
  plugins: [
    developerTelemetryPlugin(),
    optimizeLucideImports(),
    react(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-font': ['opentype.js', 'jszip'],
        }
      }
    }
  },
  server: {
    port: 5173,
    host: '127.0.0.1'
  }
});
