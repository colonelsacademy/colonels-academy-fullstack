// src/data/mockQuestions.ts

export interface Question {
  id: number;
  text: string;
  options: string[];
  answer: string; // "A" | "B" | "C" | "D" | "E"
  explanation: string;
  isImage?: boolean;
  imageIndex?: number;
}

export const optionLetters = ["A", "B", "C", "D", "E"];

export const questions: Question[] = [
  {
    id: 1,
    text: "If MAN is coded as 13114, CAT is coded as:",
    options: ["3040", "3132", "1735", "3120"],
    answer: "D",
    explanation: "Position of letters: C=3, A=1, T=20 → 3120"
  },
  {
    id: 2,
    text: "Which pair of words does not fit in the group?",
    options: ["rifle and round", "rocket and launcher", "gun and shell", "tank and gun"],
    answer: "C",
    explanation:
      "Rifle/round, rocket/launcher are weapon + ammo pairs. Gun and shell also fit — but 'tank and gun' doesn't follow the same pattern. The odd pair is gun and shell (gun fires shells, not specifically 'shell' ammo type)."
  },
  {
    id: 3,
    text: "1/5 ÷ 1/5 ÷ 1/5 ÷ 1/5 ÷ 1/5 = ?",
    options: ["1/5", "125", "5", "1/125"],
    answer: "B",
    explanation: "Step by step: 1÷1÷1÷1÷(1/5) = 5 → continuing gives 125."
  },
  {
    id: 4,
    text: "Find the value of 'R'",
    isImage: true,
    imageIndex: 0,
    options: ["5", "6", "8", "9"],
    answer: "D",
    explanation:
      "Pattern: top number = bottom-left + bottom-right − something. R = 49 + 32 − 72 = 9."
  },
  {
    id: 5,
    text: "Which is related with 6 – 19 – 45",
    options: ["5 – 11 – 23", "5 – 18 – 44", "4 – 13 – 31", "1 – 3 – 7"],
    answer: "B",
    explanation: "The pattern is +13, +26 (doubling). 5+13=18, 18+26=44."
  },
  {
    id: 6,
    text: "Insert the Missing number.",
    isImage: true,
    imageIndex: 1,
    options: ["158", "238", "248", "328"],
    answer: "B",
    explanation: "13×2+2=28, 28×2+2=58, 58×2+2=118, 118×2+2=238."
  },
  {
    id: 7,
    text: "1503 + 1812 + 2113 + 9999 + 8888 = ?",
    options: ["24226", "24427", "24328", "24315"],
    answer: "D",
    explanation: "1503+1812+2113+9999+8888 = 24315."
  },
  {
    id: 8,
    text: "A tank is half filled. If you add 18 liters of oil, it will be 2/3rd filled. What is the capacity of the tank?",
    options: ["66 ltrs", "96 ltrs", "108 ltrs", "112 ltrs"],
    answer: "C",
    explanation: "x/2 + 18 = 2x/3 → 18 = x(2/3 − 1/2) = x/6 → x = 108 liters."
  },
  {
    id: 9,
    text: "In a certain code 'MANIFESTO' is written as 'OUTFGJOBN'. By the same code how is 'ELECTION' written?",
    options: ["ENPDUMOR", "NPJUDFMF", "MFEJDJOE", "NFPELUPN"],
    answer: "B",
    explanation: "Reverse the letters and write one step forward for each except the first."
  },
  {
    id: 10,
    text: "What number comes next? 0, 1, 4, 9, 10, 13, 18, 19, ?",
    options: ["22", "25", "19"],
    answer: "A",
    explanation: "Pattern repeats: +1, +3, +5, +1, +3, +5… So 19+3=22."
  },
  {
    id: 11,
    text: "Rearrange the following letters to make name of a country: STPAINKA",
    options: ["AFGHANISTAN", "NEPAL", "PAKISTAN", "INDIA"],
    answer: "C",
    explanation: "STPAINKA rearranged = PAKISTAN."
  },
  {
    id: 12,
    text: "Which number comes next in the series? 50, 40, 55, 43, 60, ?",
    options: ["42", "46", "47", "48", "52"],
    answer: "B",
    explanation: "Two interleaved series: 50,55,60 (+5) and 40,43,46 (+3). Next is 46."
  },
  {
    id: 13,
    text: "5³ + 4³ + 100² = ?",
    options: ["227", "1027", "10189", "1289"],
    answer: "C",
    explanation: "125 + 64 + 10000 = 10189."
  },
  {
    id: 14,
    text: "Find the odd one out.",
    options: ["Witness", "Court", "Persecutor", "Lawyer"],
    answer: "B",
    explanation: "Witness, Persecutor, and Lawyer are people. Court is a place."
  },
  {
    id: 15,
    text: "According to a certain code 'PATIENT' is coded as 'RNVKGPV'. By the same code how is 'NEPAL' coded?",
    options: ["OFQBM", "LAPEN", "MDRZK", "PGRCN"],
    answer: "D",
    explanation: "Each letter moves +2 positions forward in the alphabet."
  },
  {
    id: 16,
    text: "Find the odd one out.",
    options: ["UAE", "UK", "SPAIN", "UKRAINE"],
    answer: "C",
    explanation: "UAE, UK, UKRAINE all start with 'U'. Spain does not."
  },
  {
    id: 17,
    text: "How many triangles are there in the Figure below?",
    isImage: true,
    imageIndex: 2,
    options: ["7", "8", "9", "11", "12"],
    answer: "D",
    explanation: "Counting all triangles including overlapping combinations = 11."
  },
  {
    id: 18,
    text: "Rearrange the following letters and make the capital city of an African country: ASASHIKN",
    options: ["KINSHASA", "KIGALI", "KHARTOUM", "NAIROBI"],
    answer: "A",
    explanation: "ASASHIKN rearranged = KINSHASA (capital of DR Congo)."
  },
  {
    id: 19,
    text: "Which comes last in the Dictionary?",
    options: ["Overleaf", "Overleap", "Overdue", "Overdose"],
    answer: "B",
    explanation: "Alphabetical order: Overdose, Overdue, Overleaf, Overleap."
  },
  {
    id: 20,
    text: "What comes next in the sequence?",
    isImage: true,
    imageIndex: 3,
    options: ["a", "b", "c", "d"],
    answer: "B",
    explanation: "The pattern shows rotating/shifting squares. Option b follows the sequence."
  },
  {
    id: 21,
    text: "Coal is to engine as Wax is to ____________?",
    options: ["Torch", "Lamp", "Candle", "Bulb"],
    answer: "C",
    explanation: "Coal fuels an engine; wax is the fuel/material of a candle."
  },
  {
    id: 22,
    text: "Choose the word which is almost the OPPOSITE in meaning to 'NEFARIOUS'",
    options: ["Harmful", "Furious", "Noble", "Ugly"],
    answer: "C",
    explanation: "Nefarious means wicked/criminal. Its antonym is Noble."
  },
  {
    id: 23,
    text: "Which animal is known for its longest jump?",
    options: ["Lion", "Leopard", "Tiger", "Kangaroo"],
    answer: "D",
    explanation: "Kangaroos can leap up to 9 meters in a single bound."
  },
  {
    id: 24,
    text: "'Malaria' is to 'mosquito' as 'rumour' is to _______________?",
    options: ["Stories", "Gossips", "Exaggeration", "Scandal"],
    answer: "B",
    explanation: "Malaria is transmitted by mosquitoes; rumors are spread by gossip."
  },
  {
    id: 25,
    text: "Find the odd one out.",
    options: ["CA", "KI", "SQ", "VX"],
    answer: "D",
    explanation: "CA, KI, SQ are all descending (backward) letter pairs. VX is ascending."
  },
  {
    id: 26,
    text: "Find the missing number in the series: 64, 125, 187, ________?",
    options: ["250", "263", "313", "343"],
    answer: "A",
    explanation: "Differences: +61, +62, +63… so 187+63=250."
  },
  {
    id: 27,
    text: "Choose correct number to fill in the series.",
    isImage: true,
    imageIndex: 4,
    options: ["280", "3082", "6012", "6561"],
    answer: "D",
    explanation: "Row 1: 2,4,16,256 (each number squared). Row 2: 3,9,81,6561 (3⁸=6561)."
  },
  {
    id: 28,
    text: "Choose the correct word to fill in the blank: 'An honest man is liked and _______________ by everyone.'",
    options: ["response", "respect", "responsible", "respected"],
    answer: "D",
    explanation: "'Respected' is the correct passive verb form here."
  },
  {
    id: 29,
    text: "If 'PAINT' is coded as 74128 and 'EXCEL' is coded as 93596, then correct encode of 'ACCEPT' is:",
    options: ["735961", "554978", "455978", "457978"],
    answer: "C",
    explanation: "From keys: A=4,C=5,C=5,E=9,P=7,T=8 → 455978."
  },
  {
    id: 30,
    text: "If Ram is taller than Shyam, and Hari is also taller than Shyam, then:",
    options: [
      "Shyam is the tallest.",
      "Ram is the tallest.",
      "Hari is the tallest.",
      "It cannot be concluded from the above statement who is the tallest."
    ],
    answer: "D",
    explanation: "Ram>Shyam and Hari>Shyam, but no info about Ram vs Hari."
  },
  {
    id: 31,
    text: "If a watch delays 4 minutes in 24 hours, how much does that watch delay in one hour?",
    options: ["4 sec", "6 sec", "10 sec", "15 sec"],
    answer: "C",
    explanation: "4 min = 240 sec in 24 hours → 240÷24 = 10 seconds per hour."
  },
  {
    id: 32,
    text: "Six persons A, B, C, D, E and F are standing in a circle. A is between E and D; F is to the left of D, and B is in between F and C. Who is in between A and F?",
    options: ["B", "C", "D", "E"],
    answer: "C",
    explanation: "Circular arrangement: E-A-D-F-B-C. So D is between A and F."
  },
  {
    id: 33,
    text: "Which number comes next? 9, 18, 36, ?, 144",
    options: ["48", "54", "72", "74"],
    answer: "C",
    explanation: "Pattern: ×2 each time. 36×2=72."
  },
  {
    id: 34,
    text: "Which word CANNOT be formed from 'INTERNATIONAL'?",
    options: ["Nation", "Ration", "Internal", "Centre"],
    answer: "D",
    explanation: "INTERNATIONAL has no letter C, so CENTRE cannot be formed."
  },
  {
    id: 35,
    text: "How many triangles are there in the following figure?",
    isImage: true,
    imageIndex: 5,
    options: ["5", "6", "8", "12"],
    answer: "D",
    explanation: "All triangles including combined = 12."
  },
  {
    id: 36,
    text: "If A stands for 1, B stands for 2, and so on, then L + M = ?",
    options: ["16", "25", "24", "28"],
    answer: "B",
    explanation: "L=12, M=13; 12+13=25."
  },
  {
    id: 37,
    text: "West is to North East as South is to _________________",
    options: ["North", "South East", "North West", "South West"],
    answer: "C",
    explanation:
      "West is opposite East; going clockwise 90° from West gives NorthEast. Same logic: South → NorthWest."
  },
  {
    id: 38,
    text: "In general, a man's character can be easily judged by:",
    options: [
      "his outward appearance",
      "His family background",
      "His associates",
      "His wealth",
      "His actions"
    ],
    answer: "E",
    explanation: "Actions are the truest and most reliable reflection of character."
  },
  {
    id: 39,
    text: "Find the missing number: A, 5, C, 7, F, 10, J, ?, O, 19",
    options: ["12", "14", "15", "16"],
    answer: "B",
    explanation: "Letters skip +2,+3,+4,+5 positions; numbers follow +2,+3,+4,+5 pattern → 14."
  },
  {
    id: 40,
    text: "Insert the missing number: 36, 28, 24, 22, ___________?",
    options: ["21", "22", "20", "1"],
    answer: "A",
    explanation: "Pattern: −8, −4, −2, −1. So 22−1=21."
  },
  {
    id: 41,
    text: "The value of 91² is __________?",
    options: ["8431", "8281", "8241", "8181"],
    answer: "B",
    explanation: "91²=(90+1)²=8100+180+1=8281."
  },
  {
    id: 42,
    text: "Find the odd one out.",
    isImage: true,
    imageIndex: 6,
    options: ["a", "b", "c", "d", "e"],
    answer: "A",
    explanation: "Option (a) is the odd one out based on symmetry/position of the square."
  },
  {
    id: 43,
    text: "If A, B, C is coded as 26, 25, 24. By the same code how is XYZ coded?",
    options: ["1, 2, 3", "3, 2, 1", "2, 3, 1", "3, 1, 2"],
    answer: "B",
    explanation: "Backward position: A=26, B=25… X=3, Y=2, Z=1."
  },
  {
    id: 44,
    text: "Which comes next in the series? AB, YZ, CD, WX, ______________?",
    options: ["CD", "EF", "YZ", "UV"],
    answer: "B",
    explanation: "Two interleaved series: AB,CD,EF… and YZ,WX,UV…"
  },
  {
    id: 45,
    text: "Find the missing number.",
    isImage: true,
    imageIndex: 7,
    options: ["10", "12", "11", "13"],
    answer: "B",
    explanation: "Left: 5+6+9=20, top=10. Right: 7+8+9=24, top=12."
  },
  {
    id: 46,
    text: "Ramesh will be 4 times as old in 30 years as he is now. How old is Ramesh now?",
    options: ["34 years", "30 years", "26 years", "10 years"],
    answer: "D",
    explanation: "x+30=4x → 30=3x → x=10 years."
  },
  {
    id: 47,
    text: "IRON is to metal as BARLEY is to:",
    options: ["Food", "Meal", "Cereal", "Wheat"],
    answer: "C",
    explanation: "Iron is a type of metal; barley is a type of cereal."
  },
  {
    id: 48,
    text: "What is that which is one in a MAN and WOMAN, twice in an INFANT but never in a BOY or GIRL?",
    options: ["A", "M", "N", "Q"],
    answer: "C",
    explanation: "Letter N: MAN=1, WOMAN=1, INFANT=2, BOY=0, GIRL=0."
  },
  {
    id: 49,
    text: "Kusum walks 9 km due East and then 12 km due South. How far is she from the starting point?",
    options: ["20 km", "18 km", "15 km", "10 km"],
    answer: "C",
    explanation: "√(9²+12²)=√(81+144)=√225=15 km."
  },
  {
    id: 50,
    text: "What is that which occurs once on TUESDAY, twice on WEDNESDAY but never in other weekdays?",
    options: ["Y", "E", "A", "D"],
    answer: "B",
    explanation: "E: TUESDAY has 1 E, WEDNESDAY has 2 E's, others have 0."
  },
  {
    id: 51,
    text: "If 4=0, 5=5, 6=12, 7=21 then 8=?",
    options: ["24", "32", "16", "20"],
    answer: "B",
    explanation: "Pattern: n×(n−4). 8×(8−4)=8×4=32."
  },
  {
    id: 52,
    text: "Insert the missing number.",
    isImage: true,
    imageIndex: 8,
    options: ["11", "12", "10", "9"],
    answer: "C",
    explanation: "Sum of row 1 = sum of row 2 in each pair. Missing = 10."
  },
  {
    id: 53,
    text: "Fill in the blanks with a single word: ……SHIP / ……LY / ……LINESS",
    options: ["Friend", "Work", "Intern", "Wealth"],
    answer: "A",
    explanation: "FRIENDSHIP, FRIENDLY, FRIENDLINESS — all use 'Friend'."
  },
  {
    id: 54,
    text: "What is the missing number?",
    isImage: true,
    imageIndex: 9,
    options: ["1", "2", "5", "8"],
    answer: "B",
    explanation: "2a=16→a=8; a+b=10→b=2. Missing number = 2."
  },
  {
    id: 55,
    text: "EPISODE is to STORY then SKELETON is to?",
    options: ["Bones", "Doctor", "Body", "Biology"],
    answer: "C",
    explanation: "An episode is part of a story; a skeleton is part of the body."
  },
  {
    id: 56,
    text: "Which is the biggest fraction?",
    options: ["1/2", "2/3", "3/4", "4/5"],
    answer: "D",
    explanation: "4/5=0.8 > 3/4=0.75 > 2/3=0.667 > 1/2=0.5."
  },
  {
    id: 57,
    text: "In the figure given below, ∠RST=120°, ∠RSQ=92° and ∠PST=70°. How many degrees is ∠PSQ?",
    isImage: true,
    imageIndex: 10,
    options: ["40°", "42°", "45°", "48°"],
    answer: "B",
    explanation: "∠PSQ = ∠PST + ∠RST − ∠RSQ − ∠RST = 70+120−92−56 = 42°."
  },
  {
    id: 58,
    text: "Hong Kong is related to China as Vatican City is related to?",
    options: ["Canada", "Mexico", "America", "Italy"],
    answer: "D",
    explanation: "Vatican City is an independent city-state enclaved within Rome, Italy."
  },
  {
    id: 59,
    text: "Choose the alternative word which has OPPOSITE meaning to 'INCREMENT'",
    options: ["Distortion", "Excrement", "Decrease", "Embrace"],
    answer: "C",
    explanation: "Increment means increase; its antonym is Decrease."
  },
  {
    id: 60,
    text: "Find the odd one out.",
    options: ["Buff", "Mutton", "Curry", "Lamb", "Pork"],
    answer: "C",
    explanation: "Buff, Mutton, Lamb, Pork are all non-veg meats. Curry is a dish/spice."
  }
];

export const TOTAL_QUESTIONS = questions.length;
export const FULL_MARKS = TOTAL_QUESTIONS;
export const PASS_MARK_SCORE = 24;
export const TOTAL_TIME_SECONDS = 30 * 60; // 30 minutes
