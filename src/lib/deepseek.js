/**
 * DeepSeek / OpenAI compatible API client
 */

const DEEPSEEK_URL = 'https://api.deepseek.com/v1/chat/completions';
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

export async function chatWithAI({ messages, temperature = 0.7, maxTokens = 1500 }) {
  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('No AI API key configured. Set DEEPSEEK_API_KEY or OPENAI_API_KEY in .env.local');
  }

  const isDeepSeek = !!process.env.DEEPSEEK_API_KEY;
  const url = isDeepSeek ? DEEPSEEK_URL : OPENAI_URL;
  const model = isDeepSeek ? 'deepseek-chat' : (process.env.OPENAI_MODEL || 'gpt-4o-mini');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`AI API error (${response.status}): ${error}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}
