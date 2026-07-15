import db from './db';

const count = db.prepare('SELECT COUNT(*) as count FROM movies').get() as { count: number };
if (count.count > 0) {
  console.log('Database already seeded.');
  process.exit(0);
}

const insertMovie = db.prepare(`
  INSERT INTO movies (id, title, thumbnail, backdrop, rating, year, duration, description, category, media_type)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertEpisode = db.prepare(`
  INSERT INTO episodes (movie_id, title, duration, description, thumbnail, episode_number)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const transaction = db.transaction(() => {
  insertMovie.run(1, 'The Midnight Sky', 'https://picsum.photos/seed/midnight/400/600', 'https://picsum.photos/seed/midnight-bg/1920/1080', 'PG-13', '2024', '2h 12m', 'A lone scientist in the Arctic races to contact a crew of astronauts returning home to a mysterious global catastrophe.', 'Trending Now', 'movie');
  insertMovie.run(2, 'Neon Horizon', 'https://picsum.photos/seed/neon/400/600', 'https://picsum.photos/seed/neon-bg/1920/1080', 'R', '2023', '1h 55m', 'In a future where memories can be traded, a detective hunts for a killer who steals the pasts of their victims.', 'Trending Now', 'movie');
  insertMovie.run(3, 'Silent Echoes', 'https://picsum.photos/seed/silent/400/600', 'https://picsum.photos/seed/silent-bg/1920/1080', 'TV-MA', '2024', '2h 05m', 'An investigative journalist uncovers a conspiracy that reaches the highest levels of government power.', 'Trending Now', 'movie');
  insertMovie.run(4, 'The Last Frontier', 'https://picsum.photos/seed/frontier/400/600', 'https://picsum.photos/seed/frontier-bg/1920/1080', 'PG-13', '2023', '2h 30m', 'Humanity\'s last hope lies in a deep-space mission to a planet that might not even exist.', 'Trending Now', 'movie');
  insertMovie.run(5, 'Shadow Protocol', 'https://picsum.photos/seed/shadow/400/600', 'https://picsum.photos/seed/shadow-bg/1920/1080', 'R', '2024', '1h 48m', 'A rogue agent must clear their name after being framed for a high-stakes cyber heist.', 'Originals', 'movie');
  insertMovie.run(6, 'Eternal Bloom', 'https://picsum.photos/seed/bloom/400/600', 'https://picsum.photos/seed/bloom-bg/1920/1080', 'TV-14', '2023', '1h 40m', 'A botanist discovers a rare flower that holds the key to reversing aging, but at a terrible cost.', 'Originals', 'movie');

  insertMovie.run(7, 'Starfall Academy', 'https://picsum.photos/seed/starfall/400/600', 'https://picsum.photos/seed/starfall-bg/1920/1080', 'TV-14', '2024', '6 Seasons', 'At an elite intergalactic academy, cadets train for diplomacy and combat while uncovering secrets that could ignite a war.', 'Trending Now', 'tv');
  insertEpisode.run(7, 'The Arrival', '48m', 'New cadet Mira arrives at Starfall Academy and immediately clashes with a rival squadron.', 'https://picsum.photos/seed/ep101/400/225', 1);
  insertEpisode.run(7, 'Zero Gravity', '52m', 'The first training exercise in zero gravity pushes everyone to their limits.', 'https://picsum.photos/seed/ep102/400/225', 2);
  insertEpisode.run(7, 'The Signal', '45m', 'An unidentified signal from the Andromeda sector puts the academy on high alert.', 'https://picsum.photos/seed/ep103/400/225', 3);

  insertMovie.run(8, 'Crimson Justice', 'https://picsum.photos/seed/crimson/400/600', 'https://picsum.photos/seed/crimson-bg/1920/1080', 'TV-MA', '2023', '4 Seasons', 'A disgraced lawyer returns to the courtroom to take on the city\'s most dangerous criminals, one case at a time.', 'Trending Now', 'tv');
  insertEpisode.run(8, 'The Retrial', '55m', 'Lawyer Alex Cross takes on a wrongful conviction case that hits close to home.', 'https://picsum.photos/seed/ep201/400/225', 1);
  insertEpisode.run(8, 'Blood Evidence', '50m', 'New DNA evidence threatens to unravel the city\'s biggest criminal case.', 'https://picsum.photos/seed/ep202/400/225', 2);
  insertEpisode.run(8, 'The Witness', '52m', 'A key witness goes missing hours before the trial of the decade.', 'https://picsum.photos/seed/ep203/400/225', 3);
  insertEpisode.run(8, 'Verdict', '58m', 'The season finale delivers shocking twists that change everything.', 'https://picsum.photos/seed/ep204/400/225', 4);

  insertMovie.run(9, 'The Deep Dive', 'https://picsum.photos/seed/deepdive/400/600', 'https://picsum.photos/seed/deepdive-bg/1920/1080', 'PG-13', '2024', '3 Seasons', 'A marine biologist and her crew discover an ancient civilization beneath the ocean floor.', 'Originals', 'tv');
  insertEpisode.run(9, 'Descent', '47m', 'Dr. Nova leads an expedition to the deepest trench ever explored.', 'https://picsum.photos/seed/ep301/400/225', 1);
  insertEpisode.run(9, 'The Temple', '51m', 'The crew discovers an underwater structure that predates human civilization.', 'https://picsum.photos/seed/ep302/400/225', 2);
  insertEpisode.run(9, 'Pressure', '49m', 'As supplies dwindle, tensions rise and a crew member goes missing.', 'https://picsum.photos/seed/ep303/400/225', 3);

  insertMovie.run(10, 'Iron Circuit', 'https://picsum.photos/seed/iron/400/600', 'https://picsum.photos/seed/iron-bg/1920/1080', 'TV-14', '2023', '2 Seasons', 'In a world of illegal mech battles, a young pilot fights to earn her freedom one round at a time.', 'Originals', 'tv');
  insertEpisode.run(10, 'First Fight', '44m', 'Rin enters her first illegal mech battle to pay off her family\'s debt.', 'https://picsum.photos/seed/ep401/400/225', 1);
  insertEpisode.run(10, 'Upgrade', '46m', 'A mysterious sponsor offers Rin a cutting-edge mech with strings attached.', 'https://picsum.photos/seed/ep402/400/225', 2);
  insertEpisode.run(10, 'The Champion', '53m', 'Rin faces the undefeated champion in a fight that could cost her everything.', 'https://picsum.photos/seed/ep403/400/225', 3);

  insertMovie.run(11, 'Phantom Signal', 'https://picsum.photos/seed/phantom/400/600', 'https://picsum.photos/seed/phantom-bg/1920/1080', 'R', '2024', '2h 15m', 'A cryptographer intercepts a signal from deep space that holds the blueprint for a terrifying new weapon.', 'New Releases', 'movie');
  insertMovie.run(12, 'Thunder Convoy', 'https://picsum.photos/seed/thunder/400/600', 'https://picsum.photos/seed/thunder-bg/1920/1080', 'PG-13', '2024', '1h 52m', 'An elite trucker must outrun a relentless syndicate across the post-apocalyptic wasteland.', 'Action & Adventure', 'movie');
  insertMovie.run(13, 'Wildfire Ridge', 'https://picsum.photos/seed/wildfire/400/600', 'https://picsum.photos/seed/wildfire-bg/1920/1080', 'TV-MA', '2025', '2h 08m', 'A team of elite firefighters battles an unprecedented megafire while uncovering arson that leads to the highest offices.', 'Action & Adventure', 'movie');
});

transaction();

console.log('Database seeded successfully.');
