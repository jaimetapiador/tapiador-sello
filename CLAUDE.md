# sello.tapiador.eu: Sello documental

Demostrador de integridad documental: se calcula la huella SHA-256 de un fichero en el navegador, se registra en
una cadena de bloques pública de prueba y cualquiera puede comprobarla después. Plan completo y decisiones en
`~/proyectos/tapiador-web/docs/SELLO.md` (léelo antes de proponer cambios de alcance).

## Decisiones cerradas (20/11/2026)

- Alojamiento: Firebase (Hosting, Authentication, Firestore, Cloud Functions en el plan Blaze). Región en la UE.
- Red: **Base Sepolia** (chain id 84532). Explorador principal: Blockscout (`https://base-sepolia.blockscout.com`).
- Registro: contrato `SelloRegistry` (`contracts/`), desplegado en `0xCeCc456e339047bbA466536DFF9247449D12A3D1`. El primer sello de cada huella prevalece.
  Cuenta de la demo: `0x29B6Cf9d90728d7694b3a3DdDba3da38314A7E83` (clave en `.env.local`).
- Sellar exige cuenta con correo verificado; comprobar es público y no pasa por el servidor.
- El fichero nunca sale del navegador: solo viaja la huella. No se guarda el fichero ni su nombre.
- Repositorio público en GitHub.

## Estructura

```
contracts/   proyecto Foundry: SelloRegistry.sol, pruebas y script de despliegue
lib/         @sello/core: huella, red, lectura, sellado y recibo (TypeScript sin compilar, viem)
web/         interfaz estática ES (/) y EN (/en/): Vite + React + TypeScript + Tailwind; textos en web/src/messages
functions/   Cloud Functions (europe-west1): seal, mySeals, deleteMyData; se empaquetan con esbuild
```

## Comandos

- Contratos (desde `contracts/`): `forge build` · `forge test -vv` · `forge fmt`.
- Despliegue del contrato: ver `contracts/README.md`. Requiere `.env.local` en la raíz.
- Raíz (Node de `.nvmrc`): `npm run check` (tipos + pruebas) · `npm run comprobar -- <fichero|huella>` ·
  `npm run abi:sync` tras cambiar el contrato. Detalle en `lib/README.md`.
- Web: `npm run dev` (contra producción) o `VITE_EMULATORS=1 npm run dev` con `npm run emulators` en otra terminal.
  Los emuladores leen `functions/.secret.local` y `functions/.env.local` (no versionados).
- Firebase: proyecto `sello-tapiador`, Firestore `(default)` en eur3, funciones en europe-west1. La clave de la
  cuenta de la demo está en Secret Manager (`SELLO_PRIVATE_KEY`); los parámetros no secretos, en `functions/.env`.
- Hosting: `firebase.json` define CSP, HSTS y COOP. Si la página empieza a usar otro origen (RPC, API…),
  hay que añadirlo a `connect-src` o se bloqueará. Probar con `firebase emulators:start --only hosting`.
- SEO: metaetiquetas, canonical, hreflang y JSON-LD están en los HTML de `web/` (uno por página); `robots.txt` y
  `sitemap.xml` en `web/public/`. Página nueva = HTML nuevo + entrada en `vite.config.ts` + sitemap.
  La imagen para compartir se regenera según `web/og/README.md`.
- Privacidad: `web/src/messages/privacy.ts` es un BORRADOR con PENDIENTE; Jaime debe revisarlo antes de publicar.
- Si se cambia un documento de `web/src/samples/`, hay que volver a sellarlo con `contracts/scripts/sellar.sh`.
- Versiones de dependencias fijadas y con al menos dos semanas de antigüedad (firma transacciones).

## Reglas de trabajo

- Español de España en textos, comentarios de cara al usuario y commits; identificadores de código en inglés.
- Secretos solo en `.env.local` (local) o en Secret Manager (Firebase). Nunca en el repositorio ni en la salida
  de los comandos: no imprimas la clave privada.
- No despliegues en Firebase, no hagas push y no toques DNS ni Cloudflare sin confirmación expresa.
  Desplegar el contrato en la red de prueba y hacer sellos de prueba sí está autorizado dentro del H1.
- No inventes textos, cifras ni nombres: usa `PENDIENTE`.
- Accesibilidad WCAG 2.1 AA y `prefers-reduced-motion`, como tapiador.eu.
- Cada dependencia nueva debe resolver algo concreto.
