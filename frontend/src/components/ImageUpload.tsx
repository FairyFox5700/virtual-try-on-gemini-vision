"use client";
import { useRef } from "react";

interface Props {
  label: string;
  accept?: string;
  multiple?: boolean;
  files?: File[];
  onChange: (files: File[]) => void;
}

export default function ImageUpload({
  label,
  accept = "image/*",
  multiple = false,
  files = [],
  onChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div
        role="button"
        tabIndex={0}
        className="border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-indigo-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => {
            if (e.target.files) onChange(Array.from(e.target.files));
          }}
        />

        {files.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {files.map((f, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={URL.createObjectURL(f)}
                  alt={f.name}
                  className="h-24 w-24 object-cover rounded"
                />
                <span className="text-xs text-gray-500 truncate max-w-[96px]">
                  {f.name}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-4">
            <p className="text-sm">
              Click to upload {multiple ? "images" : "an image"}
            </p>
            <p className="text-xs mt-1">PNG, JPG, WEBP</p>
          </div>
        )}
      </div>
    </div>
  );
}
