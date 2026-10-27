// Turns any typed answer into a comparison key.
//
//   "  The Côte d'Ivoire "  -> "cotedivoire"
//   "St. Kitts & Nevis"     -> "saintkittsandnevis"
//   "Guinea-Bissau"         -> "guineabissau"
//
// Rules: lowercase, strip diacritics, "&" -> "and", drop apostrophes,
// punctuation and hyphens, ignore a leading "the", "st"/"st." -> "saint",
// and finally drop all spaces (so "guinea bissau" == "guineabissau").

// Letters that Unicode decomposition does not split into base + accent.
const SPECIAL_LETTERS: Record<string, string> = {
  ø: 'o',
  æ: 'ae',
  œ: 'oe',
  ß: 'ss',
  ł: 'l',
  đ: 'd',
  ð: 'd',
  þ: 'th',
  ı: 'i',
};

export function normalize(input: string): string {
  let s = input.toLowerCase();
  s = s.replace(/[øæœßłđðþı]/g, (ch) => SPECIAL_LETTERS[ch] ?? ch);
  s = s.normalize('NFD').replace(/[̀-ͯ]/g, '');
  s = s.replace(/&/g, ' and ');
  s = s.replace(/['’‘`´ʻʼ]/g, '');
  s = s.replace(/[^a-z0-9]+/g, ' ');
  const words = s.split(' ').filter(Boolean);
  if (words.length > 1 && words[0] === 'the') words.shift();
  return words.map((w) => (w === 'st' ? 'saint' : w)).join('');
}
