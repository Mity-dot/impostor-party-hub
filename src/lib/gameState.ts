import { Player, CATEGORIES, CategoryData, resetNames } from "./gameData";

export type GamePhase = 
  | "lobby"
  | "category-select"
  | "word-reveal"
  | "clue-phase"
  | "voting"
  | "results";

export interface GameState {
  phase: GamePhase;
  players: Player[];
  category?: CategoryData;
  civilianWord?: string;
  impostorWord?: string;
  impostorId?: string;
  impostorIds?: string[];
  currentPlayerIndex: number;
  round: number;
}

export function createInitialState(): GameState {
  resetNames();
  return {
    phase: "lobby",
    players: [],
    currentPlayerIndex: 0,
    round: 1,
  };
}

export function getImpostorCount(playerCount: number): number {
  if (playerCount <= 5) return 1;
  if (playerCount <= 10) return 2;
  return Math.floor(playerCount / 5);
}

export function assignRoles(state: GameState, category: CategoryData): GameState {
  const wordPair = category.words[Math.floor(Math.random() * category.words.length)];
  const impostorCount = getImpostorCount(state.players.length);
  
  // Pick random impostor indices
  const indices = Array.from({ length: state.players.length }, (_, i) => i);
  const impostorIndices: number[] = [];
  for (let i = 0; i < impostorCount && indices.length > 0; i++) {
    const pick = Math.floor(Math.random() * indices.length);
    impostorIndices.push(indices[pick]);
    indices.splice(pick, 1);
  }
  
  const players = state.players.map((p, i) => ({
    ...p,
    role: (impostorIndices.includes(i) ? "impostor" : "civilian") as "civilian" | "impostor",
    word: impostorIndices.includes(i) ? wordPair.impostor : wordPair.civilian,
    clue: undefined,
    votedFor: undefined,
    votesReceived: 0,
  }));

  const impostorIds = impostorIndices.map(i => players[i].id);

  return {
    ...state,
    phase: "word-reveal",
    category,
    civilianWord: wordPair.civilian,
    impostorWord: wordPair.impostor,
    impostorId: impostorIds[0],
    impostorIds,
    players,
    currentPlayerIndex: 0,
  };
}

export function tallyVotes(state: GameState): GameState {
  const voteCount: Record<string, number> = {};
  state.players.forEach(p => {
    if (p.votedFor) {
      voteCount[p.votedFor] = (voteCount[p.votedFor] || 0) + 1;
    }
  });

  const players = state.players.map(p => ({
    ...p,
    votesReceived: voteCount[p.id] || 0,
  }));

  return { ...state, players, phase: "results" };
}

export function getMostVoted(state: GameState): Player | null {
  let max = 0;
  let mostVoted: Player | null = null;
  let tie = false;
  
  state.players.forEach(p => {
    if ((p.votesReceived || 0) > max) {
      max = p.votesReceived || 0;
      mostVoted = p;
      tie = false;
    } else if ((p.votesReceived || 0) === max && max > 0) {
      tie = true;
    }
  });

  return tie ? null : mostVoted;
}

export function didCiviliansWin(state: GameState): boolean {
  const mostVoted = getMostVoted(state);
  const impostorIds = state.impostorIds || (state.impostorId ? [state.impostorId] : []);
  return mostVoted ? impostorIds.includes(mostVoted.id) : false;
}
