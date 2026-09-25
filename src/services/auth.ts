import { cache } from "react";
import { redirect } from "next/navigation";
import { canWrite } from "@/lib/roles";
import { createServerSupabase } from "@/lib/supabase/server";
import { toProfile } from "@/services/mappers";
import type { ProfileRow } from "@/types/database-rows";
import type { Profile } from "@/types/domain";

/** Profil pengguna yang sedang masuk. Di-cache per request agar tidak query berulang. */
export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  return data ? toProfile(data as ProfileRow) : null;
});

/** Dipakai di halaman dashboard: hanya penulis, editor, dan admin yang boleh masuk. */
export async function requireStaff(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/masuk");
  if (!canWrite(profile.role)) redirect("/masuk?error=akses");
  return profile;
}
