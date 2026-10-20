import { Cancel01Icon, CloudUploadIcon, Link01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { uploadImageFn } from '@/features/uploads/upload.functions'

interface ImageUploadProps {
  images: string[]
  onChange: (images: string[]) => void
  maxImages?: number
  label: string
}

export function ImageUpload({ images, onChange, maxImages = 5, label }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [url, setUrl] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)
  const full = images.length >= maxImages

  const upload = async (files: FileList | null) => {
    if (!files?.length) return
    if (images.length + files.length > maxImages) {
      toast.error(`You can add up to ${maxImages} image${maxImages === 1 ? '' : 's'}`)
      return
    }
    setUploading(true)
    try {
      const urls = await Promise.all(
        Array.from(files).map((file) => {
          const data = new FormData()
          data.append('file', file)
          return uploadImageFn({ data }).then((result) => result.url)
        }),
      )
      onChange([...images, ...urls])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  const addUrl = () => {
    try {
      const parsed = new URL(url.trim())
      if (parsed.protocol !== 'https:') throw new Error()
      onChange([...images, parsed.toString()])
      setUrl('')
    } catch {
      toast.error('Enter a full image link starting with https://')
    }
  }

  return (
    <div className="space-y-3">
      <div className="font-medium text-sm">{label}</div>
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {images.map((src, index) => (
            <div key={src} className="group relative">
              <img src={src} alt="" className="aspect-square w-full rounded-lg border object-cover" />
              <Button
                type="button"
                size="icon-xs"
                variant="destructive"
                onClick={() => onChange(images.filter((_, i) => i !== index))}
                className="absolute top-1 right-1"
                aria-label="Remove image"
              >
                <HugeiconsIcon icon={Cancel01Icon} />
              </Button>
            </div>
          ))}
        </div>
      )}
      {!full && (
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            multiple={maxImages > 1}
            className="hidden"
            onChange={(e) => upload(e.target.files)}
          />
          <Button type="button" variant="outline" disabled={uploading} onClick={() => fileInput.current?.click()}>
            {uploading ? <Spinner /> : <HugeiconsIcon icon={CloudUploadIcon} />}
            {uploading ? 'Uploading…' : 'Upload image'}
          </Button>
          <div className="flex flex-1 gap-2">
            <Input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="or paste an image link"
              aria-label="Image link"
            />
            <Button type="button" variant="outline" onClick={addUrl} disabled={!url.trim()}>
              <HugeiconsIcon icon={Link01Icon} />
              Add
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
