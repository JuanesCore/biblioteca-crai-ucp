# Despliegue — Biblioteca CRAI UCP

Guía para desplegar el **frontend** en **AWS Amplify** y el **backend** en **AWS EC2**, con **MongoDB Atlas** y **Firebase** sin modificar la lógica de negocio de la aplicación.

---

## Prerrequisitos

- Cuenta **AWS** y **GitHub** (repositorio con este código).
- **MongoDB Atlas**: cluster listo y cadena `MONGODB_URI`.
- **Firebase**: proyecto con Authentication (Email + Google); dominios de autorización configurados para tu URL de Amplify y/o dominio propio.
- Archivo JSON de **cuenta de servicio** de Firebase para el backend (no subirlo al repo; usar solo en el servidor).

---

## 1. Git

El repositorio ya está inicializado si existe la carpeta `.git`.

```bash
git rev-parse --is-inside-work-tree
```

Archivos sensibles excluidos (`.gitignore`): `node_modules/`, `.env`, `build/`, `dist/`, `serviceAccountKey.json`, etc.

Antes del primer push, revisa que **no** estén versionados secretos:

```bash
git status
git check-ignore -v backend/serviceAccountKey.json
```

---

## 2. Frontend — AWS Amplify

### 2.1 Build local

```bash
npm ci
npm run build
```

El artefacto es la carpeta `build/`. La especificación de build está en `amplify.yml` (raíz del repo).

### 2.2 Variables de entorno en Amplify

En la consola Amplify: **App** → **Hosting** → **Environment variables**, añade (todas con prefijo `REACT_APP_`):

| Variable | Descripción |
|----------|-------------|
| `REACT_APP_FIREBASE_API_KEY` | Firebase Web SDK |
| `REACT_APP_FIREBASE_AUTH_DOMAIN` | |
| `REACT_APP_FIREBASE_PROJECT_ID` | |
| `REACT_APP_FIREBASE_STORAGE_BUCKET` | |
| `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` | |
| `REACT_APP_FIREBASE_APP_ID` | |
| `REACT_APP_FIREBASE_MEASUREMENT_ID` | Analytics (opcional) |
| `REACT_APP_API_URL` | URL **absoluta** del backend, **terminando en `/api`** (ej. `https://tu-ec2-o-dominio.com/api`) |

Plantilla de referencia: `.env.example` en la raíz del proyecto.

### 2.3 Conectar GitHub y desplegar

1. **Amplify** → **Create new app** → **Host web app**.
2. Conecta **GitHub**, elige el repositorio y la rama (p. ej. `main`).
3. Amplify detecta `amplify.yml` automáticamente (build en raíz, artefacto `build`).
4. Añade las variables de entorno anteriores **antes** o **después** del primer deploy; si cambias variables, **vuelve a desplegar** para que el bundle de React las incorpore.

### 2.4 SPA (React Router)

En `amplify.yml` hay una regla `customRules` que redirige rutas al `index.html`. Si tu app no enruta rutas profundas en el cliente, no necesitas más. Si Amplify no aplicara la regla, en la consola: **Rewrites and redirects** → añade algo equivalente a:

- **Source:** `/<*>`  
- **Target:** `/index.html`  
- **Type:** 404 → 200 (Rewrite)

### 2.5 Firebase — dominios autorizados

En **Firebase Console** → **Authentication** → **Settings** → **Authorized domains**, añade el dominio de Amplify (p. ej. `main.xxxxx.amplifyapp.com`) y tu dominio personalizado si lo usas.

### 2.6 Opción runtime para la API (sin rebuild)

En `public/index.html` se define `window.__REACT_APP_API_URL__`. Si necesitas cambiar solo la URL del API sin rebuild, puedes inyectar ese valor en el HTML servido (menos habitual que las variables `REACT_APP_*` en Amplify).

---

## 3. Backend — AWS EC2 (Ubuntu)

### 3.1 Crear la instancia

1. **EC2** → **Launch instance**.
2. **AMI:** Ubuntu Server 22.04 LTS (o 24.04).
3. **Tipo:** según carga (p. ej. `t3.small` para pruebas).
4. **Key pair:** créala o usa una existente (necesaria para SSH).
5. **Security group — reglas entrantes:**
   - **SSH (22)** — solo tu IP o bastión (no abras 22 al mundo `0.0.0.0/0` salvo prueba breve).
   - **HTTP (80)** y/o **HTTPS (443)** si usarás nginx/Certbot frente al Node.
   - **Custom TCP** puerto **5000** (o el `PORT` del `.env`) solo si expones Node **directamente** sin proxy (solo para pruebas; en producción usa 80/443 + proxy reverso).

6. **Almacenamiento:** el mínimo razonable (20 GB suele bastar).

### 3.2 Conectar por SSH

```bash
ssh -i /ruta/a/tu-clave.pem ubuntu@EC2_PUBLIC_DNS
```

### 3.3 Instalar Node.js 20 (NodeSource)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v   # debe ser v20.x
```

### 3.4 Instalar PM2 globalmente

```bash
sudo npm install -g pm2
```

### 3.5 Clonar el repositorio y backend

```bash
sudo apt-get update && sudo apt-get install -y git
mkdir -p ~/apps && cd ~/apps
git clone https://github.com/TU_USUARIO/TU_REPO.git
cd TU_REPO/backend
npm ci --omit=dev
```

### 3.6 Variables de entorno en el servidor

```bash
nano .env
```

Copia los valores desde `backend/.env.example` y completa:

- `PORT`
- `MONGODB_URI`
- `JWT_SECRET`
- `FIREBASE_SERVICE_ACCOUNT_PATH` (p. ej. `serviceAccountKey.json`) **o** las variables `FIREBASE_PROJECT_ID` / `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY`
- `CORS_ORIGIN` — URL **exacta** del frontend Amplify (incluye `https://`), varias separadas por coma si hay varios entornos

Sube el JSON de la cuenta de servicio **solo al servidor** (scp o editor), por ejemplo:

```bash
# Desde tu PC (ejemplo)
scp -i /ruta/clave.pem backend/serviceAccountKey.json ubuntu@EC2_IP:~/apps/TU_REPO/backend/serviceAccountKey.json
```

**No** hagas `git add` del JSON.

### 3.7 MongoDB Atlas

En Atlas → **Network Access**, permite la IP **saliente** de tu EC2 (o `0.0.0.0/0` solo si aceptas el riesgo; lo habitual es IP fija o VPC peering).

### 3.8 Arrancar con PM2

Desde `~/apps/TU_REPO/backend`:

```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

(Sigue las instrucciones que imprime `pm2 startup`.)

Comprueba salud:

```bash
curl -s http://127.0.0.1:5000/api/health
```

### 3.9 HTTPS y dominio (recomendado)

Expón **nginx** o **Caddy** en 443 con certificado (Let’s Encrypt), proxy a `http://127.0.0.1:5000`, y pon `TRUST_PROXY=1` en `.env` si el proxy envía `X-Forwarded-*`.

---

## 4. Encajar frontend y backend

1. La URL pública del API (con `/api`) debe coincidir con `REACT_APP_API_URL` en Amplify (rebuild tras cambiarla).
2. `CORS_ORIGIN` en el backend debe incluir el origen exacto del navegador del frontend (`https://....amplifyapp.com`), sin barra final.

---

## 5. Seguridad — checklist

- [ ] `serviceAccountKey.json` y `.env` **no** están en Git.
- [ ] `JWT_SECRET` largo y aleatorio en producción.
- [ ] MongoDB con usuario/contraseña fuertes y red restringida.
- [ ] Firebase reglas y dominios solo los necesarios.
- [ ] Puerto SSH y panel AWS restringidos donde sea posible.

---

## 6. Archivos añadidos o relevantes

| Archivo | Uso |
|---------|-----|
| `amplify.yml` | Build Amplify + regla SPA |
| `backend/ecosystem.config.js` | PM2 |
| `.env.example` | Plantilla frontend |
| `backend/.env.example` | Plantilla backend |

---

## 7. Cuenta Google (@ucp.edu.co)

La cuenta con la que inicias sesión en **AWS** o **GitHub** no cambia los pasos anteriores: solo usa esa identidad para iniciar sesión en la consola AWS y autorizar la aplicación de GitHub en Amplify cuando te lo pida el asistente.

Si necesitas dominio institucional o SSO, eso se configura aparte en Route 53, ACM y/o tu IdP; esta guía cubre el despliegue estándar EC2 + Amplify.
