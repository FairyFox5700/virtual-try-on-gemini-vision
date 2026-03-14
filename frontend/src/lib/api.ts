// ─── API response types ───────────────────────────────────────────────────────

export interface TryOnStep {
  step: number;
  clothing_name: string;
  image_base64: string;
}

export interface TryOnResponse {
  results: TryOnStep[];
}

export interface StyleLook {
  name: string;
  description: string;
  model_image_base64: string;
  tryon_image_base64: string;
}

export interface StyleResponse {
  gender: string;
  item_description: string;
  styles: StyleLook[];
}

// ─── API calls ────────────────────────────────────────────────────────────────

async function _post(path: string, body: FormData): Promise<Response> {
  const res = await fetch(path, { method: "POST", body });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res;
}

export async function runTryOn(
  personImage: File,
  clothingImages: File[]
): Promise<TryOnResponse> {
  const form = new FormData();
  form.append("person_image", personImage);
  clothingImages.forEach((f) => form.append("clothing_images", f));
  const res = await _post("/api/try-on", form);
  return res.json();
}

export async function runStyle(
  clothingImage: File,
  gender?: string
): Promise<StyleResponse> {
  const form = new FormData();
  form.append("clothing_image", clothingImage);
  if (gender) form.append("gender", gender);
  const res = await _post("/api/style", form);
  return res.json();
}
