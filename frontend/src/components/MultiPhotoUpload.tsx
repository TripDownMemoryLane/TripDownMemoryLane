import { X, Upload } from "lucide-react";
import { useEffect, useState } from "react";

interface MultiPhotoUploadProps {
  images: (File | null)[];
  onChange: (newImages: (File | null)[]) => void;
}

export function MultiPhotoUpload({ images, onChange }: MultiPhotoUploadProps) {
  const [previews, setPreviews] = useState<string[]>(["", "", ""]);

  // 產生預覽 URL
  useEffect(() => {
    const urls = images.map((file) =>
      file ? URL.createObjectURL(file) : ""
    );

    setPreviews(urls);

    return () => {
      urls.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [images]);

  const handleSelect = (index: number, file: File | null) => {
    if (!file) return;

    const next = [...images];
    next[index] = file;
    onChange(next);
  };

  const handleClear = (index: number) => {
    const next = [...images];
    next[index] = null;
    onChange(next);
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      {[0, 1, 2].map((idx) => (
        <div key={idx} className="flex flex-col items-center">
          {previews[idx] ? (
            <div className="relative w-64 h-64">
              <img
                src={previews[idx]}
                className="w-full h-full object-cover rounded-xl border"
                alt={`preview-${idx}`}
              />
              <button
                type="button"
                className="absolute top-2 right-2 bg-black/60 text-white p-2 rounded-full hover:bg-black/80"
                onClick={() => handleClear(idx)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <label className="w-64 h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-muted/20">
              <Upload className="w-10 h-10 text-muted-foreground mb-2" />
              <span className="text-muted-foreground text-lg">
                上傳照片
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  handleSelect(idx, e.target.files?.[0] || null)
                }
              />
            </label>
          )}
        </div>
      ))}
    </div>
  );
}
