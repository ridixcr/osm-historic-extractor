#!/usr/bin/env node

'use strict';

const argv = require('minimist')(process.argv.slice(2));
const fs = require("fs");
const request = require("request");
const parser = require('xml2json');

var jsonMembers = readJSON("data_team.json");

var api = 'https://www.openstreetmap.org/api/0.6/';

function readJSON(p){
    var contents = fs.readFileSync(p);
    return JSON.parse(contents);
}

function isDataTeamMember(user) {
    for (var i = 0; i < jsonMembers.members.length; i++) {
        if (user.startsWith(jsonMembers.members[i].user)) {
            return true;
        }
    }
    return false;
}

function getData(url, callback) {
    request.get(url, (error, response, body) => {
        if (error) {
            callback(null);
        } else {
            callback(body);
        }
    });
}
function getDataJSON(url, callback) {
    getData(url, (data) => {
        if (data != null) {
            callback(JSON.parse(body));
        } else {
            callback({});
        }
    });
}
function getDataXML2JSON(url, callback) {
    getData(url, (data) => {
        if (data != null) {
            callback(JSON.parse(parser.toJson(data)));
        } else {
            callback({});
        }
    });
}

function getOSMObject(data, ref) {
    if (data.osm != undefined) {
        if (ref.startsWith("node")) {
            return data.osm.node;
        } else if (ref.startsWith("way")) {
            return data.osm.way;
        } else if (ref.startsWith("relation")) {
            return data.osm.relation;
        }
    } else {
        return {};
    }
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

function getFirstVertion(url, ref, item, callback) {
    getDataXML2JSON(url + ref, (data1) => {
        var osm_data = getOSMObject(data1, ref);
        if (osm_data.version > 1) {
            getDataXML2JSON(url + ref + '/1', (data2) => {
                osm_data = getOSMObject(data2, ref);
                callback({ id: osm_data.id, version: osm_data.version, type: getObjectType(ref), user: osm_data.user, changeset: osm_data.changeset }, item);
            });
        } else {
            callback({ id: osm_data.id, version: osm_data.version, type: getObjectType(ref), user: osm_data.user, changeset: osm_data.changeset }, item);
        }
    });
}

var community_data = {
    'type': 'FeatureCollection',
    'timestamp': '2018-03-01T20:37:02Z',
    'features': []
};

//https://stackoverflow.com/questions/38558989/node-js-heap-out-of-memory

// MAIN
// export NODE_OPTIONS=--max_old_space_size=4096

(function () {
    if (argv._.length===2) { 
        var jsonContent = readJSON(argv._[0]);
        for (var i = 0; i < jsonContent.features.length; i++) {
            var item = jsonContent.features[i];
            var ref = item.properties['@id'];
            getFirstVertion(api, ref, item, (data, item_ref) => {
                if (!isDataTeamMember(data.user)) {
                    community_data.features.push(item_ref);
                    fs.writeFileSync(argv._[1], JSON.stringify(community_data));
                }
            });
        }
        console.log('\x1b[32m', 'Process...'); 
    } else{
        console.log('Without parameters Usually :');  
        //console.log('\x1b[36m%s\x1b[0m', 'Without parameters Usually :'); 
        console.log('\x1b[33m%s\x1b[0m', 'node index.js input.geojson output.geojson');  
    }
})();