/**
 * OpenAI transcription for audio/video files.
 */

import OpenAI, { toFile } from 'openai';

function getOpenAI(): OpenAI {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY is not set');
  return new OpenAI({ apiKey: key });
}

/**
 * Transcribes audio or video file buffer using OpenAI Whisper.
 * Returns the transcript text.
 */
export async function transcribeFile(
  fileBuffer: Buffer,
  mimeType: string
): Promise<string> {
  const openai = getOpenAI();
  const ext = mimeType.includes('mp4') ? 'mp4' : mimeType.includes('webm') ? 'webm' : 'mp3';
  const file = await toFile(fileBuffer, `audio.${ext}`);
  const response = await openai.audio.transcriptions.create({
    file,
    model: 'whisper-1',
  });
  return response.text ?? '';
}
