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
web/         (H3) interfaz estática: Vite + React + TypeScript + Tailwind
functions/   (H4) Cloud Functions: sellado con viem
```

## Comandos

- Contratos (desde `contracts/`): `forge build` · `forge test -vv` · `forge fmt`.
- Despliegue del contrato: ver `contracts/README.md`. Requiere `.env.local` en la raíz.
- Raíz (Node de `.nvmrc`): `npm run check` (tipos + pruebas) · `npm run comprobar -- <fichero|huella>` ·
  `npm run abi:sync` tras cambiar el contrato. Detalle en `lib/README.md`.
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
