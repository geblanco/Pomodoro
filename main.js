'use strict';
//Entry point, set custom object in global
var upath     = require('upath');
var notifier  = require('node-notifier');
var timerIcon = require('./iconGenerator');
// ***************** Electron *****************
var electron      = require('electron');
var app           = electron.app;
var Menu          = electron.Menu;
var Tray          = electron.Tray;
// ********************************************

// Variables
var timers = [];
var counters = [];
var POMO_TIME = 25 * 1000 * 60;

var _setupCounter = function( time ){

    var timeLeft = time === undefined ? POMO_TIME/1000/60 : time;
    
    if( timeLeft > 0 ){
        
        timerIcon( timeLeft, function( err, icon ){

            if( err ){
                console.log('ICON ERR', err);
                return;            
            }

            appIcon.setImage( icon );
            counters.push(setTimeout(function(){
                _setupCounter( --timeLeft );
            }, 1000 * 60));
        })

    }

}

var _setupMenu = function(){

    if( !appIcon ){
        appIcon = new Tray(upath.join(__dirname, 'icons', STATE.icon + '24.png'));
    }else{
        appIcon.setImage(upath.join(__dirname, 'icons', STATE.icon + '24.png'));
    }
    
    menu = Menu.buildFromTemplate([{ click: STATE.fn, label: STATE.tip }].concat( DEFAULT_MENU ));
    Menu.setApplicationMenu( menu );
    appIcon.setToolTip('Start or stop a Pomodoro Timer.');
    appIcon.setContextMenu( menu );

}

var _toggle = function(){

    STATE = Object.keys(STATES).filter(function( item ){
        return STATE.id !== STATES[ item ].id
    });
    STATE = STATES[ STATE[ 0 ] ];

    _setupMenu();

    if( STATE === STATES.STARTED ){
        _setupCounter();
    }

}

var _stopPomo = function(){
    // End of this pomo
    // Notify user
    clearTimeout( timers.pop() );
    clearTimeout( counters.pop() );
    _toggle( _startPomo );
    notifier.notify({ 
          title: 'Pomodoro!'
        , message: 'Pomodoro ended, stop the work and take short break'
        , icon: upath.join(__dirname, 'icons', STATE.icon + '.png')
        , sound: true 
    });
}

var _startPomo = function(){
    // Pomo started
    // Hide window
    // Notify user
    timers.push(setTimeout( _stopPomo, POMO_TIME ));
    _toggle( _stopPomo );
    notifier.notify({ 
          title: 'Pomodoro!'
        , message: 'Pomodoro started, you have ' + POMO_TIME/1000/60 + ' minutes left'
        , icon: upath.join(__dirname, 'icons', STATE.icon + '.png')
        , sound: true 
    });
}

var STATES = { 
      'STOPPED': {
          tip : 'Start timer'
        , fn  : _startPomo
        , icon: 'stopped'
        , id  : 0
    },'STARTED': {
          tip : 'Stop timer'
        , fn  : _stopPomo
        , icon: 'started'
        , id  : 1
    } 
};
var STATE  = STATES.STOPPED;

var mainWindow = null;
var appIcon    = null;
var menu       = null;
var tmpl       = [{
    label: STATES[STATE],
    click: _startPomo
}];
var DEFAULT_MENU = [{ type: 'separator' }, { click: app.quit, label: 'Quit' }];
// Quit when all windows are closed.
app.on('window-all-closed', app.quit);

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', _setupMenu);
