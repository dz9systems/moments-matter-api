/**
 * OpenAI-based creative packet generation from a moment and goal.
 */

import OpenAI from 'openai';
import type { Moment } from '../types/index.js';

function getOpenAI(): OpenAI {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY is not set');
  return new OpenAI({ apiKey: key });
}

/**
 * Generates a creative packet (e.g. script, outline, ideas) based on a moment and user goal.
 */
export async function generateCreativePacket(
  moment: Moment,
  goal: string
): Promise<string> {
  const openai = getOpenAI();
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a creative assistant. Given a "moment" (title + description) and a user goal, generate a creative packet: ideas, script snippets, or an outline that connects the moment to the goal. Be concise but useful. Output plain text.`,
      },
      {
        role: 'user',
        content: `Moment: "${moment.title}" - ${moment.description}\n\nGoal: ${goal}\n\nGenerate the creative packet:`,
      },
    ],
  });
  return response.choices[0]?.message?.content?.trim() ?? '';
}
