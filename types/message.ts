
import { User } from './member.ts';

/// https://discord.com/developers/docs/resources/message#message-object-message-flags
export const enum MessageFlags {
	CROSSPOSTED = 1 << 0,
	IS_CROSSPOST = 1 << 1,
	SUPPRESS_EMBEDS = 1 << 2,
	SOURCE_MESSAGE_DELETED = 1 << 3,
	URGENT = 1 << 4,
	HAS_THREAD = 1 << 5,
	EPHEMERAL = 1 << 6,
	LOADING = 1 << 7,
	FAILED_TO_MENTION_SOME_ROLES_IN_THREAD = 1 << 8,
	SUPPRESS_NOTIFICATIONS = 1 << 12,
	IS_VOICE_MESSAGE = 1 << 13,
	HAS_SNAPSHOT = 1 << 14,
	IS_COMPONENTS_V2 = 1 << 15
}

/// https://discord.com/developers/docs/resources/message#message-object-message-types
export const enum MessageType {
	DEFAULT = 0,
	RECIPIENT_ADD = 1,
	RECIPIENT_REMOVE = 2,
	CALL = 3,
	CHANNEL_NAME_CHANGE = 4,
	CHANNEL_ICON_CHANGE = 5,
	CHANNEL_PINNED_MESSAGE = 6,
	USER_JOIN = 7,
	GUILD_BOOST = 8,
	GUILD_BOOST_TIER_1 = 9,
	GUILD_BOOST_TIER_2 = 10,
	GUILD_BOOST_TIER_3 = 11,
	CHANNEL_FOLLOW_ADD = 12,
	GUILD_DISCOVERY_DISQUALIFIED = 14,
	GUILD_DISCOVERY_REQUALIFIED = 15,
	GUILD_DISCOVERY_GRACE_PERIOD_INITIAL_WARNING = 16,
	GUILD_DISCOVERY_GRACE_PERIOD_FINAL_WARNING = 17,
	THREAD_CREATED = 18,
	REPLY = 19,
	CHAT_INPUT_COMMAND = 20,
	THREAD_STARTER_MESSAGE = 21,
	GUILD_INVITE_REMINDER = 22,
	CONTEXT_MENU_COMMAND = 23,
	AUTO_MODERATION_ACTION = 24,
	ROLE_SUBSCRIPTION_PURCHASE = 25,
	INTERACTION_PREMIUM_UPSELL = 26,
	STAGE_START = 27,
	STAGE_END = 28,
	STAGE_SPEAKER = 29,
	STAGE_TOPIC = 31,
	GUILD_APPLICATION_PREMIUM_SUBSCRIPTION = 32,
	GUILD_INCIDENT_ALERT_MODE_ENABLED = 36,
	GUILD_INCIDENT_ALERT_MODE_DISABLED = 37,
	GUILD_INCIDENT_REPORT_RAID = 38,
	GUILD_INCIDENT_REPORT_FALSE_ALARM = 39,
	PURCHASE_NOTIFICATION = 44,
	POLL_RESULT = 46
}

/// https://discord.com/developers/docs/resources/message#message-object-message-structure
export interface Message {
	id: string;
	channel_id: string;
	author: User;
	content: string;
	timestamp: string;
	edited_timestamp?: string | null;
	tts?: boolean;
	mention_everyone?: boolean;
	mentions?: User[];
	// TODO: implement later if needed
	// mention_roles?: string[];
	// attachments?, embeds?, reactions?, nonce?
	pinned: boolean;
	webhook_id?: string;
	type: MessageType;
	// TODO: implement later if needed
	// activity, application, application_id
	flags?: string;
	// TODO: implement later if needed
	// message_reference?, message_snapshots, referenced_message?,
	// interaction_metadata?, interaction?, thread?,
	// components?, sticker_items?, stickers?
	position?: number;
	// TODO: implement later if needed
	// role_subscription_data?, resolved?, poll?, call?
}

/// https://discord.com/developers/docs/resources/message#embed-object
export interface Embed {
	title?: string;
	type?: "rich" | "image" | "video" | "gifv" | "article" | "link";
	description?: string;
	url?: string;
	timestamp?: string;
	color?: number;
	footer?: {
		text: string;
		icon_url?: string;
		proxy_icon_url?: string;
	};
	image?: {
		url: string;
		proxy_url?: string;
		height?: number;
		width?: number;
	};
	thumbnail?: {
		url: string;
		proxy_url?: string;
		height?: number;
		width?: number;
	};
	video?: {
		url?: string;
		proxy_url?: string;
		height?: number;
		width?: number;
	};
	provider?: {
		name?: string;
		url?: string;
	};
	author?: {
		name: string;
		url?: string;
		icon_url?: string;
		proxy_icon_url?: string;
	};
	fields?: {
		name: string;
		value: string;
		inline?: boolean;
	}[];
}
