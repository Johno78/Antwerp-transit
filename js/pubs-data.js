// Walk times are estimates from the hotel (about 80 m/min, allowing for street layout).
// Opening hours and ratings change, so each card links to Google Maps for the live details.
const PUBS=[
{n:'Clock (The Cafe)',a:'Pelikaanstraat 134',w:3,z:'near',t:['local'],d:'Plain local bar almost opposite the station. The nearest pint to the hotel.'},
{n:'Bier Central',a:'De Keyserlei 25',w:7,z:'near',t:['beer'],d:'Huge Belgian beer list plus food, on the main street between the station and the old town.'},
{n:"Kelly's Antwerp",a:'De Keyserlei 27',w:7,z:'near',t:['sport'],d:'Big sports bar next door to Bier Central. Easy choice for a match or a late one.'},
{n:'De Kroon Van Hopland',a:'Hopland 67',w:9,z:'near',t:['beer','local'],d:'Cosy local bar that brews its own IPA. A good stop on the way into town.'},
{n:'Oud Arsenaal',a:'Maria Pijpelincxstraat 4',w:13,z:'near',t:['local'],d:'Traditional brown cafe with unusual specials. Not open every day, so check before you go.'},
{n:'Beerlovers Bar',a:'Rotterdamstraat 105',w:14,z:'near',t:['beer'],d:'Craft beer bar with a rotating tap list and vinyl. Closed Tuesdays.'},
{n:'De Muze',a:'Melkmarkt 15',w:23,z:'old',t:['music'],d:'Multi-level jazz cafe with live music most evenings. Gets busy, so arrive early for a seat.'},
{n:'Pelikaan',a:'Melkmarkt 14',w:23,z:'old',t:['local'],d:'Neighbourhood bar in the middle of the tourist area. Right opposite De Muze.'},
{n:"Billie's",a:'Kammenstraat 12',w:24,z:'old',t:['beer'],d:'Craft beer gastropub with bar food. Closed Tuesdays.'},
{n:'Paters Vaetje',a:'Blauwmoezelstraat 1',w:25,z:'old',t:['beer','local'],d:'Small two-floor Belgian beer pub facing the cathedral. A classic.'},
{n:"Syd's",a:'Grote Markt 19',w:26,z:'old',t:['sport','darts'],d:'Modern beer bar on the Grote Markt with screens for sport. Reviews mention a dart board.'},
{n:'The Irish Times Pub',a:'Grote Markt 38',w:26,z:'old',t:['sport','darts'],d:'Irish pub with Guinness, live music and karaoke nights. Reviews mention darts.'},
{n:'Cafe Den Engel',a:'Grote Markt 3',w:27,z:'old',t:['local'],d:'Old-style pub right by the Brabo fountain with views over the square.'}
];
