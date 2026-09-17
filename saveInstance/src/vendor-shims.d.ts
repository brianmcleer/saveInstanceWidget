// Widget-level type shims for packages this widget imports that the shared
// master shim (src/exb-editor-shims.d.ts, copied verbatim from widgets\_vs and
// never edited per widget) does not declare. Mode B, WIDGETHANDOFF Section 12
// item 3. Visual Studio only: webpack ignores these files and types against the
// real packages. Members are `any` on purpose, so the Error List stays empty
// under the EB 1.21 pnpm layout without pretending to replace the real types.

// Needed by the help guide (Section 10), which imports CalciteIcon. The master
// shim declares jimu-ui and jimu-ui/* but not the bare calcite-components alias
// that Experience Builder externalizes.
declare module 'calcite-components' {
  export const CalciteIcon: any
  export const CalciteChip: any
  export const CalciteButton: any
  export const CalciteLoader: any
  const _default: any
  export default _default
}

// The ArcGIS Maps SDK modules this widget uses are covered by the master shim's
// `declare module 'esri/*'` wildcard, which exports a default `any`. That serves
// both `new TimeExtent(...)` and `Extent.fromJSON(...)`, so no per-module class
// declarations are needed here. Import through the `esri/*` alias, never
// `@arcgis/core/*`: the latter is a real installed package, so Visual Studio
// reads it through the pnpm junction and reports IDE1100.
