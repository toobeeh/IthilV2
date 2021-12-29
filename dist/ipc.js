"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IthilIPCClient = exports.IthilIPCServer = exports.ipcEvents = void 0;
const node_ipc_1 = require("node-ipc");
// extract the type of an ipc client... yeah, ugly hack
let ipcAbused = new node_ipc_1.IPC().of[""];
exports.ipcEvents = Object.freeze({
    workerConnect: "workerConnect",
    workerDisconnect: "socket.disconnected",
    updateBalance: "updatePortBalance",
    publicData: "publicData",
    activeLobbies: "activeLobbies"
});
/**
 * Abstract IPC class with common config
 * @abstract
 */
class IthilIPC {
    constructor(id) {
        this.ipc = new node_ipc_1.IPC();
        this.ipc.config.id = id;
        this.ipc.config.silent = true;
        this.ipc.config.retry = 1500;
    }
}
/**
 * All IPC events
 */
IthilIPC.events = exports.ipcEvents;
/**
 * The Ithil IPC server that listens for worker events and broadcasts data that is to be shared with the workers
 */
class IthilIPCServer extends IthilIPC {
    /**
     * Create a new ithil worker ipc server
     * @param id The ID of the ipc server
     */
    constructor(id) {
        super(id);
        this.ipc.serve(() => {
            // listen to disconnect event
            this.ipc.server.on(exports.ipcEvents.workerDisconnect, (socket, socketID) => {
                // execute with timeout because of reasons i simply forgot
                setTimeout(() => {
                    if (this.workerDisconnected)
                        this.workerDisconnected(socket, socketID);
                }, 100);
            });
            // listen to predefined events and make callbacks easy to set
            this.on(exports.ipcEvents.workerConnect, (data, socket) => {
                if (this.workerConnected)
                    this.workerConnected(data, socket);
            });
            this.on(exports.ipcEvents.updateBalance, (data, socket) => {
                if (this.balanceChanged)
                    this.balanceChanged(data, socket);
            });
        });
        this.ipc.server.start();
        // init predefined broadcast functions
        this.broadcastPublicData = (data) => this.broadcast(exports.ipcEvents.publicData, data);
        this.broadcastActiveLobbies = (data) => this.broadcast(exports.ipcEvents.activeLobbies, data);
    }
    /**
     * Broadcast an event to all connected ipc sockets
     * @param event The event name
     * @param data The data object
     */
    broadcast(event, data) {
        this.ipc.server.broadcast(event, data);
    }
    /**
     * Listen for an event
     * @param event The event name
     * @param callback The event callback, arguments being the received event data and the event source socket
     */
    on(event, callback) {
        this.ipc.server.on(event, callback);
    }
}
exports.IthilIPCServer = IthilIPCServer;
/**
 * An Ithil IPC client that listens for server events and occasionally communicates with it
 */
class IthilIPCClient extends IthilIPC {
    /**
     * Create a new ithil client ipc socket
     * @param id The ID of the ipc socket
     */
    constructor(id) {
        super(id);
        this.server = null;
    }
    /**
     * Connects thsi socket to the ipc main server
     * @param serverID The ID of the ipc server to connect
     * @param workerPort The socketio port of this worker
     * @returns A promise that resolves as soon as the ipc socket is connected
     */
    async connect(serverID, workerPort) {
        return new Promise((resolve, reject) => {
            setTimeout(() => reject(), 15000);
            // connect to server
            this.ipc.connectTo(serverID, () => {
                this.server = this.ipc.of[serverID];
                // say hello and tell server which port is in use
                const eventdata = { port: workerPort };
                this.emit(exports.ipcEvents.workerConnect, eventdata);
                // init predefined emits
                this.updatePortBalance = (data) => this.emit(exports.ipcEvents.updateBalance, data);
                resolve();
            });
        });
    }
    /**
     * Emits an event to the ipc main server
     * @param event The event name
     * @param data The event data
     */
    emit(event, data) {
        if (this.server) {
            this.server.emit(event, data);
        }
        else
            throw new Error("IPC client is not connected to any server.");
    }
    /**
     * Listens for an event from the ipc main server
     * @param event The event name
     * @param callback The event callback, arguments being the received event data and the event source socket
     */
    on(event, callback) {
        if (this.server) {
            this.server.on(event, callback);
        }
        else
            throw new Error("IPC client is not connected to any server.");
    }
}
exports.IthilIPCClient = IthilIPCClient;
