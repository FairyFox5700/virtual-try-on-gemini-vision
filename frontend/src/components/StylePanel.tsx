"use client";
import { useState } from "react";
import ImageUpload from "./ImageUpload";
import { runStyle, StyleResponse } from "@/lib/api";

export default function StylePanel() {
  const [clothingFiles, setClothingFiles] = useState<File[]>([]);
  const [gender, setGender] = useState("");
  const [result, setResult] = useState<StyleResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!clothingFiles[0]) {
      setError("Please upload a clothing item.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await runStyle(clothingFiles[0], gender || undefined);
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
          label="Clothing Item"
          files={clothingFiles}
          onChange={setClothingFiles}
        />
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">
            Gender{" "}
            <span className="text-gray-400 font-normal">(optional — auto-detected)</span>
          </label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
          >
            <option value="">Auto-detect</option>
            <option value="woman">Woman</option>
            <option value="man">Man</option>
          </select>
        </div>
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
        {loading ? "Generating Styles…" : "Style It"}
      </button>

      {result && (
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-600 space-y-1">
            <p>
              <span className="font-medium">Item:</span> {result.item_description}
            </p>
            <p>
              <span className="font-medium">Gender:</span> {result.gender}
            </p>
          </div>

          <div className="space-y-6">
            {result.styles.map((look, i) => (
              <div key={i} className="border rounded-xl overflow-hidden shadow-sm">
                <div className="bg-indigo-50 px-4 py-3 border-b">
                  <h4 className="font-semibold text-indigo-900">
                    Look {i + 1}: {look.name}
                  </h4>
                  <p className="text-sm text-indigo-700 mt-0.5">{look.description}</p>
                </div>
                <div className="grid grid-cols-2 divide-x">
                  <div>
                    <p className="text-xs text-center bg-gray-50 py-1 text-gray-500 border-b">
                      Generated Outfit
                    </p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`data:image/png;base64,${look.model_image_base64}`}
                      alt={`${look.name} generated outfit`}
                      className="w-full object-contain"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-center bg-gray-50 py-1 text-gray-500 border-b">
                      With Your Item
                    </p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`data:image/png;base64,${look.tryon_image_base64}`}
                      alt={`${look.name} virtual try-on`}
                      className="w-full object-contain"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
