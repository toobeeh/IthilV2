"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const threads_1 = require("threads");
const palantirDatabase_1 = __importDefault(require("./palantirDatabase"));
/**
 * Interface to provide worker access to the database
 */
let database;
let debug = false;
let diffToTsd = Date.now() % 10000;
setTimeout(() => {
    setInterval(() => {
        console.log("Worker of " + process.pid + " with " + (Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100) + "MB heap");
    }, 10000);
}, 10000 - diffToTsd);
const palantirDatabaseWorker = {
    /** Inits a {@link PalantirDatabase} in a worker*/
    init(path, _debug = false) {
        database = new palantirDatabase_1.default(path);
        debug = _debug;
    },
    /** Closes a {@link PalantirDatabase} in a worker*/
    close() {
        if (!database)
            throw new Error("Database is not initialized.");
        database.close();
    },
    /** Executes {@link PalantirDatabase.clearVolatile} in a worker*/
    clearVolatile() {
        if (debug) { // debug memory leak
            let s = "" + (new Error()).stack;
            s = s.substring(s.indexOf("at") + 2);
            console.log(s.substring(0, s.indexOf("at")));
        }
        if (!database)
            throw new Error("Database is not initialized.");
        return database.clearVolatile();
    },
    /** Executes {@link PalantirDatabase.getActiveLobbies} in a worker*/
    getActiveLobbies() {
        if (debug) { // debug memory leak
            let s = "" + (new Error()).stack;
            s = s.substring(s.indexOf("at") + 2);
            console.log(s.substring(0, s.indexOf("at")));
        }
        if (!database)
            throw new Error("Database is not initialized.");
        return database.getActiveLobbies();
    },
    /** Executes {@link PalantirDatabase.getDrop} in a worker*/
    getDrop(id = "") {
        if (debug) { // debug memory leak
            let s = "" + (new Error()).stack;
            s = s.substring(s.indexOf("at") + 2);
            console.log(s.substring(0, s.indexOf("at")));
        }
        if (!database)
            throw new Error("Database is not initialized.");
        return database.getDrop(id);
    },
    /** Executes {@link PalantirDatabase.getLoginFromAccessToken} in a worker*/
    getLoginFromAccessToken(accessToken, silent) {
        if (debug) { // debug memory leak
            let s = "" + (new Error()).stack;
            s = s.substring(s.indexOf("at") + 2);
            console.log(s.substring(0, s.indexOf("at")));
        }
        if (!database)
            throw new Error("Database is not initialized.");
        return database.getLoginFromAccessToken(accessToken, silent);
    },
    /** Executes {@link PalantirDatabase.getLobby} in a worker*/
    getLobby(key, indicator = "key") {
        if (debug) { // debug memory leak
            let s = "" + (new Error()).stack;
            s = s.substring(s.indexOf("at") + 2);
            console.log(s.substring(0, s.indexOf("at")));
        }
        if (!database)
            throw new Error("Database is not initialized.");
        return database.getLobby(key, indicator);
    },
    /** Executes {@link PalantirDatabase.getPublicData} in a worker*/
    getPublicData() {
        if (debug) { // debug memory leak
            let s = "" + (new Error()).stack;
            s = s.substring(s.indexOf("at") + 2);
            console.log(s.substring(0, s.indexOf("at")));
        }
        if (!database)
            throw new Error("Database is not initialized.");
        return database.getPublicData();
    },
    /** Executes {@link PalantirDatabase.getUserByLogin} in a worker*/
    getUserByLogin(login) {
        if (debug) { // debug memory leak
            let s = "" + (new Error()).stack;
            s = s.substring(s.indexOf("at") + 2);
            console.log(s.substring(0, s.indexOf("at")));
        }
        if (!database)
            throw new Error("Database is not initialized.");
        return database.getUserByLogin(login);
    },
    /** Executes {@link PalantirDatabase.isPalantirLobbyOwner} in a worker*/
    isPalantirLobbyOwner(lobbyID, lobbyPlayerID) {
        if (debug) { // debug memory leak
            let s = "" + (new Error()).stack;
            s = s.substring(s.indexOf("at") + 2);
            console.log(s.substring(0, s.indexOf("at")));
        }
        if (!database)
            throw new Error("Database is not initialized.");
        return database.isPalantirLobbyOwner(lobbyID, lobbyPlayerID);
    },
    /** Executes {@link PalantirDatabase.rewardDrop} in a worker*/
    rewardDrop(login, eventdrop) {
        if (debug) { // debug memory leak
            let s = "" + (new Error()).stack;
            s = s.substring(s.indexOf("at") + 2);
            console.log(s.substring(0, s.indexOf("at")));
        }
        if (!database)
            throw new Error("Database is not initialized.");
        return database.rewardDrop(login, eventdrop);
    },
    /** Executes {@link PalantirDatabase.claimDrop} in a worker*/
    claimDrop(lobbyKey, playerName, dropID, userid) {
        if (debug) { // debug memory leak
            let s = "" + (new Error()).stack;
            s = s.substring(s.indexOf("at") + 2);
            console.log(s.substring(0, s.indexOf("at")));
        }
        if (!database)
            throw new Error("Database is not initialized.");
        return database.claimDrop(lobbyKey, playerName, dropID, userid);
    },
    /** Executes {@link PalantirDatabase.setLobby} in a worker*/
    setLobby(id, key, description, restriction) {
        if (debug) { // debug memory leak
            let s = "" + (new Error()).stack;
            s = s.substring(s.indexOf("at") + 2);
            console.log(s.substring(0, s.indexOf("at")));
        }
        if (!database)
            throw new Error("Database is not initialized.");
        return database.setLobby(id, key, description, restriction);
    },
    /** Executes {@link PalantirDatabase.setUserSprites} in a worker*/
    setUserSprites(login, sprites) {
        if (debug) { // debug memory leak
            let s = "" + (new Error()).stack;
            s = s.substring(s.indexOf("at") + 2);
            console.log(s.substring(0, s.indexOf("at")));
        }
        if (!database)
            throw new Error("Database is not initialized.");
        return database.setUserSprites(login, sprites);
    },
    /** Executes {@link PalantirDatabase.writePlayerStatus} in a worker*/
    writePlayerStatus(status, session) {
        if (debug) { // debug memory leak
            let s = "" + (new Error()).stack;
            s = s.substring(s.indexOf("at") + 2);
            console.log(s.substring(0, s.indexOf("at")));
        }
        if (!database)
            throw new Error("Database is not initialized.");
        return database.writePlayerStatus(status, session);
    },
    /** Executes {@link PalantirDatabase.writeReport} in a worker*/
    writeReport(lobbies) {
        if (debug) { // debug memory leak
            let s = "" + (new Error()).stack;
            s = s.substring(s.indexOf("at") + 2);
            console.log(s.substring(0, s.indexOf("at")));
        }
        if (!database)
            throw new Error("Database is not initialized.");
        return database.writeReport(lobbies);
    }
};
(0, threads_1.expose)(palantirDatabaseWorker);
//# sourceMappingURL=palantirDatabaseWorker.js.map