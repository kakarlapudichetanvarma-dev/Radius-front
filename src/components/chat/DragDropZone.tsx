import { useCallback, useState } from 'react';

interface Props {
  onFileDrop: (file: File) => void;
  children: React.ReactNode;
  disabled?: boolean;
}

const MAX_FILE_SIZE_MB = 20;

export default function DragDropZone({ onFileDrop, children, disabled }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_FILE_SIZE_MB) {
      return `File is too large. Max size is ${MAX_FILE_SIZE_MB}MB.`;
    }
    return null;
  };

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setIsDragging(true);
    setError(null);
  }, [disabled]);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set false if leaving the zone entirely (not a child element)
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    // Only take the first file
    const file = files[0];
    const validationError = validateFile(file);

    if (validationError) {
      setError(validationError);
      setTimeout(() => setError(null), 3000);
      return;
    }

    onFileDrop(file);
  }, [disabled, onFileDrop]);

  return (
    <div
      className="relative flex flex-col flex-1 h-full"
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {isDragging && !disabled && (
        <div className="absolute inset-0 z-50 bg-zinc-950/80 border-2 border-dashed border-green-500 rounded-xl flex flex-col items-center justify-center pointer-events-none">
          <div className="text-5xl mb-3">📂</div>
          <p className="text-green-400 font-semibold text-lg">Drop file to send</p>
          <p className="text-zinc-400 text-sm mt-1">
            Any file up to {MAX_FILE_SIZE_MB}MB
          </p>
        </div>
      )}

      {/* Error toast */}
      {error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white text-sm px-4 py-2 rounded-xl shadow-lg">
          {error}
        </div>
      )}

      {children}
    </div>
  );
}