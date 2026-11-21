# Carga .env.local de la raíz del repositorio y comprueba lo imprescindible.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="${SELLO_ENV_FILE:-$ROOT/.env.local}"   # SELLO_ENV_FILE permite probar contra anvil
[ -f "$ENV_FILE" ] || { echo "Falta $ENV_FILE (ver .env.example)" >&2; exit 1; }
set -a; . "$ENV_FILE"; set +a
export PATH="$PATH:$HOME/.foundry/bin"
: "${BASE_SEPOLIA_RPC_URL:?Falta BASE_SEPOLIA_RPC_URL}"
: "${SELLO_REGISTRY_ADDRESS:?Falta SELLO_REGISTRY_ADDRESS (despliega antes el contrato)}"
EXPLORER="${SELLO_EXPLORER:-https://base-sepolia.blockscout.com}"

# Huella SHA-256 del fichero con prefijo 0x.
huella() { [ -f "$1" ] || { echo "No existe el fichero: $1" >&2; exit 1; }; echo "0x$(sha256sum "$1" | cut -d' ' -f1)"; }
