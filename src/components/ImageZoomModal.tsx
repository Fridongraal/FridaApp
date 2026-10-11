import React from "react";
import { X } from "lucide-react";

interface ImageZoomModalProps {
  isOpen: boolean;
  src: string;
  alt?: string;
  onClose: () => void;
}

export const ImageZoomModal: React.FC<ImageZoomModalProps> = ({
  isOpen,
  src,
  alt,
  onClose,
}) => {
  if (!isOpen || !src) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
    >
      <button
        onClick={onClose}
        className="absolute top-5 right-5 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
        title="Cerrar vista ampliada"
      >
        <X className="w-6 h-6" />
      </button>

      <div
        onClick={(e) => e.stopPropagation()}
        className="max-w-4xl max-h-[85vh] flex flex-col items-center justify-center animate-in zoom-in-95 duration-200"
      >
        <img
          src={src}
          alt={alt || "Imagen ampliada"}
          className="max-h-[80vh] max-w-full rounded-2xl object-contain shadow-2xl bg-white/5 border border-white/10"
        />
        {alt && alt !== "Imagen" && (
          <p className="text-sm text-slate-300 mt-3 text-center bg-black/40 px-4 py-1.5 rounded-full border border-white/10">
            {alt}
          </p>
        )}
      </div>
    </div>
  );
};
