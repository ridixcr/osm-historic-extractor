const fs = require("fs");
const path = require('path');
const node_xj = require("xls-to-json");
var xls_input = 'leisure.xls';
var json_output = 'leisure.json';
var preformat_json_output = 'formated_leisure.json';

//Tiflis
//https://www.openstreetmap.org/relation/4479704

var stats = { leisures: [] };

function convert() {
    node_xj({
        input: xls_input,
        output: json_output,
        sheet: "leisure"
    }, function (err, result) {
        if (err) {
            console.error(err);
        } else {
            var data = {
                osm_tag: 'leisure',
                wiki: 'https://wiki.openstreetmap.org/wiki/Key:leisure',
                values: result
            };
            fs.writeFileSync(preformat_json_output, JSON.stringify(data));
        }
    });
}

function readJSON(p) {
    var contents = fs.readFileSync(p);
    return JSON.parse(contents);
}

function getObjectType(ref) {
    if (ref.startsWith("node")) {
        return 'node';
    } else if (ref.startsWith("way")) {
        return 'node';
    } else if (ref.startsWith("relation")) {
        return 'node';
    }
}

var leisureDataWiki = readJSON("formated_leisure.json");


function validarTag(tag) {
    var leisure_data_wiki = leisureDataWiki.values;
    for (var i = 0; i < leisure_data_wiki.length; i++) {
        var value = leisure_data_wiki[i].Value;
        if (value.startsWith(tag)) {
            return value;
        }
    }
    return tag;//tag que no esta en la wiki
}
//https://gist.github.com/ralphcrisostomo/3141412
function compress(original) {
    var compressed = [];
    var copy = original.slice(0);
    for (var i = 0; i < original.length; i++) {
        var myCount = 0;
        for (var w = 0; w < copy.length; w++) {
            if (original[i] == copy[w]) {
                myCount++;
                delete copy[w];
            }
        }
        if (myCount > 0) {
            var a = new Object();
            a.value = original[i];
            a.count = myCount;
            compressed.push(a);
        }
    }
    return compressed;
};

function makeStats() {
    var jsonData = readJSON("Tiflis_Leisure.geojson");
    jsonData = readJSON("Tiflis_Leisure_areas_formated.geojson");

    // 757
    var leisure_data = jsonData.features;
    for (var i = 0; i < leisure_data.length; i++) {
        if (leisure_data[i].properties.leisure != undefined) {
            var item = validarTag(leisure_data[i].properties.leisure);
            if (item != null) {
                stats.leisures.push(item);
            }
        } //else {console.log(leisure_data[i].properties);//node}

    }
    var sumary = compress(stats.leisures),
        sum = 0;

    for (var i = 0; i < sumary.length; i++) {
        sum += sumary[i].count;
    }
    sumary = {
        ref: 'Leisures for value',
        stats: sumary
    };
    fs.writeFileSync('leisure_tiflis_stats.json', JSON.stringify(sumary));
    //console.log(sumary);
    console.log(sum);
    console.log(jsonDataAreas.features.length);
}

function ensureDirectoryExistence(filePath) {
    var dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
}

function splitLeisure() { 

    var t = readJSON('leisure_tiflis_stats.json');
    var template_geojson = {
        'type': 'FeatureCollection',
        'timestamp': '2018-03-02T20:37:02Z',
        'features': []
    };
    ensureDirectoryExistence('leisure');
    for (var i = 0; i < t.stats.length; i++) {
        fs.writeFileSync('leisure/' + t.stats[i].value + '.geojson', JSON.stringify(template_geojson));
    }

    var jsonData = readJSON("Tiflis_Leisure_areas_formated.geojson");
    var ltw = [];

    var leisure_data = jsonData.features;
    for (var i = 0; i < leisure_data.length; i++) {
        if (leisure_data[i].properties.leisure != undefined) {
            var item = validarTag(leisure_data[i].properties.leisure);
            if (item != null) {
                stats.leisures.push(item);
            }
        } 

    }


}

//makeStats();
splitLeisure();

