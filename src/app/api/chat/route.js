import { NextResponse } from 'next/server';
import { chatWithAI } from '@/lib/deepseek';

export async function POST(request) {
  try {
    const { question, context, history = [], language = 'en' } = await request.json();

    if (!question) {
      return NextResponse.json({ answer: 'Please ask a question.' });
    }

    const langInstruction = language !== 'en'
      ? `IMPORTANT: Respond in the language with code "${language}". If the student writes in Arabic, respond in Arabic. Match the student's language.`
      : '';

    const systemPrompt = `You are an AI tutor for Victory International Schools, an educational platform called EduVatar. You help students understand their textbook content, answer questions about their lessons, and explain concepts clearly.

Rules:
- Be encouraging, patient, and supportive
- Use simple language appropriate for school students (KG to Grade 9)
- When textbook context is provided, base your answers on that content and cite the page/chapter
- If you don't know something or it's not in the textbook, say so honestly
- Keep responses concise but thorough
- Use bullet points and examples to make explanations clear
${langInstruction}

${context ? `TEXTBOOK CONTENT (use this to answer the student's question):\n${context}` : 'No specific textbook content provided. Answer based on general knowledge and let the student know you can help better if they load their textbooks in the Library.'}`;

    const messages = [
      { role: 'system', content: systemPrompt },
    ];

    for (const msg of history.slice(-6)) {
      if (msg.role === 'user' || msg.role === 'assistant') {
        messages.push({ role: msg.role, content: msg.content });
      }
    }

    messages.push({ role: 'user', content: question });

    const answer = await chatWithAI({ messages, temperature: 0.7, maxTokens: 1500 });

    return NextResponse.json({ answer });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({
      answer: `I had trouble connecting to the AI service. Error: ${error.message}. Please check that your API key is configured in Vercel environment variables.`
    });
  }
}