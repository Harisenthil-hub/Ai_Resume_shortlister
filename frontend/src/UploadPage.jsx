import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export default function UploadPage({ setAnalysisResult }) {
    const [file, setFile] = useState(null)
    const [role, setRole] = useState('Software Engineer')
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [message, setMessage] = useState('')

    const inputRef = useRef(null)
    const navigate = useNavigate()

    const handleDragOver = (e) => { e.preventDefault(); e.currentTarget.classList.add('active'); }
    const handleDragLeave = (e) => { e.preventDefault(); e.currentTarget.classList.remove('active'); }
    const handleDrop = (e) => {
        e.preventDefault(); e.currentTarget.classList.remove('active');
        if (e.dataTransfer.files?.length > 0) setFile(e.dataTransfer.files[0])
    }
    const handleFileSelect = (e) => { if (e.target.files?.length > 0) setFile(e.target.files[0]) }

    const analyze = async () => {
        if (!file) return

        setIsAnalyzing(true)
        setMessage('Analyzing Resume...')

        const form = new FormData()
        form.append('role', role)
        form.append('resume', file)

        try {
            const res = await fetch('/api/analyze-resume', {
                method: 'POST',
                body: form
            })

            if (res.status === 200) {
                const data = await res.json()
                setAnalysisResult(data)
                navigate('/result')
            } else {
                const err = await res.json()
                alert(`Error: ${err.message || err.error || 'Server Error'}`)
            }
        } catch (e) {
            console.error(e)
            alert('Network Error')
        } finally {
            setIsAnalyzing(false)
            setMessage('')
        }
    }

    return (
        <div className="container" style={{ maxWidth: '800px' }}>
            <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h1 style={{
                    fontSize: '3.5rem',
                    fontWeight: '800',
                    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                    marginBottom: '1rem',
                    letterSpacing: '-1px'
                }}>
                    AI Resume Evaluation
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto' }}>
                    Instant AI Analysis (REST API)
                </p>
                <button
                    onClick={() => navigate('/history')}
                    style={{
                        marginTop: '1.5rem',
                        background: 'none',
                        border: '1px solid var(--border)',
                        color: 'var(--text-secondary)',
                        padding: '0.7rem 1.5rem',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        fontWeight: '500',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.color = 'var(--text-main)' }}
                    onMouseLeave={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-secondary)' }}
                >
                    📋 View History
                </button>
            </header>

            <div className="glass-card" style={{ padding: '3rem' }}>
                <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
                    <label style={{ display: 'block', marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '500', color: 'var(--text-secondary)' }}>
                        Target Role
                    </label>
                    <select
                        value={role}
                        onChange={e => setRole(e.target.value)}
                        style={{
                            width: '100%',
                            maxWidth: '400px',
                            padding: '1rem 1.5rem',
                            background: 'rgba(30, 41, 59, 0.7)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '12px',
                            color: 'var(--text-main)',
                            fontSize: '1.2rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            outline: 'none',
                            transition: 'all 0.3s ease',
                            textAlign: 'center'
                        }}
                    >
                        <option value="Software Engineer">Software Engineer</option>
                        <option value="Data Scientist">Data Scientist</option>
                        <option value="Product Manager">Product Manager</option>
                        <option value="UI/UX Designer">UI/UX Designer</option>
                        <option value="DevOps Engineer">DevOps Engineer</option>
                    </select>
                </div>

                <div
                    className="file-drop-zone"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current.click()}
                    style={{
                        minHeight: '250px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        background: file ? 'rgba(34, 197, 94, 0.05)' : 'rgba(255,255,255,0.02)',
                        border: file ? '2px solid rgba(34, 197, 94, 0.3)' : '2px dashed var(--glass-border)',
                        borderRadius: '16px'
                    }}
                >
                    <input
                        type="file"
                        accept=".pdf,.txt"
                        ref={inputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileSelect}
                    />
                    <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.7 }}>
                        {file ? '📄' : '📤'}
                    </div>
                    <p style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '0.5rem', color: file ? 'var(--text-main)' : 'inherit' }}>
                        {file ? file.name : 'Drag & Drop or Click to Upload'}
                    </p>
                </div>

                {file && (
                    <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                        <button
                            onClick={(e) => { e.stopPropagation(); setFile(null); }}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                            Remove file
                        </button>
                    </div>
                )}

                {message && (
                    <div style={{ marginTop: '1.5rem', textAlign: 'center', color: '#6366f1' }}>
                        ⏳ {message}
                    </div>
                )}

                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <button
                        className="primary-btn"
                        onClick={analyze}
                        disabled={isAnalyzing || !file}
                        style={{
                            opacity: (isAnalyzing || !file) ? 0.7 : 1,
                            cursor: (isAnalyzing || !file) ? 'not-allowed' : 'pointer',
                            width: '100%',
                            maxWidth: '300px',
                            padding: '1.2rem',
                            fontSize: '1.2rem',
                            borderRadius: '12px',
                            boxShadow: isAnalyzing ? 'none' : '0 4px 20px rgba(99, 102, 241, 0.4)'
                        }}
                    >
                        {isAnalyzing ? 'Analyzing...' : 'Analyze Resume 🚀'}
                    </button>
                </div>
            </div>
        </div>
    )
}
