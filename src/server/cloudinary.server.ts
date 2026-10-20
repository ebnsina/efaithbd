import { v2 as cloudinary } from 'cloudinary'

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env
if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  throw new Error('CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET must be set')
}
cloudinary.config({ cloud_name: CLOUDINARY_CLOUD_NAME, api_key: CLOUDINARY_API_KEY, api_secret: CLOUDINARY_API_SECRET })

export function uploadImage(file: File, folder: string) {
  return file.arrayBuffer().then(
    (bytes) =>
      new Promise<string>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder, resource_type: 'image' }, (error, result) =>
            error || !result ? reject(error ?? new Error('Upload failed')) : resolve(result.secure_url),
          )
          .end(Buffer.from(bytes))
      }),
  )
}
