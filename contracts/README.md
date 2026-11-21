# Contrato SelloRegistry

Registro público de huellas SHA-256. `seal(bytes32)` guarda la fecha, el bloque y la cuenta que sella; si la huella
ya existe, revierte con `AlreadySealed` y conserva el sello original. `sealOf(bytes32)` es una lectura gratuita.

Red: **Base Sepolia** (chain id 84532). Explorador: <https://base-sepolia.blockscout.com>.

## Despliegue actual

| Dato | Valor |
|---|---|
| Contrato | [`0xCeCc456e339047bbA466536DFF9247449D12A3D1`](https://base-sepolia.blockscout.com/address/0xCeCc456e339047bbA466536DFF9247449D12A3D1) |
| Transacción de despliegue | [`0xb066…766a`](https://base-sepolia.blockscout.com/tx/0xb066ba6f20cd88dc87d7dba8b5b21da27783abe716c00a1babdee6684bb2766a) · bloque 61489984 · 21/11/2026 |
| Verificación | [Blockscout: código fuente verificado](https://base-sepolia.blockscout.com/address/0xCeCc456e339047bbA466536DFF9247449D12A3D1?tab=contract) · [Sourcify: coincidencia exacta](https://repo.sourcify.dev/84532/0xCeCc456e339047bbA466536DFF9247449D12A3D1) (creación y código desplegado) |
| Cuenta de la demo | `0x29B6Cf9d90728d7694b3a3DdDba3da38314A7E83` |
| Primer sello | `fixtures/prueba-h1.txt` → [transacción](https://base-sepolia.blockscout.com/tx/0x1f9df40804909467d454af426d4fcbd15b1626559b0ee5d2f663fba7c5cfef2e) · bloque 61490258 |

Costes medidos (21/11/2026, en ETH de prueba): despliegue 0,0000014; cada sello 46.232 de gas y unos 0,00000033.
Con 0,3 ETH de prueba hay para cientos de miles de sellos al precio actual.

## Requisitos

- Foundry (`forge`, `cast`) en el `PATH`: `export PATH="$PATH:$HOME/.foundry/bin"`.
- `.env.local` en la raíz del repositorio, a partir de `.env.example`, con la cuenta de la demo y fondos de prueba.
- Fondos: muchos grifos dan ETH de **Ethereum Sepolia**, no de Base Sepolia. Se pasan con el puente oficial de Base
  (`L1StandardBridge` en Sepolia: `0xfd0Bf71F60660E2f608ed56e1659C450eB113120`, según docs.base.org) y llegan en
  unos minutos:

  ```bash
  cast send 0xfd0Bf71F60660E2f608ed56e1659C450eB113120 "depositETH(uint32,bytes)" 200000 0x \
    --value 0.1ether --private-key "$SELLO_PRIVATE_KEY" --rpc-url https://ethereum-sepolia-rpc.publicnode.com
  ```

## Desarrollo

```bash
cd contracts
forge build
forge test -vv
forge fmt
```

## Despliegue y verificación

```bash
cd contracts
set -a; . ../.env.local; set +a
forge script script/Deploy.s.sol --rpc-url base_sepolia --broadcast \
  --verify --verifier blockscout --verifier-url https://base-sepolia.blockscout.com/api/
```

Después, copiar la dirección del contrato a `SELLO_REGISTRY_ADDRESS` en `.env.local`. El registro del despliegue
queda en `broadcast/` (se versiona: es parte de la trazabilidad).

## Sellar y comprobar a mano

```bash
./scripts/sellar.sh ruta/al/fichero      # calcula la huella y la sella con la cuenta de la demo
./scripts/comprobar.sh ruta/al/fichero   # lectura: fecha, bloque y cuenta, o «no consta»
```

Comprobación independiente, sin estos scripts: `sha256sum fichero` y buscar la huella en la pestaña
«Read contract» → `sealOf` del contrato en el explorador.
