/**
 * Editorial data for the game, studio and patch-note pages.
 * Edit this file for each game. The demo update is visible only in dev.
 */
import { site } from './site';

export const gameProfile = {
  background: `${site.game.name} is a competitive Roblox boxing experience presented from behind your boxer’s gloves. The official description focuses on reading attacks, choosing the right defense, managing stamina, and creating openings instead of relying on a third-person camera.`,
  gameplay: 'Enter matches against other players or use AI practice to learn the first-person view. The verified combat systems include punches, slips, separate head and body guards, stamina, counters, cinematic knockdowns, and replays.',
  audience: 'It suits players who enjoy competitive boxing, reaction-based defense, first-person spacing, and improving through repeated practice. New players can begin against AI before applying the same observations in player matches.',
  lastVerified: 'October 15, 2026',
  facts: [
    { label: 'Official title', value: site.game.name },
    { label: 'Developer', value: site.game.developer },
    { label: 'Platform', value: site.game.platform },
    { label: 'Devices', value: 'PC, mobile, console' },
    { label: 'Genre', value: 'Action · Battlegrounds & Fighting' },
    { label: 'Server size', value: 'Up to 16 players' },
    { label: 'Roblox experience created', value: 'September 28, 2026' },
    { label: 'Place ID', value: '132956556682909' },
  ],
  mechanics: [
    { title: 'First-person perspective', text: 'Every punch, defensive read, counter, and knockdown is presented from behind your gloves.' },
    { title: 'Head and body guards', text: 'Different guards protect different target areas, so defense depends on reading the incoming threat.' },
    { title: 'Slips', text: 'Slipping lets you avoid punches and can leave room to respond when the position is right.' },
    { title: 'Stamina management', text: 'The official description warns that fatigue slows you down, making repeated actions a resource decision.' },
    { title: 'Counters', text: 'Counters reward a successful read, but exact timing windows and damage values still require current in-game testing.' },
    { title: 'Knockdowns and replays', text: 'Matches include cinematic knockdowns and replays, although the precise knockout rules are not publicly documented.' },
  ],
  playOptions: [
    { title: 'Player matches', text: 'Fight other players and adapt to their movement, defense, stamina use, and attacking habits.' },
    { title: 'AI practice', text: 'Repeat controls and defensive choices in a lower-pressure setting before testing them in player matches.' },
  ],
  verified: [
    'PC, mobile, and console support',
    'Player matches and AI practice',
    'Punches, slips, head and body guards, stamina, counters, knockdowns, and replays',
    'A maximum server size of 16 players',
  ],
  needsTesting: [
    'Exact keyboard, touch, and controller combat inputs',
    'Damage, stamina costs, recovery rates, and timing windows',
    'Counter bonuses, guard reduction, and knockout conditions',
    'A game-specific code menu or redemption process',
  ],
};

export const developerProfile = {
  description: `${site.game.developer} is credited on the official Roblox experience page for ${site.game.name}. Further team details have not been verified.`,
  games: [
    { name: site.game.name, description: site.game.genre, href: '/game/' },
    // Add more games with their own local detail page when available.
  ],
};

export interface GameUpdate {
  slug: string;
  title: string;
  date: string;
  version?: string;
  summary: string;
  sections: Array<{ heading: string; text: string }>;
  /** Preview only: never published or linked from the production homepage. */
  example?: boolean;
}

export const gameUpdates: GameUpdate[] = [
  {
    slug: 'example-update',
    title: 'Example game update — replace with patch notes',
    date: '2026-10-15',
    version: 'Example',
    summary: 'This preview shows how a game update links from the homepage to its own detail page.',
    sections: [
      { heading: 'What changed', text: 'Replace this paragraph with the actual changes in your game update.' },
      { heading: 'What players should know', text: 'Explain who the change affects and link to related guides when they are ready.' },
    ],
    example: true,
  },
];

export function visibleGameUpdates(): GameUpdate[] {
  return gameUpdates
    .filter((update) => import.meta.env.DEV || !update.example)
    .sort((a, b) => b.date.localeCompare(a.date));
}
