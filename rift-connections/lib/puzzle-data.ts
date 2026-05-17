import abilitiesDB from './abilities-db.json';
import autoChampionsDB from './champions-db-auto.json';

export interface ConnectionCategory {
  id: string;
  title: string;
  difficulty: 'yellow' | 'green' | 'blue' | 'purple';
  description: string;
  items: string[]; // Exactly 4 items
}

export interface Puzzle {
  date: string; // YYYY-MM-DD
  puzzleNumber: number;
  categories: ConnectionCategory[];
}

// Deterministic pseudorandom generator seeded by date
function seedRandom(seedStr: string) {
  let h = 0;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(31, h) + seedStr.charCodeAt(i) | 0;
  }
  return function() {
    h = Math.imul(h, 48271) | 0;
    return (h >>> 0) / 4294967296;
  };
}

// Calculate days between two dates to get sequential daily puzzle numbers
export const getPuzzleNumberForDate = (dateStr: string): number => {
  const refDate = new Date('2026-05-13'); // Date of Puzzle Number #1
  const targetDate = new Date(dateStr);
  const diffTime = targetDate.getTime() - refDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays > 0 ? diffDays : 1;
};

// High-fidelity handcrafted flagship puzzles for fallback/direct overrides
export const PUZZLE_DATA: Record<string, Puzzle> = {};

// Classic champion groupings database (the original connection game style)
export const CHAMPION_CATEGORIES_DB: Omit<ConnectionCategory, 'difficulty'>[] = [
  ...autoChampionsDB as Omit<ConnectionCategory, 'difficulty'>[],
  { id: 'energy-users', title: 'Energy Resource Users', description: 'Champions who utilize Energy as their primary mechanical resource.', items: ['Shen', 'Akali', 'Kennen', 'Zed'] },
  { id: 'freljord-natives', title: 'Freljord Champions', description: 'Champions native to the frozen wastes of the Freljord.', items: ['Ashe', 'Braum', 'Sejuani', 'Olaf'] },
  { id: 'shadow-isles-born', title: 'Shadow Isles Specters', description: 'Champions hailing from or corrupted by the Shadow Isles.', items: ['Hecarim', 'Kalista', 'Thresh', 'Viego'] },
  { id: 'bandle-city-yordles', title: 'Bandle City Yordles', description: 'Magical, furry yordle champions residing in Bandle City.', items: ['Lulu', 'Teemo', 'Tristana', 'Veigar'] },
  { id: 'noxus-nobles', title: 'Noxian Powerhouse Warriors', description: 'Champions fighting for the glory of the Noxian Empire.', items: ['Darius', 'Draven', 'Katarina', 'Sion'] },
  { id: 'hook-pullers', title: 'Hook Skillshot Supports', description: 'Champions who grab or pull opponents with their hooks.', items: ['Blitzcrank', 'Nautilus', 'Pyke', 'Thresh'] },
  { id: 'kda-singers', title: 'K/DA Virtual Pop Stars', description: 'Members of the virtual music pop group K/DA.', items: ['Ahri', 'Evelynn', "Kai'Sa", 'Seraphine'] },
  { id: 'demacia-knights', title: 'Demacian Protectors', description: 'Champions representing the noble kingdom of Demacia.', items: ['Garen', 'Jarvan IV', 'Lux', 'Vayne'] },
  { id: 'shurima-ascended', title: 'Ascended Shuriman Gods', description: 'Champions transformed by the Sun Disc of Shurima.', items: ['Azir', 'Nasus', 'Renekton', 'Xerath'] },
  { id: 'void-horrors', title: 'Void Horrors', description: 'Terrifying aberrations originating from the Void.', items: ["Cho'Gath", "Kog'Maw", "Rek'Sai", "Vel'Koz"] },
  { id: 'shapeshifters', title: 'Form Shapeshifters', description: 'Champions that toggle or transform between different forms.', items: ['Elise', 'Gnar', 'Nidalee', 'Shyvana'] },
  { id: 'ammo-reloaders', title: 'Ammo Reload Marksmen', description: 'Marksmen champions who reload their weapons after limited shots.', items: ['Graves', 'Jhin', 'Aphelios', 'Corki'] },
  { id: 'bilgewater-scoundrels', title: 'Bilgewater Scoundrels', description: 'Scoundrels, pirates, and monsters from the lawless Bilgewater port.', items: ['Gangplank', 'Illaoi', 'Miss Fortune', 'Nautilus'] },
  { id: 'piltover-inventors', title: 'Piltover Officers & Citizens', description: 'Champions defending or inventing hextech in Piltover.', items: ['Caitlyn', 'Vi', 'Jayce', 'Ezreal'] },
  { id: 'manaless-cooldowns', title: 'Mana-free Slayers', description: 'Champions who use cooldowns only with no mana or resources.', items: ['Katarina', 'Riven', 'Yasuo', 'Garen'] },
  { id: 'beast-claws', title: 'Claw and Feral Slashers', description: 'Beastly champions fighting primarily using raw animal claws.', items: ['Rengar', 'Warwick', 'Volibear', 'Udyr'] },
  { id: 'four-letters', title: 'Four-Letter Champion Names', description: 'Champions whose canonical name consists of exactly four characters.', items: ['Bard', 'Gnar', 'Lulu', 'Ryze'] },
  { id: 'darkin-weapon-hosts', title: 'Darkin Corrupted Hosts', description: 'Champions hosting ancient, corrupted Darkin weapons.', items: ['Aatrox', 'Kayn', 'Varus', 'Naafiri'] },
  { id: 'targon-aspects', title: 'Aspects of Mount Targon', description: 'Mortals who host divine Aspects of Targon.', items: ['Taric', 'Diana', 'Leona', 'Pantheon'] },
  { id: 'zaun-underworld', title: 'Zaun Chemtech Experiments', description: 'Monsters and innovators originating from the undercity Zaun.', items: ['Urgot', 'Singed', 'Dr. Mundo', 'Zac'] },
  { id: 'celestial-entities', title: 'Celestial Entities', description: 'Ancient, cosmic entities residing in the stars.', items: ['Aurelion Sol', 'Bard', 'Soraka', 'Pantheon'] },
  { id: 'fire-wielders', title: 'Flame Magic Users', description: 'Champions whose abilities or lore focus purely on fire magic.', items: ['Brand', 'Annie', 'Milio', 'Ornn'] },
  { id: 'ice-wielders', title: 'Frost and Ice Mages', description: 'Champions wielding cryomancy and frost magic.', items: ['Anivia', 'Lissandra', 'Nunu', 'Willump'] },
  { id: 'kings-emperors', title: 'Kings and Emperors', description: 'Monarchs and rulers governing major regions of Runeterra.', items: ['Azir', 'Jarvan IV', 'Viego', 'Gangplank'] },
  { id: 'shield-supports', title: 'Shield-granting Enchanters', description: 'Supports capable of granting shields to allies.', items: ['Janna', 'Karma', 'Lulu', 'Morgana'] },
  { id: 'swordmasters', title: 'Esports Blade Masters', description: 'Duelists and master swordsmen of Runeterra.', items: ['Master Yi', 'Fiora', 'Yasuo', 'Yone'] },
  { id: 'music-themes', title: 'Music-themed Champions', description: 'Champions with audio, acoustic, or music elements.', items: ['Sona', 'Seraphine', 'Bard', 'Jhin'] },
  { id: 'pet-summoners', title: 'Minion / Pet Summoners', description: 'Champions capable of summoning companion pets during battle.', items: ['Annie', 'Ivern', 'Yorick', 'Malzahar'] },
  { id: 'gunslingers', title: 'Gun-wielding Outlaws', description: 'Champions fighting with firearms and guns.', items: ['Lucian', 'Graves', 'Jhin', 'Corki'] },
  { id: 'archers', title: 'Bow and Arrow Archers', description: 'Champions utilizing traditional bows and arrows.', items: ['Ashe', 'Varus', 'Twitch', 'Vayne'] },
  { id: 'water-sea', title: 'Sea and Ocean Born', description: 'Champions with deep sea, water, or aquatic themes.', items: ['Nami', 'Fizz', 'Nautilus', 'Pyke'] },
  { id: 'stone-clay', title: 'Stone / Golem Constructs', description: 'Champions built from stone, minerals, or magic soil.', items: ['Malphite', 'Galio', 'Blitzcrank', 'Maokai'] },
  { id: 'shadow-magic', title: 'Shadow Magic Assassins', description: 'Assassins utilizing darkness or shadow magic.', items: ['Zed', 'Shaco', 'Nocturne', 'Evelynn'] },
  { id: 'time-manipulators', title: 'Time & Space Chronomancers', description: 'Champions manipulating time and chronomancy.', items: ['Ekko', 'Zilean', 'Ryze', 'Bard'] },
  { id: 'void-born-only', title: 'Void Aberrations', description: 'Alien monsters born in the dark Void.', items: ["Kha'Zix", 'Malzahar', 'Kassadin', "Cho'Gath"] },
  { id: 'poison-spitters', title: 'Poison and Toxic Users', description: 'Champions who deal toxic damage or poison.', items: ['Cassiopeia', 'Singed', 'Twitch', 'Teemo'] },
  { id: 'spirit-ionians', title: 'Ionian Spiritualists', description: 'Champions wielding Ionian spirit energies.', items: ['Karma', 'Irelia', 'Yasuo', 'Yone'] },
  { id: 'hextech-innovators', title: 'Hextech Scientists', description: 'Scientific minds researching Hextech technology.', items: ['Heimerdinger', 'Viktor', 'Jayce', 'Ziggs'] },
  { id: 'cooldown-manaless', title: 'Energy and Resource Free', description: 'Champions fighting with no cooldown resources.', items: ['Katarina', 'Riven', 'Yasuo', 'Tryndamere'] },
  { id: 'ammo-shooters', title: 'Marksmen with Ammo Gauges', description: 'Marksmen using ammunition mechanics.', items: ['Graves', 'Jhin', 'Aphelios', 'Jinx'] },
];

// Champion abilities database loaded from DataDragon (Q/W/E/R for each champion)
export const ABILITIES_CATEGORIES_DB: Omit<ConnectionCategory, 'difficulty'>[] = abilitiesDB as Omit<ConnectionCategory, 'difficulty'>[];

// Helper: shuffle and pick 4 non-overlapping categories from a pool
function pickFourCategories(
  pool: Omit<ConnectionCategory, 'difficulty'>[],
  rand: () => number
): Omit<ConnectionCategory, 'difficulty'>[] {
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const selected: Omit<ConnectionCategory, 'difficulty'>[] = [];
  const chosenItems = new Set<string>();
  for (const cat of shuffled) {
    if (!cat?.items) continue;
    if (!cat.items.some(item => chosenItems.has(item))) {
      selected.push(cat);
      cat.items.forEach(item => chosenItems.add(item));
    }
    if (selected.length === 4) break;
  }
  return selected;
}

export const getLatestPuzzleDate = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

export const getPuzzleByDate = (date: string, mode: 'champions' | 'abilities' = 'champions'): Puzzle | undefined => {
  if (PUZZLE_DATA[date]) return PUZZLE_DATA[date];

  const puzzleNumber = getPuzzleNumberForDate(date);
  // Include mode in seed so champions and abilities tracks have different puzzles on the same date
  const rand = seedRandom(date + ':' + mode);
  const pool = mode === 'abilities' ? ABILITIES_CATEGORIES_DB : CHAMPION_CATEGORIES_DB;
  const selected = pickFourCategories(pool, rand);

  if (selected.length < 4) return undefined;

  const difficulties: ('yellow' | 'green' | 'blue' | 'purple')[] = ['yellow', 'green', 'blue', 'purple'];
  const categories = selected.map((cat, idx) => ({
    ...cat,
    difficulty: difficulties[idx],
  })) as ConnectionCategory[];

  // Use composite key so each mode is an independent puzzle in the game store
  return { date: `${date}:${mode}`, puzzleNumber, categories };
};

export const getPuzzleDateList = (): string[] => {
  const todayStr = getLatestPuzzleDate();
  const list = new Set<string>();
  Object.keys(PUZZLE_DATA).forEach(dateStr => {
    if (dateStr <= todayStr) list.add(dateStr);
  });
  for (let i = 0; i < 15; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    if (dateStr >= '2026-05-13') list.add(dateStr);
  }
  return Array.from(list).sort((a, b) => b.localeCompare(a));
};

// Generate a fully random puzzle for Unlimited Mode with explicit mode choice
export const getUnlimitedPuzzle = (seed?: number, mode: 'champions' | 'abilities' = 'champions'): Puzzle => {
  const s = seed ?? Date.now();
  let h = s;
  const rand = () => {
    h = Math.imul(h ^ (h >>> 13), 0x5bd1e995) | 0;
    h ^= h >>> 15;
    return (h >>> 0) / 4294967296;
  };

  const pool = mode === 'abilities' ? ABILITIES_CATEGORIES_DB : CHAMPION_CATEGORIES_DB;
  const selected = pickFourCategories(pool, rand);

  const difficulties: ('yellow' | 'green' | 'blue' | 'purple')[] = ['yellow', 'green', 'blue', 'purple'];
  const categories = selected.map((cat, idx) => ({
    ...cat,
    difficulty: difficulties[idx],
  })) as ConnectionCategory[];

  return { date: `unlimited:${mode}:${s}`, puzzleNumber: 0, categories };
};
