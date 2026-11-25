import { useState } from 'react';
import { enviar, guardarSesion } from '../api';

const CUENTAS = [
  ['Administrador', 'admin@erp.com', 'admin123'],
  ['Operador', 'operador@erp.com', 'oper123'],
  ['Auditor', 'auditor@erp.com', 'audit123'],
];

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const entrar = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      const datos = await enviar('POST', '/api/seguridad/login', { email, password });
      guardarSesion(datos);
      onLogin(datos);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const campo =
    'w-full bg-[#1B1036] border border-purple-400/35 rounded-xl px-4 py-3 text-sm text-white placeholder-purple-300/40 focus:outline-none focus:border-fuchsia-400';

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="relative hidden lg:block overflow-hidden">
        <img src="/img/gojo.png" alt="Gojo liberando una esfera de energía morada" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#07040F]" />
        <div className="absolute bottom-12 left-12 right-24">
          <p className="font-display text-5xl font-bold text-white leading-tight">Finanzas globales, sin límites</p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6">
        <form onSubmit={entrar} className="w-full max-w-md space-y-6">
          <div className="space-y-2">
            <h1 className="font-display text-4xl font-bold text-white">ERP Internacional</h1>
            <p className="text-purple-100/75">Inicia sesión para entrar al sistema.</p>
          </div>

          <label className="block space-y-1.5">
            <span className="text-sm text-purple-200/80">Correo</span>
            <input className={campo} type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm text-purple-200/80">Contraseña</span>
            <input className={campo} type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>

          {error && <p role="alert" className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{error}</p>}

          <button disabled={cargando} className="w-full py-3 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:brightness-110 disabled:opacity-60 shadow-[0_0_30px_rgba(192,132,252,0.4)] transition">
            {cargando ? 'Entrando…' : 'Entrar'}
          </button>

          <details className="rounded-2xl border border-purple-400/20 px-4 py-3 text-sm text-purple-100/80">
            <summary className="cursor-pointer text-purple-200">Cuentas de prueba</summary>
            <ul className="mt-3 space-y-2">
              {CUENTAS.map(([rol, correo, clave]) => (
                <li key={correo}>
                  <button type="button" onClick={() => { setEmail(correo); setPassword(clave); }} className="text-left hover:text-white">
                    <span className="font-semibold text-fuchsia-300">{rol}:</span> {correo} / {clave}
                  </button>
                </li>
              ))}
            </ul>
          </details>
        </form>
      </div>
    </div>
  );
}
