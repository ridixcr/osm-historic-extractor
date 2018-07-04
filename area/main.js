#!/usr/bin/env node

'use strict';

var argv = require('minimist')(process.argv.slice(2));
var fs = require("fs");
var ProgressBar = require('ascii-progress');
var turf = require('@turf/turf');
var numeral = require('numeral');

function readJSON(p) {
    var contents = fs.readFileSync(p);
    return JSON.parse(contents);
}

if (argv._.length > 0) {
    var jsonContentBoundarys = readJSON(argv._[0]);
    var jsonContentPlaces = readJSON(argv._[1]);
    var c1 = jsonContentBoundarys.features.length;
    var c2 = jsonContentPlaces.features.length;

    for (var i = 0; i < c1; i++) {
        var boumdary = jsonContentBoundarys.features[i];
        var name_en = boumdary.properties['NAME_EN'] ? boumdary.properties['NAME_EN'].toLowerCase() : boumdary.properties['NAM_EN_REF'].toLowerCase();

        console.log(name_en +' '+ (numeral(turf.area(boumdary) / 1000000).format('0.00')+' Km2'));
//        for(var j=0;j<c2;j++){          
//            var item2 = jsonContentPlaces.features[j];



//            var ref_name_en = item2.properties['name:en'].toLowerCase().trim();
//            if(ref_name_en==='Palmyra'){
//                console.log(ref_name_en);
//                if(ref_name_en.indexOf(name_en)){
//                    //console.log(name_en);
//                }
//            }else{
////                ref_name_en = item2.properties['int_name'].toLowerCase().trim();
////                console.log(name_en);
////                if(ref_name_en.indexOf(name_en)){
////                    console.log(name_en);
////                }
//            }            
        //}
    }

} else {
    console.log('\x1b[36m%s\x1b[0m', 'Without parameters Usually :');
    console.log('\x1b[33m%s\x1b[0m', 'node convert.js input.geojson');
}