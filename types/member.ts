
/// https://discord.com/developers/docs/resources/user#avatar-decoration-data-object
export interface AvatarDecorationData {
	asset: string;
	sku_id: string;
}

/// https://discord.com/developers/docs/resources/user#user-object
export interface User {
	id: string;
	username: string;
	discriminator: string;
	global_name: string | null;
	avatar: string;
	bot?: boolean;
	system?: boolean;
	mfa_enabled?: boolean;
	banner?: string | null;
	accent_color?: number | null;
	locale?: string;
	verified?: boolean;
	email?: string | null;
	flags?: number;
	premium_type?: number | null;
	public_flags?: number;
	avatar_decoration?: AvatarDecorationData | null;
};

/// https://discord.com/developers/docs/resources/guild#guild-member-object
export interface Member {
	user?: User;
	nick?: string | null;
	avatar?: string | null;
	banner?: string | null;
	roles: string[];
	joined_at: string;
	premium_since?: string | null;
	deaf: boolean;
	mute: boolean;
	flags: number;
	guild_id?: string;
	pending?: boolean;
	permissions?: string;
	communication_disabled_until?: string | null;
	avatar_decoration_data?: AvatarDecorationData | null;
}
