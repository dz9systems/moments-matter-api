/**
 * OpenAI-based structured creative packet from a moment and goal.
 */

import OpenAI from 'openai';
import type { Moment } from '../types/index.js';
import type { CreativePacketContent } from '../types/index.js';
import { parseJson } from './parseJson.js';

function getOpenAI(): OpenAI {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY is not set');
  return new OpenAI({ apiKey: key });
}

const JSON_INSTRUCTION = `Return a single JSON object only (no markdown) with exactly these keys:
- "short_form_ideas": array of 4–6 short strings, visual/hook ideas for short-form video
- "posting_recommendation": one string, best time/platform/strategy advice
- "scripts": array of 3 strings, distinct script options (each 2–5 sentences, conversational)
- "captions": array of 3 strings, social captions with optional emoji, hashtags light
- "carousel_slides": array of 4–6 strings, one idea per slide for IG/LinkedIn carousel (optional but preferred)`;

/**
 * Parses stored packet content. Returns null if not valid structured JSON.
 */
export function parseCreativePacketContent(raw: string): CreativePacketContent | null {
  const p = parseJson<Record<string, unknown>>(raw);
  if (!p || typeof p !== 'object') return null;
  const ideas = p.short_form_ideas;
  const scripts = p.scripts;
  const captions = p.captions;
  if (!Array.isArray(ideas) || !Array.isArray(scripts) || !Array.isArray(captions)) {
    return null;
  }
  const rec = p.posting_recommendation;
  const slides = p.carousel_slides;
  return {
    short_form_ideas: ideas.map((x) => String(x)),
    posting_recommendation: typeof rec === 'string' ? rec : String(rec ?? ''),
    scripts: scripts.map((x) => String(x)),
    captions: captions.map((x) => String(x)),
    carousel_slides: Array.isArray(slides) ? slides.map((x) => String(x)) : undefined,
  };
}

function normalizeFields(p: Partial<CreativePacketContent>): CreativePacketContent {
  const ideas = Array.isArray(p.short_form_ideas) ? p.short_form_ideas.map(String) : [];
  const scripts = Array.isArray(p.scripts) ? p.scripts.map(String) : [];
  const captions = Array.isArray(p.captions) ? p.captions.map(String) : [];
  return {
    short_form_ideas: ideas.length ? ideas : ['Refine your moment into a strong hook + one clear takeaway.'],
    posting_recommendation:
      typeof p.posting_recommendation === 'string' && p.posting_recommendation.trim()
        ? p.posting_recommendation.trim()
        : 'Post when your audience is most active; test Tuesday–Thursday mornings.',
    scripts: scripts.length ? scripts : ['(Regenerate for full scripts.)'],
    captions: captions.length ? captions : ['(Regenerate for captions.)'],
    carousel_slides:
      Array.isArray(p.carousel_slides) && p.carousel_slides.length
        ? p.carousel_slides.map(String)
        : undefined,
  };
}

/**
 * Generates structured creative fields for API + UI.
 */
export async function generateCreativePacketFields(
  moment: Moment,
  goal: string
): Promise<CreativePacketContent> {
  const openai = getOpenAI();
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You are a social content strategist. ${JSON_INSTRUCTION}`,
      },
      {
        role: 'user',
        content: `Moment title: ${moment.title}\nDescription: ${moment.description}\n\nUser goal: ${goal}\n\nProduce the JSON object.`,
      },
    ],
  });
  const raw = response.choices[0]?.message?.content?.trim() ?? '{}';
  const parsed = parseJson<Partial<CreativePacketContent>>(raw);
  if (!parsed || typeof parsed !== 'object') {
    return normalizeFields({});
  }
  return normalizeFields(parsed);
}

/** @deprecated use generateCreativePacketFields; kept for any external imports */
export async function generateCreativePacket(moment: Moment, goal: string): Promise<string> {
  const fields = await generateCreativePacketFields(moment, goal);
  return JSON.stringify(fields);
}
