/**
 * Seed Cambridge curriculum data into Supabase.
 * Usage: NEXT_PUBLIC_SUPABASE_URL=... NEXT_PUBLIC_SUPABASE_ANON_KEY=... node scripts/seed-curriculum.mjs
 *
 * Or: copy the .env.local values and run directly.
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// ── Load env from .env.local if available ──────────────────────────────────────
try {
  const env = readFileSync('.env.local', 'utf-8');
  for (const line of env.split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.+)/);
    if (m) process.env[m[1]] = m[2].trim();
  }
} catch { /* ignored */ }

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) { console.error('Missing SUPABASE env vars'); process.exit(1); }

const supabase = createClient(url, key);

// ═══════════════════════════════════════════════════════════════════════════════
// CURRICULUM DATA — Cambridge aligned
// ═══════════════════════════════════════════════════════════════════════════════

const PRIMARY_SUBJECTS = ['Mathematics', 'Science', 'English Language', 'Arabic Language', 'Islamic Studies', 'ICT'];
const LOWER_SECONDARY_SUBJECTS = ['Mathematics', 'Biology', 'Chemistry', 'Physics', 'English Language', 'Arabic Language', 'Islamic Studies', 'ICT'];

// ── Topic + objective definitions per subject ──────────────────────────────────
// Each subject maps to an array of topics, each with objectives.
// Objectives use grade-specific codes like {G}Ma1 where {G} = grade number.

const CURRICULUM = {
  'Mathematics': {
    primary: [
      { name: 'Numbers and Place Value', desc: 'Understanding whole numbers, place value, and number representation',
        objectives: [
          'Count, read, and write numbers in numerals and words',
          'Understand the place value of each digit in a number',
          'Compare and order numbers using < > = symbols',
          'Round numbers to the nearest 10, 100, or 1000',
        ]},
      { name: 'Addition and Subtraction', desc: 'Mental and written methods for addition and subtraction',
        objectives: [
          'Add and subtract numbers mentally with increasing fluency',
          'Use formal written methods of columnar addition and subtraction',
          'Solve addition and subtraction word problems in context',
          'Estimate answers and use inverse operations to check',
        ]},
      { name: 'Multiplication and Division', desc: 'Multiplication tables, factors, and division strategies',
        objectives: [
          'Recall and use multiplication and division facts',
          'Use formal written methods for multiplication and division',
          'Identify factors, multiples, and prime numbers',
        ]},
      { name: 'Fractions, Decimals, and Percentages', desc: 'Understanding parts of a whole and equivalences',
        objectives: [
          'Recognise, find, and name fractions of shapes and quantities',
          'Compare and order fractions, including equivalences',
          'Understand the relationship between fractions, decimals, and percentages',
          'Add and subtract fractions with the same and different denominators',
        ]},
      { name: 'Geometry and Measurement', desc: 'Properties of shapes, position, and units of measure',
        objectives: [
          'Identify and describe properties of 2D and 3D shapes',
          'Measure and calculate length, mass, capacity, and time',
          'Understand perimeter, area, and volume',
          'Identify lines of symmetry and describe position using coordinates',
          'Estimate and compare angles',
        ]},
      { name: 'Statistics and Data Handling', desc: 'Collecting, presenting, and interpreting data',
        objectives: [
          'Collect and organise data into tables and charts',
          'Interpret bar charts, pictograms, and line graphs',
          'Calculate the mean, mode, and median of a data set',
        ]},
    ],
    secondary: [
      { name: 'Number and Algebra', desc: 'Integers, indices, algebraic expressions, and equations',
        objectives: [
          'Use the four operations with integers, fractions, and decimals',
          'Understand and use index notation and laws of indices',
          'Simplify and manipulate algebraic expressions',
          'Solve linear equations and inequalities',
        ]},
      { name: 'Functions and Graphs', desc: 'Linear and non-linear functions, coordinate geometry',
        objectives: [
          'Plot and interpret graphs of linear functions',
          'Understand gradient and y-intercept of straight lines',
          'Recognise and sketch quadratic and simple polynomial graphs',
          'Use graphs to solve simultaneous equations',
        ]},
      { name: 'Geometry', desc: 'Angles, polygons, transformations, and constructions',
        objectives: [
          'Calculate angles in triangles, quadrilaterals, and parallel lines',
          'Understand and apply properties of congruent and similar shapes',
          'Perform and describe transformations: reflection, rotation, translation, enlargement',
          'Construct triangles and bisectors using ruler and compasses',
          'Apply Pythagoras\u2019 theorem',
        ]},
      { name: 'Probability and Statistics', desc: 'Probability theory and statistical analysis',
        objectives: [
          'Calculate theoretical and experimental probability',
          'Construct and interpret frequency tables and diagrams',
          'Calculate mean, median, mode, and range',
          'Compare distributions using averages and measures of spread',
        ]},
      { name: 'Ratio and Proportion', desc: 'Ratio, direct and inverse proportion, rates',
        objectives: [
          'Simplify and use ratios to compare quantities',
          'Divide a quantity in a given ratio',
          'Solve problems involving direct and inverse proportion',
        ]},
    ],
  },

  'Science': {
    primary: [
      { name: 'Living Things and Habitats', desc: 'Classifying organisms, habitats, and life cycles',
        objectives: [
          'Group living things based on observable features',
          'Identify and describe habitats and how organisms adapt',
          'Describe the life cycles of plants and animals',
          'Understand food chains and food webs',
        ]},
      { name: 'The Human Body', desc: 'Body systems, health, and nutrition',
        objectives: [
          'Identify and name the main parts of the human body',
          'Describe the functions of the skeleton and muscles',
          'Understand the importance of a balanced diet',
          'Describe the function of the heart, lungs, and digestive system',
        ]},
      { name: 'Materials and Their Properties', desc: 'Solids, liquids, gases, and material changes',
        objectives: [
          'Compare and group materials based on their properties',
          'Understand the differences between solids, liquids, and gases',
          'Describe reversible and irreversible changes',
        ]},
      { name: 'Forces and Energy', desc: 'Types of forces, energy sources, and simple machines',
        objectives: [
          'Identify pushes, pulls, and friction as forces',
          'Understand the effect of forces on movement',
          'Identify sources of light, sound, and electricity',
          'Describe how circuits work and draw circuit diagrams',
          'Understand renewable and non-renewable energy sources',
        ]},
      { name: 'Earth and Space', desc: 'The solar system, seasons, and Earth\u2019s features',
        objectives: [
          'Describe the movement of the Earth relative to the Sun',
          'Explain day and night, and the seasons',
          'Identify features of the Earth\u2019s surface and weather patterns',
        ]},
    ],
    secondary: null, // Biology/Chemistry/Physics replace Science for Grades 7-9
  },

  'Biology': {
    primary: null,
    secondary: [
      { name: 'Cells and Organisation', desc: 'Cell structure, specialisation, and levels of organisation',
        objectives: [
          'Describe the structure of plant and animal cells',
          'Explain the functions of cell organelles',
          'Understand cell specialisation and levels of organisation',
          'Use a microscope to observe cells',
        ]},
      { name: 'Nutrition and Digestion', desc: 'Nutrients, enzymes, and the digestive system',
        objectives: [
          'Identify the main nutrient groups and their functions',
          'Describe the structure and function of the digestive system',
          'Explain the role of enzymes in digestion',
        ]},
      { name: 'Respiration and Gas Exchange', desc: 'Aerobic and anaerobic respiration, lungs',
        objectives: [
          'Describe aerobic and anaerobic respiration',
          'Explain the structure and function of the lungs',
          'Understand gas exchange in the alveoli',
          'Compare aerobic and anaerobic respiration',
        ]},
      { name: 'Ecosystems and Biodiversity', desc: 'Interactions in ecosystems, adaptation, and extinction',
        objectives: [
          'Describe feeding relationships using food chains and food webs',
          'Explain how organisms adapt to their environment',
          'Understand the impact of human activity on ecosystems',
        ]},
      { name: 'Reproduction and Inheritance', desc: 'Human reproduction, genetics, and variation',
        objectives: [
          'Describe the human reproductive system',
          'Understand the stages of the menstrual cycle',
          'Explain inheritance using simple genetic diagrams',
          'Describe variation within a species',
        ]},
    ],
  },

  'Chemistry': {
    primary: null,
    secondary: [
      { name: 'States of Matter', desc: 'Particle theory, changes of state, and diffusion',
        objectives: [
          'Describe the arrangement and movement of particles in solids, liquids, and gases',
          'Explain changes of state in terms of particle theory',
          'Describe diffusion in terms of particle movement',
        ]},
      { name: 'Atoms, Elements, and Compounds', desc: 'Atomic structure, periodic table, and bonding',
        objectives: [
          'Describe the structure of an atom (protons, neutrons, electrons)',
          'Use the periodic table to identify elements and their properties',
          'Distinguish between elements, compounds, and mixtures',
          'Write word equations and simple chemical formulae',
        ]},
      { name: 'Chemical Reactions', desc: 'Types of reactions, conservation of mass, and energy changes',
        objectives: [
          'Identify signs that a chemical reaction has taken place',
          'Describe combustion, oxidation, and neutralisation reactions',
          'Understand conservation of mass in chemical reactions',
          'Write balanced symbol equations',
        ]},
      { name: 'Acids, Bases, and Salts', desc: 'pH scale, indicators, and neutralisation',
        objectives: [
          'Use the pH scale and indicators to classify acids and alkalis',
          'Describe neutralisation reactions and their products',
          'Explain everyday applications of acids and alkalis',
        ]},
      { name: 'The Earth and Atmosphere', desc: 'Rocks, resources, and atmospheric composition',
        objectives: [
          'Describe the composition of the Earth\u2019s atmosphere',
          'Explain the carbon cycle and its importance',
          'Describe how human activities affect the atmosphere',
          'Identify types of rocks and the rock cycle',
        ]},
    ],
  },

  'Physics': {
    primary: null,
    secondary: [
      { name: 'Forces and Motion', desc: 'Speed, acceleration, Newton\u2019s laws, and pressure',
        objectives: [
          'Calculate speed, distance, and time',
          'Describe the effects of balanced and unbalanced forces',
          'Explain Newton\u2019s three laws of motion',
          'Calculate pressure in solids and fluids',
        ]},
      { name: 'Energy and Power', desc: 'Energy stores, transfers, and efficiency',
        objectives: [
          'Identify energy stores and transfers',
          'Calculate kinetic energy, gravitational potential energy, and work done',
          'Understand the conservation of energy',
          'Calculate efficiency and power',
        ]},
      { name: 'Waves and Sound', desc: 'Wave properties, sound, and the electromagnetic spectrum',
        objectives: [
          'Describe the properties of transverse and longitudinal waves',
          'Explain how sound is produced and travels',
          'Describe the electromagnetic spectrum and its uses',
          'Understand reflection and refraction of light',
        ]},
      { name: 'Electricity and Magnetism', desc: 'Circuits, current, voltage, and magnetic fields',
        objectives: [
          'Draw and interpret circuit diagrams with standard symbols',
          'Understand current, voltage, and resistance in series and parallel circuits',
          'Describe magnetic fields and the behaviour of electromagnets',
          'Calculate using V = IR',
        ]},
      { name: 'Space and the Universe', desc: 'The solar system, gravity, and space exploration',
        objectives: [
          'Describe the structure of the solar system',
          'Explain the role of gravity in orbital motion',
          'Describe the life cycle of stars',
        ]},
    ],
  },

  'English Language': {
    primary: [
      { name: 'Reading Comprehension', desc: 'Understanding texts, inference, and vocabulary',
        objectives: [
          'Read and understand a range of fiction and non-fiction texts',
          'Identify main ideas, themes, and key details in a text',
          'Make inferences and predictions supported by evidence',
          'Understand and use a wide range of vocabulary in context',
        ]},
      { name: 'Writing Composition', desc: 'Planning, drafting, and writing for different purposes',
        objectives: [
          'Plan and write narratives with a clear structure',
          'Write for different purposes: to inform, persuade, and entertain',
          'Use paragraphs to organise ideas logically',
          'Edit and improve writing for clarity and effect',
        ]},
      { name: 'Grammar and Punctuation', desc: 'Sentence structure, tenses, and punctuation rules',
        objectives: [
          'Use correct sentence structures including compound and complex sentences',
          'Apply correct punctuation: full stops, commas, apostrophes, speech marks',
          'Use verb tenses correctly and consistently',
        ]},
      { name: 'Spelling and Vocabulary', desc: 'Spelling patterns, prefixes, suffixes, and word roots',
        objectives: [
          'Spell words correctly using common patterns and rules',
          'Use prefixes and suffixes to build and understand new words',
          'Use a dictionary and thesaurus effectively',
        ]},
      { name: 'Speaking and Listening', desc: 'Oral communication, discussion, and presentation',
        objectives: [
          'Speak clearly and confidently in different contexts',
          'Listen actively and respond appropriately',
          'Participate in group discussions and present ideas',
          'Use Standard English in formal situations',
        ]},
    ],
    secondary: [
      { name: 'Reading Analysis', desc: 'Analysing language, structure, and writer\u2019s craft',
        objectives: [
          'Analyse how writers use language for effect',
          'Identify and comment on structural features of texts',
          'Compare texts by theme, style, and audience',
          'Evaluate the effectiveness of a text\u2019s argument or narrative',
        ]},
      { name: 'Narrative and Creative Writing', desc: 'Crafting stories, descriptions, and poetry',
        objectives: [
          'Write compelling narratives using literary techniques',
          'Create vivid descriptions using figurative language',
          'Develop complex characters and settings',
          'Experiment with form and structure in creative writing',
        ]},
      { name: 'Non-fiction and Transactional Writing', desc: 'Articles, reports, speeches, and letters',
        objectives: [
          'Write persuasive texts using rhetorical devices',
          'Structure reports and articles using appropriate conventions',
          'Adapt tone and register for different audiences',
        ]},
      { name: 'Grammar and Syntax', desc: 'Advanced sentence construction and accuracy',
        objectives: [
          'Use a variety of sentence structures for effect',
          'Ensure grammatical accuracy in extended writing',
          'Use punctuation to enhance meaning and clarity',
          'Identify and correct common grammatical errors',
        ]},
      { name: 'Speaking, Listening, and Presentation', desc: 'Formal speaking, debate, and critical listening',
        objectives: [
          'Deliver structured presentations with confidence',
          'Engage in formal debate using evidence and reasoning',
          'Critically evaluate spoken arguments and presentations',
        ]},
    ],
  },

  'Arabic Language': {
    primary: [
      { name: 'Reading and Comprehension', desc: 'Reading Arabic texts with understanding',
        objectives: [
          'Read Arabic texts fluently with correct pronunciation (tajweed basics)',
          'Understand the main ideas and details in short Arabic passages',
          'Answer comprehension questions based on grade-level texts',
        ]},
      { name: 'Writing and Composition', desc: 'Writing sentences, paragraphs, and short essays in Arabic',
        objectives: [
          'Write sentences and short paragraphs using correct Arabic grammar',
          'Compose short essays on familiar topics',
          'Use appropriate vocabulary and expressions',
          'Apply correct punctuation in Arabic writing',
        ]},
      { name: 'Grammar (Nahw)', desc: 'Arabic sentence structure and grammatical rules',
        objectives: [
          'Identify nouns, verbs, and particles in sentences',
          'Understand and apply basic case endings (i\u2019rab)',
          'Construct nominal and verbal sentences correctly',
        ]},
      { name: 'Vocabulary and Expression', desc: 'Building Arabic vocabulary and oral expression',
        objectives: [
          'Use grade-appropriate Arabic vocabulary in context',
          'Express ideas clearly in spoken Arabic',
          'Use dictionaries to find word meanings and roots',
        ]},
      { name: 'Handwriting and Dictation', desc: 'Arabic script, letter formation, and spelling',
        objectives: [
          'Write Arabic letters correctly in all positions',
          'Copy and write from dictation with accuracy',
          'Distinguish between similar-sounding Arabic letters',
        ]},
    ],
    secondary: [
      { name: 'Literary Analysis', desc: 'Analysing Arabic poetry, prose, and rhetoric',
        objectives: [
          'Analyse themes and literary devices in Arabic texts',
          'Understand the structure and features of Arabic poetry',
          'Evaluate the effectiveness of rhetorical techniques (balagha)',
          'Compare classical and modern Arabic literary styles',
        ]},
      { name: 'Advanced Grammar', desc: 'Complex grammatical structures and morphology',
        objectives: [
          'Apply advanced grammatical rules including conditional sentences',
          'Understand verb patterns (awzan) and their meanings',
          'Analyse complex sentence structures',
        ]},
      { name: 'Essay Writing', desc: 'Extended writing in formal and creative Arabic',
        objectives: [
          'Write structured argumentative and discursive essays',
          'Use formal Arabic register appropriately',
          'Support arguments with evidence and examples',
          'Edit and refine extended Arabic compositions',
        ]},
      { name: 'Oral Communication', desc: 'Formal Arabic speech and discussion',
        objectives: [
          'Present ideas in formal Standard Arabic',
          'Engage in structured Arabic discussions and debates',
          'Summarise and report on Arabic texts orally',
        ]},
      { name: 'Media and Modern Arabic', desc: 'Understanding Arabic in media, news, and digital contexts',
        objectives: [
          'Read and analyse Arabic news articles and media texts',
          'Understand register differences across Arabic media',
          'Write reports and summaries based on Arabic media sources',
        ]},
    ],
  },

  'Islamic Studies': {
    primary: [
      { name: 'Quran Recitation and Memorisation', desc: 'Learning to recite and memorise selected surahs',
        objectives: [
          'Recite short surahs from Juz Amma with correct tajweed',
          'Memorise prescribed surahs for the grade level',
          'Understand the basic meanings of memorised surahs',
        ]},
      { name: 'Aqeedah (Beliefs)', desc: 'Core Islamic beliefs and articles of faith',
        objectives: [
          'Explain the six articles of Islamic faith',
          'Describe the attributes of Allah from the Quran',
          'Name and describe the roles of key prophets',
        ]},
      { name: 'Fiqh (Worship and Practice)', desc: 'Islamic worship, prayer, and daily practices',
        objectives: [
          'Describe and demonstrate the steps of wudu and prayer',
          'Explain the five pillars of Islam',
          'Understand the significance of Ramadan, Hajj, and Zakat',
          'Apply Islamic etiquette in daily life',
        ]},
      { name: 'Seerah (Life of the Prophet)', desc: 'Key events from the life of Prophet Muhammad (PBUH)',
        objectives: [
          'Narrate key events from the life of the Prophet (PBUH)',
          'Describe the character and qualities of the Prophet (PBUH)',
          'Identify lessons from the Seerah applicable to daily life',
        ]},
      { name: 'Islamic Character and Ethics', desc: 'Moral values, manners, and social responsibility',
        objectives: [
          'Identify and practise key Islamic moral values (honesty, kindness, respect)',
          'Describe the importance of family and community in Islam',
          'Explain Islamic teachings on caring for the environment',
        ]},
    ],
    secondary: [
      { name: 'Quran Study and Tafseer', desc: 'In-depth Quran study with interpretation',
        objectives: [
          'Recite prescribed portions of the Quran with proficient tajweed',
          'Explain the context (asbab al-nuzul) of selected verses',
          'Analyse themes and lessons from selected Quranic passages',
          'Relate Quranic teachings to contemporary issues',
        ]},
      { name: 'Hadith Studies', desc: 'Study of Prophetic traditions and their application',
        objectives: [
          'Study selected hadiths from authentic collections',
          'Explain the classification and authentication of hadiths',
          'Apply hadith teachings to ethical decision-making',
        ]},
      { name: 'Islamic Jurisprudence', desc: 'Advanced fiqh, sources of Islamic law, and contemporary issues',
        objectives: [
          'Identify the primary sources of Islamic law (Quran, Sunnah, Ijma, Qiyas)',
          'Compare rulings from different schools of thought',
          'Discuss contemporary Islamic issues with reference to fiqh principles',
        ]},
      { name: 'Islamic History and Civilisation', desc: 'The spread of Islam, caliphates, and contributions to knowledge',
        objectives: [
          'Describe the expansion of Islam after the Prophet (PBUH)',
          'Identify key achievements of Islamic civilisation in science, art, and philosophy',
          'Analyse the contributions of Muslim scholars to world knowledge',
          'Evaluate the role of the Rightly Guided Caliphs',
        ]},
      { name: 'Islamic Ethics and Society', desc: 'Applying Islamic values to modern social issues',
        objectives: [
          'Discuss Islamic perspectives on justice, equality, and human rights',
          'Apply Islamic ethical frameworks to contemporary dilemmas',
          'Explain Islamic teachings on interfaith dialogue and coexistence',
        ]},
    ],
  },

  'ICT': {
    primary: [
      { name: 'Digital Literacy', desc: 'Basic computer skills, files, and software',
        objectives: [
          'Identify parts of a computer and their functions',
          'Use a keyboard and mouse effectively',
          'Create, save, open, and organise files and folders',
          'Use word processing software to create documents',
        ]},
      { name: 'Coding and Algorithms', desc: 'Introduction to programming concepts',
        objectives: [
          'Understand what an algorithm is and create simple ones',
          'Use block-based coding to create sequences and loops',
          'Debug simple programs by identifying errors',
        ]},
      { name: 'Internet and Communication', desc: 'Using the internet safely and effectively',
        objectives: [
          'Use search engines to find information',
          'Understand how to communicate safely online',
          'Identify reliable and unreliable online sources',
        ]},
      { name: 'Multimedia and Presentations', desc: 'Creating digital content with images, sound, and video',
        objectives: [
          'Create presentations using slides with text and images',
          'Insert and edit images in documents',
          'Record and use audio/video for digital projects',
          'Combine different media types in a single project',
        ]},
      { name: 'Online Safety and Digital Citizenship', desc: 'Staying safe and responsible online',
        objectives: [
          'Identify personal information and understand privacy',
          'Recognise cyberbullying and know how to respond',
          'Understand age-appropriate rules for internet use',
        ]},
    ],
    secondary: [
      { name: 'Programming Fundamentals', desc: 'Text-based programming with Python or JavaScript',
        objectives: [
          'Write programs using variables, data types, and operators',
          'Use selection (if/else) and iteration (for/while loops)',
          'Define and call functions with parameters',
          'Use lists/arrays to store and manipulate data',
          'Debug and test programs systematically',
        ]},
      { name: 'Data and Databases', desc: 'Spreadsheets, data analysis, and database concepts',
        objectives: [
          'Use spreadsheet formulae and functions for data analysis',
          'Create charts and graphs to represent data',
          'Understand relational database concepts and design tables',
          'Write simple queries to retrieve data',
        ]},
      { name: 'Web Development', desc: 'HTML, CSS, and creating web pages',
        objectives: [
          'Create web pages using HTML elements and structure',
          'Style web pages using CSS properties',
          'Understand how the internet and web browsers work',
        ]},
      { name: 'Computer Systems and Networks', desc: 'Hardware, software, and networking',
        objectives: [
          'Describe the components of a computer system (CPU, RAM, storage)',
          'Explain the difference between system and application software',
          'Understand how networks and the internet function',
          'Describe data representation (binary, ASCII)',
        ]},
      { name: 'Cybersecurity and Ethics', desc: 'Security threats, protection, and digital ethics',
        objectives: [
          'Identify common cybersecurity threats (malware, phishing)',
          'Describe methods to protect data and systems',
          'Understand ethical and legal issues in computing',
          'Evaluate the impact of technology on society',
        ]},
    ],
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SEEDING LOGIC
// ═══════════════════════════════════════════════════════════════════════════════

async function seed() {
  console.log('Seeding Cambridge curriculum data...\n');

  let subjectCount = 0, topicCount = 0, objectiveCount = 0;

  for (const [subjectName, data] of Object.entries(CURRICULUM)) {
    // ── Primary Grades 1-6 ─────────────────────────────────────────────────
    if (data.primary) {
      for (let grade = 1; grade <= 6; grade++) {
        const { data: subj, error: sErr } = await supabase
          .from('subjects')
          .upsert({ name: subjectName, grade_level: String(grade), programme: 'Primary' },
                   { onConflict: 'name,grade_level' })
          .select('id')
          .single();
        if (sErr) { console.error(`Subject ${subjectName} G${grade}:`, sErr.message); continue; }
        subjectCount++;

        for (let ti = 0; ti < data.primary.length; ti++) {
          const t = data.primary[ti];
          const { data: topic, error: tErr } = await supabase
            .from('topics')
            .insert({ subject_id: subj.id, name: t.name, description: t.desc, order_number: ti + 1 })
            .select('id')
            .single();
          if (tErr) { console.error(`  Topic ${t.name}:`, tErr.message); continue; }
          topicCount++;

          const objRows = t.objectives.map((desc, i) => ({
            topic_id: topic.id,
            code: `${grade}${subjectName.slice(0,2).toUpperCase()}${ti+1}.${i+1}`,
            description: desc,
            grade: String(grade),
          }));
          const { error: oErr } = await supabase.from('learning_objectives').insert(objRows);
          if (oErr) console.error(`  Objectives:`, oErr.message);
          else objectiveCount += objRows.length;
        }
      }
    }

    // ── Lower Secondary Grades 7-9 ────────────────────────────────────────
    if (data.secondary) {
      for (let grade = 7; grade <= 9; grade++) {
        const { data: subj, error: sErr } = await supabase
          .from('subjects')
          .upsert({ name: subjectName, grade_level: String(grade), programme: 'Lower Secondary' },
                   { onConflict: 'name,grade_level' })
          .select('id')
          .single();
        if (sErr) { console.error(`Subject ${subjectName} G${grade}:`, sErr.message); continue; }
        subjectCount++;

        for (let ti = 0; ti < data.secondary.length; ti++) {
          const t = data.secondary[ti];
          const { data: topic, error: tErr } = await supabase
            .from('topics')
            .insert({ subject_id: subj.id, name: t.name, description: t.desc, order_number: ti + 1 })
            .select('id')
            .single();
          if (tErr) { console.error(`  Topic ${t.name}:`, tErr.message); continue; }
          topicCount++;

          const objRows = t.objectives.map((desc, i) => ({
            topic_id: topic.id,
            code: `${grade}${subjectName.slice(0,2).toUpperCase()}${ti+1}.${i+1}`,
            description: desc,
            grade: String(grade),
          }));
          const { error: oErr } = await supabase.from('learning_objectives').insert(objRows);
          if (oErr) console.error(`  Objectives:`, oErr.message);
          else objectiveCount += objRows.length;
        }
      }
    }
  }

  console.log(`\nDone! Seeded:`);
  console.log(`  ${subjectCount} subjects`);
  console.log(`  ${topicCount} topics`);
  console.log(`  ${objectiveCount} learning objectives`);
}

seed().catch(console.error);
