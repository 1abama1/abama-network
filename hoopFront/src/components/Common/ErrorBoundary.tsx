import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('[ErrorBoundary]', error, info.componentStack);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;
            return (
                <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', minHeight: '200px', padding: '2rem',
                    color: 'var(--text-primary, #333)'
                }}>
                    <h2>Something went wrong</h2>
                    <p style={{ color: 'var(--text-secondary, #666)', maxWidth: '400px', textAlign: 'center' }}>
                        {this.state.error?.message || 'An unexpected error occurred.'}
                    </p>
                    <button
                        onClick={this.handleReset}
                        style={{
                            marginTop: '1rem', padding: '0.5rem 1.5rem',
                            background: 'var(--primary, #4f46e5)', color: '#fff',
                            border: 'none', borderRadius: '8px', cursor: 'pointer'
                        }}
                    >
                        Try again
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}
