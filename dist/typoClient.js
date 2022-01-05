"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const threads_1 = require("threads");
/**
 * Manage dataflow and interactions with a client accessing from typo
 */
class TypoClient {
    /**
     * Init a new client with all member-related data and bound events
     */
    constructor(socket, dbWorker, memberInit, workerCache) {
        /** The interval in which the current playing status is processed */
        this.updateStatusInterval = undefined;
        this.typosocket = socket;
        this.databaseWorker = dbWorker;
        this.workerCache = workerCache;
        this.username = memberInit.member.UserName;
        this.login = memberInit.member.UserLogin;
        // init events 
        this.typosocket.subscribeDisconnect(this.onDisconnect.bind(this));
        this.typosocket.subscribeGetUserEvent(this.getUser.bind(this));
        this.typosocket.subscribeSetSlotEvent(this.setSpriteSlot.bind(this));
        this.typosocket.subscribeSetComboEvent(this.setSpriteCombo.bind(this));
        this.typosocket.subscribeJoinLobbyEvent(this.joinLobby.bind(this));
        this.typosocket.subscribeSetLobbyEvent(this.setLobby.bind(this));
        this.typosocket.subscribeLeaveLobbyEvent(this.leaveLobby.bind(this));
        this.typosocket.subscribeSearchLobbyEvent(this.searchLobby.bind(this));
        // init report data 
        this.reportData = {
            currentStatus: "idle",
            nickname: this.username,
            joinedLobby: undefined,
            reportLobby: undefined,
            updateInterval: setInterval(this.updateStatus.bind(this), 2500)
        };
        console.log(this.username + " logged in");
    }
    /** Get the authentificated member */
    get member() {
        return new Promise(async (resolve) => {
            resolve((await this.databaseWorker.getUserByLogin(Number(this.login))).result);
        });
    }
    /** Get the member's current sprite slots */
    get spriteSlots() {
        return new Promise(async (resolve) => {
            const member = await this.member;
            const flags = await this.flags;
            let slots = 1;
            slots += Math.floor(member.drops / 1000);
            if (flags.patron)
                slots++;
            if (flags.admin)
                slots += 100;
            resolve(slots);
        });
    }
    /** Get the member's current sprite inventory */
    get spriteInventory() {
        return new Promise(async (resolve) => {
            const inv = await this.member;
            const sprites = inv.sprites.split(",").map(item => {
                return {
                    slot: item.split(".").length - 1,
                    id: Number(item.replace(".", ""))
                };
            });
            resolve(sprites);
        });
    }
    /** Get the authentificated member's flags */
    get flags() {
        return new Promise(async (resolve) => {
            // get flags - convert integer to bit
            const flags = (await this.member).flags;
            const flagArray = ("00000000" + (flags >>> 0).toString(2)).slice(-8).split("")
                .map(f => Number(f)).reverse();
            // parse array to interface
            resolve({
                bubbleFarming: flagArray[0] == 1,
                admin: flagArray[1] == 1,
                moderator: flagArray[2] == 1,
                unlimitedCloud: flagArray[3] == 1,
                patron: flagArray[4] == 1,
                permaBan: flagArray[5] == 1,
                dropBan: flagArray[6] == 1,
                patronizer: flagArray[7] == 1,
            });
        });
    }
    /**
     * Handler for a disconnect event
     * @param reason Socketio disconnect reason
     */
    async onDisconnect(reason) {
        await threads_1.Thread.terminate(this.databaseWorker);
    }
    /**
     * Handler for get user event
     * @returns Event response data containing user, flags and slots
     */
    async getUser() {
        const data = {
            user: await this.member,
            flags: await this.flags,
            slots: await this.spriteSlots
        };
        return data;
    }
    /**
     * Handler for set slot event
     * @param eventdata Eventdata conaining slot and sprite id
     * @returns Response data containing updated user, flags and slots
     */
    async setSpriteSlot(eventdata) {
        const slots = await this.spriteSlots;
        const currentInv = await this.spriteInventory;
        const flags = await this.flags;
        // check if slot is valid and sprite is owned
        if (flags.admin || slots >= eventdata.slot && eventdata.slot > 0 && currentInv.some(inv => inv.id == eventdata.sprite)) {
            // disable old slot sprite and activate new - if new is special, disable old special
            const targetIsSpecial = this.isSpecialSprite(eventdata.sprite);
            currentInv.forEach(prop => {
                if (prop.slot == eventdata.slot)
                    prop.slot = 0;
                else if (targetIsSpecial && prop.slot > 0 && this.isSpecialSprite(prop.id))
                    prop.slot = 0;
                else if (prop.id == eventdata.sprite)
                    prop.slot = eventdata.slot;
            });
            const newInv = currentInv.map(prop => ".".repeat(prop.slot) + prop.id).join(",");
            await this.databaseWorker.setUserSprites(Number(this.login), newInv);
        }
        // return updated data
        const data = {
            user: await this.member,
            flags: flags,
            slots: slots
        };
        return data;
    }
    /**
     * Handler for set combo event
     * @param eventdata Eventdata containing combo string comma-separated and dots indicating slot
     * @returns Response data containing updated user, flags and slots
     */
    async setSpriteCombo(eventdata) {
        const combo = eventdata.combostring.split(",").map(slot => {
            return {
                id: Number(slot.replace(".", "")),
                slot: slot.split(".").length - 1
            };
        });
        const currentInv = await this.spriteInventory;
        const slots = await this.spriteSlots;
        const flags = await this.flags;
        // validate combo - if there are no sprites in the combo which are not in the inventory, and max slot is valid
        const spritesValid = !combo.some(comboSprite => !currentInv.some(invSprite => invSprite.id == comboSprite.id));
        const maxSlotValid = Math.max.apply(Math, combo.map(slot => slot.slot)) <= slots;
        // change combo only if full combo is valid, else abort *all*
        if (flags.admin || maxSlotValid && spritesValid) {
            const newInv = [];
            currentInv.forEach(sprite => {
                const spriteInCombo = combo.find(comboSprite => comboSprite.id == sprite.id);
                if (spriteInCombo)
                    newInv.push(spriteInCombo);
                else
                    newInv.push({ id: sprite.id, slot: 0 });
            });
            const newInvString = newInv.map(prop => ".".repeat(prop.slot) + prop.id).join(",");
            await this.databaseWorker.setUserSprites(Number(this.login), newInvString);
        }
        // return updated data
        const data = {
            user: await this.member,
            flags: flags,
            slots: slots
        };
        return data;
    }
    async joinLobby(eventdata) {
        this.reportData.currentStatus = "playing";
        const key = eventdata.key;
        let success = false;
        let lobby = {};
        const lobbyResult = await this.databaseWorker.getLobby(key, "key");
        // create new lobby if none found for key, but query succeeded
        if (!lobbyResult.result.found || !lobbyResult.result.lobby) {
            if (lobbyResult.success) {
                const newLobbyResult = await this.databaseWorker.setLobby(Date.now().toString(), key);
                // if new lobby was successfully added, get it
                if (newLobbyResult) {
                    const createdLobbyResult = await this.databaseWorker.getLobby(key, "key");
                    if (createdLobbyResult.success && createdLobbyResult.result.found && createdLobbyResult.result.lobby) {
                        lobby = createdLobbyResult.result.lobby;
                        this.reportData.joinedLobby = lobby;
                        success = true;
                    }
                }
            }
        }
        else {
            lobby = lobbyResult.result.lobby;
            this.reportData.joinedLobby = lobby;
            success = true;
        }
        // return found or created lobby
        const response = {
            lobbyData: lobby,
            valid: success
        };
        return response;
    }
    async setLobby(eventdata) {
        let owner = false;
        let ownerID = 0;
        let updatedLobby = {};
        if (this.reportData.joinedLobby) {
            this.reportData.reportLobby = eventdata.lobby;
            const cached = this.reportData.joinedLobby;
            console.log(cached);
            // get owner 
            const senderID = eventdata.lobby.Players.find(player => player.Sender)?.LobbyPlayerID;
            if (senderID) {
                const ownerResult = await this.databaseWorker.isPalantirLobbyOwner(eventdata.lobby.ID, senderID);
                if (ownerResult.success && ownerResult.result.owner != null && ownerResult.result.ownerID != null) {
                    owner = ownerResult.result.owner;
                    ownerID = ownerResult.result.ownerID;
                }
            }
            // if key, description, restriction differ from last cached lobby
            if (cached.Key != eventdata.lobbyKey || cached.Description != eventdata.description || cached.Restriction != eventdata.restriction) {
                // update lobby data
                let restriction = "unrestricted";
                let description = "";
                let key = eventdata.lobbyKey;
                if (owner) {
                    restriction = eventdata.restriction;
                    description = eventdata.description;
                }
                else {
                    const currentLobby = (await this.databaseWorker.getLobby(this.reportData.joinedLobby.ID, "id")).result.lobby;
                    if (currentLobby) {
                        restriction = currentLobby.Restriction;
                        description = currentLobby.Description;
                    }
                }
                await this.databaseWorker.setLobby(this.reportData.joinedLobby.ID, key, restriction, description);
            }
            const updatedLobbyResult = (await this.databaseWorker.getLobby(this.reportData.joinedLobby.ID, "id")).result.lobby;
            if (updatedLobbyResult) {
                updatedLobby.ID = updatedLobbyResult.ID;
                updatedLobby.Key = updatedLobbyResult.Key;
                updatedLobby.Restriction = updatedLobbyResult.Restriction;
                updatedLobby.Description = updatedLobbyResult.Description;
                this.reportData.joinedLobby = updatedLobby;
            }
        }
        // return updated lobby
        const response = {
            lobbyData: {
                lobby: updatedLobby
            },
            owner: owner,
            ownerID: ownerID
        };
        return response;
    }
    async searchLobby(eventdata) {
        if (eventdata.waiting)
            this.reportData.currentStatus = "waiting";
        else
            this.reportData.currentStatus = "searching";
        this.reportData.nickname = eventdata.userName;
    }
    async leaveLobby() {
        this.reportData.currentStatus = "idle";
        this.reportData.joinedLobby = undefined;
        this.reportData.reportLobby = undefined;
        const guilds = (await this.member).member.Guilds;
        const response = {
            activeLobbies: this.workerCache.activeLobbies.filter(guildLobby => guilds.some(guild => guild.GuildID == guildLobby.guildID))
        };
        return response;
    }
    /**
     * Write a report for the socket's current report data:
     * - **idle**: nothing
     * - **searching, playing**: write status in db
     * - **playing**: write status in db, write lobby report in db
     */
    async updateStatus() {
        const statusIsAnyOf = (...statusNames) => statusNames.indexOf(this.reportData.currentStatus) >= 0;
        const currentMember = (await this.member).member;
        // set playing room definitely only if currently playing
        if (this.reportData.currentStatus == "playing") {
            if (!this.typosocket.socket.rooms.has("playing"))
                this.typosocket.socket.join("palying");
        }
        else {
            if (this.typosocket.socket.rooms.has("playing"))
                this.typosocket.socket.leave("palying");
        }
        if (statusIsAnyOf("playing")) {
            // write lobby report for each guild and set playing status
            if (this.reportData.reportLobby && this.reportData.joinedLobby) {
                // create a template report lobby where only ID and observe token have to be changed per guild
                const guildReportTemplate = {
                    GuildID: "",
                    ObserveToken: 0,
                    Description: this.reportData.joinedLobby.Description,
                    Key: this.reportData.joinedLobby.Key,
                    ID: this.reportData.joinedLobby.ID,
                    Restriction: this.reportData.joinedLobby.Restriction,
                    Players: this.reportData.reportLobby.Players,
                    Language: this.reportData.reportLobby.Language,
                    Private: this.reportData.reportLobby.Private,
                    Link: this.reportData.reportLobby.Link
                };
                // create guild-specific lobby and write to db
                const guildReportLobbies = [];
                (await this.member).member.Guilds.forEach(guild => {
                    const templateClone = { ...guildReportTemplate };
                    templateClone.ObserveToken = guild.ObserveToken;
                    templateClone.GuildID = guild.GuildID;
                    guildReportLobbies.push(templateClone);
                });
                await this.databaseWorker.writeReport(guildReportLobbies);
                // write player status to db
                const lobbyPlayerID = guildReportTemplate.Players.find(player => player.Sender)?.LobbyPlayerID;
                const status = {
                    PlayerMember: currentMember,
                    Status: this.reportData.currentStatus,
                    LobbyID: guildReportTemplate.ID,
                    LobbyPlayerID: (lobbyPlayerID ? lobbyPlayerID : 0).toString()
                };
                await this.databaseWorker.writePlayerStatus(status, this.typosocket.socket.id);
            }
        }
        else if (statusIsAnyOf("searching", "waiting")) {
            // write searching or waiting status
            currentMember.UserName = this.reportData.nickname;
            const status = {
                PlayerMember: currentMember,
                Status: this.reportData.currentStatus,
                LobbyID: "",
                LobbyPlayerID: ""
            };
            await this.databaseWorker.writePlayerStatus(status, this.typosocket.socket.id);
        }
        else if (statusIsAnyOf("idle")) {
            // do nothing. user is idling. yay.
        }
    }
    /**
     * Check if a sprite is special (replaces avatar)
     * @param spriteID The id of the target sprite
     * @returns Indicator if the sprite is special
     */
    isSpecialSprite(spriteID) {
        const result = this.workerCache.publicData.sprites.find(sprite => sprite.ID == spriteID);
        if (result && result.Special)
            return true;
        else
            return false;
    }
}
exports.default = TypoClient;
//# sourceMappingURL=typoClient.js.map