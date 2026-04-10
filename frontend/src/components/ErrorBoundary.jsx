import React from "react";
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("[ERROR BOUNDARY] Caught an error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-10 bg-[#0B1220] text-center">
          {" "}
          <div className="w-20 h-20 bg-red-500/20 rounded-3xl flex items-center justify-center mb-6 border border-red-500/30">
            {" "}
            <span className="text-4xl">âš ï¸</span>{" "}
          </div>{" "}
          <h1 className="text-2xl font-bold text-white uppercase tracking-tight mb-4">
            {" "}
            Strategic Interface Failure{" "}
          </h1>{" "}
          <p className="text-sub font-bold text-xs uppercase tracking-widest max-w-md leading-relaxed mb-8">
            {" "}
            The neural link to this component has been severed due to a runtime
            exception. Intelligence systems are attempting to recover.{" "}
          </p>{" "}
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all"
          >
            {" "}
            Re-initiate Neural Link{" "}
          </button>{" "}
          {process.env.NODE_ENV === "development" && (
            <pre className="mt-8 p-6 bg-black/40 rounded-2xl text-red-400 text-left text-[10px] overflow-auto max-w-3xl border border-white/5">
              {" "}
              {this.state.error?.toString()}{" "}
            </pre>
          )}{" "}
        </div>
      );
    }
    return this.props.children;
  }
}
export default ErrorBoundary;
