import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Loader2, Download, Bookmark, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const API_URL = import.meta.env.VITE_API_URL;

type Gender = "auto" | "man" | "woman";

interface StyleResult {
  image_url: string;
  title?: string;
  description?: string;
  tryon_image_url?: string;
}

const StyleSuggestions = () => {
  const [clothingFile, setClothingFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [gender, setGender] = useState<Gender>("auto");
  const [results, setResults] = useState<StyleResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateAndSet = useCallback((file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) return;
    if (file.size > MAX_FILE_SIZE) return;
    setClothingFile(file);
    setPreview(URL.createObjectURL(file));
    setResults([]);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) validateAndSet(file);
    },
    [validateAndSet]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) validateAndSet(file);
      if (inputRef.current) inputRef.current.value = "";
    },
    [validateAndSet]
  );

  const clearImage = useCallback(() => {
    setClothingFile(null);
    setPreview(null);
    setResults([]);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!clothingFile) return;
    setIsLoading(true);
    setResults([]);

    try {
      const formData = new FormData();
      formData.append("clothing_image", clothingFile);
      if (gender !== "auto") {
        formData.append("gender", gender);
      }

      const response = await fetch(`${API_URL}/api/style`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      const styles: StyleResult[] = Array.isArray(data.styles)
        ? data.styles.map((s: any) => ({
            image_url: s.model_image_base64
              ? `data:image/png;base64,${s.model_image_base64}`
              : s.image_url || "",
            tryon_image_url: s.tryon_image_base64
              ? `data:image/png;base64,${s.tryon_image_base64}`
              : undefined,
            title: s.name || s.title,
            description: s.description,
          }))
        : [];

      if (styles.length === 0) {
        throw new Error("No styles returned from server");
      }

      setResults(styles);
    } catch (err) {
      toast({
        title: "Generation failed",
        description:
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [clothingFile, gender, toast]);

  const handleDownload = useCallback((url: string, index: number) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `styled-outfit-${index + 1}.png`;
    a.click();
  }, []);

  const handleSave = useCallback(
    (index: number) => {
      toast({
        title: "Look saved",
        description: `Outfit ${index + 1} has been saved to your collection.`,
      });
    },
    [toast]
  );

  const canGenerate = clothingFile && !isLoading;

  return (
    <div className="space-y-10 pb-12">
      {/* Header */}
      <div className="pt-4">
        <h1 className="text-4xl md:text-5xl font-light uppercase tracking-tight text-foreground leading-[1.1]">
          AI Outfit <span className="font-semibold">Stylist</span>
        </h1>
        <div className="w-16 h-0.5 bg-primary mt-5 mb-4" />
        <p className="text-muted-foreground text-base max-w-lg leading-relaxed">
          Upload a clothing item and let our AI generate multiple styled outfit
          looks — your personal fashion lookbook in seconds.
        </p>
      </div>

      {/* Upload + Options */}
      <div className="max-w-md mx-auto space-y-5">
        {/* Upload Card */}
        <Card
          className={`relative flex flex-col items-center justify-center border-2 border-dashed transition-all duration-200 cursor-pointer overflow-hidden group ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/40"
          } ${preview ? "p-0" : "p-10 md:p-14"}`}
          onClick={() => !preview && inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleChange}
          />

          {preview ? (
            <>
              <img
                src={preview}
                alt="Clothing item"
                className="w-full h-72 md:h-80 object-contain bg-card"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearImage();
                }}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-foreground/80 text-background hover:bg-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="w-full px-4 py-3 border-t border-border">
                <p className="text-xs text-muted-foreground text-center">
                  Upload Clothing Item
                </p>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-14 h-14 rounded-full bg-card flex items-center justify-center">
                <Upload className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Upload Clothing Item
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Drag & drop or click to browse
                </p>
              </div>
              <p className="text-xs text-muted-foreground/60">
                JPG, PNG or WebP · Max 10MB
              </p>
            </div>
          )}
        </Card>

        {/* Gender Selector */}
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wider mr-2">
            Gender
          </span>
          {(["auto", "man", "woman"] as Gender[]).map((g) => (
            <button
              key={g}
              onClick={() => setGender(g)}
              className={`px-4 py-1.5 text-xs uppercase tracking-wider rounded-full border transition-all duration-200 ${
                gender === g
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary/40"
              }`}
            >
              {g === "auto" ? "Auto" : g === "man" ? "Man" : "Woman"}
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleGenerate}
          disabled={!canGenerate}
          className="rounded-none px-12 py-3 uppercase tracking-[0.2em] text-xs font-semibold h-auto"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating…
            </>
          ) : (
            "Generate Styles"
          )}
        </Button>
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden animate-pulse">
              <div className="h-80 bg-muted" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-muted rounded w-2/3" />
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-4/5" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-light uppercase tracking-[0.2em] text-foreground">
              Your Styled <span className="font-semibold">Looks</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-2 uppercase tracking-wider">
              {results.length} outfit{results.length !== 1 ? "s" : ""} generated
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((style, i) => (
              <Card
                key={i}
                className="overflow-hidden group animate-in fade-in-0 slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${i * 120}ms`, animationFillMode: "both" }}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={style.image_url}
                    alt={style.title || `Styled outfit ${i + 1}`}
                    className="w-full h-80 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                    {style.title || `Look ${i + 1}`}
                  </h3>
                  {style.description && (
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                      {style.description}
                    </p>
                  )}
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1.5 text-xs"
                      onClick={() => handleDownload(style.image_url, i)}
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1.5 text-xs"
                      onClick={() => handleSave(i)}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      Save Look
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StyleSuggestions;
