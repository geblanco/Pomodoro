'use strict'
//Entry point, set custom object in global
var fs        = require('fs')
var upath     = require('upath')
var notifier  = require('node-notifier')
var settings  = (function(){ var s = require('electron-settings'); return new s(); }())
var timerIcon = require('./iconGenerator')
// ***************** Electron *****************
var electron = require('electron')
var app      = electron.app
var Menu     = electron.Menu
var Tray     = electron.Tray
var ipc      = electron.ipcMain
// ********************************************

var toSeconds = function( num ){
  return (num * 1000 * 60)
}

var fromSeconds = function( num ){
  return (num / 1000 / 60)
}

// Variables
var timers = []
var counters = []
var DEFAULT_TIME = settings.get('pomo_time') || 25
var POMO_TIME = toSeconds( DEFAULT_TIME )

var _setupCounter = function( time ){

  var timeLeft = time === undefined ? fromSeconds( POMO_TIME ) : time
  
  if( timeLeft > 0 ){
    
    timerIcon( app.getPath('userData'), timeLeft, function( err, icon ){

      if( err ){
        console.log('ICON ERR', err)
        return            
      }

      appIcon.setImage( icon )
      counters.push(setTimeout(function(){
        _setupCounter( --timeLeft )
      }, toSeconds( 1 )))
    })

  }
}

var _setupMenu = function(){

  if( !appIcon ){
    appIcon = new Tray(upath.joinSafe(__dirname, 'icons', STATE.icon + '24.png'))
  }else{
    appIcon.setImage(upath.joinSafe(__dirname, 'icons', STATE.icon + '24.png'))
  }
  
  menu = Menu.buildFromTemplate([
    { click: preferencesWork, label: 'Preferences' },
    { click: STATE.fn, label: STATE.tip }
  ].concat( DEFAULT_MENU ))
  Menu.setApplicationMenu( menu )
  appIcon.setToolTip('Start or stop a Pomodoro Timer.')
  appIcon.setContextMenu( menu )
}

var _toggle = function(){

    STATE = Object.keys(STATES).filter(function( item ){
      return STATE.id !== STATES[ item ].id
    })
    STATE = STATES[ STATE[ 0 ] ]

    _setupMenu()

    if( STATE === STATES.STARTED ){
      _setupCounter()
    }
}

var _stopPomo = function(){
  // End of this pomo
  // Notify user
  clearTimeout( timers.pop() )
  clearTimeout( counters.pop() )
  _toggle( _startPomo )
  notifier.notify({ 
      title: 'Pomodoro!'
    , message: 'Pomodoro ended, stop the work and take short break'
    , icon: upath.joinSafe(__dirname, 'icons', STATE.icon + '.png')
    , sound: true 
  })
}

var _startPomo = function(){
  // Pomo started
  // Hide window
  // Notify user
  timers.push(setTimeout( _stopPomo, POMO_TIME ))
  _toggle( _stopPomo )
  notifier.notify({ 
      title: 'Pomodoro!'
    , message: 'Pomodoro started, you have ' + fromSeconds( POMO_TIME ) + ' minutes left'
    , icon: upath.joinSafe(__dirname, 'icons', STATE.icon + '.png')
    , sound: true 
  })
}

var pomoWork = function(){
  // Create folder if needed
  fs.stat( upath.joinSafe(app.getPath('userData'), 'tmpIcons'), function( err, stat ){
    if( err ){
      fs.mkdirSync( upath.joinSafe(app.getPath('userData'), 'tmpIcons') )
    }
    _setupMenu()
  })
}

var setupPrefsWindow = function(){
  mainWindow = new electron.BrowserWindow({
    width: 200,
    height: 150,
    center: true,
    resizable: true,
    darkTheme: true,
    show: false,
    title: "Pomodoro Timer Preferences"
  })
  mainWindow.loadURL('file://' + upath.joinSafe( __dirname, 'settings.html' ))
}

var setupNewTime = function( event, newTime ){

  console.log('set_timer', newTime)
  settings.set('pomo_time', newTime)
  POMO_TIME = toSeconds( newTime )
  mainWindow.hide()
  ipc.removeListener('set_timer', setupNewTime)
  pomoWork()
}

var preferencesWork = function(){

  ipc.on('set_timer', setupNewTime)

  if( !mainWindow ){
    setupPrefsWindow()
  }

  mainWindow.show()
}

var STATES = { 
  'STOPPED': {
      tip : 'Start timer'
    , fn  : _startPomo
    , icon: 'stopped'
    , id  : 0
  },
  'STARTED': {
      tip : 'Stop timer'
    , fn  : _stopPomo
    , icon: 'started'
    , id  : 1
  } 
}
var STATE  = STATES.STOPPED

var mainWindow = null
var appIcon    = null
var menu       = null
var DEFAULT_MENU = [{ type: 'separator' }, { click: app.quit, label: 'Quit' }]
// Quit when all windows are closed.
app.on('window-all-closed', app.quit)

// ENTRY POINT
app.on('ready', function(){
  // First time ...
  if( settings.get('first_time') || Object.keys( settings.get() ).length === 0 ){
    settings.set('first_time', false)
    preferencesWork()
  }else{
    pomoWork()
  }
})
