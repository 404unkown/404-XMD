const axios = require('axios');

// Helper function to convert country code to flag emoji
function getFlagEmoji(countryCode) {
    if (!countryCode || countryCode.length !== 2) return "🏳️";
    
    try {
        return countryCode
            .toUpperCase()
            .split('')
            .map(letter => String.fromCodePoint(letter.charCodeAt(0) + 127397))
            .join('');
    } catch (error) {
        return "🏴";
    }
}

// COMPREHENSIVE LOCAL DATABASE OF ALL COUNTRY CODES
const COUNTRY_CODES_DB = {
    // Africa
    '20': [{ name: 'Egypt', code: 'EG', capital: 'Cairo', region: 'Africa' }],
    '27': [{ name: 'South Africa', code: 'ZA', capital: 'Pretoria', region: 'Africa' }],
    '212': [{ name: 'Morocco', code: 'MA', capital: 'Rabat', region: 'Africa' }],
    '213': [{ name: 'Algeria', code: 'DZ', capital: 'Algiers', region: 'Africa' }],
    '216': [{ name: 'Tunisia', code: 'TN', capital: 'Tunis', region: 'Africa' }],
    '218': [{ name: 'Libya', code: 'LY', capital: 'Tripoli', region: 'Africa' }],
    '220': [{ name: 'Gambia', code: 'GM', capital: 'Banjul', region: 'Africa' }],
    '221': [{ name: 'Senegal', code: 'SN', capital: 'Dakar', region: 'Africa' }],
    '222': [{ name: 'Mauritania', code: 'MR', capital: 'Nouakchott', region: 'Africa' }],
    '223': [{ name: 'Mali', code: 'ML', capital: 'Bamako', region: 'Africa' }],
    '224': [{ name: 'Guinea', code: 'GN', capital: 'Conakry', region: 'Africa' }],
    '225': [{ name: 'Ivory Coast', code: 'CI', capital: 'Yamoussoukro', region: 'Africa' }],
    '226': [{ name: 'Burkina Faso', code: 'BF', capital: 'Ouagadougou', region: 'Africa' }],
    '227': [{ name: 'Niger', code: 'NE', capital: 'Niamey', region: 'Africa' }],
    '228': [{ name: 'Togo', code: 'TG', capital: 'Lomé', region: 'Africa' }],
    '229': [{ name: 'Benin', code: 'BJ', capital: 'Porto-Novo', region: 'Africa' }],
    '230': [{ name: 'Mauritius', code: 'MU', capital: 'Port Louis', region: 'Africa' }],
    '231': [{ name: 'Liberia', code: 'LR', capital: 'Monrovia', region: 'Africa' }],
    '232': [{ name: 'Sierra Leone', code: 'SL', capital: 'Freetown', region: 'Africa' }],
    '233': [{ name: 'Ghana', code: 'GH', capital: 'Accra', region: 'Africa' }],
    '234': [{ name: 'Nigeria', code: 'NG', capital: 'Abuja', region: 'Africa' }],
    '235': [{ name: 'Chad', code: 'TD', capital: "N'Djamena", region: 'Africa' }],
    '236': [{ name: 'Central African Republic', code: 'CF', capital: 'Bangui', region: 'Africa' }],
    '237': [{ name: 'Cameroon', code: 'CM', capital: 'Yaoundé', region: 'Africa' }],
    '238': [{ name: 'Cape Verde', code: 'CV', capital: 'Praia', region: 'Africa' }],
    '239': [{ name: 'São Tomé and Príncipe', code: 'ST', capital: 'São Tomé', region: 'Africa' }],
    '240': [{ name: 'Equatorial Guinea', code: 'GQ', capital: 'Malabo', region: 'Africa' }],
    '241': [{ name: 'Gabon', code: 'GA', capital: 'Libreville', region: 'Africa' }],
    '242': [{ name: 'Republic of the Congo', code: 'CG', capital: 'Brazzaville', region: 'Africa' }],
    '243': [{ name: 'Democratic Republic of the Congo', code: 'CD', capital: 'Kinshasa', region: 'Africa' }],
    '244': [{ name: 'Angola', code: 'AO', capital: 'Luanda', region: 'Africa' }],
    '245': [{ name: 'Guinea-Bissau', code: 'GW', capital: 'Bissau', region: 'Africa' }],
    '246': [{ name: 'Diego Garcia', code: 'IO', capital: 'Diego Garcia', region: 'Africa' }],
    '248': [{ name: 'Seychelles', code: 'SC', capital: 'Victoria', region: 'Africa' }],
    '249': [{ name: 'Sudan', code: 'SD', capital: 'Khartoum', region: 'Africa' }],
    '250': [{ name: 'Rwanda', code: 'RW', capital: 'Kigali', region: 'Africa' }],
    '251': [{ name: 'Ethiopia', code: 'ET', capital: 'Addis Ababa', region: 'Africa' }],
    '252': [{ name: 'Somalia', code: 'SO', capital: 'Mogadishu', region: 'Africa' }],
    '253': [{ name: 'Djibouti', code: 'DJ', capital: 'Djibouti', region: 'Africa' }],
    '254': [{ name: 'Kenya', code: 'KE', capital: 'Nairobi', region: 'Africa' }], // KENYA 🇰🇪
    '255': [{ name: 'Tanzania', code: 'TZ', capital: 'Dodoma', region: 'Africa' }],
    '256': [{ name: 'Uganda', code: 'UG', capital: 'Kampala', region: 'Africa' }],
    '257': [{ name: 'Burundi', code: 'BI', capital: 'Gitega', region: 'Africa' }],
    '258': [{ name: 'Mozambique', code: 'MZ', capital: 'Maputo', region: 'Africa' }],
    '260': [{ name: 'Zambia', code: 'ZM', capital: 'Lusaka', region: 'Africa' }],
    '261': [{ name: 'Madagascar', code: 'MG', capital: 'Antananarivo', region: 'Africa' }],
    '262': [
        { name: 'Réunion', code: 'RE', capital: 'Saint-Denis', region: 'Africa' },
        { name: 'Mayotte', code: 'YT', capital: 'Mamoudzou', region: 'Africa' }
    ],
    '263': [{ name: 'Zimbabwe', code: 'ZW', capital: 'Harare', region: 'Africa' }],
    '264': [{ name: 'Namibia', code: 'NA', capital: 'Windhoek', region: 'Africa' }],
    '265': [{ name: 'Malawi', code: 'MW', capital: 'Lilongwe', region: 'Africa' }],
    '266': [{ name: 'Lesotho', code: 'LS', capital: 'Maseru', region: 'Africa' }],
    '267': [{ name: 'Botswana', code: 'BW', capital: 'Gaborone', region: 'Africa' }],
    '268': [{ name: 'Eswatini', code: 'SZ', capital: 'Mbabane', region: 'Africa' }],
    '269': [{ name: 'Comoros', code: 'KM', capital: 'Moroni', region: 'Africa' }],
    '290': [{ name: 'Saint Helena', code: 'SH', capital: 'Jamestown', region: 'Africa' }],
    '291': [{ name: 'Eritrea', code: 'ER', capital: 'Asmara', region: 'Africa' }],
    '297': [{ name: 'Aruba', code: 'AW', capital: 'Oranjestad', region: 'Americas' }],
    '298': [{ name: 'Faroe Islands', code: 'FO', capital: 'Tórshavn', region: 'Europe' }],
    '299': [{ name: 'Greenland', code: 'GL', capital: 'Nuuk', region: 'Americas' }],

    // Americas
    '1': [
        { name: 'United States', code: 'US', capital: 'Washington D.C.', region: 'Americas' },
        { name: 'Canada', code: 'CA', capital: 'Ottawa', region: 'Americas' }
    ],
    '500': [{ name: 'Falkland Islands', code: 'FK', capital: 'Stanley', region: 'Americas' }],
    '501': [{ name: 'Belize', code: 'BZ', capital: 'Belmopan', region: 'Americas' }],
    '502': [{ name: 'Guatemala', code: 'GT', capital: 'Guatemala City', region: 'Americas' }],
    '503': [{ name: 'El Salvador', code: 'SV', capital: 'San Salvador', region: 'Americas' }],
    '504': [{ name: 'Honduras', code: 'HN', capital: 'Tegucigalpa', region: 'Americas' }],
    '505': [{ name: 'Nicaragua', code: 'NI', capital: 'Managua', region: 'Americas' }],
    '506': [{ name: 'Costa Rica', code: 'CR', capital: 'San José', region: 'Americas' }],
    '507': [{ name: 'Panama', code: 'PA', capital: 'Panama City', region: 'Americas' }],
    '508': [{ name: 'Saint Pierre and Miquelon', code: 'PM', capital: 'Saint-Pierre', region: 'Americas' }],
    '509': [{ name: 'Haiti', code: 'HT', capital: 'Port-au-Prince', region: 'Americas' }],
    '51': [{ name: 'Peru', code: 'PE', capital: 'Lima', region: 'Americas' }],
    '52': [{ name: 'Mexico', code: 'MX', capital: 'Mexico City', region: 'Americas' }],
    '53': [{ name: 'Cuba', code: 'CU', capital: 'Havana', region: 'Americas' }],
    '54': [{ name: 'Argentina', code: 'AR', capital: 'Buenos Aires', region: 'Americas' }],
    '55': [{ name: 'Brazil', code: 'BR', capital: 'Brasília', region: 'Americas' }],
    '56': [{ name: 'Chile', code: 'CL', capital: 'Santiago', region: 'Americas' }],
    '57': [{ name: 'Colombia', code: 'CO', capital: 'Bogotá', region: 'Americas' }],
    '58': [{ name: 'Venezuela', code: 'VE', capital: 'Caracas', region: 'Americas' }],
    '590': [{ name: 'Guadeloupe', code: 'GP', capital: 'Basse-Terre', region: 'Americas' }],
    '591': [{ name: 'Bolivia', code: 'BO', capital: 'Sucre', region: 'Americas' }],
    '592': [{ name: 'Guyana', code: 'GY', capital: 'Georgetown', region: 'Americas' }],
    '593': [{ name: 'Ecuador', code: 'EC', capital: 'Quito', region: 'Americas' }],
    '594': [{ name: 'French Guiana', code: 'GF', capital: 'Cayenne', region: 'Americas' }],
    '595': [{ name: 'Paraguay', code: 'PY', capital: 'Asunción', region: 'Americas' }],
    '596': [{ name: 'Martinique', code: 'MQ', capital: 'Fort-de-France', region: 'Americas' }],
    '597': [{ name: 'Suriname', code: 'SR', capital: 'Paramaribo', region: 'Americas' }],
    '598': [{ name: 'Uruguay', code: 'UY', capital: 'Montevideo', region: 'Americas' }],
    '599': [
        { name: 'Curaçao', code: 'CW', capital: 'Willemstad', region: 'Americas' },
        { name: 'Caribbean Netherlands', code: 'BQ', capital: 'Kralendijk', region: 'Americas' }
    ],

    // Asia
    '60': [{ name: 'Malaysia', code: 'MY', capital: 'Kuala Lumpur', region: 'Asia' }],
    '61': [{ name: 'Australia', code: 'AU', capital: 'Canberra', region: 'Oceania' }],
    '62': [{ name: 'Indonesia', code: 'ID', capital: 'Jakarta', region: 'Asia' }],
    '63': [{ name: 'Philippines', code: 'PH', capital: 'Manila', region: 'Asia' }],
    '64': [{ name: 'New Zealand', code: 'NZ', capital: 'Wellington', region: 'Oceania' }],
    '65': [{ name: 'Singapore', code: 'SG', capital: 'Singapore', region: 'Asia' }],
    '66': [{ name: 'Thailand', code: 'TH', capital: 'Bangkok', region: 'Asia' }],
    '81': [{ name: 'Japan', code: 'JP', capital: 'Tokyo', region: 'Asia' }],
    '82': [{ name: 'South Korea', code: 'KR', capital: 'Seoul', region: 'Asia' }],
    '84': [{ name: 'Vietnam', code: 'VN', capital: 'Hanoi', region: 'Asia' }],
    '86': [{ name: 'China', code: 'CN', capital: 'Beijing', region: 'Asia' }],
    '90': [{ name: 'Turkey', code: 'TR', capital: 'Ankara', region: 'Asia' }],
    '91': [{ name: 'India', code: 'IN', capital: 'New Delhi', region: 'Asia' }],
    '92': [{ name: 'Pakistan', code: 'PK', capital: 'Islamabad', region: 'Asia' }],
    '93': [{ name: 'Afghanistan', code: 'AF', capital: 'Kabul', region: 'Asia' }],
    '94': [{ name: 'Sri Lanka', code: 'LK', capital: 'Colombo', region: 'Asia' }],
    '95': [{ name: 'Myanmar', code: 'MM', capital: 'Naypyidaw', region: 'Asia' }],
    '96': [{ name: 'Maldives', code: 'MV', capital: 'Malé', region: 'Asia' }],
    '98': [{ name: 'Iran', code: 'IR', capital: 'Tehran', region: 'Asia' }],
    '211': [{ name: 'South Sudan', code: 'SS', capital: 'Juba', region: 'Africa' }],
    '350': [{ name: 'Gibraltar', code: 'GI', capital: 'Gibraltar', region: 'Europe' }],
    '351': [{ name: 'Portugal', code: 'PT', capital: 'Lisbon', region: 'Europe' }],
    '352': [{ name: 'Luxembourg', code: 'LU', capital: 'Luxembourg', region: 'Europe' }],
    '353': [{ name: 'Ireland', code: 'IE', capital: 'Dublin', region: 'Europe' }],
    '354': [{ name: 'Iceland', code: 'IS', capital: 'Reykjavík', region: 'Europe' }],
    '355': [{ name: 'Albania', code: 'AL', capital: 'Tirana', region: 'Europe' }],
    '356': [{ name: 'Malta', code: 'MT', capital: 'Valletta', region: 'Europe' }],
    '357': [{ name: 'Cyprus', code: 'CY', capital: 'Nicosia', region: 'Europe' }],
    '358': [{ name: 'Finland', code: 'FI', capital: 'Helsinki', region: 'Europe' }],
    '359': [{ name: 'Bulgaria', code: 'BG', capital: 'Sofia', region: 'Europe' }],
    '370': [{ name: 'Lithuania', code: 'LT', capital: 'Vilnius', region: 'Europe' }],
    '371': [{ name: 'Latvia', code: 'LV', capital: 'Riga', region: 'Europe' }],
    '372': [{ name: 'Estonia', code: 'EE', capital: 'Tallinn', region: 'Europe' }],
    '373': [{ name: 'Moldova', code: 'MD', capital: 'Chișinău', region: 'Europe' }],
    '374': [{ name: 'Armenia', code: 'AM', capital: 'Yerevan', region: 'Asia' }],
    '375': [{ name: 'Belarus', code: 'BY', capital: 'Minsk', region: 'Europe' }],
    '376': [{ name: 'Andorra', code: 'AD', capital: 'Andorra la Vella', region: 'Europe' }],
    '377': [{ name: 'Monaco', code: 'MC', capital: 'Monaco', region: 'Europe' }],
    '378': [{ name: 'San Marino', code: 'SM', capital: 'San Marino', region: 'Europe' }],
    '379': [{ name: 'Vatican City', code: 'VA', capital: 'Vatican City', region: 'Europe' }],
    '380': [{ name: 'Ukraine', code: 'UA', capital: 'Kyiv', region: 'Europe' }],
    '381': [{ name: 'Serbia', code: 'RS', capital: 'Belgrade', region: 'Europe' }],
    '382': [{ name: 'Montenegro', code: 'ME', capital: 'Podgorica', region: 'Europe' }],
    '383': [{ name: 'Kosovo', code: 'XK', capital: 'Pristina', region: 'Europe' }],
    '385': [{ name: 'Croatia', code: 'HR', capital: 'Zagreb', region: 'Europe' }],
    '386': [{ name: 'Slovenia', code: 'SI', capital: 'Ljubljana', region: 'Europe' }],
    '387': [{ name: 'Bosnia and Herzegovina', code: 'BA', capital: 'Sarajevo', region: 'Europe' }],
    '389': [{ name: 'North Macedonia', code: 'MK', capital: 'Skopje', region: 'Europe' }],
    '420': [{ name: 'Czech Republic', code: 'CZ', capital: 'Prague', region: 'Europe' }],
    '421': [{ name: 'Slovakia', code: 'SK', capital: 'Bratislava', region: 'Europe' }],
    '423': [{ name: 'Liechtenstein', code: 'LI', capital: 'Vaduz', region: 'Europe' }],
    '670': [{ name: 'Timor-Leste', code: 'TL', capital: 'Dili', region: 'Asia' }],
    '672': [{ name: 'Norfolk Island', code: 'NF', capital: 'Kingston', region: 'Oceania' }],
    '673': [{ name: 'Brunei', code: 'BN', capital: 'Bandar Seri Begawan', region: 'Asia' }],
    '674': [{ name: 'Nauru', code: 'NR', capital: 'Yaren', region: 'Oceania' }],
    '675': [{ name: 'Papua New Guinea', code: 'PG', capital: 'Port Moresby', region: 'Oceania' }],
    '676': [{ name: 'Tonga', code: 'TO', capital: "Nuku'alofa", region: 'Oceania' }],
    '677': [{ name: 'Solomon Islands', code: 'SB', capital: 'Honiara', region: 'Oceania' }],
    '678': [{ name: 'Vanuatu', code: 'VU', capital: 'Port Vila', region: 'Oceania' }],
    '679': [{ name: 'Fiji', code: 'FJ', capital: 'Suva', region: 'Oceania' }],
    '680': [{ name: 'Palau', code: 'PW', capital: 'Ngerulmud', region: 'Oceania' }],
    '681': [{ name: 'Wallis and Futuna', code: 'WF', capital: 'Mata-Utu', region: 'Oceania' }],
    '682': [{ name: 'Cook Islands', code: 'CK', capital: 'Avarua', region: 'Oceania' }],
    '683': [{ name: 'Niue', code: 'NU', capital: 'Alofi', region: 'Oceania' }],
    '685': [{ name: 'Samoa', code: 'WS', capital: 'Apia', region: 'Oceania' }],
    '686': [{ name: 'Kiribati', code: 'KI', capital: 'South Tarawa', region: 'Oceania' }],
    '687': [{ name: 'New Caledonia', code: 'NC', capital: 'Nouméa', region: 'Oceania' }],
    '688': [{ name: 'Tuvalu', code: 'TV', capital: 'Funafuti', region: 'Oceania' }],
    '689': [{ name: 'French Polynesia', code: 'PF', capital: 'Papeete', region: 'Oceania' }],
    '690': [{ name: 'Tokelau', code: 'TK', capital: 'Fakaofo', region: 'Oceania' }],
    '691': [{ name: 'Micronesia', code: 'FM', capital: 'Palikir', region: 'Oceania' }],
    '692': [{ name: 'Marshall Islands', code: 'MH', capital: 'Majuro', region: 'Oceania' }],
    '850': [{ name: 'North Korea', code: 'KP', capital: 'Pyongyang', region: 'Asia' }],
    '852': [{ name: 'Hong Kong', code: 'HK', capital: 'Hong Kong', region: 'Asia' }],
    '853': [{ name: 'Macau', code: 'MO', capital: 'Macau', region: 'Asia' }],
    '855': [{ name: 'Cambodia', code: 'KH', capital: 'Phnom Penh', region: 'Asia' }],
    '856': [{ name: 'Laos', code: 'LA', capital: 'Vientiane', region: 'Asia' }],
    '880': [{ name: 'Bangladesh', code: 'BD', capital: 'Dhaka', region: 'Asia' }],
    '886': [{ name: 'Taiwan', code: 'TW', capital: 'Taipei', region: 'Asia' }],
    '960': [{ name: 'Maldives', code: 'MV', capital: 'Malé', region: 'Asia' }],
    '961': [{ name: 'Lebanon', code: 'LB', capital: 'Beirut', region: 'Asia' }],
    '962': [{ name: 'Jordan', code: 'JO', capital: 'Amman', region: 'Asia' }],
    '963': [{ name: 'Syria', code: 'SY', capital: 'Damascus', region: 'Asia' }],
    '964': [{ name: 'Iraq', code: 'IQ', capital: 'Baghdad', region: 'Asia' }],
    '965': [{ name: 'Kuwait', code: 'KW', capital: 'Kuwait City', region: 'Asia' }],
    '966': [{ name: 'Saudi Arabia', code: 'SA', capital: 'Riyadh', region: 'Asia' }],
    '967': [{ name: 'Yemen', code: 'YE', capital: "Sana'a", region: 'Asia' }],
    '968': [{ name: 'Oman', code: 'OM', capital: 'Muscat', region: 'Asia' }],
    '970': [{ name: 'Palestine', code: 'PS', capital: 'Ramallah', region: 'Asia' }],
    '971': [{ name: 'United Arab Emirates', code: 'AE', capital: 'Abu Dhabi', region: 'Asia' }],
    '972': [{ name: 'Israel', code: 'IL', capital: 'Jerusalem', region: 'Asia' }],
    '973': [{ name: 'Bahrain', code: 'BH', capital: 'Manama', region: 'Asia' }],
    '974': [{ name: 'Qatar', code: 'QA', capital: 'Doha', region: 'Asia' }],
    '975': [{ name: 'Bhutan', code: 'BT', capital: 'Thimphu', region: 'Asia' }],
    '976': [{ name: 'Mongolia', code: 'MN', capital: 'Ulaanbaatar', region: 'Asia' }],
    '977': [{ name: 'Nepal', code: 'NP', capital: 'Kathmandu', region: 'Asia' }],
    '992': [{ name: 'Tajikistan', code: 'TJ', capital: 'Dushanbe', region: 'Asia' }],
    '993': [{ name: 'Turkmenistan', code: 'TM', capital: 'Ashgabat', region: 'Asia' }],
    '994': [{ name: 'Azerbaijan', code: 'AZ', capital: 'Baku', region: 'Asia' }],
    '995': [{ name: 'Georgia', code: 'GE', capital: 'Tbilisi', region: 'Asia' }],
    '996': [{ name: 'Kyrgyzstan', code: 'KG', capital: 'Bishkek', region: 'Asia' }],
    '998': [{ name: 'Uzbekistan', code: 'UZ', capital: 'Tashkent', region: 'Asia' }],

    // Europe
    '30': [{ name: 'Greece', code: 'GR', capital: 'Athens', region: 'Europe' }],
    '31': [{ name: 'Netherlands', code: 'NL', capital: 'Amsterdam', region: 'Europe' }],
    '32': [{ name: 'Belgium', code: 'BE', capital: 'Brussels', region: 'Europe' }],
    '33': [{ name: 'France', code: 'FR', capital: 'Paris', region: 'Europe' }],
    '34': [{ name: 'Spain', code: 'ES', capital: 'Madrid', region: 'Europe' }],
    '36': [{ name: 'Hungary', code: 'HU', capital: 'Budapest', region: 'Europe' }],
    '39': [{ name: 'Italy', code: 'IT', capital: 'Rome', region: 'Europe' }],
    '40': [{ name: 'Romania', code: 'RO', capital: 'Bucharest', region: 'Europe' }],
    '41': [{ name: 'Switzerland', code: 'CH', capital: 'Bern', region: 'Europe' }],
    '43': [{ name: 'Austria', code: 'AT', capital: 'Vienna', region: 'Europe' }],
    '44': [{ name: 'United Kingdom', code: 'GB', capital: 'London', region: 'Europe' }],
    '45': [{ name: 'Denmark', code: 'DK', capital: 'Copenhagen', region: 'Europe' }],
    '46': [{ name: 'Sweden', code: 'SE', capital: 'Stockholm', region: 'Europe' }],
    '47': [{ name: 'Norway', code: 'NO', capital: 'Oslo', region: 'Europe' }],
    '48': [{ name: 'Poland', code: 'PL', capital: 'Warsaw', region: 'Europe' }],
    '49': [{ name: 'Germany', code: 'DE', capital: 'Berlin', region: 'Europe' }],
    '7': [
        { name: 'Russia', code: 'RU', capital: 'Moscow', region: 'Europe/Asia' },
        { name: 'Kazakhstan', code: 'KZ', capital: 'Nur-Sultan', region: 'Asia' }
    ]
};

module.exports = async function checkcountryCommand(sock, chatId, message, args = []) {
    try {
        // Get the code from message
        const text = message.message?.conversation?.trim() ||
                     message.message?.extendedTextMessage?.text?.trim() ||
                     '';
        
        let code;
        if (args.length > 0) {
            code = args[0].trim();
        } else {
            const parts = text.split(' ').slice(1);
            code = parts[0] || '';
        }
        
        // Check if code is provided
        if (!code) {
            const helpText = `
╭─❖ *🌍 COUNTRY CODE CHECKER* ❖─
│
├─ *Usage:* .check <code>
├─ *Examples:*
│  ├─ .check 254  (Kenya) 🇰🇪
│  ├─ .check 1    (USA/Canada)
│  ├─ .check 44   (UK)
│  ├─ .check 91   (India)
│  ├─ .check 263  (Zimbabwe)
│  └─ .check 49   (Germany)
│
├─ *You can check:*
│  ├─ Country calling codes
│  ├─ Country information
│  ├─ Multiple countries with same code
│  └─ Flag emojis
│
├─ *Note:* 
│  Enter code without '+' sign
│  or with '+' sign, both work
│
╰─➤ _Check any country calling code_
            `.trim();
            
            await sock.sendMessage(chatId, {
                text: helpText,
                contextInfo: { forwardingScore: 999, isForwarded: true }
            }, { quoted: message });
            return;
        }
        
        // Remove '+' sign if present
        code = code.replace(/\+/g, '').trim();
        
        // Validate code (should be numeric)
        if (!/^\d+$/.test(code)) {
            await sock.sendMessage(chatId, {
                text: '*❌ Invalid country code*\nCountry code should contain only numbers.\n\nExample: `.check 254` for Kenya',
                contextInfo: { forwardingScore: 999, isForwarded: true }
            }, { quoted: message });
            return;
        }
        
        // Send processing message
        await sock.sendMessage(chatId, {
            text: `*🌍 Checking code +${code}...*`,
            contextInfo: { forwardingScore: 999, isForwarded: true }
        }, { quoted: message });
        
        // Try to get from API first
        let matchingCountries = [];
        
        try {
            // Try REST Countries API
            const response = await axios.get('https://restcountries.com/v3.1/all', {
                timeout: 10000
            });
            
            const allCountries = response.data;
            
            // Search for countries with this calling code
            for (const country of allCountries) {
                if (country.idd && country.idd.root) {
                    const root = country.idd.root.replace('+', '');
                    const suffixes = country.idd.suffixes || [];
                    
                    if (code === root) {
                        matchingCountries.push({
                            name: country.name?.common || 'Unknown',
                            code: country.cca2,
                            capital: country.capital?.[0] || 'N/A',
                            region: country.region || 'Unknown',
                            population: country.population || 0,
                            area: country.area || 0,
                            currencies: country.currencies ? 
                                Object.values(country.currencies).map(c => c.name).join(', ') : 'N/A',
                            languages: country.languages ?
                                Object.values(country.languages).join(', ') : 'N/A'
                        });
                    } else if (suffixes.length > 0) {
                        for (const suffix of suffixes) {
                            if (suffix && code === root + suffix) {
                                matchingCountries.push({
                                    name: country.name?.common || 'Unknown',
                                    code: country.cca2,
                                    capital: country.capital?.[0] || 'N/A',
                                    region: country.region || 'Unknown',
                                    population: country.population || 0,
                                    area: country.area || 0,
                                    currencies: country.currencies ? 
                                        Object.values(country.currencies).map(c => c.name).join(', ') : 'N/A',
                                    languages: country.languages ?
                                        Object.values(country.languages).join(', ') : 'N/A'
                                });
                                break;
                            }
                        }
                    }
                }
            }
        } catch (apiError) {
            console.log('API failed, using local database:', apiError.message);
        }
        
        // If API returned no results or failed, use local database
        if (matchingCountries.length === 0 && COUNTRY_CODES_DB[code]) {
            matchingCountries = COUNTRY_CODES_DB[code];
        }
        
        // Handle results
        if (matchingCountries.length > 0) {
            // Format results
            const results = [];
            
            for (const country of matchingCountries) {
                const flag = getFlagEmoji(country.code);
                
                const countryInfo = `
${flag} *${country.name}* (${country.code})
├─ 📞 *Calling Code:* +${code}
├─ 🏛️ *Capital:* ${country.capital}
├─ 🌍 *Region:* ${country.region}
${country.population ? `├─ 👥 *Population:* ${new Intl.NumberFormat().format(country.population)}` : ''}
${country.area ? `├─ 📏 *Area:* ${new Intl.NumberFormat().format(country.area)} km²` : ''}
${country.currencies && country.currencies !== 'N/A' ? `├─ 💰 *Currency:* ${country.currencies}` : ''}
${country.languages && country.languages !== 'N/A' ? `└─ 🗣️ *Languages:* ${country.languages}` : ''}
                `.trim();
                
                results.push(countryInfo);
            }
            
            const resultText = `
╭─❖ *COUNTRY CODE RESULTS* ❖─
│
│ 📞 *Country Code:* +${code}
│ 🔍 *Found:* ${matchingCountries.length} countr${matchingCountries.length === 1 ? 'y' : 'ies'}
│
${results.map((r, i) => `${i === results.length - 1 ? '└─' : '├─'}\n${r}`).join('\n')}
│
╰─➤ _Code +${code} information_
            `.trim();
            
            await sock.sendMessage(chatId, {
                text: resultText,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363420656466131@newsletter',
                        newsletterName: 'Country Code Checker',
                        serverMessageId: 150
                    }
                }
            }, { quoted: message });
            
            // Add success reaction
            await sock.sendMessage(chatId, {
                react: { text: '✅', key: message.key }
            });
            
        } else {
            // No matches found
            const suggestedCodes = [
                { code: '254', country: 'Kenya' },
                { code: '1', country: 'USA/Canada' },
                { code: '44', country: 'UK' },
                { code: '91', country: 'India' },
                { code: '86', country: 'China' },
                { code: '49', country: 'Germany' },
                { code: '33', country: 'France' },
                { code: '61', country: 'Australia' }
            ];
            
            const suggestions = suggestedCodes.map(c => `├─ ${c.code} - ${c.country}`).join('\n');
            
            await sock.sendMessage(chatId, {
                text: `*❌ No country found for code +${code}*\n\n📋 *Try these common codes:*\n${suggestions}\n\n*Note:* Code +${code} may not exist or is not in our database.`,
                contextInfo: { forwardingScore: 999, isForwarded: true }
            }, { quoted: message });
            
            await sock.sendMessage(chatId, {
                react: { text: '❌', key: message.key }
            });
        }
        
    } catch (error) {
        console.error('Checkcountry command error:', error);
        
        await sock.sendMessage(chatId, {
            text: `*❌ Command Error*\n${error.message}\n\nTry: .check 254 (for Kenya)`,
            contextInfo: { forwardingScore: 999, isForwarded: true }
        }, { quoted: message });
        
        await sock.sendMessage(chatId, {
            react: { text: '❌', key: message.key }
        });
    }
};