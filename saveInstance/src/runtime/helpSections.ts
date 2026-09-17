import type { HelpSection } from './components/HelpPopup'

/**
 * Content for the in-widget help guide (WIDGETHANDOFF Section 10.6).
 *
 * Presentation lives in components/HelpPopup.tsx, which is copied between widgets
 * unchanged. This file is the only part of the guide that is written per widget.
 *
 * Every line is gated on a flag the widget computes from the same config checks the
 * UI itself uses, so the guide never describes a control that is switched off.
 */

/** One boolean per optional feature that has help text. */
export interface HelpFeatures {
  /** config.captureViewpoint */
  viewpoint: boolean
  /** config.captureLayers */
  layers: boolean
  /** config.captureFilters */
  filters: boolean
  /** config.captureBasemap */
  basemap: boolean
  /** config.captureTime */
  time: boolean
  /** config.captureGraphics */
  graphics: boolean
  /** config.maxInstances > 0 */
  limited: boolean
  /** config.maxInstances, only read when limited is true */
  maxInstances: number
  /** config.defaultInstanceName is set */
  autoLoad: boolean
  /** config.defaultInstanceName, only read when autoLoad is true */
  defaultInstanceName: string
}

type T = (id: string, values?: Record<string, any>) => string

export function buildHelpSections (t: T, f: HelpFeatures): HelpSection[] {
  const when = (on: boolean, ...ids: string[]): string[] => (on ? ids.map((id: string) => t(id)) : [])
  const listOf = (parts: string[]): string =>
    parts.length <= 1
      ? (parts[0] ?? '')
      : `${parts.slice(0, -1).join(', ')} ${t('helpAnd')} ${parts[parts.length - 1]}`

  // "This app saves where the map is zoomed to, which layers are on and anything drawn."
  const savedParts = listOf([
    ...(f.viewpoint ? [t('helpSaveWhatViewpoint')] : []),
    ...(f.layers ? [t('helpSaveWhatLayers')] : []),
    ...(f.filters ? [t('helpSaveWhatFilters')] : []),
    ...(f.basemap ? [t('helpSaveWhatBasemap')] : []),
    ...(f.time ? [t('helpSaveWhatTime')] : []),
    ...(f.graphics ? [t('helpSaveWhatGraphics')] : [])
  ])

  return [
    {
      key: 'start',
      icon: 'play',
      title: t('helpStartTitle'),
      ordered: true,
      body: [t('helpStart1'), t('helpStart2'), t('helpStart3')]
    },
    {
      key: 'save',
      icon: 'save',
      title: t('helpSaveTitle'),
      intro: t('helpSaveIntro'),
      body: [
        ...(savedParts ? [t('helpSaveWhat', { what: savedParts })] : []),
        t('helpSaveUnique'),
        t('helpSaveNoOverwrite'),
        ...(f.limited ? [t('helpSaveLimit', { max: f.maxInstances })] : [])
      ]
    },
    {
      key: 'load',
      icon: 'map',
      title: t('helpLoadTitle'),
      body: [
        t('helpLoad1'),
        t('helpLoad2'),
        ...when(f.graphics, 'helpLoadGraphics'),
        t('helpLoadWrongMap'),
        ...(f.autoLoad ? [t('helpLoadDefault', { name: f.defaultInstanceName })] : [])
      ]
    },
    {
      key: 'menu',
      icon: 'ellipsis',
      title: t('helpMenuTitle'),
      intro: t('helpMenuIntro'),
      body: [
        t('helpMenuLoad'),
        t('helpMenuRename'),
        t('helpMenuDownload'),
        ...when(f.graphics, 'helpMenuClear'),
        t('helpMenuDelete')
      ]
    },
    {
      key: 'share',
      icon: 'share',
      title: t('helpShareTitle'),
      intro: t('helpShareIntro'),
      body: [t('helpShare1'), t('helpShare2'), t('helpShare3'), t('helpShare4')]
    },
    {
      key: 'organize',
      icon: 'search',
      title: t('helpOrganizeTitle'),
      body: [t('helpOrganize1'), t('helpOrganize2'), t('helpOrganize3')]
    },
    {
      key: 'keep',
      icon: 'folder',
      title: t('helpKeepTitle'),
      intro: t('helpKeepIntro'),
      body: [t('helpKeep1'), t('helpKeep2'), t('helpKeep3')]
    },
    {
      key: 'trouble',
      icon: 'exclamation-mark-triangle',
      title: t('helpTroubleTitle'),
      body: [
        t('helpTroubleSave'),
        t('helpTroubleDuplicate'),
        t('helpTroubleNoChange'),
        ...(f.limited ? [t('helpTroubleLimit', { max: f.maxInstances })] : []),
        t('helpTroubleStorage'),
        t('helpTroubleUpload'),
        t('helpTroubleGone'),
        t('helpTroubleContact')
      ]
    },
    {
      key: 'tips',
      icon: 'lightbulb',
      title: t('helpTipsTitle'),
      body: [t('helpTips1'), t('helpTips2'), ...when(f.graphics, 'helpTips3')]
    }
  ]
}
