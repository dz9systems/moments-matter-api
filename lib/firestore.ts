/**
 * Firestore access for uploads, moments, and creativePackets collections.
 */

import { getDb } from './firebase';
import type { Upload, Moment, CreativePacket } from '../types/index.js';
const UPLOADS = 'uploads';
const MOMENTS = 'moments';
const CREATIVE_PACKETS = 'creativePackets';

/**
 * Saves a new upload and returns its id.
 */
export async function saveUpload(data: {
  userId: string;
  transcript: string;
  storagePath?: string;
}): Promise<string> {
  const db = getDb();
  const ref = await db.collection(UPLOADS).add({
    userId: data.userId,
    transcript: data.transcript,
    storagePath: data.storagePath ?? null,
    createdAt: new Date(),
  });
  return ref.id;
}

/**
 * Gets one upload by id. Returns null if not found.
 */
export async function getUploadById(
  uploadId: string
): Promise<(Upload & { id: string }) | null> {
  const db = getDb();
  const doc = await db.collection(UPLOADS).doc(uploadId).get();
  if (!doc.exists) return null;
  const data = doc.data()!;
  return {
    id: doc.id,
    userId: data.userId,
    transcript: data.transcript ?? '',
    storagePath: data.storagePath,
    createdAt: data.createdAt,
  };
}

/**
 * Gets all uploads for a user, newest first.
 */
export async function getUploadsByUserId(
  userId: string
): Promise<(Upload & { id: string })[]> {
  const db = getDb();
  const snapshot = await db
    .collection(UPLOADS)
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .get();
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      userId: data.userId,
      transcript: data.transcript ?? '',
      storagePath: data.storagePath,
      createdAt: data.createdAt,
    };
  });
}

/**
 * Saves a moment and returns its id.
 */
export async function saveMoment(data: {
  uploadId: string;
  userId: string;
  title: string;
  description: string;
  timestamp?: string;
}): Promise<string> {
  const db = getDb();
  const ref = await db.collection(MOMENTS).add({
    uploadId: data.uploadId,
    userId: data.userId,
    title: data.title,
    description: data.description,
    timestamp: data.timestamp ?? null,
    createdAt: new Date(),
  });
  return ref.id;
}

/**
 * Gets one moment by id. Returns null if not found.
 */
export async function getMomentById(
  momentId: string
): Promise<(Moment & { id: string }) | null> {
  const db = getDb();
  const doc = await db.collection(MOMENTS).doc(momentId).get();
  if (!doc.exists) return null;
  const data = doc.data()!;
  return {
    id: doc.id,
    uploadId: data.uploadId,
    userId: data.userId,
    title: data.title,
    description: data.description,
    timestamp: data.timestamp,
    createdAt: data.createdAt,
  };
}

/**
 * Gets all moments for an upload.
 */
export async function getMomentsByUploadId(
  uploadId: string
): Promise<(Moment & { id: string })[]> {
  const db = getDb();
  const snapshot = await db
    .collection(MOMENTS)
    .where('uploadId', '==', uploadId)
    .get();
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      uploadId: data.uploadId,
      userId: data.userId,
      title: data.title,
      description: data.description,
      timestamp: data.timestamp,
      createdAt: data.createdAt,
    };
  });
}

/**
 * Saves a creative packet and returns its id.
 */
export async function saveCreativePacket(data: {
  momentId: string;
  uploadId: string;
  userId: string;
  goal: string;
  content: string;
}): Promise<string> {
  const db = getDb();
  const ref = await db.collection(CREATIVE_PACKETS).add({
    momentId: data.momentId,
    uploadId: data.uploadId,
    userId: data.userId,
    goal: data.goal,
    content: data.content,
    createdAt: new Date(),
  });
  return ref.id;
}

/**
 * Gets all creative packets for an upload.
 */
export async function getCreativePacketsByUploadId(
  uploadId: string
): Promise<(CreativePacket & { id: string })[]> {
  const db = getDb();
  const snapshot = await db
    .collection(CREATIVE_PACKETS)
    .where('uploadId', '==', uploadId)
    .get();
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      momentId: data.momentId,
      uploadId: data.uploadId,
      userId: data.userId,
      goal: data.goal,
      content: data.content,
      createdAt: data.createdAt,
    };
  });
}
