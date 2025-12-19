'use client'

import { useState, useRef } from 'react'
import { Upload, X, Link as LinkIcon, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface ImageUploadProps {
  images: string[]
  onChange: (images: string[]) => void
  maxImages?: number
  label?: string
}

export default function ImageUpload({
  images,
  onChange,
  maxImages = 5,
  label = 'Upload Images',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [errorDialog, setErrorDialog] = useState<{
    open: boolean
    title: string
    message: string
  }>({ open: false, title: '', message: '' })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const showError = (title: string, message: string) => {
    setErrorDialog({ open: true, title, message })
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    if (images.length + files.length > maxImages) {
      showError(
        'Image Limit Exceeded',
        `You can upload a maximum of ${maxImages} images`
      )
      return
    }

    setUploading(true)

    try {
      const uploadPromises = Array.from(files).map(async file => {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'Upload failed')
        }

        const data = await response.json()
        return data.url
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      onChange([...images, ...uploadedUrls])
    } catch (error) {
      console.error('Upload error:', error)
      showError(
        'Upload Failed',
        error instanceof Error ? error.message : 'Failed to upload image'
      )
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleUrlAdd = () => {
    if (!urlInput.trim()) return

    if (images.length >= maxImages) {
      showError(
        'Image Limit Exceeded',
        `You can add a maximum of ${maxImages} images`
      )
      return
    }

    // Validate URL
    try {
      new URL(urlInput)
      onChange([...images, urlInput.trim()])
      setUrlInput('')
      setShowUrlInput(false)
    } catch {
      showError('Invalid URL', 'Please enter a valid URL')
    }
  }

  const handleRemove = (index: number) => {
    onChange(images.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <label className="block font-semibold mb-2">{label}</label>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-4 mb-4">
          {images.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Upload ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border"
              />
              <Button
                type="button"
                size="icon"
                variant="destructive"
                onClick={() => handleRemove(index)}
                className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Buttons */}
      {images.length < maxImages && (
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload Image
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => setShowUrlInput(!showUrlInput)}
          >
            <LinkIcon className="w-4 h-4" />
            Add URL
          </Button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* URL Input */}
      {showUrlInput && (
        <div className="flex gap-2">
          <Input
            type="url"
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            placeholder="https://example.com/image.jpg"
            onKeyPress={e => e.key === 'Enter' && handleUrlAdd()}
          />
          <Button type="button" onClick={handleUrlAdd}>
            Add
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setShowUrlInput(false)
              setUrlInput('')
            }}
          >
            Cancel
          </Button>
        </div>
      )}

      <p className="text-sm text-gray-600">
        {images.length} / {maxImages} images added
      </p>

      {/* Error Dialog */}
      <AlertDialog
        open={errorDialog.open}
        onOpenChange={open => setErrorDialog({ ...errorDialog, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{errorDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {errorDialog.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() =>
                setErrorDialog({ open: false, title: '', message: '' })
              }
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
