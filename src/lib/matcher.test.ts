import { describe, expect, it } from 'vitest';
import { COUNTRIES, COUNTRY_BY_ID } from '../data/countries';
import { AnswerIndex, EMPTY_TYPING, judge, matchNew, matchTyping } from './matcher';
import { normalize } from './normalize';

const countryIndex = new AnswerIndex(COUNTRIES, 'country');
const capitalIndex = new AnswerIndex(COUNTRIES, 'capital');
const country = (input: string) => matchNew(input, countryIndex, new Set());
const capital = (input: string) => matchNew(input, capitalIndex, new Set());

describe('normalize', () => {
  it('lowercases, strips diacritics and punctuation', () => {
    expect(normalize("Côte d'Ivoire")).toBe('cotedivoire');
    expect(normalize('  SÃO   TOMÉ ')).toBe('saotome');
    expect(normalize('Guinea-Bissau')).toBe('guineabissau');
    expect(normalize('Türkiye')).toBe('turkiye');
    expect(normalize('København')).toBe('kobenhavn');
    expect(normalize('Nukuʻalofa')).toBe('nukualofa');
    expect(normalize('Chișinău')).toBe('chisinau');
  });
  it('ignores a leading "the" but not a lone "the"', () => {
    expect(normalize('The Gambia')).toBe('gambia');
    expect(normalize('the netherlands')).toBe('netherlands');
    expect(normalize('the')).toBe('the');
  });
  it('treats & as and, and st/st. as saint', () => {
    expect(normalize('Trinidad & Tobago')).toBe(normalize('Trinidad and Tobago'));
    expect(normalize('St Kitts')).toBe('saintkitts');
    expect(normalize('St. Kitts')).toBe('saintkitts');
    expect(normalize('st. vincent & the grenadines')).toBe(normalize('Saint Vincent and the Grenadines'));
    expect(normalize('Stockholm')).toBe('stockholm');
  });
  it('ignores spacing differences', () => {
    expect(normalize('guinea bissau')).toBe(normalize('Guinea-Bissau'));
    expect(normalize('Port  au Prince')).toBe(normalize('Port-au-Prince'));
    expect(normalize('')).toBe('');
    expect(normalize('  - . ')).toBe('');
  });
});

describe('country aliases', () => {
  const cases: [string, string][] = [
    ['Vatican', 'VAT'], ['Vatican City', 'VAT'], ['Holy See', 'VAT'], ['the holy see', 'VAT'],
    ['DRC', 'COD'], ['DR Congo', 'COD'], ['D.R. Congo', 'COD'], ['Congo-Kinshasa', 'COD'], ['Democratic Republic of the Congo', 'COD'],
    ['Congo', 'COG'], ['Republic of the Congo', 'COG'], ['Congo-Brazzaville', 'COG'], ['congo brazzaville', 'COG'],
    ['USA', 'USA'], ['US', 'USA'], ['U.S.', 'USA'], ['United States', 'USA'], ['America', 'USA'],
    ['UK', 'GBR'], ['Great Britain', 'GBR'], ['Britain', 'GBR'], ['United Kingdom', 'GBR'],
    ['UAE', 'ARE'], ['United Arab Emirates', 'ARE'],
    ['Ivory Coast', 'CIV'], ["Côte d'Ivoire", 'CIV'], ["Cote d'Ivoire", 'CIV'], ['cote divoire', 'CIV'],
    ['Czechia', 'CZE'], ['Czech Republic', 'CZE'],
    ['Eswatini', 'SWZ'], ['Swaziland', 'SWZ'], ['eSwatini', 'SWZ'],
    ['Myanmar', 'MMR'], ['Burma', 'MMR'],
    ['North Macedonia', 'MKD'], ['Macedonia', 'MKD'],
    ['East Timor', 'TLS'], ['Timor-Leste', 'TLS'], ['timor leste', 'TLS'],
    ['Cape Verde', 'CPV'], ['Cabo Verde', 'CPV'],
    ['Türkiye', 'TUR'], ['Turkiye', 'TUR'], ['Turkey', 'TUR'],
    ['Holland', 'NLD'], ['Netherlands', 'NLD'], ['The Netherlands', 'NLD'],
    ['South Korea', 'KOR'], ['North Korea', 'PRK'], ['DPRK', 'PRK'],
    ['CAR', 'CAF'], ['Central African Republic', 'CAF'],
    ['PNG', 'PNG'], ['Papua New Guinea', 'PNG'],
    ['Bosnia', 'BIH'], ['Bosnia and Herzegovina', 'BIH'], ['Bosnia & Herzegovina', 'BIH'],
    ['St Kitts', 'KNA'], ['Saint Kitts', 'KNA'], ['St. Kitts and Nevis', 'KNA'], ['St Kitts & Nevis', 'KNA'],
    ['Saint Lucia', 'LCA'], ['St Lucia', 'LCA'], ['St Vincent', 'VCT'],
    ['Micronesia', 'FSM'], ['Federated States of Micronesia', 'FSM'],
    ['São Tomé', 'STP'], ['Sao Tome', 'STP'], ['Sao Tome and Principe', 'STP'], ['São Tomé & Príncipe', 'STP'],
    ['Palestine', 'PSE'], ['Taiwan', 'TWN'], ['Kosovo', 'XKX'],
    ['The Gambia', 'GMB'], ['Gambia', 'GMB'], ['The Bahamas', 'BHS'],
    ['Guinea-Bissau', 'GNB'], ['Guinea Bissau', 'GNB'], ['Guinea', 'GIN'], ['Equatorial Guinea', 'GNQ'],
    ['Dominica', 'DMA'], ['Dominican Republic', 'DOM'],
    ['Niger', 'NER'], ['Nigeria', 'NGA'], ['Sudan', 'SDN'], ['South Sudan', 'SSD'],
    ['Trinidad and Tobago', 'TTO'], ['Antigua & Barbuda', 'ATG'],
    ['  united   states  ', 'USA'], ['UNITED KINGDOM', 'GBR'],
  ];
  it.each(cases)('"%s"', (input, id) => {
    expect(country(input)).toBe(id);
  });

  it('does not accept partial names or typos', () => {
    for (const s of ['Ukrain', 'Nigeri', 'Untied States', 'Frnace', 'Korea', 'the', 'a', 'Guine']) {
      expect(country(s)).toBeNull();
    }
  });
});

describe('capitals', () => {
  const cases: [string, string][] = [
    ['Sucre', 'BOL'], ['La Paz', 'BOL'],
    ['Pretoria', 'ZAF'], ['Cape Town', 'ZAF'], ['Bloemfontein', 'ZAF'],
    ['Mbabane', 'SWZ'], ['Lobamba', 'SWZ'],
    ['Sri Jayawardenepura Kotte', 'LKA'], ['Kotte', 'LKA'], ['Colombo', 'LKA'],
    ['Kyiv', 'UKR'], ['Kiev', 'UKR'],
    ['Washington', 'USA'], ['Washington DC', 'USA'], ['Washington, D.C.', 'USA'], ['washington d.c', 'USA'],
    ['Bern', 'CHE'], ['Berne', 'CHE'],
    ['Ulaanbaatar', 'MNG'], ['Ulan Bator', 'MNG'],
    ['Naypyidaw', 'MMR'], ['Nay Pyi Taw', 'MMR'],
    ["St. John's", 'ATG'], ["Saint George's", 'GRD'], ['St Georges', 'GRD'],
    ['The Hague', 'NLD'], ['Hague', 'NLD'], ['Amsterdam', 'NLD'],
    ["N'Djamena", 'TCD'], ['Ndjamena', 'TCD'],
    ['Nukualofa', 'TON'], ['Bogota', 'COL'], ['Asuncion', 'PRY'], ['Yaounde', 'CMR'],
    ['Port-au-Prince', 'HTI'], ['port au prince', 'HTI'], ['Port of Spain', 'TTO'],
    ['Kingston', 'JAM'], ['Kingstown', 'VCT'], ['Pristina', 'XKX'], ['Taipei', 'TWN'],
    ['Ramallah', 'PSE'], ['East Jerusalem', 'PSE'], ['Jerusalem', 'ISR'], ['Vatican City', 'VAT'],
  ];
  it.each(cases)('"%s"', (input, id) => {
    expect(capital(input)).toBe(id);
  });
});

describe('data integrity', () => {
  it('has 197 unique countries', () => {
    expect(COUNTRIES).toHaveLength(197);
    expect(new Set(COUNTRIES.map((c) => c.id)).size).toBe(197);
    expect(new Set(COUNTRIES.map((c) => c.mapId)).size).toBe(197);
    expect(new Set(COUNTRIES.map((c) => c.flag)).size).toBe(197);
  });
  it('has the expected continent sizes', () => {
    const count = (k: string) => COUNTRIES.filter((c) => c.continent === k).length;
    expect(count('Africa')).toBe(54);
    expect(count('Asia')).toBe(48);
    expect(count('Europe')).toBe(46);
    expect(count('North America')).toBe(23);
    expect(count('South America')).toBe(12);
    expect(count('Oceania')).toBe(14);
  });
  it('includes the four non-UN members', () => {
    for (const id of ['VAT', 'PSE', 'XKX', 'TWN']) expect(COUNTRY_BY_ID[id]).toBeDefined();
  });
  it('every country has at least one capital', () => {
    for (const c of COUNTRIES) expect(c.capitals.length).toBeGreaterThan(0);
  });
  it('no country answer belongs to two countries', () => {
    expect(countryIndex.collisions()).toEqual([]);
  });
  it('no capital answer belongs to two countries', () => {
    expect(capitalIndex.collisions()).toEqual([]);
  });
});

describe('countries quiz (instant accept)', () => {
  it('ignores countries that were already named', () => {
    const named = new Set(['NER']);
    expect(matchNew('Niger', countryIndex, named)).toBeNull();
    expect(matchNew('Nigeria', countryIndex, named)).toBe('NGA');
  });
  it('accepts a shorter country immediately (Sporcle behaviour)', () => {
    expect(matchNew('Niger', countryIndex, new Set())).toBe('NER');
    expect(matchNew('UK', countryIndex, new Set())).toBe('GBR');
  });
});

describe('streak quiz judging', () => {
  const j = (input: string, current: string, submit = false) => judge(input, current, countryIndex, { submit });

  it('accepts any alias of the current country', () => {
    expect(j('Holy See', 'VAT')).toBe('correct');
    expect(j('ivory coast', 'CIV')).toBe('correct');
    expect(j('St Kitts', 'KNA')).toBe('correct');
  });

  it('does nothing for partial text', () => {
    expect(j('Ger', 'DEU')).toBe('none');
    expect(j('', 'DEU')).toBe('none');
    expect(j('Swe', 'CHE')).toBe('none');
  });

  it('does not mark prefix pairs wrong while typing', () => {
    expect(j('Niger', 'NGA')).toBe('none');
    expect(j('Guinea', 'GNB')).toBe('none');
    expect(j('Dominica', 'DOM')).toBe('none');
    expect(j('UK', 'UKR')).toBe('none');
    expect(j('Congo', 'COD')).toBe('none'); // Congo-Kinshasa
    expect(j('US', 'USA')).toBe('correct');
  });

  it('marks another country wrong when it cannot be a prefix of the answer', () => {
    expect(j('Nigeria', 'NER')).toBe('wrong');
    expect(j('Guinea', 'GNQ')).toBe('wrong');
    expect(j('Sudan', 'SSD')).toBe('wrong');
    expect(j('Austria', 'AUS')).toBe('wrong');
    expect(j('Australia', 'AUT')).toBe('wrong');
    expect(j('France', 'DEU')).toBe('wrong');
  });

  it('Enter evaluates prefix pairs', () => {
    expect(j('Niger', 'NGA', true)).toBe('wrong');
    expect(j('Nigeria', 'NGA', true)).toBe('correct');
    expect(j('Nige', 'NGA', true)).toBe('none');
    expect(j('Congo', 'COD', true)).toBe('wrong');
  });

  it('judges capitals against capitals only', () => {
    const c = (input: string, current: string, submit = false) => judge(input, current, capitalIndex, { submit });
    expect(c('Paris', 'FRA')).toBe('correct');
    expect(c('La Paz', 'BOL')).toBe('correct');
    expect(c('Lyon', 'FRA')).toBe('none');
    expect(c('Berlin', 'FRA')).toBe('wrong');
    expect(c('France', 'FRA')).toBe('none');
    expect(c('Kingston', 'VCT')).toBe('wrong');
    expect(c('San', 'CRI')).toBe('none');
    expect(c('San Salvador', 'CRI')).toBe('wrong');
  });

  it('continent quizzes only treat that continent as wrong answers', () => {
    const europe = new AnswerIndex(COUNTRIES.filter((c) => c.continent === 'Europe'), 'capital');
    expect(judge('Tokyo', 'FRA', europe)).toBe('none');
    expect(judge('Berlin', 'FRA', europe)).toBe('wrong');
  });
});

describe('countries quiz: keep typing after an instant accept', () => {
  // Simulates typing `text` key by key into the box, like the real input.
  function play(text: string, named: string[] = []) {
    const set = new Set(named);
    let box = '';
    let state = EMPTY_TYPING;
    for (const ch of text) {
      const r = matchTyping(box + ch, state, countryIndex, set);
      state = r;
      if (r.id) set.add(r.id);
      box = r.clear ? '' : box + ch;
    }
    return { named: [...set], box };
  }

  it('Niger then Nigeria in one go', () => {
    expect(play('Nigeria').named).toEqual(['NER', 'NGA']);
  });
  it('UK then Ukraine', () => {
    expect(play('Ukraine').named).toEqual(['GBR', 'UKR']);
  });
  it('Guinea then Guinea-Bissau, Dominica then Dominican Republic', () => {
    expect(play('Guinea-Bissau').named).toEqual(['GIN', 'GNB']);
    expect(play('Dominican Republic').named).toEqual(['DMA', 'DOM']);
  });
  it('Congo then Congo-Kinshasa', () => {
    expect(play('Congo-Kinshasa').named).toEqual(['COG', 'COD']);
  });
  it('USA leaves nothing behind, so the next name works', () => {
    const r = play('USAKosovo');
    expect(r.named).toEqual(['USA', 'XKX']);
    expect(r.box).toBe('');
  });
  it('the swallowed letter still counts if it started the next name', () => {
    expect(play('USAfghanistan').named).toEqual(['USA', 'AFG']);
  });
  it('long forms of an answer are swallowed', () => {
    const r = play('United States of America');
    expect(r.named).toEqual(['USA']);
    expect(r.box).toBe('');
  });
  it('unrelated text after an answer is left alone', () => {
    const r = play('Francexyz');
    expect(r.named).toEqual(['FRA']);
    expect(r.box).toBe('xyz');
  });
  it('a typed name after a short one still works', () => {
    expect(play('NigerIran').named).toEqual(['NER', 'IRN']);
    expect(play('ChadChile').named).toEqual(['TCD', 'CHL']);
  });
  it('already named countries are not counted again, and the box clears', () => {
    expect(play('Niger', ['NER']).named).toEqual(['NER']);
    expect(play('Niger', ['NER']).box).toBe('');
    expect(play('United Kingdom', ['GBR']).box).toBe('');
  });
  it('an already named short name still lets you finish the long one', () => {
    expect(play('Nigeria', ['NER']).named).toEqual(['NER', 'NGA']);
    expect(play('Ukraine', ['GBR']).named).toEqual(['GBR', 'UKR']);
  });
  it('all 197 display names typed in a row are all accepted', () => {
    const r = play(COUNTRIES.map((c) => c.name).sort().join(''));
    expect(r.named).toHaveLength(197);
    expect(r.box).toBe('');
  });
});
