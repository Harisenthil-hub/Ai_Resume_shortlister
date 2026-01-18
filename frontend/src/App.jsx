import React, { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import UploadPage from './UploadPage'
import ResultPage from './ResultPage'

export default function App() {
  // Simple state management for the result to avoid complex routing/persistence for now
  const [analysisResult, setAnalysisResult] = useState(null)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UploadPage setAnalysisResult={setAnalysisResult} />} />
        <Route path="/result" element={<ResultPage result={analysisResult} />} />
      </Routes>
    </BrowserRouter>
  )
}
