const fs = require('fs');

const characterCode = fs.readFileSync('../js/character.js', 'utf8');
const mentorsRegex = /MENTORS_BY_IDEOLOGY:\s*(\{[\s\S]*?\n\s*\}),\s*MENTOR_AUTONOMO/m;
const match = characterCode.match(mentorsRegex);

let italyMentors = {};
if (match) {
    const objStr = match[1];
    italyMentors = eval('(' + objStr + ')');
}

const nationsData = JSON.parse(fs.readFileSync('../data/nations.json', 'utf8'));

function mapIdeologyKeys(mentorsObj) {
    const mapped = {};
    for (const [key, value] of Object.entries(mentorsObj)) {
        let newKey = key;
        if (key === 'radicale') newKey = 'estrema-sinistra';
        if (key === 'estremistra') newKey = 'estrema-destra';
        mapped[newKey] = value;
    }
    return mapped;
}

const newMentorsDB = {
    italy: italyMentors,
    france: mapIdeologyKeys(nationsData.france.mentors),
    germany: mapIdeologyKeys(nationsData.germany.mentors),
    uk: mapIdeologyKeys(nationsData.uk.mentors)
};

fs.writeFileSync('../data/mentors.json', JSON.stringify(newMentorsDB, null, 2));
console.log("data/mentors.json has been properly mapped and rebuilt!");
