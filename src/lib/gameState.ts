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

export function assignRoles(state: GameState, category: CategoryData): GameState {
  const wordPair = category.words[Math.floor(Math.random() * category.words.length)];
  const impostorIndex = Math.floor(Math.random() * state.players.length);
  
  const players = state.players.map((p, i) => ({
    ...p,
    role: (i === impostorIndex ? "impostor" : "civilian") as "civilian" | "impostor",
    word: i === impostorIndex ? wordPair.impostor : wordPair.civilian,
    clue: undefined,
    votedFor: undefined,
    votesReceived: 0,
  }));

  return {
    ...state,
    phase: "word-reveal",
    category,
    civilianWord: wordPair.civilian,
    impostorWord: wordPair.impostor,
    impostorId: players[impostorIndex].id,
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
  return mostVoted?.id === state.impostorId;
}
