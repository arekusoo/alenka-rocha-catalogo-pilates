import React from 'react';
import { X, ExternalLink, Play, Video } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title: string;
}

export const VideoModal: React.FC<VideoModalProps> = ({
  isOpen,
  onClose,
  videoUrl,
  title,
}) => {
  if (!isOpen) return null;

  // Helper to extract YouTube video ID
  const getYouTubeEmbedUrl = (url: string) => {
    try {
      if (url.includes('youtube.com/watch')) {
        const urlParams = new URLSearchParams(new URL(url).search);
        const v = urlParams.get('v');
        if (v) return `https://www.youtube.com/embed/${v}?autoplay=1`;
      }
      if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1]?.split('?')[0];
        if (id) return `https://www.youtube.com/embed/${id}?autoplay=1`;
      }
      if (url.includes('youtube.com/embed/')) {
        return url;
      }
    } catch {
      return null;
    }
    return null;
  };

  const embedUrl = getYouTubeEmbedUrl(videoUrl);
  const isDirectVideo = videoUrl.endsWith('.mp4') || videoUrl.endsWith('.webm');

  return (
    <div
      id="video-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="video-modal-card"
        className="bg-[#ffffff] rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-[#bec9c7]/40 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#eceeee] bg-[#f8fafa]">
          <div className="flex items-center gap-2 text-[#00615f]">
            <Video className="w-5 h-5" />
            <h3 className="font-semibold text-lg text-[#191c1d] truncate max-w-md">
              {title}
            </h3>
          </div>
          <button
            id="close-video-modal-btn"
            onClick={onClose}
            className="p-1.5 text-[#506261] hover:text-[#191c1d] hover:bg-[#eceeee] rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Container */}
        <div className="relative aspect-video bg-black flex items-center justify-center">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : isDirectVideo ? (
            <video
              src={videoUrl}
              controls
              autoPlay
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="p-8 text-center text-white flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#00615f]/80 flex items-center justify-center text-white">
                <Play className="w-8 h-8 ml-1" />
              </div>
              <div>
                <p className="font-medium text-lg mb-1">{title}</p>
                <p className="text-sm text-gray-300 max-w-md break-all">{videoUrl}</p>
              </div>
              <a
                href={videoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-[#00615f] hover:bg-[#00504e] text-white px-5 py-2.5 rounded-full font-medium text-sm transition-colors shadow-sm"
              >
                Abrir Link Externo <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-[#f8fafa] flex items-center justify-between border-t border-[#eceeee]">
          <span className="text-xs text-[#506261]">
            Vídeo demonstrativo de execução e postura
          </span>
          <a
            href={videoUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-[#00615f] font-semibold hover:underline flex items-center gap-1"
          >
            Assistir na plataforma de origem <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
