// Fondo de galaxia hecho solo con CSS: degradado negro → morado, nebulosas y estrellas.
export default function Galaxia({ className = '' }) {
  return (
    <div className={`galaxia ${className}`} aria-hidden="true">
      <div className="galaxia-estrellas galaxia-estrellas-1" />
      <div className="galaxia-estrellas galaxia-estrellas-2" />
      <div className="galaxia-estrellas galaxia-estrellas-3" />
    </div>
  );
}
