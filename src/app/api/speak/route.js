import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { text, language = 'en', voice: requestedVoice } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    let cleanText = text
      .replace(/```[\s\S]*?```/g, '')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/#{1,4}\s/g, '')
      .replace(/^\s*[-*]\s/gm, '')
      .replace(/^\s*\d+\.\s/gm, '')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/[—–]/g, ', ')
      .replace(/\.{2,}/g, '.')
      .replace(/\n{2,}/g, '. ')
      .replace(/\n/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();

    // Remove ALL emoji and special unicode symbols that crash OpenAI TTS
    cleanText = cleanText.replace(/[\u{1F600}-\u{1F64F}]/gu, '')
      .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')
      .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '')
      .replace(/[\u{2600}-\u{26FF}]/gu, '')
      .replace(/[\u{2700}-\u{27BF}]/gu, '')
      .replace(/[\u{FE00}-\u{FE0F}]/gu, '')
      .replace(/[\u{1F900}-\u{1F9FF}]/gu, '')
      .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '')
      .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '')
      .replace(/[\u{200D}]/gu, '')
      .replace(/[\u{20E3}]/gu, '')
      .replace(/[\u{E0020}-\u{E007F}]/gu, '')
      .replace(/[\u2022\u2023\u25E6\u2043\u2219]/g, '')
      .replace(/[\u2713\u2714\u2715\u2716\u2717\u2718]/g, '')
      .replace(/[\u200B-\u200F\u2028-\u202F\u2060-\u206F]/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim();

    if (!cleanText || cleanText.length < 2) {
      return NextResponse.json({ error: 'No speakable text after cleaning' }, { status: 400 });
    }

    const truncated = cleanText.length > 3900
      ? cleanText.slice(0, 3900) + '. That is the summary.'
      : cleanText;

    const voiceMap = {
      en: 'nova', ar: 'onyx', ur: 'onyx',
      hi: 'nova', fr: 'shimmer', ru: 'nova', kk: 'nova',
    };
    const voice = requestedVoice || voiceMap[language] || 'nova';

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: truncated,
        voice: voice,
        response_format: 'mp3',
        speed: 1.0,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI TTS error:', errorText);
      return NextResponse.json({ error: 'TTS generation failed: ' + errorText }, { status: 500 });
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    });

  } catch (error) {
    console.error('TTS API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}