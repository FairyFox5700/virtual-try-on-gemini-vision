import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Image as ImageIcon, Loader2, Download, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const API_URL = import.meta.env.VITE_API_URL;

interface UploadCardProps {
  title: string;
  subtitle: string;
  image: string | null;
  onImageSelect: (file: File) => void;
  onClear: () => void;
}

const UploadCard = ({ title, subtitle, image, onImageSelect, onClear }: UploadCardProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const validateAndSet = useCallback(
    (file: File) => {
      if (!ACCEPTED_TYPES.includes(file.type)) return;
      if (file.size > MAX_FILE_SIZE) return;
      onImageSelect(file);
    },
    [onImageSelect]
  );

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

  return (
    <Card
      className={`relative flex flex-col items-center justify-center border-2 border-dashed transition-all duration-200 cursor-pointer overflow-hidden group ${
        isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
      } ${image ? "p-0" : "p-8 md:p-12"}`}
      onClick={() => !image && inputRef.current?.click()}
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

      {image ? (
        <>
          <img
            src={image}
            alt={title}
            className="w-full h-64 md:h-80 object-contain bg-card"
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-foreground/80 text-background hover:bg-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="w-full px-4 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">{title}</p>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-full bg-card flex items-center justify-center">
            {title.includes("Photo") ? (
              <Upload className="w-6 h-6 text-muted-foreground" />
            ) : (
              <ImageIcon className="w-6 h-6 text-muted-foreground" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{title}</p>
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          </div>
          <p className="text-xs text-muted-foreground/60">
            JPG, PNG or WebP · Max 10MB
          </p>
        </div>
      )}
    </Card>
  );
};

const TryOn = () => {
  const [personImage, setPersonImage] = useState<File | null>(null);
  const [clothingImage, setClothingImage] = useState<File | null>(null);
  const [personPreview, setPersonPreview] = useState<string | null>(null);
  const [clothingPreview, setClothingPreview] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePersonImage = useCallback((file: File) => {
    setPersonImage(file);
    setPersonPreview(URL.createObjectURL(file));
    setResultUrl(null);
  }, []);

  const handleClothingImage = useCallback((file: File) => {
    setClothingImage(file);
    setClothingPreview(URL.createObjectURL(file));
    setResultUrl(null);
  }, []);

  const clearPerson = useCallback(() => {
    setPersonImage(null);
    setPersonPreview(null);
    setResultUrl(null);
  }, []);

  const clearClothing = useCallback(() => {
    setClothingImage(null);
    setClothingPreview(null);
    setResultUrl(null);
  }, []);

  const canGenerate = personImage && clothingImage && !isLoading;

  const handleGenerate = useCallback(async () => {
    if (!personImage || !clothingImage) return;
    setIsLoading(true);
    setResultUrl(null);

    try {
      const formData = new FormData();
      formData.append("person_image", personImage);
      formData.append("clothing_image", clothingImage);

      const response = await fetch(`${API_URL}/api/try-on`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.image_url) {
        throw new Error("No image returned from server");
      }

      setResultUrl(data.image_url);
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
  }, [personImage, clothingImage, toast]);

  const handleDownload = useCallback(() => {
    if (!resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = "try-on-result.png";
    a.click();
  }, [resultUrl]);

  return (
    <div className="space-y-10 pb-12">
      {/* Header */}
      <div className="pt-4">
        <h1 className="text-4xl md:text-5xl font-light uppercase tracking-tight text-foreground leading-[1.1]">
          Virtual <span className="font-semibold">Try-On</span>
        </h1>
        <div className="w-16 h-0.5 bg-primary mt-5 mb-4" />
        <p className="text-muted-foreground text-base max-w-lg leading-relaxed">
          Upload a photo of yourself and a clothing item — our AI will show you
          how it looks on you.
        </p>
      </div>

      {/* Upload Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UploadCard
          title="Upload Your Photo"
          subtitle="Drag & drop or click to browse"
          image={personPreview}
          onImageSelect={handlePersonImage}
          onClear={clearPerson}
        />
        <UploadCard
          title="Upload Clothing Item"
          subtitle="Drag & drop or click to browse"
          image={clothingPreview}
          onImageSelect={handleClothingImage}
          onClear={clearClothing}
        />
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
            "Generate Try-On"
          )}
        </Button>
      </div>

      {/* Result */}
      {resultUrl && (
        <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
          <Card className="overflow-hidden">
            <div className="border-b border-border px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Your Try-On Result</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  AI-generated preview
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </Button>
            </div>
            <div className="flex items-center justify-center bg-card p-6">
              <img
                src={resultUrl}
                alt="Virtual try-on result"
                className="max-h-[500px] w-auto object-contain rounded"
              />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TryOn;
