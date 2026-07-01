import type { CatalogItem } from './types'

const MOCK_POSTER = ''

const movies: CatalogItem[] = [
  { id: 'mock-m1', title: 'The Matrix Resurrections', poster: MOCK_POSTER, year: 2021, rating: 8.2, genres: ['Sci-Fi', 'Action'], kind: 'movie', tags: ['popular'], genre: null, status: null, eps: null, icon: null, size: null, repacker: null },
  { id: 'mock-m2', title: 'Dune: Part Two', poster: MOCK_POSTER, year: 2024, rating: 9.0, genres: ['Sci-Fi', 'Adventure'], kind: 'movie', tags: ['trending'], genre: null, status: null, eps: null, icon: null, size: null, repacker: null },
  { id: 'mock-m3', title: 'Oppenheimer', poster: MOCK_POSTER, year: 2023, rating: 8.8, genres: ['Drama', 'History'], kind: 'movie', tags: ['award-winning'], genre: null, status: null, eps: null, icon: null, size: null, repacker: null },
  { id: 'mock-m4', title: 'Everything Everywhere All at Once', poster: MOCK_POSTER, year: 2022, rating: 8.9, genres: ['Action', 'Adventure', 'Comedy'], kind: 'movie', tags: ['oscar'], genre: null, status: null, eps: null, icon: null, size: null, repacker: null },
  { id: 'mock-m5', title: 'Spider-Man: Across the Spider-Verse', poster: MOCK_POSTER, year: 2023, rating: 8.7, genres: ['Animation', 'Action'], kind: 'movie', tags: ['animated'], genre: null, status: null, eps: null, icon: null, size: null, repacker: null },
  { id: 'mock-m6', title: 'The Batman', poster: MOCK_POSTER, year: 2022, rating: 8.3, genres: ['Action', 'Crime', 'Drama'], kind: 'movie', tags: ['dc'], genre: null, status: null, eps: null, icon: null, size: null, repacker: null },
  { id: 'mock-m7', title: 'Top Gun: Maverick', poster: MOCK_POSTER, year: 2022, rating: 8.6, genres: ['Action', 'Drama'], kind: 'movie', tags: ['blockbuster'], genre: null, status: null, eps: null, icon: null, size: null, repacker: null },
  { id: 'mock-m8', title: 'Interstellar', poster: MOCK_POSTER, year: 2014, rating: 9.1, genres: ['Sci-Fi', 'Drama'], kind: 'movie', tags: ['classic'], genre: null, status: null, eps: null, icon: null, size: null, repacker: null },
  { id: 'mock-m9', title: 'Parasite', poster: MOCK_POSTER, year: 2019, rating: 9.0, genres: ['Drama', 'Thriller'], kind: 'movie', tags: ['oscar'], genre: null, status: null, eps: null, icon: null, size: null, repacker: null },
  { id: 'mock-m10', title: 'The Shawshank Redemption', poster: MOCK_POSTER, year: 1994, rating: 9.3, genres: ['Drama'], kind: 'movie', tags: ['classic'], genre: null, status: null, eps: null, icon: null, size: null, repacker: null },
  { id: 'mock-m11', title: 'Inception', poster: MOCK_POSTER, year: 2010, rating: 8.8, genres: ['Action', 'Sci-Fi', 'Thriller'], kind: 'movie', tags: ['nolan'], genre: null, status: null, eps: null, icon: null, size: null, repacker: null },
  { id: 'mock-m12', title: 'Blade Runner 2049', poster: MOCK_POSTER, year: 2017, rating: 8.5, genres: ['Sci-Fi', 'Drama'], kind: 'movie', tags: ['neo-noir'], genre: null, status: null, eps: null, icon: null, size: null, repacker: null },
  { id: 'mock-m13', title: 'The Lord of the Rings: The Return of the King', poster: MOCK_POSTER, year: 2003, rating: 9.2, genres: ['Adventure', 'Fantasy'], kind: 'movie', tags: ['epic'], genre: null, status: null, eps: null, icon: null, size: null, repacker: null },
  { id: 'mock-m14', title: 'Pulp Fiction', poster: MOCK_POSTER, year: 1994, rating: 8.9, genres: ['Crime', 'Drama'], kind: 'movie', tags: ['tarantino'], genre: null, status: null, eps: null, icon: null, size: null, repacker: null },
  { id: 'mock-m15', title: 'The Dark Knight', poster: MOCK_POSTER, year: 2008, rating: 9.0, genres: ['Action', 'Crime', 'Drama'], kind: 'movie', tags: ['nolan', 'dc'], genre: null, status: null, eps: null, icon: null, size: null, repacker: null },
]

const series: CatalogItem[] = [
  { id: 'mock-s1', title: 'Breaking Bad', poster: MOCK_POSTER, year: 2008, rating: 9.5, genres: ['Crime', 'Drama', 'Thriller'], kind: 'series', tags: ['classic'], genre: null, status: null, eps: null, icon: null, size: null, repacker: null },
  { id: 'mock-s2', title: 'Game of Thrones', poster: MOCK_POSTER, year: 2011, rating: 9.2, genres: ['Action', 'Adventure', 'Fantasy'], kind: 'series', tags: ['epic'], genre: null, status: null, eps: null, icon: null, size: null, repacker: null },
  { id: 'mock-s3', title: 'Stranger Things', poster: MOCK_POSTER, year: 2016, rating: 8.7, genres: ['Sci-Fi', 'Horror', 'Drama'], kind: 'series', tags: ['netflix'], genre: null, status: null, eps: null, icon: null, size: null, repacker: null },
  { id: 'mock-s4', title: 'The Crown', poster: MOCK_POSTER, year: 2016, rating: 8.6, genres: ['Drama', 'History'], kind: 'series', tags: ['netflix'], genre: null, status: null, eps: null, icon: null, size: null, repacker: null },
  { id: 'mock-s5', title: 'Succession', poster: MOCK_POSTER, year: 2018, rating: 8.8, genres: ['Drama', 'Comedy'], kind: 'series', tags: ['hbo'], genre: null, status: null, eps: null, icon: null, size: null, repacker: null },
  { id: 'mock-s6', title: 'The Witcher', poster: MOCK_POSTER, year: 2019, rating: 8.2, genres: ['Action', 'Fantasy'], kind: 'series', tags: ['netflix'], genre: null, status: null, eps: null, icon: null, size: null, repacker: null },
  { id: 'mock-s7', title: 'Dark', poster: MOCK_POSTER, year: 2017, rating: 8.7, genres: ['Sci-Fi', 'Mystery'], kind: 'series', tags: ['netflix'], genre: null, status: null, eps: null, icon: null, size: null, repacker: null },
  { id: 'mock-s8', title: 'The Mandalorian', poster: MOCK_POSTER, year: 2019, rating: 8.5, genres: ['Action', 'Sci-Fi', 'Adventure'], kind: 'series', tags: ['disney', 'star-wars'], genre: null, status: null, eps: null, icon: null, size: null, repacker: null },
  { id: 'mock-s9', title: 'Better Call Saul', poster: MOCK_POSTER, year: 2015, rating: 9.0, genres: ['Crime', 'Drama'], kind: 'series', tags: ['prequel'], genre: null, status: null, eps: null, icon: null, size: null, repacker: null },
  { id: 'mock-s10', title: 'The Last of Us', poster: MOCK_POSTER, year: 2023, rating: 8.9, genres: ['Action', 'Adventure', 'Drama'], kind: 'series', tags: ['hbo'], genre: null, status: null, eps: null, icon: null, size: null, repacker: null },
  { id: 'mock-s11', title: 'Squid Game', poster: MOCK_POSTER, year: 2021, rating: 8.5, genres: ['Drama', 'Thriller'], kind: 'series', tags: ['netflix'], genre: null, status: null, eps: null, icon: null, size: null, repacker: null },
  { id: 'mock-s12', title: 'House of the Dragon', poster: MOCK_POSTER, year: 2022, rating: 8.4, genres: ['Action', 'Fantasy'], kind: 'series', tags: ['hbo'], genre: null, status: null, eps: null, icon: null, size: null, repacker: null },
  { id: 'mock-s13', title: 'The Bear', poster: MOCK_POSTER, year: 2022, rating: 8.6, genres: ['Comedy', 'Drama'], kind: 'series', tags: ['fx'], genre: null, status: null, eps: null, icon: null, size: null, repacker: null },
  { id: 'mock-s14', title: 'Chernobyl', poster: MOCK_POSTER, year: 2019, rating: 9.4, genres: ['Drama', 'History'], kind: 'series', tags: ['hbo'], genre: null, status: null, eps: null, icon: null, size: null, repacker: null },
  { id: 'mock-s15', title: 'Sherlock', poster: MOCK_POSTER, year: 2010, rating: 9.1, genres: ['Crime', 'Mystery'], kind: 'series', tags: ['bbc'], genre: null, status: null, eps: null, icon: null, size: null, repacker: null },
]

const kdramas: CatalogItem[] = [
  { id: 'mock-k1', title: 'Crash Landing on You', poster: MOCK_POSTER, year: 2019, rating: 8.9, genres: ['Romance', 'Drama'], kind: 'kdrama', tags: ['romance'], genre: null, status: null, eps: null, icon: null, size: null, repacker: null },
  { id: 'mock-k2', title: 'Squid Game', poster: MOCK_POSTER, year: 2021, rating: 8.5, genres: ['Drama', 'Thriller'], kind: 'kdrama', tags: ['netflix'], genre: null, status: null, eps: null, icon: null, size: null, repacker: null },
  { id: 'mock-k3', title: 'Goblin', poster: MOCK_POSTER, year: 2016, rating: 8.8, genres: ['Fantasy', 'Romance'], kind: 'kdrama', tags: ['classic'], genre: null, status: null, eps: null, icon: null, size: null, repacker: null },
  { id: 'mock-k4', title: 'Itaewon Class', poster: MOCK_POSTER, year: 2020, rating: 8.4, genres: ['Drama'], kind: 'kdrama', tags: ['netflix'], genre: null, status: null, eps: null, icon: null, size: null, repacker: null },
  { id: 'mock-k5', title: 'Vincenzo', poster: MOCK_POSTER, year: 2021, rating: 8.3, genres: ['Comedy', 'Crime'], kind: 'kdrama', tags: ['popular'], genre: null, status: null, eps: null, icon: null, size: null, repacker: null },
  { id: 'mock-k6', title: 'The Glory', poster: MOCK_POSTER, year: 2022, rating: 8.6, genres: ['Drama', 'Thriller'], kind: 'kdrama', tags: ['netflix'], genre: null, status: null, eps: null, icon: null, size: null, repacker: null },
  { id: 'mock-k7', title: 'My Mister', poster: MOCK_POSTER, year: 2018, rating: 9.0, genres: ['Drama'], kind: 'kdrama', tags: ['critically-acclaimed'], genre: null, status: null, eps: null, icon: null, size: null, repacker: null },
  { id: 'mock-k8', title: 'Hospital Playlist', poster: MOCK_POSTER, year: 2020, rating: 8.7, genres: ['Comedy', 'Drama'], kind: 'kdrama', tags: ['slice-of-life'], genre: null, status: null, eps: null, icon: null, size: null, repacker: null },
  { id: 'mock-k9', title: 'Mr. Queen', poster: MOCK_POSTER, year: 2020, rating: 8.6, genres: ['Comedy', 'Fantasy'], kind: 'kdrama', tags: ['time-travel'], genre: null, status: null, eps: null, icon: null, size: null, repacker: null },
  { id: 'mock-k10', title: 'Extraordinary Attorney Woo', poster: MOCK_POSTER, year: 2022, rating: 8.5, genres: ['Drama', 'Comedy'], kind: 'kdrama', tags: ['netflix'], genre: null, status: null, eps: null, icon: null, size: null, repacker: null },
  { id: 'mock-k11', title: 'Twenty Five Twenty One', poster: MOCK_POSTER, year: 2022, rating: 8.7, genres: ['Romance', 'Drama'], kind: 'kdrama', tags: ['coming-of-age'], genre: null, status: null, eps: null, icon: null, size: null, repacker: null },
  { id: 'mock-k12', title: 'Signal', poster: MOCK_POSTER, year: 2016, rating: 8.9, genres: ['Thriller', 'Mystery'], kind: 'kdrama', tags: ['time-travel'], genre: null, status: null, eps: null, icon: null, size: null, repacker: null },
  { id: 'mock-k13', title: 'Reply 1988', poster: MOCK_POSTER, year: 2015, rating: 9.2, genres: ['Comedy', 'Drama'], kind: 'kdrama', tags: ['classic'], genre: null, status: null, eps: null, icon: null, size: null, repacker: null },
  { id: 'mock-k14', title: 'Descendants of the Sun', poster: MOCK_POSTER, year: 2016, rating: 8.4, genres: ['Romance', 'Action'], kind: 'kdrama', tags: ['blockbuster'], genre: null, status: null, eps: null, icon: null, size: null, repacker: null },
  { id: 'mock-k15', title: 'Sky Castle', poster: MOCK_POSTER, year: 2018, rating: 8.5, genres: ['Drama', 'Thriller'], kind: 'kdrama', tags: ['social-satire'], genre: null, status: null, eps: null, icon: null, size: null, repacker: null },
]

const anime: CatalogItem[] = [
  { id: 'mock-a1', title: 'Attack on Titan', poster: MOCK_POSTER, year: 2013, rating: 9.1, genres: ['Action', 'Fantasy'], kind: 'anime', tags: ['shonen'], genre: null, status: 'Completed', eps: 94, icon: null, size: null, repacker: null },
  { id: 'mock-a2', title: 'Demon Slayer', poster: MOCK_POSTER, year: 2019, rating: 8.9, genres: ['Action', 'Adventure'], kind: 'anime', tags: ['shonen'], genre: null, status: 'Ongoing', eps: 63, icon: null, size: null, repacker: null },
  { id: 'mock-a3', title: 'Jujutsu Kaisen', poster: MOCK_POSTER, year: 2020, rating: 8.8, genres: ['Action', 'Fantasy'], kind: 'anime', tags: ['shonen'], genre: null, status: 'Ongoing', eps: 47, icon: null, size: null, repacker: null },
  { id: 'mock-a4', title: 'One Piece', poster: MOCK_POSTER, year: 1999, rating: 9.0, genres: ['Action', 'Adventure', 'Comedy'], kind: 'anime', tags: ['long-running'], genre: null, status: 'Ongoing', eps: 1100, icon: null, size: null, repacker: null },
  { id: 'mock-a5', title: 'Fullmetal Alchemist: Brotherhood', poster: MOCK_POSTER, year: 2009, rating: 9.5, genres: ['Action', 'Adventure'], kind: 'anime', tags: ['masterpiece'], genre: null, status: 'Completed', eps: 64, icon: null, size: null, repacker: null },
  { id: 'mock-a6', title: 'Steins;Gate', poster: MOCK_POSTER, year: 2011, rating: 9.2, genres: ['Sci-Fi', 'Thriller'], kind: 'anime', tags: ['sci-fi'], genre: null, status: 'Completed', eps: 24, icon: null, size: null, repacker: null },
  { id: 'mock-a7', title: 'Death Note', poster: MOCK_POSTER, year: 2006, rating: 9.0, genres: ['Mystery', 'Thriller'], kind: 'anime', tags: ['psychological'], genre: null, status: 'Completed', eps: 37, icon: null, size: null, repacker: null },
  { id: 'mock-a8', title: 'Chainsaw Man', poster: MOCK_POSTER, year: 2022, rating: 8.7, genres: ['Action', 'Horror'], kind: 'anime', tags: ['shonen'], genre: null, status: 'Ongoing', eps: 12, icon: null, size: null, repacker: null },
  { id: 'mock-a9', title: 'Hunter x Hunter', poster: MOCK_POSTER, year: 2011, rating: 9.1, genres: ['Action', 'Adventure'], kind: 'anime', tags: ['shonen'], genre: null, status: 'Hiatus', eps: 148, icon: null, size: null, repacker: null },
  { id: 'mock-a10', title: 'Cowboy Bebop', poster: MOCK_POSTER, year: 1998, rating: 9.1, genres: ['Action', 'Sci-Fi'], kind: 'anime', tags: ['classic'], genre: null, status: 'Completed', eps: 26, icon: null, size: null, repacker: null },
  { id: 'mock-a11', title: 'Spy x Family', poster: MOCK_POSTER, year: 2022, rating: 8.6, genres: ['Comedy', 'Action'], kind: 'anime', tags: ['wholesome'], genre: null, status: 'Ongoing', eps: 37, icon: null, size: null, repacker: null },
  { id: 'mock-a12', title: 'Neon Genesis Evangelion', poster: MOCK_POSTER, year: 1995, rating: 8.8, genres: ['Action', 'Sci-Fi'], kind: 'anime', tags: ['classic'], genre: null, status: 'Completed', eps: 26, icon: null, size: null, repacker: null },
  { id: 'mock-a13', title: 'Vinland Saga', poster: MOCK_POSTER, year: 2019, rating: 8.9, genres: ['Action', 'Adventure'], kind: 'anime', tags: ['historical'], genre: null, status: 'Ongoing', eps: 48, icon: null, size: null, repacker: null },
  { id: 'mock-a14', title: 'Mob Psycho 100', poster: MOCK_POSTER, year: 2016, rating: 8.8, genres: ['Action', 'Comedy'], kind: 'anime', tags: ['supernatural'], genre: null, status: 'Completed', eps: 37, icon: null, size: null, repacker: null },
  { id: 'mock-a15', title: 'Violet Evergarden', poster: MOCK_POSTER, year: 2018, rating: 8.9, genres: ['Drama', 'Fantasy'], kind: 'anime', tags: ['emotional'], genre: null, status: 'Completed', eps: 13, icon: null, size: null, repacker: null },
]

const hentai: CatalogItem[] = [
  { id: 'mock-h1', title: 'Interspecies Reviewers', poster: MOCK_POSTER, year: 2020, rating: 7.5, genres: ['Comedy', 'Fantasy', 'Ecchi'], kind: 'hentai', tags: ['ecchi'], genre: null, status: 'Completed', eps: 12, icon: null, size: null, repacker: null },
  { id: 'mock-h2', title: 'High School DxD', poster: MOCK_POSTER, year: 2012, rating: 7.8, genres: ['Action', 'Comedy', 'Fantasy'], kind: 'hentai', tags: ['ecchi'], genre: null, status: 'Completed', eps: 48, icon: null, size: null, repacker: null },
  { id: 'mock-h3', title: 'To LOVE-Ru', poster: MOCK_POSTER, year: 2008, rating: 7.2, genres: ['Comedy', 'Romance', 'Sci-Fi'], kind: 'hentai', tags: ['ecchi'], genre: null, status: 'Completed', eps: 38, icon: null, size: null, repacker: null },
  { id: 'mock-h4', title: 'Prison School', poster: MOCK_POSTER, year: 2015, rating: 8.0, genres: ['Comedy', 'Ecchi'], kind: 'hentai', tags: ['ecchi'], genre: null, status: 'Completed', eps: 12, icon: null, size: null, repacker: null },
  { id: 'mock-h5', title: 'Food Wars! Shokugeki no Soma', poster: MOCK_POSTER, year: 2015, rating: 8.4, genres: ['Comedy', 'Ecchi'], kind: 'hentai', tags: ['ecchi'], genre: null, status: 'Completed', eps: 86, icon: null, size: null, repacker: null },
  { id: 'mock-h6', title: 'Kill la Kill', poster: MOCK_POSTER, year: 2013, rating: 8.3, genres: ['Action', 'Comedy'], kind: 'hentai', tags: ['ecchi'], genre: null, status: 'Completed', eps: 24, icon: null, size: null, repacker: null },
  { id: 'mock-h7', title: 'Monster Musume', poster: MOCK_POSTER, year: 2015, rating: 7.4, genres: ['Comedy', 'Fantasy', 'Romance'], kind: 'hentai', tags: ['ecchi'], genre: null, status: 'Completed', eps: 12, icon: null, size: null, repacker: null },
  { id: 'mock-h8', title: 'Dakaretai Otoko', poster: MOCK_POSTER, year: 2018, rating: 7.0, genres: ['Romance', 'Yaoi'], kind: 'hentai', tags: ['yaoi'], genre: null, status: 'Completed', eps: 13, icon: null, size: null, repacker: null },
]

const games: CatalogItem[] = [
  { id: 'mock-g1', title: 'Elden Ring', poster: MOCK_POSTER, year: 2022, rating: 9.5, genres: ['Action', 'RPG'], kind: 'game', tags: ['open-world'], genre: 'Action RPG', status: null, eps: null, icon: MOCK_POSTER, size: '48 GB', repacker: 'Darksiders' },
  { id: 'mock-g2', title: 'Baldur\'s Gate 3', poster: MOCK_POSTER, year: 2023, rating: 9.6, genres: ['RPG'], kind: 'game', tags: ['cRPG'], genre: 'RPG', status: null, eps: null, icon: MOCK_POSTER, size: '122 GB', repacker: 'GOG' },
  { id: 'mock-g3', title: 'Cyberpunk 2077', poster: MOCK_POSTER, year: 2020, rating: 8.5, genres: ['Action', 'RPG'], kind: 'game', tags: ['open-world'], genre: 'Action RPG', status: null, eps: null, icon: MOCK_POSTER, size: '64 GB', repacker: 'CODEX' },
  { id: 'mock-g4', title: 'Red Dead Redemption 2', poster: MOCK_POSTER, year: 2019, rating: 9.3, genres: ['Action', 'Adventure'], kind: 'game', tags: ['open-world'], genre: 'Action Adventure', status: null, eps: null, icon: MOCK_POSTER, size: '112 GB', repacker: 'FitGirl' },
  { id: 'mock-g5', title: 'The Witcher 3: Wild Hunt', poster: MOCK_POSTER, year: 2015, rating: 9.4, genres: ['Action', 'RPG'], kind: 'game', tags: ['open-world'], genre: 'Action RPG', status: null, eps: null, icon: MOCK_POSTER, size: '52 GB', repacker: 'GOG' },
  { id: 'mock-g6', title: 'God of War', poster: MOCK_POSTER, year: 2022, rating: 9.0, genres: ['Action', 'Adventure'], kind: 'game', tags: ['story-rich'], genre: 'Action Adventure', status: null, eps: null, icon: MOCK_POSTER, size: '72 GB', repacker: 'Darksiders' },
  { id: 'mock-g7', title: 'Horizon Forbidden West', poster: MOCK_POSTER, year: 2024, rating: 8.8, genres: ['Action', 'RPG'], kind: 'game', tags: ['open-world'], genre: 'Action RPG', status: null, eps: null, icon: MOCK_POSTER, size: '96 GB', repacker: 'FitGirl' },
  { id: 'mock-g8', title: 'Spider-Man Remastered', poster: MOCK_POSTER, year: 2022, rating: 8.7, genres: ['Action', 'Adventure'], kind: 'game', tags: ['open-world'], genre: 'Action Adventure', status: null, eps: null, icon: MOCK_POSTER, size: '56 GB', repacker: 'CODEX' },
  { id: 'mock-g9', title: 'Hades', poster: MOCK_POSTER, year: 2020, rating: 9.1, genres: ['Action', 'Roguelike'], kind: 'game', tags: ['indie'], genre: 'Roguelike', status: null, eps: null, icon: MOCK_POSTER, size: '8 GB', repacker: 'GOG' },
  { id: 'mock-g10', title: 'Dark Souls III', poster: MOCK_POSTER, year: 2016, rating: 9.0, genres: ['Action', 'RPG'], kind: 'game', tags: ['souls-like'], genre: 'Action RPG', status: null, eps: null, icon: MOCK_POSTER, size: '28 GB', repacker: 'CODEX' },
  { id: 'mock-g11', title: 'Sekiro: Shadows Die Twice', poster: MOCK_POSTER, year: 2019, rating: 9.1, genres: ['Action', 'Adventure'], kind: 'game', tags: ['souls-like'], genre: 'Action Adventure', status: null, eps: null, icon: MOCK_POSTER, size: '18 GB', repacker: 'Darksiders' },
  { id: 'mock-g12', title: 'Stardew Valley', poster: MOCK_POSTER, year: 2016, rating: 9.0, genres: ['Simulation', 'RPG'], kind: 'game', tags: ['indie'], genre: 'Simulation', status: null, eps: null, icon: MOCK_POSTER, size: '1 GB', repacker: 'GOG' },
  { id: 'mock-g13', title: 'Hollow Knight', poster: MOCK_POSTER, year: 2017, rating: 9.1, genres: ['Action', 'Metroidvania'], kind: 'game', tags: ['indie'], genre: 'Metroidvania', status: null, eps: null, icon: MOCK_POSTER, size: '9 GB', repacker: 'GOG' },
  { id: 'mock-g14', title: 'Doom Eternal', poster: MOCK_POSTER, year: 2020, rating: 8.8, genres: ['Action', 'FPS'], kind: 'game', tags: ['fps'], genre: 'FPS', status: null, eps: null, icon: MOCK_POSTER, size: '42 GB', repacker: 'Darksiders' },
  { id: 'mock-g15', title: 'Resident Evil 4 Remake', poster: MOCK_POSTER, year: 2023, rating: 9.0, genres: ['Action', 'Horror'], kind: 'game', tags: ['survival-horror'], genre: 'Survival Horror', status: null, eps: null, icon: MOCK_POSTER, size: '58 GB', repacker: 'FitGirl' },
]

const manga: CatalogItem[] = [
  { id: 'mock-mg1', title: 'Berserk', poster: MOCK_POSTER, year: 1989, rating: 9.5, genres: ['Action', 'Fantasy'], kind: 'manga', tags: ['seinen'], genre: null, status: 'Hiatus', eps: null, icon: null, size: null, repacker: null },
  { id: 'mock-mg2', title: 'One Piece', poster: MOCK_POSTER, year: 1997, rating: 9.2, genres: ['Action', 'Adventure'], kind: 'manga', tags: ['shonen'], genre: null, status: 'Ongoing', eps: null, icon: null, size: null, repacker: null },
  { id: 'mock-mg3', title: 'Vagabond', poster: MOCK_POSTER, year: 1998, rating: 9.4, genres: ['Action', 'Historical'], kind: 'manga', tags: ['seinen'], genre: null, status: 'Hiatus', eps: null, icon: null, size: null, repacker: null },
  { id: 'mock-mg4', title: 'Monster', poster: MOCK_POSTER, year: 1994, rating: 9.2, genres: ['Mystery', 'Thriller'], kind: 'manga', tags: ['seinen'], genre: null, status: 'Completed', eps: null, icon: null, size: null, repacker: null },
  { id: 'mock-mg5', title: 'Attack on Titan', poster: MOCK_POSTER, year: 2009, rating: 9.0, genres: ['Action', 'Fantasy'], kind: 'manga', tags: ['shonen'], genre: null, status: 'Completed', eps: null, icon: null, size: null, repacker: null },
  { id: 'mock-mg6', title: 'Goodnight Punpun', poster: MOCK_POSTER, year: 2007, rating: 9.1, genres: ['Drama', 'Psychological'], kind: 'manga', tags: ['seinen'], genre: null, status: 'Completed', eps: null, icon: null, size: null, repacker: null },
  { id: 'mock-mg7', title: 'Kingdom', poster: MOCK_POSTER, year: 2006, rating: 9.3, genres: ['Action', 'Historical'], kind: 'manga', tags: ['seinen'], genre: null, status: 'Ongoing', eps: null, icon: null, size: null, repacker: null },
  { id: 'mock-mg8', title: 'Jujutsu Kaisen', poster: MOCK_POSTER, year: 2018, rating: 8.9, genres: ['Action', 'Fantasy'], kind: 'manga', tags: ['shonen'], genre: null, status: 'Ongoing', eps: null, icon: null, size: null, repacker: null },
  { id: 'mock-mg9', title: 'Chainsaw Man', poster: MOCK_POSTER, year: 2018, rating: 8.8, genres: ['Action', 'Horror'], kind: 'manga', tags: ['shonen'], genre: null, status: 'Ongoing', eps: null, icon: null, size: null, repacker: null },
  { id: 'mock-mg10', title: 'Oyasumi Punpun', poster: MOCK_POSTER, year: 2007, rating: 9.1, genres: ['Drama', 'Psychological'], kind: 'manga', tags: ['seinen'], genre: null, status: 'Completed', eps: null, icon: null, size: null, repacker: null },
  { id: 'mock-mg11', title: 'Vinland Saga', poster: MOCK_POSTER, year: 2005, rating: 9.0, genres: ['Action', 'Historical'], kind: 'manga', tags: ['seinen'], genre: null, status: 'Ongoing', eps: null, icon: null, size: null, repacker: null },
  { id: 'mock-mg12', title: '20th Century Boys', poster: MOCK_POSTER, year: 1999, rating: 9.0, genres: ['Mystery', 'Sci-Fi'], kind: 'manga', tags: ['seinen'], genre: null, status: 'Completed', eps: null, icon: null, size: null, repacker: null },
  { id: 'mock-mg13', title: 'Slam Dunk', poster: MOCK_POSTER, year: 1990, rating: 9.0, genres: ['Sports', 'Comedy'], kind: 'manga', tags: ['shonen'], genre: null, status: 'Completed', eps: null, icon: null, size: null, repacker: null },
  { id: 'mock-mg14', title: 'Fullmetal Alchemist', poster: MOCK_POSTER, year: 2001, rating: 9.2, genres: ['Action', 'Adventure'], kind: 'manga', tags: ['shonen'], genre: null, status: 'Completed', eps: null, icon: null, size: null, repacker: null },
  { id: 'mock-mg15', title: 'Hunter x Hunter', poster: MOCK_POSTER, year: 1998, rating: 9.0, genres: ['Action', 'Adventure'], kind: 'manga', tags: ['shonen'], genre: null, status: 'Hiatus', eps: null, icon: null, size: null, repacker: null },
]

export const mockMovies = movies
export const mockSeries = series
export const mockKdramas = kdramas
export const mockAnime = anime
export const mockHentai = hentai
export const mockGames = games
export const mockManga = manga
