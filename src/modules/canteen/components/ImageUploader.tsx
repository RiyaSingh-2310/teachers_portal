"use client";

import { useId, useRef, useState } from "react";
import { ImagePlus, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { imageFileError, readImageFile } from "@/modules/canteen/utils/menu";

export function ImageUploader({
  imageDataUrl,
  imageName,
  error,
  onChange,
}: {
  imageDataUrl: string | null;
  imageName: string | null;
  error?: string;
  onChange: (image: { imageDataUrl: string | null; imageName: string | null }, error: string | null) => void;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [reading, setReading] = useState(false);

  async function onFile(file: File | null) {
    if (!file) return;
    const message = imageFileError(file);
    if (message) {
      onChange({ imageDataUrl, imageName }, message);
      return;
    }
    setReading(true);
    try {
      const dataUrl = await readImageFile(file);
      onChange({ imageDataUrl: dataUrl, imageName: file.name }, null);
    } catch {
      onChange({ imageDataUrl, imageName }, "That image could not be read. Choose another file.");
    } finally {
      setReading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-foreground">Item image</span>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
          {imageDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageDataUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <UtensilsCrossed className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" disabled={reading} onClick={() => inputRef.current?.click()}>
              <ImagePlus className="h-4 w-4" />
              {imageDataUrl ? "Replace image" : "Choose image"}
            </Button>
            {imageDataUrl ? (
              <Button type="button" variant="ghost" onClick={() => onChange({ imageDataUrl: null, imageName: null }, null)}>
                Remove
              </Button>
            ) : null}
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {imageName ?? "No image selected. JPEG, PNG, WEBP, or GIF up to 2 MB."}
          </p>
          <p className="text-xs text-muted-foreground">The preview stays in this browser. It is not uploaded to the school.</p>
        </div>
      </div>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        onChange={(event) => void onFile(event.target.files?.[0] ?? null)}
      />
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}

export function MenuThumb({ src, name }: { src: string | null; name: string }) {
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        <span className="text-xs font-semibold text-muted-foreground" aria-hidden="true">
          {name.slice(0, 1).toUpperCase()}
        </span>
      )}
      <span className="sr-only">{src ? `${name} image` : `${name} has no image`}</span>
    </span>
  );
}
