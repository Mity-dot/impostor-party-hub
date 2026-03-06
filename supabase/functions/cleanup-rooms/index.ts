import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Delete rooms abandoned more than 1 minute ago
  const abandonedCutoff = new Date(Date.now() - 60 * 1000).toISOString();

  const { data: abandoned, error: fetchErr } = await supabase
    .from("rooms")
    .select("id")
    .not("abandoned_at", "is", null)
    .lt("abandoned_at", abandonedCutoff);

  // Delete rooms with no activity for more than 10 minutes
  const inactiveCutoff = new Date(Date.now() - 10 * 60 * 1000).toISOString();

  const { data: inactive, error: inactiveErr } = await supabase
    .from("rooms")
    .select("id")
    .is("abandoned_at", null)
    .lt("created_at", inactiveCutoff)
    .in("game_phase", ["lobby", "results"]);

  if (fetchErr || inactiveErr) {
    return new Response(JSON.stringify({ error: (fetchErr || inactiveErr)?.message }), { status: 500 });
  }

  const toDelete = [...(abandoned || []), ...(inactive || [])];
  const seen = new Set<string>();
  let deleted = 0;

  for (const room of toDelete) {
    if (seen.has(room.id)) continue;
    seen.add(room.id);
    await supabase.from("room_players").delete().eq("room_id", room.id);
    await supabase.from("rooms").delete().eq("id", room.id);
    deleted++;
  }

  return new Response(JSON.stringify({ deleted, abandoned: abandoned?.length || 0, inactive: inactive?.length || 0 }), {
    headers: { "Content-Type": "application/json" },
  });
});
