export type UploadFileType = 'IMAGE' | 'FILE';

export interface PreparedUpload {
  base64: string;
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
  uploadType: UploadFileType;
  previewUrl: string | null;
}

const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];

const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
  // ✅ All zip/archive MIME variants across browsers and OSes
  'application/zip',
  'application/x-zip',
  'application/x-zip-compressed',
  'application/x-compressed',
  'application/x-rar-compressed',
  'application/vnd.rar',
  'application/x-7z-compressed',
  'application/x-tar',
  'application/gzip',
  'application/octet-stream', // ✅ generic fallback — many files including zips on Windows
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/ogg',
  'audio/webm',
  'audio/aac',
];

// ✅ Extension-based fallback for when browser reports wrong/generic MIME type
const ACCEPTED_EXTENSIONS = [
  '.zip', '.rar', '.7z', '.tar', '.gz',
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.csv', '.ppt', '.pptx',
  '.txt', '.mp4', '.webm', '.mp3', '.wav', '.aac', '.ogg',
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg',
];

const MAX_FILE_SIZE_MB = 200000;

export const isImageFile = (file: File): boolean =>
  ACCEPTED_IMAGE_TYPES.includes(file.type);

export const isVideoFile = (file: File): boolean =>
  file.type.startsWith('video/');

export const isAudioFile = (file: File): boolean =>
  file.type.startsWith('audio/');

// ✅ Check MIME type first, then fall back to extension
export const isAcceptedFile = (file: File): boolean => {
  if (
    ACCEPTED_IMAGE_TYPES.includes(file.type) ||
    ACCEPTED_FILE_TYPES.includes(file.type)
  ) {
    return true;
  }
  // Fallback: extension check for ambiguous MIME types
  const ext = '.' + (file.name.split('.').pop()?.toLowerCase() ?? '');
  return ACCEPTED_EXTENSIONS.includes(ext);
};

export const validateFile = (file: File): string | null => {
  if (!isAcceptedFile(file)) {
    const ext = file.name.split('.').pop()?.toUpperCase() || 'unknown';
    return `Unsupported file type: ${ext}`;
  }
  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > MAX_FILE_SIZE_MB) {
    return `File too large. Maximum is ${MAX_FILE_SIZE_MB}MB.`;
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
  if (fileType.startsWith('image/')) return '🖼️';
  if (fileType.startsWith('video/')) return '🎥';
  if (fileType.startsWith('audio/')) return '🎵';
  if (fileType.includes('pdf')) return '📄';
  if (fileType.includes('word') || fileType.includes('doc')) return '📝';
  if (fileType.includes('excel') || fileType.includes('sheet') || fileType.includes('csv')) return '📊';
  if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📑';
  if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('7z') || fileType.includes('tar') || fileType.includes('gzip')) return '🗜️';
  if (fileType.includes('text')) return '📃';
  return '📎';
};

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });

export const prepareUpload = async (file: File): Promise<PreparedUpload> => {
  const validationError = validateFile(file);
  if (validationError) throw new Error(validationError);

  const base64 = await fileToBase64(file);
  const isImage = isImageFile(file);
  const isMedia = isImage || isVideoFile(file) || isAudioFile(file);

  return {
    base64,
    fileName: file.name,
    fileType: file.type,
    fileSizeBytes: file.size,
    uploadType: isImage ? 'IMAGE' : 'FILE',
    previewUrl: isMedia ? URL.createObjectURL(file) : null,
  };
};

export const revokePreview = (previewUrl: string | null): void => {
  if (previewUrl) URL.revokeObjectURL(previewUrl);
};

export const INPUT_ACCEPT =
  'image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.txt,.zip,.rar,.7z,.tar,.gz';