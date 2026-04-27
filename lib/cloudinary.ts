// Cloudinary stores video uploads with a `.mp4` extension. The eager
// thumbnail transformation pulls a frame, but unless we force an image
// format the resulting URL keeps `.mp4`, which Next/Image rejects.
// Swapping the extension to `.jpg` makes Cloudinary serve the same
// transformation as a JPEG.
export function toCloudinaryThumbnail(url: string | null | undefined): string | null {
  if (!url) return null;
  return url.replace(/\.mp4(\?|$)/i, ".jpg$1");
}
