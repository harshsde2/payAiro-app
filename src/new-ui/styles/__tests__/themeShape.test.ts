import fs from 'fs';
import path from 'path';

/**
 * new-ui owns its own theme, whose shape differs from the legacy `src/styles` one
 * (flat `colors.text` vs nested `colors.text.primary`, flat `spacing.sm` vs
 * `spacing.spacing[2]`, no `colors.palette`). Mixing them does not fail typecheck when a
 * styles factory is typed `any` — it throws at runtime instead, which is how a bottom
 * sheet shipped a "Cannot convert undefined value to object" crash. These tests fail loudly
 * instead.
 */

const NEW_UI = path.join(__dirname, '..', '..');

const sourceFiles = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return entry.name === '__tests__' ? [] : sourceFiles(full);
    }
    return /\.tsx?$/.test(entry.name) ? [full] : [];
  });

const files = sourceFiles(NEW_UI).filter(
  // The token definitions themselves are the source of truth, not consumers.
  (f) => !f.includes(`${path.sep}styles${path.sep}theme${path.sep}`)
);

const scan = (pattern: RegExp) =>
  files.flatMap((file) =>
    fs
      .readFileSync(file, 'utf8')
      .split('\n')
      .map((line, i) => ({ line: line.trim(), no: i + 1 }))
      .filter(({ line }) => !line.startsWith('//') && pattern.test(line))
      .map(({ line, no }) => `${path.relative(NEW_UI, file)}:${no}  ${line}`)
  );

describe('new-ui theme shape', () => {
  it('scans a non-trivial number of files', () => {
    expect(files.length).toBeGreaterThan(100);
  });

  it('never reads the legacy nested spacing scale', () => {
    expect(scan(/\.spacing\.spacing\b/)).toEqual([]);
  });

  it('never reads the legacy colour palette', () => {
    expect(scan(/\.colors\.palette\b/)).toEqual([]);
  });

  it('never reads legacy nested colour groups', () => {
    expect(
      scan(/\.colors\.(text|border|card|background|button|shadow|kycStatus\w*)\.[a-z]/)
    ).toEqual([]);
  });

  it('never imports the legacy theme layer', () => {
    expect(scan(/from ['"]styles(\/|['"])/)).toEqual([]);
  });
});

/**
 * These live outside new-ui but are mounted in App.js for the whole session, so they render
 * over every screen. A hardcoded light background here flashes white over a dark app —
 * which is exactly what shipped on the lock screen before this test existed.
 */
describe('always-mounted overlays follow the theme', () => {
  const OVERLAYS = [
    'src/components/common-components/AppLockScreen.tsx',
    'src/components/common-components/AppGateOverlay.tsx',
    'src/components/common-components/Toast.tsx',
    'src/components/common-components/ForceUpdateModal/ForceUpdateModal.tsx',
    'src/tsx-components/BootHydrationOverlay.tsx',
  ];
  const repoRoot = path.join(__dirname, '..', '..', '..', '..');

  it.each(OVERLAYS)('%s reads the new-ui theme', (rel) => {
    const src = fs.readFileSync(path.join(repoRoot, rel), 'utf8');
    expect(src).toMatch(/@new-ui\/styles\/ThemeContext/);
  });

  it.each(OVERLAYS)('%s has no hardcoded light background', (rel) => {
    const offenders = fs
      .readFileSync(path.join(repoRoot, rel), 'utf8')
      .split('\n')
      .map((line, i) => ({ line: line.trim(), no: i + 1 }))
      .filter(
        ({ line }) =>
          !line.startsWith('//') &&
          /backgroundColor:\s*['"](#[Ff]{3}|#[Ff]{6}|white)['"]/.test(line)
      )
      .map(({ line, no }) => `${rel}:${no}  ${line}`);
    expect(offenders).toEqual([]);
  });
});


/**
 * `colors.white` / `colors.black` are FIXED literals — they do not flip between themes. A
 * card written as `backgroundColor: theme.colors.white` stays white in dark mode even
 * though the file "uses the theme", which is how a black section title shipped on a dark
 * dashboard. This covers every consumer of the new-ui theme, inside new-ui or not.
 *
 * Genuinely fixed colours are still allowed — mark them with a "Fixed, not themed" or
 * "Intentionally fixed" comment on the line above, saying why.
 */
describe('no fixed white/black in theme-aware code', () => {
  const repoRoot = path.join(__dirname, '..', '..', '..', '..');

  const allSources = (dir: string): string[] =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return entry.name === '__tests__' || entry.name === 'node_modules'
          ? []
          : allSources(full);
      }
      return /\.tsx?$/.test(entry.name) ? [full] : [];
    });

  it('every file consuming the new-ui theme avoids colors.white / colors.black', () => {
    const offenders: string[] = [];

    for (const file of allSources(path.join(repoRoot, 'src'))) {
      if (file.includes(`${path.sep}styles${path.sep}theme`)) continue;
      const text = fs.readFileSync(file, 'utf8');
      if (!/from ['\"]@?new-ui\/styles\/ThemeContext/.test(text)) continue;

      const lines = text.split('\n');
      lines.forEach((line, i) => {
        if (!/\.colors\.(white|black)\b/.test(line)) return;
        // Look back a couple of lines: the marker may sit above a `return (`.
        const prev = lines.slice(Math.max(0, i - 3), i + 1).join('\n');
        if (/Fixed, not themed|Intentionally fixed/.test(prev)) return;
        offenders.push(
          `${path.relative(repoRoot, file)}:${i + 1}  ${line.trim()}`
        );
      });
    }

    expect(offenders).toEqual([]);
  });
});


/**
 * Elevation ladder: page `background` < floating `surface` (modal card / bottom sheet) <
 * `surfaceElevated` (rows inside one).
 *
 * A modal card painted with `colors.background` is the same colour as the page behind it.
 * Light mode hides this completely (both are white), but in dark mode it is black-on-black
 * with no visible edge — which is how several modals shipped looking like floating text.
 */
describe('modal surfaces sit above the page', () => {
  const FLOATING = /^\s*(modalCard|modalSheet|modalContent|successModalCard|pickerCard|sheet)\s*:\s*\{/;

  it('no floating surface is painted with colors.background', () => {
    const offenders: string[] = [];

    for (const file of files) {
      const lines = fs.readFileSync(file, 'utf8').split('\n');
      let inside = false;
      lines.forEach((line, i) => {
        if (FLOATING.test(line)) inside = true;
        else if (inside && line.trim().startsWith('},')) inside = false;
        else if (inside && /backgroundColor:\s*theme\.colors\.background\b/.test(line)) {
          offenders.push(`${path.relative(NEW_UI, file)}:${i + 1}  ${line.trim()}`);
        }
      });
    }

    expect(offenders).toEqual([]);
  });
});
