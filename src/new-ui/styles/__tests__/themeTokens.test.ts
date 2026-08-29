import fs from 'fs';
import path from 'path';

/**
 * Validates every `theme.<group>.<key>` read against the real token objects.
 *
 * TypeScript does not catch these: styles factories are routinely typed `(theme: any)`, so
 * a legacy-shaped read like `theme.spacing.spacing[2]` compiles fine and then throws
 * "Cannot convert undefined value to object" at render. That shipped twice.
 */

const repoRoot = path.join(__dirname, '..', '..', '..', '..');
const read = (p: string) => fs.readFileSync(path.join(repoRoot, p), 'utf8');

const keysOf = (src: string, indent: number) =>
  new Set(
    [...src.matchAll(new RegExp(`^\\s{${indent}}'?([A-Za-z0-9]+)'?:`, 'gm'))].map(
      (m) => m[1]
    )
  );

const VALID: Record<string, Set<string>> = {
  colors: keysOf(read('src/new-ui/styles/themes/themeTypes.ts'), 4),
  spacing: keysOf(read('src/new-ui/styles/theme/spacing.ts'), 2),
  radius: keysOf(read('src/new-ui/styles/theme/radius.ts'), 2),
  shadows: new Set(['sm', 'md', 'lg']),
  typography: new Set(['fontFamily', 'fontSize', 'lineHeight', 'fontWeight']),
};

const sources = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      return e.name === '__tests__' || e.name === 'node_modules' ? [] : sources(full);
    }
    return /\.tsx?$/.test(e.name) ? [full] : [];
  });

describe('new-ui theme token reads', () => {
  it('every theme.<group>.<key> resolves to a real token', () => {
    const offenders: string[] = [];

    for (const file of sources(path.join(repoRoot, 'src'))) {
      if (file.includes(`${path.sep}styles${path.sep}theme`)) continue;
      const text = fs.readFileSync(file, 'utf8');
      if (!/from ['\"]@?new-ui\/styles\/ThemeContext/.test(text)) continue;

      // A file may hold both themes; a bare `theme` is only ours when it doesn't also
      // import the legacy context.
      const alsoLegacy = /import \{[^}]*\buseTheme\b[^}]*\} from ["'](\.\.\/)*styles/.test(
        text
      );
      const names = ['ui', 'newTheme', 'newUITheme', ...(alsoLegacy ? [] : ['theme'])];
      const pattern = new RegExp(
        `\\b(?:${names.join('|')})\\.([A-Za-z0-9_]+)(?:\\.([A-Za-z0-9_]+)|\\['([^']+)'\\])?`,
        'g'
      );

      text.split('\n').forEach((line, i) => {
        if (line.trim().startsWith('//')) return;
        for (const m of line.matchAll(pattern)) {
          const group = m[1];
          const key = m[2] ?? m[3];
          if (group === 'isDark' || group === 'mode') continue;
          const known = VALID[group];
          if (!known) {
            offenders.push(
              `${path.relative(repoRoot, file)}:${i + 1}  theme.${group} is not a theme group`
            );
          } else if (key && !known.has(key) && !new RegExp(`${group}\\[[A-Za-z_]`).test(line)) {
            offenders.push(
              `${path.relative(repoRoot, file)}:${i + 1}  theme.${group}.${key} is not a valid key`
            );
          }
        }
      });
    }

    expect(offenders).toEqual([]);
  });
});
