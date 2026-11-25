// Carga una lista desde la API. Si el servidor responde con error o con algo que
// no es una lista, devuelve [] para que la pantalla no se ponga en blanco.
export async function getLista(url) {
  try {
    const res = await fetch(url)
    if (!res.ok) {
      console.error("Error de la API:", url, res.status)
      return []
    }
    const data = await res.json()
    if (!Array.isArray(data)) {
      console.error("Respuesta inesperada (no es una lista):", url, data)
      return []
    }
    return data
  } catch (e) {
    console.error("No se pudo conectar con la API:", url, e)
    return []
  }
}
