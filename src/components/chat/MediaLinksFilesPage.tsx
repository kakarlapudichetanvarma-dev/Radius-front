import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatService } from '../../services/chat.service';
import type { MediaAttachment } from '../../types/chat.types';

interface Props {
  chatId: string;
  onBack: () => void;
}

type Tab = 'images' | 'files' | 'links';

function buildImageSrc(storagePath: string | null | undefined, fileType: string | null | undefined): string {
  if (!storagePath) return '';
  if (storagePath.startsWith('data:') || storagePath.startsWith('blob:')) return storagePath;
  const mime = fileType || 'image/jpeg';
  return `data:${mime};base64,${storagePath}`;
}

function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(fileType: string | null | undefined): string {
  if (!fileType) return '📎';
  if (fileType.includes('pdf')) return '📄';
  if (fileType.includes('word') || fileType.includes('doc')) return '📝';
  if (fileType.includes('excel') || fileType.includes('sheet')) return '📊';
  if (fileType.includes('zip') || fileType.includes('rar')) return '🗜️';
  if (fileType.includes('video')) return '🎥';
  if (fileType.includes('audio')) return '🎵';
  if (fileType.includes('text')) return '📃';
  return '📎';
}

export default function MediaLinksFilesPage({ chatId, onBack }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('images');
  const [images, setImages] = useState<MediaAttachment[]>([]);
  const [files, setFiles] = useState<MediaAttachment[]>([]);
  const [links, setLinks] = useState<MediaAttachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      chatService.getChatImages(chatId),
      chatService.getChatFiles(chatId),
      chatService.getChatLinks(chatId),
    ]).then(([imgRes, fileRes, linkRes]) => {
      setImages(imgRes.data.data || []);
      setFiles(fileRes.data.data || []);
      setLinks(linkRes.data.data || []);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [chatId]);

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'images', label: 'Images', count: images.length },
    { key: 'files',  label: 'Files',  count: files.length  },
    { key: 'links',  label: 'Links',  count: links.length  },
  ];

  return (
    <>
      {/* Fullscreen image viewer */}
      <AnimatePresence>
        {fullscreenImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-4"
            onClick={() => setFullscreenImage(null)}
          >
            <img
              src={fullscreenImage}
              alt="fullscreen"
              className="max-w-full max-h-full object-contain rounded-xl"
              onClick={e => e.stopPropagation()}
            />
            <button
              className="absolute top-4 right-4 text-white text-4xl hover:text-zinc-300 transition"
              onClick={() => setFullscreenImage(null)}
            >×</button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="absolute inset-0 z-30 bg-zinc-950 flex flex-col"
      >
        {/* Header */}
        <div className="h-16 bg-black border-b border-yellow-500/20 flex items-center px-4 gap-3 flex-shrink-0">
          <button
            onClick={onBack}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-800 text-yellow-400 transition"
          >
            ←
          </button>
          <p className="text-yellow-400 font-semibold">Media, Links & Files</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-800 flex-shrink-0">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                activeTab === tab.key
                  ? 'text-yellow-400'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-1 text-xs text-zinc-500">({tab.count})</span>
              )}
              {activeTab === tab.key && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-400"
                />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-zinc-500 text-sm">Loading…</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {/* Images Grid */}
              {activeTab === 'images' && (
                <motion.div
                  key="images"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="grid grid-cols-3 gap-1"
                >
                  {images.length === 0 ? (
                    <div className="col-span-3 text-center text-zinc-600 py-12 text-sm">
                      No images yet
                    </div>
                  ) : images.map((img, i) => (
                    <motion.div
                      key={img.id || i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="aspect-square bg-zinc-800 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition"
                      onClick={() => setFullscreenImage(buildImageSrc(img.storagePath, img.fileType))}
                    >
                      <img
                        src={buildImageSrc(img.storagePath, img.fileType)}
                        alt={img.fileName || 'image'}
                        className="w-full h-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Files List */}
              {activeTab === 'files' && (
                <motion.div
                  key="files"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="space-y-2"
                >
                  {files.length === 0 ? (
                    <div className="text-center text-zinc-600 py-12 text-sm">No files yet</div>
                  ) : files.map((file, i) => (
                    <motion.div
                      key={file.id || i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center gap-3 bg-zinc-900 rounded-xl p-3 cursor-pointer hover:bg-zinc-800 transition"
                      onClick={() => {
                        if (file.storagePath) {
                          const mime = file.fileType || 'application/octet-stream';
                          const binary = atob(file.storagePath);
                          const bytes = new Uint8Array(binary.length);
                          for (let j = 0; j < binary.length; j++) bytes[j] = binary.charCodeAt(j);
                          const blob = new Blob([bytes], { type: mime });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = file.fileName || 'file';
                          a.click();
                          setTimeout(() => URL.revokeObjectURL(url), 5000);
                        }
                      }}
                    >
                      <span className="text-2xl flex-shrink-0">{getFileIcon(file.fileType)}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-white text-sm font-medium truncate">{file.fileName || 'File'}</p>
                        <p className="text-zinc-500 text-xs">{formatFileSize(file.fileSizeBytes)}</p>
                      </div>
                      <span className="text-zinc-400 text-lg flex-shrink-0">⬇</span>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Links List */}
              {activeTab === 'links' && (
                <motion.div
                  key="links"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="space-y-2"
                >
                  {links.length === 0 ? (
                    <div className="text-center text-zinc-600 py-12 text-sm">No links yet</div>
                  ) : links.map((link, i) => (
                    <motion.div
                      key={link.id || i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="bg-zinc-900 rounded-xl p-3 hover:bg-zinc-800 transition cursor-pointer"
                      onClick={() => window.open(link.url || '#', '_blank')}
                    >
                      <p className="text-blue-400 text-sm break-all line-clamp-2">{link.url}</p>
                      {link.previewTitle && (
                        <p className="text-zinc-400 text-xs mt-1 truncate">{link.previewTitle}</p>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </>
  );
}