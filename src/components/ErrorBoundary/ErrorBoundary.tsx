import {Component, ErrorInfo, ReactNode} from 'react';
import css from './ErrorBoundary.module.css';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {hasError: false, error: null};
    }

    static getDerivedStateFromError(error: Error): State {
        return {hasError: true, error};
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('ErrorBoundary caught:', error, info);
    }

    handleReset = () => {
        this.setState({hasError: false, error: null});
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className={css.page}>
                    <div className={css.card}>
                        <div className={css.icon}>⚠️</div>
                        <h1 className={css.title}>Щось пішло не так</h1>
                        <p className={css.text}>
                            Виникла непередбачена помилка. Спробуйте оновити сторінку або повернутись на головну.
                        </p>
                        {this.state.error && (
                            <details className={css.details}>
                                <summary>Технічні деталі</summary>
                                <pre>{this.state.error.message}</pre>
                            </details>
                        )}
                        <div className={css.buttons}>
                            <button className={css.btnSecondary} onClick={() => window.location.reload()}>
                                🔄 Оновити сторінку
                            </button>
                            <button className={css.btnPrimary} onClick={this.handleReset}>
                                🏠 На головну
                            </button>
                        </div>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;