
import { Interaction, InteractionResponse } from "./interaction.ts";

/// https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type
export enum CommandOptionType {
	SUB_COMMAND = 1,
	SUB_COMMAND_GROUP = 2,
	STRING = 3,
	INTEGER = 4,
	BOOLEAN = 5,
	USER = 6,
	CHANNEL = 7,
	ROLE = 8,
	MENTIONABLE = 9,
	NUMBER = 10,
	ATTACHMENT = 11
}

/// https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-choice-structure
export interface CommandOptionChoice {
	name: string;
	value: string | number;
}

/// https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure
export interface CommandOption {
	name: string;
	description: string;
	type: CommandOptionType;
	required?: boolean;
	choices?: CommandOptionChoice[];
	options?: CommandOption[]; // subcommands or subcommand groups
	min_value?: number;
	max_value?: number;
	min_length?: number;
	max_length?: number;
	autocomplete?: boolean;
}

/// https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-types
export enum CommandType {
	CHAT_INPUT = 1, // slash commands
	USER_COMMAND = 2, // context menu commands for users
	MESSAGE_COMMAND = 3, // context menu commands for messages
	PRIMARY_ENTRY_POINT = 4 // primary entry point for an application
}

/// https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-structure
export interface Command {
	id?: string;
	application_id?: string;
	version?: string;
	default_member_permissions?: string | null;
	type?: CommandType;
	name: string;
	description: string;
	options?: CommandOption[];
	nsfw?: boolean;
	integration_types?: number[];
	// =============================================================
	run: (interaction: Interaction) => Promise<InteractionResponse>;
}
