import React, { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import UploadPage from './UploadPage'
import ResultPage from './ResultPage'
import HistoryPage from './HistoryPage'

export default function App() {
  const [analysisResult, setAnalysisResult] = useState(null)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UploadPage setAnalysisResult={setAnalysisResult} />} />
        <Route path="/result" element={<ResultPage result={analysisResult} />} />
        <Route path="/history" element={<HistoryPage />} />
      </Routes>
    </BrowserRouter>
  )
}
