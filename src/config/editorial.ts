/**
 * Editorial data for the game, studio and patch-note pages.
 * Edit this file for each game. The demo update is visible only in dev.
 */
import { site } from './site';

export const gameProfile = {
  background: `${site.game.name} is a first-person boxing experience on Roblox. Step into the ring for player matches or practice against AI.`,
  gameplay: 'Read your opponent, slip punches, guard your head and body, manage stamina, and time counters to create knockout openings.',
  audience: 'For players who enjoy competitive boxing, reaction-based defense, and improving their timing through practice.',
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
