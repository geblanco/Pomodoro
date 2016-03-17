'use strict';

// Modules
var Canvas = require('canvas')
var fs     = require('fs');
var upath  = require('upath');

// Constants
var DIM = { width : 24, border : 1.3, font : 14 };
var COLOR = { name: 'red' , light: '#ec9a97', text:'#912521' , border:'#e13d35' };

// {name: 'grey' , light: '#97a1a9', text:'#353b43' , border:'#384a59'}

// Export module
module.exports = function( tmp, txt, callback ){

    var path = upath.join(tmp, 'tmpIcons', txt + '.png');

    fs.stat( path, function( err, stat ){

        // Icon exist, return it
        if( !err ){
            return callback( null, path );
        }
        // ENOENT, generate and return it

        var canvas = new Canvas( DIM.width, DIM.width );
        var ctx    = canvas.getContext('2d');

        ctx.beginPath();
        ctx.arc( DIM.width / 2, DIM.width / 2, ( DIM.width / 2) - Math.floor( DIM.border ), 0, 2 * Math.PI, false);
        ctx.fillStyle = COLOR.light;
        ctx.fill();
        ctx.lineWidth = Math.floor( DIM.border );
        ctx.strokeStyle = COLOR.border;
        ctx.stroke();

        ctx.font = DIM.font + 'px Lato';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = COLOR.text;
        ctx.fillText( txt, DIM.width / 2, DIM.width / 2 );

        canvas.toBuffer( function( error, buffer ){
            
            fs.writeFile( path, buffer, function(){
              
                callback( null, path );
            
            });

        });
        
    });

};