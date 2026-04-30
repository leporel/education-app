---
name: theme-colors
description: Quick reference for changing colors in the Education app.
---

# Skill: Theme Colors

Quick reference for changing colors in the Education app. Three layers must stay in sync.

---

## Architecture (3 layers)

```
palette.ts          ← single source of truth (TypeScript objects)
    ↓
App.vue <style>     ← CSS custom properties (mirror palette.ts exactly)
    ↓
stores/theme.ts     ← Naive UI JS overrides (built from palette at module load)
```

**Rule:** always start with `palette.ts`, then mirror the value in the other two layers.

---

## Layer 1 — `src/theme/palette.ts`

Two exported objects (`dark`, `light`) implement the `Palette` interface. Add a new color → add it to the interface first, then to both objects.

### Palette keys and their semantic roles

| Key | Dark | Light | Used for |
|-----|------|-------|----------|
| `bg` | `#1a1e25` | `#ebe9e5` | App shell background, body, gaps between panels |
| `panel` | `#1b2026` | `#e3e0db` | Sidebar, TopNav chrome |
| `surface` | `#21262d` | `#e3e0db` | Cards, modals, note edit/preview area, NInput |
| `surfaceAlt` | `#1b1f26` | `#e8e6e2` | File tree panel |
| `border` | `#252a32` | `#dbd7cf` | Structural dividers (panel edges, sidebar lines) |
| `borderCard` | `#414751` | `#b0aba1` | NCard borders, content surface borders |
| `divider` | `#1f2329` | `#e0dcd4` | NDivider, subtle separators |
| `hover` | `rgba(255,255,255,0.05)` | `rgba(0,0,0,0.04)` | Hover state overlays |
| `text` | `#dde2ea` | `#000000` | Primary text |
| `text2` | `#abb1bb` | `#3d3d44` | Secondary text (Naive UI `textColor2`) |
| `text3` | `#7a818c` | `#6b6b72` | Muted labels (`--app-muted`) |
| `textMuted` | `#5a606b` | `#8e8b84` | Timestamps, IDs (`--app-text-mute2`) |
| `primary` | `#2563b8` | `#3d6e9c` | Accent / brand color |
| `primaryHover` | `#3b79ce` | `#4d80b0` | Primary on hover |
| `primaryPressed` | `#0f4da2` | `#2c5582` | Primary on press |
| `primarySoft` | `rgba(37,99,184,0.22)` | `rgba(61,110,156,0.14)` | Tinted badge / button bg |
| `success` | `#6dba8a` | `#5a8a4d` | Success text / known-status tags |
| `successSoft` | `#23392f` | `rgba(90,138,77,0.14)` | Known-status tag bg (solid in dark) |
| `warning` | `#d8b462` | `#b8873a` | Warning text / learning-status |
| `warningSoft` | `rgba(216,180,98,0.18)` | `rgba(184,135,58,0.14)` | Learning-status bg |
| `info` | `#5b9bd5` | `#3d6e9c` | Info / type-badge text |
| `infoSoft` | `#1b2e4a` | `rgba(61,110,156,0.14)` | Type-badge bg (solid in dark) |
| `error` | `#d48787` | `#b85c5c` | Error state |
| `scrollThumb` | `rgba(221,226,234,0.22)` | `rgba(42,42,46,0.22)` | Scrollbar thumb |

---

## Layer 2 — `src/App.vue` `<style>` (global, not scoped)

CSS custom properties under `.theme-dark { }` and `.theme-light { }`. These must mirror `palette.ts` exactly.

### CSS var → palette key mapping

| CSS var | Palette key |
|---------|-------------|
| `--app-bg` | `bg` |
| `--app-sidebar` | `panel` |
| `--app-surface` | `surface` |
| `--app-tree` | `surfaceAlt` |
| `--app-border` | `border` |
| `--app-divider` | `divider` |
| `--app-text` | `text` |
| `--app-text-2` | `text2` |
| `--app-muted` | `text3` |
| `--app-text-mute2` | `textMuted` |
| `--app-primary` | `primary` |
| `--app-primary-soft` | `primarySoft` |
| `--app-success` / `--app-success-soft` | `success` / `successSoft` |
| `--app-warning` / `--app-warning-soft` | `warning` / `warningSoft` |
| `--app-info` / `--app-info-soft` | `info` / `infoSoft` |
| `--app-error` | `error` |
| `--app-hover` | `hover` |
| `--app-scroll-thumb` | `scrollThumb` |
| `--md-link` | `primary` (duplicated) |
| `--md-link-hover` | `primaryHover` (duplicated) |
| `--md-border` | standalone — `#414751` dark / `#b0aba1` light |

`--md-border` is used for Markdown table `th`/`td` borders (in `MdRender.vue`) and is intentionally more visible than `--app-border`.

Also update `:root { --app-bg }` (fallback for pre-hydration).

---

## Layer 3 — `src/stores/theme.ts`

`buildOverrides(p: Palette): GlobalThemeOverrides` is called once at module load. It feeds Naive UI's JS theming. Key mappings:

| Override | Source |
|----------|--------|
| `common.bodyColor` | `p.bg` |
| `common.cardColor` | `p.surface` |
| `common.textColorBase` / `textColor1` | `p.text` |
| `common.borderColor` | `p.border` |
| `common.primaryColor` | `p.primary` |
| `Card.borderColor` | `p.borderCard` |
| `Card.color` | `p.surface` |
| `Drawer.color` | `p.panel` |
| `Input.color` | `p.surface` |
| `Button.colorSecondary` | `p.primarySoft` |
| `Tabs.barColor` | `p.primary` |

`buildOverrides` is module-level; after changing palette values, a **full page reload** is needed in dev to recompute the constants.

---

## Teleport / CSS variable scope

Naive UI teleports Drawers, Modals, Tooltips to `document.body`. The theme class is synced to `<html>` via `watchEffect` in `useTheme`, so CSS vars from `.theme-dark { }` cascade into all teleported elements.

```typescript
// stores/theme.ts — already in place
watchEffect(() => {
  const { classList } = document.documentElement
  classList.remove('theme-dark', 'theme-light')
  classList.add(`theme-${mode.value}`)
})
```

---

## Overriding Naive UI inline CSS vars

Some Naive UI components set CSS vars as inline styles (e.g., `--n-color` on `<n-tag>`). These **cannot** be changed through `buildOverrides` — Naive UI ignores unknown/unsupported keys silently.

Use a direct `background-color` override with `!important` in App.vue's global `<style>`:

```css
/* NTag background — bypasses --n-color entirely */
.n-tag { background-color: var(--app-bg) !important; }
```

Or target per-theme if the color differs between modes:

```css
html.theme-dark  .n-tag { background-color: #353533 !important; }
html.theme-light .n-tag { background-color: #d8d5cf !important; }
```

Use `html.theme-dark` (not `.theme-dark`) to match the `<html>` element where the class is applied.

---

## Checklist when adding a new color

1. Add key to `Palette` interface in `palette.ts`
2. Add value to `dark` object
3. Add value to `light` object
4. Add `--app-<name>` to `.theme-dark { }` and `.theme-light { }` in `App.vue`
5. Update `:root { }` if it's a background used before theme load
6. If used by a Naive UI component override, add to `buildOverrides` in `theme.ts`
7. Hard-reload dev server after `theme.ts` changes (module-level constants)
