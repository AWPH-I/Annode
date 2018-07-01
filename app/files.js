const path = require("path");
const fs = require("fs");
const Config = require('electron-config');

const Files = {
    emulatorsLocation: "./Emulators",
    config: new Config()
};

Files.getRomPath = function(gameConsole, game) {
    if(!fs.existsSync(Files.emulatorsLocation + "/" + gameConsole + "/roms/" + game)) return null;

    var cont = fs.readdirSync(Files.emulatorsLocation + "/" + gameConsole + "/roms/" + game);
    for(var i = 0; i < cont.length; i ++) {
        if(cont[i].split(".")[0] === "rom") return Files.emulatorsLocation + "/" + gameConsole + "/roms/" + game + "/" + cont[i];
    }
};

Files.reloadConfig = function(scraperMode) {
    if(Files.config.get('emulatorsLocation') == null || Files.config.get('emulatorsLocation') === "") {
        alert('Emulators location is not set please set it in the config section of the F3 dev menu');
    }

    Files.emulatorsLocation = Files.config.get('emulatorsLocation');

    if(!scraperMode) {
        Core.emulatorWheel = Files.getEmulators();
    }
};

Files.getEmulatorPath = function(gameConsole) {
    if(!fs.existsSync(Files.emulatorsLocation + "/" + gameConsole + "/emulator")) return null;

    var cont = fs.readdirSync(Files.emulatorsLocation + "/" + gameConsole + "/emulator");
    for(var i = 0; i < cont.length; i ++) {
        if(cont[i].split(".")[1] === "exe") return Files.emulatorsLocation + "/" + gameConsole + "/emulator/" + cont[i];
    }
}

// Used to create Core.emulatorWheel, currently a large memory hog - maybe cut down by dynamically loading metadata etc. by reading files on the fly
// This will: slow runtime, speed up loadtime and reduce ram usage
Files.getEmulators = function() {
    var emulators = fs.readdirSync(Files.emulatorsLocation);
    for(var i = 0; i < emulators.length; i ++) {
        emulators[i] = new String(emulators[i]);
        if(fs.existsSync(Files.emulatorsLocation + "/" + emulators[i] + "/roms")) {
            var roms = fs.readdirSync(Files.emulatorsLocation + "/" + emulators[i] + "/roms");
            emulators[i].roms = [];
            for(var j = 0; j < roms.length; j ++) {
                emulators[i].roms[j] = {};
                emulators[i].roms[j].media = Files.emulatorsLocation + "/" + emulators[i] + "/roms/" + roms[j] + "/media.png";
                if(fs.existsSync(Files.emulatorsLocation + "/" + emulators[i] + "/roms/" + roms[j] + "/metadata.json")) {
                    emulators[i].roms[j].metadata = JSON.parse(fs.readFileSync(Files.emulatorsLocation + "/" + emulators[i] + "/roms/" + roms[j] + "/metadata.json"));
                } else {
                    //Return default object in case of deleted metadata.json for whatever reason
                    emulators[i].roms[j].metadata = {description:"No description available...", developer:"???", release:"???", players:"???", genres:"???", title:"???"};
                }
            }
        }
    }
    return emulators;
};

Files.getConfig = function(gameConsole) {
    var path = Files.getEmulatorPath(gameConsole);
    if(path != null) {
        path = path.split(gameConsole)[0] + gameConsole + "/config.json";
        try {
            return JSON.parse(fs.readFileSync(path));
        } catch (e) {
            //Returns a default object
            return {cliArgs:[], waitTime:500};
        }
    }
};
