import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';

const SAMPLE_VIDEO = 'https://lorem.video/720p';

export default function VideoPlayer({ videoUrl, onClose }: { videoUrl?: string; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    videoRef.current?.play();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black flex items-center justify-center"
    >
      <button
        onClick={onClose}
        className="absolute top-8 right-8 z-10 w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors border border-white/10"
      >
        <X size={28} />
      </button>
      <video
        ref={videoRef}
        src={videoUrl || SAMPLE_VIDEO}
        className="w-full h-full max-w-full max-h-full"
        controls
        autoPlay
        playsInline
        onEnded={onClose}
      />
    </motion.div>
  );
}
