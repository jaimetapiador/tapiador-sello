# Sello documental · sello.tapiador.eu

Demo de integridad documental. Calcula en tu navegador la huella SHA-256 de un documento, la registra con
fecha en una cadena de bloques pública de prueba (Base Sepolia) y permite que cualquiera compruebe después que su
copia es exactamente la que se selló. El documento nunca sale de tu equipo: solo viaja la huella.

> Estado: en desarrollo. Red de prueba sin valor económico ni garantía de permanencia. No es un sello electrónico
> ni un sello de tiempo cualificado en el sentido de eIDAS.

## Piezas

| Carpeta | Qué contiene | Estado |
|---|---|---|
| `contracts/` | Contrato `SelloRegistry` (Solidity, Foundry), pruebas y scripts | Desplegado en Base Sepolia: [`0xCeCc456e339047bbA466536DFF9247449D12A3D1`](https://base-sepolia.blockscout.com/address/0xCeCc456e339047bbA466536DFF9247449D12A3D1) |
| `lib/` | Librería compartida: huella, red, lectura, sellado y recibo (TypeScript, viem) | Hecha, con pruebas |
| `web/` | Interfaz ES/EN (Vite + React + TypeScript + Tailwind) para Firebase Hosting | Hecha y probada en local; sin publicar |
| `functions/` | Cloud Functions `seal`, `mySeals` y `deleteMyData` (europe-west1) | Desplegadas |

## Comprobar un sello sin esta web

Con este repositorio: `npm install` y `npm run comprobar -- documento.pdf`.

Sin nada de este repositorio:


1. Calcula la huella: `sha256sum documento.pdf`.
2. En el explorador de Base Sepolia, abre el contrato [`SelloRegistry`](https://base-sepolia.blockscout.com/address/0xCeCc456e339047bbA466536DFF9247449D12A3D1), pestaña de lectura,
   y consulta `sealOf` con `0x` seguido de la huella.
3. Si devuelve una fecha distinta de cero, el documento está sellado desde esa fecha y no ha cambiado.

## Licencia

[MIT](LICENSE).
