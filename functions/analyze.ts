import type { Request, Response } from 'express';
import {
  saveUpload,
  saveMoment,
} from '../lib/firestore.js';
import { uploadFile, getSignedViewUrl } from '../lib/storage.js';
import { transcribeFile } from '../lib/transcription.js';
import { findTopMoments } from '../lib/momentEngine.js';
import type { Moment } from '../types/index.js';

/** TEMP: replace with auth.uid when Firebase auth is enabled */
const DEV_USER_ID = '1234567890';

export async function postAnalyze(req: Request, res: Response): Promise<void> {
  const userId = DEV_USER_ID;

  let transcript = '';
  let storagePath: string | undefined;
  const fileList = req.files as Express.Multer.File[] | undefined;
  const textInput = (req.body?.text ?? req.body?.textInput) as string | undefined;
  const file =
    fileList?.find((f) => f.fieldname === 'file') ??
    fileList?.find((f) => ['audio', 'recording', 'upload', 'media'].includes(f.fieldname)) ??
    fileList?.find((f) => f.buffer?.length) ??
    fileList?.[0];

  try {
    if (typeof textInput === 'string' && textInput.trim()) {
      transcript = textInput.trim();
    } else if (file && file.buffer?.length) {
      storagePath = await uploadFile({
        userId,
        file: file.buffer,
        mimeType: file.mimetype || 'audio/mpeg',
        originalName: file.originalname || 'upload',
      });
      transcript = await transcribeFile(file.buffer, file.mimetype || 'audio/mpeg');
    } else {
      res.status(400).json({
        error:
          'Provide either form field "text" or "textInput", or upload a file (field name: file, audio, recording, etc.) as multipart/form-data',
      });
      return;
    }
  } catch (e) {
    console.error('Analyze form/upload/transcribe error:', e);
    res.status(500).json({ error: 'Failed to process input or transcribe' });
    return;
  }

  if (!transcript) {
    res.status(400).json({ error: 'No transcript (empty text or transcription failed)' });
    return;
  }

  let uploadId: string;
  try {
    uploadId = await saveUpload({ userId, transcript, storagePath });
  } catch (e) {
    console.error('Save upload error:', e);
    res.status(500).json({ error: 'Failed to save upload' });
    return;
  }

  let rawMoments: { title: string; description: string; timestamp?: string }[];
  try {
    rawMoments = await findTopMoments(transcript);
  } catch (e) {
    console.error('Find moments error:', e);
    rawMoments = [];
  }

  const savedMoments: Moment[] = [];
  for (const m of rawMoments) {
    try {
      const momentId = await saveMoment({
        uploadId,
        userId,
        title: m.title,
        description: m.description,
        timestamp: m.timestamp,
      });
      savedMoments.push({
        id: momentId,
        uploadId,
        userId,
        title: m.title,
        description: m.description,
        timestamp: m.timestamp,
        createdAt: { _seconds: Math.floor(Date.now() / 1000), _nanoseconds: 0 },
      });
    } catch (e) {
      console.error('Save moment error:', e);
    }
  }

  let fileViewUrl: string | undefined;
  let fileViewUrlExpiresAt: string | undefined;
  if (storagePath) {
    const signed = await getSignedViewUrl(storagePath);
    if (signed) {
      fileViewUrl = signed.url;
      fileViewUrlExpiresAt = signed.expiresAt;
    }
  }

  res.json({
    uploadId,
    transcript,
    moments: savedMoments,
    ...(fileViewUrl && { fileViewUrl, fileViewUrlExpiresAt }),
  });
}
