/**
 * Shared types for MomentsMatter API.
 */

/** Firestore upload document. */
export interface Upload {
  id: string;
  userId: string;
  transcript: string;
  storagePath?: string;
  createdAt: FirebaseTimestamp;
}

/** Upload row plus optional signed Storage URLs (API responses only). */
export type UploadWithSignedUrls = Upload & {
  fileViewUrl?: string;
  fileViewUrlExpiresAt?: string;
};

/** Firestore moment document. */
export interface Moment {
  id: string;
  uploadId: string;
  userId: string;
  title: string;
  description: string;
  timestamp?: string;
  createdAt: FirebaseTimestamp;
}

/** Firestore creative packet document. */
export interface CreativePacket {
  id: string;
  momentId: string;
  uploadId: string;
  userId: string;
  goal: string;
  content: string;
  createdAt: FirebaseTimestamp;
}

/** Firestore timestamp (seconds + nanoseconds). */
export interface FirebaseTimestamp {
  _seconds: number;
  _nanoseconds: number;
}

/** Request body for POST /api/generate. */
export interface GenerateRequestBody {
  momentId: string;
  goal: string;
}

/** API response shape for analyze. */
export interface AnalyzeResponse {
  uploadId: string;
  transcript: string;
  moments: Moment[];
  /** Present when a file was uploaded (signed GET; expires — see fileViewUrlExpiresAt). */
  fileViewUrl?: string;
  fileViewUrlExpiresAt?: string;
}

/** API response shape for generate. */
export interface GenerateResponse {
  packet: CreativePacket;
}

/** API response shape for history. */
export interface HistoryResponse {
  uploads: Upload[];
}

/** API response shape for single upload. */
export interface UploadDetailResponse {
  upload: UploadWithSignedUrls;
  moments: Moment[];
  creativePackets: CreativePacket[];
}
