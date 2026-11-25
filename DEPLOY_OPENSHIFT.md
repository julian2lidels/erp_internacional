# Despliegue en Red Hat OpenShift

Repo monorepo: `backend/` (FastAPI), `frontend/` (React + Nginx) y `database/init.sql`.
Se despliegan 3 componentes, **en este orden**: MySQL → backend → frontend.

## 1. MySQL
Consola web → perspectiva **Developer** → **+Add → Database → MySQL (Ephemeral o Persistent)**.
Usa estos datos (o los tuyos, pero anótalos):

- MySQL Connection Username: `erpuser`
- MySQL Connection Password: *(elige una nueva, no la del .env)*
- MySQL Database Name: `erp_internacional`
- Nombre del Service: `mysql`

Las 24 tablas y los datos de ejemplo **se crean solos** cuando arranca el backend
(lee `backend/schema/init.sql`). No hay que cargar nada a mano. Si MySQL tiene un esquema
viejo, el backend lo detecta y lo recrea.

Cuentas de prueba: `admin@erp.com / admin123`, `operador@erp.com / oper123`,
`auditor@erp.com / audit123`.

## 2. Backend (FastAPI)
**+Add → Import from Git**
- Git Repo URL: `https://github.com/julian2lidels/proyecto-erp-internacional.git`
- Show advanced Git options → **Context dir**: `/backend`
- Import Strategy: **Dockerfile**
- Name: **`backend`**  (el frontend lo busca con este nombre)
- Target port: `8080`
- **Desmarca** "Create a route" (solo lo usa el frontend, es interno)
- Deployment → Environment variables:
  - `DB_HOST=mysql`
  - `DB_PORT=3306`
  - `DB_USER=erpuser`
  - `DB_PASS=<tu contraseña>`  (mejor desde un Secret)
  - `DB_NAME=erp_internacional`

Verifica en **Pods → Logs** que diga `Uvicorn running on http://0.0.0.0:8080` y luego `Base de datos creada con datos iniciales`.

## 3. Frontend (React + Nginx)
**+Add → Import from Git**
- Mismo repo, **Context dir**: `/frontend`
- Import Strategy: **Dockerfile**
- Name: `frontend`
- Target port: `8080`
- **Marca** "Create a route" (esta es la URL pública)
- Si tu Service del backend tiene otro nombre, agrega la variable
  `API_UPSTREAM_HOST=NOMBRE_DEL_SERVICE` (y `API_UPSTREAM_PORT` si no es 8080).
  No uses `BACKEND_PORT`: OpenShift la define sola con otro valor y rompe nginx

## 4. Abrir la página
En **Topology**, pulsa el ícono ↗ del círculo `frontend`, o en **Networking → Routes** copia la columna *Location*.
Prueba el backend desde ahí: `https://TU-ROUTE/api/health` debe responder `{"status":"ok",...}`.

## Desarrollo local
```bash
# backend
cd backend && cp .env.example .env && pip install -r requirements.txt
uvicorn main:app --reload --port 8000
# frontend (el proxy de vite.config.js manda /api a :8000)
cd frontend && npm install && npm run dev
```

## Problemas comunes
- **Build del frontend falla**: revisa Builds → Logs. Necesita Node ≥ 20.19 (el Dockerfile usa Node 22).
- **Pantalla blanca/404 al refrescar una ruta**: ya está resuelto en `nginx.conf.template` (fallback a index.html).
- **502 Bad Gateway en /api**: el backend no está corriendo o su Service no se llama `backend`.
- **Error de conexión a MySQL**: revisa `DB_HOST` y que cargaste `init.sql`.
- **Límite de descargas de Docker Hub**: si falla bajar `python`, `node` o `nginx`, reemplázalos por imágenes de `registry.access.redhat.com` o `quay.io`.
- **Nunca subas `.env`, `node_modules` ni `__pycache__` a GitHub.**
