import { X } from "lucide-react";
import { useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PhotoViewerProps {
  src: string | null;
  onClose: () => void;
}

const PhotoViewer = ({ src, onClose }: PhotoViewerProps) => {
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const lastDistance = useRef<number | null>(null);
  const lastCenter = useRef<{ x: number; y: number } | null>(null);
  const imgRef = useRef<HTMLDivElement>(null);

  // Reset on open
  useEffect(() => {
    if (src) {
      setScale(1);
      setTranslate({ x: 0, y: 0 });
    }
  }, [src]);

  const getDistance = (t1: React.Touch, t2: React.Touch) =>
    Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);

  const getCenter = (t1: React.Touch, t2: React.Touch) => ({
    x: (t1.clientX + t2.clientX) / 2,
    y: (t1.clientY + t2.clientY) / 2,
  });

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      lastDistance.current = getDistance(e.touches[0], e.touches[1]);
      lastCenter.current = getCenter(e.touches[0], e.touches[1]);
    }
  }, []);

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2 && lastDistance.current !== null && lastCenter.current !== null) {
        e.preventDefault();
        const dist = getDistance(e.touches[0], e.touches[1]);
        const center = getCenter(e.touches[0], e.touches[1]);
        const delta = dist / lastDistance.current;
        const newScale = Math.min(Math.max(scale * delta, 1), 5);

        const dx = center.x - lastCenter.current.x;
        const dy = center.y - lastCenter.current.y;

        setScale(newScale);
        if (newScale > 1) {
          setTranslate((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
        } else {
          setTranslate({ x: 0, y: 0 });
        }

        lastDistance.current = dist;
        lastCenter.current = center;
      }
    },
    [scale]
  );

  const onTouchEnd = useCallback(() => {
    lastDistance.current = null;
    lastCenter.current = null;
    if (scale <= 1) {
      setScale(1);
      setTranslate({ x: 0, y: 0 });
    }
  }, [scale]);

  const handleDoubleTap = useCallback(() => {
    if (scale > 1) {
      setScale(1);
      setTranslate({ x: 0, y: 0 });
    } else {
      setScale(2.5);
    }
  }, [scale]);

  return (
    <AnimatePresence>
      {src && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center touch-none"
          onClick={() => scale <= 1 && onClose()}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white z-10"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </button>
          <div
            ref={imgRef}
            className="w-full h-full flex items-center justify-center"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onDoubleClick={handleDoubleTap}
          >
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={src}
              alt="Memory"
              className="max-w-full max-h-full object-contain p-4 select-none"
              style={{
                transform: `scale(${scale}) translate(${translate.x / scale}px, ${translate.y / scale}px)`,
                transition: lastDistance.current ? "none" : "transform 0.2s ease-out",
              }}
              draggable={false}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PhotoViewer;
