/**
 * /api/quiz/route.js — UPDATED
 * 
 * If your current route.js doesn't handle `seed` and `language`,
 * replace it with this version. Adjust the AI model/API as needed.
 */
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { content, numQuestions = 5, difficulty = 'medium', seed, language = 'en' } = await request.json();

    if (!content) {
      return NextResponse.json({ questions: [] });
    }

    // Language instruction for the AI
    const langInstruction = language !== 'en'
      ? `Generate the quiz questions and answer options in the language with code "${language}". Keep technical terms in English if needed.`
      : '';

    // Randomization instruction using the seed
    const randomInstruction = seed
      ? `Use variation seed "${seed}" — generate completely DIFFERENT questions from any previous quiz. Focus on different aspects, different details, different angles of the content. Do NOT repeat questions from earlier quizzes.`
      : '';

    const prompt = `You are a quiz generator for an educational platform. Generate exactly ${numQuestions} multiple-choice questions based on the following textbook content.

Difficulty: ${difficulty}
${langInstruction}
${randomInstruction}

IMPORTANT: Each question must be different and test a unique concept from the content. Vary question types between recall, understanding, and application.

Content:
${content.slice(0, 4000)}

Respond ONLY with valid JSON in this exact format (no markdown, no backticks):
{
  "questions": [
    {
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explanation": "Brief explanation of the correct answer"
    }
  ]
}`;

    // Call your AI API (DeepSeek, Claude, or OpenAI)
    const apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY;
    const apiUrl = process.env.DEEPSEEK_API_KEY
      ? 'https://api.deepseek.com/v1/chat/completions'
      : 'https://api.openai.com/v1/chat/completions';
    const model = process.env.DEEPSEEK_API_KEY ? 'deepseek-chat' : 'gpt-4o-mini';

    if (!apiKey) {
      // Fallback: generate simple questions locally
      return NextResponse.json({ questions: generateFallbackQuestions(content, numQuestions) });
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8, // Higher temperature = more variety
        max_tokens: 2000,
      }),
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';

    // Parse JSON from response (strip markdown fences if present)
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return NextResponse.json({ questions: parsed.questions || [] });

  } catch (error) {
    console.error('Quiz generation error:', error);
    return NextResponse.json({ questions: [] });
  }
}

/**
 * Fallback: Generate simple questions without an AI API
 */
function generateFallbackQuestions(content, num) {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
  const questions = [];

  for (let i = 0; i < Math.min(num, sentences.length); i++) {
    const idx = Math.floor(Math.random() * sentences.length);
    const sentence = sentences.splice(idx, 1)[0].trim();

    questions.push({
      question: `Which of the following is true based on the textbook?`,
      options: [
        sentence.slice(0, 80) + (sentence.length > 80 ? '...' : ''),
        'This information is not covered in the textbook',
        'The opposite of this statement is true',
        'None of the above',
      ],
      correct: 0,
      explanation: 'This information comes directly from the textbook content.',
    });
  }

  return questions;
}
