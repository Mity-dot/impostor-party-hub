// Bot AI logic for generating clues and making votes

// Clue associations for each word category
const WORD_CLUES: Record<string, string[]> = {
  // Fruits
  "Apple": ["red", "crunchy", "juice", "pie", "orchard", "sweet", "tree", "crisp"],
  "Pear": ["green", "soft", "juicy", "smooth", "tree", "sweet", "ripe", "shape"],
  "Banana": ["yellow", "peel", "monkey", "curved", "tropical", "split", "bunch", "potassium"],
  "Plantain": ["cooking", "starchy", "fried", "tropical", "green", "firm", "chips", "savory"],
  "Strawberry": ["red", "jam", "garden", "sweet", "seeds", "cream", "shortcake", "berry"],
  "Raspberry": ["thorny", "bush", "jam", "tart", "pink", "seeds", "wild", "berry"],
  "Watermelon": ["summer", "seeds", "huge", "refreshing", "rind", "picnic", "juicy", "slice"],
  "Cantaloupe": ["orange", "melon", "netted", "summer", "sweet", "ripe", "breakfast", "scoop"],
  "Orange": ["citrus", "vitamin", "round", "squeeze", "peel", "zest", "tropical", "bright"],
  "Tangerine": ["citrus", "small", "easy", "peel", "segments", "sweet", "winter", "bright"],
  "Grape": ["vine", "wine", "cluster", "purple", "raisin", "juice", "snack", "round"],
  "Blueberry": ["tiny", "antioxidant", "muffin", "bush", "dark", "pancake", "handful", "summer"],
  "Mango": ["tropical", "golden", "smoothie", "sticky", "exotic", "chutney", "juicy", "pit"],
  "Papaya": ["tropical", "seeds", "enzyme", "exotic", "soft", "breakfast", "orange", "creamy"],

  // Animals
  "Dog": ["loyal", "bark", "fetch", "tail", "pet", "walk", "collar", "friend"],
  "Wolf": ["pack", "howl", "wild", "forest", "hunt", "gray", "fierce", "night"],
  "Cat": ["purr", "whiskers", "nap", "meow", "claw", "independent", "curious", "soft"],
  "Lynx": ["wild", "tufts", "forest", "stealth", "spotted", "nocturnal", "paws", "rare"],
  "Horse": ["gallop", "saddle", "mane", "stable", "ride", "hoof", "fast", "ranch"],
  "Donkey": ["stubborn", "ears", "bray", "farm", "carry", "gray", "hardy", "kick"],
  "Dolphin": ["ocean", "smart", "jump", "pod", "sonar", "playful", "fin", "friendly"],
  "Shark": ["teeth", "ocean", "fin", "predator", "jaws", "fast", "deep", "feared"],
  "Eagle": ["soar", "talons", "nest", "majestic", "freedom", "mountain", "keen", "wings"],
  "Hawk": ["hunt", "swoop", "keen", "perch", "fast", "prey", "feathers", "sky"],
  "Rabbit": ["hop", "carrot", "burrow", "fluffy", "ears", "fast", "cute", "warren"],
  "Hare": ["sprint", "wild", "long", "field", "fast", "brown", "legs", "meadow"],
  "Crocodile": ["swamp", "snap", "scales", "ancient", "lurk", "river", "teeth", "ambush"],
  "Alligator": ["swamp", "reptile", "snout", "lurk", "river", "armored", "powerful", "marsh"],

  // Movies
  "Titanic": ["ship", "iceberg", "romance", "sinking", "ocean", "epic", "classic", "rose"],
  "Poseidon": ["ship", "capsized", "ocean", "disaster", "wave", "survive", "water", "storm"],
  "Batman": ["cape", "dark", "gotham", "hero", "cave", "night", "mask", "justice"],
  "Spider-Man": ["web", "hero", "swing", "mask", "city", "powers", "suit", "climb"],
  "Frozen": ["snow", "sister", "magic", "castle", "cold", "sing", "kingdom", "ice"],
  "Tangled": ["tower", "hair", "princess", "lanterns", "dream", "kingdom", "magic", "adventure"],
  "Jaws": ["shark", "ocean", "beach", "fear", "boat", "summer", "bite", "hunt"],
  "Piranha": ["fish", "river", "swarm", "teeth", "danger", "water", "attack", "school"],
  "Shrek": ["ogre", "swamp", "funny", "layers", "quest", "fairy", "green", "donkey"],
  "Monsters Inc": ["scare", "closet", "laugh", "factory", "door", "furry", "power", "kids"],
  "Avatar": ["blue", "alien", "nature", "flying", "planet", "war", "connect", "forest"],
  "Pandorum": ["space", "ship", "dark", "survive", "sleep", "crew", "mystery", "danger"],

  // Food
  "Pizza": ["cheese", "slice", "oven", "round", "toppings", "delivery", "dough", "Italian"],
  "Flatbread": ["thin", "baked", "simple", "crispy", "dough", "warm", "topped", "rustic"],
  "Sushi": ["rice", "fish", "roll", "seaweed", "chopsticks", "wasabi", "fresh", "Japanese"],
  "Sashimi": ["raw", "slice", "fish", "fresh", "delicate", "thin", "pure", "elegant"],
  "Burger": ["bun", "patty", "grill", "juicy", "ketchup", "lettuce", "stack", "classic"],
  "Sandwich": ["bread", "layers", "lunch", "filling", "slice", "cold", "packed", "simple"],
  "Pasta": ["sauce", "boil", "Italian", "noodle", "twirl", "cheese", "al-dente", "warm"],
  "Noodles": ["soup", "slurp", "long", "bowl", "broth", "Asian", "chopsticks", "hot"],
  "Taco": ["shell", "filling", "spicy", "Tuesday", "crunch", "salsa", "Mexican", "fold"],
  "Burrito": ["wrap", "stuffed", "big", "beans", "rice", "foil", "Mexican", "roll"],
  "Ice Cream": ["cold", "scoop", "cone", "summer", "sweet", "flavor", "melt", "creamy"],
  "Gelato": ["Italian", "smooth", "dense", "rich", "cold", "artisan", "cup", "flavor"],

  // Sports
  "Soccer": ["goal", "kick", "field", "team", "ball", "referee", "match", "penalty"],
  "Futsal": ["indoor", "small", "fast", "court", "team", "ball", "quick", "skill"],
  "Basketball": ["hoop", "dribble", "court", "slam", "bounce", "tall", "three", "net"],
  "Netball": ["hoop", "pass", "court", "team", "position", "throw", "goal", "zone"],
  "Tennis": ["racket", "serve", "court", "net", "ball", "match", "ace", "volley"],
  "Badminton": ["shuttle", "racket", "net", "court", "smash", "light", "fast", "feather"],
  "Swimming": ["pool", "lane", "stroke", "fast", "dive", "water", "lap", "race"],
  "Diving": ["board", "splash", "twist", "pool", "deep", "jump", "score", "flip"],
  "Boxing": ["ring", "gloves", "punch", "round", "knockout", "fight", "corner", "bell"],
  "Wrestling": ["mat", "pin", "grapple", "hold", "strength", "match", "takedown", "grip"],
  "Golf": ["club", "hole", "green", "swing", "par", "drive", "putt", "course"],
  "Mini Golf": ["windmill", "fun", "putt", "obstacle", "course", "family", "colorful", "hole"],

  // Jobs
  "Doctor": ["hospital", "stethoscope", "heal", "medicine", "patient", "diagnosis", "white", "care"],
  "Nurse": ["care", "hospital", "patient", "scrubs", "vital", "shift", "assist", "compassion"],
  "Chef": ["kitchen", "cook", "knife", "taste", "recipe", "hat", "flame", "plate"],
  "Baker": ["oven", "dough", "bread", "flour", "early", "sweet", "rise", "knead"],
  "Pilot": ["cockpit", "fly", "sky", "altitude", "uniform", "travel", "wings", "landing"],
  "Flight Attendant": ["cabin", "safety", "aisle", "service", "travel", "uniform", "cart", "smile"],
  "Teacher": ["classroom", "lesson", "board", "grade", "educate", "students", "homework", "explain"],
  "Tutor": ["private", "study", "help", "session", "improve", "one-on-one", "patient", "learn"],
  "Firefighter": ["hose", "brave", "truck", "rescue", "flames", "ladder", "helmet", "siren"],
  "Paramedic": ["ambulance", "emergency", "save", "rush", "first-aid", "siren", "respond", "vital"],
  "Lawyer": ["court", "argue", "case", "brief", "client", "defense", "objection", "law"],
  "Judge": ["gavel", "court", "ruling", "robe", "verdict", "bench", "honor", "sentence"],

  // Places
  "Beach": ["sand", "waves", "sun", "towel", "swim", "surf", "shore", "relax"],
  "Lake": ["calm", "boat", "fish", "dock", "reflection", "nature", "peaceful", "swim"],
  "Mountain": ["peak", "climb", "snow", "altitude", "hike", "view", "tall", "steep"],
  "Hill": ["slope", "gentle", "green", "rolling", "walk", "grass", "view", "rise"],
  "Library": ["books", "quiet", "read", "shelves", "study", "knowledge", "card", "whisper"],
  "Bookstore": ["books", "browse", "buy", "shelves", "coffee", "new", "bestseller", "cozy"],
  "Hospital": ["beds", "doctor", "emergency", "sterile", "heal", "ward", "visit", "white"],
  "Clinic": ["appointment", "doctor", "checkup", "small", "waiting", "health", "visit", "local"],
  "Airport": ["planes", "terminal", "gate", "luggage", "boarding", "travel", "runway", "security"],
  "Train Station": ["platform", "tracks", "schedule", "commute", "ticket", "departure", "waiting", "rails"],
  "Museum": ["exhibits", "history", "art", "guided", "ancient", "gallery", "quiet", "culture"],
  "Gallery": ["art", "paintings", "exhibit", "walls", "opening", "modern", "display", "creative"],
};

export function generateBotClue(word: string, usedClues: string[]): string {
  const clues = WORD_CLUES[word] || [];
  const available = clues.filter(c => !usedClues.includes(c.toLowerCase()));
  if (available.length > 0) {
    return available[Math.floor(Math.random() * available.length)];
  }
  // Fallback generic clues
  const fallbacks = ["thing", "stuff", "nice", "cool", "good", "hmm", "interesting", "related"];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

export function generateBotVote(
  botId: string,
  botRole: "civilian" | "impostor",
  players: { id: string; clue?: string; role?: string }[],
  impostorIds?: string[]
): string {
  const others = players.filter(p => p.id !== botId);
  
  if (botRole === "impostor") {
    // Impostor votes randomly for a civilian
    const civilians = others.filter(p => p.role === "civilian");
    if (civilians.length > 0) {
      return civilians[Math.floor(Math.random() * civilians.length)].id;
    }
  }
  
  // Civilians have a chance to detect an impostor
  // 40% chance to correctly vote for an impostor, 60% random
  const aliveImpostors = (impostorIds || []).filter(id => id !== botId && others.some(p => p.id === id));
  if (Math.random() < 0.4 && aliveImpostors.length > 0) {
    return aliveImpostors[Math.floor(Math.random() * aliveImpostors.length)];
  }
  
  // Random vote
  return others[Math.floor(Math.random() * others.length)].id;
}
