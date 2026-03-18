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

/**
 * Structured creative output (matches typical frontend e.g. CreativePacketView).
 * Stored as JSON string in Firestore `CreativePacket.content`.
 */
export interface CreativePacketContent {
  short_form_ideas: string[];
  posting_recommendation: string;
  scripts: string[];
  captions: string[];
  /** Optional carousel slide copy (one string per slide). */
  carousel_slides?: string[];
}

/** Firestore creative packet document. */
export interface CreativePacket {
  id: string;
  momentId: string;
  uploadId: string;
  userId: string;
  goal: string;
  /** JSON string of {@link CreativePacketContent} from structured generation. */
  content: string;
  createdAt: FirebaseTimestamp;
}

/** POST /api/generate response: packet metadata + parsed creative fields. */
export type CreativePacketResponse = CreativePacket & CreativePacketContent;

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
  packet: CreativePacketResponse;
}

/** API response shape for history. */
export interface HistoryResponse {
  uploads: Upload[];
}

/** API response shape for GET /api/moments. */
export interface MomentsListResponse {
  moments: Moment[];
}

/** Packet from DB; structured fields present when content is JSON from current generator. */
export type CreativePacketWithParsed = CreativePacket & Partial<CreativePacketContent>;

/** API response shape for single upload. */
export interface UploadDetailResponse {
  upload: UploadWithSignedUrls;
  moments: Moment[];
  creativePackets: CreativePacketWithParsed[];
}
