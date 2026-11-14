type GeologicalRank = "Eons" | "Eras" | "Periods" | "Epochs" | "Ages";
type GeologicalColor = "red" | "coral" | "amber" | "blue" | "sage";
type GeologicalUnit = readonly [name: string, rank: GeologicalRank, olderMa: number, youngerMa: number, color: GeologicalColor];
const CURRENT_YEAR = new Date().getUTCFullYear();

const geologicalUnits: GeologicalUnit[] = [
	// EONS
	["Hadean", "Eons", 4567, 4031, "red"],
	["Archean", "Eons", 4031, 2500, "red"],
	["Proterozoic", "Eons", 2500, 538.8, "red"],
	["Phanerozoic", "Eons", 538.8, 0, "red"],

	// ERAS
	["Eoarchean", "Eras", 4031, 3600, "coral"],
	["Paleoarchean", "Eras", 3600, 3200, "coral"],
	["Mesoarchean", "Eras", 3200, 2800, "coral"],
	["Neoarchean", "Eras", 2800, 2500, "coral"],
	["Paleoproterozoic", "Eras", 2500, 1600, "coral"],
	["Mesoproterozoic", "Eras", 1600, 1000, "coral"],
	["Neoproterozoic", "Eras", 1000, 538.8, "coral"],
	["Paleozoic", "Eras", 538.8, 251.902, "coral"],
	["Mesozoic", "Eras", 251.902, 66, "coral"],
	["Cenozoic", "Eras", 66, 0, "coral"],

	// PERIODS
	["Siderian", "Periods", 2500, 2300, "amber"],
	["Rhyacian", "Periods", 2300, 2050, "amber"],
	["Orosirian", "Periods", 2050, 1800, "amber"],
	["Statherian", "Periods", 1800, 1600, "amber"],
	["Calymmian", "Periods", 1600, 1400, "amber"],
	["Ectasian", "Periods", 1400, 1200, "amber"],
	["Stenian", "Periods", 1200, 1000, "amber"],
	["Tonian", "Periods", 1000, 720, "amber"],
	["Cryogenian", "Periods", 720, 635, "amber"],
	["Ediacaran", "Periods", 635, 538.8, "amber"],
	["Cambrian", "Periods", 538.8, 485.4, "amber"],
	["Ordovician", "Periods", 485.4, 443.8, "amber"],
	["Silurian", "Periods", 443.8, 419.2, "amber"],
	["Devonian", "Periods", 419.2, 358.86, "amber"],
	["Carboniferous", "Periods", 358.86, 298.9, "amber"],
	["Permian", "Periods", 298.9, 251.902, "amber"],
	["Triassic", "Periods", 251.902, 201.4, "amber"],
	["Jurassic", "Periods", 201.4, 143.1, "amber"],
	["Cretaceous", "Periods", 143.1, 66, "amber"],
	["Paleogene", "Periods", 66, 23.03, "amber"],
	["Neogene", "Periods", 23.03, 2.58, "amber"],
	["Quaternary", "Periods", 2.58, 0, "amber"],

	// EPOCHS
	["Terreneuvian", "Epochs", 538.8, 521, "blue"],
	["Series 2", "Epochs", 521, 506.5, "blue"],
	["Miaolingian", "Epochs", 506.5, 497, "blue"],
	["Furongian", "Epochs", 497, 485.4, "blue"],
	["Lower Ordovician", "Epochs", 485.4, 470, "blue"],
	["Middle Ordovician", "Epochs", 470, 458.2, "blue"],
	["Upper Ordovician", "Epochs", 458.2, 443.8, "blue"],
	["Llandovery", "Epochs", 443.8, 433.4, "blue"],
	["Wenlock", "Epochs", 433.4, 427.4, "blue"],
	["Ludlow", "Epochs", 427.4, 423, "blue"],
	["Pridoli", "Epochs", 423, 419.2, "blue"],
	["Lower Devonian", "Epochs", 419.2, 393.3, "blue"],
	["Middle Devonian", "Epochs", 393.3, 382.7, "blue"],
	["Upper Devonian", "Epochs", 382.7, 358.86, "blue"],
	["Mississippian", "Epochs", 358.86, 323.2, "blue"],
	["Pennsylvanian", "Epochs", 323.2, 298.9, "blue"],
	["Cisuralian", "Epochs", 298.9, 272.95, "blue"],
	["Guadalupian", "Epochs", 272.95, 259.51, "blue"],
	["Lopingian", "Epochs", 259.51, 251.902, "blue"],
	["Lower Triassic", "Epochs", 251.902, 247.2, "blue"],
	["Middle Triassic", "Epochs", 247.2, 237, "blue"],
	["Upper Triassic", "Epochs", 237, 201.4, "blue"],
	["Lower Jurassic", "Epochs", 201.4, 174.7, "blue"],
	["Middle Jurassic", "Epochs", 174.7, 161.5, "blue"],
	["Upper Jurassic", "Epochs", 161.5, 143.1, "blue"],
	["Lower Cretaceous", "Epochs", 143.1, 100.5, "blue"],
	["Upper Cretaceous", "Epochs", 100.5, 66, "blue"],
	["Paleocene", "Epochs", 66, 56, "blue"],
	["Eocene", "Epochs", 56, 33.9, "blue"],
	["Oligocene", "Epochs", 33.9, 23.03, "blue"],
	["Miocene", "Epochs", 23.03, 5.333, "blue"],
	["Pliocene", "Epochs", 5.333, 2.58, "blue"],
	["Pleistocene", "Epochs", 2.58, 0.0117, "blue"],
	["Holocene", "Epochs", 0.0117, 0, "blue"],

	// AGES (FORMAL GEOLOGICAL STAGES)

	// CAMBRIAN
	["Fortunian", "Ages", 538.8, 529, "sage"],
	["Stage 2", "Ages", 529, 521, "sage"],
	["Stage 3", "Ages", 521, 514.5, "sage"],
	["Stage 4", "Ages", 514.5, 506.5, "sage"],
	["Wuliuan", "Ages", 506.5, 504.5, "sage"],
	["Drumian", "Ages", 504.5, 500.5, "sage"],
	["Guzhangian", "Ages", 500.5, 497, "sage"],
	["Paibian", "Ages", 497, 494.2, "sage"],
	["Jiangshanian", "Ages", 494.2, 491, "sage"],
	["Stage 10", "Ages", 491, 485.4, "sage"],

	// ORDOVICIAN
	["Tremadocian", "Ages", 485.4, 477.1, "sage"],
	["Floian", "Ages", 477.1, 471.3, "sage"],
	["Dapingian", "Ages", 471.3, 469.4, "sage"],
	["Darriwilian", "Ages", 469.4, 458.2, "sage"],
	["Sandbian", "Ages", 458.2, 452.8, "sage"],
	["Katian", "Ages", 452.8, 445.2, "sage"],
	["Hirnantian", "Ages", 445.2, 443.8, "sage"],

	// SILURIAN
	["Rhuddanian", "Ages", 443.8, 440.5, "sage"],
	["Aeronian", "Ages", 440.5, 438.6, "sage"],
	["Telychian", "Ages", 438.6, 432.9, "sage"],
	["Sheinwoodian", "Ages", 432.9, 430.6, "sage"],
	["Homerian", "Ages", 430.6, 426.7, "sage"],
	["Gorstian", "Ages", 426.7, 425, "sage"],
	["Ludfordian", "Ages", 425, 422.7, "sage"],

	// DEVONIAN
	["Lochkovian", "Ages", 419.2, 413.02, "sage"],
	["Pragian", "Ages", 413.02, 410.62, "sage"],
	["Emsian", "Ages", 410.62, 393.47, "sage"],
	["Eifelian", "Ages", 393.47, 387.95, "sage"],
	["Givetian", "Ages", 387.95, 382.31, "sage"],
	["Frasnian", "Ages", 382.31, 372.15, "sage"],
	["Famennian", "Ages", 372.15, 358.86, "sage"],

	// CARBONIFEROUS
	["Tournaisian", "Ages", 358.86, 346.7, "sage"],
	["Visean", "Ages", 346.7, 330.3, "sage"],
	["Serpukhovian", "Ages", 330.3, 323.4, "sage"],
	["Bashkirian", "Ages", 323.4, 315.2, "sage"],
	["Moscovian", "Ages", 315.2, 307, "sage"],
	["Kasimovian", "Ages", 307, 303.7, "sage"],
	["Gzhelian", "Ages", 303.7, 298.9, "sage"],

	// PERMIAN
	["Asselian", "Ages", 298.9, 293.52, "sage"],
	["Sakmarian", "Ages", 293.52, 290.1, "sage"],
	["Artinskian", "Ages", 290.1, 283.3, "sage"],
	["Kungurian", "Ages", 283.3, 272.95, "sage"],
	["Roadian", "Ages", 272.95, 266.9, "sage"],
	["Wordian", "Ages", 266.9, 264.28, "sage"],
	["Capitanian", "Ages", 264.28, 259.51, "sage"],
	["Wuchiapingian", "Ages", 259.51, 254.14, "sage"],
	["Changhsingian", "Ages", 254.14, 251.902, "sage"],

	// TRIASSIC
	["Induan", "Ages", 251.902, 249.9, "sage"],
	["Olenekian", "Ages", 249.9, 247.2, "sage"],
	["Anisian", "Ages", 247.2, 241.464, "sage"],
	["Ladinian", "Ages", 241.464, 237, "sage"],
	["Carnian", "Ages", 237, 227, "sage"],
	["Norian", "Ages", 227, 205.7, "sage"],
	["Rhaetian", "Ages", 205.7, 201.4, "sage"],

	// JURASSIC
	["Hettangian", "Ages", 201.4, 199.5, "sage"],
	["Sinemurian", "Ages", 199.5, 192.9, "sage"],
	["Pliensbachian", "Ages", 192.9, 184.2, "sage"],
	["Toarcian", "Ages", 184.2, 174.7, "sage"],
	["Aalenian", "Ages", 174.7, 170.9, "sage"],
	["Bajocian", "Ages", 170.9, 168.2, "sage"],
	["Bathonian", "Ages", 168.2, 165.3, "sage"],
	["Callovian", "Ages", 165.3, 161.5, "sage"],
	["Oxfordian", "Ages", 161.5, 154.8, "sage"],
	["Kimmeridgian", "Ages", 154.8, 149.2, "sage"],
	["Tithonian", "Ages", 149.2, 143.1, "sage"],

	// CRETACEOUS
	["Berriasian", "Ages", 143.1, 137.05, "sage"],
	["Valanginian", "Ages", 137.05, 132.6, "sage"],
	["Hauterivian", "Ages", 132.6, 125.77, "sage"],
	["Barremian", "Ages", 125.77, 121.4, "sage"],
	["Aptian", "Ages", 121.4, 113.2, "sage"],
	["Albian", "Ages", 113.2, 100.5, "sage"],
	["Cenomanian", "Ages", 100.5, 93.9, "sage"],
	["Turonian", "Ages", 93.9, 89.8, "sage"],
	["Coniacian", "Ages", 89.8, 85.7, "sage"],
	["Santonian", "Ages", 85.7, 83.6, "sage"],
	["Campanian", "Ages", 83.6, 72.2, "sage"],
	["Maastrichtian", "Ages", 72.2, 66, "sage"],

	// PALEOGENE
	["Danian", "Ages", 66, 61.66, "sage"],
	["Selandian", "Ages", 61.66, 59.24, "sage"],
	["Thanetian", "Ages", 59.24, 56, "sage"],
	["Ypresian", "Ages", 56, 48.07, "sage"],
	["Lutetian", "Ages", 48.07, 41.03, "sage"],
	["Bartonian", "Ages", 41.03, 37.71, "sage"],
	["Priabonian", "Ages", 37.71, 33.9, "sage"],
	["Rupelian", "Ages", 33.9, 27.3, "sage"],
	["Chattian", "Ages", 27.3, 23.03, "sage"],

	// NEOGENE
	["Aquitanian", "Ages", 23.03, 20.45, "sage"],
	["Burdigalian", "Ages", 20.45, 15.98, "sage"],
	["Langhian", "Ages", 15.98, 13.82, "sage"],
	["Serravallian", "Ages", 13.82, 11.63, "sage"],
	["Tortonian", "Ages", 11.63, 7.246, "sage"],
	["Messinian", "Ages", 7.246, 5.333, "sage"],
	["Zanclean", "Ages", 5.333, 3.6, "sage"],
	["Piacenzian", "Ages", 3.6, 2.58, "sage"],

	// QUATERNARY
	["Gelasian", "Ages", 2.58, 1.8, "sage"],
	["Calabrian", "Ages", 1.8, 0.774, "sage"],
	["Chibanian", "Ages", 0.774, 0.129, "sage"],
	["Upper Pleistocene", "Ages", 0.129, 0.0117, "sage"],
	["sagelandian", "Ages", 0.0117, 0.0082, "sage"],
	["Northgrippian", "Ages", 0.0082, 0.0042, "sage"],
	["Meghalayan", "Ages", 0.0042, 0, "sage"]
];

const geologicalItems = geologicalUnits.map(([name, group, olderMa, youngerMa, color]) => ({
	name,
	group,
	region: "Geologic timescale",
	startYear: -olderMa * 1_000_000,
	endYear: youngerMa === 0 ? CURRENT_YEAR : -youngerMa * 1_000_000,
	color,
}));

const historicalItems = [
  {
    "name": "humanisme",
    "group": "Period",
    "startYear": 1400,
    "endYear": 1600,
    "color": "indigo"
  },
  {
    "name": "Gereformeerde Scholastiek",
    "group": "Period",
    "startYear": 1560,
    "endYear": 1790,
    "color": "lime"
  },
  {
    "name": "Vroege orthodoxie",
    "group": "Period",
    "startYear": 1560,
    "endYear": 1620,
    "color": "lime"
  },
  {
    "name": "Hoge orthodoxie",
    "group": "Period",
    "startYear": 1620,
    "endYear": 1700,
    "color": "lime"
  },
  {
    "name": "Late orthodoxie",
    "group": "Period",
    "startYear": 1700,
    "endYear": 1790,
    "color": "lime"
  },
  {
    "name": "Renaissance",
    "group": "Period",
    "startYear": 1300,
    "endYear": 1600,
    "color": "indigo"
  },
  {
    "name": "Middeleeuwse scholastiek",
    "group": "Period",
    "startYear": 1000,
    "endYear": 1500,
    "color": "orange"
  },
  {
    "name": "Reformatie",
    "group": "Period",
    "startYear": 1500,
    "endYear": 1560,
    "color": "emerald"
  },
  {
    "name": "Leonardo da Vinci",
    "group": "Renaissance en humanisme",
    "startYear": 1452,
    "endYear": 1519,
    "color": "indigo"
  },
  {
    "name": "Erasmus",
    "group": "Renaissance en humanisme",
    "startYear": 1469,
    "endYear": 1539,
    "color": "indigo"
  },
  {
    "name": "Luther",
    "group": "Reformatie",
    "startYear": 1483,
    "endYear": 1546,
    "color": "emerald"
  },
  {
    "name": "Calvijn",
    "group": "Reformatie",
    "startYear": 1509,
    "endYear": 1564,
    "color": "emerald"
  },
  {
    "name": "Zwingli",
    "group": "Reformatie",
    "startYear": 1484,
    "endYear": 1531,
    "color": "emerald"
  },
  {
    "name": "Melanchton",
    "group": "Post-reformatorische theologie",
    "startYear": 1497,
    "endYear": 1560,
    "color": "lime"
  },
  {
    "name": "Beza",
    "group": "Post-reformatorische theologie",
    "startYear": 1520,
    "endYear": 1606,
    "color": "lime"
  },
  {
    "name": "Turretinus",
    "group": "Post-reformatorische theologie",
    "startYear": 1623,
    "endYear": 1687,
    "color": "lime"
  },
  {
    "name": "Van Mastricht",
    "group": "Post-reformatorische theologie",
    "startYear": 1630,
    "endYear": 1706,
    "color": "lime"
  },
  {
    "name": "Voetius",
    "group": "Post-reformatorische theologie",
    "startYear": 1589,
    "endYear": 1676,
    "color": "lime"
  },
  {
    "name": "Bellarminus",
    "group": "Middeleeuwse scholastiek",
    "startYear": 1542,
    "endYear": 1620,
    "color": "orange"
  },
  {
    "name": "Descartes",
    "group": "Moderne filosofie en Verlichting",
    "startYear": 1596,
    "endYear": 1650,
    "color": "orange"
  },
  {
    "name": "Spinoza",
    "group": "Moderne filosofie en Verlichting",
    "startYear": 1632,
    "endYear": 1677,
    "color": "orange"
  },
  {
    "name": "Kant",
    "group": "Moderne filosofie en Verlichting",
    "startYear": 1724,
    "endYear": 1804,
    "color": "orange"
  },
  {
    "name": "Owen",
    "group": "Post-reformatorische theologie",
    "startYear": 1616,
    "endYear": 1684,
    "color": "lime"
  },
  {
    "name": "Molina",
    "group": "Middeleeuwse scholastiek",
    "startYear": 1535,
    "endYear": 1600,
    "color": "orange"
  },
  {
    "name": "Suarez",
    "group": "Middeleeuwse scholastiek",
    "startYear": 1548,
    "endYear": 1617,
    "color": "orange"
  },
  {
    "name": "Cameron",
    "group": "Post-reformatorische theologie",
    "startYear": 1579,
    "endYear": 1625,
    "color": "lime"
  },
  {
    "name": "Coccejus",
    "group": "Post-reformatorische theologie",
    "startYear": 1603,
    "endYear": 1669,
    "color": "lime"
  },
  {
    "name": "De Moor",
    "group": "Post-reformatorische theologie",
    "startYear": 1709,
    "endYear": 1780,
    "color": "lime"
  },
  {
    "name": "A Marck",
    "group": "Post-reformatorische theologie",
    "startYear": 1656,
    "endYear": 1731,
    "color": "lime"
  },
  {
    "name": "Thomas Boston",
    "group": "Post-reformatorische theologie",
    "startYear": 1676,
    "endYear": 1732,
    "color": "lime"
  },
  {
    "name": "Amesius",
    "group": "Post-reformatorische theologie",
    "startYear": 1576,
    "endYear": 1633,
    "color": "lime"
  },
  {
    "name": "Pictetus",
    "group": "Post-reformatorische theologie",
    "startYear": 1655,
    "endYear": 1724,
    "color": "lime"
  },
  {
    "name": "Edwards",
    "group": "Post-reformatorische theologie",
    "startYear": 1703,
    "endYear": 1753,
    "color": "lime"
  },
  {
    "name": "Thomas",
    "group": "Middeleeuwse scholastiek",
    "startYear": 1224,
    "endYear": 1274,
    "color": "orange"
  },
  {
    "name": "Lombardus",
    "group": "Middeleeuwse scholastiek",
    "startYear": 1095,
    "endYear": 1160,
    "color": "orange"
  },
  {
    "name": "Anselmus",
    "group": "Middeleeuwse scholastiek",
    "startYear": 1033,
    "endYear": 1109,
    "color": "orange"
  },
  {
    "name": "Bonaventura",
    "group": "Middeleeuwse scholastiek",
    "startYear": 1221,
    "endYear": 1274,
    "color": "orange"
  },
  {
    "name": "Scotus",
    "group": "Middeleeuwse scholastiek",
    "startYear": 1266,
    "endYear": 1308,
    "color": "orange"
  },
  {
    "name": "Dante",
    "group": "Renaissance en humanisme",
    "startYear": 1265,
    "endYear": 1321,
    "color": "indigo"
  },
  {
    "name": "Ockham",
    "group": "Middeleeuwse scholastiek",
    "startYear": 1285,
    "endYear": 1349,
    "color": "orange"
  },
  {
    "name": "Jansenius",
    "group": "Middeleeuwse scholastiek",
    "startYear": 1585,
    "endYear": 1638,
    "color": "orange"
  },
  {
    "name": "Schleiermacher",
    "group": "Post-reformatorische theologie",
    "startYear": 1768,
    "endYear": 1834,
    "color": "lime"
  },
  {
    "name": "Rousseau",
    "group": "Moderne filosofie en Verlichting",
    "startYear": 1712,
    "endYear": 1778,
    "color": "orange"
  },
  {
    "name": "Voltaire",
    "group": "Moderne filosofie en Verlichting",
    "startYear": 1694,
    "endYear": 1778,
    "color": "orange"
  },
  {
    "name": "Reid",
    "group": "Moderne filosofie en Verlichting",
    "startYear": 1710,
    "endYear": 1796,
    "color": "orange"
  },
  {
    "name": "Hume",
    "group": "Moderne filosofie en Verlichting",
    "startYear": 1711,
    "endYear": 1776,
    "color": "orange"
  },
  {
    "name": "Locke",
    "group": "Moderne filosofie en Verlichting",
    "startYear": 1632,
    "endYear": 1704,
    "color": "orange"
  },
  {
    "name": "Pascal",
    "group": "Moderne filosofie en Verlichting",
    "startYear": 1624,
    "endYear": 1662,
    "color": "orange"
  },
  {
    "name": "Bavinck",
    "group": "Post-reformatorische theologie",
    "startYear": 1854,
    "endYear": 1920,
    "color": "lime"
  },
  {
    "name": "Kuyper",
    "group": "Post-reformatorische theologie",
    "startYear": 1837,
    "endYear": 1920,
    "color": "lime"
  },
  {
    "name": "Hegel",
    "group": "Moderne filosofie en Verlichting",
    "startYear": 1770,
    "endYear": 1831,
    "color": "orange"
  },
  {
    "name": "Hodge",
    "group": "Post-reformatorische theologie",
    "startYear": 1797,
    "endYear": 1878,
    "color": "lime"
  },
  {
    "name": "Warfield",
    "group": "Post-reformatorische theologie",
    "startYear": 1851,
    "endYear": 1921,
    "color": "lime"
  },
  {
    "name": "Alexander",
    "group": "Post-reformatorische theologie",
    "startYear": 1772,
    "endYear": 1878,
    "color": "lime"
  },
  {
    "name": "Hobbes",
    "group": "Moderne filosofie en Verlichting",
    "startYear": 1588,
    "endYear": 1679,
    "color": "orange"
  },
  {
    "name": "Karl Barth",
    "group": "Post-reformatorische theologie",
    "startYear": 1886,
    "endYear": 1968,
    "color": "lime"
  },
  {
    "name": "Berkouwer",
    "group": "Post-reformatorische theologie",
    "startYear": 1902,
    "endYear": 1994,
    "color": "lime"
  },
  {
    "name": "Klaas Schilder",
    "group": "Post-reformatorische theologie",
    "startYear": 1890,
    "endYear": 1952,
    "color": "lime"
  },
  {
    "name": "Schweizer",
    "group": "Post-reformatorische theologie",
    "startYear": 1808,
    "endYear": 1888,
    "color": "lime"
  },
  {
    "name": "Heppe",
    "group": "Post-reformatorische theologie",
    "startYear": 1820,
    "endYear": 1879,
    "color": "lime"
  },
  {
    "name": "Hus",
    "group": "Reformatie",
    "startYear": 1369,
    "endYear": 1415,
    "color": "emerald"
  },
  {
    "name": "Junius",
    "group": "Post-reformatorische theologie",
    "startYear": 1545,
    "endYear": 1602,
    "color": "lime"
  },
  {
    "name": "A Brakel",
    "group": "Post-reformatorische theologie",
    "startYear": 1635,
    "endYear": 1711,
    "color": "lime"
  },
  {
    "name": "Smytegelt",
    "group": "Post-reformatorische theologie",
    "startYear": 1665,
    "endYear": 1739,
    "color": "lime"
  },
  {
    "name": "Van der Groe",
    "group": "Post-reformatorische theologie",
    "startYear": 1705,
    "endYear": 1784,
    "color": "lime"
  },
  {
    "name": "Albertus Magnus",
    "group": "Middeleeuwse scholastiek",
    "startYear": 1206,
    "endYear": 1280,
    "color": "orange"
  },
  {
    "name": "Gomarus",
    "group": "Post-reformatorische theologie",
    "startYear": 1563,
    "endYear": 1641,
    "color": "lime"
  },
  {
    "name": "Arminius",
    "group": "Post-reformatorische theologie",
    "startYear": 1560,
    "endYear": 1609,
    "color": "lime"
  },
  {
    "name": "Abelardus",
    "group": "Middeleeuwse scholastiek",
    "startYear": 1079,
    "endYear": 1142,
    "color": "orange"
  },
  {
    "name": "Socinus",
    "group": "Post-reformatorische theologie",
    "startYear": 1539,
    "endYear": 1604,
    "color": "lime"
  },
  {
    "name": "Amyraldus",
    "group": "Post-reformatorische theologie",
    "startYear": 1596,
    "endYear": 1664,
    "color": "lime"
  },
  {
    "name": "Berkhof",
    "group": "Post-reformatorische theologie",
    "startYear": 1914,
    "endYear": 1995,
    "color": "lime"
  },
  {
    "name": "Noordmans",
    "group": "Post-reformatorische theologie",
    "startYear": 1871,
    "endYear": 1956,
    "color": "lime"
  },
  {
    "name": "Miskotte",
    "group": "Post-reformatorische theologie",
    "startYear": 1894,
    "endYear": 1976,
    "color": "lime"
  },
  {
    "name": "Van Ruler",
    "group": "Post-reformatorische theologie",
    "startYear": 1908,
    "endYear": 1970,
    "color": "lime"
  },
  {
    "name": "Hele Timeline",
    "group": "X",
    "startYear": 0,
    "endYear": CURRENT_YEAR,
    "color": "lime"
  }
];

export const placeholderTasks = [...historicalItems];
