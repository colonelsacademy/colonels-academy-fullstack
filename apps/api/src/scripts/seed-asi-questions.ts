import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface Question {
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: number;
  isImageBased?: boolean;
  imageUrl?: string;
}

const GK_QUESTIONS: Question[] = [
  {
    questionText: "Who is known as the first martyr of Nepal?",
    options: ["Shukraraj Shastri", "Dharma Bhakta Mathema", "Dashrath Chand", "Lakhan Thapa"],
    correctAnswer: "Lakhan Thapa",
    explanation:
      "Lakhan Thapa is considered the first martyr of Nepal for his resistance against the Rana regime.",
    difficulty: 1
  },
  {
    questionText: "What is the capital city of Nepal?",
    options: ["Pokhara", "Lalitpur", "Kathmandu", "Biratnagar"],
    correctAnswer: "Kathmandu",
    explanation: "Kathmandu is the राजधानी (capital) of Nepal.",
    difficulty: 1
  },
  {
    questionText: "When is Nepal's Constitution Day celebrated?",
    options: ["Bhadra 24", "Ashoj 3", "Mangsir 5", "Jestha 15"],
    correctAnswer: "Ashoj 3",
    explanation: "Nepal celebrates Constitution Day on Ashoj 3 (September 20).",
    difficulty: 1
  },
  {
    questionText: "Which is the longest river in Nepal?",
    options: ["Koshi", "Gandaki", "Karnali", "Bagmati"],
    correctAnswer: "Karnali",
    explanation: "Karnali is the longest river in Nepal.",
    difficulty: 2
  },
  {
    questionText: "Who is the current Chief Justice of Nepal (as per recent data)?",
    options: [
      "Hari Krishna Karki",
      "Bishowambhar Prasad Shrestha",
      "Cholendra Shumsher Rana",
      "Deepak Raj Joshee"
    ],
    correctAnswer: "Bishowambhar Prasad Shrestha",
    explanation: "Bishowambhar Prasad Shrestha has served as Chief Justice of Nepal.",
    difficulty: 2
  },
  {
    questionText: "How many provinces are there in Nepal?",
    options: ["5", "6", "7", "8"],
    correctAnswer: "7",
    explanation: "Nepal is divided into 7 provinces.",
    difficulty: 1
  },
  {
    questionText: "Which mountain is the highest in the world?",
    options: ["K2", "Kanchenjunga", "Everest", "Makalu"],
    correctAnswer: "Everest",
    explanation: "Mount Everest is the highest peak in the world.",
    difficulty: 1
  },
  {
    questionText: "What is the national flower of Nepal?",
    options: ["Rose", "Rhododendron", "Lotus", "Sunflower"],
    correctAnswer: "Rhododendron",
    explanation: "Rhododendron (Lali Gurans) is the national flower of Nepal.",
    difficulty: 1
  },
  {
    questionText: "Which organization conducts Loksewa exams in Nepal?",
    options: ["PSC", "NPC", "NRB", "MoHA"],
    correctAnswer: "PSC",
    explanation: "Public Service Commission (PSC) conducts Loksewa exams.",
    difficulty: 1
  },
  {
    questionText: "When did Nepal become a federal democratic republic?",
    options: ["2005", "2006", "2008", "2015"],
    correctAnswer: "2008",
    explanation: "Nepal was declared a republic in 2008.",
    difficulty: 2
  },
  {
    questionText: "Who wrote the national anthem of Nepal?",
    options: [
      "Madhav Prasad Ghimire",
      "Byakul Maila",
      "Laxmi Prasad Devkota",
      "Bhanubhakta Acharya"
    ],
    correctAnswer: "Byakul Maila",
    explanation: "Byakul Maila wrote Nepal's national anthem.",
    difficulty: 2
  },
  {
    questionText: "What is the currency of Nepal?",
    options: ["Rupee", "Dollar", "Yen", "Taka"],
    correctAnswer: "Rupee",
    explanation: "Nepal uses the Nepalese Rupee (NPR).",
    difficulty: 1
  },
  {
    questionText: "Which is the largest lake in Nepal?",
    options: ["Phewa", "Rara", "Begnas", "Tilicho"],
    correctAnswer: "Rara",
    explanation: "Rara Lake is the largest lake in Nepal.",
    difficulty: 2
  },
  {
    questionText: "Which is the national animal of Nepal?",
    options: ["Tiger", "Cow", "Rhino", "Yak"],
    correctAnswer: "Cow",
    explanation: "Cow is the national animal of Nepal.",
    difficulty: 1
  },
  {
    questionText: "Who is known as the father of Nepali literature?",
    options: ["Devkota", "Bhanubhakta", "Parijat", "Lekhnath"],
    correctAnswer: "Bhanubhakta",
    explanation: "Bhanubhakta Acharya is known as the father of Nepali literature.",
    difficulty: 1
  },
  {
    questionText: "Which district is the smallest in Nepal?",
    options: ["Bhaktapur", "Manang", "Mustang", "Dolpa"],
    correctAnswer: "Bhaktapur",
    explanation: "Bhaktapur is the smallest district in Nepal by area.",
    difficulty: 2
  },
  {
    questionText: "Which body maintains law and order in Nepal?",
    options: ["Nepal Army", "Nepal Police", "Armed Police Force", "NID"],
    correctAnswer: "Nepal Police",
    explanation: "Nepal Police is primarily responsible for maintaining law and order.",
    difficulty: 1
  },
  {
    questionText: "Which is the highest lake in Nepal?",
    options: ["Rara", "Tilicho", "Shey Phoksundo", "Gosaikunda"],
    correctAnswer: "Tilicho",
    explanation: "Tilicho Lake is one of the highest lakes in the world.",
    difficulty: 2
  },
  {
    questionText: "What is the full form of SAARC?",
    options: [
      "South Asian Association for Regional Cooperation",
      "South Asia Regional Council",
      "South Asian Regional Cooperation",
      "South Asia Alliance for Cooperation"
    ],
    correctAnswer: "South Asian Association for Regional Cooperation",
    explanation: "SAARC stands for South Asian Association for Regional Cooperation.",
    difficulty: 1
  },
  {
    questionText: "Where is Lumbini located?",
    options: ["Province 1", "Bagmati", "Lumbini Province", "Karnali"],
    correctAnswer: "Lumbini Province",
    explanation: "Lumbini, birthplace of Buddha, lies in Lumbini Province.",
    difficulty: 1
  },
  {
    questionText: "Who is the founder of Buddhism?",
    options: ["Mahavira", "Confucius", "Gautam Buddha", "Ashoka"],
    correctAnswer: "Gautam Buddha",
    explanation: "Gautam Buddha founded Buddhism.",
    difficulty: 1
  },
  {
    questionText: "What is the literacy rate of Nepal approximately (recent)?",
    options: ["50%", "60%", "70%", "80%"],
    correctAnswer: "70%",
    explanation: "Nepal's literacy rate is around 70% in recent estimates.",
    difficulty: 2
  },
  {
    questionText: "Which is the national bird of Nepal?",
    options: ["Peacock", "Danphe", "Crow", "Eagle"],
    correctAnswer: "Danphe",
    explanation: "Danphe (Himalayan Monal) is the national bird.",
    difficulty: 1
  },
  {
    questionText: "When was Nepal Police established?",
    options: ["2007 BS", "2012 BS", "2010 BS", "2005 BS"],
    correctAnswer: "2012 BS",
    explanation: "Nepal Police was established in 2012 BS.",
    difficulty: 2
  },
  {
    questionText: "Which continent is Nepal located in?",
    options: ["Africa", "Europe", "Asia", "Australia"],
    correctAnswer: "Asia",
    explanation: "Nepal is located in the continent of Asia.",
    difficulty: 1
  }
];

const REASONING_QUESTIONS: Question[] = [
  {
    questionText: "Find the next figure in the series.",
    options: ["A", "B", "C", "D"],
    correctAnswer: "C",
    explanation: "Triangle rotates 90° clockwise.",
    difficulty: 2,
    isImageBased: true,
    imageUrl: "https://colonels-alpha.b-cdn.net/images/reasoning%20test/1.png"
  },
  {
    questionText: "Which option completes the pattern?",
    options: ["A", "B", "C", "D"],
    correctAnswer: "B",
    explanation: "Dots increase step by step.",
    difficulty: 2,
    isImageBased: true,
    imageUrl: "https://colonels-alpha.b-cdn.net/images/reasoning%20test/2.png"
  },
  {
    questionText: "Find the odd figure.",
    options: ["A", "B", "C", "D"],
    correctAnswer: "D",
    explanation: "Only one is not a complete shape.",
    difficulty: 2,
    isImageBased: true,
    imageUrl: "https://colonels-alpha.b-cdn.net/images/reasoning%20test/3.png"
  },
  {
    questionText: "Select the correct mirror image.",
    options: ["A", "B", "C", "D"],
    correctAnswer: "A",
    explanation: "Horizontal flip gives correct mirror.",
    difficulty: 3,
    isImageBased: true,
    imageUrl: "https://colonels-alpha.b-cdn.net/images/reasoning%20test/4.png"
  },
  {
    questionText: "Find the missing figure.",
    options: ["A", "B", "C", "D"],
    correctAnswer: "C",
    explanation: "Pattern alternates between shapes.",
    difficulty: 2,
    isImageBased: true,
    imageUrl: "https://colonels-alpha.b-cdn.net/images/reasoning%20test/5.png"
  },
  {
    questionText: "Find which option contains the given figure.",
    options: ["A", "B", "C", "D"],
    correctAnswer: "B",
    explanation: "Hidden shape matches option B.",
    difficulty: 3,
    isImageBased: true,
    imageUrl: "https://colonels-alpha.b-cdn.net/images/reasoning%20test/6.png"
  },
  {
    questionText: "If a paper is folded and cut, which figure will be formed when unfolded?",
    options: ["A", "B", "C", "D"],
    correctAnswer: "D",
    explanation: "Symmetrical duplication after unfolding.",
    difficulty: 4,
    isImageBased: true,
    imageUrl: "https://colonels-alpha.b-cdn.net/images/reasoning%20test/7.png"
  },
  {
    questionText: "Find the synonym of 'Quick'.",
    options: ["Slow", "Fast", "Late", "Weak"],
    correctAnswer: "Fast",
    explanation: "Quick means fast.",
    difficulty: 1
  },
  {
    questionText: "Choose the odd word.",
    options: ["Dog", "Cat", "Tiger", "Car"],
    correctAnswer: "Car",
    explanation: "Car is not an animal.",
    difficulty: 1
  },
  {
    questionText: "Complete the analogy: Book : Read :: Pen : ?",
    options: ["Write", "Draw", "Ink", "Paper"],
    correctAnswer: "Write",
    explanation: "Pen is used to write.",
    difficulty: 1
  },
  {
    questionText: "Find the antonym of 'Strong'.",
    options: ["Powerful", "Weak", "Hard", "Solid"],
    correctAnswer: "Weak",
    explanation: "Weak is opposite of strong.",
    difficulty: 1
  },
  {
    questionText: "Rearrange letters: 'LPAET'",
    options: ["Plate", "Petal", "Leap", "Pleat"],
    correctAnswer: "Plate",
    explanation: "Correct arrangement forms 'Plate'.",
    difficulty: 2
  },
  {
    questionText: "Complete series: A, C, E, ?",
    options: ["F", "G", "H", "I"],
    correctAnswer: "G",
    explanation: "Skipping one letter each time.",
    difficulty: 2
  },
  {
    questionText: "Choose correct sentence.",
    options: ["He go school", "He goes to school", "He going school", "He gone school"],
    correctAnswer: "He goes to school",
    explanation: "Correct grammar usage.",
    difficulty: 1
  },
  {
    questionText: "Find the odd word.",
    options: ["Apple", "Banana", "Carrot", "Mango"],
    correctAnswer: "Carrot",
    explanation: "Carrot is a vegetable.",
    difficulty: 1
  },
  {
    questionText: "Find next number: 2, 4, 8, 16, ?",
    options: ["18", "24", "32", "30"],
    correctAnswer: "32",
    explanation: "Multiply by 2.",
    difficulty: 1
  },
  {
    questionText: "Find missing number: 3, 9, 27, ?",
    options: ["54", "81", "72", "63"],
    correctAnswer: "81",
    explanation: "Multiply by 3.",
    difficulty: 1
  },
  {
    questionText: "What is 20% of 150?",
    options: ["20", "25", "30", "35"],
    correctAnswer: "30",
    explanation: "20% of 150 = 30.",
    difficulty: 1
  },
  {
    questionText: "Find average of 5, 10, 15.",
    options: ["10", "15", "20", "5"],
    correctAnswer: "10",
    explanation: "Average = sum/3.",
    difficulty: 1
  },
  {
    questionText: "Find next: 5, 10, 20, 40, ?",
    options: ["60", "70", "80", "90"],
    correctAnswer: "80",
    explanation: "Doubling pattern.",
    difficulty: 1
  },
  {
    questionText: "What is 25 × 4?",
    options: ["50", "75", "100", "125"],
    correctAnswer: "100",
    explanation: "25 × 4 = 100.",
    difficulty: 1
  },
  {
    questionText: "If 1 dozen = 12, what is 4 dozen?",
    options: ["36", "48", "52", "60"],
    correctAnswer: "48",
    explanation: "4 × 12 = 48.",
    difficulty: 1
  },
  {
    questionText: "What is 100 ÷ 5?",
    options: ["10", "20", "25", "30"],
    correctAnswer: "20",
    explanation: "100 ÷ 5 = 20.",
    difficulty: 1
  },
  {
    questionText: "A man walks 12 km in 3 hours. Speed?",
    options: ["2", "3", "4", "5"],
    correctAnswer: "4",
    explanation: "Speed = 12/3 = 4 km/h.",
    difficulty: 1
  },
  {
    questionText: "What is 15 + 5 × 2?",
    options: ["20", "25", "30", "35"],
    correctAnswer: "25",
    explanation: "BODMAS rule.",
    difficulty: 1
  }
];

async function main() {
  console.log("🌱 Seeding ASI Questions...");

  try {
    // Get subjects
    const gkSubject = await prisma.subject.findUnique({
      where: { name_position: { name: "GK", position: "ASI" } }
    });

    const reasoningSubject = await prisma.subject.findUnique({
      where: { name_position: { name: "Reasoning", position: "ASI" } }
    });

    if (!gkSubject || !reasoningSubject) {
      throw new Error("Subjects not found. Run seed-asi-mock-tests.ts first.");
    }

    // Get mock tests
    const gkTest = await prisma.mockTest.findUnique({
      where: { id: "test_asi_gk_001" }
    });

    const reasoningTest = await prisma.mockTest.findUnique({
      where: { id: "test_asi_reasoning_001" }
    });

    if (!gkTest || !reasoningTest) {
      throw new Error("Mock tests not found. Run seed-asi-mock-tests.ts first.");
    }

    // Seed GK Questions
    console.log("📝 Adding GK questions...");
    for (let i = 0; i < GK_QUESTIONS.length; i++) {
      const question: Question | undefined = GK_QUESTIONS[i];
      if (!question) continue;

      const position = i + 1;

      await prisma.mockTestQuestion.upsert({
        where: {
          mockTestId_position: {
            mockTestId: gkTest.id,
            position: position
          }
        },
        update: {
          questionText: question.questionText,
          options: question.options,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          difficulty: question.difficulty,
          isImageBased: question.isImageBased || false,
          imageUrl: question.imageUrl || null
        },
        create: {
          mockTestId: gkTest.id,
          questionText: question.questionText,
          options: question.options,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          difficulty: question.difficulty,
          position: position,
          isImageBased: question.isImageBased || false,
          imageUrl: question.imageUrl || null
        }
      });
    }
    console.log(`✓ GK questions seeded (${GK_QUESTIONS.length} total)`);

    // Seed Reasoning Questions
    console.log("📝 Adding Reasoning questions...");
    for (let i = 0; i < REASONING_QUESTIONS.length; i++) {
      const question: Question | undefined = REASONING_QUESTIONS[i];
      if (!question) continue;

      const position = i + 1;

      await prisma.mockTestQuestion.upsert({
        where: {
          mockTestId_position: {
            mockTestId: reasoningTest.id,
            position: position
          }
        },
        update: {
          questionText: question.questionText,
          options: question.options,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          difficulty: question.difficulty,
          isImageBased: question.isImageBased || false,
          imageUrl: question.imageUrl || null
        },
        create: {
          mockTestId: reasoningTest.id,
          questionText: question.questionText,
          options: question.options,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          difficulty: question.difficulty,
          position: position,
          isImageBased: question.isImageBased || false,
          imageUrl: question.imageUrl || null
        }
      });
    }
    console.log(`✓ Reasoning questions seeded (${REASONING_QUESTIONS.length} total)`);

    // Publish tests so they appear to users
    console.log("📢 Publishing tests...");
    await prisma.mockTest.update({
      where: { id: gkTest.id },
      data: { status: "PUBLISHED" }
    });
    console.log("✓ GK test published");

    await prisma.mockTest.update({
      where: { id: reasoningTest.id },
      data: { status: "PUBLISHED" }
    });
    console.log("✓ Reasoning test published");

    console.log("✅ Seeding complete!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
