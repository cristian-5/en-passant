
import { User } from './member.ts';

/// https://discord.com/developers/docs/resources/channel#channel-object-channel-types
export const enum ChannelType {
	GUILD_TEXT = 0, // text channel within a server
	DM = 1, // direct message between users
	GUILD_VOICE = 2, // voice channel within a server
	GROUP_DM = 3, // direct message between multiple users
	GUILD_CATEGORY = 4, // organizational category that contains up to 50 channels
	GUILD_ANNOUNCEMENT = 5, // channel that users can follow and crosspost into their own server
	ANNOUNCEMENT_THREAD = 10, // temporary sub-channel within a GUILD_ANNOUNCEMENT channel
	PUBLIC_THREAD = 11, // temporary sub-channel within GUILD_TEXT or GUILD_FORUM channel
	PRIVATE_THREAD = 12, // temporary sub-channel within GUILD_TEXT channel, only viewable via invitation
	GUILD_STAGE_VOICE = 13, // voice channel for hosting events with an audience
	GUILD_DIRECTORY = 14, // the channel in a hub containing the listed servers
	GUILD_FORUM = 15, // channel that can only contain threads
	GUILD_MEDIA = 16, // channel that can only contain threads, similar to GUILD_FORUM channels
}

/// https://discord.com/developers/docs/resources/channel#channel-object-channel-structure
export interface Channel {
	id: string;
	type: number; // ChannelType
	guild_id?: string | null;
	position?: number;
	// TODO: implement later if needed
	// permission_overwrites?
	name?: string | null;
	topic?: string | null;
	nsfw?: boolean;
	last_message_id?: string | null;
	bitrate?: number;
	user_limit?: number;
	rate_limit_per_user?: number;
	recipients?: User[];
	icon?: string | null;
	owner_id?: string;
	application_id?: string;
	managed?: boolean;
	parent_id?: string | null;
	last_pin_timestamp?: string | null;
	rtc_region?: string | null;
	video_quality_mode?: number; // VideoQualityMode
	message_count?: number;
	member_count?: number; // approximate number of members (stops at 50)
	// TODO: implement later if needed
	// thread_metadata?:
	// member?: // only for threads
	default_auto_archive_duration?: number;
	permissions?: string;
	flags?: number;
	total_message_sent?: number;
	// TODO: implement later if needed
	// available_tags?, applied_tags?, default_reaction_emoji?
	// default_thread_rate_limit_per_user?: number;
	// default_sort_order?: number | null; // SortOrderType
	// default_forum_layout?: number; // ForumLayoutType
}
