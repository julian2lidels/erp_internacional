import { useState, useEffect } from "react"
import Navbar from "../../components/Navbar"
import { getLista } from "../../api"

function Auditoria() {
  const [logs, setlogs] = useState([])

  useEffect(() => {
    getLista("/api/seguridad/auditoria").then(setlogs)
  }, [])

  return (
    <div className="min-h-screen bg-neutral-950 font-sans text-neutral-100 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[50rem] h-[50rem] bg-emerald-900/30 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="relative z-10">
        <Navbar modulo="Seguridad y Trazabilidad" titulo="Registro de" resaltado="Auditoría" />

        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="bg-white/[0.02] border border-white/10 rounded-3xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 text-neutral-400 uppercase">
                <tr>
                  <th className="p-4">Fecha / Hora</th>
                  <th className="p-4">Usuario</th>
                  <th className="p-4">Tabla</th>
                  <th className="p-4">Acción</th>
                  <th className="p-4">Valor Anterior</th>
                  <th className="p-4">Valor Nuevo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {logs.map(l => (
                  <tr key={l.id_auditoria} className="hover:bg-white/[0.02]">
                    <td className="p-4 text-neutral-400">{l.fecha_hora}</td>
                    <td className="p-4 font-bold text-white">{l.usuario}</td>
                    <td className="p-4 font-mono text-emerald-400">{l.tabla_afectada}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded font-bold ${l.accion === "ACCESO_DENEGADO" ? "bg-red-500/20 text-red-300" : "bg-blue-500/20 text-blue-300"}`}>
                        {l.accion}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-neutral-400">{l.valor_anterior || "-"}</td>
                    <td className="p-4 font-mono text-neutral-300">{l.valor_nuevo || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Auditoria
