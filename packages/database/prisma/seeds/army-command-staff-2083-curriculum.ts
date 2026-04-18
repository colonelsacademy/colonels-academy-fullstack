/**
 * Army Command & Staff Course 2083 - Curriculum Seed
 * 
 * This seed creates the complete course structure with:
 * - Free Introduction Module (Module 0)
 * - 5 Paid Chapters (Modules 1-5)
 * - Bundle Offers (Standard & Premium)
 * - Sequential lesson progression
 */

import { PrismaClient, SubjectArea, ContentType, LessonLearningMode, LessonAccessKind, BundleType } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedArmyCommandStaff2083() {
  console.log('🎖️  Seeding Army Command & Staff Course 2083...');

  // Step 1: Create or update the course
  const course = await prisma.course.upsert({
    where: { slug: 'army-command-staff-2083' },
    update: {},
    create: {
      slug: 'army-command-staff-2083',
      title: 'Army Command & Staff Course Entrance Exam Preparation - 2083',
      track: 'army',
      summary: '6-month comprehensive preparation program for Nepal Army Command & Staff Course entrance exam',
      description: `Professional preparation platform for Nepalese Army officers preparing for the Command & Staff Course entrance examination. 
      
This comprehensive 6-month program covers all five subjects with structured study plans, mock exams, and expert guidance.

**Subjects Covered:**
- Military Operations & Administration (100 marks)
- Contemporary Affairs (100 marks)
- Military History & Strategic Thoughts (100 marks)
- Armed Conflicts - Appreciation & Plans (100 marks)
- Lecturette (100 marks)

**Total: 500 marks**`,
      level: 'Advanced',
      durationLabel: '6 months',
      lessonCount: 0, // Will be updated after lessons are created
      priceNpr: 20000, // Total if bought separately
      originalPriceNpr: 20000,
      accentColor: '#1a4d2e', // Military green
      heroImageUrl: '/images/courses/army-command-staff-2083-hero.jpg',
      isFeatured: true,
      isComingSoon: false,
      assessmentWeighting: {
        subjects: [
          { name: 'Military Operations & Administration', weight: 100, percentage: 20 },
          { name: 'Contemporary Affairs', weight: 100, percentage: 20 },
          { name: 'Military History & Strategic Thoughts', weight: 100, percentage: 20 },
          { name: 'Armed Conflicts - Appreciation & Plans', weight: 100, percentage: 20 },
          { name: 'Lecturette', weight: 100, percentage: 20 }
        ],
        total: 500
      }
    }
  });

  console.log(`✅ Course created: ${course.title}`);

  // Step 2: Create FREE Introduction Module (Module 0)
  const introModule = await prisma.module.upsert({
    where: {
      courseId_position: {
        courseId: course.id,
        position: 0
      }
    },
    update: {},
    create: {
      courseId: course.id,
      title: 'Introduction: Vision, Mission & Course Overview',
      position: 0,
      phaseNumber: 0,
      chapterNumber: 0,
      chapterPrice: 0,
      isLocked: false,
      isFreeIntro: true,
      componentCode: 'INTRO',
      componentLabel: 'Free Introduction',
      completionCriteria: {
        requiredLessons: [],
        minCompletionPercentage: 0
      }
    }
  });

  console.log(`✅ Free Introduction Module created`);

  // Create introduction lessons
  const introLessons = [
    {
      title: 'Welcome to Army Command & Staff Course 2083',
      synopsis: 'Introduction to the platform and course structure',
      contentType: ContentType.VIDEO,
      durationMinutes: 10,
      position: 1
    },
    {
      title: 'Vision, Mission, and Objectives',
      synopsis: 'Understanding our commitment to officer preparation and success',
      contentType: ContentType.TEXT,
      durationMinutes: 5,
      position: 2,
      lessonContent: {
        sections: [
          {
            heading: 'Our Vision',
            content: 'To empower officers with structured, comprehensive, and modern learning tools that enhance their readiness for the Army Command & Staff Course entrance exam.'
          },
          {
            heading: 'Our Mission',
            content: 'To provide accessible, flexible, and interactive study resources that combine individual effort, faculty guidance, and peer collaboration.'
          },
          {
            heading: 'Objectives',
            points: [
              'Equip officers with a clear understanding of exam requirements',
              'Provide structured study plans and timelines',
              'Facilitate practice through quizzes, mock exams, and feedback systems',
              'Foster confidence, discipline, and analytical skills essential for success'
            ]
          }
        ]
      }
    },
    {
      title: 'Course Overview & Structure',
      synopsis: 'Complete breakdown of the 6-month preparation program',
      contentType: ContentType.TEXT,
      durationMinutes: 10,
      position: 3,
      lessonContent: {
        sections: [
          {
            heading: 'Program Duration',
            content: '6-month comprehensive preparation program'
          },
          {
            heading: 'Subjects Covered',
            subjects: [
              { name: 'Military Operations & Administration', marks: 100, description: 'Tactics & Administration' },
              { name: 'Contemporary Affairs', marks: 100, description: 'Current Affairs' },
              { name: 'Military History & Strategic Thoughts', marks: 100, description: 'Military History' },
              { name: 'Armed Conflicts', marks: 100, description: 'Military Appreciation & Plans' },
              { name: 'Lecturette', marks: 100, description: 'Lecture Methodology' }
            ]
          },
          {
            heading: 'Learning Outcomes',
            points: [
              'Develop analytical and decision-making skills',
              'Strengthen knowledge of military history, law, and technology',
              'Enhance oral communication and presentation skills',
              'Build confidence in exam-taking strategies'
            ]
          }
        ]
      }
    },
    {
      title: 'How to Use This Platform',
      synopsis: 'Guide to navigating the course and maximizing your learning',
      contentType: ContentType.VIDEO,
      durationMinutes: 15,
      position: 4
    }
  ];

  for (const lessonData of introLessons) {
    await prisma.lesson.upsert({
      where: {
        courseId_position: {
          courseId: course.id,
          position: lessonData.position
        }
      },
      update: {},
      create: {
        ...lessonData,
        courseId: course.id,
        moduleId: introModule.id,
        learningMode: LessonLearningMode.LESSON,
        accessKind: LessonAccessKind.PREVIEW, // Free preview
        isRequired: false,
        completionWeight: 0
      }
    });
  }

  console.log(`✅ Created ${introLessons.length} introduction lessons`);

  // Step 3: Create Chapter 1 - Military Operations & Administration
  const chapter1 = await prisma.module.upsert({
    where: {
      courseId_position: {
        courseId: course.id,
        position: 1
      }
    },
    update: {},
    create: {
      courseId: course.id,
      title: 'Chapter 1: Military Operations & Administration',
      position: 1,
      phaseNumber: 1,
      subjectArea: SubjectArea.TACTICS_ADMIN,
      chapterNumber: 1,
      chapterPrice: 5000,
      isLocked: true,
      isFreeIntro: false,
      componentCode: 'MOA',
      componentLabel: 'Military Operations & Administration',
      completionCriteria: {
        requiredLessons: 25,
        minCompletionPercentage: 100,
        minQuizScore: 70
      }
    }
  });

  console.log(`✅ Chapter 1 created: ${chapter1.title}`);

  // Create Chapter 1 lessons (25 lessons)
  const chapter1Lessons = [
    { title: 'Operation of War', synopsis: 'Fundamentals of military operations', durationMinutes: 45, referencePages: '002-Tac, Pg 2-32' },
    { title: 'Patrolling Tactics', synopsis: 'Reconnaissance and combat patrols', durationMinutes: 60, referencePages: '002-Tac, Pg 33-68' },
    { title: 'Raid Operations', synopsis: 'Planning and executing raids', durationMinutes: 50, referencePages: '002-Tac, Pg 69-100' },
    { title: 'Ambush Tactics', synopsis: 'Ambush planning and execution', durationMinutes: 50, referencePages: '002-Tac, Pg 101-130' },
    { title: 'Infantry Operations', synopsis: 'Infantry tactics and formations', durationMinutes: 45, referencePages: '002-Tac, Pg 131-160' },
    { title: 'Armor Operations', synopsis: 'Tank and armored vehicle tactics', durationMinutes: 40, referencePages: '002-Tac, Pg 161-185' },
    { title: 'Artillery Support', synopsis: 'Fire support coordination', durationMinutes: 40, referencePages: '002-Tac, Pg 186-210' },
    { title: 'Air Defence Operations', synopsis: 'Anti-aircraft defense systems', durationMinutes: 35, referencePages: '002-Tac, Pg 211-235' },
    { title: 'Engineer Operations', synopsis: 'Combat engineering and obstacles', durationMinutes: 35, referencePages: '002-Tac, Pg 236-260' },
    { title: 'Signal Operations', synopsis: 'Military communications', durationMinutes: 30, referencePages: '002-Tac, Pg 261-280' },
    { title: 'Special Forces Operations', synopsis: 'Special operations tactics', durationMinutes: 40, referencePages: '002-Tac, Pg 281-310' },
    { title: 'Mountain Warfare', synopsis: 'High-altitude combat operations', durationMinutes: 45, referencePages: '002-Tac, Pg 311-345' },
    { title: 'Jungle Warfare', synopsis: 'Tropical environment operations', durationMinutes: 40, referencePages: '002-Tac, Pg 346-375' },
    { title: 'Counter Insurgency', synopsis: 'COIN operations and tactics', durationMinutes: 50, referencePages: '002-Tac, Pg 376-415' },
    { title: 'Urban Warfare', synopsis: 'Fighting in built-up areas', durationMinutes: 45, referencePages: '002-Tac, Pg 416-450' },
    { title: 'Peacekeeping Operations', synopsis: 'UN peacekeeping missions', durationMinutes: 40, referencePages: '002-Tac, Pg 451-480' },
    { title: 'Intelligence & Security', synopsis: 'Military intelligence operations', durationMinutes: 35, referencePages: '002-Tac, Pg 481-505' },
    { title: 'Administration in War', synopsis: 'Wartime administrative procedures', durationMinutes: 30, referencePages: '001-SD, Pg 2-25' },
    { title: 'Administration in Peace', synopsis: 'Peacetime administrative duties', durationMinutes: 25, referencePages: '001-SD, Pg 26-45' },
    { title: 'Training Methods', synopsis: 'Military training principles', durationMinutes: 35, referencePages: '001-SD, Pg 46-70' },
    { title: 'Leadership Principles', synopsis: 'Military leadership fundamentals', durationMinutes: 40, referencePages: '001-SD, Pg 71-100' },
    { title: 'Man Management', synopsis: 'Personnel management skills', durationMinutes: 35, referencePages: '001-SD, Pg 101-125' },
    { title: 'Nepal Army Organization', synopsis: 'Structure and organization', durationMinutes: 25, referencePages: '001-SD, Pg 126-145' },
    { title: 'Military Act & Laws', synopsis: 'Military legal framework', durationMinutes: 30, referencePages: '001-SD, Pg 146-170' },
    { title: 'Logistics System', synopsis: 'Military supply chain management', durationMinutes: 40, referencePages: '001-SD, Pg 171-200' }
  ];

  let lessonPosition = 5; // Continue from intro lessons
  for (const lessonData of chapter1Lessons) {
    await prisma.lesson.upsert({
      where: {
        courseId_position: {
          courseId: course.id,
          position: lessonPosition
        }
      },
      update: {},
      create: {
        ...lessonData,
        courseId: course.id,
        moduleId: chapter1.id,
        position: lessonPosition,
        contentType: ContentType.VIDEO,
        learningMode: LessonLearningMode.LESSON,
        accessKind: LessonAccessKind.STANDARD,
        isRequired: true,
        completionWeight: 1
      }
    });
    lessonPosition++;
  }

  console.log(`✅ Created ${chapter1Lessons.length} lessons for Chapter 1`);

  // Step 4: Create remaining chapters (2-5) with placeholder structure
  const chapters = [
    {
      position: 2,
      title: 'Chapter 2: Contemporary Affairs',
      subjectArea: SubjectArea.CURRENT_AFFAIRS,
      chapterNumber: 2,
      chapterPrice: 3500,
      lessonCount: 15
    },
    {
      position: 3,
      title: 'Chapter 3: Military History & Strategic Thoughts',
      subjectArea: SubjectArea.MILITARY_HISTORY_STRATEGY,
      chapterNumber: 3,
      chapterPrice: 4000,
      lessonCount: 20
    },
    {
      position: 4,
      title: 'Chapter 4: Armed Conflicts - Appreciation & Plans',
      subjectArea: SubjectArea.APPRECIATION_PLANS,
      chapterNumber: 4,
      chapterPrice: 4500,
      lessonCount: 15
    },
    {
      position: 5,
      title: 'Chapter 5: Lecturette',
      subjectArea: SubjectArea.LECTURETTE,
      chapterNumber: 5,
      chapterPrice: 3000,
      lessonCount: 10
    }
  ];

  for (const chapterData of chapters) {
    const chapter = await prisma.module.upsert({
      where: {
        courseId_position: {
          courseId: course.id,
          position: chapterData.position
        }
      },
      update: {},
      create: {
        courseId: course.id,
        title: chapterData.title,
        position: chapterData.position,
        phaseNumber: chapterData.position <= 2 ? 1 : chapterData.position <= 4 ? 2 : 3,
        subjectArea: chapterData.subjectArea,
        chapterNumber: chapterData.chapterNumber,
        chapterPrice: chapterData.chapterPrice,
        isLocked: true,
        isFreeIntro: false,
        componentCode: `CH${chapterData.chapterNumber}`,
        componentLabel: chapterData.title,
        completionCriteria: {
          requiredLessons: chapterData.lessonCount,
          minCompletionPercentage: 100,
          minQuizScore: 70
        }
      }
    });

    console.log(`✅ ${chapter.title} created`);

    // Create placeholder lessons for each chapter
    for (let i = 1; i <= chapterData.lessonCount; i++) {
      await prisma.lesson.upsert({
        where: {
          courseId_position: {
            courseId: course.id,
            position: lessonPosition
          }
        },
        update: {},
        create: {
          courseId: course.id,
          moduleId: chapter.id,
          title: `${chapterData.title} - Lesson ${i}`,
          synopsis: `Lesson ${i} content for ${chapterData.title}`,
          position: lessonPosition,
          durationMinutes: 30,
          contentType: ContentType.VIDEO,
          learningMode: LessonLearningMode.LESSON,
          accessKind: LessonAccessKind.STANDARD,
          isRequired: true,
          completionWeight: 1
        }
      });
      lessonPosition++;
    }

    console.log(`✅ Created ${chapterData.lessonCount} placeholder lessons for ${chapter.title}`);
  }

  // Step 5: Create Bundle Offers
  // Check if standard bundle exists
  const existingStandardBundle = await prisma.courseBundleOffer.findFirst({
    where: {
      courseId: course.id,
      bundleType: BundleType.STANDARD
    }
  });

  const standardBundle = existingStandardBundle
    ? await prisma.courseBundleOffer.update({
        where: { id: existingStandardBundle.id },
        data: {
          title: 'Standard Bundle - Complete Course Access',
          description: `Get all 5 chapters at a discounted price!

**Includes:**
- All 5 chapters (85+ lessons)
- 3 comprehensive mock exams
- Official completion certificate
- Structured 6-month study schedule
- Progress tracking and analytics

**Save NPR 2,000** compared to buying chapters individually!`,
          includedChapters: [1, 2, 3, 4, 5],
          originalPrice: 20000,
          bundlePrice: 18000,
          discount: 2000,
          includesMentorAccess: false,
          includesMockExams: true,
          includesCertificate: true,
          includesLiveClasses: false,
          mockExamCount: 3,
          isActive: true
        }
      })
    : await prisma.courseBundleOffer.create({
        data: {
          courseId: course.id,
          bundleType: BundleType.STANDARD,
          title: 'Standard Bundle - Complete Course Access',
          description: `Get all 5 chapters at a discounted price!

**Includes:**
- All 5 chapters (85+ lessons)
- 3 comprehensive mock exams
- Official completion certificate
- Structured 6-month study schedule
- Progress tracking and analytics

**Save NPR 2,000** compared to buying chapters individually!`,
          includedChapters: [1, 2, 3, 4, 5],
          originalPrice: 20000,
          bundlePrice: 18000,
          discount: 2000,
          includesMentorAccess: false,
          includesMockExams: true,
          includesCertificate: true,
          includesLiveClasses: false,
          mockExamCount: 3,
          isActive: true
        }
      });

  const existingPremiumBundle = await prisma.courseBundleOffer.findFirst({
    where: {
      courseId: course.id,
      bundleType: BundleType.PREMIUM
    }
  });

  const premiumBundle = existingPremiumBundle
    ? await prisma.courseBundleOffer.update({
        where: { id: existingPremiumBundle.id },
        data: {
          title: 'Premium Bundle - Complete Course + Mentorship',
          description: `The ultimate preparation package with personal mentorship!

**Includes Everything in Standard Bundle PLUS:**
- Personal mentor access for guidance
- 5 comprehensive mock exams (2 extra)
- 10 live classes with expert instructors
- Priority support (24-hour response)
- Personalized study plan
- Detailed performance reports
- One-on-one feedback sessions

**Save NPR 7,000** and get premium features!`,
          includedChapters: [1, 2, 3, 4, 5],
          originalPrice: 32000,
          bundlePrice: 25000,
          discount: 7000,
          includesMentorAccess: true,
          includesMockExams: true,
          includesCertificate: true,
          includesLiveClasses: true,
          mockExamCount: 5,
          liveClassCount: 10,
          isActive: true
        }
      })
    : await prisma.courseBundleOffer.create({
        data: {
          courseId: course.id,
          bundleType: BundleType.PREMIUM,
          title: 'Premium Bundle - Complete Course + Mentorship',
          description: `The ultimate preparation package with personal mentorship!

**Includes Everything in Standard Bundle PLUS:**
- Personal mentor access for guidance
- 5 comprehensive mock exams (2 extra)
- 10 live classes with expert instructors
- Priority support (24-hour response)
- Personalized study plan
- Detailed performance reports
- One-on-one feedback sessions

**Save NPR 7,000** and get premium features!`,
          includedChapters: [1, 2, 3, 4, 5],
          originalPrice: 32000,
          bundlePrice: 25000,
          discount: 7000,
          includesMentorAccess: true,
          includesMockExams: true,
          includesCertificate: true,
          includesLiveClasses: true,
          mockExamCount: 5,
          liveClassCount: 10,
          isActive: true
        }
      });

  console.log(`✅ Bundle offers created:`);
  console.log(`   - ${standardBundle.title}: NPR ${standardBundle.bundlePrice}`);
  console.log(`   - ${premiumBundle.title}: NPR ${premiumBundle.bundlePrice}`);

  // Update course lesson count
  const totalLessons = await prisma.lesson.count({
    where: { courseId: course.id }
  });

  await prisma.course.update({
    where: { id: course.id },
    data: { lessonCount: totalLessons }
  });

  console.log(`\n🎉 Army Command & Staff Course 2083 seeded successfully!`);
  console.log(`   - Total lessons: ${totalLessons}`);
  console.log(`   - Free introduction: 4 lessons`);
  console.log(`   - Paid chapters: 5 chapters (${totalLessons - 4} lessons)`);
  console.log(`   - Bundle offers: 2 (Standard & Premium)`);
}
