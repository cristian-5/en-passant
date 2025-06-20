
import { FIDE } from "https://raw.githubusercontent.com/cristian-5/fide_rs/refs/heads/main/mod.ts";
import { kv } from "../../environment.ts";

export const fide = {
	com: {
		profile: (fide_id: string) => "https://ratings.fide.com/profile/" + fide_id,
		player: async (fide_id: string) => {
			if (!/^\d+$/.test(fide_id)) { // search by name
				fide_id = fide_id.replace(/\s+/g, " ").toLowerCase();
				const id = await kv.get(["fide", fide_id]); // saved FIDE ID
				if (id.value === null) return null;
				fide_id = id.value as string;
			}
			const user = await FIDE(fide_id);
			if (user === null) return null;
			const names = user.name.split(
				user.name.includes(",") ? /\s*,\s*/ : /\s+/
			).map(n => n.trim().toLowerCase());
			kv.set(["fide", names[0] + " " + names[1]], fide_id);
			kv.set(["fide", names[1] + " " + names[0]], fide_id);
			return user;
		}
	}
}
