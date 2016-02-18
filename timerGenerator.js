// Modules
var async  = require('async');
var Canvas = require('canvas')
var fs     = require('fs');
var uuid  = require('node-uuid');

// Constats
var COLORS = [
  {name: 'blue' , light: '#a6d2fa', text:'#2a77ad' , border:'#1664a5'},
  {name: 'green' , light: '#badb95', text:'#306e0d' , border:'#3c7919'},
  {name: 'purple' , light: '#d8ccf1', text:'#9064e1' , border:'#6742aa'},
  {name: 'orange' , light: '#f7c97e', text:'#b45d1f' , border:'#f68738'},
  {name: 'brown' , light: '#b2a59d', text:'#5a4638' , border:'#6e5646'},
  {name: 'green2' , light: '#8cd0b3', text:'#0a5a36' , border:'#128a54'},
  {name: 'red' , light: '#ec9a97', text:'#912521' , border:'#e13d35'},
  {name: 'pink' , light: '#f7beec', text:'#9c4ba5' , border:'#b44b9f'},
  {name: 'grey' , light: '#97a1a9', text:'#353b43' , border:'#384a59'},
  {name: 'yellow' , light: '#fbe27d', text:'#84740b' , border:'#ffb400'}
];

var DIMENSIONS = [
  { width : 32, border : 1.3, font : 14 },
  { width : 64, border : 2.6, font : 28 },
  { width : 128, border : 5.3, font : 56 },
  { width : 256, border : 10.6, font : 112 },
  { width : 512, border : 21.3, font : 224 }
];

// Export module
module.exports = function( userId, name, surname, callback ){

  var color   = COLORS[ userId % COLORS.length ]
  var tmpPath = environment.tmpPath + 'ua' + userId + ':' + uuid.v4();

  async.map(

    DIMENSIONS,
    function( data, callback ){

      var canvas = new Canvas( data.width, data.width );
      var ctx    = canvas.getContext('2d');

      ctx.beginPath();
      ctx.arc( data.width / 2, data.width / 2, ( data.width / 2) - Math.floor( data.border ), 0, 2 * Math.PI, false);
      ctx.fillStyle = color.light;
      ctx.fill();
      ctx.lineWidth = Math.floor( data.border );
      ctx.strokeStyle = color.border;
      ctx.stroke();

      ctx.font = data.font + 'px Lato';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = color.text;
      ctx.fillText( name[ 0 ].toUpperCase() + surname[ 0 ].toUpperCase(), data.width / 2, data.width / 2 );

      canvas.toBuffer( function( error, buffer ){

        fs.writeFile( tmpPath + '_' + data.width, buffer, function(){
          callback( null, tmpPath + '_' + data.width );
        });

      });

    },
    function( error, list ){
      callback( error, list );
    }

  );

};