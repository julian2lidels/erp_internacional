import { useState, useEffect } from "react"
import { BrowserRouter, Routes, Route, Link } from "react-router-dom"
import Navbar from "./components/Navbar"
import ErrorBoundary from "./components/ErrorBoundary"
import Monedas from "./pages/divisas/Monedas"
import TasasCambio from "./pages/divisas/TasasCambio"
import Paises from "./pages/organizacion/Paises"
import Sucursales from "./pages/organizacion/Sucursales"
import Impuestos from "./pages/organizacion/Impuestos"
import Roles from "./pages/seguridad/Roles"
import Usuarios from "./pages/seguridad/Usuarios"
import Auditoria from "./pages/seguridad/Auditoria"

function Inicio() {
  const [mensaje, setmensaje] = useState("Estableciendo enlace seguro con el servidor...")
  const [conectado, setconectado] = useState(false)

  useEffect(() => {
    fetch("/api/health")
      .then(res => res.json())
      .then(data => {
        setmensaje(data.message)
        setconectado(true)
      })
      .catch(() => {
        setmensaje("Error de enlace. Verifica que Uvicorn esté activo.")
        setconectado(false)
      })
  }, [])

  const bloques = [
    {
      titulo: "Divisas y Finanzas",
      descripcion: "Catálogo de monedas ISO y tasas de cambio históricas.",
      enlaces: [
        { nombre: "Monedas", ruta: "/divisas/monedas" },
        { nombre: "Tasas de Cambio", ruta: "/divisas/tasas-cambio" },
      ],
    },
    {
      titulo: "Organización Global",
      descripcion: "Países de operación, sedes/sucursales y reglas fiscales.",
      enlaces: [
        { nombre: "Países", ruta: "/organizacion/paises" },
        { nombre: "Sucursales", ruta: "/organizacion/sucursales" },
        { nombre: "Impuestos", ruta: "/organizacion/impuestos" },
      ],
    },
    {
      titulo: "Seguridad y Accesos",
      descripcion: "Control de roles, permisos por módulo, usuarios y auditoría.",
      enlaces: [
        { nombre: "Roles", ruta: "/seguridad/roles" },
        { nombre: "Usuarios y Permisos", ruta: "/seguridad/usuarios" },
        { nombre: "Auditoría", ruta: "/seguridad/auditoria" },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-neutral-950 font-sans text-neutral-100 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[50rem] h-[50rem] bg-emerald-900/30 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60rem] h-[60rem] bg-amber-900/10 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="relative z-10">
        <Navbar modulo="Panel Principal" titulo="ERP" resaltado="Internacional" />

        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className={`mb-10 p-4 rounded-2xl backdrop-blur-md flex items-center border ${conectado ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-300" : "bg-red-950/30 border-red-500/30 text-red-300"}`}>
            <div className={`w-3 h-3 rounded-full ${conectado ? "bg-emerald-400 animate-ping" : "bg-red-500"} mr-3 shrink-0`}></div>
            <p className="text-xs font-semibold">{mensaje}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {bloques.map((bloque) => (
              <div key={bloque.titulo} className="bg-white/[0.03] backdrop-blur-3xl p-6 rounded-3xl border border-white/10 shadow-2xl flex flex-col justify-between">
                <div>
                  <p className="text-[10px] text-amber-400 font-bold uppercase tracking-widest mb-1">Módulo</p>
                  <h2 className="text-xl font-extrabold text-white mb-2">{bloque.titulo}</h2>
                  <p className="text-xs text-neutral-400 mb-6">{bloque.descripcion}</p>
                </div>

                <div className="space-y-2.5">
                  {bloque.enlaces.map((item) => (
                    <Link
                      key={item.ruta}
                      to={item.ruta}
                      className="flex justify-between items-center py-3 px-4 rounded-xl text-xs font-bold text-white bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-300 border border-white/10 hover:border-emerald-500/40 transition-all"
                    >
                      <span>{item.nombre}</span>
                      <span>→</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/divisas/monedas" element={<Monedas />} />
        <Route path="/divisas/tasas-cambio" element={<TasasCambio />} />
        <Route path="/organizacion/paises" element={<Paises />} />
        <Route path="/organizacion/sucursales" element={<Sucursales />} />
        <Route path="/organizacion/impuestos" element={<Impuestos />} />
        <Route path="/seguridad/roles" element={<Roles />} />
        <Route path="/seguridad/usuarios" element={<Usuarios />} />
        <Route path="/seguridad/auditoria" element={<Auditoria />} />
      </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  )
}

export default App
