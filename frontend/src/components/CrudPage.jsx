import { useEffect, useMemo, useRef, useState } from 'react';
import SectionBanner from './SectionBanner';
import { ENTIDADES, GRUPOS, REFS_EXTRA, endpointDe } from '../config/entidades';
import { enviar, getLista } from '../api';

const input =
  'w-full bg-[#1B1036] border border-purple-400/35 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-purple-300/40 focus:outline-none focus:border-fuchsia-400 disabled:opacity-50';

function infoRef(clave) {
  if (REFS_EXTRA[clave]) return REFS_EXTRA[clave];
  const e = ENTIDADES[clave];
  return { endpoint: endpointDe(clave), valor: e.pk[0], etiqueta: e.etiqueta || ((r) => String(r[e.pk[0]])) };
}

function valorInicial(campos) {
  const v = {};
  campos.forEach((c) => {
    v[c.k] = c.def !== undefined ? c.def : c.tipo === 'bool' ? false : '';
  });
  return v;
}

export default function CrudPage({ clave, soloLectura }) {
  const ent = ENTIDADES[clave];
  const endpoint = endpointDe(clave);
  const grupo = GRUPOS.find((g) => g.id === ent.grupo);
  const camposForm = useMemo(() => ent.campos.filter((c) => !c.auto && !c.calc), [ent]);
  const soloVer = soloLectura || ent.soloLista;

  const [filas, setFilas] = useState([]);
  const [refs, setRefs] = useState({});
  const [form, setForm] = useState(() => valorInicial(camposForm));
  const [editando, setEditando] = useState(null);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [filtro, setFiltro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const formRef = useRef(null);

  const cargar = () => getLista(endpoint).then(setFilas);

  useEffect(() => {
    cargar();
    const claves = [...new Set(ent.campos.filter((c) => c.tipo === 'ref').map((c) => c.ref))];
    Promise.all(claves.map((k) => getLista(infoRef(k).endpoint))).then((listas) => {
      const mapa = {};
      claves.forEach((k, i) => (mapa[k] = listas[i]));
      setRefs(mapa);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave]);

  const etiquetaRef = (campo, valor) => {
    if (valor === null || valor === undefined || valor === '') return '—';
    const { valor: vk, etiqueta } = infoRef(campo.ref);
    const fila = (refs[campo.ref] || []).find((r) => String(r[vk]) === String(valor));
    return fila ? etiqueta(fila) : String(valor);
  };

  const celda = (campo, fila) => {
    const v = fila[campo.k];
    if (v === null || v === undefined || v === '') return '—';
    if (campo.tipo === 'ref') return etiquetaRef(campo, v);
    if (campo.tipo === 'bool') return v ? 'Sí' : 'No';
    if (campo.tipo === 'numero' && campo.step === '1') return String(v);
    if (campo.tipo === 'numero') return Number(v).toLocaleString('es-CO', { maximumFractionDigits: 6 });
    return String(v);
  };

  const visibles = useMemo(() => {
    const q = filtro.trim().toLowerCase();
    if (!q) return filas;
    return filas.filter((f) => ent.campos.some((c) => celda(c, f).toLowerCase().includes(q)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filas, filtro, refs]);

  const deshabilitado = (c) =>
    !!editando && (c.soloCrear || (ent.editables && !ent.editables.includes(c.k)));

  const cambiar = (c, valor) => setForm((f) => ({ ...f, [c.k]: c.mayus && typeof valor === 'string' ? valor.toUpperCase() : valor }));

  const limpiar = () => {
    setForm(valorInicial(camposForm));
    setEditando(null);
  };

  const query = (fila) => new URLSearchParams(Object.fromEntries(ent.pk.map((k) => [k, fila[k]]))).toString();

  const guardar = async (e) => {
    e.preventDefault();
    setError('');
    setOk('');
    const payload = {};
    camposForm.forEach((c) => {
      if (editando && deshabilitado(c)) return;
      const v = form[c.k];
      if (c.tipo === 'bool') payload[c.k] = !!v;
      else if (v === '' || v === null) payload[c.k] = null;
      else if (c.tipo === 'numero') payload[c.k] = Number(v);
      else if (c.tipo === 'ref' && /^\d+$/.test(String(v)) && infoRef(c.ref).valor.startsWith('id_')) payload[c.k] = Number(v);
      else payload[c.k] = v;
    });
    setEnviando(true);
    try {
      const r = editando
        ? await enviar('PUT', `${endpoint}?${query(editando)}`, payload)
        : await enviar('POST', endpoint, payload);
      setOk(r.message || 'Guardado');
      limpiar();
      cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  const editar = (fila) => {
    setError('');
    setOk('');
    const v = valorInicial(camposForm);
    camposForm.forEach((c) => {
      if (fila[c.k] !== null && fila[c.k] !== undefined) v[c.k] = fila[c.k];
    });
    setForm(v);
    setEditando(fila);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const borrar = async (fila) => {
    if (!window.confirm('¿Eliminar este registro?')) return;
    setError('');
    setOk('');
    try {
      const r = await enviar('DELETE', `${endpoint}?${query(fila)}`);
      setOk(r.message || 'Eliminado');
      if (editando) limpiar();
      cargar();
    } catch (err) {
      setError(err.message);
    }
  };

  const columnas = ent.campos.filter((c) => !c.auto || c.tipo === 'ref');
  const puedeEditar = !soloVer && !ent.sinEditar;
  const puedeBorrar = !soloVer && !ent.sinBorrar;

  return (
    <div className="space-y-6">
      <SectionBanner
        imagen={ent.imagen}
        etiqueta={grupo?.titulo}
        titulo={ent.titulo}
        descripcion={ent.descripcion}
        badgeDerecha={`${filas.length} registro${filas.length === 1 ? '' : 's'}`}
      />

      {soloLectura && !ent.soloLista && (
        <p className="rounded-2xl border border-sky-300/30 bg-sky-400/10 px-4 py-3 text-sm text-sky-100">
          Tu rol es de solo lectura: puedes consultar la información, pero no modificarla.
        </p>
      )}

      <div aria-live="polite" className="space-y-2">
        {error && (
          <p role="alert" className="rounded-2xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </p>
        )}
        {ok && (
          <p className="rounded-2xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">{ok}</p>
        )}
      </div>

      {!soloVer && (
        <form
          ref={formRef}
          onSubmit={guardar}
          className="rounded-3xl border border-purple-400/25 bg-[#0f0824]/90 p-6 space-y-5"
        >
          <h3 className="font-display text-2xl text-white">{editando ? 'Editar registro' : 'Nuevo registro'}</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {camposForm.map((c) => (
              <label key={c.k} className={`block space-y-1.5 ${c.tipo === 'bool' ? 'self-end' : ''}`}>
                {c.tipo === 'bool' ? (
                  <span className="flex items-center gap-2.5 py-2.5 text-sm text-purple-100">
                    <input
                      type="checkbox"
                      checked={!!form[c.k]}
                      disabled={deshabilitado(c)}
                      onChange={(e) => cambiar(c, e.target.checked)}
                      className="h-4 w-4 accent-fuchsia-500"
                    />
                    {c.label}
                  </span>
                ) : (
                  <>
                    <span className="text-sm text-purple-200/80">
                      {c.label}
                      {c.req && <span className="text-fuchsia-300"> *</span>}
                    </span>
                    {c.tipo === 'select' ? (
                      <select className={input} value={form[c.k]} disabled={deshabilitado(c)} required={c.req} onChange={(e) => cambiar(c, e.target.value)}>
                        <option value="">Selecciona…</option>
                        {c.opciones.map((o) => (
                          <option key={o} value={o}>{o.replaceAll('_', ' ')}</option>
                        ))}
                      </select>
                    ) : c.tipo === 'ref' ? (
                      <select className={input} value={form[c.k]} disabled={deshabilitado(c)} required={c.req} onChange={(e) => cambiar(c, e.target.value)}>
                        <option value="">Selecciona…</option>
                        {(refs[c.ref] || []).map((r) => {
                          const { valor, etiqueta } = infoRef(c.ref);
                          return (
                            <option key={r[valor]} value={r[valor]}>{etiqueta(r)}</option>
                          );
                        })}
                      </select>
                    ) : (
                      <input
                        className={input}
                        type={c.tipo === 'numero' ? 'number' : c.tipo === 'fecha' ? 'date' : 'text'}
                        step={c.step}
                        maxLength={c.max}
                        required={c.req}
                        disabled={deshabilitado(c)}
                        value={form[c.k]}
                        onChange={(e) => cambiar(c, e.target.value)}
                      />
                    )}
                  </>
                )}
              </label>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={enviando}
              className="px-6 py-2.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:brightness-110 disabled:opacity-60 transition"
            >
              {enviando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Crear registro'}
            </button>
            {editando && (
              <button type="button" onClick={limpiar} className="px-6 py-2.5 rounded-full text-sm font-semibold text-purple-100 border border-purple-300/40 hover:text-white transition">
                Cancelar
              </button>
            )}
          </div>
        </form>
      )}

      <section className="rounded-3xl border border-purple-400/25 bg-[#0f0824]/90 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 p-5 border-b border-purple-400/15">
          <h3 className="font-display text-2xl text-white">Registros</h3>
          <input
            className={`${input} max-w-xs`}
            placeholder="Buscar…"
            aria-label="Buscar en la tabla"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#1C1038] text-purple-200">
              <tr>
                {columnas.map((c) => (
                  <th key={c.k} className="px-5 py-3.5 font-semibold whitespace-nowrap">{c.label}</th>
                ))}
                {(puedeEditar || puedeBorrar) && <th className="px-5 py-3.5" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-400/10">
              {visibles.map((f) => (
                <tr key={ent.pk.map((k) => f[k]).join('-')} className="hover:bg-purple-900/20">
                  {columnas.map((c) => (
                    <td key={c.k} className="px-5 py-3 text-purple-50 max-w-xs truncate" title={celda(c, f)}>
                      {celda(c, f)}
                    </td>
                  ))}
                  {(puedeEditar || puedeBorrar) && (
                    <td className="px-5 py-3 whitespace-nowrap text-right space-x-2">
                      {puedeEditar && (
                        <button onClick={() => editar(f)} className="text-fuchsia-300 hover:text-white px-3 py-1 rounded-full border border-fuchsia-400/30">Editar</button>
                      )}
                      {puedeBorrar && (
                        <button onClick={() => borrar(f)} className="text-rose-300 hover:text-white px-3 py-1 rounded-full border border-rose-400/30">Eliminar</button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {visibles.length === 0 && (
                <tr>
                  <td colSpan={columnas.length + 1} className="px-5 py-10 text-center text-purple-200/60">
                    {filas.length === 0 ? 'Aún no hay registros. Crea el primero con el formulario.' : 'Ningún registro coincide con la búsqueda.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
