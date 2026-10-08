# Save Instance (accessible build)

Save, load and share the current state of an ArcGIS Experience Builder web map:
viewpoint (center, scale, rotation and 3D camera), layer visibility and opacity,
feature-layer definition expressions and labels, basemap, time extent, and
graphics. Saved instances are stored locally in the browser. Instances can be
downloaded to a `.txt` file and imported on another machine.

## Credit and provenance

This is a modified version of the **Save Instance Widget by Sven Jensen**.
Original project: https://github.com/svenweb/saveInstanceWidget (MIT). All credit
for the original widget goes to Sven (https://jensengis.com).

This build, by Brian McLeer (City of Grand Junction, CO), adds an accessibility
rewrite to WCAG 2.1 AA, fixes the toolbar icon scaling, and broadens the captured
map state. It remains MIT licensed and retains Sven's copyright. See `CHANGES.md`
for the full list and `LICENSE` for terms.

## Features

- Save and restore viewpoint, layers, definition expressions and labels, basemap,
  time extent, and graphics (including Esri Draw/Sketch graphics).
- Rename, delete, and clear-graphics actions per instance.
- Filter and sort the saved list; optional startup instance.
- Download a single instance or all instances; import from `.txt`.
- Built-in **Help** guide: a question button at the top right opens a short,
  searchable, plain-language guide that adapts to the options you have enabled.
  A one-time hint points new users at it.
- WCAG 2.1 AA: themed (light and dark), keyboard operable, screen-reader labeled,
  accessible dialogs and status messages. See `CHANGES.md`.

## Requirements

- ArcGIS Experience Builder Developer Edition 1.19 through 1.21 (React 19).
  Built and tested on 1.21.
- EB 1.18 and earlier (React 18) are not supported.

## Install

1. Copy the `saveInstance` folder into your Experience Builder install at:
   `client/your-extensions/widgets/saveInstance/`
   `manifest.json` must sit directly inside `your-extensions/widgets/saveInstance/`.
   Do not nest it a second level deep (for example
   `widgets/saveInstance/saveInstance/`). Nesting is the most common reason a
   widget does not register.
2. From the `client` folder, run `npm install` (Experience Builder 1.20 and
   earlier) or `pnpm install` (1.21 and later). Experience Builder installs this
   widget's dependencies automatically from its `package.json`, so there are no
   per-dependency commands to run.
3. Restart the EB client (`npm start`, or `pnpm start` on 1.21 and later), then
   add the widget in the builder and select a map in the widget settings.

### The release zip and the editor shims

The zip is the widget only. The Visual Studio type shims in the repo (`saveInstance/src/exb-editor-shims.d.ts`, `saveInstance/src/vendor-shims.d.ts`) are left out on purpose: their ambient `declare module` blocks are not file-scoped and would rewrite the react, jimu and esri types for every other widget in your `your-extensions` folder.

If you clone the repository instead of using the zip, delete `saveInstance/src/exb-editor-shims.d.ts` and the other shim files listed above before building; nothing else depends on them.

## Usage telemetry

This widget records anonymous usage counts and errors so the GIS Division can see which widgets and versions are in use and which errors users hit. It records the app id and title, widget name and version, the action name, a truncated error message, the site host name and browser family. It never records usernames, coordinates, addresses, attribute values or URLs with query strings. Where the data goes: on page load the widget asks the app's portal for a public item tagged `exb-beacon-sink` and posts to that table. If your portal has no such item, nothing is sent anywhere. To turn it off for an app, set `"telemetry": false` in the widget's config, or users can enable Do Not Track in their browser. The shared module is `src/shared/beacon.ts`.

## Troubleshooting: "saveInstance is duplicated"

This means the widget name is registered more than once. A single, correctly
placed copy cannot duplicate itself, so a second copy exists somewhere. Check, in
order: a nested folder (`widgets/saveInstance/saveInstance/`); a leftover or
renamed copy (including any `-copy` folder); or a stale compiled build under
`client/dist/widgets`. Stop the client, remove the extra copy or clear the matching
`dist/widgets` folder, then start again. If removing one copy makes the widget
disappear from the Entrypoint list, the remaining copy is nested too deep; move it
so `manifest.json` sits directly inside the widget folder.

## Feedback

- Issues specific to this accessible build:
  https://github.com/brianmcleer/save-instance-widget/issues
- The original widget, its roadmap, and the author's other tools:
  https://github.com/svenweb/saveInstanceWidget and
  https://community.esri.com/t5/arcgis-experience-builder-ideas/save-instance-widget/idi-p/1610260

## License

MIT. Copyright (c) 2025 Sven Jensen. Modifications copyright (c) 2025 City of
Grand Junction, CO. The original copyright notice and MIT permission text are
retained in `LICENSE`.
