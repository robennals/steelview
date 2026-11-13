import type { MapTile } from './tiles';

/**
 * One tile per sovereign state — the 193 UN members, the two observer states
 * (Palestine, Vatican City), Kosovo and Taiwan — laid out as a map of the
 * world in which a tile's area follows its country's. Ids are ISO 3166-1
 * alpha-2, matching `WORLD_COUNTRIES` ("GB" shown as "UK", as on the Europe
 * tiles; "XK" for Kosovo). `world-tiles.test.ts` checks every rule below
 * against the real outlines.
 *
 * - **Size.** One cell is about 250,000 km², roughly the United Kingdom, and
 *   no country is smaller than one cell, so Tuvalu stays as easy to point at
 *   as Luxembourg. A tile is any whole-number rectangle, within a cell or two
 *   of its country's true size (a fifth, for the largest).
 * - **Land.** A landmass has no holes: neighbours touch wherever a rectangle
 *   allows it, and every tile on a continent connects to the rest of it.
 * - **Water.** Countries divided by a major body of water never touch. The
 *   Atlantic, the Pacific and the Indian Ocean are open grid; the
 *   Mediterranean, the Black Sea, the Caspian, the Red Sea, the Gulf, the
 *   North Sea, the Baltic and the seas of East Asia are at least one empty
 *   cell. The Pacific runs off both edges of the grid, as on the real-shape
 *   map, with its island states at the right-hand edge.
 *
 * Some borders cannot survive rectangles: Pakistan is a little large so that
 * South Asia has no hole, and Russia runs along only part of China's border,
 * with Mongolia and Kazakhstan taking the rest. Greenland and Western Sahara
 * are not sovereign states and have no tile; Morocco runs down to Mauritania.
 *
 * The grid, by id:
 *
 *    .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  . IS  .  .  .  . NO SE FI FI RU RU RU RU RU RU RU RU RU RU RU RU RU RU RU  .  .  .  .  .  .  .  .  .  .  .  .
 *    .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  . NO SE  .  . RU RU RU RU RU RU RU RU RU RU RU RU RU RU RU  .  .  .  .  .  .  .  .  .  .  .  .
 *    .  . CA CA CA CA CA CA CA CA CA CA CA CA CA  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  . EE RU RU RU RU RU RU RU RU RU RU RU RU RU RU RU  .  .  .  .  .  .  .  .  .  .  .  .
 *    .  . CA CA CA CA CA CA CA CA CA CA CA CA CA  .  .  .  .  .  .  .  .  . GB  .  .  . DK  .  .  . LV RU RU RU RU RU RU RU RU RU RU RU RU RU RU RU  .  .  .  .  .  .  .  .  .  .  .  .
 *    .  . CA CA CA CA CA CA CA CA CA CA CA CA CA  .  .  .  .  .  .  .  . IE GB  . NL NL DE PL PL LT LT RU RU RU RU RU RU RU RU RU RU RU RU RU RU RU  .  .  .  .  .  .  .  .  .  .  .  .
 *    .  . US US US US US US US US US US US US US  .  .  .  .  .  .  .  .  .  .  . BE LU DE CZ SK SK HU BY UA UA GE KZ KZ KZ KZ KZ MN MN CN CN CN CN CN CN CN  .  .  .  .  .  .  .  .  .
 *    .  . US US US US US US US US US US US US US  .  .  .  .  .  .  .  .  .  .  . FR FR FR CH LI AT HU RO MD  . GE KZ KZ KZ KZ KZ MN MN CN CN CN CN CN CN CN  .  .  .  .  .  .  .  .  .
 *    .  . US US US US US US US US US US US US US  .  .  .  .  .  .  .  .  . PT ES ES AD MC IT SI HR RS BG  .  . AM AZ  . TM UZ KG MN MN CN CN CN CN CN CN CN KP KP  . JP  .  .  .  .  .
 *    .  .  .  . MX MX MX MX  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  . VA IT  . BA XK BG TR TR TR IR IR AF AF AF TJ TJ CN CN CN CN CN CN CN  . KR  . JP  .  .  .  .  .
 *    .  .  .  . MX MX MX MX  .  .  . BS  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  . SM  . ME AL MK  . SY IQ IR IR PK PK PK PK PK CN CN CN CN CN CN CN  .  .  .  .  .  .  .  .  .
 *    .  .  .  .  .  . GT BZ  .  . CU  .  .  .  .  .  .  .  .  .  .  .  .  .  . MA  .  .  . MT  .  .  . GR  . LB IQ IR IR  .  . IN IN IN CN CN CN CN CN CN CN  .  .  .  .  .  .  .  .  .
 *    .  .  .  .  .  . SV HN  .  .  .  . HT DO  . KN AG  .  .  .  .  .  .  .  . MA  .  .  .  .  .  . CY  .  . IL IQ KW  .  .  . IN IN IN NP BT MM LA VN  .  .  .  .  .  .  .  .  .  .  .
 *    .  .  .  .  .  .  . NI  .  . JM  .  .  .  .  . DM  .  .  .  .  .  .  .  . MA DZ DZ DZ TN  .  .  .  . PS JO SA SA SA BH  . IN IN IN BD BD MM TH VN  . TW  .  .  .  .  .  .  .  .  .
 *    .  .  .  .  .  .  . CR PA  .  .  .  .  .  . VC LC BB  .  .  .  .  .  . MR MR DZ DZ DZ LY LY LY LY EG EG  . SA SA SA QA  . IN IN IN  .  . MM TH KH  .  . PH  .  .  .  .  .  .  .  .
 *    .  .  .  .  .  .  .  . CO CO CO VE VE  .  . GD TT  .  .  .  . CV  .  . MR MR DZ DZ DZ LY LY LY LY EG EG  . SA SA SA AE OM  .  .  .  .  .  . MY  .  .  . PH  .  . PW  . FM  . MH  .
 *    .  .  .  .  .  .  .  . CO CO CO VE VE GY SR  .  .  .  .  .  .  .  . GM SN ML ML ML NE NE NE TD TD SD SD SD  .  . YE YE OM MV  . LK  .  .  . SG  . BN  .  .  .  .  .  .  .  .  .  .
 *    .  .  .  .  .  .  .  . EC PE PE PE BR BR BR BR BR BR BR  .  .  .  . GW GN ML ML ML NE NE NE TD TD SD SD SD ER  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .
 *    .  .  .  .  .  .  .  .  . PE PE PE BR BR BR BR BR BR BR  .  .  .  . SL LR CI BF BF BJ NG NG TD TD SS SS ET ET ET DJ  .  .  .  .  .  .  .  . ID ID ID ID PG  .  .  .  . NR  .  . KI
 *    .  .  .  .  .  .  .  .  . CL BO BO BR BR BR BR BR BR BR  .  .  .  .  .  .  . GH TG BJ NG NG CM CF CF CF ET ET ET SO  .  .  .  .  .  .  .  . ID ID ID ID PG  . SB  .  .  .  .  .  .
 *    .  .  .  .  .  .  .  .  . CL BO BO BR BR BR BR BR BR BR  .  .  .  .  .  .  .  .  .  .  . GQ CM CD CD CD UG KE KE SO  . SC  .  .  .  .  .  .  .  . TL  .  .  .  .  .  .  . TV  .  .
 *    .  .  .  .  .  .  .  .  . CL PY PY BR BR BR BR BR BR BR  .  .  .  .  .  .  .  .  . ST  . GA CG CD CD CD RW TZ TZ  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  . VU  .  .  .  .
 *    .  .  .  .  .  .  .  .  . CL AR AR AR UY  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  . AO AO CD CD CD BI TZ TZ  . KM  .  .  .  .  .  .  . AU AU AU AU AU AU AU AU  .  . FJ  . WS
 *    .  .  .  .  .  .  .  .  .  . AR AR AR  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  . AO AO ZM ZM ZM MW MZ  .  .  .  .  .  .  .  .  .  . AU AU AU AU AU AU AU AU  .  .  .  .  .
 *    .  .  .  .  .  .  .  .  .  . AR AR AR  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  . NA NA BW BW ZW ZW MZ  . MG  . MU  .  .  .  .  .  . AU AU AU AU AU AU AU AU  .  .  .  . TO
 *    .  .  .  .  .  .  .  .  .  . AR AR AR  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  . NA NA ZA ZA ZA ZA MZ  . MG  .  .  .  .  .  .  .  . AU AU AU AU AU AU AU AU  .  . NZ  .  .
 *    .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  . LS SZ MZ  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  . NZ  .  .
 */
export const WORLD_COUNTRY_TILES: MapTile[] = [
  { id: 'IS', code: 'IS', name: "Iceland", row: 0, col: 24 },
  { id: 'NO', code: 'NO', name: "Norway", row: 0, col: 29, h: 2 },
  { id: 'SE', code: 'SE', name: "Sweden", row: 0, col: 30, h: 2 },
  { id: 'FI', code: 'FI', name: "Finland", row: 0, col: 31, w: 2 },
  { id: 'RU', code: 'RU', name: "Russia", row: 0, col: 33, w: 15, h: 5 },
  { id: 'CA', code: 'CA', name: "Canada", row: 2, col: 2, w: 13, h: 3 },
  { id: 'EE', code: 'EE', name: "Estonia", row: 2, col: 32 },
  { id: 'GB', code: 'UK', name: "United Kingdom", row: 3, col: 24, h: 2 },
  { id: 'DK', code: 'DK', name: "Denmark", row: 3, col: 28 },
  { id: 'LV', code: 'LV', name: "Latvia", row: 3, col: 32 },
  { id: 'IE', code: 'IE', name: "Ireland", row: 4, col: 23 },
  { id: 'NL', code: 'NL', name: "Netherlands", row: 4, col: 26, w: 2 },
  { id: 'DE', code: 'DE', name: "Germany", row: 4, col: 28, h: 2 },
  { id: 'PL', code: 'PL', name: "Poland", row: 4, col: 29, w: 2 },
  { id: 'LT', code: 'LT', name: "Lithuania", row: 4, col: 31, w: 2 },
  { id: 'US', code: 'US', name: "United States", row: 5, col: 2, w: 13, h: 3 },
  { id: 'BE', code: 'BE', name: "Belgium", row: 5, col: 26 },
  { id: 'LU', code: 'LU', name: "Luxembourg", row: 5, col: 27 },
  { id: 'CZ', code: 'CZ', name: "Czechia", row: 5, col: 29 },
  { id: 'SK', code: 'SK', name: "Slovakia", row: 5, col: 30, w: 2 },
  { id: 'HU', code: 'HU', name: "Hungary", row: 5, col: 32, h: 2 },
  { id: 'BY', code: 'BY', name: "Belarus", row: 5, col: 33 },
  { id: 'UA', code: 'UA', name: "Ukraine", row: 5, col: 34, w: 2 },
  { id: 'GE', code: 'GE', name: "Georgia", row: 5, col: 36, h: 2 },
  { id: 'KZ', code: 'KZ', name: "Kazakhstan", row: 5, col: 37, w: 5, h: 2 },
  { id: 'MN', code: 'MN', name: "Mongolia", row: 5, col: 42, w: 2, h: 3 },
  { id: 'CN', code: 'CN', name: "China", row: 5, col: 44, w: 7, h: 6 },
  { id: 'FR', code: 'FR', name: "France", row: 6, col: 26, w: 3 },
  { id: 'CH', code: 'CH', name: "Switzerland", row: 6, col: 29 },
  { id: 'LI', code: 'LI', name: "Liechtenstein", row: 6, col: 30 },
  { id: 'AT', code: 'AT', name: "Austria", row: 6, col: 31 },
  { id: 'RO', code: 'RO', name: "Romania", row: 6, col: 33 },
  { id: 'MD', code: 'MD', name: "Moldova", row: 6, col: 34 },
  { id: 'PT', code: 'PT', name: "Portugal", row: 7, col: 24 },
  { id: 'ES', code: 'ES', name: "Spain", row: 7, col: 25, w: 2 },
  { id: 'AD', code: 'AD', name: "Andorra", row: 7, col: 27 },
  { id: 'MC', code: 'MC', name: "Monaco", row: 7, col: 28 },
  { id: 'IT', code: 'IT', name: "Italy", row: 7, col: 29, h: 2 },
  { id: 'SI', code: 'SI', name: "Slovenia", row: 7, col: 30 },
  { id: 'HR', code: 'HR', name: "Croatia", row: 7, col: 31 },
  { id: 'RS', code: 'RS', name: "Serbia", row: 7, col: 32 },
  { id: 'BG', code: 'BG', name: "Bulgaria", row: 7, col: 33, h: 2 },
  { id: 'AM', code: 'AM', name: "Armenia", row: 7, col: 36 },
  { id: 'AZ', code: 'AZ', name: "Azerbaijan", row: 7, col: 37 },
  { id: 'TM', code: 'TM', name: "Turkmenistan", row: 7, col: 39 },
  { id: 'UZ', code: 'UZ', name: "Uzbekistan", row: 7, col: 40 },
  { id: 'KG', code: 'KG', name: "Kyrgyzstan", row: 7, col: 41 },
  { id: 'KP', code: 'KP', name: "North Korea", row: 7, col: 51, w: 2 },
  { id: 'JP', code: 'JP', name: "Japan", row: 7, col: 54, h: 2 },
  { id: 'MX', code: 'MX', name: "Mexico", row: 8, col: 4, w: 4, h: 2 },
  { id: 'VA', code: 'VA', name: "Vatican City", row: 8, col: 28 },
  { id: 'BA', code: 'BA', name: "Bosnia and Herzegovina", row: 8, col: 31 },
  { id: 'XK', code: 'XK', name: "Kosovo", row: 8, col: 32 },
  { id: 'TR', code: 'TR', name: "Turkey", row: 8, col: 34, w: 3 },
  { id: 'IR', code: 'IR', name: "Iran", row: 8, col: 37, w: 2, h: 3 },
  { id: 'AF', code: 'AF', name: "Afghanistan", row: 8, col: 39, w: 3 },
  { id: 'TJ', code: 'TJ', name: "Tajikistan", row: 8, col: 42, w: 2 },
  { id: 'KR', code: 'KR', name: "South Korea", row: 8, col: 52 },
  { id: 'BS', code: 'BS', name: "Bahamas", row: 9, col: 11 },
  { id: 'SM', code: 'SM', name: "San Marino", row: 9, col: 29 },
  { id: 'ME', code: 'ME', name: "Montenegro", row: 9, col: 31 },
  { id: 'AL', code: 'AL', name: "Albania", row: 9, col: 32 },
  { id: 'MK', code: 'MK', name: "North Macedonia", row: 9, col: 33 },
  { id: 'SY', code: 'SY', name: "Syria", row: 9, col: 35 },
  { id: 'IQ', code: 'IQ', name: "Iraq", row: 9, col: 36, h: 3 },
  { id: 'PK', code: 'PK', name: "Pakistan", row: 9, col: 39, w: 5 },
  { id: 'GT', code: 'GT', name: "Guatemala", row: 10, col: 6 },
  { id: 'BZ', code: 'BZ', name: "Belize", row: 10, col: 7 },
  { id: 'CU', code: 'CU', name: "Cuba", row: 10, col: 10 },
  { id: 'MA', code: 'MA', name: "Morocco", row: 10, col: 25, h: 3 },
  { id: 'MT', code: 'MT', name: "Malta", row: 10, col: 29 },
  { id: 'GR', code: 'GR', name: "Greece", row: 10, col: 33 },
  { id: 'LB', code: 'LB', name: "Lebanon", row: 10, col: 35 },
  { id: 'IN', code: 'IN', name: "India", row: 10, col: 41, w: 3, h: 4 },
  { id: 'SV', code: 'SV', name: "El Salvador", row: 11, col: 6 },
  { id: 'HN', code: 'HN', name: "Honduras", row: 11, col: 7 },
  { id: 'HT', code: 'HT', name: "Haiti", row: 11, col: 12 },
  { id: 'DO', code: 'DO', name: "Dominican Republic", row: 11, col: 13 },
  { id: 'KN', code: 'KN', name: "Saint Kitts and Nevis", row: 11, col: 15 },
  { id: 'AG', code: 'AG', name: "Antigua and Barbuda", row: 11, col: 16 },
  { id: 'CY', code: 'CY', name: "Cyprus", row: 11, col: 32 },
  { id: 'IL', code: 'IL', name: "Israel", row: 11, col: 35 },
  { id: 'KW', code: 'KW', name: "Kuwait", row: 11, col: 37 },
  { id: 'NP', code: 'NP', name: "Nepal", row: 11, col: 44 },
  { id: 'BT', code: 'BT', name: "Bhutan", row: 11, col: 45 },
  { id: 'MM', code: 'MM', name: "Myanmar", row: 11, col: 46, h: 3 },
  { id: 'LA', code: 'LA', name: "Laos", row: 11, col: 47 },
  { id: 'VN', code: 'VN', name: "Vietnam", row: 11, col: 48, h: 2 },
  { id: 'NI', code: 'NI', name: "Nicaragua", row: 12, col: 7 },
  { id: 'JM', code: 'JM', name: "Jamaica", row: 12, col: 10 },
  { id: 'DM', code: 'DM', name: "Dominica", row: 12, col: 16 },
  { id: 'DZ', code: 'DZ', name: "Algeria", row: 12, col: 26, w: 3, h: 3 },
  { id: 'TN', code: 'TN', name: "Tunisia", row: 12, col: 29 },
  { id: 'PS', code: 'PS', name: "Palestine", row: 12, col: 34 },
  { id: 'JO', code: 'JO', name: "Jordan", row: 12, col: 35 },
  { id: 'SA', code: 'SA', name: "Saudi Arabia", row: 12, col: 36, w: 3, h: 3 },
  { id: 'BH', code: 'BH', name: "Bahrain", row: 12, col: 39 },
  { id: 'BD', code: 'BD', name: "Bangladesh", row: 12, col: 44, w: 2 },
  { id: 'TH', code: 'TH', name: "Thailand", row: 12, col: 47, h: 2 },
  { id: 'TW', code: 'TW', name: "Taiwan", row: 12, col: 50 },
  { id: 'CR', code: 'CR', name: "Costa Rica", row: 13, col: 7 },
  { id: 'PA', code: 'PA', name: "Panama", row: 13, col: 8 },
  { id: 'VC', code: 'VC', name: "Saint Vincent and the Grenadines", row: 13, col: 15 },
  { id: 'LC', code: 'LC', name: "Saint Lucia", row: 13, col: 16 },
  { id: 'BB', code: 'BB', name: "Barbados", row: 13, col: 17 },
  { id: 'MR', code: 'MR', name: "Mauritania", row: 13, col: 24, w: 2, h: 2 },
  { id: 'LY', code: 'LY', name: "Libya", row: 13, col: 29, w: 4, h: 2 },
  { id: 'EG', code: 'EG', name: "Egypt", row: 13, col: 33, w: 2, h: 2 },
  { id: 'QA', code: 'QA', name: "Qatar", row: 13, col: 39 },
  { id: 'KH', code: 'KH', name: "Cambodia", row: 13, col: 48 },
  { id: 'PH', code: 'PH', name: "Philippines", row: 13, col: 51, h: 2 },
  { id: 'CO', code: 'CO', name: "Colombia", row: 14, col: 8, w: 3, h: 2 },
  { id: 'VE', code: 'VE', name: "Venezuela", row: 14, col: 11, w: 2, h: 2 },
  { id: 'GD', code: 'GD', name: "Grenada", row: 14, col: 15 },
  { id: 'TT', code: 'TT', name: "Trinidad and Tobago", row: 14, col: 16 },
  { id: 'CV', code: 'CV', name: "Cabo Verde", row: 14, col: 21 },
  { id: 'AE', code: 'AE', name: "United Arab Emirates", row: 14, col: 39 },
  { id: 'OM', code: 'OM', name: "Oman", row: 14, col: 40, h: 2 },
  { id: 'MY', code: 'MY', name: "Malaysia", row: 14, col: 47 },
  { id: 'PW', code: 'PW', name: "Palau", row: 14, col: 54 },
  { id: 'FM', code: 'FM', name: "Micronesia", row: 14, col: 56 },
  { id: 'MH', code: 'MH', name: "Marshall Islands", row: 14, col: 58 },
  { id: 'GY', code: 'GY', name: "Guyana", row: 15, col: 13 },
  { id: 'SR', code: 'SR', name: "Suriname", row: 15, col: 14 },
  { id: 'GM', code: 'GM', name: "Gambia", row: 15, col: 23 },
  { id: 'SN', code: 'SN', name: "Senegal", row: 15, col: 24 },
  { id: 'ML', code: 'ML', name: "Mali", row: 15, col: 25, w: 3, h: 2 },
  { id: 'NE', code: 'NE', name: "Niger", row: 15, col: 28, w: 3, h: 2 },
  { id: 'TD', code: 'TD', name: "Chad", row: 15, col: 31, w: 2, h: 3 },
  { id: 'SD', code: 'SD', name: "Sudan", row: 15, col: 33, w: 3, h: 2 },
  { id: 'YE', code: 'YE', name: "Yemen", row: 15, col: 38, w: 2 },
  { id: 'MV', code: 'MV', name: "Maldives", row: 15, col: 41 },
  { id: 'LK', code: 'LK', name: "Sri Lanka", row: 15, col: 43 },
  { id: 'SG', code: 'SG', name: "Singapore", row: 15, col: 47 },
  { id: 'BN', code: 'BN', name: "Brunei", row: 15, col: 49 },
  { id: 'EC', code: 'EC', name: "Ecuador", row: 16, col: 8 },
  { id: 'PE', code: 'PE', name: "Peru", row: 16, col: 9, w: 3, h: 2 },
  { id: 'BR', code: 'BR', name: "Brazil", row: 16, col: 12, w: 7, h: 5 },
  { id: 'GW', code: 'GW', name: "Guinea-Bissau", row: 16, col: 23 },
  { id: 'GN', code: 'GN', name: "Guinea", row: 16, col: 24 },
  { id: 'ER', code: 'ER', name: "Eritrea", row: 16, col: 36 },
  { id: 'SL', code: 'SL', name: "Sierra Leone", row: 17, col: 23 },
  { id: 'LR', code: 'LR', name: "Liberia", row: 17, col: 24 },
  { id: 'CI', code: 'CI', name: "Côte d'Ivoire", row: 17, col: 25 },
  { id: 'BF', code: 'BF', name: "Burkina Faso", row: 17, col: 26, w: 2 },
  { id: 'BJ', code: 'BJ', name: "Benin", row: 17, col: 28, h: 2 },
  { id: 'NG', code: 'NG', name: "Nigeria", row: 17, col: 29, w: 2, h: 2 },
  { id: 'SS', code: 'SS', name: "South Sudan", row: 17, col: 33, w: 2 },
  { id: 'ET', code: 'ET', name: "Ethiopia", row: 17, col: 35, w: 3, h: 2 },
  { id: 'DJ', code: 'DJ', name: "Djibouti", row: 17, col: 38 },
  { id: 'ID', code: 'ID', name: "Indonesia", row: 17, col: 47, w: 4, h: 2 },
  { id: 'PG', code: 'PG', name: "Papua New Guinea", row: 17, col: 51, h: 2 },
  { id: 'NR', code: 'NR', name: "Nauru", row: 17, col: 56 },
  { id: 'KI', code: 'KI', name: "Kiribati", row: 17, col: 59 },
  { id: 'CL', code: 'CL', name: "Chile", row: 18, col: 9, h: 4 },
  { id: 'BO', code: 'BO', name: "Bolivia", row: 18, col: 10, w: 2, h: 2 },
  { id: 'GH', code: 'GH', name: "Ghana", row: 18, col: 26 },
  { id: 'TG', code: 'TG', name: "Togo", row: 18, col: 27 },
  { id: 'CM', code: 'CM', name: "Cameroon", row: 18, col: 31, h: 2 },
  { id: 'CF', code: 'CF', name: "Central African Republic", row: 18, col: 32, w: 3 },
  { id: 'SO', code: 'SO', name: "Somalia", row: 18, col: 38, h: 2 },
  { id: 'SB', code: 'SB', name: "Solomon Islands", row: 18, col: 53 },
  { id: 'GQ', code: 'GQ', name: "Equatorial Guinea", row: 19, col: 30 },
  { id: 'CD', code: 'CD', name: "Democratic Republic of the Congo", row: 19, col: 32, w: 3, h: 3 },
  { id: 'UG', code: 'UG', name: "Uganda", row: 19, col: 35 },
  { id: 'KE', code: 'KE', name: "Kenya", row: 19, col: 36, w: 2 },
  { id: 'SC', code: 'SC', name: "Seychelles", row: 19, col: 40 },
  { id: 'TL', code: 'TL', name: "Timor-Leste", row: 19, col: 49 },
  { id: 'TV', code: 'TV', name: "Tuvalu", row: 19, col: 57 },
  { id: 'PY', code: 'PY', name: "Paraguay", row: 20, col: 10, w: 2 },
  { id: 'ST', code: 'ST', name: "São Tomé and Príncipe", row: 20, col: 28 },
  { id: 'GA', code: 'GA', name: "Gabon", row: 20, col: 30 },
  { id: 'CG', code: 'CG', name: "Congo", row: 20, col: 31 },
  { id: 'RW', code: 'RW', name: "Rwanda", row: 20, col: 35 },
  { id: 'TZ', code: 'TZ', name: "Tanzania", row: 20, col: 36, w: 2, h: 2 },
  { id: 'VU', code: 'VU', name: "Vanuatu", row: 20, col: 55 },
  { id: 'AR', code: 'AR', name: "Argentina", row: 21, col: 10, w: 3, h: 4 },
  { id: 'UY', code: 'UY', name: "Uruguay", row: 21, col: 13 },
  { id: 'AO', code: 'AO', name: "Angola", row: 21, col: 30, w: 2, h: 2 },
  { id: 'BI', code: 'BI', name: "Burundi", row: 21, col: 35 },
  { id: 'KM', code: 'KM', name: "Comoros", row: 21, col: 39 },
  { id: 'AU', code: 'AU', name: "Australia", row: 21, col: 47, w: 8, h: 4 },
  { id: 'FJ', code: 'FJ', name: "Fiji", row: 21, col: 57 },
  { id: 'WS', code: 'WS', name: "Samoa", row: 21, col: 59 },
  { id: 'ZM', code: 'ZM', name: "Zambia", row: 22, col: 32, w: 3 },
  { id: 'MW', code: 'MW', name: "Malawi", row: 22, col: 35 },
  { id: 'MZ', code: 'MZ', name: "Mozambique", row: 22, col: 36, h: 4 },
  { id: 'NA', code: 'NA', name: "Namibia", row: 23, col: 30, w: 2, h: 2 },
  { id: 'BW', code: 'BW', name: "Botswana", row: 23, col: 32, w: 2 },
  { id: 'ZW', code: 'ZW', name: "Zimbabwe", row: 23, col: 34, w: 2 },
  { id: 'MG', code: 'MG', name: "Madagascar", row: 23, col: 38, h: 2 },
  { id: 'MU', code: 'MU', name: "Mauritius", row: 23, col: 40 },
  { id: 'TO', code: 'TO', name: "Tonga", row: 23, col: 59 },
  { id: 'ZA', code: 'ZA', name: "South Africa", row: 24, col: 32, w: 4 },
  { id: 'NZ', code: 'NZ', name: "New Zealand", row: 24, col: 57, h: 2 },
  { id: 'LS', code: 'LS', name: "Lesotho", row: 25, col: 34 },
  { id: 'SZ', code: 'SZ', name: "Eswatini", row: 25, col: 35 },
];
