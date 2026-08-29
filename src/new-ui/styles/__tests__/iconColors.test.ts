import fs from 'fs';
import path from 'path';

/**
 * Some SVGs carry a near-black fallback colour on their root (their original hardcoded
 * value, kept so call sites that pass nothing look unchanged in light mode). Those are
 * invisible on a dark background, so every call site must pass an explicit `color`.
 *
 * The matcher is DOTALL and non-greedy on purpose: these elements are usually multi-line and
 * often contain `=>` in an onPress, which a naive `[^<>]*` pattern silently skips — that is
 * how a black back-arrow survived an earlier sweep.
 */

const repoRoot = path.join(__dirname, '..', '..', '..', '..');

const DARK_FALLBACK_ICONS = [
  'ArrowLeft',
  'ArrowRight',
  'ChevronRight',
  'TransactionLimit',
  'MoreVertical',
  'DebitCard',
  'Settings',
  'Notification',
  'FilterIcon',
  'User',
  // Badge stripped out of the SVG (SettingsIconBadge draws it now), so the bare glyph
  // needs an explicit colour or it falls back to the old fixed brand green.
  'Privacy',
  'Agreement',
  'TermsAndConditions',
  'PrivacyPolicy',
];

/**
 * Same problem, different namespace: these live in src/constants/svgs and render as
 * <SvgIcons.X />. Call sites that legitimately sit on a fixed-white share card are
 * allowed to omit `color` and take the dark fallback, so they're listed as exceptions.
 */
const DARK_FALLBACK_SVG_ICONS = ['CopyOutlineBlack'];

/** Call sites that render on a hard-coded white surface, where the dark fallback is right. */
const ON_WHITE_CARD = [
  'src/components/common-components/ReceiveQRCard/ReceiveQRCard.tsx',
];

const sources = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      return e.name === 'node_modules' || e.name === '__tests__' ? [] : sources(full);
    }
    return e.name.endsWith('.tsx') ? [full] : [];
  });

/** Commented-out JSX never renders, so it is not a real call site. */
const isCommentedOut = (text: string, line: number): boolean =>
  (text.split('\n')[line - 1] ?? '').trim().startsWith('//');

describe('icons with a dark fallback colour', () => {
  it('the icons under test really do carry a dark fallback', () => {
    const svgDir = path.join(repoRoot, 'src/new-ui/assets/svgs');
    for (const icon of DARK_FALLBACK_ICONS) {
      const file = path.join(svgDir, `${icon}.svg`);
      if (!fs.existsSync(file)) continue;
      expect(fs.readFileSync(file, 'utf8')).toMatch(/currentColor/);
    }
  });

  it('every SvgIcons call site passes an explicit color', () => {
    const offenders: string[] = [];

    for (const file of sources(path.join(repoRoot, 'src'))) {
      const rel = path.relative(repoRoot, file);
      if (ON_WHITE_CARD.includes(rel)) continue;
      const text = fs.readFileSync(file, 'utf8');
      for (const icon of DARK_FALLBACK_SVG_ICONS) {
        const pattern = new RegExp(`<SvgIcons\\.${icon}\\b[\\s\\S]*?/>`, 'g');
        for (const m of text.matchAll(pattern)) {
          if (m[0].includes('color=')) continue;
          const line = text.slice(0, m.index ?? 0).split('\n').length;
          if (isCommentedOut(text, line)) continue;
          offenders.push(`${rel}:${line}  ${icon}`);
        }
      }
    }

    expect(offenders).toEqual([]);
  });

  it('every AppIcon call site passes an explicit color', () => {
    const offenders: string[] = [];

    for (const file of sources(path.join(repoRoot, 'src'))) {
      const text = fs.readFileSync(file, 'utf8');
      for (const icon of DARK_FALLBACK_ICONS) {
        const pattern = new RegExp(`<AppIcon\\.${icon}\\b[\\s\\S]*?/>`, 'g');
        for (const m of text.matchAll(pattern)) {
          if (m[0].includes('color=')) continue;
          const line = text.slice(0, m.index ?? 0).split('\n').length;
          if (isCommentedOut(text, line)) continue;
          offenders.push(`${path.relative(repoRoot, file)}:${line}  ${icon}`);
        }
      }
    }

    expect(offenders).toEqual([]);
  });
});
