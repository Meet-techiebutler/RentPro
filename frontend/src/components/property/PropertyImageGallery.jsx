import { useState } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PropertyImageGallery({ images }) {
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="h-80 bg-gray-100 rounded-2xl flex items-center justify-center">
        <p className="text-gray-400">No images available</p>
      </div>
    );
  }

  const prev = () => setCurrent((c) => (c - 1 + images.length) % images.length);
  const next = () => setCurrent((c) => (c + 1) % images.length);

  return (
    <>
      {/* Main Gallery */}
      <div className="relative rounded-2xl overflow-hidden bg-gray-100">
        <div className="relative h-80 md:h-[460px]">
          <AnimatePresence mode="wait">
            <motion.img
              key={current}
              src={images[current].url}
              alt={`Property image ${current + 1}`}
              className="w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          </AnimatePresence>

          {/* Zoom button */}
          <button
            onClick={() => setLightbox(true)}
            className="absolute top-3 right-3 bg-black/40 hover:bg-black/60 text-white p-2 rounded-xl backdrop-blur-sm transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {/* Nav buttons */}
          {images.length > 1 && (
            <>
              <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-xl shadow-md transition-all">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-xl shadow-md transition-all">
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Counter */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/40 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
            {current + 1} / {images.length}
          </div>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 p-3 overflow-x-auto bg-gray-50">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                  i === current ? 'border-primary-600' : 'border-transparent opacity-60 hover:opacity-90'
                }`}
              >
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setLightbox(false)}
          >
            <button className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-xl transition-colors">
              <X className="w-6 h-6" />
            </button>
            <img
              src={images[current].url}
              alt=""
              className="max-w-full max-h-full object-contain rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />
            {images.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-xl">
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-xl">
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
