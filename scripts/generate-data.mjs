import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const DIR = join(import.meta.dirname, '..', 'src-tauri', 'data')
mkdirSync(DIR, { recursive: true })

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }
function rng(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }
function rngf(min, max, dec = 1) { return parseFloat((Math.random() * (max - min) + min).toFixed(dec)) }

function pickN(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(n, arr.length))
}

// ── Movies ──────────────────────────────────────────────

const movieAdj = [
  'Dark', 'Last', 'Final', 'Silent', 'Broken', 'Hidden', 'Lost', 'Eternal', 'Burning', 'Frozen',
  'Rising', 'Fallen', 'Crimson', 'Emerald', 'Savage', 'Wild', 'Sacred', 'Cursed', 'Forgotten',
  'Infinite', 'Atomic', 'Neon', 'Shadow', 'Iron', 'Golden', 'Silver', 'Crystal', 'Phantom',
  'Diamond', 'Mystic', 'Solar', 'Cosmic', 'Velvet', 'Thunder', 'Midnight', 'Solar', 'Crimson',
  'Violent', 'Pure', 'Twisted', 'Bitter', 'Tender', 'Fierce', 'Brutal', 'Cold', 'Warm', 'Sharp',
  'Blinding', 'Ancient', 'Shattered', 'Hollow', 'Lonesome', 'Wicked', 'Fatal', 'Mortal', 'Vivid',
  'Electric', 'Distant', 'Bleak', 'Brave', 'Restless', 'Endless', 'Epic', 'Mighty', 'Vicious',
  'Toxic', 'Radiant', 'Fading', 'Raging', 'Blazing', 'Chilling', 'Howling', 'Lurking', 'Stolen',
  'Twilight', 'Harsh', 'Silken', 'Rebel', 'Falling', 'Drifting', 'Scarlet', 'Frost',
  'Gilded', 'Haunted', 'Smoldering', 'Thundering', 'Whispering', 'Celestial',
]

const movieNoun = [
  'Legacy', 'Horizon', 'Empire', 'Reckoning', 'Storm', 'Dawn', 'Fury', 'Justice', 'Redemption',
  'Vengeance', 'Kingdom', 'Requiem', 'Odyssey', 'Prophecy', 'Conspiracy', 'Siege', 'Paradox',
  'Crossing', 'Awakening', 'Descent', 'Eclipse', 'Contagion', 'Uprising', 'Collision', 'Mirage',
  'Obsession', 'Deliverance', 'Abyss', 'Catalyst', 'Nemesis', 'Sanctuary', 'Convergence', 'Havoc',
  'Dominion', 'Revelation', 'Schism', 'Solitude', 'Pilgrim', 'Vortex', 'Threshold', 'Passage',
  'Labyrinth', 'Expanse', 'Frontier', 'Genesis', 'Exodus', 'Infinity', 'Oblivion', 'Paradise',
  'Purgatory', 'Asylum', 'Carnival', 'Circus', 'Colony', 'Covenant', 'Crucible', 'Cypher',
  'Destiny', 'Dystopia', 'Enclave', 'Equinox', 'Fortress', 'Fracture', 'Gambit', 'Gravity',
  'Harvest', 'Heritage', 'Hypnosis', 'Illusion', 'Inferno', 'Journey', 'Legion', 'Lament',
  'Masquerade', 'Memento', 'Monolith', 'Nebula', 'Nexus', 'Orbit', 'Outcry',
  'Overlord', 'Pandemonium', 'Penance', 'Pinnacle', 'Prey', 'Quarantine', 'Rebellion', 'Ritual',
  'Roulette', 'Salvation', 'Savior', 'Scourge', 'Shrine', 'Solstice', 'Specter', 'Syndrome',
  'Tempest', 'Torment', 'Tribute', 'Trinity', 'Tyranny', 'Vendetta', 'Vigil', 'Wasteland',
  'Wildfire', 'Witness', 'Zenith', 'Aftermath', 'Castle',
]

const movieNamePool = [
  'The Godfather', 'Casablanca', 'Citizen Kane', 'Gone with the Wind', 'Sunset Boulevard',
  'Psycho', 'Rear Window', 'Vertigo', 'North by Northwest', 'The Graduate',
  'The Sound of Music', 'Lawrence of Arabia', 'Ben-Hur', 'The Apartment', 'Bridge on the River Kwai',
  'From Here to Eternity', 'On the Waterfront', 'Singin\' in the Rain',
  'Roman Holiday', 'The Third Man', 'Double Indemnity', 'Rashomon', 'Seven Samurai',
  'The 400 Blows', 'Breathless', 'The Bicycle Thief', 'La Dolce Vita', 'The Exorcist',
  'Jaws', 'Close Encounters of the Third Kind', 'E.T.', 'Raiders of the Lost Ark', 'Indiana Jones',
  'Back to the Future', 'Ghostbusters', 'Die Hard', 'The Terminator', 'Aliens',
  'Predator', 'Lethal Weapon', 'Beverly Hills Cop', 'Top Gun', 'Dirty Dancing',
  'When Harry Met Sally', 'The Princess Bride', 'Stand by Me', 'The Breakfast Club', 'Ferris Bueller\'s Day Off',
  'Platoon', 'Apocalypse Now', 'Full Metal Jacket', 'The Deer Hunter', 'Taxi Driver',
  'Raging Bull', 'Good Will Hunting', 'The Green Mile', 'Fargo', 'The Big Lebowski',
  'Saving Private Ryan', 'Gladiator', 'Braveheart', 'The Departed', 'The Prestige',
  'Memento', 'City of God', 'The Sixth Sense', 'The Usual Suspects', 'Se7en',
  'The Silence of the Lambs', 'Schindler\'s List', 'Star Wars', 'The Empire Strikes Back', 'Return of the Jedi',
  'Jurassic Park', 'Toy Story', 'Finding Nemo', 'The Incredibles', 'Up',
  'WALL-E', 'Ratatouille', 'Spirited Away', 'The Lion King', 'Beauty and the Beast',
  'Aladdin', 'Frozen', 'Moana', 'Coco', 'Inside Out',
  'Avatar', 'Titanic', 'The Matrix', 'Interstellar', 'Inception',
  'Blade Runner', 'Dune', 'The Martian', 'Gravity', 'Arrival',
  'Whiplash', 'La La Land', 'Moonlight', 'Get Out', 'Parasite',
  'No Country for Old Men', 'There Will Be Blood', 'The Social Network', 'The Hurt Locker', '12 Years a Slave',
  'Spotlight', 'Birdman', 'Nomadland', 'CODA', 'Everything Everywhere All at Once',
  'The Batman', 'Joker', 'Logan', 'Deadpool', 'Mad Max Fury Road',
  'John Wick', 'The Dark Knight', 'Batman Begins', 'Man of Steel', 'Wonder Woman',
  'The Lord of the Rings', 'Harry Potter', 'Pulp Fiction', 'Fight Club', 'Forrest Gump',
  'The Shawshank Redemption', 'The Truman Show', 'The Fifth Element', 'District 9', 'Children of Men',
  'Pan\'s Labyrinth', 'The Shape of Water', 'Prometheus', 'Alien', 'Blade Runner 2049',
  'Dune Part Two', 'Oppenheimer', 'Barbie', 'Poor Things', 'The Zone of Interest',
  'The Killer', 'Past Lives', 'Anatomy of a Fall', 'American Fiction', 'The Holdovers',
  'Rocky', 'Goodfellas', 'Chinatown', 'Network', 'Annie Hall',
  'Unforgiven', 'American Beauty', 'Million Dollar Baby', 'Slumdog Millionaire', 'The King\'s Speech',
  'Argo', 'Green Book', 'Roma', 'Minari', 'Drive',
  'The Witch', 'Hereditary', 'Midsommar', 'The Lighthouse', 'Uncut Gems',
  'A Beautiful Mind', 'Chicago', 'Crash', 'Traffic', 'L.A. Confidential',
  'The French Connection', 'The Sting', 'One Flew Over the Cuckoo\'s Nest', 'Amadeus', 'Rain Man',
  'All About Eve', 'Some Like It Hot', 'West Side Story', 'Manhattan', 'Dog Day Afternoon',
  'Good Morning Vietnam', 'Dead Poets Society', 'Philadelphia', 'Cast Away', 'The Aviator',
  'Mystic River', 'Sideways', 'Brokeback Mountain', 'Little Miss Sunshine', 'Juno',
  'The Wrestler', 'Black Swan', 'The Artist', 'Silver Linings Playbook', 'Dallas Buyers Club',
  'Boyhood', 'Room', 'Hell or High Water', 'Lady Bird', 'The Favourite',
]

const movieGenres = ['Action', 'Adventure', 'Comedy', 'Crime', 'Drama', 'Fantasy', 'History', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller', 'Western', 'Animation', 'Biography']

function genMovieTitle(i) {
  if (i < movieNamePool.length) return movieNamePool[i]
  const p = Math.random()
  if (p < 0.35) return `The ${pick(movieAdj)} ${pick(movieNoun)}`
  if (p < 0.65) return `${pick(movieAdj)} ${pick(movieNoun)}`
  if (p < 0.85) return `${pick(movieNoun)}: ${pick(movieAdj)} ${pick(movieNoun)}`
  return `${pick(movieAdj)} ${pick(movieNoun)} ${rng(1, 10)}`
}

// ── Series ──────────────────────────────────────────────

const seriestVAdj = [
  'Secret', 'Last', 'Final', 'Silent', 'Broken', 'Hidden', 'Lost', 'Eternal', 'Burning', 'Crimson',
  'Savage', 'Wild', 'Sacred', 'Cursed', 'Forgotten', 'Dark', 'Chronic', 'Deadly', 'Wicked', 'Fatal',
  'Ghost', 'Twilight', 'Hollow', 'Shattered', 'True', 'Blue', 'Red', 'Black', 'White', 'Green',
  'Fallen', 'Rising', 'Bitter', 'Tender', 'Frozen', 'Ancient', 'Mortal', 'Brave', 'Fierce',
  'Restless', 'Endless', 'Distant', 'Electric', 'Radiant', 'Blazing', 'Chilling', 'Howling', 'Haunted',
  'Golden', 'Silver', 'Crimson', 'Emerald', 'Scarlet', 'Violent', 'Vicious', 'Toxic', 'Fading', 'Raging',
  'Lurking', 'Stolen', 'Twisted', 'Lonesome', 'Rebel', 'Falling', 'Drifting', 'Smoldering', 'Mighty',
  'Vivid', 'Bleak', 'Harsh', 'Pure', 'Cold', 'Warm', 'Sharp', 'Blinding', 'Hollow',
]

const seriesTvNoun = [
  'Kingdom', 'Empire', 'Lies', 'Blood', 'Legacy', 'Secrets', 'Night', 'Falls', 'Dead', 'Hunt',
  'Covenant', 'Chronicles', 'Diaries', 'Confessions', 'Conspiracy', 'Circle', 'Cross', 'District',
  'Division', 'Dominion', 'Dynasty', 'Faction', 'Frontier', 'Genesis', 'Heritage', 'Horizon',
  'Justice', 'Vengeance', 'Redemption', 'Reckoning', 'Storm', 'Dawn', 'Fury', 'Paradox', 'Siege',
  'Awakening', 'Descent', 'Eclipse', 'Contagion', 'Uprising', 'Collision', 'Mirage', 'Obsession',
  'Deliverance', 'Abyss', 'Sanctuary', 'Convergence', 'Havoc', 'Revelation', 'Schism', 'Solitude',
  'Vortex', 'Threshold', 'Passage', 'Labyrinth', 'Expanse', 'Exodus', 'Infinity',
  'Oblivion', 'Paradise', 'Purgatory', 'Asylum', 'Carnival', 'Colony', 'Destiny',
  'Fortress', 'Fracture', 'Gravity', 'Harvest', 'Inferno', 'Journey', 'Legion', 'Nexus',
  'Rebellion', 'Salvation', 'Scourge', 'Solstice', 'Tempest', 'Vendetta', 'Wasteland', 'Wildfire',
]

const seriesNamePool = [
  'Game of Thrones', 'Breaking Bad', 'The Wire', 'The Sopranos', 'Mad Men',
  'Better Call Saul', 'The Crown', 'Stranger Things', 'Succession', 'The Last of Us',
  'The Bear', 'Severance', 'House of the Dragon', 'The Mandalorian', 'The Boys',
  'House', 'Grey\'s Anatomy', 'Friends', 'The Office', 'Seinfeld',
  'Cheers', 'The Simpsons', 'South Park', 'Family Guy', 'Rick and Morty',
  'True Detective', 'Fargo', 'The Americans', 'Homeland', '24',
  'Dexter', 'Lost', 'The Walking Dead', 'Battlestar Galactica', 'Twin Peaks',
  'The X-Files', 'Fringe', 'Black Mirror', 'Westworld', 'The Leftovers',
  'Mindhunter', 'Ozark', 'Narcos', 'Peaky Blinders', 'Vikings',
  'The Witcher', 'Squid Game', 'Money Heist', 'Dark', 'Sherlock',
  'Doctor Who', 'Downton Abbey', 'The Handmaid\'s Tale', 'Barry', 'Atlanta',
  'Euphoria', 'White Lotus', 'Ted Lasso', 'Mr Robot', 'Chernobyl',
  'Band of Brothers', 'The Pacific', 'Planet Earth', 'Blue Planet', 'Cosmos',
  'Boardwalk Empire', 'Deadwood', 'Rome', 'Spartacus', 'The Tudors',
  'Vikings Valhalla', 'The Last Kingdom', 'Outlander', 'Bridgerton', 'Queen\'s Gambit',
  'Six Feet Under', 'The Shield', 'Justified', 'Sons of Anarchy', 'Californication',
  'Billions', 'Ray Donovan', 'The Marvelous Mrs Maisel', 'Fleabag', 'Killing Eve',
  'Luther', 'Broadchurch', 'Happy Valley', 'Line of Duty', 'Bodyguard',
  'The Night Of', 'The Jinx', 'Making a Murderer', 'When They See Us', 'Unbelievable',
  'I May Destroy You', 'Normal People', 'This Is Us', 'The Good Place', 'Parks and Recreation',
  'Brooklyn Nine-Nine', 'Community', 'Modern Family', 'It\'s Always Sunny in Philadelphia', 'Archer',
]

const kdramaPool = [
  'Crash Landing on You', 'The Glory', 'Squid Game', 'My Mister', 'Itaewon Class',
  'Sky Castle', 'Hospital Playlist', 'Reply 1988', 'Mr Sunshine', 'Goblin',
  'Descendants of the Sun', 'My Love from the Star', 'Vincenzo', 'Lawless Lawyer', 'Signal',
  'Stranger', 'Beyond Evil', 'Flower of Evil', 'Mouse', 'The Penthouse',
  'King of Pigs', 'Weak Hero Class 1', 'D.P.', 'Hellbound', 'Sweet Home',
  'All of Us Are Dead', 'Kingdom', 'Train to Busan', 'The Witch', 'Burning',
  'Parasite', 'Mother', 'The Good Bad Mother', 'Twenty Five Twenty One', 'Our Beloved Summer',
  'Hometown Cha-Cha-Cha', 'Business Proposal', 'What\'s Wrong with Secretary Kim', 'Her Private Life', 'Touch Your Heart',
  'Weightlifting Fairy Kim Bok-joo', 'Strong Girl Bong-soon', 'Fight for My Way', 'Jealousy Incarnate', 'Another Oh Hae Young',
  'Because This Is My First Life', 'The Legend of the Blue Sea', 'Heirs', 'Boys Over Flowers', 'Full House',
  'Hotel del Luna', 'Moon Lovers Scarlet Heart Ryeo', 'The King Eternal Monarch', 'Memories of the Alhambra', 'W Two Worlds',
  'While You Were Sleeping', 'Pinocchio', 'I Hear Your Voice', 'City Hunter', 'Healer',
  'Dr Romantic', 'The Trauma Code Heroes on Call', 'Romantic Doctor Kim', 'Life', 'Prison Playbook',
  'The Good Doctor', 'Doctor John', 'Live Up to Your Name', 'Doctor Stranger', 'Medical Top Team',
]

const seriesGenres = ['Action', 'Adventure', 'Comedy', 'Crime', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller', 'Biography', 'History']

function genSeriesTitle(i, isKdrama) {
  const pool = isKdrama ? kdramaPool : seriesNamePool
  if (i < pool.length) return pool[i]
  const p = Math.random()
  if (p < 0.3) return `The ${pick(seriestVAdj)} ${pick(seriesTvNoun)}`
  if (p < 0.55) return `${pick(seriestVAdj)} ${pick(seriesTvNoun)}`
  if (p < 0.75) return `${pick(seriesTvNoun)}`
  return `${pick(seriesTvNoun)} of ${pick(seriesTvNoun)}`
}

function generateEpisodes(seasonNum, count) {
  const episodes = []
  const epPrefix = ['Pilot', 'The Beginning', 'Chapter One', 'Part One', 'Genesis', 'Awakening', 'Origins', 'First Contact', 'Premiere', 'Dawn']
  const epTitles = ['The Return', 'Dark Waters', 'New Horizons', 'Crossroads', 'Reckoning', 'Fractures', 'Convergence', 'Aftermath', 'Revelations', 'The Fall', 'Redemption', 'Betrayal', 'Allies', 'Enemies', 'The Trap', 'Escape', 'The Truth', 'Sacrifice', 'Finale', 'Resolution', 'Cliffhanger', 'Flashback', 'Homecoming', 'The Storm']
  for (let e = 0; e < count; e++) {
    const title = e === 0 && seasonNum === 1 ? pick(epPrefix) : pick(epTitles)
    episodes.push({ num: e + 1, title: `${title}`, streams: [] })
  }
  return episodes
}

// ── Games ───────────────────────────────────────────────

const gameAdj = [
  'Dark', 'Last', 'Final', 'Silent', 'Broken', 'Hidden', 'Lost', 'Eternal', 'Burning', 'Crimson',
  'Savage', 'Wild', 'Sacred', 'Cursed', 'Forgotten', 'Iron', 'Golden', 'Silver', 'Crystal', 'Shadow',
  'Infinite', 'Atomic', 'Neon', 'Phantom', 'Solar', 'Cosmic', 'Ancient', 'Frozen', 'Rising', 'Fallen',
  'Mortal', 'Brave', 'Fierce', 'Vicious', 'Toxic', 'Radiant', 'Blazing', 'Fading', 'Raging', 'Howling',
  'Distant', 'Bleak', 'Twisted', 'Hollow', 'Wicked', 'Fatal', 'Vivid', 'Electric', 'Haunted', 'Frost',
  'Gilded', 'Scarlet', 'Thunder', 'Midnight', 'Storm', 'Wild', 'Sharp', 'Cold', 'Harsh', 'Mighty',
  'Rebel', 'Blinding', 'Shattered', 'Smoldering', 'Thundering', 'Celestial', 'Lurking', 'Stolen',
  'Lonesome', 'Endless', 'Restless', 'Drifting', 'Falling', 'Phantom', 'Twilight', 'Void',
]

const gameNoun = [
  'Legacy', 'Empire', 'Kingdom', 'Reckoning', 'Storm', 'Dawn', 'Fury', 'Justice', 'Redemption',
  'Vengeance', 'Requiem', 'Odyssey', 'Prophecy', 'Conspiracy', 'Siege', 'Paradox', 'Crossing',
  'Awakening', 'Descent', 'Eclipse', 'Contagion', 'Uprising', 'Collision', 'Mirage', 'Obsession',
  'Deliverance', 'Abyss', 'Catalyst', 'Nemesis', 'Sanctuary', 'Convergence', 'Havoc', 'Dominion',
  'Revelation', 'Schism', 'Solitude', 'Pilgrim', 'Vortex', 'Threshold', 'Passage', 'Labyrinth',
  'Expanse', 'Frontier', 'Genesis', 'Exodus', 'Infinity', 'Oblivion', 'Paradise', 'Purgatory',
  'Asylum', 'Destiny', 'Fortress', 'Fracture', 'Gravity', 'Harvest', 'Inferno', 'Journey',
  'Legion', 'Nexus', 'Rebellion', 'Salvation', 'Scourge', 'Solstice', 'Tempest', 'Vendetta',
  'Wasteland', 'Wildfire', 'Monolith', 'Nebula', 'Orbit', 'Pinnacle', 'Crucible', 'Cypher',
  'Enclave', 'Equinox', 'Gambit', 'Memento', 'Menace', 'Outcry', 'Overlord', 'Penance',
]

const gameSuffixes = ['Rising', 'Legacy', 'Remastered', 'Edition', 'Rebirth', 'Chronicles', 'Annihilation', 'Reckoning', 'Requiem', 'Return', 'Revenant', 'Reawakening', 'Evolution', 'Redux', 'Remnant', 'Reloaded', 'Genesis', 'Ascension']

const gameNamePool = [
  'Elden Ring', 'Cyberpunk 2077', 'Baldur\'s Gate 3', 'Red Dead Redemption 2', 'The Witcher 3',
  'Grand Theft Auto V', 'God of War', 'Dark Souls III', 'Sekiro', 'Bloodborne',
  'The Legend of Zelda Breath of the Wild', 'Super Mario Odyssey', 'Metroid Dread', 'Final Fantasy VII',
  'Persona 5', 'Kingdom Hearts', 'Resident Evil 4', 'Resident Evil 2', 'Silent Hill 2',
  'Doom Eternal', 'DOOM', 'Half-Life 2', 'Portal 2', 'Team Fortress 2',
  'Counter-Strike 2', 'Valorant', 'Overwatch 2', 'Apex Legends', 'Fortnite',
  'Minecraft', 'Terraria', 'Stardew Valley', 'Hollow Knight', 'Celeste',
  'Cuphead', 'Hades', 'Bastion', 'Transistor', 'Pyre',
  'Disco Elysium', 'Planescape Torment', 'Pillars of Eternity', 'Divinity Original Sin 2', 'Pathfinder Wrath',
  'XCOM 2', 'Civilization VI', 'Total War Warhammer', 'Age of Empires IV', 'StarCraft II',
  'Diablo IV', 'Path of Exile', 'Grim Dawn', 'Torchlight', 'Last Epoch',
  'Call of Duty Modern Warfare', 'Battlefield', 'Titanfall 2', 'Far Cry 6', 'Crysis',
  'Assassin\'s Creed Valhalla', 'Ghost of Tsushima', 'Horizon Forbidden West', 'Days Gone', 'Death Stranding',
  'Spider-Man', 'Spider-Man Miles Morales', 'Ratchet and Clank', 'Returnal', 'Demons Souls',
  'Starfield', 'Fallout 4', 'Fallout New Vegas', 'Skyrim', 'Oblivion',
  'Control', 'Alan Wake 2', 'Max Payne 3', 'Quantum Break', 'Hellblade',
  'Dead Space', 'The Callisto Protocol', 'Alien Isolation', 'Outlast', 'Amnesia',
  'Subnautica', 'The Forest', 'Sons of the Forest', 'Green Hell', 'Stranded Deep',
  'RimWorld', 'Factorio', 'Satisfactory', 'Dyson Sphere Program', 'Valheim',
  'Palworld', 'Enshrouded', 'V Rising', 'Nightingale', 'Aska',
  'Metal Gear Solid', 'Devil May Cry', 'Bayonetta', 'NieR Automata', 'Stellar Blade',
  'Street Fighter 6', 'Tekken 8', 'Mortal Kombat 1', 'Guilty Gear Strive', 'Super Smash Bros Ultimate',
  'Borderlands 3', 'Destiny 2', 'Warframe', 'Deep Rock Galactic', 'Left 4 Dead 2',
  'Prey', 'Dishonored', 'Deus Ex', 'System Shock', 'Bioshock Infinite',
  'Ori and the Blind Forest', 'Guacamelee', 'Dead Cells', 'Blasphemous', 'Salt and Sanctuary',
]

const repackers = ['FitGirl', 'DODI', 'GOG', 'Chovkaz', 'SteamRIP', 'KaOs', 'Tenoke', 'RUNE', 'Codex', 'CPY']
const gameGenres = ['Action RPG', 'Open World RPG', 'CRPG', 'Action Adventure', 'Roguelike', 'Metroidvania', 'Puzzle', 'Simulation', 'First-Person Shooter', 'Survival Horror', 'Platformer', 'RPG', 'Strategy', 'Racing', 'Fighting']

function genGameTitle(i) {
  if (i < gameNamePool.length) return gameNamePool[i]
  const p = Math.random()
  if (p < 0.35) return `${pick(gameAdj)} ${pick(gameNoun)} ${pick(gameSuffixes)}`
  if (p < 0.6) return `${pick(gameAdj)} ${pick(gameNoun)}`
  if (p < 0.8) return `${pick(gameNoun)} of the ${pick(gameAdj)} ${pick(gameNoun)}`
  return `The ${pick(gameAdj)} ${pick(gameNoun)}`
}

// ── Anime ───────────────────────────────────────────────

const animeAdj = [
  'Eternal', 'Crimson', 'Silver', 'Golden', 'Crystal', 'Scarlet', 'Azure', 'Violet', 'Emerald', 'Obsidian',
  'Phantom', 'Mystic', 'Shadow', 'Blazing', 'Frozen', 'Silent', 'Hidden', 'Forgotten', 'Ancient', 'Fallen',
  'Rising', 'Burning', 'Savage', 'Sacred', 'Cursed', 'Wicked', 'Brave', 'Fierce', 'Mighty', 'Vicious',
  'Radiant', 'Blinding', 'Electric', 'Distant', 'Endless', 'Restless', 'Fading', 'Drifting', 'Whispering',
  'Twilight', 'Midnight', 'Solar', 'Cosmic', 'Celestial', 'Frost', 'Thunder', 'Storm', 'Wild', 'Pure',
  'Deep', 'Dark', 'Pale', 'Bright', 'Cool', 'Warm', 'Cold', 'Sharp', 'Swift', 'Fleet',
  'Lone', 'Last', 'Final', 'True', 'Real', 'New', 'Neon', 'Iron', 'Steel', 'Glass',
]

const animeNoun = [
  'Soul', 'Blade', 'Heart', 'Spirit', 'Dream', 'Fate', 'Dawn', 'Star', 'Moon', 'Flame',
  'Storm', 'Fang', 'Wing', 'Shadow', 'Light', 'World', 'Song', 'Rain', 'Snow', 'Wind',
  'Zero', 'Hero', 'King', 'Lord', 'God', 'Demon', 'Angel', 'Devil', 'Dragon', 'Phoenix',
  'Warrior', 'Sword', 'Shield', 'Arrow', 'Spear', 'Axe', 'Bow', 'Claw', 'Bone', 'Scale',
  'Beast', 'Wolf', 'Fox', 'Tiger', 'Hawk', 'Raven', 'Crow', 'Serpent', 'Viper', 'Cobra',
  'Clock', 'Code', 'Key', 'Door', 'Gate', 'Tower', 'Castle', 'Throne', 'Crown', 'Orb',
  'Eyes', 'Tears', 'Smile', 'Voice', 'Promise', 'Bond', 'Chain', 'Link', 'Thread', 'Web',
  'Echo', 'Memory', 'Time', 'Space', 'Void', 'Nexus', 'Core', 'Cell', 'Seed', 'Bloom',
]

const animeNamePool = [
  'Attack on Titan', 'Jujutsu Kaisen', 'Demon Slayer', 'Solo Leveling', 'Fullmetal Alchemist Brotherhood',
  'One Punch Man', 'Death Note', 'Vinland Saga', 'Steins Gate', 'Hunter x Hunter',
  'Cowboy Bebop', 'Naruto Shippuden', 'Spy x Family', 'Mob Psycho 100', 'Code Geass',
  'Chainsaw Man', 'Neon Genesis Evangelion', 'My Hero Academia', 'Re Zero', 'Dragon Ball Z',
  'One Piece', 'Bleach', 'Naruto', 'Dragon Ball', 'Dragon Ball Super',
  'Yu Yu Hakusho', 'Rurouni Kenshin', 'Samurai Champloo', 'Trigun', 'Outlaw Star',
  'Gurren Lagann', 'Kill la Kill', 'Fairy Tail', 'Black Clover', 'Blue Exorcist',
  'Tokyo Ghoul', 'Parasyte', 'Another', 'Higurashi', 'Corpse Party',
  'Sword Art Online', 'Log Horizon', 'Overlord', 'That Time I Got Reincarnated as a Slime', 'Mushoku Tensei',
  'Konosuba', 'Reincarnated as a Sword', 'Eminence in Shadow', 'The Rising of the Shield Hero', 'Cautious Hero',
  'Fate Stay Night', 'Fate Zero', 'Fate Unlimited Blade Works', 'Kara no Kyoukai', 'Garden of Sinners',
  'Madoka Magica', 'Serial Experiments Lain', 'Ergo Proxy', 'Texhnolyze', 'Haibane Renmei',
  'Akira', 'Ghost in the Shell', 'Paprika', 'Perfect Blue', 'Millennium Actress',
  'Princess Mononoke', 'Spirited Away', 'Howls Moving Castle', 'My Neighbor Totoro', 'Grave of the Fireflies',
  'Your Name', 'Weathering With You', 'Suzume', 'A Silent Voice', 'I Want to Eat Your Pancreas',
  'Violet Evergarden', 'Anohana', 'Clannad', 'Angel Beats', 'Little Busters',
  'Kaguya-sama Love is War', 'Rent-a-Girlfriend', 'Toradora', 'Golden Time', 'Pet Girl of Sakurasou',
  'Noragami', 'Seraph of the End', 'Owari no Seraph', 'God Eater', 'Blue Lock',
  'Haikyuu', 'Kuroko Basketball', 'Ace of Diamond', 'Free', 'Yuri on Ice',
  'Dr Stone', 'Magi', 'The Promised Neverland', 'Made in Abyss', 'To Your Eternity',
  'Cyberpunk Edgerunners', 'Devilman Crybaby', 'Dorohedoro', 'Beastars', 'Banana Fish',
  'BanG Dream', 'Love Live', 'Idolmaster', 'K-On', 'Beck',
  'Monster', 'Death Parade', 'Psycho-Pass', 'Terror in Resonance', 'Zankyou no Terror',
  'Akame ga Kill', 'Fire Force', 'Soul Eater', 'Darker than Black', 'Kuroshitsuji',
  'Shingeki no Bahamut', 'Rokka no Yuusha', 'Kyoukai no Kanata', 'Beyond the Boundary',
  'No Game No Life', 'Classroom of the Elite', 'Alderamin on the Sky', 'Youjo Senki', 'Tanya the Evil',
]

const animeGenres = ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mecha', 'Mystery', 'Psychological', 'Romance', 'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural', 'Thriller']

function genAnimeTitle() {
  const p = Math.random()
  if (p < 0.3) return `${pick(animeAdj)} no ${pick(animeNoun)}`
  if (p < 0.55) return `${pick(animeAdj)} ${pick(animeNoun)}`
  if (p < 0.75) return `${pick(animeNoun)} ${pick(animeNoun)}`
  return `${pick(animeAdj)} ${pick(animeNoun)} no ${pick(animeNoun)}`
}

// ── Hentai ──────────────────────────────────────────────

const hentaiAdj = [
  'Secret', 'Forbidden', 'Hidden', 'Burning', 'Sweet', 'Bitter', 'Tender', 'Wild', 'Savage', 'Silent',
  'Twilight', 'Midnight', 'Scarlet', 'Crimson', 'Velvet', 'Silken', 'Golden', 'Amber', 'Sapphire', 'Jade',
  'Restless', 'Endless', 'Eternal', 'Falling', 'Drifting', 'Fading', 'Rising', 'Distant', 'Brave', 'Fierce',
  'Loving', 'Yearning', 'Wanting', 'Longing', 'Breathless', 'Hopeless', 'Careless',
  'Reckless', 'Precious', 'Private', 'Sacred', 'Vivid', 'Electric', 'Warm', 'Cold', 'Sharp', 'Deep',
  'Pure', 'Naughty', 'Lazy', 'Quiet', 'Loud', 'Bold', 'Shy', 'Wicked', 'Fatal', 'Mortal',
]

const hentaiNoun = [
  'Love', 'Heart', 'Passion', 'Desire', 'Dream', 'Kiss', 'Touch', 'Embrace', 'Whisper', 'Sigh',
  'Ecstasy', 'Bliss', 'Paradise', 'Eden', 'Heaven', 'Ecchi', 'Romance', 'Affair', 'Fantasy', 'Angel',
  'Devil', 'Temptation', 'Obsession', 'Fascination', 'Infatuation', 'Seduction', 'Intimacy', 'Sensation',
  'Feelings', 'Emotions', 'Moments', 'Memories', 'Promises', 'Secrets', 'Confessions', 'Tears', 'Smiles',
  'Carnival', 'Masquerade', 'Labyrinth', 'Mirage', 'Illusion', 'Reverie', 'Trance', 'Euphoria', 'Rapture',
  'Lust', 'Thrill', 'Wish', 'Hope', 'Fate', 'Faith', 'Grace', 'Glory', 'Rose', 'Lily',
]

const hentaiNamePool = [
  'Interspecies Reviewers', 'To Love-Ru', 'High School DxD', 'Prison School', 'Food Wars',
  'Kill la Kill', 'Shimoneta', 'Dakaretai Otoko', 'Testament of Sister New Devil', 'Queen Blade',
  'Ikki Tousen', 'Senran Kagura', 'Valkyrie Drive', 'Cross Ange', 'Seikon no Qwaser',
  'Freezing', 'Kanokon', 'Sekirei', 'Heaven\'s Lost Property', 'Omamori Himari',
  'Highschool of the Dead', 'Elfen Lied', 'Dears', 'DearS', 'Chobits',
  'Girls Bravo', 'Rosario Vampire', 'Strike Witches', 'Sky Girls', 'Kampfer',
  'Sora no Otoshimono', 'Mayo Chiki', 'Haganai', 'Nisekoi', 'Saekano',
  'The World God Only Knows', 'Yamada-kun and the Seven Witches', 'Trinity Seven', 'Date A Live', 'Infinite Stratos',
  'How Not to Summon a Demon Lord', 'Master of Ragnarok', 'Arifureta', 'Smartphone in Another World', 'Death March to Another World',
  'Redo of Healer', 'World\'s End Harem', 'Domestic Girlfriend', 'Scum\'s Wish', 'Kuzu no Honkai',
  'Aki Sora', 'Yosuga no Sora', 'Kiss x Sis', 'Onegai Twins', 'Onegai Teacher',
  'B Gata H Kei', 'Yamada\'s First Time', 'Sankarea', 'Mysterious Girlfriend X', 'Nazo no Kanojo X',
  'The Qwaser of Stigmata', 'Maken Ki', 'Majikoi Oh Samurai Girls', 'Hyakka Ryoran Samurai Girls', 'Samurai Girls',
  'Rin Daughters of Mnemosyne', 'Mnemosyne', 'Kuroinu Kedakaki', 'Euphoria', 'Saya no Uta',
  'Bible Black', 'La Blue Girl', 'Night Shift Nurses', 'Words Worth', 'Discipline',
  'Tawawa on Monday', 'Gotou-san', 'Futabu', 'Yuri Kotoba', 'Kira Kira',
  'Aneimo', 'Otome Domain', 'Sankaku Mado no Sotegawa', 'Nureta Koi', 'Amakano',
  'Kanojo x Kanojo x Kanojo', 'Bishoujo Mangekyou', 'Moe Love', 'Love Death', 'Sono Hanabira',
  'Flowers', 'Room No 1301', 'Sakura no Sono', 'Shirahana no Ori', 'Hoshi no Yakata',
  'Sora no Iro Mizu no Iro', 'Akuma de Sourou', 'Countrouble', 'Momo no Musume', 'Succubus',
]

const tags = ['Top Rated', 'Trending', 'New', '4K', 'HDR', 'Popular', 'Classic', 'Award Winning', 'Indie', 'AAA']

function genHentaiTitle() {
  const p = Math.random()
  if (p < 0.3) return `${pick(hentaiAdj)} no ${pick(hentaiNoun)}`
  if (p < 0.55) return `${pick(hentaiAdj)} ${pick(hentaiNoun)}`
  if (p < 0.75) return `${pick(hentaiNoun)} ${pick(hentaiNoun)}`
  return `${pick(hentaiAdj)} ${pick(hentaiNoun)} no ${pick(hentaiNoun)}`
}

// ── Generate Data ──────────────────────────────────────

const movies = []
for (let i = 0; i < 4000; i++) {
  const title = genMovieTitle(i)
  const year = rng(1920, 2025)
  movies.push({
    id: `m${i + 1}`,
    title,
    poster: `https://image.tmdb.org/t/p/w500/placeholder-m${i + 1}.jpg`,
    backdrop: `https://image.tmdb.org/t/p/w1280/placeholder-m${i + 1}-b.jpg`,
    year,
    rating: rngf(5.0, 9.5),
    runtime: rng(80, 210),
    overview: `${title} is a ${pick(movieGenres).toLowerCase()} film set in ${year}. ${pick(movieAdj)} forces collide as characters navigate a world of ${pick(movieNoun).toLowerCase()} and ${pick(movieAdj).toLowerCase()} ${pick(movieNoun).toLowerCase()}.`,
    genres: pickN(movieGenres, rng(1, 4)),
    tags: pickN(tags, rng(0, 3)),
    streams: [],
  })
}

const series = []
for (let i = 0; i < 2000; i++) {
  const isKdrama = i < 30
  const title = genSeriesTitle(i, isKdrama)
  const seasonCount = rng(1, 5)
  const seasons = []
  for (let s = 0; s < seasonCount; s++) {
    seasons.push({ num: s + 1, episodes: generateEpisodes(s + 1, rng(6, 24)) })
  }
  series.push({
    id: `s${i + 1}`,
    title,
    poster: `https://image.tmdb.org/t/p/w500/placeholder-s${i + 1}.jpg`,
    backdrop: `https://image.tmdb.org/t/p/w1280/placeholder-s${i + 1}-b.jpg`,
    year: rng(1990, 2025),
    rating: rngf(6.0, 9.5),
    overview: `${title} is a ${isKdrama ? 'K-drama' : pick(seriesGenres).toLowerCase()} series that captivates audiences with its compelling story of ${pick(seriestVAdj).toLowerCase()} ${pick(seriesTvNoun).toLowerCase()}.`,
    genres: pickN(seriesGenres, rng(1, 4)),
    tags: pickN(tags, rng(0, 3)),
    is_kdrama: isKdrama,
    seasons,
  })
}

const games = []
for (let i = 0; i < 3000; i++) {
  const title = genGameTitle(i)
  const size = `${rngf(0.5, 150, 1)} GB`
  games.push({
    id: `g${i + 1}`,
    title,
    icon: `https://cdn.akamai.steamstatic.com/steam/apps/${rng(100000, 9999999)}/library_600x900.jpg`,
    banner: '',
    genre: pick(gameGenres),
    desc: `${title} is a ${pick(gameGenres)} where players ${pick(['embark', 'explore', 'battle', 'survive', 'build', 'discover', 'hunt', 'race', 'fight', 'create'])} through ${pick(gameAdj).toLowerCase()} ${pick(gameNoun).toLowerCase()}.`,
    size,
    repacker: pick(repackers),
    url: '',
    dl_count: rng(1000, 50000),
    rating: rngf(6.0, 10.0),
    tags: pickN(tags, rng(0, 3)),
    screenshots: [],
  })
}

const anime = []
for (let i = 0; i < 2000; i++) {
  const title = i < animeNamePool.length ? animeNamePool[i] : genAnimeTitle()
  const status = Math.random() < 0.7 ? 'Completed' : 'Airing'
  const vmodePick = Math.random()
  const vmode = vmodePick < 0.5 ? 'sub' : vmodePick < 0.8 ? 'dub' : 'both'
  anime.push({
    id: `a${i + 1}`,
    title,
    poster: `https://cdn.myanimelist.net/images/anime/${rng(1000, 9999)}/${rng(10000, 99999)}.jpg`,
    banner: '',
    year: rng(1985, 2025),
    status,
    eps: status === 'Completed' ? rng(12, 500) : rng(12, 150),
    rating: rngf(6.0, 9.5),
    synopsis: `${title} follows the story of ${pick(['a young hero', 'a brave warrior', 'an unlikely adventurer', 'a group of friends', 'a lone wanderer', 'a gifted student', 'a mysterious stranger', 'a determined outcast'])} in a ${pick(['fantasy', 'futuristic', 'post-apocalyptic', 'magical', 'feudal', 'modern', 'alternate', 'supernatural'])} world.`,
    genres: pickN(animeGenres, rng(1, 4)),
    tags: pickN(tags, rng(0, 3)),
    streams: [],
    vmode,
  })
}

const hentai = []
for (let i = 0; i < 1000; i++) {
  const title = i < hentaiNamePool.length ? hentaiNamePool[i] : genHentaiTitle()
  const censored = Math.random() < 0.4
  const vmodePick = Math.random()
  const vmode = vmodePick < 0.4 ? 'sub' : vmodePick < 0.7 ? 'dub' : 'both'
  hentai.push({
    id: `h${i + 1}`,
    title,
    poster: `https://cdn.myanimelist.net/images/anime/${rng(1000, 9999)}/${rng(10000, 99999)}.jpg`,
    banner: '',
    year: rng(1995, 2025),
    status: Math.random() < 0.8 ? 'Completed' : 'Airing',
    eps: rng(6, 64),
    rating: rngf(5.0, 8.5),
    synopsis: `${title} is a ${censored ? 'censored' : 'uncensored'} ${pick(['ecchi', 'romance', 'comedy', 'drama', 'fantasy'])} series featuring ${pick(['adventures', 'romantic entanglements', 'comedic situations', 'dramatic conflicts', 'fantasy quests'])}.`,
    genres: pickN([...animeGenres, 'Ecchi', 'Romance', 'Comedy'], rng(1, 4)),
    tags: pickN(['Dubbed', 'Subbed', 'Uncensored', 'Censored', 'Harem', 'Romance', 'Comedy'], rng(1, 3)),
    streams: [],
    vmode,
    censored,
  })
}

// ── Write Output ───────────────────────────────────────

writeFileSync(join(DIR, 'movies.json'), JSON.stringify(movies, null, 2))
writeFileSync(join(DIR, 'series.json'), JSON.stringify(series, null, 2))
writeFileSync(join(DIR, 'games.json'), JSON.stringify(games, null, 2))
writeFileSync(join(DIR, 'anime.json'), JSON.stringify(anime, null, 2))
writeFileSync(join(DIR, 'hentai.json'), JSON.stringify(hentai, null, 2))

const totalLines = [movies, series, games, anime, hentai].reduce((sum, arr) => sum + JSON.stringify(arr, null, 2).split('\n').length, 0)
console.log(`Generated ${movies.length} movies, ${series.length} series, ${games.length} games, ${anime.length} anime, ${hentai.length} hentai`)
console.log(`Total: ${movies.length + series.length + games.length + anime.length + hentai.length} entries, ~${totalLines} lines`)
