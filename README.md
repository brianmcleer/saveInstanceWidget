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
- WCAG 2.1 AA: themed (light and dark), keyboard operable, screen-reader labeled,
  accessible dialogs and status messages. See `CHANGES.md`.

## Requirements

- ArcGIS Experience Builder Developer Edition 1.19 or 1.20 (React 19).
- EB 1.18 and earlier (React 18) are not supported.

## Install

1. Copy the `saveInstance` folder into your Experience Builder install at:
   `client/your-extensions/widgets/saveInstance/`
   `manifest.json` must sit directly inside `your-extensions/widgets/saveInstance/`.
   Do not nest it a second level deep (for example
   `widgets/saveInstance/saveInstance/`). Nesting is the most common reason a
   widget does not register.
2. From the `client` folder, run `npm install`. Experience Builder installs this
   widget's dependencies automatically from its `package.json`, so there are no
   per-dependency commands to run.
3. Restart the EB client (`npm start`), then add the widget in the builder and
   select a map in the widget settings.

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
