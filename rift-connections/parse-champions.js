const fs = require('fs');

async function generateChampionBank() {
  const versionRes = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
  const versions = await versionRes.json();
  const currentVersion = versions[0];
  
  const res = await fetch(`https://ddragon.leagueoflegends.com/cdn/${currentVersion}/data/en_US/champion.json`);
  const data = await res.json();
  const champions = Object.values(data.data);
  
  const tagsMap = {};
  const partypeMap = {};
  
  // Hand-crafted additional groupings we can deduce or hardcode to get more variety
  const fourLetterChamps = [];
  const fiveLetterChamps = [];
  const sixLetterChamps = [];
  
  champions.forEach(champ => {
    const name = champ.name;
    
    // Group by Tags (Assassin, Fighter, Mage, Marksman, Support, Tank)
    champ.tags.forEach(tag => {
      if (!tagsMap[tag]) tagsMap[tag] = [];
      tagsMap[tag].push(name);
    });
    
    // Group by Resource Type (Mana, Energy, Blood Well, None, etc.)
    const partype = champ.partype;
    if (partype && partype !== "None" && partype !== "Mana") { // Too many Mana users to be interesting
      if (!partypeMap[partype]) partypeMap[partype] = [];
      partypeMap[partype].push(name);
    }
    if (partype === "None") {
        if (!partypeMap["Manaless"]) partypeMap["Manaless"] = [];
        partypeMap["Manaless"].push(name);
    }

    // Name length groupings
    if (name.length === 4) fourLetterChamps.push(name);
    if (name.length === 5) fiveLetterChamps.push(name);
    if (name.length === 6) sixLetterChamps.push(name);
  });
  
  const db = [];
  let idCounter = 1;

  // Helper to shuffle array
  const shuffle = (array) => {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
  };

  // Helper to chunk arrays into groups of 4
  const createChunks = (array, titlePrefix, descPrefix) => {
    const shuffled = shuffle([...array]);
    for (let i = 0; i < shuffled.length - 3; i += 4) {
      db.push({
        id: `auto-${idCounter++}`,
        title: `${titlePrefix} (Group ${Math.floor(i/4) + 1})`,
        description: `${descPrefix}`,
        items: shuffled.slice(i, i + 4)
      });
    }
  };

  // Generate chunks for all collected mappings
  for (const [tag, champs] of Object.entries(tagsMap)) {
    createChunks(champs, `${tag} Champions`, `League of Legends champions classified as ${tag}.`);
  }
  
  for (const [partype, champs] of Object.entries(partypeMap)) {
    createChunks(champs, `${partype} Users`, `Champions who use ${partype} as their resource.`);
  }

  createChunks(fourLetterChamps, `4-Letter Champions`, `Champions with exactly 4 letters in their name.`);
  createChunks(fiveLetterChamps, `5-Letter Champions`, `Champions with exactly 5 letters in their name.`);
  createChunks(sixLetterChamps, `6-Letter Champions`, `Champions with exactly 6 letters in their name.`);
  
  // Save to file
  fs.writeFileSync('./lib/champions-db-auto.json', JSON.stringify(db, null, 2));
  console.log(`Generated ${db.length} new champion categories!`);
}

generateChampionBank();
