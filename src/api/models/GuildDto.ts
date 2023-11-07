/* tslint:disable */
/* eslint-disable */
/**
 * Skribbl Typo API
 * Skribbl typo admin and auth api
 *
 * The version of the OpenAPI document: 1.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { exists, mapValues } from '../runtime';
import type { WebhookDto } from './WebhookDto';
import {
    WebhookDtoFromJSON,
    WebhookDtoFromJSONTyped,
    WebhookDtoToJSON,
} from './WebhookDto';

/**
 * 
 * @export
 * @interface GuildDto
 */
export interface GuildDto {
    /**
     * The guild's ID
     * @type {string}
     * @memberof GuildDto
     */
    guildID: string;
    /**
     * The guild's Palantir message channel ID
     * @type {string}
     * @memberof GuildDto
     */
    channelID: string;
    /**
     * The guild's Palantir message ID
     * @type {string}
     * @memberof GuildDto
     */
    messageID: string;
    /**
     * The guild's Palantir token
     * @type {number}
     * @memberof GuildDto
     */
    observeToken: number;
    /**
     * The guild's name
     * @type {string}
     * @memberof GuildDto
     */
    guildName: string;
    /**
     * The guild's post webhooks
     * @type {Array<WebhookDto>}
     * @memberof GuildDto
     */
    webhooks: Array<WebhookDto>;
}

/**
 * Check if a given object implements the GuildDto interface.
 */
export function instanceOfGuildDto(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "guildID" in value;
    isInstance = isInstance && "channelID" in value;
    isInstance = isInstance && "messageID" in value;
    isInstance = isInstance && "observeToken" in value;
    isInstance = isInstance && "guildName" in value;
    isInstance = isInstance && "webhooks" in value;

    return isInstance;
}

export function GuildDtoFromJSON(json: any): GuildDto {
    return GuildDtoFromJSONTyped(json, false);
}

export function GuildDtoFromJSONTyped(json: any, ignoreDiscriminator: boolean): GuildDto {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'guildID': json['GuildID'],
        'channelID': json['ChannelID'],
        'messageID': json['MessageID'],
        'observeToken': json['ObserveToken'],
        'guildName': json['GuildName'],
        'webhooks': ((json['Webhooks'] as Array<any>).map(WebhookDtoFromJSON)),
    };
}

export function GuildDtoToJSON(value?: GuildDto | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'GuildID': value.guildID,
        'ChannelID': value.channelID,
        'MessageID': value.messageID,
        'ObserveToken': value.observeToken,
        'GuildName': value.guildName,
        'Webhooks': ((value.webhooks as Array<any>).map(WebhookDtoToJSON)),
    };
}
