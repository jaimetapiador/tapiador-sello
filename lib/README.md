# @sello/core

Código compartido por la web (H3) y la función de sellado (H4). TypeScript sin paso de compilación: Node 26 lo
ejecuta directamente, y Vite y el empaquetado de las funciones lo consumen desde `src/`.

| Módulo | Qué hace | Dónde se usa |
|---|---|---|
| `hash.ts` | SHA-256 con Web Crypto (`sha256`, `hashFile` con límite de tamaño), `normalizeHash` para huellas pegadas | Navegador y Node |
| `network.ts` | Configuración de la red (`BASE_SEPOLIA`) y enlaces al explorador. Cambiar de red es tocar solo este fichero | Ambos |
| `registry.ts` | `readSeal` (lectura gratuita), `submitSeal` (comprueba, simula y envía), `waitForSeal` (confirma y lee el evento) | Lectura en el navegador; sellado solo en el servidor |
| `receipt.ts` | Recibo JSON: `buildReceipt`, `parseReceipt` (valida) y `verifyReceipt` (lo contrasta con la cadena) | Ambos |
| `abi.ts` | ABI del contrato. Generado: `npm run abi:sync` tras `forge build` | Ambos |

La librería nunca recibe la clave privada: `submitSeal` recibe un `WalletClient` ya creado por quien la custodia.
Los errores llevan un `code` estable (`already-sealed`, `file-too-large`, `invalid-receipt`…) para que la interfaz
muestre el texto traducido.

## Comandos (desde la raíz del repositorio)

```bash
npm run check                       # tipos + pruebas
npm test                            # pruebas (la de anvil necesita: cd contracts && forge build)
SELLO_TEST_RED=1 npm test           # además, lectura real en Base Sepolia
npm run comprobar -- <fichero | huella>
npm run comprobar -- --recibo recibo.json [fichero]
```
