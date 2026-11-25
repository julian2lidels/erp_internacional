import { useEffect, useMemo, useState } from 'react';
import Navbar from './components/Navbar';
import InicioDashboard from './components/InicioDashboard';
import CrudPage from './components/CrudPage';
import Usuarios from './components/Usuarios';
import Login from './components/Login';
import { ENTIDADES, GRUPOS } from './config/entidades';
import { getLista, guardarSesion, leerSesion } from './api';

export default function App() {
  const [sesion, setSesion] = useState(() => leerSesion());
  const [vistaActiva, setVistaActiva] = useState('inicio');
  const [rolActual, setRolActual] = useState(null);

  // Nombre del rol de quien inició sesión
  useEffect(() => {
    if (!sesion) return setRolActual(null);
    getLista('/api/erp/roles').then((roles) => setRolActual(roles.find((r) => r.id_rol === sesion.id_rol) || null));
  }, [sesion]);

  const esAdmin = rolActual?.nombre === 'Administrador';
  const soloLectura = rolActual?.nombre === 'Auditor';

  // Cada rol solo ve los módulos que tiene asignados (tabla rol_modulo)
  const grupos = useMemo(() => {
    const permitidos = sesion?.modulos_permitidos || [];
    return GRUPOS.filter((g) => esAdmin || (!g.admin && permitidos.includes(g.modulo)));
  }, [sesion, esAdmin]);

  const vistasPermitidas = useMemo(() => new Set(grupos.flatMap((g) => g.items)), [grupos]);

  const salir = () => {
    guardarSesion(null);
    setSesion(null);
    setVistaActiva('inicio');
  };

  if (!sesion) return <Login onLogin={setSesion} />;

  const vista = vistaActiva === 'inicio' || vistasPermitidas.has(vistaActiva) ? vistaActiva : 'inicio';

  return (
    <div className="min-h-screen flex flex-col justify-between text-slate-100">
      <div>
        <Navbar
          vistaActiva={vista}
          setVistaActiva={setVistaActiva}
          sesion={sesion}
          rolActual={rolActual}
          grupos={grupos}
          onLogout={salir}
        />

        <main className="max-w-7xl mx-auto px-6 py-8">
          {vista === 'inicio' && (
            <InicioDashboard setVistaActiva={setVistaActiva} grupos={grupos} sesion={sesion} rolActual={rolActual} />
          )}
          {vista === 'usuarios' && <Usuarios soloLectura={soloLectura} />}
          {ENTIDADES[vista] && <CrudPage key={vista} clave={vista} soloLectura={soloLectura} />}
        </main>
      </div>

      <footer className="border-t border-purple-500/15 bg-[#080412]/90 py-5 px-6 mt-12">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs text-purple-300/60">
          <span>ERP Internacional: multimoneda y multisucursal</span>
          <span>Desplegado en Red Hat OpenShift</span>
        </div>
      </footer>
    </div>
  );
}
