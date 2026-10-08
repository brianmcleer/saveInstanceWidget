# Save Instance 2.0.0: what changed

Storage is still **local only** (browser `localStorage`). Everything else from the
review was implemented, and the UI was rebuilt against jimu-ui's themed,
accessible components to meet **WCAG 2.1 AA**.

## Accessibility (WCAG 2.1 AA)
- **Color & contrast**: dropped the hardcoded `blue19` ramp (several values, e.g.
  `#007cd3` white text ≈ 3.9:1, failed AA) in favor of EXB theme tokens via CSS
  variables (`--sys-color-primary-main` / `--sys-color-primary-text`), which EXB
  pairs for AA. Light-mode fallbacks are included, and the widget now adapts to
  dark themes.
- **Names for icon controls**: every icon button has a translated `aria-label`
  (e.g. *"Load 'Downtown' onto the map"*); the icon itself is `aria-hidden`. No
  reliance on `title` alone.
- **Forms**: inputs are associated with real `<Label for>` elements and
  `aria-describedby` hints.
- **Tables**: proper `<caption>`, `<thead>`, `<th scope="col">` and
  `<th scope="row">` so screen readers announce row/column context. The legend
  `<tr>`-directly-in-`<table>` markup was fixed.
- **Dialogs**: `window.alert/confirm/prompt` replaced with jimu `Modal`
  (focus trap, `aria-modal`, labeled by title, **Escape/backdrop close**).
- **Status**: saves, loads, errors announce through a jimu `Alert` live region.
- **Keyboard & focus**: all controls are jimu-ui components with visible focus
  rings; the hidden file input is triggered from a real button.
- **Empty/error copy**: explicit empty state and actionable error messages
  (active voice, plain language).

## New / expanded captured state
- **Viewpoint** (center, scale, **rotation**, and 3D **camera**): works in
  `SceneView`, not just 2D. Extent is still saved for backward compatibility.
- **Definition expressions** and **label visibility** for feature layers.
- **Time extent** (time-slider position): optional, off by default.
- Existing extent / layer visibility & opacity / basemap / graphics retained.
- The **Draw/Sketch** (`jimu-draw`) graphics path is kept and guarded by config.

## Robustness / bug fixes
- **Unicode-safe base64** (`TextEncoder`/`TextDecoder`): names/attributes with
  emoji or accents no longer throw on save, download, or import.
- **localStorage quota** is caught and surfaced instead of failing silently.
- **Schema versioning** (`schemaVersion`, `createdAt`) with a migration that
  upgrades older instances and legacy `.txt` files on read.
- **Upload validation**: structure is checked before anything is applied.
- **Immutable rename**: no more direct mutation of objects in state.
- **Async load**: `goTo` is awaited and benign `AbortError`s are ignored; a
  mismatched `webmapId` now warns the user.
- Removed dead code, the duplicate `graphics` assignment, and aligned the version
  comment with the manifest.

## UX additions
- Filter box and sort control (newest/oldest/name) for the saved list.
- Saved date shown per instance; Save button is genuinely `disabled` until valid.
- Toast-style confirmation after save/load/rename/delete/import.

## Settings panel
- Removed the unused data-source code.
- Added: per-element capture toggles, a max-instances limit, and an optional
  "load this instance on startup" name.

## Localization
- All UI strings moved to `src/runtime/translations/default.ts` and
  `src/setting/translations/default.ts` and rendered via `hooks.useTranslation`,
  so the widget can be translated (currently `en`).

---

### Build note
These are **source** files for ArcGIS Experience Builder. They can't be compiled
outside an EXB workspace (the `jimu-*` / `@arcgis/core` packages live there), so
they haven't been type-checked against the SDK here: only verified to parse.
Drop the `saveInstance` folder into your EXB `client/your-extensions/widgets/`
directory and run the normal EXB build. The CSS-variable fallbacks mean it also
renders sensibly if a token is missing.
