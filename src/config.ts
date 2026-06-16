import { type ImmutableObject } from 'seamless-immutable'

export interface Config {
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
