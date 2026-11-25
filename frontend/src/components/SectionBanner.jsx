export default function SectionBanner({
  imagen,
  etiqueta,
  titulo,
  descripcion,
  badgeDerecha,
}) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-purple-500/35 bg-[#120A24] shadow-[0_0_40px_rgba(147,51,234,0.22)]">
      {/* Imagen temática de fondo */}
      <img
        src={imagen}
        alt={titulo}
        className="absolute inset-0 w-full h-full object-cover object-center opacity-85 pointer-events-none"
      />
      {/* Capa de degradado Hollow Purple para legibilidad total */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#07040F]/95 via-[#130829]/80 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#07040F] via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 p-7 md:p-9 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl space-y-2">
          <span className="inline-block text-[11px] font-bold uppercase tracking-[0.22em] text-fuchsia-400">
            {etiqueta}
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            {titulo}
          </h2>
          {descripcion && (
            <p className="text-sm text-purple-200/80 leading-relaxed">
              {descripcion}
            </p>
          )}
        </div>

        {badgeDerecha && (
          <span className="text-xs font-semibold px-3.5 py-1.5 rounded-full bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-400/35 backdrop-blur-md">
            {badgeDerecha}
          </span>
        )}
      </div>
    </section>
  );
}
