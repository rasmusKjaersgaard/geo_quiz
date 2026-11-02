// =============================================================================
// People for the "Danish Actors" quiz. Edit freely.
//
// Fields
//   id        permanent id; also the photo's file name in storage. Don't change
//             it once a photo is uploaded (the photo would be orphaned).
//   name      display name and the main accepted answer
//   category  used to group people on the Settings page
//   aliases   optional other accepted answers, e.g. a stage name
//
// Accepted answers (built in src/data/people.ts -> personAnswers):
//   - the full name ("Mads Mikkelsen"); surnames alone never count
//   - with three or more names: first name + any one other name
//     ("Sidse Babett", "Sidse Knudsen"); initials like "W." are skipped
//   - Danish letters either way: ø = o = oe, å = a = aa, æ = ae
//     ("Søren" = "Soren" = "Soeren", "Gråbøl" = "Graaboel")
//   - plus the usual matching rules (case, accents, hyphens and spaces ignored)
//
// Only people with an uploaded photo appear in the quiz. The admin uploads
// photos on the Settings page; they're stored privately in Supabase.
// =============================================================================

export type PersonCategory = 'International' | 'Present men' | 'Present women' | 'Comedians and revue' | 'Classics';

export const PERSON_CATEGORIES: PersonCategory[] = ['International', 'Present men', 'Present women', 'Comedians and revue', 'Classics'];

export interface Person {
  id: string;
  name: string;
  category: PersonCategory;
  aliases?: string[];
}

export const PEOPLE: Person[] = [
  // --------------------------------------------------------- International (12)
  { id: 'mads-mikkelsen', name: 'Mads Mikkelsen', category: 'International' },
  { id: 'nikolaj-coster-waldau', name: 'Nikolaj Coster-Waldau', category: 'International' },
  { id: 'connie-nielsen', name: 'Connie Nielsen', category: 'International' },
  { id: 'claes-bang', name: 'Claes Bang', category: 'International' },
  { id: 'pilou-asbaek', name: 'Pilou Asbæk', category: 'International' },
  { id: 'sidse-babett-knudsen', name: 'Sidse Babett Knudsen', category: 'International' },
  { id: 'ulrich-thomsen', name: 'Ulrich Thomsen', category: 'International' },
  { id: 'birgitte-hjort-sorensen', name: 'Birgitte Hjort Sørensen', category: 'International' },
  { id: 'brigitte-nielsen', name: 'Brigitte Nielsen', category: 'International' },
  { id: 'anna-karina', name: 'Anna Karina', category: 'International' },
  { id: 'lars-mikkelsen', name: 'Lars Mikkelsen', category: 'International' },
  { id: 'kim-bodnia', name: 'Kim Bodnia', category: 'International' },

  // ----------------------------------------------------------- Present men (28)
  { id: 'nikolaj-lie-kaas', name: 'Nikolaj Lie Kaas', category: 'Present men' },
  { id: 'anders-w-berthelsen', name: 'Anders W. Berthelsen', category: 'Present men' },
  { id: 'thomas-bo-larsen', name: 'Thomas Bo Larsen', category: 'Present men' },
  { id: 'lars-ranthe', name: 'Lars Ranthe', category: 'Present men' },
  { id: 'magnus-millang', name: 'Magnus Millang', category: 'Present men' },
  { id: 'soren-malling', name: 'Søren Malling', category: 'Present men' },
  { id: 'jesper-christensen', name: 'Jesper Christensen', category: 'Present men' },
  { id: 'nicolas-bro', name: 'Nicolas Bro', category: 'Present men' },
  { id: 'jakob-cedergren', name: 'Jakob Cedergren', category: 'Present men' },
  { id: 'thure-lindhardt', name: 'Thure Lindhardt', category: 'Present men' },
  { id: 'esben-smed', name: 'Esben Smed', category: 'Present men' },
  { id: 'mikkel-boe-folsgaard', name: 'Mikkel Boe Følsgaard', category: 'Present men' },
  { id: 'dar-salim', name: 'Dar Salim', category: 'Present men' },
  { id: 'david-dencik', name: 'David Dencik', category: 'Present men' },
  { id: 'zlatko-buric', name: 'Zlatko Burić', category: 'Present men' },
  { id: 'peter-gantzler', name: 'Peter Gantzler', category: 'Present men' },
  { id: 'mikael-birkkjaer', name: 'Mikael Birkkjær', category: 'Present men' },
  { id: 'bjarne-henriksen', name: 'Bjarne Henriksen', category: 'Present men' },
  { id: 'nikolaj-kopernikus', name: 'Nikolaj Kopernikus', category: 'Present men' },
  { id: 'soren-pilmark', name: 'Søren Pilmark', category: 'Present men' },
  { id: 'jens-albinus', name: 'Jens Albinus', category: 'Present men' },
  { id: 'jesper-asholt', name: 'Jesper Asholt', category: 'Present men' },
  { id: 'lars-brygmann', name: 'Lars Brygmann', category: 'Present men' },
  { id: 'peter-mygind', name: 'Peter Mygind', category: 'Present men' },
  { id: 'elliott-crosset-hove', name: 'Elliott Crosset Hove', category: 'Present men' },
  { id: 'cyron-melville', name: 'Cyron Melville', category: 'Present men' },
  { id: 'troels-lyby', name: 'Troels Lyby', category: 'Present men' },
  { id: 'rasmus-bjerg', name: 'Rasmus Bjerg', category: 'Present men' },

  // --------------------------------------------------------- Present women (26)
  { id: 'trine-dyrholm', name: 'Trine Dyrholm', category: 'Present women' },
  { id: 'paprika-steen', name: 'Paprika Steen', category: 'Present women' },
  { id: 'iben-hjejle', name: 'Iben Hjejle', category: 'Present women' },
  { id: 'sofie-graabol', name: 'Sofie Gråbøl', category: 'Present women' },
  { id: 'bodil-jorgensen', name: 'Bodil Jørgensen', category: 'Present women' },
  { id: 'ann-eleonora-jorgensen', name: 'Ann Eleonora Jørgensen', category: 'Present women' },
  { id: 'lene-maria-christensen', name: 'Lene Maria Christensen', category: 'Present women' },
  { id: 'ellen-hillingso', name: 'Ellen Hillingsø', category: 'Present women' },
  { id: 'birthe-neumann', name: 'Birthe Neumann', category: 'Present women' },
  { id: 'anne-marie-helger', name: 'Anne Marie Helger', category: 'Present women' },
  { id: 'charlotte-fich', name: 'Charlotte Fich', category: 'Present women' },
  { id: 'mille-dinesen', name: 'Mille Dinesen', category: 'Present women' },
  { id: 'laura-bro', name: 'Laura Bro', category: 'Present women' },
  { id: 'danica-curcic', name: 'Danica Curcic', category: 'Present women' },
  { id: 'marie-bach-hansen', name: 'Marie Bach Hansen', category: 'Present women' },
  { id: 'natalie-madueno', name: 'Natalie Madueño', category: 'Present women' },
  { id: 'sonja-richter', name: 'Sonja Richter', category: 'Present women' },
  { id: 'stine-stengade', name: 'Stine Stengade', category: 'Present women' },
  { id: 'andrea-vagn-jensen', name: 'Andrea Vagn Jensen', category: 'Present women' },
  { id: 'rosalinde-mynster', name: 'Rosalinde Mynster', category: 'Present women' },
  { id: 'josephine-park', name: 'Josephine Park', category: 'Present women' },
  { id: 'amanda-collin', name: 'Amanda Collin', category: 'Present women' },
  { id: 'sara-hjort-ditlevsen', name: 'Sara Hjort Ditlevsen', category: 'Present women' },
  { id: 'katrine-greis-rosenthal', name: 'Katrine Greis-Rosenthal', category: 'Present women' },
  { id: 'tammi-ost', name: 'Tammi Øst', category: 'Present women' },
  { id: 'lisbet-dahl', name: 'Lisbet Dahl', category: 'Present women' },

  // --------------------------------------------------- Comedians and revue (6)
  { id: 'casper-christensen', name: 'Casper Christensen', category: 'Comedians and revue' },
  { id: 'frank-hvam', name: 'Frank Hvam', category: 'Comedians and revue' },
  { id: 'anders-matthesen', name: 'Anders Matthesen', category: 'Comedians and revue' },
  { id: 'ulf-pilgaard', name: 'Ulf Pilgaard', category: 'Comedians and revue' },
  { id: 'hella-joof', name: 'Hella Joof', category: 'Comedians and revue' },
  { id: 'sos-egelind', name: 'Søs Egelind', category: 'Comedians and revue' },

  // -------------------------------------------------------------- Classics (28)
  { id: 'dirch-passer', name: 'Dirch Passer', category: 'Classics' },
  { id: 'kjeld-petersen', name: 'Kjeld Petersen', category: 'Classics' },
  { id: 'ove-sprogoe', name: 'Ove Sprogøe', category: 'Classics' },
  { id: 'morten-grunwald', name: 'Morten Grunwald', category: 'Classics' },
  { id: 'poul-bundgaard', name: 'Poul Bundgaard', category: 'Classics' },
  { id: 'axel-strobye', name: 'Axel Strøbye', category: 'Classics' },
  { id: 'jesper-langberg', name: 'Jesper Langberg', category: 'Classics' },
  { id: 'jorgen-buckhoj', name: 'Jørgen Buckhøj', category: 'Classics' },
  { id: 'holger-juul-hansen', name: 'Holger Juul Hansen', category: 'Classics' },
  { id: 'ghita-norby', name: 'Ghita Nørby', category: 'Classics' },
  { id: 'bodil-kjer', name: 'Bodil Kjer', category: 'Classics' },
  { id: 'lily-weiding', name: 'Lily Weiding', category: 'Classics' },
  { id: 'helle-virkner', name: 'Helle Virkner', category: 'Classics' },
  { id: 'lily-broberg', name: 'Lily Broberg', category: 'Classics' },
  { id: 'susse-wold', name: 'Susse Wold', category: 'Classics' },
  { id: 'malene-schwartz', name: 'Malene Schwartz', category: 'Classics' },
  { id: 'bodil-udsen', name: 'Bodil Udsen', category: 'Classics' },
  { id: 'kirsten-walther', name: 'Kirsten Walther', category: 'Classics' },
  { id: 'lone-hertz', name: 'Lone Hertz', category: 'Classics' },
  { id: 'poul-reichhardt', name: 'Poul Reichhardt', category: 'Classics' },
  { id: 'ib-schonberg', name: 'Ib Schønberg', category: 'Classics' },
  { id: 'buster-larsen', name: 'Buster Larsen', category: 'Classics' },
  { id: 'henning-moritzen', name: 'Henning Moritzen', category: 'Classics' },
  { id: 'jens-okking', name: 'Jens Okking', category: 'Classics' },
  { id: 'frits-helmuth', name: 'Frits Helmuth', category: 'Classics' },
  { id: 'erik-clausen', name: 'Erik Clausen', category: 'Classics' },
  { id: 'preben-kaas', name: 'Preben Kaas', category: 'Classics' },
  { id: 'jorgen-ryg', name: 'Jørgen Ryg', category: 'Classics' },
];

export const PERSON_BY_ID: Record<string, Person> = Object.fromEntries(PEOPLE.map((p) => [p.id, p]));

/** Danish letters typed either way: ø/o/oe, å/a/aa, æ/ae. */
function danishSpellings(text: string): string[] {
  const options: Record<string, string[]> = { ø: ['ø', 'oe'], å: ['å', 'aa'], æ: ['æ'] };
  let out = [''];
  for (const ch of text) {
    const alts = options[ch.toLowerCase()] ?? [ch];
    out = out.flatMap((prefix) => alts.map((a) => prefix + a));
  }
  return out;
}

const isInitial = (word: string) => /^[A-Za-z]\.?$/.test(word);

/** Every spelling accepted for a person (normalize() handles case, accents, spaces). */
export function personAnswers(p: Person): string[] {
  const forms = [p.name, ...(p.aliases ?? [])];
  const words = p.name.split(/\s+/).filter(Boolean);
  if (words.length >= 3) {
    const [first, ...rest] = words;
    for (const w of rest) if (!isInitial(w)) forms.push(`${first} ${w}`);
  }
  return [...new Set(forms.flatMap(danishSpellings))];
}
