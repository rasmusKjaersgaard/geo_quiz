import { COUNTRIES, type Continent } from './countries';
import { PEOPLE } from './people';

export type QuizKind = 'countries' | 'streak';
export type StreakMode = 'flags' | 'capitals' | 'people';

export interface QuizDef {
  id: string;
  title: string;
  kind: QuizKind;
  /** For streak quizzes: what is shown and what you type. */
  mode?: StreakMode;
  continent?: Continent;
  /** Country ids, or person ids for the people quiz. */
  itemIds: string[];
  /** Used until the admin sets a time limit. */
  defaultTimeSec: number;
  blurb: string;
}

const ALL_IDS = COUNTRIES.map((c) => c.id);
const idsOf = (continent: Continent) => COUNTRIES.filter((c) => c.continent === continent).map((c) => c.id);

const continentQuiz = (continent: Continent, slug: string, defaultTimeSec: number): QuizDef => ({
  id: `capitals-${slug}`,
  title: `Capitals of ${continent}`,
  kind: 'streak',
  mode: 'capitals',
  continent,
  itemIds: idsOf(continent),
  defaultTimeSec,
  blurb: `Name the capital of every country in ${continent}.`,
});

export const QUIZZES: QuizDef[] = [
  {
    id: 'countries',
    title: 'Countries of the World',
    kind: 'countries',
    itemIds: ALL_IDS,
    defaultTimeSec: 15 * 60,
    blurb: 'Name all 197 countries. Any order, no wrong answers.',
  },
  {
    id: 'flags',
    title: 'Flags of the World',
    kind: 'streak',
    mode: 'flags',
    itemIds: ALL_IDS,
    defaultTimeSec: 12 * 60,
    blurb: 'Name the country for each flag. Keep the streak going.',
  },
  {
    id: 'capitals',
    title: 'Capitals of the World',
    kind: 'streak',
    mode: 'capitals',
    itemIds: ALL_IDS,
    defaultTimeSec: 12 * 60,
    blurb: 'Name the capital of every country.',
  },
  {
    id: 'danish-actors',
    title: 'Danish Actors',
    kind: 'streak',
    mode: 'people',
    // Only people with an uploaded photo are used (see the Settings page).
    itemIds: PEOPLE.map((p) => p.id),
    defaultTimeSec: 8 * 60,
    blurb: 'Name the Danish actor or actress in each photo.',
  },
  continentQuiz('Africa', 'africa', 5 * 60),
  continentQuiz('Asia', 'asia', 5 * 60),
  continentQuiz('Europe', 'europe', 5 * 60),
  continentQuiz('North America', 'north-america', 3 * 60),
  continentQuiz('South America', 'south-america', 2 * 60),
  continentQuiz('Oceania', 'oceania', 2 * 60),
];

export const QUIZ_BY_ID: Record<string, QuizDef> = Object.fromEntries(QUIZZES.map((q) => [q.id, q]));
