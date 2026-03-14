"use client";
import { useState } from "react";
import ImageUpload from "./ImageUpload";
import { runTryOn, TryOnResponse } from "@/lib/api";

export default function TryOnPanel() {
  const [personFiles, setPersonFiles] = useState<File[]>([]);
  const [clothingFiles, setClothingFiles] = useState<File[]>([]);
  const [result, setResult] = useState<TryOnResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!personFiles[0] || clothingFiles.length === 0) {
      setError("Please provide a person photo and at least one clothing item.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await runTryOn(personFiles[0], clothingFiles);
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ImageUpload
          label="Person Photo"
          files={personFiles}
          onChange={setPersonFiles}
        />
        <ImageUpload
          label="Clothing Items (select one or more)"
          multiple
          files={clothingFiles}
          onChange={setClothingFiles}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Processing…" : "Try It On"}
      </button>

      {result && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800 text-lg">Results</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {result.results.map((step) => (
              <div key={step.step} className="border rounded-xl overflow-hidden shadow-sm">
                <div className="bg-gray-50 px-4 py-2 text-sm font-medium text-gray-600 border-b">
                  Step {step.step} — {step.clothing_name}
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`data:image/png;base64,${step.image_base64}`}
                  alt={`Try-on result step ${step.step}`}
                  className="w-full object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
