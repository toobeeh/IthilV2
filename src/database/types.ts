/**
 * The result of a database query
 */
 export interface dbResult<Type>{
    /**
     * Indicates whether the query succeeded or failed
     */
    success: boolean,

    /**
     * The query result
     */
    result: Type
}

/**
 * Details of a discord guild that has palantir connected
 */
 export interface discordGuildDetails{
    /**
     * The guild's ID
     */
    GuildID: string,

    /**
     * The guild's Palantir message channel ID
     */
    ChannelID: string,

    /**
     * The guild's Palantir message ID
     */
    MessageID: string,

    /**
     * The guild's Palantir token
     */
    ObserveToken: number,

    /**
     * The guild's name
     */
    GuildName: string,

    /**
     * The guild's post webhooks
     */
    Webhooks: Array<discordWebhook>
}

/**
 * Details of a typo post webhook
 */
 export interface discordWebhook{
    /**
     * The webhook name
     */
    Name: string,

    /**
     * The webhook's guild name
     */
    Guild: string,

    /**
     * The webhook URL
     */
    URL: string
}

/**
 * Details of a discord member, including connected guilds
 */
 export interface memberDiscordDetails{
    /**
     * The user's ID
     */
    UserID: string,

    /**
     * The username
     */
    UserName: string,

    /**
     * The user's login token
     */
    UserLogin: string,

    /**
     * The user's connected guilds
     */
    Guilds: Array<discordGuildDetails>
}

/**
 * A palantir member
 */
 export interface member{
    /**
     * The member's discord details
     */
    member: memberDiscordDetails,

    /**
     * The member's amount of bubbles
     */
    bubbles: number,

    /**
     * The member's amount of bubbles
     */
    sprites: string,
    
    /**
     * The member's amount of caught drops
     */
    drops: number,
    
    /**
     * The member's flags in decimal
     */
    flags: number,

    /**
     * The member's scenes
     */
     scenes: string 

    webhooks: Array<palantirWebhook>;
}

/**
 * A user's access token that is used to login instead login tokens
 * @summary Database Entity of Table `AccessTokens`
 */
export interface accessToken{
    /**
     * The user's access token
     */
    accessToken: string,

    /**
     * The user's login
     */
    login: number 

     /**
     * The acreation date of the access token
     */
    createdAt: string 
}

/**
 * A lobby with skribbl-original properties additional to palantir properties
 */
 export interface lobby{
    /**
    * The lobby language
    */
    Language: string,

    /**
    * The lobby link
    */
    Link: string,

    /**
    * Indicator if the lobby is private
    */
    Private: boolean,

    /**
    * The lobby's current round
    */
    Round: string,

    /**
    * The lobby's host, skribbl or sketchful
    */
    Host: string,

    /**
    * The players in the lobby
    */
    Players: Array<{
        Name: string,
        Score: number,
        Sender: boolean,
        Drawing: boolean,
        LobbyPlayerID: number
    }>
}

/**
 * Palantir informations to a lobby: id, description, key etc
 */
export interface palantirLobby{
    /**
    * The palantir lobby ID
    */
    ID: string,
    
    /**
    * A key generated by the lobby's properties
    */
    Key: string

    /**
    * The lobby description for the palantir bot
    */
    Description: string

    /**
    * The ID of the server/state that the lobby is restricted to
    */
    Restriction: string
}

/**
* Lobby data containing skribbl and palantir properties, targeting a single guild
*/
export interface guildLobby extends lobby, palantirLobby{
    /**
    * ID of the guild
    */
    GuildID: string,

    /**
    * Observe token of the guild
    */
    ObserveToken: number
}

/**
* Lobby data containing skribbl and palantir data
*/
export interface reportLobby extends lobby, palantirLobby{
}

/**
 * Contains an array of a guild's active palantir lobbies
 */
export interface activeGuildLobbies{
    /**
    * The guild's ID
    */
    guildID: string,

    /**
    * The active lobbies
    */
    guildLobbies: Array<guildLobby>
}

/**
 * A Palantir event drop
 * @summary Database Entity of Table `EventDrops`
 */
 export interface drop{
    /**
    * The eventdrop ID
    */
    EventDropID: number,

    /**
    * The eventdrop's event ID
    */
    EventID: number,

    /**
    * The eventdrop URL
    */
    URL: string,

    /**
    * The eventdrop name
    */
     Name: string,
}

/**
 * A Palantir scene
 * @summary Database Entity of Table `Scenes`
 */
 export interface scene{
    /**
    * The scene ID
    */
    EventDropID: number,

    /**
    * The scene's event ID
    */
    EventID: number,

    /**
    * The scene URL
    */
    URL: string,

    /**
    * The scene name
    */
    Name: string,

    /**
    * The scene artist
    */
    Artist: string,

    /**
    * The scene primary color
    */
    Color: string,

     /**
    * The scene guessed color
    */
    GuessedColor: string,
}

/**
 * An online sprite
 * @summary Database Entity of Table `OnlienSprites`
 */
 export interface onlineSprite{
    /**
    * The speudo-ID of the lobby where the sprite is present
    */
    LobbyKey: string,

    /**
    * The id of the player that wears the sprite
    */
    LobbyPlayerID: number,

    /**
    * The sprite ID
    */
    Sprite: number,

    /**
    * The datetime when the active sprite was refreshed
    */
    Date: string,

    /**
    * The slot of the sprite (-1 indicates a scene)
    */
    Slot: number,

    /**
    * The indexing ID of the entity
    */
    ID: string,
}

/**
 * A Palantir sprite
 * @summary Database Entity of Table `Sprites`
 */
 export interface sprite{
    /**
    * The sprite ID
    */
    ID: number,

    /**
    * Indicates if the sprite repalces the avatar
    */
    Special: number,

    /**
    * The cost of the sprite
    */
    Cost: number,

    /**
    * The artist of the sprite
    */
    Artist: string,

    /**
    * The sprite's eventdrop ID, if associated with an event
    */
    EventDropID: number,

    /**
    * The sprite URL
    */
    URL: string,

    /**
    * The sprite name
    */
    Name: string,
}

/**
 * A user sprite inventory item
 */
export interface spriteProperty {
    /**
    * The sprite ID
    */
    id: number;

    /**
    * The sprite's slot, 0 if inactive
    */
    slot:number;
}

/**
 * Contains all Palantir public data as sprites, scenes, drops etc
 */
 export interface publicData{
    /**
    * An array of eventdrops
    */
    drops: Array<drop>,

    /**
    * An array of sprites
    */
    sprites: Array<sprite>,

    /**
    * An array of scenes
    */
    scenes: Array<scene>,

    /**
    * The sprites of currently online players
    */
    onlineSprites: Array<onlineSprite>,

    /**
    * The scenes of currently online players
    */
    onlineScenes: Array<onlineSprite>
}

/**
 * Contains status information for a member's session
 */
export interface playerStatus {
    /**
    * The discord details of the member
    */
    PlayerMember: memberDiscordDetails,

    /**
    * The status of the member
    */
    Status: string,

    /**
    * The id of the player's lobby
    */
    LobbyID: string

    /**
    * The id of the layer in the lobby
    */
    LobbyPlayerID: string
}

/**
 * A upcoming or past drop
 * @summary Database Entity of Table `Drop` / `PastDrops`
 */
 export interface drop{
    /**
    * The drop ID
    */
    DropID: string,

    /**
    * The lobby key in which the drop was caught
    */
    CaughtLobbyKey: string,

    /**
    * In fact not the lobbyplayerid, but the Discord ID of the user that caught the drop
    */
    CaughtLobbyPlayerID: string,

    /**
    * The datetime when the drop dispatched. Format is like `2021-12-26 22:20:25`
    */
    ValidFrom: string,

    /**
    * The eventdrop ID, if associated with an event
    */
    EventDropID: number
}

/**
* The worker's chache of last received data from the ipc main server
*/
export interface workerCache {
    /**
    * The worker's last received public data
    */
    publicData: publicData;

    /**
    * The worker's last received active lobbies
    */
    activeLobbies: Array<activeGuildLobbies>;
}

/**
* A member's permission flags
*/
export interface memberFlags{

    /**
    * Flagged if the user is afk bubble farming
    */
    bubbleFarming: boolean;

    /**
    * Flagged if the user is a patreon subscriber or patronized
    */
    patron: boolean;

    /**
    * Flagged if the user is permanently banned from using palantir
    */
    permaBan: boolean;

    /**
    * Flagged if the user is a banned from catching drops
    */
    dropBan: boolean;

    /**
    * Flagged if the user has admin permissions
    */
    admin: boolean;

    /**
    * Flagged if the user has elevated bot permissions
    */
    moderator: boolean;
    
    /**
    * Flagged if the user has unlimited cloud access
    */
    unlimitedCloud: boolean;
    
    /**
    * Flagged if the user is a patreon subscriber with patronizer tier
    */
    patronizer: boolean;
}

/**
 * Metadata of a drawing in the image db
 */
export interface imageMeta{

    /**
     * The drawing's title
     */
    name: string;

    /**
     * The person that created the drawing
     */
    author:string;

    /**
     * Indicates if the drawing was made by the owner of the image db
     */
    own:boolean;

    /**
     * The language of the lobby where the drawing was made
     */
    language:string;

    /**
     * Indicates if the drawing was made in a public lobby
     */
    private:boolean;

    /**
     * Data url of the image thumbnail in base64 ong format; including *data:image/png;base64,*
     */
    thumbnail:string;

    /**
     * Date of the image upload, in default JS Date.toString() format
     */
    date:string;

    /**
     * Login of the image db owner
     */
    login:string;
}

export interface imageData{

    /**
     * The drawing's metadata
     */
    meta: imageMeta;

    /**
     * Data url of the image in base64 ong format; including *data:image/png;base64,* 
     */
    uri: string;

    /**
     * Jagged array of commands: either old action-format (commands[action[command[data]]]) or new flat ([commands[command[data]]])
     */
    commands: Array<Array<Array<number> | number>>;
}

export interface palantirWebhook{

    /**
     * The server ID of the webhook
     */
    ServerID: string;

    /**
     * The display name on skribbl
     */
    Name: string;

    /**
     * The webhook url
     */
    WebhookURL: string;
}