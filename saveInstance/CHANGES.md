# Save Instance 2.1.0: what changed

## In-widget help guide
- A **Help** button (question icon) at the top right of the widget opens a short,
  searchable, plain-language guide: nine sections, one open at a time, with a
  search box that filters lines and highlights the match.
- A **first-run hint** sits above the name box until it is dismissed once.
  The dismissal is stored per browser and per widget under
  `saveInstance.helpHintDismissed.<widgetId>`, and opening the guide dismisses it.
- Every line is gated on the same config checks the UI itself uses, so the guide
  never describes a capture option, a limit or a startup view the app has off.
- Files follow the shared pattern: `src/runtime/theme.ts` and
  `src/runtime/components/HelpPopup.tsx` are byte copies of the reference widget,
  `src/runtime/helpSections.ts` is the only content file, and all strings live in
  `src/runtime/translations/default.ts` under `help*` and `firstRun*` keys.
- The action-reference toggle above the saved list moved from the `question` icon
  to `list`, so `question` means Help and nothing else.
- `Name (A–Z)` / `Name (Z–A)` in the sort list now use a plain hyphen, so the
  guide can quote the control names without an en dash.

## Experience Builder 1.21 / Visual Studio
- Maps SDK imports moved from `@arcgis/core/*` to EB's `esri/*` alias. The
  webpack build is unchanged (EB aliases `esri/` to `@arcgis/core`), but
  `@arcgis/core` is a real installed package that Visual Studio reads through the
  pnpm junction, which produced `IDE1100` and `TS2306 is not a module` on all six
  imports.
- `ImmutableObject` now comes from `jimu-core` rather than `seamless-immutable`,
  for the same reason (`TS2614` against `@types/seamless-immutable`).
- `AllWidgetSettingProps` from `jimu-for-builder` replaced with a local
  structural type: the shared editor shim declares that module in shorthand, and
  a shorthand module cannot be used as a type (`TS2709`).
- Added a widget-level `tsconfig.json` (mode B, self-contained),
  `src/exb-editor-shims.d.ts` (byte copy of the `widgets\_vs` master) and
  `src/vendor-shims.d.ts` (declares the `calcite-components` alias the help guide
  imports). `npx tsc -p .` reports 0 errors.
- `saveInstance` added to the `exclude` list in
  `your-extensions\widgets\tsconfig.json` so the folder catch-all stops
  type-checking it twice.
- `manifest.json` `exbVersion` corrected from `1.17.0` to `1.21.0`.

---

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
