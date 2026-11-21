#!/usr/bin/env bash
# Sella la huella SHA-256 de un fichero con la cuenta de la demo. Uso: ./sellar.sh fichero
. "$(dirname "$0")/_env.sh"
: "${SELLO_PRIVATE_KEY:?Falta SELLO_PRIVATE_KEY}"
[ $# -eq 1 ] || { echo "Uso: $0 fichero" >&2; exit 1; }
H="$(huella "$1")"
echo "Huella: $H"

TS="$(cast call "$SELLO_REGISTRY_ADDRESS" "sealOf(bytes32)(uint48,uint48,address)" "$H" --rpc-url "$BASE_SEPOLIA_RPC_URL" | head -1 | cut -d' ' -f1)"
if [ "$TS" != "0" ]; then
  echo "Ya estaba sellada el $(date -u -d "@$TS" '+%Y-%m-%d %H:%M:%S UTC'). No se envía nada."
  exit 0
fi

OUT="$(cast send "$SELLO_REGISTRY_ADDRESS" "seal(bytes32)" "$H" \
  --private-key "$SELLO_PRIVATE_KEY" --rpc-url "$BASE_SEPOLIA_RPC_URL" --json)"
TX="$(node -e 'const r=JSON.parse(process.argv[1]);console.log(r.transactionHash)' "$OUT")"
node -e '
const r=JSON.parse(process.argv[1]);
const gas=BigInt(r.gasUsed), price=BigInt(r.effectiveGasPrice), l1=BigInt(r.l1Fee??0);
const wei=gas*price+l1;
console.log("Estado:", r.status==="0x1"?"confirmada":"fallida");
console.log("Bloque:", BigInt(r.blockNumber).toString());
console.log("Gas usado:", gas.toString(), "· coste total:", (Number(wei)/1e18).toFixed(12), "ETH de prueba");
' "$OUT"
echo "Transacción: $EXPLORER/tx/$TX"
