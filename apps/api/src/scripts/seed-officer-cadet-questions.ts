import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface Question {
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: number;
}

const GK_QUESTIONS: Question[] = [
  {
    questionText: "Who is known as the founder of modern Nepal?",
    options: ["Bhimsen Thapa", "Prithvi Narayan Shah", "Jung Bahadur Rana", "Tribhuvan"],
    correctAnswer: "B",
    explanation: "Prithvi Narayan Shah is known as the founder of modern Nepal.",
    difficulty: 1
  },
  {
    questionText: "What is the capital city of Nepal?",
    options: ["Pokhara", "Lalitpur", "Kathmandu", "Biratnagar"],
    correctAnswer: "C",
    explanation: "Kathmandu is the capital city of Nepal.",
    difficulty: 1
  },
  {
    questionText: "How many provinces are there in Nepal?",
    options: ["5", "6", "7", "8"],
    correctAnswer: "C",
    explanation: "Nepal has 7 provinces.",
    difficulty: 1
  },
  {
    questionText: "Which is the highest mountain in the world?",
    options: ["Kanchenjunga", "K2", "Lhotse", "Mount Everest"],
    correctAnswer: "D",
    explanation: "Mount Everest is the highest mountain in the world.",
    difficulty: 1
  },
  {
    questionText: "When was the Constitution of Nepal promulgated?",
    options: ["2062 BS", "2070 BS", "2072 BS", "2074 BS"],
    correctAnswer: "C",
    explanation: "The Constitution of Nepal was promulgated in 2072 BS.",
    difficulty: 2
  },
  {
    questionText: "Which river is known as the longest river in Nepal?",
    options: ["Koshi", "Karnali", "Gandaki", "Bagmati"],
    correctAnswer: "B",
    explanation: "Karnali River is the longest river in Nepal.",
    difficulty: 1
  },
  {
    questionText: "Who was the first Rana Prime Minister of Nepal?",
    options: ["Chandra Shumsher", "Bhim Shumsher", "Jung Bahadur Rana", "Mohan Shumsher"],
    correctAnswer: "C",
    explanation: "Jung Bahadur Rana was the first Rana Prime Minister of Nepal.",
    difficulty: 2
  },
  {
    questionText: "Nepal became a federal democratic republic in:",
    options: ["2063 BS", "2065 BS", "2072 BS", "2046 BS"],
    correctAnswer: "B",
    explanation: "Nepal became a federal democratic republic in 2065 BS.",
    difficulty: 2
  },
  {
    questionText: "What is the national flower of Nepal?",
    options: ["Rose", "Rhododendron", "Lotus", "Sunflower"],
    correctAnswer: "B",
    explanation: "Rhododendron is the national flower of Nepal.",
    difficulty: 1
  },
  {
    questionText: "Which organization is headquartered in New York?",
    options: ["SAARC", "WHO", "United Nations", "BIMSTEC"],
    correctAnswer: "C",
    explanation: "The United Nations is headquartered in New York.",
    difficulty: 1
  },
  {
    questionText: "What is the currency of Nepal?",
    options: ["Rupee", "Dollar", "Taka", "Yuan"],
    correctAnswer: "A",
    explanation: "The currency of Nepal is Nepalese Rupee.",
    difficulty: 1
  },
  {
    questionText: "Which district is famous for Lumbini?",
    options: ["Rupandehi", "Kapilvastu", "Dang", "Banke"],
    correctAnswer: "A",
    explanation: "Lumbini is located in Rupandehi district.",
    difficulty: 1
  },
  {
    questionText: "Which body interprets the Constitution in Nepal?",
    options: ["Parliament", "Supreme Court", "President Office", "National Assembly"],
    correctAnswer: "B",
    explanation: "The Supreme Court of Nepal interprets the Constitution.",
    difficulty: 2
  },
  {
    questionText: "Which is the national animal of Nepal?",
    options: ["Tiger", "Cow", "Yak", "Elephant"],
    correctAnswer: "B",
    explanation: "The Cow is the national animal of Nepal.",
    difficulty: 1
  },
  {
    questionText: "SAARC headquarters is located in:",
    options: ["Delhi", "Dhaka", "Kathmandu", "Colombo"],
    correctAnswer: "C",
    explanation: "SAARC headquarters is located in Kathmandu.",
    difficulty: 1
  },
  {
    questionText: "Who is the Supreme Commander of the Nepal Army?",
    options: ["Prime Minister", "Chief Justice", "President", "Defense Minister"],
    correctAnswer: "C",
    explanation: "The President is the Supreme Commander of the Nepal Army.",
    difficulty: 2
  },
  {
    questionText: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correctAnswer: "B",
    explanation: "Mars is known as the Red Planet.",
    difficulty: 1
  },
  {
    questionText: "The first democratic movement in Nepal was successful in:",
    options: ["2007 BS", "2017 BS", "2046 BS", "2062 BS"],
    correctAnswer: "A",
    explanation: "The first democratic movement in Nepal was successful in 2007 BS.",
    difficulty: 2
  },
  {
    questionText: "Which is the largest national park of Nepal?",
    options: [
      "Chitwan National Park",
      "Sagarmatha National Park",
      "Shey Phoksundo National Park",
      "Bardiya National Park"
    ],
    correctAnswer: "C",
    explanation: "Shey Phoksundo National Park is the largest national park of Nepal.",
    difficulty: 2
  },
  {
    questionText: "What does CPU stand for?",
    options: [
      "Central Process Unit",
      "Central Processing Unit",
      "Computer Processing Unit",
      "Control Processing Unit"
    ],
    correctAnswer: "B",
    explanation: "CPU stands for Central Processing Unit.",
    difficulty: 1
  },
  {
    questionText: "Who was the first King of unified Nepal?",
    options: ["Tribhuvan", "Mahendra", "Prithvi Narayan Shah", "Rana Bahadur Shah"],
    correctAnswer: "C",
    explanation: "Prithvi Narayan Shah was the first King of unified Nepal.",
    difficulty: 2
  },
  {
    questionText: "Which is the smallest province of Nepal by area?",
    options: ["Madhesh Province", "Bagmati Province", "Gandaki Province", "Koshi Province"],
    correctAnswer: "A",
    explanation: "Madhesh Province is the smallest province of Nepal by area.",
    difficulty: 2
  },
  {
    questionText: "Which country lies to the north of Nepal?",
    options: ["India", "Bhutan", "China", "Bangladesh"],
    correctAnswer: "C",
    explanation: "China lies to the north of Nepal.",
    difficulty: 1
  },
  {
    questionText: "What is the literacy rate unit measured in?",
    options: ["Meter", "Percent", "Kilogram", "Liter"],
    correctAnswer: "B",
    explanation: "Literacy rate is measured in percent.",
    difficulty: 1
  },
  {
    questionText: "Which article of the Constitution guarantees Right to Education?",
    options: ["Article 17", "Article 31", "Article 35", "Article 40"],
    correctAnswer: "B",
    explanation: "Article 31 of the Constitution guarantees Right to Education.",
    difficulty: 2
  },
  {
    questionText: "Which is the largest lake in Nepal?",
    options: ["Rara Lake", "Phewa Lake", "Tilicho Lake", "Begnas Lake"],
    correctAnswer: "A",
    explanation: "Rara Lake is the largest lake in Nepal.",
    difficulty: 1
  },
  {
    questionText: "Nepal is a member of which international organization?",
    options: ["NATO", "United Nations", "OPEC", "G7"],
    correctAnswer: "B",
    explanation: "Nepal is a member of the United Nations.",
    difficulty: 1
  },
  {
    questionText: "Which blood group is known as the universal donor?",
    options: ["AB+", "O−", "B+", "A+"],
    correctAnswer: "B",
    explanation: "O− blood group is known as the universal donor.",
    difficulty: 1
  },
  {
    questionText: "Who wrote the national anthem of Nepal?",
    options: ["Madhav Prasad Ghimire", "Byakul Maila", "Lekhnath Paudyal", "Laxmi Prasad Devkota"],
    correctAnswer: "B",
    explanation: "Byakul Maila wrote the national anthem of Nepal.",
    difficulty: 2
  },
  {
    questionText: "Which is the headquarters of BIMSTEC?",
    options: ["Kathmandu", "Dhaka", "Bangkok", "Delhi"],
    correctAnswer: "B",
    explanation: "BIMSTEC headquarters is in Dhaka.",
    difficulty: 2
  },
  {
    questionText: "What is the full form of GDP?",
    options: [
      "Gross Domestic Product",
      "General Domestic Product",
      "Gross Development Plan",
      "Global Domestic Product"
    ],
    correctAnswer: "A",
    explanation: "GDP stands for Gross Domestic Product.",
    difficulty: 1
  },
  {
    questionText: "Which district is famous for Ilam tea?",
    options: ["Jhapa", "Dhankuta", "Ilam", "Taplejung"],
    correctAnswer: "C",
    explanation: "Ilam district is famous for Ilam tea.",
    difficulty: 1
  },
  {
    questionText: "Which is the national bird of Nepal?",
    options: ["Peacock", "Danphe", "Eagle", "Pigeon"],
    correctAnswer: "B",
    explanation: "Himalayan Monal (Danphe) is the national bird of Nepal.",
    difficulty: 1
  },
  {
    questionText: "Who was the first elected Prime Minister of Nepal?",
    options: [
      "B. P. Koirala",
      "Matrika Prasad Koirala",
      "Girija Prasad Koirala",
      "Pushpa Lal Shrestha"
    ],
    correctAnswer: "A",
    explanation: "B. P. Koirala was the first elected Prime Minister of Nepal.",
    difficulty: 2
  },
  {
    questionText: "Which gas is most abundant in Earth's atmosphere?",
    options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
    correctAnswer: "C",
    explanation: "Nitrogen is the most abundant gas in Earth's atmosphere.",
    difficulty: 1
  },
  {
    questionText: "What is the name of Nepal's central bank?",
    options: ["Agriculture Bank", "Nepal Rastra Bank", "Rastriya Banijya Bank", "Himalayan Bank"],
    correctAnswer: "B",
    explanation: "Nepal Rastra Bank is the central bank of Nepal.",
    difficulty: 1
  },
  {
    questionText: "Which is the longest highway in Nepal?",
    options: ["Arniko Highway", "Prithvi Highway", "Mahendra Highway", "Tribhuvan Highway"],
    correctAnswer: "C",
    explanation: "Mahendra Highway is the longest highway in Nepal.",
    difficulty: 2
  },
  {
    questionText: "In which year did Nepal join the United Nations?",
    options: ["1945", "1955", "1960", "1972"],
    correctAnswer: "B",
    explanation: "Nepal joined the United Nations in 1955.",
    difficulty: 2
  },
  {
    questionText: "Which device is used to measure earthquakes?",
    options: ["Thermometer", "Barometer", "Seismograph", "Hygrometer"],
    correctAnswer: "C",
    explanation: "Seismograph is used to measure earthquakes.",
    difficulty: 1
  },
  {
    questionText: "Which district contains Sagarmatha?",
    options: ["Solukhumbu", "Mustang", "Dolakha", "Sankhuwasabha"],
    correctAnswer: "A",
    explanation: "Mount Everest (Sagarmatha) is located in Solukhumbu district.",
    difficulty: 1
  },
  {
    questionText: "Which is the oldest university in Nepal?",
    options: [
      "Pokhara University",
      "Kathmandu University",
      "Tribhuvan University",
      "Purbanchal University"
    ],
    correctAnswer: "C",
    explanation: "Tribhuvan University is the oldest university in Nepal.",
    difficulty: 1
  },
  {
    questionText: "Who is known as the Light of Asia?",
    options: ["Mahatma Gandhi", "Gautam Buddha", "Swami Vivekananda", "Ashoka"],
    correctAnswer: "B",
    explanation: "Gautam Buddha is known as the Light of Asia.",
    difficulty: 1
  },
  {
    questionText: "Which district is called the gateway of Mount Everest?",
    options: ["Dolpa", "Solukhumbu", "Mustang", "Rasuwa"],
    correctAnswer: "B",
    explanation: "Solukhumbu District is called the gateway of Mount Everest.",
    difficulty: 2
  },
  {
    questionText: "What is the SI unit of force?",
    options: ["Joule", "Newton", "Pascal", "Watt"],
    correctAnswer: "B",
    explanation: "Newton is the SI unit of force.",
    difficulty: 1
  },
  {
    questionText: "Which treaty ended the Anglo-Nepal War?",
    options: ["Mahakali Treaty", "Sugauli Treaty", "Koshi Treaty", "Thapathali Treaty"],
    correctAnswer: "B",
    explanation: "The Treaty of Sugauli ended the Anglo-Nepal War.",
    difficulty: 2
  },
  {
    questionText: "Which is the national language of Nepal?",
    options: ["Newari", "Maithili", "Nepali", "Bhojpuri"],
    correctAnswer: "C",
    explanation: "Nepali is the national language of Nepal.",
    difficulty: 1
  },
  {
    questionText: "Which organ purifies blood in the human body?",
    options: ["Heart", "Liver", "Kidney", "Lung"],
    correctAnswer: "C",
    explanation: "Kidney purifies blood in the human body.",
    difficulty: 1
  },
  {
    questionText: "Which province has Biratnagar as its capital?",
    options: ["Madhesh Province", "Koshi Province", "Bagmati Province", "Gandaki Province"],
    correctAnswer: "B",
    explanation: "Biratnagar is the capital of Koshi Province.",
    difficulty: 1
  },
  {
    questionText: "Who was the first President of Nepal?",
    options: [
      "Ram Baran Yadav",
      "Bidhya Devi Bhandari",
      "Girija Prasad Koirala",
      "Sher Bahadur Deuba"
    ],
    correctAnswer: "A",
    explanation: "Ram Baran Yadav was the first President of Nepal.",
    difficulty: 2
  },
  {
    questionText: "What does UNESCO stand for?",
    options: [
      "United Nations Educational, Scientific and Cultural Organization",
      "United Nations Economic and Social Council",
      "Universal Education Science Council Organization",
      "United Scientific Education Council Organization"
    ],
    correctAnswer: "A",
    explanation:
      "UNESCO stands for United Nations Educational, Scientific and Cultural Organization.",
    difficulty: 1
  },
  {
    questionText: "Which is the deepest lake in Nepal?",
    options: ["Rara Lake", "Tilicho Lake", "Shey Lake", "Phoksundo Lake"],
    correctAnswer: "D",
    explanation: "Phoksundo Lake is the deepest lake in Nepal.",
    difficulty: 2
  },
  {
    questionText: "Which vitamin is obtained from sunlight?",
    options: ["Vitamin A", "Vitamin B", "Vitamin C", "Vitamin D"],
    correctAnswer: "D",
    explanation: "Vitamin D is obtained from sunlight.",
    difficulty: 1
  },
  {
    questionText: "Which king introduced the partyless Panchayat system in Nepal?",
    options: ["King Tribhuvan", "King Mahendra", "King Birendra", "King Gyanendra"],
    correctAnswer: "B",
    explanation: "King Mahendra introduced the partyless Panchayat system in Nepal.",
    difficulty: 2
  },
  {
    questionText: "What is the full form of SAARC?",
    options: [
      "South Asian Association for Regional Cooperation",
      "South Africa Asian Regional Council",
      "South Asia Regional Committee",
      "South Asian Regional Community"
    ],
    correctAnswer: "A",
    explanation: "SAARC stands for South Asian Association for Regional Cooperation.",
    difficulty: 1
  },
  {
    questionText: "Which district is famous for apple production in Nepal?",
    options: ["Jhapa", "Jumla", "Chitwan", "Sunsari"],
    correctAnswer: "B",
    explanation: "Jumla district is famous for apple production in Nepal.",
    difficulty: 1
  },
  {
    questionText: "Which metal is liquid at room temperature?",
    options: ["Iron", "Copper", "Mercury", "Aluminum"],
    correctAnswer: "C",
    explanation: "Mercury is liquid at room temperature.",
    difficulty: 1
  },
  {
    questionText: "Which national park of Nepal is famous for one-horned rhinoceros?",
    options: [
      "Bardiya National Park",
      "Chitwan National Park",
      "Sagarmatha National Park",
      "Khaptad National Park"
    ],
    correctAnswer: "B",
    explanation: "Chitwan National Park is famous for one-horned rhinoceros.",
    difficulty: 1
  },
  {
    questionText: "Who is the current ceremonial head of state in Nepal?",
    options: ["Prime Minister", "Chief Justice", "President", "Army Chief"],
    correctAnswer: "C",
    explanation: "The President is the ceremonial head of state in Nepal.",
    difficulty: 1
  },
  {
    questionText: "Which instrument is used to measure atmospheric pressure?",
    options: ["Thermometer", "Barometer", "Hygrometer", "Ammeter"],
    correctAnswer: "B",
    explanation: "Barometer is used to measure atmospheric pressure.",
    difficulty: 1
  },
  {
    questionText: "Which river is called the sorrow of Bihar?",
    options: ["Bagmati", "Gandaki", "Koshi", "Karnali"],
    correctAnswer: "C",
    explanation: "Koshi River is called the sorrow of Bihar.",
    difficulty: 2
  },
  {
    questionText: "Which is the second highest mountain in the world?",
    options: ["Kanchenjunga", "Lhotse", "K2", "Makalu"],
    correctAnswer: "C",
    explanation: "K2 is the second highest mountain in the world.",
    difficulty: 1
  },
  {
    questionText: "Who is known as the Iron Man of India?",
    options: [
      "Mahatma Gandhi",
      "Jawaharlal Nehru",
      "Subhas Chandra Bose",
      "Sardar Vallabhbhai Patel"
    ],
    correctAnswer: "D",
    explanation: "Sardar Vallabhbhai Patel is known as the Iron Man of India.",
    difficulty: 2
  },
  {
    questionText: "Which district is the headquarters of the Nepal Army's Eastern Command?",
    options: ["Kathmandu", "Sunsari", "Morang", "Kaski"],
    correctAnswer: "B",
    explanation: "Sunsari District is the headquarters of the Nepal Army's Eastern Command.",
    difficulty: 2
  },
  {
    questionText: "What is the chemical formula of water?",
    options: ["CO2", "H2O", "O2", "NaCl"],
    correctAnswer: "B",
    explanation: "H2O is the chemical formula of water.",
    difficulty: 1
  },
  {
    questionText: "Which is the legislative body of Nepal called?",
    options: ["Senate", "Parliament", "Congress", "Assembly"],
    correctAnswer: "B",
    explanation: "The legislative body of Nepal is called the Federal Parliament of Nepal.",
    difficulty: 1
  },
  {
    questionText: "Which city is known as the city of lakes in Nepal?",
    options: ["Janakpur", "Pokhara", "Nepalgunj", "Dharan"],
    correctAnswer: "B",
    explanation: "Pokhara is known as the city of lakes in Nepal.",
    difficulty: 1
  },
  {
    questionText: "Which gas is essential for human respiration?",
    options: ["Nitrogen", "Carbon Dioxide", "Oxygen", "Helium"],
    correctAnswer: "C",
    explanation: "Oxygen is essential for human respiration.",
    difficulty: 1
  },
  {
    questionText: "Which king introduced the Muluki Ain in Nepal?",
    options: ["Prithvi Narayan Shah", "Tribhuvan", "Jung Bahadur Rana", "Mahendra"],
    correctAnswer: "C",
    explanation: "Jung Bahadur Rana introduced the Muluki Ain in Nepal.",
    difficulty: 2
  },
  {
    questionText: "Which continent is Nepal located in?",
    options: ["Europe", "Africa", "Asia", "Australia"],
    correctAnswer: "C",
    explanation: "Nepal is located in Asia.",
    difficulty: 1
  },
  {
    questionText: "Which is the largest planet in the solar system?",
    options: ["Earth", "Saturn", "Jupiter", "Uranus"],
    correctAnswer: "C",
    explanation: "Jupiter is the largest planet in the solar system.",
    difficulty: 1
  },
  {
    questionText: "Which district is famous for Janaki Temple?",
    options: ["Dhanusha", "Mahottari", "Sarlahi", "Bara"],
    correctAnswer: "A",
    explanation: "Dhanusha district is famous for Janaki Temple.",
    difficulty: 1
  },
  {
    questionText: "What is the national sport of Nepal?",
    options: ["Cricket", "Football", "Volleyball", "Kabaddi"],
    correctAnswer: "C",
    explanation: "Volleyball is the national sport of Nepal.",
    difficulty: 1
  },
  {
    questionText: "Which organ pumps blood throughout the body?",
    options: ["Kidney", "Liver", "Heart", "Lung"],
    correctAnswer: "C",
    explanation: "The heart pumps blood throughout the body.",
    difficulty: 1
  },
  {
    questionText: "Which famous battle was fought between Nepal and Tibet in 1792?",
    options: ["Nalapani Battle", "Sino-Nepal War", "Anglo-Nepal War", "Battle of Makwanpur"],
    correctAnswer: "B",
    explanation: "The Sino-Nepalese War was fought between Nepal and Tibet in 1792.",
    difficulty: 2
  },
  {
    questionText: "Which is the headquarters of the United Nations?",
    options: ["Geneva", "Paris", "London", "New York"],
    correctAnswer: "D",
    explanation: "The headquarters of the United Nations is in New York City.",
    difficulty: 1
  },
  {
    questionText: "Which metal is used in electric wiring due to high conductivity?",
    options: ["Iron", "Copper", "Zinc", "Tin"],
    correctAnswer: "B",
    explanation: "Copper is used in electric wiring due to high conductivity.",
    difficulty: 1
  },
  {
    questionText: "Which is the oldest national park in Nepal?",
    options: [
      "Sagarmatha National Park",
      "Langtang National Park",
      "Chitwan National Park",
      "Bardiya National Park"
    ],
    correctAnswer: "C",
    explanation: "Chitwan National Park is the oldest national park in Nepal.",
    difficulty: 1
  },
  {
    questionText: "Who appoints the Chief of Army Staff in Nepal?",
    options: ["Prime Minister only", "Parliament", "President", "Supreme Court"],
    correctAnswer: "C",
    explanation: "The President appoints the Chief of Army Staff in Nepal.",
    difficulty: 2
  },
  {
    questionText: "Which country is called the Land of the Rising Sun?",
    options: ["China", "Thailand", "Japan", "Korea"],
    correctAnswer: "C",
    explanation: "Japan is called the Land of the Rising Sun.",
    difficulty: 1
  },
  {
    questionText: "Which instrument is used to measure temperature?",
    options: ["Barometer", "Thermometer", "Hygrometer", "Altimeter"],
    correctAnswer: "B",
    explanation: "Thermometer is used to measure temperature.",
    difficulty: 1
  },
  {
    questionText: "Which is the smallest district of Nepal by area?",
    options: ["Bhaktapur", "Lalitpur", "Kathmandu", "Parsa"],
    correctAnswer: "A",
    explanation: "Bhaktapur is the smallest district of Nepal by area.",
    difficulty: 1
  },
  {
    questionText: "Who was the first female President of Nepal?",
    options: ["Onsari Gharti", "Bidhya Devi Bhandari", "Sujata Koirala", "Sahana Pradhan"],
    correctAnswer: "B",
    explanation: "Bidhya Devi Bhandari was the first female President of Nepal.",
    difficulty: 2
  },
  {
    questionText: "Which river flows through Kathmandu Valley?",
    options: ["Koshi", "Karnali", "Bagmati", "Gandaki"],
    correctAnswer: "C",
    explanation: "Bagmati River flows through Kathmandu Valley.",
    difficulty: 1
  },
  {
    questionText: "What is the unit of electric current?",
    options: ["Volt", "Watt", "Ampere", "Ohm"],
    correctAnswer: "C",
    explanation: "Ampere is the unit of electric current.",
    difficulty: 1
  },
  {
    questionText: "Which district is famous for Khaptad National Park?",
    options: ["Kailali", "Doti", "Jhapa", "Mustang"],
    correctAnswer: "B",
    explanation: "Doti district is famous for Khaptad National Park.",
    difficulty: 2
  },
  {
    questionText: "Who is known as the Father of the Nation in India?",
    options: ["Jawaharlal Nehru", "Bhagat Singh", "Mahatma Gandhi", "Sardar Patel"],
    correctAnswer: "C",
    explanation: "Mahatma Gandhi is known as the Father of the Nation in India.",
    difficulty: 1
  },
  {
    questionText: "Which is the largest ocean in the world?",
    options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
    correctAnswer: "D",
    explanation: "Pacific Ocean is the largest ocean in the world.",
    difficulty: 1
  },
  {
    questionText: "Which article of the Constitution provides Right to Equality?",
    options: ["Article 16", "Article 17", "Article 18", "Article 20"],
    correctAnswer: "C",
    explanation: "Article 18 of the Constitution provides Right to Equality.",
    difficulty: 2
  },
  {
    questionText: "Which district is famous for Mustang apples?",
    options: ["Jumla", "Mustang", "Dolpa", "Myagdi"],
    correctAnswer: "B",
    explanation: "Mustang district is famous for Mustang apples.",
    difficulty: 1
  },
  {
    questionText: "Which gas do plants absorb during photosynthesis?",
    options: ["Oxygen", "Hydrogen", "Nitrogen", "Carbon Dioxide"],
    correctAnswer: "D",
    explanation: "Plants absorb carbon dioxide during photosynthesis.",
    difficulty: 1
  },
  {
    questionText: "Which is the oldest highway in Nepal?",
    options: ["Mahendra Highway", "Arniko Highway", "Tribhuvan Highway", "Prithvi Highway"],
    correctAnswer: "C",
    explanation: "Tribhuvan Highway is the oldest highway in Nepal.",
    difficulty: 2
  },
  {
    questionText: "Who was the last Rana Prime Minister of Nepal?",
    options: ["Chandra Shumsher", "Mohan Shumsher", "Bhim Shumsher", "Juddha Shumsher"],
    correctAnswer: "B",
    explanation: "Mohan Shumsher Jang Bahadur Rana was the last Rana Prime Minister of Nepal.",
    difficulty: 2
  },
  {
    questionText: "Which country hosts the headquarters of WHO?",
    options: ["France", "Switzerland", "USA", "UK"],
    correctAnswer: "B",
    explanation: "Switzerland hosts the headquarters of the World Health Organization.",
    difficulty: 1
  },
  {
    questionText: "What is the boiling point of water at sea level?",
    options: ["50°C", "75°C", "100°C", "120°C"],
    correctAnswer: "C",
    explanation: "The boiling point of water at sea level is 100°C.",
    difficulty: 1
  },
  {
    questionText: "Which district is famous for Gosaikunda Lake?",
    options: ["Rasuwa", "Sindhupalchok", "Dolakha", "Solukhumbu"],
    correctAnswer: "A",
    explanation: "Rasuwa district is famous for Gosaikunda Lake.",
    difficulty: 1
  },
  {
    questionText: "Which body conducts elections in Nepal?",
    options: [
      "Supreme Court",
      "Public Service Commission",
      "Election Commission",
      "National Assembly"
    ],
    correctAnswer: "C",
    explanation: "Election Commission Nepal conducts elections in Nepal.",
    difficulty: 1
  },
  {
    questionText: "Which is the fastest land animal?",
    options: ["Tiger", "Horse", "Leopard", "Cheetah"],
    correctAnswer: "D",
    explanation: "Cheetah is the fastest land animal.",
    difficulty: 1
  },
  {
    questionText: "Which district is famous for Pathibhara Temple?",
    options: ["Taplejung", "Panchthar", "Bhojpur", "Dhankuta"],
    correctAnswer: "A",
    explanation: "Taplejung district is famous for Pathibhara Devi Temple.",
    difficulty: 1
  },
  {
    questionText: "Which is the largest continent in the world?",
    options: ["Europe", "Africa", "Asia", "North America"],
    correctAnswer: "C",
    explanation: "Asia is the largest continent in the world.",
    difficulty: 1
  },
  {
    questionText: "What does WWW stand for?",
    options: ["World Wide Web", "World Web Window", "Wide World Web", "Web World Wide"],
    correctAnswer: "A",
    explanation: "WWW stands for World Wide Web.",
    difficulty: 1
  }
];

const NEPALI_QUESTIONS: Question[] = [
  {
    questionText: "'विद्यालय' शब्द कुन समास हो ?",
    options: ["द्वन्द्व", "तत्पुरुष", "कर्मधारय", "बहुव्रीहि"],
    correctAnswer: "B",
    explanation: "विद्यालय = विद्या + आलय (तत्पुरुष समास)",
    difficulty: 1
  },
  {
    questionText: "'सुन्दर' शब्दको विपरीतार्थी शब्द कुन हो ?",
    options: ["राम्रो", "नराम्रो", "कुरूप", "सफा"],
    correctAnswer: "C",
    explanation: "कुरूप सुन्दरको विपरीतार्थी शब्द हो।",
    difficulty: 1
  },
  {
    questionText: "'विद्यार्थी' शब्दको सही हिज्जे कुन हो ?",
    options: ["विध्यार्थी", "विद्यार्थी", "विद्यार्थी", "बिध्यार्थी"],
    correctAnswer: "B",
    explanation: "विद्यार्थी सही हिज्जे हो।",
    difficulty: 1
  },
  {
    questionText: "'राम विद्यालय गयो ।' यस वाक्यमा कर्ता कुन हो ?",
    options: ["विद्यालय", "गयो", "राम", "मा"],
    correctAnswer: "C",
    explanation: "राम कर्ता हो किनकि रामले काम गरेको छ।",
    difficulty: 1
  },
  {
    questionText: "'हातमुख जोड्नु' उखानको अर्थ के हो ?",
    options: ["झगडा गर्नु", "खान पुग्नु", "सहयोग गर्नु", "पढाइ गर्नु"],
    correctAnswer: "B",
    explanation: "हातमुख जोड्नु भन्ने उखानको अर्थ खान पुग्नु हो।",
    difficulty: 2
  },
  {
    questionText: "'नेपाल' शब्द कुन प्रकारको नाम हो ?",
    options: ["जातिवाचक", "व्यक्तिवाचक", "भाववाचक", "समूहवाचक"],
    correctAnswer: "B",
    explanation: "नेपाल एक विशेष देशको नाम हो, त्यसैले व्यक्तिवाचक नाम हो।",
    difficulty: 1
  },
  {
    questionText: "'ऊ धेरै छिटो दौडन्छ ।' यस वाक्यमा क्रियाविशेषण शब्द कुन हो ?",
    options: ["ऊ", "धेरै", "छिटो", "दौडन्छ"],
    correctAnswer: "C",
    explanation: "छिटो क्रियाविशेषण शब्द हो जसले क्रिया 'दौडन्छ' को विशेषता बताउँछ।",
    difficulty: 1
  },
  {
    questionText: "'गाई' शब्दको बहुवचन कुन हो ?",
    options: ["गाईहरू", "गाइ", "गाईहरु", "गाईनी"],
    correctAnswer: "A",
    explanation: "गाईहरू सही बहुवचन हो।",
    difficulty: 1
  },
  {
    questionText: "'पानी' शब्दको पर्यायवाची शब्द कुन हो ?",
    options: ["जल", "आगो", "माटो", "हावा"],
    correctAnswer: "A",
    explanation: "जल पानीको पर्यायवाची शब्द हो।",
    difficulty: 1
  },
  {
    questionText: "'उसले खाना खायो ।' वाक्यको काल कुन हो ?",
    options: ["वर्तमान", "भूत", "भविष्यत्", "अपूर्ण"],
    correctAnswer: "B",
    explanation: "खायो भूतकाल हो।",
    difficulty: 1
  },
  {
    questionText: "'काठमाडौँ नेपालको राजधानी हो ।' यस वाक्यमा विशेषण शब्द कुन हो ?",
    options: ["काठमाडौँ", "नेपालको", "राजधानी", "हो"],
    correctAnswer: "B",
    explanation: "नेपालको विशेषण शब्द हो।",
    difficulty: 1
  },
  {
    questionText: "'दूधको जलेको छाछ पनि फुकेर खान्छ' उखानको अर्थ के हो ?",
    options: ["धेरै तातो खानु", "अनुभवपछि सतर्क हुनु", "दूध मन पराउनु", "डराउनु"],
    correctAnswer: "B",
    explanation: "यो उखान अनुभवपछि सतर्क हुनुको अर्थ दिन्छ।",
    difficulty: 2
  },
  {
    questionText: "'विद्यालय' शब्दमा कति वर्ण छन् ?",
    options: ["५", "६", "७", "८"],
    correctAnswer: "C",
    explanation: "विद्यालय = वि-द्य-आ-ल-य = ७ वर्ण",
    difficulty: 1
  },
  {
    questionText: "'म घर जाँदैछु ।' यस वाक्यमा 'घर' कुन कारक हो ?",
    options: ["कर्ता", "कर्म", "अधिकरण", "सम्बन्ध"],
    correctAnswer: "C",
    explanation: "घर अधिकरण कारक हो।",
    difficulty: 2
  },
  {
    questionText: "'अन्धकार' शब्दको विपरीतार्थी शब्द कुन हो ?",
    options: ["उज्यालो", "कालो", "छायाँ", "रात"],
    correctAnswer: "A",
    explanation: "उज्यालो अन्धकारको विपरीतार्थी शब्द हो।",
    difficulty: 1
  },
  {
    questionText: "'नेपाली सेना देशको गौरव हो ।' यस वाक्यमा विशेष्य शब्द कुन हो ?",
    options: ["नेपाली", "सेना", "देशको", "गौरव"],
    correctAnswer: "B",
    explanation: "सेना विशेष्य शब्द हो।",
    difficulty: 1
  },
  {
    questionText: "'उसले मलाई पुस्तक दियो ।' वाक्यमा कर्म कुन हो ?",
    options: ["उसले", "मलाई", "पुस्तक", "दियो"],
    correctAnswer: "C",
    explanation: "पुस्तक कर्म हो।",
    difficulty: 1
  },
  {
    questionText: "'कर्मठ' शब्दको अर्थ के हो ?",
    options: ["अल्छी", "मेहनती", "रिसाहा", "डरपोक"],
    correctAnswer: "B",
    explanation: "कर्मठ भन्ने शब्दको अर्थ मेहनती हो।",
    difficulty: 1
  },
  {
    questionText: "'आकाशबाट खसेजस्तो हुनु' टुक्काको अर्थ के हो ?",
    options: ["खुशी हुनु", "छक्क पर्नु", "डराउनु", "भाग्नु"],
    correctAnswer: "B",
    explanation: "यो टुक्का छक्क पर्नुको अर्थ दिन्छ।",
    difficulty: 2
  },
  {
    questionText: "'हामी विद्यालय जान्छौं ।' यस वाक्यको पुरुष कुन हो ?",
    options: ["प्रथम पुरुष", "मध्यम पुरुष", "उत्तम पुरुष", "अन्य पुरुष"],
    correctAnswer: "C",
    explanation: "हामी उत्तम पुरुष हो।",
    difficulty: 1
  }
];

const ENGLISH_QUESTIONS: Question[] = [
  {
    questionText: "Choose the correct sentence.",
    options: [
      "He do not play football.",
      "He does not plays football.",
      "He does not play football.",
      "He not play football."
    ],
    correctAnswer: "C",
    explanation: "The correct form is 'does not play' (third person singular).",
    difficulty: 1
  },
  {
    questionText: "Fill in the blank with the correct preposition.\nShe is interested ___ music.",
    options: ["on", "at", "in", "for"],
    correctAnswer: "C",
    explanation: "'Interested in' is the correct preposition phrase.",
    difficulty: 1
  },
  {
    questionText: "Choose the synonym of 'Ancient'.",
    options: ["Modern", "Old", "Young", "Fresh"],
    correctAnswer: "B",
    explanation: "Ancient means old or from a long time ago.",
    difficulty: 1
  },
  {
    questionText: "Choose the antonym of 'Expand'.",
    options: ["Increase", "Extend", "Contract", "Develop"],
    correctAnswer: "C",
    explanation: "Contract is the opposite of expand.",
    difficulty: 1
  },
  {
    questionText: "Identify the correct passive voice.\n'They completed the project.'",
    options: [
      "The project completed by them.",
      "The project was completed by them.",
      "The project is completed by them.",
      "The project had completed by them."
    ],
    correctAnswer: "B",
    explanation: "The correct passive voice uses 'was completed' for past tense.",
    difficulty: 2
  },
  {
    questionText: "Fill in the blank with the correct article.\nHe bought ___ umbrella yesterday.",
    options: ["a", "an", "the", "no article"],
    correctAnswer: "B",
    explanation: "'An' is used before words starting with a vowel sound.",
    difficulty: 1
  },
  {
    questionText: "Choose the correctly spelled word.",
    options: ["Recieve", "Recive", "Receive", "Receeeve"],
    correctAnswer: "C",
    explanation: "'Receive' is the correct spelling (i before e except after c).",
    difficulty: 1
  },
  {
    questionText: "Choose the correct indirect speech.\nShe said, 'I am tired.'",
    options: [
      "She said that she was tired.",
      "She said that I was tired.",
      "She says that she is tired.",
      "She told she was tired."
    ],
    correctAnswer: "A",
    explanation: "In indirect speech, 'I' becomes 'she' and 'am' becomes 'was'.",
    difficulty: 2
  },
  {
    questionText: "Fill in the blank with the correct tense.\nBy next year, she ___ her studies.",
    options: ["completes", "completed", "will complete", "will have completed"],
    correctAnswer: "D",
    explanation:
      "'Will have completed' is future perfect tense for actions completed by a future time.",
    difficulty: 2
  },
  {
    questionText: "Choose the meaning of the idiom 'Break the ice'.",
    options: [
      "To destroy something",
      "To start a conversation",
      "To feel cold",
      "To create a problem"
    ],
    correctAnswer: "B",
    explanation: "'Break the ice' means to start a conversation or make people feel comfortable.",
    difficulty: 2
  },
  {
    questionText: "Identify the error in the sentence.\nEach of the boys have completed the task.",
    options: ["Each", "boys", "have", "completed"],
    correctAnswer: "C",
    explanation: "'Each' is singular, so the verb should be 'has' not 'have'.",
    difficulty: 2
  },
  {
    questionText: "Choose the correct comparative form.",
    options: ["More better", "Better", "Best", "Gooder"],
    correctAnswer: "B",
    explanation: "'Better' is the correct comparative form of 'good'.",
    difficulty: 1
  },
  {
    questionText: "Fill in the blank with the correct modal verb.\nYou ___ obey your parents.",
    options: ["ought", "should", "may", "dare"],
    correctAnswer: "B",
    explanation: "'Should' is the most appropriate modal verb for advice or obligation.",
    difficulty: 1
  },
  {
    questionText: "Choose the synonym of 'Rapid'.",
    options: ["Slow", "Fast", "Weak", "Quiet"],
    correctAnswer: "B",
    explanation: "Rapid means fast or quick.",
    difficulty: 1
  },
  {
    questionText: "Select the correctly punctuated sentence.",
    options: [
      "What is your name.",
      "What is your name?",
      "What is your name!",
      "What, is your name?"
    ],
    correctAnswer: "B",
    explanation: "Questions should end with a question mark.",
    difficulty: 1
  },
  {
    questionText:
      "Choose the correct sentence transformation.\n'If I were rich, I would travel the world.' This is:",
    options: ["Zero conditional", "First conditional", "Second conditional", "Third conditional"],
    correctAnswer: "C",
    explanation: "This is a second conditional (if + past, would + base verb).",
    difficulty: 2
  },
  {
    questionText: "Fill in the blank.\nNeither Ram nor his friends ___ present yesterday.",
    options: ["was", "were", "is", "are"],
    correctAnswer: "B",
    explanation: "'Neither...nor' with plural noun takes 'were'.",
    difficulty: 2
  },
  {
    questionText: "Choose the antonym of 'Generous'.",
    options: ["Kind", "Honest", "Selfish", "Helpful"],
    correctAnswer: "C",
    explanation: "Selfish is the opposite of generous.",
    difficulty: 1
  },
  {
    questionText:
      "Rearrange the words to form a meaningful sentence.\n'always / truth / the / speaks / he'",
    options: [
      "He truth always speaks the.",
      "He always speaks the truth.",
      "Always he speaks the truth.",
      "The truth speaks he always."
    ],
    correctAnswer: "B",
    explanation: "The correct order is 'He always speaks the truth.'",
    difficulty: 1
  },
  {
    questionText:
      "Read the sentence and answer the question.\n'Despite the heavy rain, the match continued.'\nWhat does 'despite' mean?",
    options: ["Because of", "In spite of", "During", "According to"],
    correctAnswer: "B",
    explanation: "'Despite' and 'in spite of' have the same meaning.",
    difficulty: 1
  }
];

async function main() {
  console.log("🌱 Seeding Officer Cadet Questions...");

  try {
    // Create Officer Cadet subjects
    console.log("📚 Creating Officer Cadet subjects...");

    const englishSubject = await prisma.subject.upsert({
      where: { name_position: { name: "English", position: "Officer Cadet" } },
      update: {},
      create: {
        name: "English",
        position: "Officer Cadet",
        description: "English Language Test"
      }
    });
    console.log(`✓ English subject: ${englishSubject.id}`);

    const nepaliSubject = await prisma.subject.upsert({
      where: { name_position: { name: "Nepali", position: "Officer Cadet" } },
      update: {},
      create: {
        name: "Nepali",
        position: "Officer Cadet",
        description: "Nepali Language Test"
      }
    });
    console.log(`✓ Nepali subject: ${nepaliSubject.id}`);

    const gkSubject = await prisma.subject.upsert({
      where: { name_position: { name: "GK", position: "Officer Cadet" } },
      update: {},
      create: {
        name: "GK",
        position: "Officer Cadet",
        description: "General Knowledge Test"
      }
    });
    console.log(`✓ GK subject: ${gkSubject.id}`);

    // Create Officer Cadet mock tests
    console.log("📝 Creating Officer Cadet mock tests...");

    const englishTest = await prisma.mockTest.upsert({
      where: { id: "test_officer_cadet_english_001" },
      update: {
        title: "Officer Cadet English Test",
        description: "English Language test for Officer Cadet - 20 questions, 20 marks, 30 minutes",
        timeLimitMinutes: 30,
        totalQuestions: 20,
        passingScore: 60
      },
      create: {
        id: "test_officer_cadet_english_001",
        title: "Officer Cadet English Test",
        description: "English Language test for Officer Cadet - 20 questions, 20 marks, 30 minutes",
        position: "Officer Cadet",
        subjectId: englishSubject.id,
        timeLimitMinutes: 30,
        totalQuestions: 20,
        passingScore: 60,
        accessType: "FREE",
        priceNpr: null,
        freePreviewCount: 0,
        status: "DRAFT",
        createdBy: "system"
      }
    });
    console.log(`✓ English test: ${englishTest.id}`);

    const nepaliTest = await prisma.mockTest.upsert({
      where: { id: "test_officer_cadet_nepali_001" },
      update: {
        title: "Officer Cadet Nepali Test",
        description: "Nepali Language test for Officer Cadet - 20 questions, 20 marks, 30 minutes",
        timeLimitMinutes: 30,
        totalQuestions: 20,
        passingScore: 60
      },
      create: {
        id: "test_officer_cadet_nepali_001",
        title: "Officer Cadet Nepali Test",
        description: "Nepali Language test for Officer Cadet - 20 questions, 20 marks, 30 minutes",
        position: "Officer Cadet",
        subjectId: nepaliSubject.id,
        timeLimitMinutes: 30,
        totalQuestions: 20,
        passingScore: 60,
        accessType: "FREE",
        priceNpr: null,
        freePreviewCount: 0,
        status: "DRAFT",
        createdBy: "system"
      }
    });
    console.log(`✓ Nepali test: ${nepaliTest.id}`);

    const gkTest = await prisma.mockTest.upsert({
      where: { id: "test_officer_cadet_gk_001" },
      update: {
        title: "Officer Cadet GK Test",
        description:
          "General Knowledge test for Officer Cadet - 100 questions, 100 marks, 120 minutes",
        timeLimitMinutes: 120,
        totalQuestions: 100,
        passingScore: 60
      },
      create: {
        id: "test_officer_cadet_gk_001",
        title: "Officer Cadet GK Test",
        description:
          "General Knowledge test for Officer Cadet - 100 questions, 100 marks, 120 minutes",
        position: "Officer Cadet",
        subjectId: gkSubject.id,
        timeLimitMinutes: 120,
        totalQuestions: 100,
        passingScore: 60,
        accessType: "FREE",
        priceNpr: null,
        freePreviewCount: 0,
        status: "DRAFT",
        createdBy: "system"
      }
    });
    console.log(`✓ GK test: ${gkTest.id}`);

    // Seed English Questions
    console.log("📝 Adding English questions...");
    for (let i = 0; i < ENGLISH_QUESTIONS.length; i++) {
      const question = ENGLISH_QUESTIONS[i];
      if (!question) continue;

      await prisma.mockTestQuestion.upsert({
        where: {
          mockTestId_position: {
            mockTestId: englishTest.id,
            position: i + 1
          }
        },
        update: {
          questionText: question.questionText,
          options: question.options,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          difficulty: question.difficulty
        },
        create: {
          mockTestId: englishTest.id,
          questionText: question.questionText,
          options: question.options,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          difficulty: question.difficulty,
          position: i + 1
        }
      });
    }
    console.log(`✓ English questions seeded (${ENGLISH_QUESTIONS.length} total)`);

    // Seed Nepali Questions
    console.log("📝 Adding Nepali questions...");
    for (let i = 0; i < NEPALI_QUESTIONS.length; i++) {
      const question = NEPALI_QUESTIONS[i];
      if (!question) continue;

      await prisma.mockTestQuestion.upsert({
        where: {
          mockTestId_position: {
            mockTestId: nepaliTest.id,
            position: i + 1
          }
        },
        update: {
          questionText: question.questionText,
          options: question.options,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          difficulty: question.difficulty
        },
        create: {
          mockTestId: nepaliTest.id,
          questionText: question.questionText,
          options: question.options,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          difficulty: question.difficulty,
          position: i + 1
        }
      });
    }
    console.log(`✓ Nepali questions seeded (${NEPALI_QUESTIONS.length} total)`);

    // Seed GK Questions
    console.log("📝 Adding GK questions...");
    for (let i = 0; i < GK_QUESTIONS.length; i++) {
      const question = GK_QUESTIONS[i];
      if (!question) continue;

      await prisma.mockTestQuestion.upsert({
        where: {
          mockTestId_position: {
            mockTestId: gkTest.id,
            position: i + 1
          }
        },
        update: {
          questionText: question.questionText,
          options: question.options,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          difficulty: question.difficulty
        },
        create: {
          mockTestId: gkTest.id,
          questionText: question.questionText,
          options: question.options,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          difficulty: question.difficulty,
          position: i + 1
        }
      });
    }
    console.log(`✓ GK questions seeded (${GK_QUESTIONS.length} total)`);

    // Publish tests
    console.log("📤 Publishing tests...");
    await prisma.mockTest.update({
      where: { id: englishTest.id },
      data: { status: "PUBLISHED" }
    });
    console.log("✓ English test published");

    await prisma.mockTest.update({
      where: { id: nepaliTest.id },
      data: { status: "PUBLISHED" }
    });
    console.log("✓ Nepali test published");

    await prisma.mockTest.update({
      where: { id: gkTest.id },
      data: { status: "PUBLISHED" }
    });
    console.log("✓ GK test published");

    console.log("\n✅ Officer Cadet questions seeded successfully!");
    console.log("💡 This seed is idempotent - safe to run multiple times during deployments");
    console.log("   Admin-managed fields (status, pricing) are preserved");
  } catch (error) {
    console.error("❌ Error seeding:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
