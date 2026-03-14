"use client";
import { useState } from "react";
import TryOnPanel from "@/components/TryOnPanel";
import StylePanel from "@/components/StylePanel";

type Tab = "tryon" | "style";

const TABS: { id: Tab; label: string }[] = [
  { id: "tryon", label: "👤 Try It On" },
  { id: "style", label: "✨ Style It" },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("tryon");

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">👗 Virtual Try-On</h1>
          <p className="text-gray-500 mt-2">
            AI-powered fashion using Google Imagen 4 &amp; Vertex AI
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Panel */}
          <div className="p-6">
            {activeTab === "tryon" ? <TryOnPanel /> : <StylePanel />}
          </div>
        </div>
      </div>
    </main>
  );
}
