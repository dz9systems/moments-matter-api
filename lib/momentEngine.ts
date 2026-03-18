/**
 * OpenAI-based analysis to find top 3 moments from transcript or text.
 */

import OpenAI from 'openai';
import type { Moment } from '../types/index.js';

function getOpenAI(): OpenAI {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY is not set');
  return new OpenAI({ apiKey: key });
}

/** Raw moment from OpenAI (before we add ids and uploadId/userId). */
interface RawMoment {
  title: string;
  description: string;
  timestamp?: string;
}

/**
 * Analyzes transcript or text with OpenAI and returns top 3 moments.
 * Each moment has title, description, and optional timestamp.
 */
export async function findTopMoments(text: string): Promise<RawMoment[]> {
  const openai = getOpenAI();
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You analyze transcripts or text and identify the top 3 most meaningful or memorable "moments."
Return a JSON array of exactly 3 objects. Each object must have: "title" (string), "description" (string), and optionally "timestamp" (string, e.g. "00:01:30" if from media).
Example: [{"title":"Opening joke","description":"The speaker's opening joke got everyone laughing.","timestamp":"00:00:15"}, ...]`,
      },
      {
        role: 'user',
        content: text.slice(0, 12000),
      },
    ],
    response_format: { type: 'json_object' },
  });
  const content = response.choices[0]?.message?.content;
  if (!content) return [];
  try {
    const parsed = JSON.parse(content);
    const list = Array.isArray(parsed.moments) ? parsed.moments : Array.isArray(parsed) ? parsed : [];
    return list.slice(0, 3).map((m: Record<string, unknown>) => ({
      title: String(m.title ?? ''),
      description: String(m.description ?? ''),
      timestamp: m.timestamp != null ? String(m.timestamp) : undefined,
    }));
  } catch {
    return [];
  }
}
