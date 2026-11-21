#!/usr/bin/env bash
# Comprueba si la huella de un fichero está sellada. Solo lectura. Uso: ./comprobar.sh fichero
. "$(dirname "$0")/_env.sh"
[ $# -eq 1 ] || { echo "Uso: $0 fichero" >&2; exit 1; }
H="$(huella "$1")"
echo "Huella: $H"
mapfile -t R < <(cast call "$SELLO_REGISTRY_ADDRESS" "sealOf(bytes32)(uint48,uint48,address)" "$H" --rpc-url "$BASE_SEPOLIA_RPC_URL")
TS="${R[0]%% *}"; BLK="${R[1]%% *}"; WHO="${R[2]}"
if [ "$TS" = "0" ]; then
  echo "No consta: este fichero no se ha sellado (o se ha modificado)."
  exit 2
fi
echo "Sellado el $(date -u -d "@$TS" '+%Y-%m-%d %H:%M:%S UTC') en el bloque $BLK por $WHO"
echo "Bloque: $EXPLORER/block/$BLK"
