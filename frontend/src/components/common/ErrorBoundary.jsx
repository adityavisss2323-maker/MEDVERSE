import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("SOC ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-box">
          <AlertTriangle size={32} className="red-icon" />
          <h3>Security Component Temporarily Unavailable</h3>
          <p>{this.state.error?.message || "An unexpected rendering error occurred."}</p>
          <button
            className="primary-button"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
          >
            <RefreshCw size={15} />
            <span>Reload SOC Interface</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
