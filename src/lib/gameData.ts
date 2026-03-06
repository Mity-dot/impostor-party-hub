// Word categories and words for the Impostor game

export interface CategoryData {
  name: string;
  emoji: string;
  words: { civilian: string; impostor: string }[];
}

export const CATEGORIES: CategoryData[] = [
  {
    name: "Fruits",
    emoji: "🍎",
    words: [
      { civilian: "Apple", impostor: "Pear" },
      { civilian: "Banana", impostor: "Plantain" },
      { civilian: "Strawberry", impostor: "Raspberry" },
      { civilian: "Watermelon", impostor: "Cantaloupe" },
      { civilian: "Orange", impostor: "Tangerine" },
      { civilian: "Grape", impostor: "Blueberry" },
      { civilian: "Mango", impostor: "Papaya" },
    ],
  },
  {
    name: "Animals",
    emoji: "🐶",
    words: [
      { civilian: "Dog", impostor: "Wolf" },
      { civilian: "Cat", impostor: "Lynx" },
      { civilian: "Horse", impostor: "Donkey" },
      { civilian: "Dolphin", impostor: "Shark" },
      { civilian: "Eagle", impostor: "Hawk" },
      { civilian: "Rabbit", impostor: "Hare" },
      { civilian: "Crocodile", impostor: "Alligator" },
    ],
  },
  {
    name: "Movies",
    emoji: "🎬",
    words: [
      { civilian: "Titanic", impostor: "Poseidon" },
      { civilian: "Batman", impostor: "Spider-Man" },
      { civilian: "Frozen", impostor: "Tangled" },
      { civilian: "Jaws", impostor: "Piranha" },
      { civilian: "Shrek", impostor: "Monsters Inc" },
      { civilian: "Avatar", impostor: "Pandorum" },
    ],
  },
  {
    name: "Food",
    emoji: "🍕",
    words: [
      { civilian: "Pizza", impostor: "Flatbread" },
      { civilian: "Sushi", impostor: "Sashimi" },
      { civilian: "Burger", impostor: "Sandwich" },
      { civilian: "Pasta", impostor: "Noodles" },
      { civilian: "Taco", impostor: "Burrito" },
      { civilian: "Ice Cream", impostor: "Gelato" },
    ],
  },
  {
    name: "Sports",
    emoji: "⚽",
    words: [
      { civilian: "Soccer", impostor: "Futsal" },
      { civilian: "Basketball", impostor: "Netball" },
      { civilian: "Tennis", impostor: "Badminton" },
      { civilian: "Swimming", impostor: "Diving" },
      { civilian: "Boxing", impostor: "Wrestling" },
      { civilian: "Golf", impostor: "Mini Golf" },
    ],
  },
  {
    name: "Jobs",
    emoji: "💼",
    words: [
      { civilian: "Doctor", impostor: "Nurse" },
      { civilian: "Chef", impostor: "Baker" },
      { civilian: "Pilot", impostor: "Flight Attendant" },
      { civilian: "Teacher", impostor: "Tutor" },
      { civilian: "Firefighter", impostor: "Paramedic" },
      { civilian: "Lawyer", impostor: "Judge" },
    ],
  },
  {
    name: "Places",
    emoji: "🌍",
    words: [
      { civilian: "Beach", impostor: "Lake" },
      { civilian: "Mountain", impostor: "Hill" },
      { civilian: "Library", impostor: "Bookstore" },
      { civilian: "Hospital", impostor: "Clinic" },
      { civilian: "Airport", impostor: "Train Station" },
      { civilian: "Museum", impostor: "Gallery" },
    ],
  },
];

// Funny username generation
const ADJECTIVES = [
  "Sneaky", "Wobbly", "Spicy", "Crispy", "Chunky", "Grumpy", "Fluffy",
  "Sassy", "Zappy", "Dizzy", "Funky", "Wacky", "Quirky", "Bouncy",
  "Cranky", "Giggly", "Jolly", "Loopy", "Nerdy", "Peppy", "Snazzy",
  "Twisted", "Bonkers", "Cheeky", "Dorky", "Fizzy", "Goofy", "Hyper",
  "Janky", "Kooky", "Muddy", "Nutty", "Perky", "Rusty", "Soggy",
  "Tipsy", "Wonky", "Zippy", "Breezy", "Clumsy",
];

const NOUNS = [
  "Pickle", "Waffle", "Nugget", "Potato", "Noodle", "Muffin", "Taco",
  "Biscuit", "Pancake", "Donut", "Pretzel", "Dumpling", "Burrito",
  "Cupcake", "Turnip", "Cabbage", "Sausage", "Crouton", "Pudding",
  "Toaster", "Penguin", "Walrus", "Llama", "Platypus", "Goblin",
  "Gremlin", "Wizard", "Pirate", "Ninja", "Hamster", "Badger",
  "Wombat", "Raccoon", "Squid", "Moose", "Ferret", "Otter",
  "Panda", "Gecko", "Yeti",
];

const usedNames = new Set<string>();

export function generateUsername(): string {
  let attempts = 0;
  while (attempts < 100) {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const name = `${adj}${noun}`;
    if (!usedNames.has(name)) {
      usedNames.add(name);
      return name;
    }
    attempts++;
  }
  // Fallback with number
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 99);
  const name = `${adj}${noun}${num}`;
  usedNames.add(name);
  return name;
}

export function releaseName(name: string) {
  usedNames.delete(name);
}

export function resetNames() {
  usedNames.clear();
}

// Avatar options
export const AVATAR_COLORS = [
  "hsl(174, 100%, 50%)",  // cyan/primary
  "hsl(320, 100%, 60%)",  // magenta/secondary
  "hsl(85, 100%, 55%)",   // lime/accent
  "hsl(45, 100%, 55%)",   // yellow/warning
  "hsl(0, 80%, 55%)",     // red
  "hsl(270, 80%, 60%)",   // purple
  "hsl(200, 100%, 55%)",  // blue
  "hsl(30, 100%, 55%)",   // orange
];

export const AVATAR_FACES = [
  "😎", "🤠", "👻", "🤖", "👽", "🎃", "🐱", "🐸",
  "🦊", "🐼", "🐵", "🦄", "🐲", "🎭", "🤡", "💀",
];

export interface Player {
  id: string;
  name: string;
  avatarColor: string;
  avatarFace: string;
  role?: "civilian" | "impostor";
  word?: string;
  clue?: string;
  votedFor?: string;
  votesReceived?: number;
}

export function createPlayer(existingNames: string[] = []): Player {
  // Make sure generated name doesn't conflict with existing
  existingNames.forEach(n => usedNames.add(n));
  return {
    id: crypto.randomUUID(),
    name: generateUsername(),
    avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
    avatarFace: AVATAR_FACES[Math.floor(Math.random() * AVATAR_FACES.length)],
  };
}
