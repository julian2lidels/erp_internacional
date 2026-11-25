import { useState, useEffect } from "react"
import Navbar from "../../components/Navbar"
import { getLista } from "../../api"

function Usuarios() {
  const [usuarios, setusuarios] = useState([])
  const [roles, setroles] = useState([])
  const [sucursales, setsucursales] = useState([])
  const [modulos, setmodulos] = useState([])

  const [nombre, setnombre] = useState("")
  const [email, setemail] = useState("")
  const [password, setpassword] = useState("")
  const [idrol, setidrol] = useState("")
  const [idsucursal, setsucursal] = useState("")
  const [idioma, setidioma] = useState("es")

  const [nuevomodulo, setnuevomodulo] = useState("")
  const [rolseleccionado, setrolseleccionado] = useState("")
  const [modulosasignados, setmodulosasignados] = useState([])

  const cargardatos = () => {
    getLista("/api/seguridad/usuarios").then(setusuarios)
    getLista("/api/core/roles").then(setroles)
    getLista("/api/core/sucursales").then(setsucursales)
    getLista("/api/seguridad/modulos").then(setmodulos)
  }

  useEffect(() => {
    cargardatos()
  }, [])

  const guardarusuario = (e) => {
    e.preventDefault()
    fetch("/api/seguridad/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre,
        email,
        password,
        id_rol: Number(idrol),
        id_sucursal: Number(idsucursal),
        idioma
      })
    }).then(async res => {
      if (res.ok) {
        cargardatos()
        setnombre("")
        setemail("")
        setpassword("")
      } else {
        const err = await res.json()
        alert(err.detail || "Error al crear usuario")
      }
    })
  }

  const cambiarestado = (id, estadoactual) => {
    fetch(`/api/seguridad/usuarios/${id}/estado`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activo: !estadoactual })
    }).then(res => {
      if (res.ok) cargardatos()
    })
  }

  const crearmodulo = (e) => {
    e.preventDefault()
    fetch("/api/seguridad/modulos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: nuevomodulo })
    }).then(res => {
      if (res.ok) {
        setnuevomodulo("")
        cargardatos()
      }
    })
  }

  const seleccionarrolpermisos = (id_r) => {
    setrolseleccionado(id_r)
    if (!id_r) {
      setmodulosasignados([])
      return
    }
    getLista(`/api/seguridad/roles/${id_r}/modulos`).then(data => setmodulosasignados(data.map(m => m.id_modulo)))
  }

  const togglemodulo = (id_m) => {
    setmodulosasignados(prev =>
      prev.includes(id_m) ? prev.filter(x => x !== id_m) : [...prev, id_m]
    )
  }

  const guardarpermisos = () => {
    if (!rolseleccionado) return
    fetch("/api/seguridad/roles/asignar-modulos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_rol: Number(rolseleccionado),
        modulos_ids: modulosasignados
      })
    }).then(res => {
      if (res.ok) alert("Permisos actualizados correctamente")
    })
  }

  return (
    <div className="min-h-screen bg-neutral-950 font-sans text-neutral-100 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[50rem] h-[50rem] bg-emerald-900/30 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="relative z-10">
        <Navbar modulo="Seguridad y Accesos" titulo="Usuarios y" resaltado="Permisos" />

        <div className="max-w-7xl mx-auto px-6 py-10 space-y-12">
          <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-8 rounded-3xl">
            <h2 className="text-lg font-bold text-white mb-6">Registrar Usuario</h2>
            <form onSubmit={guardarusuario} className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <input type="text" placeholder="Nombre completo" value={nombre} onChange={e => setnombre(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl p-3.5 text-sm text-white" required />
              <input type="email" placeholder="Correo corporativo" value={email} onChange={e => setemail(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl p-3.5 text-sm text-white" required />
              <input type="password" placeholder="Contraseña (mín. 6)" value={password} onChange={e => setpassword(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl p-3.5 text-sm text-white" required />

              <select value={idrol} onChange={e => setidrol(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl p-3.5 text-sm text-white" required>
                <option value="">Seleccionar Rol...</option>
                {roles.map(r => <option key={r.id_rol} value={r.id_rol}>{r.nombre}</option>)}
              </select>

              <select value={idsucursal} onChange={e => setsucursal(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl p-3.5 text-sm text-white" required>
                <option value="">Seleccionar Sucursal...</option>
                {sucursales.map(s => <option key={s.id_sucursal} value={s.id_sucursal}>{s.nombre}</option>)}
              </select>

              <select value={idioma} onChange={e => setidioma(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl p-3.5 text-sm text-white">
                <option value="es">Español (ES)</option>
                <option value="en">Inglés (EN)</option>
                <option value="pt">Portugués (PT)</option>
              </select>

              <button type="submit" className="md:col-span-3 bg-gradient-to-r from-emerald-500 to-teal-400 text-neutral-950 font-black text-sm py-3.5 rounded-xl">
                Crear Usuario
              </button>
            </form>
          </div>

          <div className="bg-white/[0.02] border border-white/10 rounded-3xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-neutral-400 text-xs uppercase">
                <tr>
                  <th className="p-4">Usuario</th>
                  <th className="p-4">Rol</th>
                  <th className="p-4">Sucursal</th>
                  <th className="p-4">Idioma</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {usuarios.map(u => (
                  <tr key={u.id_usuario} className="hover:bg-white/[0.02]">
                    <td className="p-4">
                      <div className="font-bold text-white">{u.nombre}</div>
                      <div className="text-xs text-neutral-400">{u.email}</div>
                    </td>
                    <td className="p-4 text-emerald-400 font-semibold">{u.rol}</td>
                    <td className="p-4">{u.sucursal}</td>
                    <td className="p-4 uppercase">{u.idioma}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${u.activo ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"}`}>
                        {u.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="p-4">
                      <button onClick={() => cambiarestado(u.id_usuario, u.activo)} className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg">
                        {u.activo ? "Desactivar" : "Activar"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/[0.03] border border-white/10 p-6 rounded-3xl">
              <h3 className="text-base font-bold text-white mb-4">Catálogo de Módulos</h3>
              <form onSubmit={crearmodulo} className="flex gap-3 mb-4">
                <input type="text" placeholder="Ej. DIVISAS, INVENTARIO, VENTAS..." value={nuevomodulo} onChange={e => setnuevomodulo(e.target.value)} className="flex-1 bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white" required />
                <button type="submit" className="bg-emerald-500 text-neutral-950 font-bold px-5 rounded-xl text-sm">Agregar</button>
              </form>
              <div className="flex flex-wrap gap-2">
                {modulos.map(m => (
                  <span key={m.id_modulo} className="bg-white/5 border border-white/10 px-3 py-1 rounded-lg text-xs font-semibold">
                    {m.nombre}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white/[0.03] border border-white/10 p-6 rounded-3xl">
              <h3 className="text-base font-bold text-white mb-4">Asignar Módulos a Rol</h3>
              <select value={rolseleccionado} onChange={e => seleccionarrolpermisos(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white mb-4">
                <option value="">Selecciona un rol...</option>
                {roles.map(r => <option key={r.id_rol} value={r.id_rol}>{r.nombre}</option>)}
              </select>

              {rolseleccionado && (
                <>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {modulos.map(m => (
                      <label key={m.id_modulo} className="flex items-center gap-2 bg-black/30 p-2.5 rounded-lg border border-white/5 cursor-pointer text-xs">
                        <input
                          type="checkbox"
                          checked={modulosasignados.includes(m.id_modulo)}
                          onChange={() => togglemodulo(m.id_modulo)}
                        />
                        {m.nombre}
                      </label>
                    ))}
                  </div>
                  <button onClick={guardarpermisos} className="w-full bg-amber-500 text-neutral-950 font-bold py-2.5 rounded-xl text-sm">
                    Guardar Permisos del Rol
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Usuarios
