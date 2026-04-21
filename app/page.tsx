"use client";

import { useState, useRef, useCallback } from "react";

interface Meal {
  name: string;
  emoji: string;
  description: string;
  cookTime: string;
  difficulty: string;
  missing: string[];
}

interface AnalysisResult {
  ingredients: string[];
  meals: Meal[];
}

type Step = "upload" | "analyzing" | "results" | "recipe";

export default function Home() {
  const [step, setStep] = useState<Step>("upload");
  const [preview, setPreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string>("");
  const [mimeType, setMimeType] = useState<string>("image/jpeg");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [recipe, setRecipe] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }
    setMimeType(file.type as string);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
      // Strip the data URL prefix to get raw base64
      setImageBase64(result.split(",")[1]);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const analyzeFridge = async () => {
    if (!imageBase64) return;
    setError(null);
    setStep("analyzing");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageBase64, mimeType }),
      });
      if (!res.ok) throw new Error("Analysis failed");
      const data = await res.json();
      setAnalysis(data);
      setStep("results");
    } catch {
      setError("Something went wrong. Please try again.");
      setStep("upload");
    }
  };

  const getRecipe = async (meal: Meal) => {
    setSelectedMeal(meal);
    setRecipe("");
    setStep("recipe");
    const res = await fetch("/api/recipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        meal: meal.name,
        ingredients: analysis?.ingredients ?? [],
        missing: meal.missing,
      }),
    });
    if (!res.ok || !res.body) return;
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      setRecipe((prev) => prev + decoder.decode(value));
    }
  };

  const reset = () => {
    setStep("upload");
    setPreview(null);
    setImageBase64("");
    setAnalysis(null);
    setSelectedMeal(null);
    setRecipe("");
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header */}
      <header className="bg-white border-b border-amber-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={reset} className="flex items-center gap-2 group">
            <span className="text-2xl">🍳</span>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">AI Sous Chef</h1>
              <p className="text-xs text-amber-600">Snap fridge → get recipe</p>
            </div>
          </button>
          {step !== "upload" && (
            <button
              onClick={reset}
              className="text-sm text-gray-500 hover:text-gray-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100"
            >
              ← Start over
            </button>
          )}
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* UPLOAD STEP */}
        {step === "upload" && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                What's in your fridge?
              </h2>
              <p className="text-gray-500">Upload a photo and get personalized meal ideas</p>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                {error}
              </div>
            )}

            {!preview ? (
              <div
                className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                  dragOver
                    ? "border-amber-400 bg-amber-50"
                    : "border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50/50"
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
              >
                <div className="text-5xl mb-4">📸</div>
                <p className="text-lg font-semibold text-gray-700 mb-1">
                  Drop your fridge photo here
                </p>
                <p className="text-sm text-gray-400 mb-4">or click to browse</p>
                <span className="inline-block bg-amber-500 text-white text-sm font-medium px-6 py-2 rounded-full hover:bg-amber-600 transition-colors">
                  Choose photo
                </span>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              <div className="animate-fade-in">
                <div className="relative rounded-2xl overflow-hidden shadow-lg mb-6">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview}
                    alt="Fridge preview"
                    className="w-full max-h-80 object-cover"
                  />
                  <button
                    onClick={() => { setPreview(null); setImageBase64(""); }}
                    className="absolute top-3 right-3 bg-black/50 text-white text-xs px-3 py-1.5 rounded-full hover:bg-black/70 transition-colors"
                  >
                    Change photo
                  </button>
                </div>
                <button
                  onClick={analyzeFridge}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold text-lg py-4 rounded-xl transition-colors shadow-md hover:shadow-lg"
                >
                  🔍 Analyze my fridge
                </button>
              </div>
            )}

            <div className="mt-10 grid grid-cols-3 gap-4">
              {[
                { icon: "🥦", label: "Detects ingredients" },
                { icon: "🍽️", label: "Suggests 4 meals" },
                { icon: "👨‍🍳", label: "Full recipe + tips" },
              ].map((item) => (
                <div key={item.label} className="text-center p-4 bg-white rounded-xl shadow-sm">
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <p className="text-xs text-gray-500 font-medium">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ANALYZING STEP */}
        {step === "analyzing" && (
          <div className="animate-fade-in text-center py-20">
            <div className="text-6xl mb-6 animate-bounce">🔍</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Scanning your fridge...</h2>
            <p className="text-gray-500">Claude is identifying ingredients and planning meals</p>
            <div className="mt-8 flex justify-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-amber-400"
                  style={{ animation: `bounce 1s ${i * 0.15}s infinite` }}
                />
              ))}
            </div>
            <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }`}</style>
          </div>
        )}

        {/* RESULTS STEP */}
        {step === "results" && analysis && (
          <div className="animate-fade-in space-y-6">
            {/* Fridge photo thumbnail */}
            {preview && (
              <div className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="Your fridge" className="w-20 h-16 object-cover rounded-xl" />
                <div>
                  <p className="font-semibold text-gray-800">Fridge scanned ✓</p>
                  <p className="text-sm text-gray-500">
                    Found <span className="text-amber-600 font-medium">{analysis.ingredients.length} ingredients</span>
                  </p>
                </div>
              </div>
            )}

            {/* Ingredients */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span>🥗</span> Detected ingredients
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysis.ingredients.map((ing) => (
                  <span
                    key={ing}
                    className="bg-green-50 text-green-700 border border-green-200 text-sm px-3 py-1 rounded-full"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>

            {/* Meal suggestions */}
            <div>
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span>🍽️</span> Meals you can make
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {analysis.meals.map((meal) => (
                  <button
                    key={meal.name}
                    onClick={() => getRecipe(meal)}
                    className="text-left bg-white rounded-2xl p-5 shadow-sm hover:shadow-md border border-transparent hover:border-amber-200 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-3xl">{meal.emoji}</span>
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                        {meal.cookTime}
                      </span>
                    </div>
                    <h4 className="font-bold text-gray-900 mb-1 group-hover:text-amber-600 transition-colors">
                      {meal.name}
                    </h4>
                    <p className="text-sm text-gray-500 mb-3 leading-relaxed">{meal.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">{meal.difficulty}</span>
                      {meal.missing.length > 0 && (
                        <span className="text-xs text-orange-500">
                          + {meal.missing.length} item{meal.missing.length > 1 ? "s" : ""} needed
                        </span>
                      )}
                    </div>
                    {meal.missing.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {meal.missing.map((m) => (
                          <span key={m} className="text-xs bg-orange-50 text-orange-600 border border-orange-200 px-2 py-0.5 rounded-full">
                            ⚠️ {m}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* RECIPE STEP */}
        {step === "recipe" && selectedMeal && (
          <div className="animate-slide-up">
            <button
              onClick={() => setStep("results")}
              className="text-sm text-gray-500 hover:text-gray-700 mb-5 flex items-center gap-1 transition-colors"
            >
              ← Back to meals
            </button>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {/* Recipe header */}
              <div className="bg-gradient-to-r from-amber-400 to-orange-400 p-6">
                <div className="text-4xl mb-2">{selectedMeal.emoji}</div>
                <h2 className="text-2xl font-bold text-white">{selectedMeal.name}</h2>
                <p className="text-amber-100 text-sm mt-1">{selectedMeal.description}</p>
                <div className="flex gap-3 mt-3">
                  <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">
                    ⏱ {selectedMeal.cookTime}
                  </span>
                  <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">
                    📊 {selectedMeal.difficulty}
                  </span>
                </div>
              </div>

              {/* Recipe content — streams in */}
              <div className="p-6">
                {recipe ? (
                  <RecipeMarkdown text={recipe} />
                ) : (
                  <div className="flex items-center gap-3 text-gray-400 py-4">
                    <div className="animate-spin text-xl">👨‍🍳</div>
                    <span>Writing your recipe...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Missing ingredients grocery list */}
            {selectedMeal.missing.length > 0 && (
              <div className="mt-4 bg-orange-50 border border-orange-200 rounded-2xl p-5">
                <h4 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
                  🛒 Shopping list
                </h4>
                <ul className="space-y-1.5">
                  {selectedMeal.missing.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-orange-700">
                      <span className="w-4 h-4 border border-orange-300 rounded flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

// Simple markdown renderer for the streaming recipe text
function RecipeMarkdown({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="prose prose-sm max-w-none">
      {lines.map((line, i) => {
        if (line.startsWith("## ")) {
          return (
            <h2 key={i} className="text-lg font-bold text-gray-800 mt-5 mb-2 first:mt-0">
              {line.replace("## ", "")}
            </h2>
          );
        }
        if (line.startsWith("**") && line.endsWith("**")) {
          return (
            <p key={i} className="font-semibold text-gray-800">
              {line.replace(/\*\*/g, "")}
            </p>
          );
        }
        if (/^\d+\.\s/.test(line)) {
          return (
            <div key={i} className="flex gap-3 py-1">
              <span className="flex-shrink-0 w-6 h-6 bg-amber-100 text-amber-700 rounded-full text-xs flex items-center justify-center font-bold">
                {line.match(/^(\d+)/)?.[1]}
              </span>
              <p className="text-gray-700 text-sm leading-relaxed">
                {line.replace(/^\d+\.\s/, "")}
              </p>
            </div>
          );
        }
        if (line.startsWith("- ") || line.startsWith("* ")) {
          const content = line.replace(/^[-*]\s/, "");
          return (
            <div key={i} className="flex gap-2 py-0.5">
              <span className="text-amber-400 mt-0.5 flex-shrink-0">•</span>
              <p
                className="text-gray-700 text-sm"
                dangerouslySetInnerHTML={{
                  __html: content
                    .replace(/⚠️\s*([^,\n]+)/g, '<span class="text-orange-500 font-medium">⚠️ $1</span>')
                    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>"),
                }}
              />
            </div>
          );
        }
        if (line.trim() === "") return <div key={i} className="h-1" />;
        return (
          <p
            key={i}
            className="text-gray-700 text-sm leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: line
                .replace(/⚠️\s*([^,\n]+)/g, '<span class="text-orange-500 font-medium">⚠️ $1</span>')
                .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>"),
            }}
          />
        );
      })}
    </div>
  );
}
