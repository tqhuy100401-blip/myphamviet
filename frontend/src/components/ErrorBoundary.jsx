import React from 'react';
import { toast } from 'react-toastify';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Show toast notification
    toast.error('Đã có lỗi xảy ra. Vui lòng tải lại trang!', {
      position: 'top-center',
      autoClose: 5000,
    });

    // You can also log error to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.container}>
          <div style={styles.content}>
            <h1 style={styles.title}>😞 Oops! Có lỗi xảy ra</h1>
            <p style={styles.message}>
              Xin lỗi, đã có lỗi không mong muốn xảy ra. Vui lòng thử lại.
            </p>
            
            {import.meta.env.DEV && this.state.error && (
              <details style={styles.details}>
                <summary style={styles.summary}>Chi tiết lỗi (Development Only)</summary>
                <pre style={styles.errorText}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            
            <div style={styles.buttonContainer}>
              <button onClick={this.handleReload} style={styles.button}>
                🔄 Tải lại trang
              </button>
              <button onClick={this.handleGoHome} style={{...styles.button, ...styles.secondaryButton}}>
                🏠 Về trang chủ
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    padding: '20px',
  },
  content: {
    maxWidth: '600px',
    width: '100%',
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '40px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '20px',
  },
  message: {
    fontSize: '18px',
    color: '#666',
    marginBottom: '30px',
    lineHeight: '1.6',
  },
  details: {
    textAlign: 'left',
    marginTop: '20px',
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '5px',
    border: '1px solid #dee2e6',
  },
  summary: {
    cursor: 'pointer',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#495057',
  },
  errorText: {
    fontSize: '12px',
    color: '#dc3545',
    overflow: 'auto',
    maxHeight: '200px',
  },
  buttonContainer: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  button: {
    padding: '12px 30px',
    fontSize: '16px',
    fontWeight: '500',
    color: 'white',
    backgroundColor: '#007bff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  secondaryButton: {
    backgroundColor: '#6c757d',
  },
};

export default ErrorBoundary;
