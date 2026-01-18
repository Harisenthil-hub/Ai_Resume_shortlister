import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function ResultPage({ result }) {
    const navigate = useNavigate()

    useEffect(() => {
        if (!result) {
            navigate('/')
        }
    }, [result, navigate])

    if (!result) return null

    const { filename, role, analysis } = result
    const { score, shortlisted, strengths, weaknesses, suggestions } = analysis

    const getScoreColor = (s) => {
        if (s >= 75) return '#10b981' // Green
        if (s >= 50) return '#fbbf24' // Yellow
        return '#ef4444' // Red
    }

    const scoreColor = getScoreColor(score)

    return (
        <div className="container animate-fade-in" style={{ maxWidth: '1000px', paddingTop: '2rem' }}>
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                    onClick={() => navigate('/')}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontWeight: 500,
                        transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.color = 'var(--text-main)'}
                    onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
                >
                    ← Upload Another Resume
                </button>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem', alignItems: 'start' }}>
                {/* LEFT COLUMN: SCORE & STATUS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
                        <h3 style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>
                            Resume Score
                        </h3>

                        {/* Score Circle */}
                        <div style={{
                            position: 'relative',
                            width: '180px',
                            height: '180px',
                            margin: '0 auto 2rem auto',
                            borderRadius: '50%',
                            background: `conic-gradient(${scoreColor} ${score}%, rgba(255,255,255,0.05) ${score}%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: `0 0 40px ${scoreColor}30`
                        }}>
                            <div style={{
                                width: '160px',
                                height: '160px',
                                borderRadius: '50%',
                                background: 'var(--bg-card)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <span style={{ fontSize: '3.5rem', fontWeight: '800', lineHeight: 1, color: 'white' }}>{score}</span>
                            </div>
                        </div>

                        <div className={`badge ${shortlisted ? 'badge-success' : 'badge-error'}`} style={{ fontSize: '1.1rem', padding: '0.8rem 1.5rem', width: '100%', justifyContent: 'center', boxSizing: 'border-box' }}>
                            {shortlisted ? '✅ Shortlisted' : '❌ Not Shortlisted'}
                        </div>
                    </div>

                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '0.3rem' }}>File</strong>
                            {filename}
                        </p>
                        <div style={{ height: '1px', background: 'var(--border)', margin: '1rem 0' }}></div>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '0.3rem' }}>Target Role</strong>
                            {role}
                        </p>
                    </div>
                </div>

                {/* RIGHT COLUMN: DETAILS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="glass-card">
                            <h3 style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span>⚡</span> Strengths
                            </h3>
                            <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '0.95rem', margin: 0 }}>
                                {strengths.map((s, i) => <li key={i} style={{ marginBottom: '0.5rem' }}>{s}</li>)}
                            </ul>
                        </div>

                        <div className="glass-card">
                            <h3 style={{ color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span>🎯</span> Weaknesses
                            </h3>
                            <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '0.95rem', margin: 0 }}>
                                {weaknesses.map((w, i) => <li key={i} style={{ marginBottom: '0.5rem' }}>{w}</li>)}
                            </ul>
                        </div>
                    </div>

                    <div className="glass-card" style={{ borderLeft: '4px solid var(--primary)' }}>
                        <h3 style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>💡</span> Improvement Suggestions
                        </h3>
                        <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-main)', lineHeight: '1.6', fontSize: '1rem', margin: 0 }}>
                            {suggestions.map((s, i) => <li key={i} style={{ marginBottom: '0.8rem' }}>{s}</li>)}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
