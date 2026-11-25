import { Component } from "react"

// Evita la pantalla en blanco: si una página falla, muestra el error en pantalla.
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error("Error en la página:", error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-neutral-950 text-neutral-100 p-10">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Ocurrió un error en esta página</h1>
          <pre className="bg-black/50 border border-red-500/30 rounded-xl p-4 text-xs text-red-200 whitespace-pre-wrap">
            {String(this.state.error && this.state.error.message ? this.state.error.message : this.state.error)}
          </pre>
          <a href="/" className="inline-block mt-6 text-emerald-400 underline">Volver al inicio</a>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
