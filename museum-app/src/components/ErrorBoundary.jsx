import React from 'react';

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    position: 'fixed', inset: 0, backgroundColor: '#000000',
                    display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                    color: '#ffffff', textAlign: 'center', padding: '2rem', zIndex: 99999
                }}>
                    <h1
                        className="serif"
                        style={{ fontSize: 'clamp(2rem, 8vw, 4rem)', fontWeight: 300, marginBottom: '1.5rem', letterSpacing: '2px' }}
                    >
                        Something went wrong.
                    </h1>
                    <p
                        className="sans"
                        style={{ fontSize: 'clamp(0.85rem, 2vw, 1.1rem)', color: 'rgba(255,255,255,0.6)', maxWidth: '500px', lineHeight: 1.8, marginBottom: '2.5rem' }}
                    >
                        Your browser may not support the 3D features this experience requires. Please try a modern browser like Chrome, Firefox, or Edge.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="sans"
                        style={{
                            background: 'transparent', color: '#ffffff',
                            border: '1px solid rgba(255,255,255,0.3)', borderRadius: '50px',
                            padding: '14px 40px', cursor: 'pointer',
                            fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '4px',
                            transition: 'all 0.4s ease'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.color = '#000000'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#ffffff'; }}
                    >
                        Reload
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
