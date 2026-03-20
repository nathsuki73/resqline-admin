export const getSafeImageUrl = (base64String: string) => {
  if (!base64String) return null;
  // If it's already a full data URI, return it; otherwise, prefix it
  if (base64String.startsWith("data:image")) return base64String;
  // Basic check: Base64 for JPEG/PNG usually starts with /9j/ or iVBOR
  if (base64String.length < 50) return null;
  return `data:image/jpeg;base64,${base64String}`;
};
