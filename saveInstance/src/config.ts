// Imported from jimu-core, not 'seamless-immutable': the latter resolves to the
// real @types/seamless-immutable through the EB 1.21 pnpm junction, which
// Visual Studio cannot read (IDE1100 / TS2614). jimu-core re-exports the same
// type and has no resolvable package under the widget folder, so the editor
// shim answers it. See WIDGETHANDOFF Section 12, item 3.
import { type ImmutableObject } from 'jimu-core'

export interface Config {
  /** Show the question-mark button that opens the help guide. Undefined means on,
   *  so apps configured before this setting existed keep their help button. */
  showHelp?: boolean
  /** Save the current viewpoint (center, scale, rotation, and 3D camera). */
  captureViewpoint: boolean
  /** Save each layer's visibility and opacity. */
  captureLayers: boolean
  /** Save feature-layer definition expressions and label visibility. */
  captureFilters: boolean
  /** Save the active basemap. */
  captureBasemap: boolean
  /** Save the map's time extent (time slider position). */
  captureTime: boolean
  /** Save view graphics (including Draw/Sketch graphics). */
  captureGraphics: boolean
  /** Maximum number of stored instances. 0 means unlimited. */
  maxInstances: number
  /** Name of an instance to load automatically when the app opens. Empty means none. */
  defaultInstanceName: string
}

export type IMConfig = ImmutableObject<Config>
