"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventNames = exports.TypoClientSocket = exports.IthilSocketioServer = void 0;
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const socket_io_1 = require("socket.io");
class IthilSocketioServer {
    /**
     * Init https & express and start the socketio server
     * @param port The socketio port
     * @param certPath The path to the SSL certificate
     */
    constructor(port, certPath) {
        // Start the https server with cors on main port
        const mainExpress = (0, express_1.default)();
        mainExpress.use((0, cors_1.default)());
        const mainServer = https_1.default.createServer({
            key: fs_1.default.readFileSync(certPath + '/privkey.pem', 'utf8'),
            cert: fs_1.default.readFileSync(certPath + '/cert.pem', 'utf8'),
            ca: fs_1.default.readFileSync(certPath + '/chain.pem', 'utf8')
        }, mainExpress);
        this.server = new socket_io_1.Server(mainServer, {
            cors: {
                origin: "*",
                methods: ["GET", "POST", "OPTIONS"]
            },
            pingTimeout: 20000
        });
        // start listening 
        mainServer.listen(port);
    }
}
exports.IthilSocketioServer = IthilSocketioServer;
class TypoClientSocket {
    constructor(socket) {
        this.socket = socket;
    }
    subscribeEventAsync(eventName, handler, withResponse = true, once = false) {
        (once ? this.socket.once : this.socket.on)(eventName, async (incoming, socket) => {
            const response = await handler(incoming);
            if (withResponse)
                socket.emit(eventName + " response", response);
        });
    }
    async emitEventAsync(eventName, outgoingData, withResponse = true, unique = false, timeout = 15000) {
        if (unique)
            eventName = eventName + "@" + Date.now();
        const promise = new Promise((resolve, reject) => {
            if (withResponse) {
                this.socket.once(eventName, (data) => {
                    resolve(data);
                });
                setTimeout(() => reject("Timed out"), timeout);
            }
            else
                resolve({});
        });
        this.socket.emit(eventName, outgoingData);
        return promise;
    }
    emitPublicData(data) {
        this.emitEventAsync(exports.eventNames.publicData, data, false);
    }
    subscribeDisconnect(handler) {
        this.socket.on("disconnect", handler);
    }
    subscribeLoginEvent(handler) {
        this.subscribeEventAsync(exports.eventNames.login, handler, true, true);
    }
}
exports.TypoClientSocket = TypoClientSocket;
//interfaces and eventdata for client connection
exports.eventNames = Object.freeze({
    onlineSprites: "online sprites",
    activeLobbies: "active lobbies",
    publicData: "public data",
    newDrop: "new drop",
    clearDrop: "clear drop",
    rankDrop: "rank drop",
    login: "login"
});
