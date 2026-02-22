import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function HistoryPage() {
    const [resumes, setResumes] = useState([])
    const [loading, setLoading] = useState(true)
    const [expandedId, setExpandedId] = useState(null)

    const navigate = useNavigate()

    useEffect(() => {
        fetchResumes()
    }, [])

    const fetchResumes = async () => {
        try {
            const res = await fetch('/api/resumes')
            const data = await res.json()
            setResumes(data)
        } catch (e) {
            console.error('Failed to fetch history:', e)
        } finally {
            setLoading(false)
        }
    }

    const getScoreColor = (s) => {
        if (s >= 75) return '#10b981'
        if (s >= 50) return '#fbbf24'
        return '#ef4444'
    }

    const formatDate = (ts) => {
        if (!ts) return '—'
        const d = new Date(ts + 'Z')
        return d.toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        })
    }

    return (
        <div className="container animate-fade-in" style={{ maxWidth: '1100px' }}>
            <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{
                    fontSize: '3rem',
                    fontWeight: '800',
                    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                    marginBottom: '0.5rem',
                    letterSpacing: '-1px'
                }}>
                    Analysis History
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '1.5rem' }}>
                    All previously analyzed resumes
                </p>
                <button
                    onClick={() => navigate('/')}
                    className="primary-btn"
                    style={{
                        maxWidth: '260px',
                        padding: '0.9rem 1.5rem',
                        fontSize: '1rem',
                        borderRadius: '12px'
                    }}
                >
                    ← Analyze New Resume
                </button>
            </header>

            {loading && (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                    <div className="loader" style={{ marginRight: 0, marginBottom: '1rem' }}></div>
                    <p>Loading history...</p>
                </div>
            )}

            {!loading && resumes.length === 0 && (
                <div className="glass-card" style={{ textAlign: 'center', padding: '4rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>📋</div>
                    <h3 style={{ color: 'var(--text-secondary)' }}>No analysis history yet</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                        Upload and analyze a resume to see results here.
                    </p>
                </div>
            )}

            {!loading && resumes.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Table Header */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '80px 2fr 1.2fr 100px 1.5fr',
                        gap: '1rem',
                        padding: '0.8rem 1.5rem',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: 'var(--text-secondary)',
                        borderBottom: '1px solid var(--border)'
                    }}>
                        <span>Score</span>
                        <span>Resume</span>
                        <span>Role</span>
                        <span>Status</span>
                        <span>Date</span>
                    </div>

                    {/* Table Rows */}
                    {resumes.map((r) => {
                        const scoreColor = getScoreColor(r.score || 0)
                        const isExpanded = expandedId === r.id
                        const analysis = r.analysis || {}

                        return (
                            <div key={r.id}>
                                <div
                                    className="glass-card"
                                    onClick={() => setExpandedId(isExpanded ? null : r.id)}
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: '80px 2fr 1.2fr 100px 1.5fr',
                                        gap: '1rem',
                                        alignItems: 'center',
                                        padding: '1.2rem 1.5rem',
                                        cursor: 'pointer',
                                        borderRadius: isExpanded ? '16px 16px 0 0' : '16px',
                                        borderBottom: isExpanded ? 'none' : undefined,
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {/* Score Circle */}
                                    <div style={{
                                        width: '52px',
                                        height: '52px',
                                        borderRadius: '50%',
                                        background: `conic-gradient(${scoreColor} ${r.score || 0}%, rgba(255,255,255,0.05) ${r.score || 0}%)`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: `0 0 12px ${scoreColor}25`
                                    }}>
                                        <div style={{
                                            width: '42px',
                                            height: '42px',
                                            borderRadius: '50%',
                                            background: 'var(--bg-card)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: '700',
                                            fontSize: '0.95rem',
                                            color: scoreColor
                                        }}>
                                            {r.score || 0}
                                        </div>
                                    </div>

                                    {/* Filename */}
                                    <span style={{
                                        fontWeight: '500',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>
                                        📄 {r.filename}
                                    </span>

                                    {/* Role */}
                                    <span style={{
                                        color: 'var(--text-secondary)',
                                        fontSize: '0.9rem',
                                        background: 'rgba(99, 102, 241, 0.1)',
                                        padding: '0.3rem 0.8rem',
                                        borderRadius: '8px',
                                        textAlign: 'center',
                                        border: '1px solid rgba(99, 102, 241, 0.15)'
                                    }}>
                                        {r.role || '—'}
                                    </span>

                                    {/* Shortlisted Badge */}
                                    <span className={`badge ${analysis.shortlisted ? 'badge-success' : 'badge-error'}`}
                                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', justifyContent: 'center' }}
                                    >
                                        {analysis.shortlisted ? '✅' : '❌'}
                                    </span>

                                    {/* Date */}
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                        {formatDate(r.timestamp)}
                                    </span>
                                </div>

                                {/* Expanded Detail Panel */}
                                {isExpanded && (
                                    <div style={{
                                        background: 'var(--bg-card)',
                                        border: '1px solid var(--border)',
                                        borderTop: '1px dashed var(--border)',
                                        borderRadius: '0 0 16px 16px',
                                        padding: '2rem',
                                        animation: 'fadeIn 0.3s ease-out'
                                    }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                            <div>
                                                <h4 style={{ color: '#10b981', marginBottom: '0.8rem', fontSize: '0.95rem' }}>
                                                    ⚡ Strengths
                                                </h4>
                                                <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.7', margin: 0 }}>
                                                    {(analysis.strengths || []).map((s, i) => (
                                                        <li key={i} style={{ marginBottom: '0.3rem' }}>{s}</li>
                                                    ))}
                                                    {(!analysis.strengths || analysis.strengths.length === 0) && (
                                                        <li style={{ listStyle: 'none', marginLeft: '-1.2rem', opacity: 0.5 }}>No data</li>
                                                    )}
                                                </ul>
                                            </div>
                                            <div>
                                                <h4 style={{ color: '#ef4444', marginBottom: '0.8rem', fontSize: '0.95rem' }}>
                                                    🎯 Weaknesses
                                                </h4>
                                                <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.7', margin: 0 }}>
                                                    {(analysis.weaknesses || []).map((w, i) => (
                                                        <li key={i} style={{ marginBottom: '0.3rem' }}>{w}</li>
                                                    ))}
                                                    {(!analysis.weaknesses || analysis.weaknesses.length === 0) && (
                                                        <li style={{ listStyle: 'none', marginLeft: '-1.2rem', opacity: 0.5 }}>No data</li>
                                                    )}
                                                </ul>
                                            </div>
                                        </div>
                                        {analysis.suggestions && analysis.suggestions.length > 0 && (
                                            <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                                                <h4 style={{ color: 'var(--primary)', marginBottom: '0.8rem', fontSize: '0.95rem' }}>
                                                    💡 Suggestions
                                                </h4>
                                                <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: '1.7', margin: 0 }}>
                                                    {analysis.suggestions.map((s, i) => (
                                                        <li key={i} style={{ marginBottom: '0.3rem' }}>{s}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
