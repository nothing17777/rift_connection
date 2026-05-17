const fs = require('fs');

async function generateHugeChampionBank() {
  const versionRes = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
  const versions = await versionRes.json();
  const currentVersion = versions[0];
  
  const res = await fetch(`https://ddragon.leagueoflegends.com/cdn/${currentVersion}/data/en_US/champion.json`);
  const data = await res.json();
  const champions = Object.values(data.data);
  
  const db = [];
  let idCounter = 1;

  const shuffle = (array) => {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
  };

  const getOverlap = (arr1, arr2) => {
    return arr1.filter(item => arr2.includes(item)).length;
  };

  const createChunks = (array, titlePrefix, descPrefix) => {
    if (array.length < 4) return;
    
    // We want to generate as many unique chunks as possible
    // where no two chunks share more than 2 items.
    const maxRepetitions = 50; 
    const validChunks = [];
    
    for (let r = 0; r < maxRepetitions; r++) {
        const shuffled = shuffle([...array]);
        for (let i = 0; i < shuffled.length - 3; i += 4) {
          const chunk = shuffled.slice(i, i + 4);
          
          // Check overlap with existing chunks in this category
          let tooMuchOverlap = false;
          for (const existing of validChunks) {
             if (getOverlap(chunk, existing) > 2) {
                 tooMuchOverlap = true;
                 break;
             }
          }
          
          if (!tooMuchOverlap) {
              validChunks.push(chunk);
              db.push({
                id: `auto-${idCounter++}`,
                title: `${titlePrefix}`,
                description: `${descPrefix}`,
                items: chunk
              });
          }
        }
    }
  };

  const tagsMap = {};
  champions.forEach(c => {
      c.tags.forEach(tag => {
          if (!tagsMap[tag]) tagsMap[tag] = [];
          tagsMap[tag].push(c.name);
      });
  });
  for (const [tag, champs] of Object.entries(tagsMap)) {
    createChunks(champs, `${tag} Champions`, `League of Legends champions classified as ${tag}.`);
  }

  const partypeMap = {};
  champions.forEach(c => {
      let partype = c.partype;
      if (partype === "None") partype = "Manaless";
      if (partype && partype !== "Mana") {
          if (!partypeMap[partype]) partypeMap[partype] = [];
          partypeMap[partype].push(c.name);
      }
  });
  for (const [partype, champs] of Object.entries(partypeMap)) {
    createChunks(champs, `${partype} Users`, `Champions who use ${partype} as their resource.`);
  }

  const lengthsMap = {};
  champions.forEach(c => {
      const len = c.name.length;
      if (len >= 3 && len <= 8) {
          if (!lengthsMap[len]) lengthsMap[len] = [];
          lengthsMap[len].push(c.name);
      }
  });
  for (const [len, champs] of Object.entries(lengthsMap)) {
    createChunks(champs, `${len}-Letter Champions`, `Champions with exactly ${len} letters in their name.`);
  }
  
  const initialMap = {};
  champions.forEach(c => {
      const initial = c.name.charAt(0).toUpperCase();
      if (!initialMap[initial]) initialMap[initial] = [];
      initialMap[initial].push(c.name);
  });
  for (const [initial, champs] of Object.entries(initialMap)) {
    createChunks(champs, `Starts with '${initial}'`, `Champions whose name starts with the letter ${initial}.`);
  }

  const endLetterMap = {};
  champions.forEach(c => {
      const end = c.name.charAt(c.name.length - 1).toUpperCase();
      if (end >= 'A' && end <= 'Z') {
          if (!endLetterMap[end]) endLetterMap[end] = [];
          endLetterMap[end].push(c.name);
      }
  });
  for (const [end, champs] of Object.entries(endLetterMap)) {
    createChunks(champs, `Ends with '${end}'`, `Champions whose name ends with the letter ${end}.`);
  }

  fs.writeFileSync('./lib/champions-db-auto.json', JSON.stringify(db, null, 2));
  console.log(`Generated ${db.length} overlapping champion categories (max overlap: 2)!`);
}

generateHugeChampionBank();
