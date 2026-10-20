// Uploaded images live on Cloudinary; asking it for the displayed width in a modern format cuts most of the bytes
export function imageSrc(url: string, width: number) {
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url
  return url.replace('/upload/', `/upload/f_auto,q_auto,c_limit,w_${width}/`)
}
