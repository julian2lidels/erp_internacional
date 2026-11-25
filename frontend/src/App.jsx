import { useState } from 'react';
import Navbar from './components/Navbar';
import InicioDashboard from './components/InicioDashboard';
import Monedas from './components/Monedas';
import TasasCambio from './components/TasasCambio';
import Sucursales from './components/Sucursales';
import Impuestos from './components/Impuestos';
import Roles from './components/Roles';
import Usuarios from './components/Usuarios';
import Auditoria from './components/Auditoria';

export default function App() {
  const [vistaActiva, setVistaActiva] = useState('inicio');
  const [rolActual, setRolActual] = useState(null);

  const esAdmin =
    rolActual?.nombre?.toLowerCase() === 'administrador' || rolActual?.id_rol === 1;

  return (
    <div className="min-h-screen flex flex-col justify-between text-slate-100">
      <div>
        <Navbar
          vistaActiva={vistaActiva}
          setVistaActiva={setVistaActiva}
          rolActual={rolActual}
          setRolActual={setRolActual}
        />

        <main className="max-w-7xl mx-auto px-6 py-8">
          {vistaActiva === 'inicio' && (
            <InicioDashboard
              setVistaActiva={setVistaActiva}
              esAdmin={esAdmin}
              rolActual={rolActual}
            />
          )}
          {vistaActiva === 'monedas' && <Monedas />}
          {vistaActiva === 'tasas' && <TasasCambio />}
          {vistaActiva === 'sucursales' && <Sucursales />}
          {vistaActiva === 'impuestos' && <Impuestos />}
          {vistaActiva === 'roles' && esAdmin && <Roles />}
          {vistaActiva === 'usuarios' && esAdmin && <Usuarios />}
          {vistaActiva === 'auditoria' && esAdmin && <Auditoria />}
        </main>
      </div>

      <footer className="border-t border-purple-500/15 bg-[#080412]/90 py-5 px-6 mt-12">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs text-purple-300/60">
          <span>ERP Internacional · Core Multimoneda & Multisucursal</span>
          <span>Desplegado en Red Hat OpenShift · Hollow Purple Edition</span>
        </div>
      </footer>
    </div>
  );
}
