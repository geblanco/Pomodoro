'use strict'
//Entry point, set custom object in global
var fs        = require('fs')
var upath     = require('upath')
var notifier  = require('node-notifier')
var settings  = require('electron-settings')
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

// Global variables
var timer = null
var counters = []
var timeLeft = 0
var DEFAULT_TIME = settings.get('pomo_time') || 25
var POMO_TIME = toSeconds( DEFAULT_TIME )

var setupCounter = function( time ){

  var _timeLeft = time
  
  if( _timeLeft > 0 ){
    
    timerIcon( app.getPath('userData'), _timeLeft, function( err, icon ){

      if( err ){
        console.log('ICON ERR', err)
        return            
      }

      appIcon.setImage( icon )
      counters.push(setTimeout(function(){
        setupCounter( --_timeLeft )
      }, toSeconds( 1 )))
    })

  }
}

var setupMenu = function(){

  if( !appIcon ){
    appIcon = new Tray(upath.joinSafe(__dirname, 'icons', STATE.icon + '24.png'))
  }else{
    appIcon.setImage(upath.joinSafe(__dirname, 'icons', STATE.icon + '24.png'))
  }
  
  var minimumItems = [{ click: STATE.fn, label: STATE.tip }]

  // If started we allow pause
  if( STATE.id === STATES.STARTED.id ){
    minimumItems.push(
      { click: STATES.PAUSED.fn, label: STATES.PAUSED.tip }
    )
  }else if( STATE.id === STATES.TO_CONTINUE.id ){
    // If paused we allow stop
    minimumItems.push(
      { click: STATES.STARTED.fn, label: STATES.STARTED.tip }
    )
  }

  menu = Menu.buildFromTemplate(DEFAULT_MENU_HEAD.concat( minimumItems ).concat( DEFAULT_MENU_TAIL ))

  Menu.setApplicationMenu( menu )
  appIcon.setToolTip('Start/Pause or Stop a Pomodoro Timer.')
  appIcon.setContextMenu( menu )
}

var toggle = function( targState, continueTime ){

  STATE = Object.keys(STATES)
  STATE = STATES[ STATE[ targState ] ]

  setupMenu()

  if( STATE === STATES.STARTED ){
    setupCounter( continueTime )
  }
}

var stopPomo = function(){
  console.log('Stopped timer')
  // End of this pomo
  clearTimeout( timer )
  while( counters.length ){
    clearTimeout( counters.pop() )
  }
  timeLeft = 0
  // transition to STOPPED state
  toggle( STATES.STOPPED.id )
  // Notify user
  notifier.notify({ 
      title: 'Time is up!'
    , message: 'Pomodoro ended, stop the work and take short break'
    , icon: upath.joinSafe(__dirname, 'icons', STATE.icon + '.png')
    , sound: true 
  })
}

var pausePomo = function(){
  // Pause this pomo
  // Store time left for later continue
  timeLeft = toSeconds(fromSeconds(POMO_TIME) - counters.length)
  console.log('Paused timer, time left:', fromSeconds(timeLeft), 'minutes')
  clearTimeout( timer )
  clearTimeout( counters.pop() )
  // transition to TO_CONTINUE state
  toggle( STATES.TO_CONTINUE.id )
  // Notify user
  notifier.notify({ 
      title: 'Timer paused'
    , message: 'Pomodoro paused, this goes against the pomodoro Technique'
    , icon: upath.joinSafe(__dirname, 'icons', STATE.icon + '.png')
    , sound: true 
  })
}

var startPomo = function(){

  // Pomo started
  var pomoTime = timeLeft ? timeLeft : POMO_TIME
  var pomoMinutes = fromSeconds( pomoTime )
  console.log((timeLeft ? 'Continue' : 'Started'), 'timer:', pomoMinutes, 'minutes')
  timer = setTimeout( stopPomo, pomoTime || POMO_TIME )
  // transition to STARTED state
  toggle( STATES.STARTED.id, pomoMinutes )
  // Notify user
  notifier.notify({ 
      title: 'Timer Started!'
    , message: 'Pomodoro ' + (pomoTime ? 'continued' : 'started') + ', you have ' + pomoMinutes + ' minute' + (pomoMinutes > 1 ? 's' : '') + ' left'
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
    setupMenu()
  })
}

var setupPrefsWindow = function(){

  mainWindow = new electron.BrowserWindow({
    width: 200,
    height: 150,
    center: true,
    resizable: false,
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
    , fn  : startPomo
    , icon: 'stopped'
    , id  : 0
  },
  'STARTED': {
      tip : 'Stop timer'
    , fn  : stopPomo
    , icon: 'started'
    , id  : 1
  },
  'PAUSED': {
      tip : 'Pause timer'
    , fn  : pausePomo
    , icon: 'stopped'
    , id  : 2
  },
  'TO_CONTINUE': {
      tip : 'Continue timer'
    , fn  : startPomo
    , icon: 'stopped'
    , id  : 3
  }
}
var STATE  = STATES.STOPPED

var mainWindow = null
var appIcon    = null
var menu       = null

var DEFAULT_MENU_HEAD = [{ click: preferencesWork, label: 'Preferences' }]
var DEFAULT_MENU_TAIL = [{ type: 'separator' }, { click: app.quit, label: 'Quit' }]
// Quit when all windows are closed.
app.on('window-all-closed', app.quit)

// ENTRY POINT
app.on('ready', function(){
  // First time ...
  if( settings.get('first_time') || Object.keys( settings.getAll() ).length === 0 ){
    settings.set('first_time', false)
    preferencesWork()
  }else{
    pomoWork()
  }
})
