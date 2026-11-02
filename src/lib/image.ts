// Shrinks a chosen photo before upload: longest side at most MAX_SIDE px,
// saved as JPEG. Keeps uploads small and quick to load in the quiz.

const MAX_SIDE = 720;
const QUALITY = 0.85;

async function decode(file: Blob): Promise<{ source: CanvasImageSource; width: number; height: number; done: () => void }> {
  if ('createImageBitmap' in window) {
    try {
      const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
      return { source: bmp, width: bmp.width, height: bmp.height, done: () => bmp.close() };
    } catch {
      /* fall back to <img> below */
    }
  }
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.src = url;
  try {
    await img.decode();
  } catch {
    URL.revokeObjectURL(url);
    throw new Error("That file couldn't be read as an image. Try a JPG or PNG.");
  }
  return { source: img, width: img.naturalWidth, height: img.naturalHeight, done: () => URL.revokeObjectURL(url) };
}

export async function prepareImage(file: Blob): Promise<Blob> {
  if (!file.type.startsWith('image/')) throw new Error('Choose an image file (JPG, PNG or WebP).');
  const { source, width, height, done } = await decode(file);
  try {
    const scale = Math.min(1, MAX_SIDE / Math.max(width, height));
    const w = Math.max(1, Math.round(width * scale));
    const h = Math.max(1, Math.round(height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Your browser could not process the image.');
    ctx.fillStyle = '#ffffff'; // transparent PNGs get a white background
    ctx.fillRect(0, 0, w, h);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(source, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', QUALITY));
    if (!blob) throw new Error('Your browser could not process the image.');
    return blob;
  } finally {
    done();
  }
}
