/** @jsx jsx */
import {
  React,
  jsx,
  css,
  hooks,
  type AllWidgetProps
} from 'jimu-core'
import { type IMConfig } from '../config'
import { JimuMapView, JimuMapViewComponent } from 'jimu-arcgis'
import {
  Button,
  TextInput,
  Label,
  Loading,
  LoadingType,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Alert,
  Tooltip,
  Select,
  Option
} from 'jimu-ui'
import Extent from '@arcgis/core/geometry/Extent.js'
import Viewpoint from '@arcgis/core/Viewpoint.js'
import Graphic from '@arcgis/core/Graphic.js'
import Basemap from '@arcgis/core/Basemap.js'
import TimeExtent from '@arcgis/core/time/TimeExtent.js'
import Collection from '@arcgis/core/core/Collection.js'
import defaultMessages from './translations/default'

/**
 * Save Instance, rebuilt for accessibility (WCAG 2.1 AA) and a wider set of
 * captured map state. Instances are stored in the browser's localStorage.
 *
 * @author Sven Jensen, 2025
 * @version 2.0.0
 */

const STORAGE_KEY = 'saveInstanceWidgetInstances'
const SCHEMA_VERSION = 2
const DRAW_GROUP_LAYER_ID = 'jimu-draw'

// Calcite web component, registered globally by Experience Builder. Typed as a
// dynamic tag so it is valid JSX under the emotion (jimu-core) jsx pragma.
const CalciteIcon: any = 'calcite-icon'

type SortKey = 'name-asc' | 'name-desc' | 'date-desc' | 'date-asc'
type StatusKind = 'success' | 'warning' | 'error'

interface StatusMessage { kind: StatusKind, text: string }

type ActiveModal =
  | { kind: 'rename', name: string, value: string }
  | { kind: 'delete', name: string }
  | { kind: 'replace', dupes: string[], incoming: any[] }
  | null

// -------------------------------------------------------------------------
// Unicode-safe base64 (btoa/atob only handle Latin-1 and throw on emoji etc.)
// -------------------------------------------------------------------------
function toBase64 (str: string): string {
  const bytes = new TextEncoder().encode(str)
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk) as unknown as number[])
  }
  return btoa(binary)
}

function fromBase64 (b64: string): string {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  try {
    // v2 writes UTF-8; this also decodes plain-ASCII v1 data correctly.
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch (e) {
    // v1 used btoa() directly (Latin-1). Fall back to the raw byte string,
    // which is exactly what v1's atob() produced.
    return binary
  }
}

function storageAvailable (): boolean {
  try {
    const x = '__si_test__'
    window.localStorage.setItem(x, x)
    window.localStorage.removeItem(x)
    return true
  } catch (e) {
    return false
  }
}

/** Normalize/upgrade an instance object to the current schema. */
function migrateInstance (raw: any): any {
  if (!raw || typeof raw !== 'object' || typeof raw.name !== 'string') return null
  // v1 did not tag top-level view graphics with the instance name, so clear and
  // dedupe by instance would miss them. Backfill the attribute on migration.
  const graphics = (Array.isArray(raw.graphics) ? raw.graphics : []).map((g: any) =>
    (g && typeof g === 'object')
      ? { ...g, attributes: { ...(g.attributes || {}), instance: g?.attributes?.instance ?? raw.name } }
      : g)
  return {
    schemaVersion: SCHEMA_VERSION,
    name: raw.name,
    createdAt: raw.createdAt || new Date().toISOString(),
    webmapId: raw.webmapId ?? null,
    viewpoint: raw.viewpoint ?? null,
    extent: raw.extent ?? null,
    timeExtent: raw.timeExtent ?? null,
    basemap: raw.basemap ?? null,
    layers: Array.isArray(raw.layers) ? raw.layers : [],
    graphics
  }
}

const Widget = (props: AllWidgetProps<IMConfig>): React.ReactElement => {
  const translate = hooks.useTranslation(defaultMessages)
  const config = props.config

  const [jimuMapView, setJimuMapView] = React.useState<JimuMapView>(null)
  const [savedInstances, setSavedInstances] = React.useState<any[]>([])
  const [nameInput, setNameInput] = React.useState('')
  const [search, setSearch] = React.useState('')
  const [sort, setSort] = React.useState<SortKey>('date-desc')
  const [loadingName, setLoadingName] = React.useState<string | null>(null)
  const [showLegend, setShowLegend] = React.useState(false)
  const [status, setStatus] = React.useState<StatusMessage>(null)
  const [modal, setModal] = React.useState<ActiveModal>(null)

  const statusTimer = React.useRef<number | null>(null)
  const defaultLoadedRef = React.useRef(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const nameInputId = React.useRef(`si-name-${props.id}`).current
  const searchInputId = React.useRef(`si-search-${props.id}`).current

  // ---------------------------------------------------------------------
  // Status banner helper (announced to screen readers via the Alert region)
  // ---------------------------------------------------------------------
  const announce = React.useCallback((kind: StatusKind, text: string) => {
    setStatus({ kind, text })
    if (statusTimer.current) window.clearTimeout(statusTimer.current)
    if (kind === 'success') {
      statusTimer.current = window.setTimeout(() => { setStatus(null) }, 5000)
    }
  }, [])

  React.useEffect(() => () => { if (statusTimer.current) window.clearTimeout(statusTimer.current) }, [])

  // ---------------------------------------------------------------------
  // Storage
  // ---------------------------------------------------------------------
  const loadFromStorage = React.useCallback(() => {
    if (!storageAvailable()) {
      announce('warning', translate('errStorageUnavailable'))
      return
    }
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return
    try {
      const parsed = JSON.parse(fromBase64(stored))
      const migrated = (Array.isArray(parsed) ? parsed : []).map(migrateInstance).filter(Boolean)
      setSavedInstances(migrated)
    } catch (e) {
      console.error('SaveInstance: could not read stored instances.', e)
    }
  }, [announce, translate])

  /** Persist instances. Returns true on success. */
  const persist = React.useCallback((instances: any[]): boolean => {
    if (!storageAvailable()) {
      announce('error', translate('errStorageUnavailable'))
      return false
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, toBase64(JSON.stringify(instances)))
      return true
    } catch (e) {
      const quota = e instanceof DOMException &&
        (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')
      announce('error', translate(quota ? 'errStorageQuota' : 'errStorage'))
      return false
    }
  }, [announce, translate])

  React.useEffect(() => { loadFromStorage() }, [loadFromStorage])

  // ---------------------------------------------------------------------
  // Map view
  // ---------------------------------------------------------------------
  const activeViewChangeHandler = (jmv: JimuMapView): void => {
    if (jmv) setJimuMapView(jmv)
  }

  // Optional: load a default instance once on startup
  React.useEffect(() => {
    if (defaultLoadedRef.current) return
    const target = config?.defaultInstanceName
    if (!jimuMapView || !target || savedInstances.length === 0) return
    const found = savedInstances.find(i => i.name === target)
    if (found) {
      defaultLoadedRef.current = true
      void loadInstance(found)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jimuMapView, savedInstances, config?.defaultInstanceName])

  // ---------------------------------------------------------------------
  // Capture map state
  // ---------------------------------------------------------------------
  const getLayerType = (layer: any): string => {
    switch (layer.type) {
      case 'feature': return 'FeatureLayer'
      case 'tile': return 'TileLayer'
      case 'map-image': return 'MapImageLayer'
      case 'group': return 'GroupLayer'
      case 'graphics': return 'GraphicsLayer'
      default: return 'UnknownLayerType'
    }
  }

  const getGraphicsFromGraphicsLayer = (layer: any, instanceName: string): any[] => {
    return layer.graphics.toArray().map((graphic: any) => {
      graphic.attributes = { ...graphic.attributes, instance: instanceName }
      return graphic.toJSON()
    })
  }

  const getSettingsForLayer = (layer: any, instanceName: string): any => {
    const settings: any = {
      id: layer.id,
      name: layer.title,
      type: getLayerType(layer),
      isVisible: layer.visible,
      options: {},
      graphics: null
    }
    if (config.captureLayers) {
      settings.options.opacity = layer.opacity
      if (typeof layer.refreshInterval === 'number') settings.options.refreshInterval = layer.refreshInterval
    }
    if (config.captureFilters && settings.type === 'FeatureLayer') {
      if (layer.definitionExpression != null) settings.options.definitionExpression = layer.definitionExpression
      if (typeof layer.labelsVisible === 'boolean') settings.options.labelsVisible = layer.labelsVisible
    }
    if (config.captureGraphics && settings.type === 'GraphicsLayer') {
      settings.graphics = getGraphicsFromGraphicsLayer(layer, instanceName)
    }
    return settings
  }

  const buildLayerHierarchy = (layers: any, instanceName: string): any[] => {
    const hierarchy: any[] = []
    if (!layers || layers.length === 0) return hierarchy
    layers.forEach((item: any) => {
      let subLayersType = 'null'
      const immediate = new Collection()
      if (item.type !== 'map-notes') {
        if (item.allSublayers && item.allSublayers.length > 0) { immediate.addMany(item.allSublayers); subLayersType = 'allSublayers' } else if (item.sublayers && item.sublayers.length > 0) { immediate.addMany(item.sublayers); subLayersType = 'sublayers' } else if (item.layers && item.layers.length > 0) { immediate.addMany(item.layers); subLayersType = 'layers' } else if (item.subLayers && item.subLayers.length > 0) { immediate.addMany(item.subLayers); subLayersType = 'subLayers' }
      }
      hierarchy.push({
        layerSettings: getSettingsForLayer(item, instanceName),
        subLayers: buildLayerHierarchy(immediate, instanceName),
        subLayersType
      })
    })
    return hierarchy
  }

  const buildInstance = (name: string): any => {
    const view = jimuMapView.view
    const instance: any = {
      schemaVersion: SCHEMA_VERSION,
      name,
      createdAt: new Date().toISOString(),
      webmapId: view.map?.portalItem?.id ?? null,
      viewpoint: null,
      extent: null,
      timeExtent: null,
      basemap: null,
      layers: [],
      graphics: []
    }
    if (config.captureViewpoint) {
      instance.viewpoint = view.viewpoint?.toJSON() ?? null
      instance.extent = view.extent?.toJSON() ?? null
    }
    if (config.captureTime && view.timeExtent) {
      instance.timeExtent = {
        start: view.timeExtent.start ? view.timeExtent.start.toISOString() : null,
        end: view.timeExtent.end ? view.timeExtent.end.toISOString() : null
      }
    }
    if (config.captureBasemap && view.map?.basemap) {
      instance.basemap = view.map.basemap.toJSON()
    }
    if (config.captureLayers || config.captureFilters || config.captureGraphics) {
      try {
        instance.layers = buildLayerHierarchy(view.map.layers, name)
      } catch (e) {
        console.error('SaveInstance: error reading layers.', e)
      }
    }
    if (config.captureGraphics) {
      instance.graphics = view.graphics.toArray().map((g: any) => g.toJSON())
    }
    return instance
  }

  const handleSave = (): void => {
    if (!jimuMapView) { announce('error', translate('errNoMap')); return }
    const name = nameInput.trim()
    if (!name) { announce('error', translate('errNoName')); return }
    if (savedInstances.some(i => i.name === name)) {
      announce('error', translate('errDuplicate', { name }))
      return
    }
    if (config.maxInstances > 0 && savedInstances.length >= config.maxInstances) {
      announce('error', translate('errMaxInstances', { max: config.maxInstances }))
      return
    }
    const instance = buildInstance(name)
    const updated = [...savedInstances, instance]
    if (persist(updated)) {
      setSavedInstances(updated)
      setNameInput('')
      announce('success', translate('saved', { name }))
    }
  }

  // ---------------------------------------------------------------------
  // Apply / load map state
  // ---------------------------------------------------------------------
  const setGraphicsOnMap = (graphics: any[], instanceName: string): void => {
    if (!graphics || graphics.length === 0) return
    const existing = jimuMapView.view.graphics.filter((g: any) => g?.attributes?.instance === instanceName)
    if (existing.length > 0) jimuMapView.view.graphics.removeMany(existing)
    graphics.forEach((g: any) => { jimuMapView.view.graphics.add(Graphic.fromJSON(g)) })
  }

  const applyLayerSettings = (nodes: any[], liveLayers: any, instanceName: string): void => {
    if (!nodes || nodes.length === 0 || !liveLayers) return
    nodes.forEach((node) => {
      const setting = node.layerSettings
      const subNodes = node.subLayers

      // Restore Draw/Sketch graphics that were nested under the jimu-draw group
      if (setting.id?.toString().includes(DRAW_GROUP_LAYER_ID) && setting.type === 'GroupLayer') {
        subNodes?.forEach((sub: any) => {
          if (sub.layerSettings.type === 'GraphicsLayer' && config.captureGraphics) {
            setGraphicsOnMap(sub.layerSettings.graphics ?? [], instanceName)
          }
        })
      }

      const live = liveLayers.find((l: any) => l.id === setting.id)
      if (!live) {
        console.warn(`SaveInstance: layer "${setting.id}" not found on the map.`)
        return
      }
      if (config.captureLayers) {
        try { live.visible = setting.isVisible } catch (e) { /* not settable */ }
      }
      if (setting.options) {
        Object.keys(setting.options).forEach((key) => {
          const captureOk =
            (key === 'definitionExpression' || key === 'labelsVisible') ? config.captureFilters : config.captureLayers
          if (!captureOk) return
          try { (live as any)[key] = setting.options[key] } catch (e) { /* not settable */ }
        })
      }
      if (subNodes && subNodes.length > 0) {
        let liveSub: any
        switch (node.subLayersType) {
          case 'allSublayers': liveSub = live.allSublayers; break
          case 'sublayers': liveSub = live.sublayers; break
          case 'layers': liveSub = live.layers; break
          case 'subLayers': liveSub = live.subLayers; break
          default: liveSub = undefined
        }
        if (liveSub) applyLayerSettings(subNodes, liveSub, instanceName)
      }
    })
  }

  const loadInstance = async (instance: any): Promise<void> => {
    if (!jimuMapView) { announce('error', translate('errNoMap')); return }
    setLoadingName(instance.name)
    const view = jimuMapView.view
    let hadIssue = false

    const currentMapId = view.map?.portalItem?.id ?? null
    if (instance.webmapId && currentMapId && instance.webmapId !== currentMapId) {
      announce('warning', translate('errWrongMap'))
    }

    try {
      if (config.captureLayers || config.captureFilters || config.captureGraphics) {
        if (instance.layers) applyLayerSettings(instance.layers, view.map.layers, instance.name)
      }
      if (config.captureGraphics) setGraphicsOnMap(instance.graphics, instance.name)

      if (config.captureBasemap && instance.basemap) {
        view.map.basemap = Basemap.fromJSON(instance.basemap)
      }
      if (config.captureTime && instance.timeExtent) {
        view.timeExtent = new TimeExtent({
          start: instance.timeExtent.start ? new Date(instance.timeExtent.start) : null,
          end: instance.timeExtent.end ? new Date(instance.timeExtent.end) : null
        })
      }
      if (config.captureViewpoint) {
        if (instance.viewpoint) {
          await view.goTo(Viewpoint.fromJSON(instance.viewpoint))
        } else if (instance.extent) {
          await view.goTo(Extent.fromJSON(instance.extent))
        }
      }
    } catch (e: any) {
      // goTo rejects when interrupted by another navigation, that is benign
      if (e?.name !== 'AbortError') {
        hadIssue = true
        console.error('SaveInstance: error loading instance.', e)
      }
    } finally {
      setLoadingName(null)
    }

    announce(hadIssue ? 'warning' : 'success',
      translate(hadIssue ? 'errLoadFailed' : 'loaded', { name: instance.name }))
  }

  // ---------------------------------------------------------------------
  // Rename / delete / clear
  // ---------------------------------------------------------------------
  const commitRename = (oldName: string, newName: string): void => {
    const trimmed = newName.trim()
    if (!trimmed) return
    if (savedInstances.some(i => i.name === trimmed)) {
      announce('error', translate('errDuplicate', { name: trimmed }))
      return
    }
    const updated = savedInstances.map(inst => {
      if (inst.name !== oldName) return inst
      return {
        ...inst,
        name: trimmed,
        graphics: (inst.graphics || []).map((g: any) =>
          g?.attributes ? { ...g, attributes: { ...g.attributes, instance: trimmed } } : g)
      }
    })
    if (persist(updated)) {
      setSavedInstances(updated)
      announce('success', translate('renamed', { name: trimmed }))
    }
    setModal(null)
  }

  const clearGraphics = (name: string): void => {
    if (!jimuMapView) return
    const existing = jimuMapView.view.graphics.filter((g: any) => g?.attributes?.instance === name)
    jimuMapView.view.graphics.removeMany(existing)
    announce('success', translate('graphicsCleared', { name }))
  }

  const commitDelete = (name: string): void => {
    if (jimuMapView) {
      const existing = jimuMapView.view.graphics.filter((g: any) => g?.attributes?.instance === name)
      jimuMapView.view.graphics.removeMany(existing)
    }
    const updated = savedInstances.filter(i => i.name !== name)
    if (persist(updated)) {
      setSavedInstances(updated)
      announce('success', translate('deleted', { name }))
    }
    setModal(null)
  }

  // ---------------------------------------------------------------------
  // Import / export
  // ---------------------------------------------------------------------
  const isValidInstanceList = (data: any): boolean =>
    Array.isArray(data) && data.every(d => d && typeof d === 'object' && typeof d.name === 'string')

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0]
    if (event.target) event.target.value = ''
    if (!file || !(file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt'))) {
      announce('error', translate('errInvalidFile'))
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result
      if (typeof text !== 'string') { announce('error', translate('errInvalidContent')); return }
      let parsed: any
      try {
        parsed = JSON.parse(fromBase64(text))
      } catch (err) {
        announce('error', translate('errInvalidContent'))
        return
      }
      if (!isValidInstanceList(parsed)) { announce('error', translate('errInvalidContent')); return }
      const incoming = parsed.map(migrateInstance).filter(Boolean)
      const existingNames = new Set(savedInstances.map(i => i.name))
      const dupes = incoming.filter(i => existingNames.has(i.name)).map(i => i.name)
      if (dupes.length > 0) {
        setModal({ kind: 'replace', dupes, incoming })
      } else {
        applyImport(incoming, false)
      }
    }
    reader.readAsText(file)
  }

  const applyImport = (incoming: any[], replaceDupes: boolean): void => {
    const map = new Map(savedInstances.map(i => [i.name, i]))
    let count = 0
    incoming.forEach((inst) => {
      const exists = map.has(inst.name)
      if (!exists || replaceDupes) { map.set(inst.name, inst); count++ }
    })
    const updated = Array.from(map.values())
    if (persist(updated)) {
      setSavedInstances(updated)
      announce('success', translate('imported', { count }))
    }
    setModal(null)
  }

  const handleDownload = (name: string, all: boolean): void => {
    if (savedInstances.length === 0) { announce('error', translate('errNothingToDownload')); return }
    const toDownload = all ? savedInstances : [savedInstances.find(i => i.name === name)]
    const encoded = toBase64(JSON.stringify(toDownload))
    const now = new Date()
    const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`
    const filename = `${all ? 'all-instances' : name}-${stamp}.txt`
    const blob = new Blob([encoded], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  // ---------------------------------------------------------------------
  // Derived list (filter + sort)
  // ---------------------------------------------------------------------
  const visibleInstances = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    const filtered = q ? savedInstances.filter(i => i.name.toLowerCase().includes(q)) : savedInstances.slice()
    filtered.sort((a, b) => {
      switch (sort) {
        case 'name-asc': return a.name.localeCompare(b.name)
        case 'name-desc': return b.name.localeCompare(a.name)
        case 'date-asc': return (a.createdAt || '').localeCompare(b.createdAt || '')
        default: return (b.createdAt || '').localeCompare(a.createdAt || '')
      }
    })
    return filtered
  }, [savedInstances, search, sort])

  const formatDate = (iso: string): string => {
    if (!iso) return ''
    const d = new Date(iso)
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString()
  }

  // ---------------------------------------------------------------------
  // Styles (theme-driven via EXB CSS vars, with safe light-mode fallbacks)
  // ---------------------------------------------------------------------
  const styles = css`
    padding: 0.75rem;
    color: var(--sys-color-surface-paper-text, inherit);
    .si-sr-only {
      position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
      overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
    }
    h3.si-heading { font-size: 0.95rem; margin: 0.25rem 0 0.5rem; }
    .si-field { display: flex; flex-direction: column; gap: 0.25rem; margin-bottom: 0.5rem; }
    .si-hint { font-size: 0.75rem; opacity: 0.75; }
    .si-toolbar { display: flex; gap: 0.5rem; align-items: flex-end; margin: 0.5rem 0; flex-wrap: wrap; }
    .si-toolbar > * { flex: 1 1 8rem; min-width: 7rem; }
    hr.si-rule { border: none; border-top: 1px solid var(--sys-color-divider-primary, rgba(110,110,110,0.35)); margin: 0.75rem 0; }
    table.si-table { border-collapse: collapse; width: 100%; font-size: 0.8rem; }
    table.si-table caption { text-align: left; }
    table.si-table th, table.si-table td {
      border: 1px solid var(--sys-color-divider-primary, rgba(110,110,110,0.35));
      padding: 0.25rem; text-align: center; vertical-align: middle;
    }
    table.si-table thead th {
      background: var(--sys-color-primary-main, #076fe5);
      color: var(--sys-color-primary-text, #ffffff);
      font-weight: 600;
    }
    table.si-table th[scope="row"] { text-align: left; font-weight: 600; }
    table.si-table tbody tr:nth-of-type(even) {
      background: var(--sys-color-surface-background-hint, rgba(110,110,110,0.08));
    }
    .si-cell-btn { min-width: 1.75rem; }
    .si-action-cell { padding: 0; }
    .si-footer { display: flex; gap: 0.5rem; margin-top: 1rem; flex-wrap: wrap; }
    .si-footer > * { flex: 1 1 auto; }
    .si-empty {
      font-size: 0.8rem; padding: 0.75rem;
      border: 1px dashed var(--sys-color-divider-primary, rgba(110,110,110,0.4));
      border-radius: 4px;
    }
    .si-legend td:first-of-type { width: 2.25rem; }
  `

  const iconBtn = (icon: string, label: string, onClick: () => void, busy = false): React.ReactElement => (
    <Tooltip title={label} placement='top'>
      <Button
        type='tertiary'
        size='sm'
        className='si-cell-btn'
        aria-label={label}
        disabled={busy}
        onClick={onClick}
      >
        {busy
          ? <Loading type={LoadingType.Primary} width={14} height={14} />
          : <CalciteIcon icon={icon} scale='s' aria-hidden='true' />}
      </Button>
    </Tooltip>
  )

  // ---------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------
  const hasMap = props.useMapWidgetIds && props.useMapWidgetIds.length === 1

  return (
    <div className='jimu-widget' css={styles} role='region' aria-label={translate('_widgetLabel')}>
      {hasMap && (
        <JimuMapViewComponent
          useMapWidgetId={props.useMapWidgetIds[0]}
          onActiveViewChange={activeViewChangeHandler}
        />
      )}

      {/* Status / errors, Alert announces to assistive tech */}
      {status && (
        <Alert
          css={css`margin-bottom: 0.5rem;`}
          type={status.kind}
          text={status.text}
          withIcon
          closable
          onClose={() => { setStatus(null) }}
        />
      )}

      {/* Save */}
      <h3 className='si-heading'>{translate('saveHeading')}</h3>
      <div className='si-field'>
        <Label for={nameInputId}>{translate('instanceNameLabel')}</Label>
        <TextInput
          id={nameInputId}
          value={nameInput}
          aria-describedby={`${nameInputId}-hint`}
          onChange={(e) => { setNameInput(e.target.value) }}
          onAcceptValue={() => { if (nameInput.trim()) handleSave() }}
        />
        <span id={`${nameInputId}-hint`} className='si-hint'>{translate('instanceNameHint')}</span>
      </div>
      <Button
        type='primary'
        size='sm'
        disabled={!hasMap || nameInput.trim().length === 0}
        onClick={handleSave}
      >
        {translate('saveInstance')}
      </Button>

      <hr className='si-rule' />

      {/* Saved list */}
      <h3 className='si-heading'>{translate('savedHeading')}</h3>

      {savedInstances.length === 0
        ? (
        <p className='si-empty'>{translate('emptyState')}</p>
          )
        : (
        <React.Fragment>
          <div className='si-toolbar'>
            <div className='si-field' css={css`margin-bottom:0;`}>
              <Label for={searchInputId}>{translate('searchLabel')}</Label>
              <TextInput
                id={searchInputId}
                value={search}
                placeholder={translate('searchPlaceholder')}
                onChange={(e) => { setSearch(e.target.value) }}
              />
            </div>
            <div className='si-field' css={css`margin-bottom:0;`}>
              <Label>{translate('sortLabel')}</Label>
              <Select
                size='sm'
                aria-label={translate('sortLabel')}
                value={sort}
                onChange={(e) => { setSort(e.target.value as SortKey) }}
              >
                <Option value='date-desc'>{translate('sortNewest')}</Option>
                <Option value='date-asc'>{translate('sortOldest')}</Option>
                <Option value='name-asc'>{translate('sortNameAsc')}</Option>
                <Option value='name-desc'>{translate('sortNameDesc')}</Option>
              </Select>
            </div>
          </div>

          {visibleInstances.length === 0
            ? <p className='si-empty'>{translate('noMatches', { query: search.trim() })}</p>
            : (
            <table className='si-table'>
              <caption className='si-sr-only'>{translate('tableCaption')}</caption>
              <thead>
                <tr>
                  <th scope='col'>{translate('colName')}</th>
                  <th scope='col'>{translate('colSaved')}</th>
                  <th scope='col' colSpan={5}>
                    {translate('colActions')}{' '}
                    <Button
                      type='tertiary'
                      size='sm'
                      icon
                      aria-label={translate('showLegend')}
                      aria-expanded={showLegend}
                      onClick={() => { setShowLegend(!showLegend) }}
                    >
                      <CalciteIcon icon='question' scale='s' aria-hidden='true' />
                    </Button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleInstances.map((instance) => (
                  <tr key={instance.name}>
                    <th scope='row'>{instance.name}</th>
                    <td>{formatDate(instance.createdAt)}</td>
                    <td className='si-action-cell'>
                      {iconBtn('overwrite-features', translate('loadAction', { name: instance.name }),
                        () => { void loadInstance(instance) }, loadingName === instance.name)}
                    </td>
                    <td className='si-action-cell'>
                      {iconBtn('edit-attributes', translate('renameAction', { name: instance.name }),
                        () => { setModal({ kind: 'rename', name: instance.name, value: instance.name }) })}
                    </td>
                    <td className='si-action-cell'>
                      {iconBtn('download', translate('downloadAction', { name: instance.name }),
                        () => { handleDownload(instance.name, false) })}
                    </td>
                    <td className='si-action-cell'>
                      {iconBtn('x-circle', translate('clearGraphicsAction', { name: instance.name }),
                        () => { clearGraphics(instance.name) })}
                    </td>
                    <td className='si-action-cell'>
                      {iconBtn('trash', translate('deleteAction', { name: instance.name }),
                        () => { setModal({ kind: 'delete', name: instance.name }) })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
              )}

          {/* Action legend */}
          {showLegend && (
            <table className='si-table si-legend' css={css`margin-top:0.5rem;`}>
              <caption className='si-heading' css={css`text-align:left;`}>{translate('legendHeading')}</caption>
              <thead>
                <tr>
                  <th scope='col'>{translate('legendIcon')}</th>
                  <th scope='col'>{translate('legendAction')}</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><CalciteIcon icon='overwrite-features' scale='s' aria-hidden='true' /></td><td css={css`text-align:left;`}>{translate('loadAction', { name: '…' })}</td></tr>
                <tr><td><CalciteIcon icon='edit-attributes' scale='s' aria-hidden='true' /></td><td css={css`text-align:left;`}>{translate('renameAction', { name: '…' })}</td></tr>
                <tr><td><CalciteIcon icon='download' scale='s' aria-hidden='true' /></td><td css={css`text-align:left;`}>{translate('downloadAction', { name: '…' })}</td></tr>
                <tr><td><CalciteIcon icon='x-circle' scale='s' aria-hidden='true' /></td><td css={css`text-align:left;`}>{translate('clearGraphicsAction', { name: '…' })}</td></tr>
                <tr><td><CalciteIcon icon='trash' scale='s' aria-hidden='true' /></td><td css={css`text-align:left;`}>{translate('deleteAction', { name: '…' })}</td></tr>
              </tbody>
            </table>
          )}
        </React.Fragment>
          )}

      {/* Footer: import / export */}
      <div className='si-footer'>
        <Button
          type='secondary'
          size='sm'
          onClick={() => { fileInputRef.current?.click() }}
        >
          {translate('uploadInstances')}
        </Button>
        <Button
          type='secondary'
          size='sm'
          disabled={savedInstances.length === 0}
          onClick={() => { handleDownload('all', true) }}
        >
          {translate('downloadInstances')}
        </Button>
      </div>
      <input
        ref={fileInputRef}
        type='file'
        accept='.txt,text/plain'
        className='si-sr-only'
        aria-label={translate('uploadInstances')}
        onChange={handleFileChange}
      />

      {/* Rename modal */}
      <Modal isOpen={modal?.kind === 'rename'} toggle={() => { setModal(null) }} onClosed={() => { setModal(null) }} aria-labelledby='si-rename-title'>
        {modal?.kind === 'rename' && (
          <React.Fragment>
            <ModalHeader id='si-rename-title' toggle={() => { setModal(null) }}>{translate('renameTitle')}</ModalHeader>
            <ModalBody>
              <Label for='si-rename-input'>{translate('renameLabel', { name: modal.name })}</Label>
              <TextInput
                id='si-rename-input'
                css={css`width:100%;`}
                value={modal.value}
                onChange={(e) => { setModal({ ...modal, value: e.target.value }) }}
                onAcceptValue={() => { commitRename(modal.name, modal.value) }}
              />
            </ModalBody>
            <ModalFooter>
              <Button type='tertiary' onClick={() => { setModal(null) }}>{translate('cancel')}</Button>
              <Button type='primary' disabled={!modal.value.trim()} onClick={() => { commitRename(modal.name, modal.value) }}>{translate('rename')}</Button>
            </ModalFooter>
          </React.Fragment>
        )}
      </Modal>

      {/* Delete modal */}
      <Modal isOpen={modal?.kind === 'delete'} toggle={() => { setModal(null) }} onClosed={() => { setModal(null) }} aria-labelledby='si-delete-title'>
        {modal?.kind === 'delete' && (
          <React.Fragment>
            <ModalHeader id='si-delete-title' toggle={() => { setModal(null) }}>{translate('deleteTitle')}</ModalHeader>
            <ModalBody>{translate('deleteConfirm', { name: modal.name })}</ModalBody>
            <ModalFooter>
              <Button type='tertiary' onClick={() => { setModal(null) }}>{translate('cancel')}</Button>
              <Button type='danger' onClick={() => { commitDelete(modal.name) }}>{translate('delete')}</Button>
            </ModalFooter>
          </React.Fragment>
        )}
      </Modal>

      {/* Replace-on-import modal */}
      <Modal isOpen={modal?.kind === 'replace'} toggle={() => { setModal(null) }} onClosed={() => { setModal(null) }} aria-labelledby='si-replace-title'>
        {modal?.kind === 'replace' && (
          <React.Fragment>
            <ModalHeader id='si-replace-title' toggle={() => { setModal(null) }}>{translate('replaceTitle')}</ModalHeader>
            <ModalBody>{translate('replaceConfirm', { name: modal.dupes.join('”, “') })}</ModalBody>
            <ModalFooter>
              <Button type='tertiary' onClick={() => { applyImport(modal.incoming, false) }}>{translate('keepExisting')}</Button>
              <Button type='primary' onClick={() => { applyImport(modal.incoming, true) }}>{translate('replace')}</Button>
            </ModalFooter>
          </React.Fragment>
        )}
      </Modal>
    </div>
  )
}

export default Widget
