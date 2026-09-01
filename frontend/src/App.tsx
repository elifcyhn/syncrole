import { useEffect, useState } from 'react'
import './App.css'
import PdfUpload from './components/PdfUpload'

function App() {
  const [connectionMessage, setConnectionMessage] = useState(
    'Checking backend connection...',
  )

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

  return (
    <main className="landing">
      <h1>SyncRole</h1>
      <p>AI-powered CV &amp; Job Match Analyzer</p>
      <p className="connection-status">{connectionMessage}</p>

      <div className="upload-grid">
        <PdfUpload
          title="Upload CV"
          endpoint="http://127.0.0.1:8000/upload/cv"
          inputId="cv-file"
        />
        <PdfUpload
          title="Upload Job Description"
          endpoint="http://127.0.0.1:8000/upload/job-description"
          inputId="job-description-file"
        />
      </div>
    </main>
  )
}

export default App
