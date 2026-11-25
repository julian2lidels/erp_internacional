import { Link, useLocation } from "react-router-dom"

const secciones = [
  {
    grupo: "Divisas y Finanzas",
    items: [
      { nombre: "Monedas", ruta: "/divisas/monedas" },
      { nombre: "Tasas de Cambio", ruta: "/divisas/tasas-cambio" },
    ],
  },
  {
    grupo: "Organización Global",
    items: [
      { nombre: "Países", ruta: "/organizacion/paises" },
      { nombre: "Sucursales", ruta: "/organizacion/sucursales" },
      { nombre: "Impuestos", ruta: "/organizacion/impuestos" },
    ],
  },
  {
    grupo: "Seguridad y Accesos",
    items: [
      { nombre: "Roles", ruta: "/seguridad/roles" },
      { nombre: "Usuarios y Permisos", ruta: "/seguridad/usuarios" },
      { nombre: "Auditoría", ruta: "/seguridad/auditoria" },
    ],
  },
]

function Navbar({ modulo = "ERP Internacional", titulo, resaltado }) {
  const location = useLocation()

  return (
    <header className="bg-white/[0.02] backdrop-blur-2xl border-b border-white/10 sticky top-0 z-50 shadow-2xl">
      <div className="max-w-7xl mx-auto px-6 py-3.5 flex flex-wrap justify-between items-center gap-4">
        <Link to="/" className="flex items-center gap-3.5 group">
          <div className="w-11 h-11 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center shadow-[0_0_25px_rgba(52,211,153,0.35)] group-hover:scale-105 transition-transform">
            <span className="font-black text-neutral-950 text-lg tracking-tighter">ERP</span>
          </div>
          <div>
            <p className="text-[10px] text-amber-400 font-bold tracking-widest uppercase">{modulo}</p>
            <h1 className="text-lg font-bold tracking-wide text-white">
              {titulo} {resaltado && <span className="text-emerald-400">{resaltado}</span>}
            </h1>
          </div>
        </Link>

        <nav className="flex flex-wrap items-center gap-2">
          <Link
            to="/"
            className={`text-xs font-bold px-3.5 py-2 rounded-xl border transition-all ${
              location.pathname === "/"
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                : "text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 border-white/10"
            }`}
          >
            Inicio
          </Link>

          {secciones.map((sec) => {
            const activoEnGrupo = sec.items.some((i) => location.pathname === i.ruta)
            return (
              <div key={sec.grupo} className="relative group">
                <button
                  type="button"
                  className={`text-xs font-bold px-3.5 py-2 rounded-xl border transition-all flex items-center gap-1.5 ${
                    activoEnGrupo
                      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40"
                      : "text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 border-white/10"
                  }`}
                >
                  <span>{sec.grupo}</span>
                  <span className="text-[10px] opacity-70">▼</span>
                </button>

                <div className="absolute right-0 mt-2 w-52 bg-neutral-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  {sec.items.map((item) => {
                    const activo = location.pathname === item.ruta
                    return (
                      <Link
                        key={item.ruta}
                        to={item.ruta}
                        className={`block px-4 py-2.5 text-xs font-semibold transition-colors ${
                          activo
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "text-neutral-300 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {item.nombre}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </nav>
      </div>
    </header>
  )
}

export default Navbar
