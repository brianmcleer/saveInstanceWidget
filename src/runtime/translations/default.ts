export default {
  _widgetLabel: 'Save Instance',

  // Save panel
  saveHeading: 'Save the current map',
  instanceNameLabel: 'Instance name',
  instanceNameHint: 'Give this saved view a short, recognizable name.',
  saveInstance: 'Save instance',
  saved: 'Saved instance “{name}”.',

  // Saved list
  savedHeading: 'Saved instances',
  emptyState: 'No saved instances yet. Enter a name above and choose Save instance to store the current map.',
  searchLabel: 'Filter saved instances',
  searchPlaceholder: 'Filter by name',
  sortLabel: 'Sort instances',
  sortNameAsc: 'Name (A–Z)',
  sortNameDesc: 'Name (Z–A)',
  sortNewest: 'Newest first',
  sortOldest: 'Oldest first',
  noMatches: 'No instances match “{query}”.',

  // Table
  tableCaption: 'Saved map instances and the actions available for each.',
  colName: 'Name',
  colSaved: 'Saved',
  colActions: 'Actions',
  showLegend: 'Show what each action does',
  legendHeading: 'Action reference',
  legendIcon: 'Icon',
  legendAction: 'Action',
  closeLegend: 'Close action reference',

  // Row actions (used as accessible names)
  loadAction: 'Load “{name}” onto the map',
  renameAction: 'Rename “{name}”',
  downloadAction: 'Download “{name}”',
  clearGraphicsAction: 'Clear graphics for “{name}” from the map',
  deleteAction: 'Delete “{name}”',
  loadingInstance: 'Loading “{name}”…',
  loaded: 'Loaded instance “{name}”.',

  // Rename modal
  renameTitle: 'Rename instance',
  renameLabel: 'New name for “{name}”',
  rename: 'Rename',
  renamed: 'Renamed to “{name}”.',

  // Delete modal
  deleteTitle: 'Delete instance',
  deleteConfirm: 'Delete the instance “{name}”? This cannot be undone.',
  delete: 'Delete',
  deleted: 'Deleted instance “{name}”.',
  graphicsCleared: 'Cleared graphics for “{name}”.',

  // Upload / download footer
  uploadInstances: 'Upload instances',
  downloadInstances: 'Download all',
  uploadHint: 'Import instances from a .txt file you have downloaded.',
  imported: 'Imported {count, plural, one {# instance} other {# instances}}.',

  // Replace-on-import modal
  replaceTitle: 'Instance already exists',
  replaceConfirm: 'An instance named “{name}” already exists. Replace it with the imported one?',
  replace: 'Replace',
  keepExisting: 'Keep existing',

  // Shared modal buttons
  cancel: 'Cancel',
  confirm: 'Confirm',

  // Errors / status
  errNoMap: 'Connect this widget to a map before saving.',
  errNoName: 'Enter an instance name first.',
  errDuplicate: 'An instance named “{name}” already exists. Choose a different name.',
  errMaxInstances: 'You have reached the limit of {max} saved instances. Delete one before saving another.',
  errStorageQuota: 'The browser storage limit was reached, so the instance was not saved. Delete some instances or reduce saved graphics.',
  errStorage: 'The instance could not be saved to browser storage.',
  errStorageUnavailable: 'Browser storage is unavailable, so instances cannot be saved on this device.',
  errInvalidFile: 'Choose a valid .txt file exported by this widget.',
  errInvalidContent: 'That file is not a valid instance export.',
  errNothingToDownload: 'There are no saved instances to download.',
  errWrongMap: 'This instance was saved from a different map. Some settings may not apply.',
  errLoadFailed: 'The instance could not be fully loaded.'
}
