import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Clean existing data
    await prisma.vote.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.post.deleteMany();
    await prisma.game.deleteMany();
    await prisma.user.deleteMany();

    // Create users
    const passwordHash = await bcrypt.hash('password123', 12);
    const users = await Promise.all([
        prisma.user.create({
            data: { username: 'GameMaster', email: 'gamemaster@gameon.dev', passwordHash, isAdmin: true, karma: 150 },
        }),
        prisma.user.create({
            data: { username: 'ProGamer42', email: 'progamer@gameon.dev', passwordHash, karma: 85 },
        }),
        prisma.user.create({
            data: { username: 'PixelNinja', email: 'pixel@gameon.dev', passwordHash, karma: 62 },
        }),
        prisma.user.create({
            data: { username: 'ShadowBlade', email: 'shadow@gameon.dev', passwordHash, karma: 40 },
        }),
        prisma.user.create({
            data: { username: 'NoobSlayer', email: 'noob@gameon.dev', passwordHash, karma: 28 },
        }),
    ]);

    console.log(`  ✅ Created ${users.length} users`);

    // Create games
    const games = await Promise.all([
        prisma.game.create({
            data: {
                slug: 'valorant',
                name: 'Valorant',
                description: 'A 5v5 character-based tactical FPS where precise gunplay meets unique agent abilities. Master your agent, sharpen your aim, and outsmart your opponents.',
                iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fc/Valorant_logo_-_pink_color_version.svg',
            },
        }),
        prisma.game.create({
            data: {
                slug: 'counter-strike-2',
                name: 'Counter-Strike 2',
                description: 'The next evolution of competitive CS. Experience redesigned maps, responsive smoke grenades, and refined gameplay built on the Source 2 engine.',
                iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1e/CS2_logo.svg',
            },
        }),
        prisma.game.create({
            data: {
                slug: 'bgmi',
                name: 'BGMI',
                description: 'Battlegrounds Mobile India — the ultimate battle royale experience on mobile. Drop in, loot up, and fight to be the last one standing.',
                iconUrl: 'https://upload.wikimedia.org/wikipedia/en/4/4e/Battlegrounds_Mobile_India_logo.png',
            },
        }),
        prisma.game.create({
            data: {
                slug: 'elden-ring',
                name: 'Elden Ring',
                description: 'An action RPG set in the Lands Between, created by FromSoftware and George R.R. Martin. Explore a vast open world filled with danger and discovery.',
                iconUrl: 'https://upload.wikimedia.org/wikipedia/en/b/b9/Elden_Ring_Box_art.jpg',
            },
        }),
        prisma.game.create({
            data: {
                slug: 'fortnite',
                name: 'Fortnite',
                description: 'Build, battle, and create in the world\'s most popular battle royale. From zero build to creative mode, there\'s something for everyone.',
                iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Fortnite_F_letterance_logo.png',
            },
        }),
        prisma.game.create({
            data: {
                slug: 'gta-v',
                name: 'GTA V',
                description: 'Experience the sprawling world of Los Santos and Blaine County in the critically acclaimed Grand Theft Auto V, featuring an ever-evolving online world.',
                iconUrl: 'https://upload.wikimedia.org/wikipedia/en/a/a5/Grand_Theft_Auto_V.png',
            },
        }),
    ]);

    console.log(`  ✅ Created ${games.length} games`);

    // Create posts
    const postData = [
        { gameIdx: 0, userIdx: 1, title: 'Best Jett movement tech for Pearl', content: 'Here are some advanced Jett movement techniques that will help you dominate on Pearl. The key is to combine updraft with dash at specific angles to reach unexpected positions.\n\n1. **Mid to B Main Jump** — Use updraft on the pillar near mid doors, then dash towards B main for a quick rotate.\n2. **A Main Float** — Updraft above the entrance and hold the angle with an Operator.\n3. **One-way smoke spots** — Place your cloudburst at the top of B site and float above for a clear view.\n\nPractice these in custom games and you\'ll see a significant improvement in your Pearl performance.', score: 24 },
        { gameIdx: 0, userIdx: 2, title: 'Omen is the best controller - change my mind', content: 'After playing 500+ hours with every controller in the game, I\'m convinced Omen is the most versatile. His paranoia is the best flash ability in the game, his smokes recharge, and his teleport opens up so many creative plays.\n\nViper is great too, but she\'s map-dependent. Brimstone\'s smokes are too limited. Astra requires too much coordination for solo queue.\n\nOmen can do it all — lurk, entry, clutch. What do you think?', score: 18 },
        { gameIdx: 0, userIdx: 3, title: 'Tips for breaking out of Silver rank', content: 'I\'ve been hardstuck Silver for two acts now. Here are the things that finally helped me climb:\n\n- **Crosshair placement** — Always aim at head level. This alone will win you more duels.\n- **Communication** — Even simple callouts make a huge difference.\n- **Economy management** — Stop force buying every round.\n- **Play 2-3 agents max** — Master a few instead of being mediocre at many.\n\nWhat helped you climb out of Silver?', score: 31 },
        { gameIdx: 1, userIdx: 0, title: 'CS2 Premier mode is a game changer', content: 'The new Premier mode in CS2 is exactly what competitive CS needed. The pick-ban system adds so much strategy before the game even starts. No more playing the same 3 maps over and over.\n\nThe ELO system feels much more accurate than the old rank system. I\'ve been matched with players of similar skill much more consistently.\n\nOnly complaint: the queue times can be long during off-peak hours. But overall, it\'s a massive improvement.', score: 42 },
        { gameIdx: 1, userIdx: 4, title: 'Smoke lineup guide for Inferno', content: 'Compiled the essential smoke lineups every CS2 player should know for Inferno:\n\n**T-Side:**\n- Xbox smoke from T spawn\n- CT smoke from banana\n- Coffin smoke from second mid\n\n**CT-Side:**\n- Banana smoke from back site\n- Top mid smoke from library\n\nAll lineups work with the new smoke mechanics. The volumetric smoke actually makes these more reliable than in CSGO since they fill spaces more naturally.', score: 35 },
        { gameIdx: 1, userIdx: 1, title: 'AWP nerf discussion - too far or needed?', content: 'The recent AWP changes in the latest update have divided the community. The movement speed reduction while scoped has made aggressive AWPing significantly harder.\n\nI think it\'s a healthy change that encourages more strategic play. But many pros disagree. What\'s your take?', score: 15 },
        { gameIdx: 2, userIdx: 3, title: 'BGMI best loadout for Erangel 2.0', content: 'After extensive testing on the new Erangel 2.0, here\'s the optimal loadout:\n\n**Primary:** M416 with 6x scope (use as 3x), compensator, tactical stock, extended mag\n**Secondary:** AWM or M24 for long-range\n**Grenades:** 4 smoke, 2 frag, 1 molotov\n\nThe M416 is still king due to its versatility. Pair it with a bolt-action and you\'re covered for every scenario.\n\nWhat loadout do you prefer?', score: 22 },
        { gameIdx: 2, userIdx: 4, title: 'Hot drops vs safe drops - the eternal debate', content: 'I used to be a Pochinki hot dropper, but switching to a safer drop strategy has improved my average placement significantly.\n\n**Hot drop pros:** Improve combat skills, high risk high reward\n**Safe drop pros:** Consistent looting, better late game\n\nFor ranking up, safe drops are objectively better. But for improving mechanically, nothing beats hot dropping for 50 games straight.\n\nWhich side are you on?', score: 17 },
        { gameIdx: 3, userIdx: 0, title: 'Malenia defeated with no hits taken', content: 'After 400 attempts, I finally did it. Malenia, Blade of Miquella — no hit run complete.\n\nKey strategies:\n- **Phase 1:** Stay close, roll through her combo chains, punish the recovery frames\n- **Waterfowl Dance:** Sprint away on the first flurry, then dodge INTO the second and third\n- **Phase 2:** The rot flower opener — just run. Sprint perpendicular and you\'ll avoid everything\n- **Scarlet Aeonia:** Biggest punish window. Get 3-4 hits in.\n\nUsed a pure STR build with Giant-Crusher. It\'s brutal but satisfying.', score: 67 },
        { gameIdx: 3, userIdx: 2, title: 'Best faith build for DLC?', content: 'With the DLC content, faith builds have gotten incredibly strong. Here\'s my setup:\n\n**Stats (RL 150):**\n- VIG: 50, MND: 35, END: 20, STR: 16, DEX: 16, FTH: 80\n\n**Weapons:** Coded Sword + Erdtree Seal\n**Armor:** Tree Sentinel set\n**Talismans:** Sacred Scorpion, Flock\'s Canvas, Radagon Icon, Shard of Alexander\n\n**Key Incantations:** Ancient Dragon\'s Lightning Strike, Pest Threads (destroys large bosses), Golden Vow, Lord\'s Divine Fortification\n\nThis build melts everything. The incantation scaling at 80 FTH is insane.', score: 45 },
        { gameIdx: 3, userIdx: 4, title: 'Elden Ring changed my perspective on open world games', content: 'I used to think open world games were all the same — climb towers, mark icons, follow GPS. Elden Ring threw all of that out and created something special.\n\nThe sense of discovery is unmatched. Every cave, every NPC, every item placement feels intentional. There\'s no quest markers telling you where to go. You just... explore.\n\nThis has ruined other open world games for me. I tried going back to some and they feel so formulaic by comparison.\n\nHas anyone else felt this way?', score: 53 },
        { gameIdx: 4, userIdx: 1, title: 'No Build mode is the best thing Epic ever did', content: 'As someone who could never keep up with the sweaty builders, No Build mode brought me back to Fortnite. The game is so much more fun when it\'s about positioning and gunplay rather than building skyscrapers in 2 seconds.\n\nLast season I hit Champions in ranked No Build and it felt amazing. The skill gap is still there — it\'s just about different skills now.\n\nAnyone else come back to Fortnite because of No Build?', score: 38 },
        { gameIdx: 4, userIdx: 3, title: 'Creative 2.0 island showcase - Desert City', content: 'Spent 3 months building this desert city in Creative 2.0 using UEFN. Features:\n\n- Full destructible buildings\n- Day/night cycle\n- NPC merchants\n- Custom weapon\n- Parkour challenges\n\nIsland code: 1234-5678-9012 (not real, just for demo)\n\nCreative 2.0 has given map creators so much more power. The UEFN tools are incredible once you learn them.\n\nWould love feedback from anyone who tries it!', score: 25 },
        { gameIdx: 4, userIdx: 0, title: 'Season X meta analysis', content: 'Breaking down the current meta after two weeks of Season X:\n\n**S Tier:** MK-Seven, Gatekeeper Shotgun, Shield Bubble\n**A Tier:** Tactical AR, Combat SMG, Shockwave\n**B Tier:** Ranger Shotgun, Auto Shotgun, Boogie Bomb\n**C Tier:** Most pistols, Hunting Rifle\n\nThe MK-Seven is dominant at all ranges. The Gatekeeper Shotgun has replaced the Pump as the go-to close range option. Shield Bubble is a must-pick in competitive.\n\nDisagree with any of my placements?', score: 29 },
        { gameIdx: 5, userIdx: 0, title: 'GTA Online Cayo Perico solo guide - max profit', content: 'Here\'s the most efficient Cayo Perico solo strategy:\n\n1. **Scope:** Go for the drainage tunnel entrance. Only scope the main target and secondary targets near the compound.\n2. **Prep:** Kosatka approach, cutting torch, crack shotgun suppressor, fingerprint cloner\n3. **Heist route:** Drainage tunnel > Main target > Leave via main dock\n4. **Elite challenge:** Complete under 15 min for extra $100k\n\nWith practice, you can do the entire heist cycle (scope + prep + finale) in about 45 minutes for $1.3-1.8M depending on the main target.\n\nAsk me anything about the route in the comments!', score: 48 },
        { gameIdx: 5, userIdx: 2, title: 'Car meets are the best part of GTA Online', content: 'Forget the grinding, the heists, the PvP. Car meets with friends are where GTA Online truly shines.\n\nWe do weekly meets at the LS Car Meet, and it\'s become the highlight of my gaming week. Showing off custom builds, doing drag races, cruising around the map — it\'s pure fun.\n\nAnyone want to join our Thursday night meets? We\'re on PC, comment your Social Club name.', score: 21 },
        { gameIdx: 5, userIdx: 4, title: 'Best businesses for passive income in 2024', content: 'If you\'re looking to make money while AFK, here are the best passive income sources ranked:\n\n1. **Nightclub** — Generates product from all linked businesses\n2. **Agency** — Pays $20k every 48 min of real time\n3. **Arcade** — Safe generates up to $50k max\n4. **MC Businesses** — Coke > Meth > Cash linked to Nightclub\n\nTotal passive income per hour: ~$250k\n\nDon\'t waste time grinding crates in 2024. Set up passive income and enjoy the game.', score: 33 },
        { gameIdx: 0, userIdx: 4, title: 'Deadlock agent concept - Trap Master', content: 'Here\'s my fan concept for a new Sentinel agent:\n\n**Name:** Deadlock\n**Role:** Sentinel\n\n**Abilities:**\n- **C - Tripwire:** Deploy a laser tripwire that slows and reveals enemies\n- **Q - Sound Trap:** Place a device that emits fake footstep sounds to bait enemies\n- **E - Net Launcher:** Fire a net that cocoons an enemy briefly\n- **X - Lockdown:** Deploy a device that disables all enemy abilities in an area for 8 seconds\n\nThis would create a new kind of Sentinel focused on denial and deception rather than pure site holding.', score: 19 },
        { gameIdx: 3, userIdx: 1, title: 'Unpopular opinion: Radahn fight is perfectly fair', content: 'I see so many complaints about the Radahn fight, but honestly it\'s one of the best designed fights in the game.\n\n- The summon signs are there for a reason — use them\n- His attacks have clear telegraphs\n- The gravity arrows can be dodged on horseback\n- Phase 2 entrance is cinematic and gives you time to heal\n\nThe fight is a spectacle. It\'s meant to feel overwhelming because you\'re fighting a demigod.\n\nStop trying to solo him without summons and then complaining he\'s unfair. The game literally puts 8 summon signs for you.', score: 36 },
        { gameIdx: 2, userIdx: 1, title: 'My journey from Bronze to Conqueror', content: 'Took me 6 seasons but I finally hit Conqueror in BGMI. Here\'s what changed at each rank:\n\n**Bronze-Gold:** Learn the basics — looting, circle rotation, basic combat\n**Platinum:** Start learning spray patterns and positioning\n**Diamond:** Map knowledge becomes crucial. Know every compound, every rotation\n**Crown:** Game sense separates you here. Predicting zone, reading enemy movements\n**Ace-Conqueror:** Consistency. 10+ kills and top 3 finishes every game\n\nThe biggest jump was Diamond to Crown. That\'s where you need to stop playing like a casual and start playing strategically.\n\nHappy to help anyone who\'s stuck — drop your questions!', score: 27 },
    ];

    const posts = [];
    for (const pd of postData) {
        const post = await prisma.post.create({
            data: {
                title: pd.title,
                content: pd.content,
                score: pd.score,
                userId: users[pd.userIdx].id,
                gameId: games[pd.gameIdx].id,
            },
        });
        posts.push(post);
    }

    console.log(`  ✅ Created ${posts.length} posts`);

    // Create comments (threaded)
    const commentData: Array<{ postIdx: number; userIdx: number; content: string; parentIdx?: number }> = [
        { postIdx: 0, userIdx: 2, content: 'The mid to B main jump is insane! Tried it yesterday and got 3 kills in one round.' },
        { postIdx: 0, userIdx: 3, content: 'Can you share a video? I keep messing up the timing.' },
        { postIdx: 0, userIdx: 1, content: 'I\'ll try to record one tonight. The key is to updraft at the very edge of the pillar.', parentIdx: 1 },
        { postIdx: 0, userIdx: 4, content: 'Works great in Immortal lobbies too. People don\'t expect it.', parentIdx: 0 },
        { postIdx: 1, userIdx: 0, content: 'Astra is actually better in a coordinated team. Her stars are unmatched for site executes.' },
        { postIdx: 1, userIdx: 3, content: 'In solo queue? Omen wins easily. Astra needs comms to work properly.', parentIdx: 4 },
        { postIdx: 1, userIdx: 4, content: 'Facts. I tried Astra in solo queue and it was painful.', parentIdx: 5 },
        { postIdx: 2, userIdx: 0, content: 'Great tips! The economy management one is huge. So many Silver players force buy every round.' },
        { postIdx: 2, userIdx: 1, content: 'Crosshair placement is literally the easiest way to improve. Just pre-aim head level and you win.' },
        { postIdx: 2, userIdx: 4, content: 'What agents do you recommend for Silver? I keep getting instalock duelists.', parentIdx: 8 },
        { postIdx: 2, userIdx: 3, content: 'Play Sage or KAY/O. Both are useful regardless of team comp.', parentIdx: 9 },
        { postIdx: 3, userIdx: 1, content: 'Pick-ban is the best addition. Finally some strategy before the match starts.' },
        { postIdx: 3, userIdx: 2, content: 'Queue times are brutal in OCE region. 10+ minutes in Premier.' },
        { postIdx: 3, userIdx: 3, content: 'Same here in SEA at night. It improves during peak hours though.', parentIdx: 12 },
        { postIdx: 4, userIdx: 0, content: 'The volumetric smokes changed so many lineups. Good to see updated ones.' },
        { postIdx: 4, userIdx: 3, content: 'Missing the A long smoke from pit. That\'s essential for executes.' },
        { postIdx: 4, userIdx: 1, content: 'Adding that in the update! Thanks for pointing it out.', parentIdx: 15 },
        { postIdx: 8, userIdx: 1, content: 'Legend. 400 attempts is some serious dedication. What level were you?' },
        { postIdx: 8, userIdx: 0, content: 'RL 125, pure STR. Made it harder but more satisfying.', parentIdx: 17 },
        { postIdx: 8, userIdx: 3, content: 'I\'m on attempt 150. The Waterfowl Dance keeps getting me.' },
        { postIdx: 8, userIdx: 4, content: 'Try Bloodhound Step! It makes the first flurry much easier.', parentIdx: 19 },
        { postIdx: 8, userIdx: 0, content: 'No items/ashes for a true no-hit run. Just pure rolling!', parentIdx: 20 },
        { postIdx: 9, userIdx: 0, content: 'Have you tried the new DLC incantations? Some of them scale insanely with faith.' },
        { postIdx: 9, userIdx: 3, content: 'Pest Threads is so underrated. Melts anything bigger than you.' },
        { postIdx: 10, userIdx: 1, content: 'Same here. Tried playing another open world after ER and it felt like a checklist.' },
        { postIdx: 10, userIdx: 3, content: 'BotW and Elden Ring are the gold standard for open worlds now.' },
        { postIdx: 10, userIdx: 4, content: 'The lack of quest log annoyed me at first but now I appreciate it.', parentIdx: 25 },
        { postIdx: 10, userIdx: 0, content: 'It forces you to actually pay attention to NPC dialogue. Great design.', parentIdx: 26 },
        { postIdx: 11, userIdx: 4, content: 'No Build saved Fortnite for me. I uninstalled when building meta went crazy.' },
        { postIdx: 11, userIdx: 0, content: 'Building is still the core of Fortnite though. No Build is just a casual mode.', parentIdx: 28 },
        { postIdx: 11, userIdx: 1, content: 'Ranked No Build is hardly casual. The skill gap is real, just different.', parentIdx: 29 },
        { postIdx: 14, userIdx: 1, content: 'Best solo money guide I\'ve seen. The drainage tunnel route is clutch.' },
        { postIdx: 14, userIdx: 3, content: 'Can you do this with the Longfin approach? I don\'t have the Kosatka yet.' },
        { postIdx: 14, userIdx: 0, content: 'Kosatka is the best investment you can make. Save up for it first.', parentIdx: 32 },
        { postIdx: 14, userIdx: 4, content: 'Skip the cutting torch and use C4 instead. Faster for some routes.', parentIdx: 31 },
        { postIdx: 15, userIdx: 0, content: 'What platform? I\'d love to join if it\'s PC.' },
        { postIdx: 15, userIdx: 2, content: 'Yes! PC meets are the best. DM me your Social Club.' },
        { postIdx: 15, userIdx: 4, content: 'Do you guys accept console players who can cross-play?' },
        { postIdx: 6, userIdx: 0, content: 'M416 with 6x is the GOAT combo. Been using it since season 1.' },
        { postIdx: 6, userIdx: 1, content: 'I prefer DP-28 for midrange. The bipod is nuts for holding angles.' },
        { postIdx: 6, userIdx: 2, content: 'Beryl > M416 if you can control the recoil. Higher DPS.', parentIdx: 38 },
        { postIdx: 7, userIdx: 0, content: 'Safe drop gang. Gotta hit that top 10 consistently for ranking up.' },
        { postIdx: 7, userIdx: 2, content: 'Hot drop Bootcamp 100 times and your close combat will be unbeatable.' },
        { postIdx: 19, userIdx: 0, content: 'Great breakdown! Diamond to Crown was the hardest for me too.' },
        { postIdx: 19, userIdx: 2, content: 'How many hours a day did you play during your climb?' },
        { postIdx: 19, userIdx: 1, content: 'About 3-4 hours focused play. Quality over quantity.', parentIdx: 43 },
        { postIdx: 13, userIdx: 1, content: 'MK-Seven needs a nerf ASAP. It\'s way too accurate at range.' },
        { postIdx: 13, userIdx: 2, content: 'I love the Shield Bubble. Finally some defensive utility.', parentIdx: 45 },
        { postIdx: 17, userIdx: 0, content: 'The Sound Trap ability is genius. Would add so much mind games.' },
        { postIdx: 17, userIdx: 3, content: 'Lockdown ult seems too strong. Maybe 5 seconds instead of 8?' },
        { postIdx: 18, userIdx: 4, content: 'I solo\'d Radahn and it was the most epic moment in gaming for me.' },
    ];

    const comments: any[] = [];
    for (const cd of commentData) {
        const comment = await prisma.comment.create({
            data: {
                content: cd.content,
                score: Math.floor(Math.random() * 20) + 1,
                postId: posts[cd.postIdx].id,
                userId: users[cd.userIdx].id,
                parentCommentId: cd.parentIdx !== undefined ? comments[cd.parentIdx].id : null,
            },
        });
        comments.push(comment);
    }

    console.log(`  ✅ Created ${comments.length} comments`);

    // Create some votes
    let voteCount = 0;
    for (const post of posts.slice(0, 10)) {
        for (const user of users) {
            if (user.id !== post.userId && Math.random() > 0.3) {
                try {
                    await prisma.vote.create({
                        data: {
                            userId: user.id,
                            postId: post.id,
                            voteType: Math.random() > 0.2 ? 1 : -1,
                        },
                    });
                    voteCount++;
                } catch {
                    // Skip duplicates
                }
            }
        }
    }

    console.log(`  ✅ Created ${voteCount} votes`);
    console.log('🎮 Seed complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
