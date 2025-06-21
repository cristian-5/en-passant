
import { CommandOptionType } from './command.ts';
import { Member, User } from './member.ts';
import { Channel } from './channel.ts';
import { Message, Embed } from './message.ts';

/// https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-type
export enum InteractionType {
	PING = 1, // ping from Discord to check if the bot is online
	APPLICATION_COMMAND = 2, // application command interaction (e.g., slash commands)
	MESSAGE_COMPONENT = 3, // interaction with a message component (e.g., buttons)
	APPLICATION_COMMAND_AUTOCOMPLETE = 4, // autocomplete interaction for application commands
	MODAL_SUBMIT = 5 // modal submit interaction
}

/// https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-response-object-interaction-callback-type
export enum InteractionCallbackType {
	PONG = 1, // response to a ping interaction
	CHANNEL_MESSAGE_WITH_SOURCE = 4,
	DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE = 5,
	DEFERRED_UPDATE_MESSAGE = 6,
	UPDATE_MESSAGE = 7,
	APPLICATION_COMMAND_AUTOCOMPLETE_RESULT = 8,
	MODAL = 9,
	PREMIUM_REQUIRED = 10,
	LAUNCH_ACTIVITY = 12
}

/// https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-application-command-interaction-data-option-structure
export interface InteractionOption {
	name: string; // name of the option
	type: CommandOptionType;
	value?: string | number | boolean;
	options?: InteractionOption[]; // for sub-command or sub-command group
	focused?: boolean; // whether this option is focused for autocomplete
}

/// https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-data
export interface InteractionData {
	id: string;
	name: string;
	type: InteractionType;
	// TODO: implement later if needed
	// resolved?: ResolvedData;
	options?: InteractionOption[];
	guild_id?: string;
	target_id?: string;
}

/// https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object
export interface Interaction {
	id: string;
	integration_id?: string;
	type: InteractionType;
	data: InteractionData;
	guild?: string;
	guild_id?: string;
	channel?: Channel;
	channel_id?: string;
	member?: Member; // only for guild interactions
	user?: User;     // only for direct messages
	token: string;
	version: number;
	message?: Message;
	app_permissions?: string;
	locale?: string;
	guild_locale?: string;
	// TODO: implement later if needed
	// entitlements: Entitlement[];
	// authorizing_integration_owners?
	attachment_size_limit: number;
}

/// https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-response-object-interaction-callback-data-structure
export interface InteractionResponse {
	tts?: boolean;
	content?: string;
	embeds?: Embed[];
	// TODO: implement later if needed
	// allowed_mentions?: AllowedMentions;
	flags?: number;
	// TODO: implement later if needed
	// components?: Component[];
	// poll?: Poll;
	attachments?: Attachment[];
	// NOTE: not really part of the discord API
	files?: DiscordFile[]; // CUSTOM IMPLEMENTATION
}

export interface DiscordFile {
	name: string;
	data: Uint8Array;
	mime: string;
}

export interface Attachment {
	id: string;
	filename: string;
	title?: string;
	description?: string; // max 1024 characters
	content_type?: string;
	size?: number; // in bytes
	url?: string;
	proxy_url?: string;
	height?: number | null; // if image
	width?: number | null;  // if image
	ephemeral?: boolean;    // whether this attachment is ephemeral
	duration_secs?: number; // for audio files (voice messages)
	waveform?: string;      // base64-encoded byte array (voice messages)
	flags?: number;
}

/* https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-response-object
export interface InteractionResponse {
	type: InteractionCallbackType;
	data?: InteractionCallbackData; // data to send back to Discord
}
	// NOT IMPLEMENTED BECAUSE NOT NEEDED (and would conflict with the same name used elsewhere)
*/