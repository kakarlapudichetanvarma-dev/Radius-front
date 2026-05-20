// upload.service.ts
// Handles all client-side file preparation before sending via chat.
// Files are converted to base64 and sent as part of the message payload
// (matching your backend's fileData / fileName / fileType / fileSizeBytes fields).

export type UploadFileType = 'IMAGE' | 'FILE';

export interface PreparedUpload {
  base64: string;          // full data URL: "data:image/png;base64,..."
  fileName: string;
  fileType: string;        // MIME type e.g. "image/png"
  fileSizeBytes: number;
  uploadType: UploadFileType;
  previewUrl: string | null; // object URL for images, null for other files
}

// ── Accepted file types ───────────────────────────────────────────────────────
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'application/zip',
  'application/x-rar-compressed',
  'video/mp4',
  'audio/mpeg',
  'audio/mp3',
];

const MAX_FILE_SIZE_MB = 20;

// ── Helpers ───────────────────────────────────────────────────────────────────

export const isImageFile = (file: File): boolean =>
  ACCEPTED_IMAGE_TYPES.includes(file.type);

export const isAcceptedFile = (file: File): boolean =>
  ACCEPTED_IMAGE_TYPES.includes(file.type) ||
  ACCEPTED_FILE_TYPES.includes(file.type);

export const validateFile = (file: File): string | null => {
  if (!isAcceptedFile(file)) {
    return `Unsupported file type: ${file.type || 'unknown'}`;
  }
  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > MAX_FILE_SIZE_MB) {
    return `File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`;
  }
  return null;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const getFileIcon = (fileType: string | null | undefined): string => {
  if (!fileType) return '📎';
  if (fileType.includes('pdf')) return '📄';
  if (fileType.includes('word') || fileType.includes('doc')) return '📝';
  if (fileType.includes('excel') || fileType.includes('sheet')) return '📊';
  if (fileType.includes('zip') || fileType.includes('rar')) return '🗜️';
  if (fileType.includes('video')) return '🎥';
  if (fileType.includes('audio')) return '🎵';
  if (fileType.includes('text')) return '📃';
  return '📎';
};

// ── Core: convert File → base64 string ───────────────────────────────────────

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });

// ── Main prepare function ─────────────────────────────────────────────────────
// Call this before sending a message with an attachment.

export const prepareUpload = async (file: File): Promise<PreparedUpload> => {
  const validationError = validateFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const base64 = await fileToBase64(file);
  const isImage = isImageFile(file);

  return {
    base64,
    fileName: file.name,
    fileType: file.type,
    fileSizeBytes: file.size,
    uploadType: isImage ? 'IMAGE' : 'FILE',
    previewUrl: isImage ? URL.createObjectURL(file) : null,
  };
};

// ── Cleanup ───────────────────────────────────────────────────────────────────
// Call this when you no longer need the preview URL (e.g. after send)
// to free browser memory.

export const revokePreview = (previewUrl: string | null): void => {
  if (previewUrl) {
    URL.revokeObjectURL(previewUrl);
  }
};

// ── Accept string for <input accept="..."> ────────────────────────────────────

export const INPUT_ACCEPT =
  'image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar,.mp4,.mp3';