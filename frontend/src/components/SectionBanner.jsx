// Cabecera de cada sección: imagen temática a un lado y título grande tipo cartelera.
export default function SectionBanner({ imagen, etiqueta, titulo, descripcion, badgeDerecha }) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-purple-400/25 bg-[#0d0720] min-h-[260px] flex">
      <img
        src={imagen}
        alt=""
        aria-hidden="true"
        className="absolute inset-y-0 right-0 h-full w-full md:w-3/5 object-cover pointer-events-none"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0d0720] via-[#0d0720]/85 to-transparent md:via-[#0d0720]/60" />

      <div className="relative z-10 p-8 md:p-12 flex flex-col justify-end gap-3 max-w-xl">
        <span className="text-sm font-medium text-fuchsia-300">{etiqueta}</span>
        <h2 className="font-display text-4xl md:text-5xl font-bold text-white leading-[1.05]">{titulo}</h2>
        {descripcion && <p className="text-sm md:text-base text-purple-100/75 leading-relaxed">{descripcion}</p>}
        {badgeDerecha && (
          <span className="self-start text-xs font-semibold px-3.5 py-1.5 rounded-full bg-fuchsia-500/15 text-fuchsia-200 border border-fuchsia-400/35">
            {badgeDerecha}
          </span>
        )}
      </div>
    </section>
  );
}
