import { useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PhotoUploadProps {
  images: string[];                 // Base64 或 URL
  onChange: (images: string[]) => void;
}

export function PhotoUpload({ images, onChange }: PhotoUploadProps) {
  const inputRefs = [
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
  ];

  const handleSelect = (index: number) => {
    inputRefs[index].current?.click();
  };

  const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const next = [...images];
      next[index] = result;
      onChange(next);
    };
    reader.readAsDataURL(file);
  };

  const handleClear = (index: number) => {
    const next = [...images];
    next.splice(index, 1);
    onChange(next);
  };

  // 讓陣列固定長度 3（空位為 undefined）
  const slots = [0, 1, 2].map((i) => images[i]);

  return (
    <div className="space-y-4">
      <p className="text-base text-muted-foreground">
        請上傳 <span className="font-semibold">3 張照片</span>，我們會根據這些照片幫您生成故事。
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {slots.map((img, index) => (
          <div
            key={index}
            className="relative border rounded-xl overflow-hidden aspect-[4/3] flex items-center justify-center bg-muted"
          >
            {img ? (
              <>
                <img
                  src={img}
                  alt={`memory-${index}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleClear(index)}
                  className="absolute top-2 right-2 inline-flex items-center justify-center rounded-full bg-black/60 text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => handleSelect(index)}
                className="flex flex-col items-center justify-center h-full w-full text-muted-foreground hover:bg-muted/70 transition-colors"
              >
                <ImageIcon className="w-8 h-8 mb-2" />
                <span className="text-sm">點擊上傳第 {index + 1} 張</span>
                <Upload className="w-4 h-4 mt-1" />
              </button>
            )}

            <input
              ref={inputRefs[index]}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileChange(index, e)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
