const argv = require('minimist')(process.argv.slice(2));
const fs = require("fs");

function readJSON(p){
    var contents = fs.readFileSync(p);
    return JSON.parse(contents);
}

(function () {
    if (argv._.length===1) { 
        var jsonContent = readJSON(argv._[0]);
        var c = jsonContent.features.length;        
        for (var i = 0; i < c; i++) {
            var item = jsonContent.features[i];
            if(item.geometry['type']==='LineString'){                
                item.geometry['type']='Polygon';
                item.geometry['coordinates']=[item.geometry['coordinates']];
            }    
            console.log(parseInt((100*(i+1))/c)+' %');        
        }
        fs.writeFileSync('f_'+argv._[0], JSON.stringify(jsonContent));
        console.log('\x1b[32m', 'Complete!'); 
    } else{ 
        console.log('\x1b[36m%s\x1b[0m', 'Without parameters Usually :'); 
        console.log('\x1b[33m%s\x1b[0m', 'node convert.js input.geojson');  
    }
})();