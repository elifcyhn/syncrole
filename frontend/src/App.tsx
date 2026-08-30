import { useEffect, useState, type ChangeEvent } from 'react'
import './App.css'

type UploadResponse = {
  filename: string
  content_type: string
  size_bytes: number
}

type ErrorResponse = {
  detail?: string
}

function App() {
  const [connectionMessage, setConnectionMessage] = useState(
    'Checking backend connection...',
  )
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadStatus, setUploadStatus] = useState<
    'idle' | 'uploading' | 'success' | 'error'
  >('idle')
  const [uploadMessage, setUploadMessage] = useState('')

  useEffect(() => {
    async function checkBackend() {
      try {
        const response = await fetch('http://127.0.0.1:8000/health')

        if (!response.ok) {
          throw new Error('Backend request failed')
        }

        const data: { status: string } = await response.json()
        setConnectionMessage(
          data.status === 'ok'
            ? 'Backend connection: Connected'
            : 'Backend connection: Failed',
        )
      } catch {
        setConnectionMessage('Backend connection: Failed')
      }
    }

    void checkBackend()
  }, [])

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
      const response = await fetch('http://127.0.0.1:8000/upload/cv', {
        method: 'POST',
        body: formData,
      })
      const data: UploadResponse | ErrorResponse = await response.json()

      if (!response.ok) {
        const errorData = data as ErrorResponse
        throw new Error(errorData.detail ?? 'CV yüklenemedi.')
      }

      const uploadData = data as UploadResponse
      setUploadStatus('success')
      setUploadMessage(
        `${uploadData.filename} (${uploadData.size_bytes} bytes) yüklendi.`,
      )
    } catch (error) {
      setUploadStatus('error')
      setUploadMessage(
        error instanceof Error ? error.message : 'CV yüklenemedi.',
      )
    }
  }

  return (
    <main className="landing">
      <h1>SyncRole</h1>
      <p>AI-powered CV &amp; Job Match Analyzer</p>
      <p className="connection-status">{connectionMessage}</p>

      <section className="upload-panel" aria-labelledby="cv-upload-title">
        <h2 id="cv-upload-title">Upload your CV</h2>
        <label htmlFor="cv-file">Choose a PDF file</label>
        <input
          id="cv-file"
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
              Upload CV
            </button>
          </>
        )}

        {uploadStatus === 'uploading' && (
          <p className="upload-message">Uploading CV...</p>
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
    </main>
  )
}

export default App
