/** @jsx jsx */
import { React, jsx, css, hooks } from 'jimu-core'
import {
  MapWidgetSelector,
  SettingRow,
  SettingSection
} from 'jimu-ui/advanced/setting-components'
import { Switch, NumericInput, TextInput } from 'jimu-ui'
import { type IMConfig } from '../config'
import defaultMessages from './translations/default'

/**
 * Local structural stand-in for `AllWidgetSettingProps` from 'jimu-for-builder'.
 * The shared editor shim declares that module in shorthand form, and a shorthand
 * module cannot be used as a type (TS2709). The shim is byte-locked, so the fix
 * is local. See WIDGETHANDOFF Section 12, item 3.
 */
interface SettingProps {
  id: string
  config: IMConfig
  onSettingChange: (settings: any, ...rest: any[]) => void
  useDataSources?: any
  useMapWidgetIds?: any
  intl?: any
  theme?: any
  portalUrl?: string
  [key: string]: any
}

function Setting (props: SettingProps): React.ReactElement {
  const translate = hooks.useTranslation(defaultMessages)
  const { config, id, onSettingChange } = props

  const onMapWidgetSelected = (useMapWidgetIds: string[]): void => {
    onSettingChange({ id, useMapWidgetIds })
  }

  const setConfig = (key: keyof IMConfig, value: any): void => {
    onSettingChange({ id, config: (config as any).set(key, value) })
  }

  const hint = css`font-size: 0.75rem; opacity: 0.75; line-height: 1.3;`
  const fullWidth = css`width: 100%;`

  const toggle = (key: keyof IMConfig, labelKey: string): React.ReactElement => (
    <SettingRow tag='label' label={translate(labelKey)}>
      <Switch
        checked={!!config[key]}
        aria-label={translate(labelKey)}
        onChange={(e) => { setConfig(key, e.target.checked) }}
      />
    </SettingRow>
  )

  return (
    <div>
      <SettingSection title={translate('selectMap')}>
        <SettingRow>
          <MapWidgetSelector
            onSelect={onMapWidgetSelected}
            useMapWidgetIds={props.useMapWidgetIds}
          />
        </SettingRow>
        <SettingRow>
          <span css={hint}>{translate('selectMapHint')}</span>
        </SettingRow>
      </SettingSection>

      <SettingSection title={translate('captureSection')}>
        {toggle('captureViewpoint', 'captureViewpoint')}
        {toggle('captureLayers', 'captureLayers')}
        {toggle('captureFilters', 'captureFilters')}
        {toggle('captureBasemap', 'captureBasemap')}
        {toggle('captureTime', 'captureTime')}
        {toggle('captureGraphics', 'captureGraphics')}
      </SettingSection>

      <SettingSection title={translate('limitsSection')}>
        <SettingRow flow='wrap' tag='label' label={translate('maxInstances')}>
          <NumericInput
            css={fullWidth}
            size='sm'
            min={0}
            step={1}
            value={config.maxInstances}
            aria-label={translate('maxInstances')}
            onChange={(value) => { setConfig('maxInstances', Math.max(0, Math.floor(value || 0))) }}
          />
        </SettingRow>
        <SettingRow>
          <span css={hint}>{translate('maxInstancesHint')}</span>
        </SettingRow>

        <SettingRow flow='wrap' tag='label' label={translate('defaultInstance')}>
          <TextInput
            css={fullWidth}
            size='sm'
            value={config.defaultInstanceName}
            placeholder={translate('defaultInstanceNone')}
            aria-label={translate('defaultInstance')}
            onChange={(e) => { setConfig('defaultInstanceName', e.target.value) }}
          />
        </SettingRow>
        <SettingRow>
          <span css={hint}>{translate('defaultInstanceHint')}</span>
        </SettingRow>
      </SettingSection>
      <SettingSection title='Help'>
        <SettingRow tag='label' label='Show help guide'>
          <Switch
            checked={props.config?.showHelp !== false}
            onChange={(evt) => { props.onSettingChange({ id: (props as any).id, config: (props.config as any).set('showHelp', evt.target.checked) }) }}
            aria-label='Show the question-mark button that opens the widget help guide'
          />
        </SettingRow>
      </SettingSection>
    </div>
  )
}

export default Setting
