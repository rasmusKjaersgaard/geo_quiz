// =============================================================================
// Country data for every quiz. Edit freely.
//
// 197 countries: the 193 UN members + Vatican City, Palestine, Kosovo, Taiwan.
//
// Fields
//   id             ISO 3166-1 alpha-3 (Kosovo uses the common user-assigned "XKX")
//   name           display name
//   aliases        other accepted answers for the country (display name is always accepted)
//   continent      one of the six quiz continents
//   capitals       accepted capital cities; the first one is shown as "the" answer.
//                  Countries with several capitals (or a separate seat of government)
//                  list them all.
//   capitalAliases other spellings of the capitals (Kiev, Berne, Ulan Bator, ...)
//   flag           file name in public/flags (flag-icons code)
//   mapId          feature id in public/map/countries-50m.json (ISO 3166-1 numeric).
//                  Kosovo has no ISO numeric code, so the map build gives it "XK".
//
// Matching ignores case, accents, punctuation, hyphens, apostrophes and spaces,
// a leading "the", "&" vs "and" and "St"/"St." vs "Saint" - so you don't need to
// add variants that only differ in those ways (see src/lib/normalize.ts).
//
// Continent choices (one per country, edit `continent` to change):
//   North America includes Central America and the Caribbean.
//   Russia -> Europe; Cyprus -> Europe; Kosovo -> Europe
//   Turkey, Kazakhstan, Georgia, Armenia, Azerbaijan -> Asia
//   Egypt -> Africa; Timor-Leste, Indonesia -> Asia; Papua New Guinea -> Oceania
//   Palestine, Taiwan -> Asia
// =============================================================================

export type Continent = 'Africa' | 'Asia' | 'Europe' | 'North America' | 'South America' | 'Oceania';

export const CONTINENTS: Continent[] = ['Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania'];

export interface Country {
  id: string;
  name: string;
  aliases: string[];
  continent: Continent;
  capitals: string[];
  capitalAliases: string[];
  flag: string;
  mapId: string;
}

export const COUNTRIES: Country[] = [
  // ---------------------------------------------------------------- Africa (54)
  { id: 'DZA', name: 'Algeria', aliases: [], continent: 'Africa', capitals: ['Algiers'], capitalAliases: ['Alger'], flag: 'dz', mapId: '012' },
  { id: 'AGO', name: 'Angola', aliases: [], continent: 'Africa', capitals: ['Luanda'], capitalAliases: [], flag: 'ao', mapId: '024' },
  { id: 'BEN', name: 'Benin', aliases: [], continent: 'Africa', capitals: ['Porto-Novo', 'Cotonou'], capitalAliases: [], flag: 'bj', mapId: '204' },
  { id: 'BWA', name: 'Botswana', aliases: [], continent: 'Africa', capitals: ['Gaborone'], capitalAliases: [], flag: 'bw', mapId: '072' },
  { id: 'BFA', name: 'Burkina Faso', aliases: ['Burkina', 'Upper Volta'], continent: 'Africa', capitals: ['Ouagadougou'], capitalAliases: ['Ouaga'], flag: 'bf', mapId: '854' },
  { id: 'BDI', name: 'Burundi', aliases: [], continent: 'Africa', capitals: ['Gitega', 'Bujumbura'], capitalAliases: [], flag: 'bi', mapId: '108' },
  { id: 'CPV', name: 'Cabo Verde', aliases: ['Cape Verde', 'Cape Verde Islands'], continent: 'Africa', capitals: ['Praia'], capitalAliases: [], flag: 'cv', mapId: '132' },
  { id: 'CMR', name: 'Cameroon', aliases: ['Cameroun'], continent: 'Africa', capitals: ['Yaoundé'], capitalAliases: [], flag: 'cm', mapId: '120' },
  { id: 'CAF', name: 'Central African Republic', aliases: ['CAR', 'Central African Rep', 'Centrafrique'], continent: 'Africa', capitals: ['Bangui'], capitalAliases: [], flag: 'cf', mapId: '140' },
  { id: 'TCD', name: 'Chad', aliases: ['Tchad'], continent: 'Africa', capitals: ["N'Djamena"], capitalAliases: ['Njamena', 'Ndjamena'], flag: 'td', mapId: '148' },
  { id: 'COM', name: 'Comoros', aliases: ['Comoro Islands', 'Comores'], continent: 'Africa', capitals: ['Moroni'], capitalAliases: [], flag: 'km', mapId: '174' },
  { id: 'COG', name: 'Republic of the Congo', aliases: ['Congo', 'Congo-Brazzaville', 'Republic of Congo', 'Congo Republic', 'Congo Brazza'], continent: 'Africa', capitals: ['Brazzaville'], capitalAliases: [], flag: 'cg', mapId: '178' },
  { id: 'COD', name: 'Democratic Republic of the Congo', aliases: ['DRC', 'DR Congo', 'Congo-Kinshasa', 'Democratic Republic of Congo', 'Congo DR', 'DROC', 'Zaire', 'Dem Rep Congo', 'Dem Rep of the Congo'], continent: 'Africa', capitals: ['Kinshasa'], capitalAliases: [], flag: 'cd', mapId: '180' },
  { id: 'CIV', name: "Côte d'Ivoire", aliases: ['Ivory Coast', 'Cote dIvoire'], continent: 'Africa', capitals: ['Yamoussoukro', 'Abidjan'], capitalAliases: [], flag: 'ci', mapId: '384' },
  { id: 'DJI', name: 'Djibouti', aliases: [], continent: 'Africa', capitals: ['Djibouti'], capitalAliases: ['Djibouti City'], flag: 'dj', mapId: '262' },
  { id: 'EGY', name: 'Egypt', aliases: [], continent: 'Africa', capitals: ['Cairo'], capitalAliases: [], flag: 'eg', mapId: '818' },
  { id: 'GNQ', name: 'Equatorial Guinea', aliases: ['Eq Guinea', 'Equ Guinea'], continent: 'Africa', capitals: ['Malabo', 'Ciudad de la Paz'], capitalAliases: [], flag: 'gq', mapId: '226' },
  { id: 'ERI', name: 'Eritrea', aliases: [], continent: 'Africa', capitals: ['Asmara'], capitalAliases: ['Asmera'], flag: 'er', mapId: '232' },
  { id: 'SWZ', name: 'Eswatini', aliases: ['Swaziland', 'Kingdom of Eswatini'], continent: 'Africa', capitals: ['Mbabane', 'Lobamba'], capitalAliases: [], flag: 'sz', mapId: '748' },
  { id: 'ETH', name: 'Ethiopia', aliases: ['Abyssinia'], continent: 'Africa', capitals: ['Addis Ababa'], capitalAliases: ['Addis Abeba', 'Addis'], flag: 'et', mapId: '231' },
  { id: 'GAB', name: 'Gabon', aliases: [], continent: 'Africa', capitals: ['Libreville'], capitalAliases: [], flag: 'ga', mapId: '266' },
  { id: 'GMB', name: 'Gambia', aliases: ['The Gambia'], continent: 'Africa', capitals: ['Banjul'], capitalAliases: [], flag: 'gm', mapId: '270' },
  { id: 'GHA', name: 'Ghana', aliases: [], continent: 'Africa', capitals: ['Accra'], capitalAliases: [], flag: 'gh', mapId: '288' },
  { id: 'GIN', name: 'Guinea', aliases: ['Guinea-Conakry', 'Guinée'], continent: 'Africa', capitals: ['Conakry'], capitalAliases: [], flag: 'gn', mapId: '324' },
  { id: 'GNB', name: 'Guinea-Bissau', aliases: [], continent: 'Africa', capitals: ['Bissau'], capitalAliases: [], flag: 'gw', mapId: '624' },
  { id: 'KEN', name: 'Kenya', aliases: [], continent: 'Africa', capitals: ['Nairobi'], capitalAliases: [], flag: 'ke', mapId: '404' },
  { id: 'LSO', name: 'Lesotho', aliases: [], continent: 'Africa', capitals: ['Maseru'], capitalAliases: [], flag: 'ls', mapId: '426' },
  { id: 'LBR', name: 'Liberia', aliases: [], continent: 'Africa', capitals: ['Monrovia'], capitalAliases: [], flag: 'lr', mapId: '430' },
  { id: 'LBY', name: 'Libya', aliases: [], continent: 'Africa', capitals: ['Tripoli'], capitalAliases: [], flag: 'ly', mapId: '434' },
  { id: 'MDG', name: 'Madagascar', aliases: [], continent: 'Africa', capitals: ['Antananarivo'], capitalAliases: ['Tananarive', 'Tana'], flag: 'mg', mapId: '450' },
  { id: 'MWI', name: 'Malawi', aliases: [], continent: 'Africa', capitals: ['Lilongwe'], capitalAliases: [], flag: 'mw', mapId: '454' },
  { id: 'MLI', name: 'Mali', aliases: [], continent: 'Africa', capitals: ['Bamako'], capitalAliases: [], flag: 'ml', mapId: '466' },
  { id: 'MRT', name: 'Mauritania', aliases: [], continent: 'Africa', capitals: ['Nouakchott'], capitalAliases: [], flag: 'mr', mapId: '478' },
  { id: 'MUS', name: 'Mauritius', aliases: [], continent: 'Africa', capitals: ['Port Louis'], capitalAliases: [], flag: 'mu', mapId: '480' },
  { id: 'MAR', name: 'Morocco', aliases: ['Maroc'], continent: 'Africa', capitals: ['Rabat'], capitalAliases: [], flag: 'ma', mapId: '504' },
  { id: 'MOZ', name: 'Mozambique', aliases: [], continent: 'Africa', capitals: ['Maputo'], capitalAliases: [], flag: 'mz', mapId: '508' },
  { id: 'NAM', name: 'Namibia', aliases: [], continent: 'Africa', capitals: ['Windhoek'], capitalAliases: [], flag: 'na', mapId: '516' },
  { id: 'NER', name: 'Niger', aliases: [], continent: 'Africa', capitals: ['Niamey'], capitalAliases: [], flag: 'ne', mapId: '562' },
  { id: 'NGA', name: 'Nigeria', aliases: [], continent: 'Africa', capitals: ['Abuja'], capitalAliases: [], flag: 'ng', mapId: '566' },
  { id: 'RWA', name: 'Rwanda', aliases: [], continent: 'Africa', capitals: ['Kigali'], capitalAliases: [], flag: 'rw', mapId: '646' },
  { id: 'STP', name: 'São Tomé and Príncipe', aliases: ['São Tomé', 'Sao Tome & Principe'], continent: 'Africa', capitals: ['São Tomé'], capitalAliases: ['Sao Tome City'], flag: 'st', mapId: '678' },
  { id: 'SEN', name: 'Senegal', aliases: [], continent: 'Africa', capitals: ['Dakar'], capitalAliases: [], flag: 'sn', mapId: '686' },
  { id: 'SYC', name: 'Seychelles', aliases: [], continent: 'Africa', capitals: ['Victoria'], capitalAliases: [], flag: 'sc', mapId: '690' },
  { id: 'SLE', name: 'Sierra Leone', aliases: [], continent: 'Africa', capitals: ['Freetown'], capitalAliases: [], flag: 'sl', mapId: '694' },
  { id: 'SOM', name: 'Somalia', aliases: [], continent: 'Africa', capitals: ['Mogadishu'], capitalAliases: ['Muqdisho', 'Mogadiscio'], flag: 'so', mapId: '706' },
  { id: 'ZAF', name: 'South Africa', aliases: ['RSA', 'Republic of South Africa'], continent: 'Africa', capitals: ['Pretoria', 'Cape Town', 'Bloemfontein'], capitalAliases: ['Tshwane'], flag: 'za', mapId: '710' },
  { id: 'SSD', name: 'South Sudan', aliases: ['S Sudan', 'Republic of South Sudan'], continent: 'Africa', capitals: ['Juba'], capitalAliases: [], flag: 'ss', mapId: '728' },
  { id: 'SDN', name: 'Sudan', aliases: [], continent: 'Africa', capitals: ['Khartoum'], capitalAliases: [], flag: 'sd', mapId: '729' },
  { id: 'TZA', name: 'Tanzania', aliases: ['United Republic of Tanzania'], continent: 'Africa', capitals: ['Dodoma', 'Dar es Salaam'], capitalAliases: [], flag: 'tz', mapId: '834' },
  { id: 'TGO', name: 'Togo', aliases: [], continent: 'Africa', capitals: ['Lomé'], capitalAliases: [], flag: 'tg', mapId: '768' },
  { id: 'TUN', name: 'Tunisia', aliases: [], continent: 'Africa', capitals: ['Tunis'], capitalAliases: [], flag: 'tn', mapId: '788' },
  { id: 'UGA', name: 'Uganda', aliases: [], continent: 'Africa', capitals: ['Kampala'], capitalAliases: [], flag: 'ug', mapId: '800' },
  { id: 'ZMB', name: 'Zambia', aliases: [], continent: 'Africa', capitals: ['Lusaka'], capitalAliases: [], flag: 'zm', mapId: '894' },
  { id: 'ZWE', name: 'Zimbabwe', aliases: [], continent: 'Africa', capitals: ['Harare'], capitalAliases: [], flag: 'zw', mapId: '716' },

  // ------------------------------------------------------------------ Asia (48)
  { id: 'AFG', name: 'Afghanistan', aliases: [], continent: 'Asia', capitals: ['Kabul'], capitalAliases: [], flag: 'af', mapId: '004' },
  { id: 'ARM', name: 'Armenia', aliases: [], continent: 'Asia', capitals: ['Yerevan'], capitalAliases: ['Erevan'], flag: 'am', mapId: '051' },
  { id: 'AZE', name: 'Azerbaijan', aliases: [], continent: 'Asia', capitals: ['Baku'], capitalAliases: [], flag: 'az', mapId: '031' },
  { id: 'BHR', name: 'Bahrain', aliases: [], continent: 'Asia', capitals: ['Manama'], capitalAliases: [], flag: 'bh', mapId: '048' },
  { id: 'BGD', name: 'Bangladesh', aliases: [], continent: 'Asia', capitals: ['Dhaka'], capitalAliases: ['Dacca'], flag: 'bd', mapId: '050' },
  { id: 'BTN', name: 'Bhutan', aliases: [], continent: 'Asia', capitals: ['Thimphu'], capitalAliases: ['Thimpu'], flag: 'bt', mapId: '064' },
  { id: 'BRN', name: 'Brunei', aliases: ['Brunei Darussalam'], continent: 'Asia', capitals: ['Bandar Seri Begawan'], capitalAliases: [], flag: 'bn', mapId: '096' },
  { id: 'KHM', name: 'Cambodia', aliases: ['Kampuchea'], continent: 'Asia', capitals: ['Phnom Penh'], capitalAliases: [], flag: 'kh', mapId: '116' },
  { id: 'CHN', name: 'China', aliases: ["People's Republic of China", 'PRC', 'Mainland China'], continent: 'Asia', capitals: ['Beijing'], capitalAliases: ['Peking'], flag: 'cn', mapId: '156' },
  { id: 'GEO', name: 'Georgia', aliases: ['Sakartvelo'], continent: 'Asia', capitals: ['Tbilisi'], capitalAliases: ['Tiflis'], flag: 'ge', mapId: '268' },
  { id: 'IND', name: 'India', aliases: ['Bharat'], continent: 'Asia', capitals: ['New Delhi'], capitalAliases: ['Delhi'], flag: 'in', mapId: '356' },
  { id: 'IDN', name: 'Indonesia', aliases: [], continent: 'Asia', capitals: ['Jakarta', 'Nusantara'], capitalAliases: [], flag: 'id', mapId: '360' },
  { id: 'IRN', name: 'Iran', aliases: ['Persia', 'Islamic Republic of Iran'], continent: 'Asia', capitals: ['Tehran'], capitalAliases: ['Teheran'], flag: 'ir', mapId: '364' },
  { id: 'IRQ', name: 'Iraq', aliases: [], continent: 'Asia', capitals: ['Baghdad'], capitalAliases: [], flag: 'iq', mapId: '368' },
  { id: 'ISR', name: 'Israel', aliases: [], continent: 'Asia', capitals: ['Jerusalem'], capitalAliases: [], flag: 'il', mapId: '376' },
  { id: 'JPN', name: 'Japan', aliases: ['Nippon', 'Nihon'], continent: 'Asia', capitals: ['Tokyo'], capitalAliases: [], flag: 'jp', mapId: '392' },
  { id: 'JOR', name: 'Jordan', aliases: [], continent: 'Asia', capitals: ['Amman'], capitalAliases: [], flag: 'jo', mapId: '400' },
  { id: 'KAZ', name: 'Kazakhstan', aliases: ['Kazakstan'], continent: 'Asia', capitals: ['Astana'], capitalAliases: ['Nur-Sultan'], flag: 'kz', mapId: '398' },
  { id: 'KWT', name: 'Kuwait', aliases: [], continent: 'Asia', capitals: ['Kuwait City'], capitalAliases: ['Kuwait'], flag: 'kw', mapId: '414' },
  { id: 'KGZ', name: 'Kyrgyzstan', aliases: ['Kyrgyz Republic', 'Kirghizia', 'Kirgizstan'], continent: 'Asia', capitals: ['Bishkek'], capitalAliases: [], flag: 'kg', mapId: '417' },
  { id: 'LAO', name: 'Laos', aliases: ['Lao', 'Lao PDR'], continent: 'Asia', capitals: ['Vientiane'], capitalAliases: [], flag: 'la', mapId: '418' },
  { id: 'LBN', name: 'Lebanon', aliases: [], continent: 'Asia', capitals: ['Beirut'], capitalAliases: ['Beyrouth'], flag: 'lb', mapId: '422' },
  { id: 'MYS', name: 'Malaysia', aliases: [], continent: 'Asia', capitals: ['Kuala Lumpur', 'Putrajaya'], capitalAliases: ['KL'], flag: 'my', mapId: '458' },
  { id: 'MDV', name: 'Maldives', aliases: ['Maldive Islands'], continent: 'Asia', capitals: ['Malé'], capitalAliases: [], flag: 'mv', mapId: '462' },
  { id: 'MNG', name: 'Mongolia', aliases: [], continent: 'Asia', capitals: ['Ulaanbaatar'], capitalAliases: ['Ulan Bator', 'Ulan Baatar', 'Ulaan Baatar'], flag: 'mn', mapId: '496' },
  { id: 'MMR', name: 'Myanmar', aliases: ['Burma'], continent: 'Asia', capitals: ['Naypyidaw'], capitalAliases: ['Nay Pyi Taw', 'Naypyitaw', 'Nay Pyi Daw'], flag: 'mm', mapId: '104' },
  { id: 'NPL', name: 'Nepal', aliases: [], continent: 'Asia', capitals: ['Kathmandu'], capitalAliases: ['Katmandu'], flag: 'np', mapId: '524' },
  { id: 'PRK', name: 'North Korea', aliases: ['DPRK', "Democratic People's Republic of Korea", 'N Korea', 'Korea DPR'], continent: 'Asia', capitals: ['Pyongyang'], capitalAliases: [], flag: 'kp', mapId: '408' },
  { id: 'OMN', name: 'Oman', aliases: [], continent: 'Asia', capitals: ['Muscat'], capitalAliases: [], flag: 'om', mapId: '512' },
  { id: 'PAK', name: 'Pakistan', aliases: [], continent: 'Asia', capitals: ['Islamabad'], capitalAliases: [], flag: 'pk', mapId: '586' },
  { id: 'PSE', name: 'Palestine', aliases: ['State of Palestine', 'Palestinian Territories', 'Palestinian Territory'], continent: 'Asia', capitals: ['Ramallah', 'East Jerusalem'], capitalAliases: [], flag: 'ps', mapId: '275' },
  { id: 'PHL', name: 'Philippines', aliases: ['The Philippines', 'Phillipines'], continent: 'Asia', capitals: ['Manila'], capitalAliases: [], flag: 'ph', mapId: '608' },
  { id: 'QAT', name: 'Qatar', aliases: [], continent: 'Asia', capitals: ['Doha'], capitalAliases: [], flag: 'qa', mapId: '634' },
  { id: 'SAU', name: 'Saudi Arabia', aliases: ['Saudi', 'KSA'], continent: 'Asia', capitals: ['Riyadh'], capitalAliases: [], flag: 'sa', mapId: '682' },
  { id: 'SGP', name: 'Singapore', aliases: [], continent: 'Asia', capitals: ['Singapore'], capitalAliases: ['Singapore City'], flag: 'sg', mapId: '702' },
  { id: 'KOR', name: 'South Korea', aliases: ['Republic of Korea', 'S Korea', 'ROK', 'Korea Republic'], continent: 'Asia', capitals: ['Seoul'], capitalAliases: [], flag: 'kr', mapId: '410' },
  { id: 'LKA', name: 'Sri Lanka', aliases: ['Ceylon'], continent: 'Asia', capitals: ['Sri Jayawardenepura Kotte', 'Colombo'], capitalAliases: ['Kotte', 'Sri Jayewardenepura Kotte', 'Jayawardenepura Kotte'], flag: 'lk', mapId: '144' },
  { id: 'SYR', name: 'Syria', aliases: ['Syrian Arab Republic'], continent: 'Asia', capitals: ['Damascus'], capitalAliases: [], flag: 'sy', mapId: '760' },
  { id: 'TWN', name: 'Taiwan', aliases: ['Republic of China', 'ROC', 'Chinese Taipei', 'Formosa'], continent: 'Asia', capitals: ['Taipei'], capitalAliases: [], flag: 'tw', mapId: '158' },
  { id: 'TJK', name: 'Tajikistan', aliases: [], continent: 'Asia', capitals: ['Dushanbe'], capitalAliases: [], flag: 'tj', mapId: '762' },
  { id: 'THA', name: 'Thailand', aliases: ['Siam'], continent: 'Asia', capitals: ['Bangkok'], capitalAliases: ['Krung Thep'], flag: 'th', mapId: '764' },
  { id: 'TLS', name: 'Timor-Leste', aliases: ['East Timor', 'Timor'], continent: 'Asia', capitals: ['Dili'], capitalAliases: [], flag: 'tl', mapId: '626' },
  { id: 'TUR', name: 'Türkiye', aliases: ['Turkey'], continent: 'Asia', capitals: ['Ankara'], capitalAliases: [], flag: 'tr', mapId: '792' },
  { id: 'TKM', name: 'Turkmenistan', aliases: [], continent: 'Asia', capitals: ['Ashgabat'], capitalAliases: ['Ashkhabad', 'Asgabat'], flag: 'tm', mapId: '795' },
  { id: 'ARE', name: 'United Arab Emirates', aliases: ['UAE', 'Emirates'], continent: 'Asia', capitals: ['Abu Dhabi'], capitalAliases: [], flag: 'ae', mapId: '784' },
  { id: 'UZB', name: 'Uzbekistan', aliases: [], continent: 'Asia', capitals: ['Tashkent'], capitalAliases: ['Toshkent'], flag: 'uz', mapId: '860' },
  { id: 'VNM', name: 'Vietnam', aliases: ['Viet Nam'], continent: 'Asia', capitals: ['Hanoi'], capitalAliases: [], flag: 'vn', mapId: '704' },
  { id: 'YEM', name: 'Yemen', aliases: [], continent: 'Asia', capitals: ["Sana'a"], capitalAliases: ['Sana'], flag: 'ye', mapId: '887' },

  // ---------------------------------------------------------------- Europe (46)
  { id: 'ALB', name: 'Albania', aliases: [], continent: 'Europe', capitals: ['Tirana'], capitalAliases: ['Tiranë'], flag: 'al', mapId: '008' },
  { id: 'AND', name: 'Andorra', aliases: [], continent: 'Europe', capitals: ['Andorra la Vella'], capitalAliases: ['Andorra'], flag: 'ad', mapId: '020' },
  { id: 'AUT', name: 'Austria', aliases: ['Österreich'], continent: 'Europe', capitals: ['Vienna'], capitalAliases: ['Wien'], flag: 'at', mapId: '040' },
  { id: 'BLR', name: 'Belarus', aliases: ['Byelorussia', 'Belorussia', 'White Russia'], continent: 'Europe', capitals: ['Minsk'], capitalAliases: [], flag: 'by', mapId: '112' },
  { id: 'BEL', name: 'Belgium', aliases: [], continent: 'Europe', capitals: ['Brussels'], capitalAliases: ['Bruxelles', 'Brussel'], flag: 'be', mapId: '056' },
  { id: 'BIH', name: 'Bosnia and Herzegovina', aliases: ['Bosnia', 'Bosnia-Herzegovina', 'BiH', 'Bosnia Hercegovina'], continent: 'Europe', capitals: ['Sarajevo'], capitalAliases: [], flag: 'ba', mapId: '070' },
  { id: 'BGR', name: 'Bulgaria', aliases: [], continent: 'Europe', capitals: ['Sofia'], capitalAliases: [], flag: 'bg', mapId: '100' },
  { id: 'HRV', name: 'Croatia', aliases: ['Hrvatska'], continent: 'Europe', capitals: ['Zagreb'], capitalAliases: [], flag: 'hr', mapId: '191' },
  { id: 'CYP', name: 'Cyprus', aliases: [], continent: 'Europe', capitals: ['Nicosia'], capitalAliases: ['Lefkosia'], flag: 'cy', mapId: '196' },
  { id: 'CZE', name: 'Czechia', aliases: ['Czech Republic', 'Czech Rep'], continent: 'Europe', capitals: ['Prague'], capitalAliases: ['Praha'], flag: 'cz', mapId: '203' },
  { id: 'DNK', name: 'Denmark', aliases: ['Danmark'], continent: 'Europe', capitals: ['Copenhagen'], capitalAliases: ['København'], flag: 'dk', mapId: '208' },
  { id: 'EST', name: 'Estonia', aliases: ['Eesti'], continent: 'Europe', capitals: ['Tallinn'], capitalAliases: [], flag: 'ee', mapId: '233' },
  { id: 'FIN', name: 'Finland', aliases: ['Suomi'], continent: 'Europe', capitals: ['Helsinki'], capitalAliases: [], flag: 'fi', mapId: '246' },
  { id: 'FRA', name: 'France', aliases: [], continent: 'Europe', capitals: ['Paris'], capitalAliases: [], flag: 'fr', mapId: '250' },
  { id: 'DEU', name: 'Germany', aliases: ['Deutschland'], continent: 'Europe', capitals: ['Berlin'], capitalAliases: [], flag: 'de', mapId: '276' },
  { id: 'GRC', name: 'Greece', aliases: ['Hellas'], continent: 'Europe', capitals: ['Athens'], capitalAliases: ['Athina'], flag: 'gr', mapId: '300' },
  { id: 'HUN', name: 'Hungary', aliases: ['Magyarorszag'], continent: 'Europe', capitals: ['Budapest'], capitalAliases: [], flag: 'hu', mapId: '348' },
  { id: 'ISL', name: 'Iceland', aliases: [], continent: 'Europe', capitals: ['Reykjavík'], capitalAliases: [], flag: 'is', mapId: '352' },
  { id: 'IRL', name: 'Ireland', aliases: ['Republic of Ireland', 'Éire'], continent: 'Europe', capitals: ['Dublin'], capitalAliases: [], flag: 'ie', mapId: '372' },
  { id: 'ITA', name: 'Italy', aliases: ['Italia'], continent: 'Europe', capitals: ['Rome'], capitalAliases: ['Roma'], flag: 'it', mapId: '380' },
  { id: 'XKX', name: 'Kosovo', aliases: ['Kosova'], continent: 'Europe', capitals: ['Pristina'], capitalAliases: ['Prishtina', 'Prishtinë', 'Priština'], flag: 'xk', mapId: 'XK' },
  { id: 'LVA', name: 'Latvia', aliases: [], continent: 'Europe', capitals: ['Riga'], capitalAliases: [], flag: 'lv', mapId: '428' },
  { id: 'LIE', name: 'Liechtenstein', aliases: [], continent: 'Europe', capitals: ['Vaduz'], capitalAliases: [], flag: 'li', mapId: '438' },
  { id: 'LTU', name: 'Lithuania', aliases: [], continent: 'Europe', capitals: ['Vilnius'], capitalAliases: [], flag: 'lt', mapId: '440' },
  { id: 'LUX', name: 'Luxembourg', aliases: ['Luxemburg'], continent: 'Europe', capitals: ['Luxembourg'], capitalAliases: ['Luxembourg City', 'Luxemburg'], flag: 'lu', mapId: '442' },
  { id: 'MLT', name: 'Malta', aliases: [], continent: 'Europe', capitals: ['Valletta'], capitalAliases: [], flag: 'mt', mapId: '470' },
  { id: 'MDA', name: 'Moldova', aliases: ['Republic of Moldova', 'Moldavia'], continent: 'Europe', capitals: ['Chișinău'], capitalAliases: ['Kishinev'], flag: 'md', mapId: '498' },
  { id: 'MCO', name: 'Monaco', aliases: [], continent: 'Europe', capitals: ['Monaco'], capitalAliases: ['Monaco-Ville'], flag: 'mc', mapId: '492' },
  { id: 'MNE', name: 'Montenegro', aliases: ['Crna Gora'], continent: 'Europe', capitals: ['Podgorica', 'Cetinje'], capitalAliases: [], flag: 'me', mapId: '499' },
  { id: 'NLD', name: 'Netherlands', aliases: ['Holland', 'Nederland'], continent: 'Europe', capitals: ['Amsterdam', 'The Hague'], capitalAliases: ['Den Haag'], flag: 'nl', mapId: '528' },
  { id: 'MKD', name: 'North Macedonia', aliases: ['Macedonia', 'N Macedonia', 'FYROM'], continent: 'Europe', capitals: ['Skopje'], capitalAliases: [], flag: 'mk', mapId: '807' },
  { id: 'NOR', name: 'Norway', aliases: ['Norge'], continent: 'Europe', capitals: ['Oslo'], capitalAliases: [], flag: 'no', mapId: '578' },
  { id: 'POL', name: 'Poland', aliases: ['Polska'], continent: 'Europe', capitals: ['Warsaw'], capitalAliases: ['Warszawa'], flag: 'pl', mapId: '616' },
  { id: 'PRT', name: 'Portugal', aliases: [], continent: 'Europe', capitals: ['Lisbon'], capitalAliases: ['Lisboa'], flag: 'pt', mapId: '620' },
  { id: 'ROU', name: 'Romania', aliases: ['Rumania', 'Roumania'], continent: 'Europe', capitals: ['Bucharest'], capitalAliases: ['București'], flag: 'ro', mapId: '642' },
  { id: 'RUS', name: 'Russia', aliases: ['Russian Federation'], continent: 'Europe', capitals: ['Moscow'], capitalAliases: ['Moskva'], flag: 'ru', mapId: '643' },
  { id: 'SMR', name: 'San Marino', aliases: [], continent: 'Europe', capitals: ['San Marino'], capitalAliases: ['City of San Marino'], flag: 'sm', mapId: '674' },
  { id: 'SRB', name: 'Serbia', aliases: ['Srbija'], continent: 'Europe', capitals: ['Belgrade'], capitalAliases: ['Beograd'], flag: 'rs', mapId: '688' },
  { id: 'SVK', name: 'Slovakia', aliases: ['Slovak Republic'], continent: 'Europe', capitals: ['Bratislava'], capitalAliases: [], flag: 'sk', mapId: '703' },
  { id: 'SVN', name: 'Slovenia', aliases: [], continent: 'Europe', capitals: ['Ljubljana'], capitalAliases: [], flag: 'si', mapId: '705' },
  { id: 'ESP', name: 'Spain', aliases: ['España'], continent: 'Europe', capitals: ['Madrid'], capitalAliases: [], flag: 'es', mapId: '724' },
  { id: 'SWE', name: 'Sweden', aliases: ['Sverige'], continent: 'Europe', capitals: ['Stockholm'], capitalAliases: [], flag: 'se', mapId: '752' },
  { id: 'CHE', name: 'Switzerland', aliases: ['Swiss Confederation', 'Schweiz', 'Suisse'], continent: 'Europe', capitals: ['Bern'], capitalAliases: ['Berne'], flag: 'ch', mapId: '756' },
  { id: 'UKR', name: 'Ukraine', aliases: [], continent: 'Europe', capitals: ['Kyiv'], capitalAliases: ['Kiev', 'Kyyiv'], flag: 'ua', mapId: '804' },
  { id: 'GBR', name: 'United Kingdom', aliases: ['UK', 'Great Britain', 'Britain', 'GB', 'England', 'United Kingdom of Great Britain and Northern Ireland'], continent: 'Europe', capitals: ['London'], capitalAliases: [], flag: 'gb', mapId: '826' },
  { id: 'VAT', name: 'Vatican City', aliases: ['Vatican', 'Holy See', 'Vatican City State'], continent: 'Europe', capitals: ['Vatican City'], capitalAliases: ['Vatican'], flag: 'va', mapId: '336' },

  // --------------------------------------------------------- North America (23)
  { id: 'ATG', name: 'Antigua and Barbuda', aliases: ['Antigua'], continent: 'North America', capitals: ["Saint John's"], capitalAliases: [], flag: 'ag', mapId: '028' },
  { id: 'BHS', name: 'Bahamas', aliases: ['The Bahamas'], continent: 'North America', capitals: ['Nassau'], capitalAliases: [], flag: 'bs', mapId: '044' },
  { id: 'BRB', name: 'Barbados', aliases: [], continent: 'North America', capitals: ['Bridgetown'], capitalAliases: [], flag: 'bb', mapId: '052' },
  { id: 'BLZ', name: 'Belize', aliases: [], continent: 'North America', capitals: ['Belmopan'], capitalAliases: [], flag: 'bz', mapId: '084' },
  { id: 'CAN', name: 'Canada', aliases: [], continent: 'North America', capitals: ['Ottawa'], capitalAliases: [], flag: 'ca', mapId: '124' },
  { id: 'CRI', name: 'Costa Rica', aliases: [], continent: 'North America', capitals: ['San José'], capitalAliases: [], flag: 'cr', mapId: '188' },
  { id: 'CUB', name: 'Cuba', aliases: [], continent: 'North America', capitals: ['Havana'], capitalAliases: ['La Habana', 'Habana'], flag: 'cu', mapId: '192' },
  { id: 'DMA', name: 'Dominica', aliases: [], continent: 'North America', capitals: ['Roseau'], capitalAliases: [], flag: 'dm', mapId: '212' },
  { id: 'DOM', name: 'Dominican Republic', aliases: ['Dominican Rep'], continent: 'North America', capitals: ['Santo Domingo'], capitalAliases: [], flag: 'do', mapId: '214' },
  { id: 'SLV', name: 'El Salvador', aliases: ['Salvador'], continent: 'North America', capitals: ['San Salvador'], capitalAliases: [], flag: 'sv', mapId: '222' },
  { id: 'GRD', name: 'Grenada', aliases: [], continent: 'North America', capitals: ["Saint George's"], capitalAliases: [], flag: 'gd', mapId: '308' },
  { id: 'GTM', name: 'Guatemala', aliases: [], continent: 'North America', capitals: ['Guatemala City'], capitalAliases: ['Guatemala', 'Ciudad de Guatemala'], flag: 'gt', mapId: '320' },
  { id: 'HTI', name: 'Haiti', aliases: [], continent: 'North America', capitals: ['Port-au-Prince'], capitalAliases: [], flag: 'ht', mapId: '332' },
  { id: 'HND', name: 'Honduras', aliases: [], continent: 'North America', capitals: ['Tegucigalpa'], capitalAliases: [], flag: 'hn', mapId: '340' },
  { id: 'JAM', name: 'Jamaica', aliases: [], continent: 'North America', capitals: ['Kingston'], capitalAliases: [], flag: 'jm', mapId: '388' },
  { id: 'MEX', name: 'Mexico', aliases: ['México'], continent: 'North America', capitals: ['Mexico City'], capitalAliases: ['Ciudad de Mexico', 'CDMX'], flag: 'mx', mapId: '484' },
  { id: 'NIC', name: 'Nicaragua', aliases: [], continent: 'North America', capitals: ['Managua'], capitalAliases: [], flag: 'ni', mapId: '558' },
  { id: 'PAN', name: 'Panama', aliases: ['Panamá'], continent: 'North America', capitals: ['Panama City'], capitalAliases: ['Panama', 'Ciudad de Panama'], flag: 'pa', mapId: '591' },
  { id: 'KNA', name: 'Saint Kitts and Nevis', aliases: ['Saint Kitts', 'Saint Christopher and Nevis', 'Saint Kitts-Nevis'], continent: 'North America', capitals: ['Basseterre'], capitalAliases: [], flag: 'kn', mapId: '659' },
  { id: 'LCA', name: 'Saint Lucia', aliases: [], continent: 'North America', capitals: ['Castries'], capitalAliases: [], flag: 'lc', mapId: '662' },
  { id: 'VCT', name: 'Saint Vincent and the Grenadines', aliases: ['Saint Vincent', 'Saint Vincent and Grenadines', 'Saint Vincent & the Grenadines'], continent: 'North America', capitals: ['Kingstown'], capitalAliases: [], flag: 'vc', mapId: '670' },
  { id: 'TTO', name: 'Trinidad and Tobago', aliases: ['Trinidad'], continent: 'North America', capitals: ['Port of Spain'], capitalAliases: [], flag: 'tt', mapId: '780' },
  { id: 'USA', name: 'United States', aliases: ['USA', 'US', 'United States of America', 'America', 'US of A'], continent: 'North America', capitals: ['Washington, D.C.'], capitalAliases: ['Washington', 'DC', 'Washington DC'], flag: 'us', mapId: '840' },

  // --------------------------------------------------------- South America (12)
  { id: 'ARG', name: 'Argentina', aliases: [], continent: 'South America', capitals: ['Buenos Aires'], capitalAliases: [], flag: 'ar', mapId: '032' },
  { id: 'BOL', name: 'Bolivia', aliases: [], continent: 'South America', capitals: ['Sucre', 'La Paz'], capitalAliases: [], flag: 'bo', mapId: '068' },
  { id: 'BRA', name: 'Brazil', aliases: ['Brasil'], continent: 'South America', capitals: ['Brasília'], capitalAliases: [], flag: 'br', mapId: '076' },
  { id: 'CHL', name: 'Chile', aliases: [], continent: 'South America', capitals: ['Santiago'], capitalAliases: ['Santiago de Chile'], flag: 'cl', mapId: '152' },
  { id: 'COL', name: 'Colombia', aliases: [], continent: 'South America', capitals: ['Bogotá'], capitalAliases: [], flag: 'co', mapId: '170' },
  { id: 'ECU', name: 'Ecuador', aliases: [], continent: 'South America', capitals: ['Quito'], capitalAliases: [], flag: 'ec', mapId: '218' },
  { id: 'GUY', name: 'Guyana', aliases: [], continent: 'South America', capitals: ['Georgetown'], capitalAliases: [], flag: 'gy', mapId: '328' },
  { id: 'PRY', name: 'Paraguay', aliases: [], continent: 'South America', capitals: ['Asunción'], capitalAliases: [], flag: 'py', mapId: '600' },
  { id: 'PER', name: 'Peru', aliases: ['Perú'], continent: 'South America', capitals: ['Lima'], capitalAliases: [], flag: 'pe', mapId: '604' },
  { id: 'SUR', name: 'Suriname', aliases: ['Surinam'], continent: 'South America', capitals: ['Paramaribo'], capitalAliases: [], flag: 'sr', mapId: '740' },
  { id: 'URY', name: 'Uruguay', aliases: [], continent: 'South America', capitals: ['Montevideo'], capitalAliases: [], flag: 'uy', mapId: '858' },
  { id: 'VEN', name: 'Venezuela', aliases: [], continent: 'South America', capitals: ['Caracas'], capitalAliases: [], flag: 've', mapId: '862' },

  // --------------------------------------------------------------- Oceania (14)
  { id: 'AUS', name: 'Australia', aliases: [], continent: 'Oceania', capitals: ['Canberra'], capitalAliases: [], flag: 'au', mapId: '036' },
  { id: 'FJI', name: 'Fiji', aliases: [], continent: 'Oceania', capitals: ['Suva'], capitalAliases: [], flag: 'fj', mapId: '242' },
  { id: 'KIR', name: 'Kiribati', aliases: [], continent: 'Oceania', capitals: ['South Tarawa'], capitalAliases: ['Tarawa', 'Bairiki'], flag: 'ki', mapId: '296' },
  { id: 'MHL', name: 'Marshall Islands', aliases: ['Marshall Is', 'Marshalls'], continent: 'Oceania', capitals: ['Majuro'], capitalAliases: [], flag: 'mh', mapId: '584' },
  { id: 'FSM', name: 'Micronesia', aliases: ['Federated States of Micronesia', 'FSM'], continent: 'Oceania', capitals: ['Palikir'], capitalAliases: [], flag: 'fm', mapId: '583' },
  { id: 'NRU', name: 'Nauru', aliases: [], continent: 'Oceania', capitals: ['Yaren'], capitalAliases: ['Yaren District'], flag: 'nr', mapId: '520' },
  { id: 'NZL', name: 'New Zealand', aliases: ['NZ', 'Aotearoa'], continent: 'Oceania', capitals: ['Wellington'], capitalAliases: [], flag: 'nz', mapId: '554' },
  { id: 'PLW', name: 'Palau', aliases: ['Belau'], continent: 'Oceania', capitals: ['Ngerulmud'], capitalAliases: ['Melekeok'], flag: 'pw', mapId: '585' },
  { id: 'PNG', name: 'Papua New Guinea', aliases: ['PNG', 'Papua'], continent: 'Oceania', capitals: ['Port Moresby'], capitalAliases: [], flag: 'pg', mapId: '598' },
  { id: 'WSM', name: 'Samoa', aliases: ['Western Samoa'], continent: 'Oceania', capitals: ['Apia'], capitalAliases: [], flag: 'ws', mapId: '882' },
  { id: 'SLB', name: 'Solomon Islands', aliases: ['Solomons', 'Solomon Is'], continent: 'Oceania', capitals: ['Honiara'], capitalAliases: [], flag: 'sb', mapId: '090' },
  { id: 'TON', name: 'Tonga', aliases: [], continent: 'Oceania', capitals: ['Nukuʻalofa'], capitalAliases: [], flag: 'to', mapId: '776' },
  { id: 'TUV', name: 'Tuvalu', aliases: ['Ellice Islands'], continent: 'Oceania', capitals: ['Funafuti'], capitalAliases: [], flag: 'tv', mapId: '798' },
  { id: 'VUT', name: 'Vanuatu', aliases: ['New Hebrides'], continent: 'Oceania', capitals: ['Port Vila'], capitalAliases: [], flag: 'vu', mapId: '548' },
];

export const COUNTRY_BY_ID: Record<string, Country> = Object.fromEntries(COUNTRIES.map((c) => [c.id, c]));

/** Countries per continent, sorted by display name (used by the Sporcle-style list). */
export function countriesOf(continent: Continent): Country[] {
  return COUNTRIES.filter((c) => c.continent === continent).sort((a, b) => a.name.localeCompare(b.name));
}
