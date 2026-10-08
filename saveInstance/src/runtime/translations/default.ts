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
  sortNameAsc: 'Name (A-Z)',
  sortNameDesc: 'Name (Z-A)',
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
  close: 'Close',

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
  errLoadFailed: 'The instance could not be fully loaded.',

  // ---------------------------------------------------------------------
  // In-widget help guide (WIDGETHANDOFF Section 10). Shared keys keep the
  // same names and wording in every widget; only helpIntro, firstRunBody and
  // the section content below are written for this widget.
  // ---------------------------------------------------------------------
  helpTitle: 'Help',
  helpIntro: 'Set the map up the way you need it, save it under a name, and bring it back with one click whenever you want it again.',
  helpSearchPlaceholder: 'Search the guide (try "download" or "delete")',
  helpNoMatches: 'Nothing in the guide matches that word. Try another, or open the sections above.',
  helpAnd: 'and',

  firstRunTitle: 'New here?',
  firstRunBody: 'Set the map how you want it, type a short name in the box above, then choose Save instance.',
  firstRunHelpLink: 'Open the guide.',
  firstRunDismiss: 'Dismiss',

  // Start here
  helpStartTitle: 'Start here: three steps',
  helpStart1: 'Set the map the way you want it: zoom to the right spot, turn layers on or off, pick a background.',
  helpStart2: 'Type a short name in the Instance name box at the top, then choose Save instance.',
  helpStart3: 'To come back to it later, find the name in the list below and choose the Load button in its row.',

  // Saving
  helpSaveTitle: 'Saving the map',
  helpSaveIntro: 'Saving takes a picture of the map exactly as it looks right now.',
  helpSaveWhat: 'This app saves {what}.',
  helpSaveWhatViewpoint: 'where the map is zoomed to',
  helpSaveWhatLayers: 'which layers are turned on and how see-through they are',
  helpSaveWhatFilters: 'the filters and labels set on those layers',
  helpSaveWhatBasemap: 'the background map',
  helpSaveWhatTime: 'where the time slider is set',
  helpSaveWhatGraphics: 'anything drawn on the map',
  helpSaveUnique: 'Every name has to be different. If the name is already in the list you are asked to pick another one.',
  helpSaveNoOverwrite: 'There is no overwrite. To replace a saved view, delete the old one first, or save under a new name.',
  helpSaveLimit: 'This app keeps at most {max} saved views. Delete one before you save another.',

  // Loading
  helpLoadTitle: 'Bringing a saved view back',
  helpLoad1: 'Choose the Load button in a row and the map changes to match what was saved. A small spinner shows in that row while it works; give it a moment.',
  helpLoad2: 'Loading only changes the map. Nothing in the list is altered, so you can load the same view as often as you like.',
  helpLoadGraphics: 'Drawings come back on top of the map. Use Clear graphics in the same row to take them off again without deleting the saved view.',
  helpLoadWrongMap: 'If a saved view was made on a different map you get a warning, and only the parts that still fit are applied.',
  helpLoadDefault: 'This app opens with the saved view named “{name}” already loaded, when you have one by that name.',

  // Row buttons
  helpMenuTitle: 'The buttons in each row',
  helpMenuIntro: 'Every row has the same buttons, in this order. Point at one to see what it does, or use Show what each action does above the list.',
  helpMenuLoad: 'Load: puts that saved view back on the map.',
  helpMenuRename: 'Rename: gives the saved view a different name.',
  helpMenuDownload: 'Download: saves that one view to a file on your computer.',
  helpMenuClear: 'Clear graphics: takes that view’s drawings off the map and leaves the saved view in the list.',
  helpMenuDelete: 'Delete: removes the saved view for good. You are asked to confirm first.',

  // Sharing
  helpShareTitle: 'Sharing with a colleague',
  helpShareIntro: 'Saved views stay in your own browser, so sharing one means sending a file.',
  helpShare1: 'Download all at the bottom puts every view in the list into one file. Download in a single row sends just that one.',
  helpShare2: 'The other person chooses Upload instances at the bottom and picks the file you sent.',
  helpShare3: 'If a name they already have is in the file, they are asked whether to Replace it or Keep existing.',
  helpShare4: 'You both need to be using the same map for the file to make sense.',

  // Finding
  helpOrganizeTitle: 'Finding what you saved',
  helpOrganize1: 'The Filter by name box above the list hides everything that does not match what you type.',
  helpOrganize2: 'Sort instances reorders the list: Newest first, Oldest first, Name (A-Z) or Name (Z-A).',
  helpOrganize3: 'The Saved column shows the date each one was made.',

  // Where they live
  helpKeepTitle: 'Where these are kept',
  helpKeepIntro: 'Nothing here is stored on a server.',
  helpKeep1: 'Saved views are kept in this browser, on this computer. Nobody else can see them.',
  helpKeep2: 'A different browser, a different computer or a private window shows an empty list.',
  helpKeep3: 'Clearing your browsing history or site data deletes them. Choose Download all first if you want a copy.',

  // Troubleshooting
  helpTroubleTitle: 'If something looks wrong',
  helpTroubleSave: 'Save instance stays greyed out: the name box is empty, or this widget is not connected to a map. Type a name, and tell the GIS Division if it is still greyed out.',
  helpTroubleDuplicate: 'It says the name already exists: another saved view has that name. Pick a different name, or rename the old one first.',
  helpTroubleNoChange: 'Loading seems to change nothing: the view was saved on a different map, or those layers are no longer in this app. A warning appears when the map does not match.',
  helpTroubleLimit: 'It says you have reached the limit: this app keeps at most {max} saved views. Delete one, then save again.',
  helpTroubleStorage: 'It says storage is full or unavailable: the browser has run out of room, or it is blocking storage. Delete a few saved views, or leave private browsing.',
  helpTroubleUpload: 'Upload instances will not take the file: only a .txt file downloaded from this widget works. Do not rename or edit that file.',
  helpTroubleGone: 'The list is empty and it was not before: browsing data was cleared, or this is a different browser or computer.',
  helpTroubleContact: 'Still stuck? Contact the GIS Division and mention the Save Instance name and this app.',

  // Good to know
  helpTipsTitle: 'Good to know',
  helpTips1: 'Short names work best. The list is easier to read and easier to filter.',
  helpTips2: 'Choose Download all now and then, so a cleared browser does not cost you everything.',
  helpTips3: 'Clear graphics only takes drawings off the map. It never deletes a saved view.'
}
