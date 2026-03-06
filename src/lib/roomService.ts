import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, AVATAR_COLORS, AVATAR_FACES, generateUsername, resetNames } from "@/lib/gameData";
import { getImpostorCount } from "@/lib/gameState";

// Session ID persisted in localStorage
function getSessionId(): string {
  let id = localStorage.getItem("impostor_session_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("impostor_session_id", id);
  }
  return id;
}

export const sessionId = getSessionId();

// Generate a 4-letter room code
function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function createRoom(customCode?: string): Promise<string> {
  const code = (customCode || generateRoomCode()).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
  
  // Check if code exists
  const { data: existing } = await supabase
    .from("rooms")
    .select("id")
    .eq("room_code", code)
    .maybeSingle();

  if (existing) {
    throw new Error("Room code already in use. Try a different one!");
  }

  const { data, error } = await supabase
    .from("rooms")
    .insert({
      room_code: code,
      host_session_id: sessionId,
      game_phase: "lobby",
    })
    .select()
    .single();

  if (error) throw error;

  // Add host as first player
  const name = generateUsername();
  await supabase.from("room_players").insert({
    room_id: data.id,
    session_id: sessionId,
    player_name: name,
    avatar_color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
    avatar_face: AVATAR_FACES[Math.floor(Math.random() * AVATAR_FACES.length)],
    player_order: 0,
  });

  return code;
}

export async function joinRoom(roomCode: string): Promise<{ roomId: string; isHost: boolean }> {
  const code = roomCode.toUpperCase().trim();

  const { data: room, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("room_code", code)
    .maybeSingle();

  if (!room || error) throw new Error("Room not found!");
  if (room.game_phase !== "lobby") throw new Error("Game already in progress!");

  // Check if already in room
  const { data: existing } = await supabase
    .from("room_players")
    .select("id")
    .eq("room_id", room.id)
    .eq("session_id", sessionId)
    .maybeSingle();

  if (!existing) {
    // Get player count for order
    const { count } = await supabase
      .from("room_players")
      .select("*", { count: "exact", head: true })
      .eq("room_id", room.id);

    const name = generateUsername();
    await supabase.from("room_players").insert({
      room_id: room.id,
      session_id: sessionId,
      player_name: name,
      avatar_color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
      avatar_face: AVATAR_FACES[Math.floor(Math.random() * AVATAR_FACES.length)],
      player_order: count || 0,
    });
  }

  return { roomId: room.id, isHost: room.host_session_id === sessionId };
}

export async function updatePlayerProfile(
  roomId: string,
  updates: { player_name?: string; avatar_color?: string; avatar_face?: string }
) {
  await supabase
    .from("room_players")
    .update(updates)
    .eq("room_id", roomId)
    .eq("session_id", sessionId);
}

export async function startGame(roomId: string, categoryName: string) {
  const category = CATEGORIES.find(c => c.name === categoryName);
  if (!category) throw new Error("Category not found");

  const wordPair = category.words[Math.floor(Math.random() * category.words.length)];

  // Get all players
  const { data: players } = await supabase
    .from("room_players")
    .select("*")
    .eq("room_id", roomId)
    .order("player_order");

  if (!players || players.length < 3) throw new Error("Need at least 3 players");

  // Pick impostors based on player count
  const count = getImpostorCount(players.length);
  const indices = Array.from({ length: players.length }, (_, i) => i);
  const impostorIndices: number[] = [];
  for (let c = 0; c < count && indices.length > 0; c++) {
    const pick = Math.floor(Math.random() * indices.length);
    impostorIndices.push(indices[pick]);
    indices.splice(pick, 1);
  }

  // Assign roles to all players
  for (let i = 0; i < players.length; i++) {
    const isImpostor = impostorIndices.includes(i);
    await supabase
      .from("room_players")
      .update({
        role: isImpostor ? "impostor" : "civilian",
        word: isImpostor ? wordPair.impostor : wordPair.civilian,
        clue: null,
        voted_for: null,
        votes_received: 0,
      })
      .eq("id", players[i].id);
  }

  // Update room (impostor_player_id stores first impostor for backwards compat)
  await supabase
    .from("rooms")
    .update({
      game_phase: "word-reveal",
      category_name: categoryName,
      civilian_word: wordPair.civilian,
      impostor_word: wordPair.impostor,
      impostor_player_id: players[impostorIndices[0]].id,
      current_player_index: 0,
    })
    .eq("id", roomId);
}

export async function advancePhase(roomId: string, phase: string, playerIndex: number = 0) {
  await supabase
    .from("rooms")
    .update({ game_phase: phase, current_player_index: playerIndex })
    .eq("id", roomId);
}

export async function submitClue(roomId: string, playerId: string, clue: string, nextAliveIndex: number | null) {
  await supabase
    .from("room_players")
    .update({ clue })
    .eq("id", playerId);

  if (nextAliveIndex === null) {
    // All alive players have given clues, move to voting
    const firstAlive = await getFirstAlivePlayerIndex(roomId);
    await advancePhase(roomId, "voting", firstAlive);
  } else {
    await supabase
      .from("rooms")
      .update({ current_player_index: nextAliveIndex })
      .eq("id", roomId);
  }
}

export async function submitVote(roomId: string, voterId: string, votedForId: string, nextAliveIndex: number | null) {
  await supabase
    .from("room_players")
    .update({ voted_for: votedForId })
    .eq("id", voterId);

  if (nextAliveIndex === null) {
    // All alive players have voted - tally and eliminate
    const { data: players } = await supabase
      .from("room_players")
      .select("*")
      .eq("room_id", roomId)
      .order("player_order");

    if (!players) return;

    const alivePlayers = players.filter(p => !p.eliminated);
    const voteCount: Record<string, number> = {};
    alivePlayers.forEach(p => {
      if (p.voted_for) voteCount[p.voted_for] = (voteCount[p.voted_for] || 0) + 1;
    });

    // Update vote counts
    for (const p of players) {
      await supabase
        .from("room_players")
        .update({ votes_received: voteCount[p.id] || 0 })
        .eq("id", p.id);
    }

    // Find most voted
    let maxVotes = 0;
    let mostVotedId: string | null = null;
    let tie = false;
    Object.entries(voteCount).forEach(([id, count]) => {
      if (count > maxVotes) { maxVotes = count; mostVotedId = id; tie = false; }
      else if (count === maxVotes) tie = true;
    });

    // Get room data for impostor check
    const { data: room } = await supabase
      .from("rooms")
      .select("*")
      .eq("id", roomId)
      .single();

    if (!tie && mostVotedId) {
      // Eliminate the player
      await supabase
        .from("room_players")
        .update({ eliminated: true })
        .eq("id", mostVotedId);

      // Check win conditions based on roles
      const remainingAlive = alivePlayers.filter(p => p.id !== mostVotedId);
      const aliveImpostors = remainingAlive.filter(p => p.role === "impostor");
      const aliveCivilians = remainingAlive.filter(p => p.role === "civilian");

      if (aliveImpostors.length === 0) {
        // All impostors eliminated - civilians win
        await advancePhase(roomId, "results", 0);
      } else if (aliveCivilians.length <= aliveImpostors.length) {
        // Impostors equal or outnumber civilians - impostors win
        await advancePhase(roomId, "results", 0);
      } else {
        // Continue - go to elimination screen
        await advancePhase(roomId, "elimination", 0);
      }
    } else {
      // Tie - impostor wins
      await advancePhase(roomId, "results", 0);
    }
  } else {
    await supabase
      .from("rooms")
      .update({ current_player_index: nextAliveIndex })
      .eq("id", roomId);
  }
}

async function getFirstAlivePlayerIndex(roomId: string): Promise<number> {
  const { data } = await supabase
    .from("room_players")
    .select("player_order, eliminated")
    .eq("room_id", roomId)
    .order("player_order");
  
  if (!data) return 0;
  const first = data.findIndex(p => !p.eliminated);
  return first >= 0 ? first : 0;
}

export async function startNextRound(roomId: string) {
  // Reset clues and votes for alive players, increment round
  const { data: players } = await supabase
    .from("room_players")
    .select("id, eliminated")
    .eq("room_id", roomId);

  if (players) {
    for (const p of players) {
      if (!p.eliminated) {
        await supabase
          .from("room_players")
          .update({ clue: null, voted_for: null, votes_received: 0 })
          .eq("id", p.id);
      }
    }
  }

  // Get current round and increment
  const { data: room } = await supabase.from("rooms").select("round_number").eq("id", roomId).single();
  const nextRound = (room?.round_number || 1) + 1;

  const firstAlive = await getFirstAlivePlayerIndex(roomId);
  await supabase
    .from("rooms")
    .update({ game_phase: "clue-phase", current_player_index: firstAlive, round_number: nextRound })
    .eq("id", roomId);
}

export async function resetForNewRound(roomId: string) {
  const { data: players } = await supabase
    .from("room_players")
    .select("id")
    .eq("room_id", roomId);

  if (players) {
    for (const p of players) {
      await supabase
        .from("room_players")
        .update({ role: null, word: null, clue: null, voted_for: null, votes_received: 0, eliminated: false })
        .eq("id", p.id);
    }
  }

  await supabase
    .from("rooms")
    .update({
      game_phase: "category-select",
      category_name: null,
      civilian_word: null,
      impostor_word: null,
      impostor_player_id: null,
      current_player_index: 0,
      round_number: 1,
    })
    .eq("id", roomId);
}

export async function leaveRoom(roomId: string) {
  await supabase
    .from("room_players")
    .delete()
    .eq("room_id", roomId)
    .eq("session_id", sessionId);
}

export async function deleteRoom(roomId: string) {
  await supabase.from("rooms").delete().eq("id", roomId);
}
