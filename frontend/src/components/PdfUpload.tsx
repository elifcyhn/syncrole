import { useState, type ChangeEvent } from 'react'
import './PdfUpload.css'

type PdfUploadProps = {
  title: string
  endpoint: string
  inputId: string
}

type UploadResponse = {
  filename: string
  content_type: string
  size_bytes: number
}

type ErrorResponse = {
  detail?: string
}

function PdfUpload({ title, endpoint, inputId }: PdfUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadStatus, setUploadStatus] = useState<
    'idle' | 'uploading' | 'success' | 'error'
  >('idle')
  const [uploadMessage, setUploadMessage] = useState('')

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null

    setUploadStatus('idle')
    setUploadMessage('')

    if (file && file.type !== 'application/pdf') {
      setSelectedFile(null)
      setUploadStatus('error')
      setUploadMessage('Yalnızca PDF dosyası seçebilirsiniz.')
      event.target.value = ''
      return
    }

    setSelectedFile(file)
  }

  async function handleUpload() {
    if (!selectedFile) {
      return
    }

    setUploadStatus('uploading')
    setUploadMessage('')

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      })
      const data: UploadResponse | ErrorResponse = await response.json()

      if (!response.ok) {
        const errorData = data as ErrorResponse
        throw new Error(errorData.detail ?? 'PDF yüklenemedi.')
      }

      const uploadData = data as UploadResponse
      setUploadStatus('success')
      setUploadMessage(
        `${uploadData.filename} (${uploadData.size_bytes} bytes) yüklendi.`,
      )
    } catch (error) {
      setUploadStatus('error')
      setUploadMessage(
        error instanceof Error ? error.message : 'PDF yüklenemedi.',
      )
    }
  }

  const titleId = `${inputId}-title`

  return (
    <section className="pdf-upload" aria-labelledby={titleId}>
      <h2 id={titleId}>{title}</h2>
      <label htmlFor={inputId}>Choose a PDF file</label>
      <input
        id={inputId}
        type="file"
        accept="application/pdf,.pdf"
        onChange={handleFileChange}
      />

      {selectedFile && (
        <>
          <p className="selected-file">Selected: {selectedFile.name}</p>
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploadStatus === 'uploading'}
          >
            {title}
          </button>
        </>
      )}

      {uploadStatus === 'uploading' && (
        <p className="upload-message">Uploading PDF...</p>
      )}
      {uploadStatus === 'success' && (
        <p className="upload-message success" role="status">
          {uploadMessage}
        </p>
      )}
      {uploadStatus === 'error' && (
        <p className="upload-message error" role="alert">
          {uploadMessage}
        </p>
      )}
    </section>
  )
}

export default PdfUpload
