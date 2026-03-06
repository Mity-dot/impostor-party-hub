import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Delete rooms abandoned more than 1 minute ago
  const cutoff = new Date(Date.now() - 60 * 1000).toISOString();

  const { data: abandoned, error: fetchErr } = await supabase
    .from("rooms")
    .select("id")
    .not("abandoned_at", "is", null)
    .lt("abandoned_at", cutoff);

  if (fetchErr) {
    return new Response(JSON.stringify({ error: fetchErr.message }), { status: 500 });
  }

  let deleted = 0;
  for (const room of abandoned || []) {
    // Delete players first, then room
    await supabase.from("room_players").delete().eq("room_id", room.id);
    await supabase.from("rooms").delete().eq("id", room.id);
    deleted++;
  }

  return new Response(JSON.stringify({ deleted, checked: abandoned?.length || 0 }), {
    headers: { "Content-Type": "application/json" },
  });
});
