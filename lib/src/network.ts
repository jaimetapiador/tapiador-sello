import { defineChain, type Address, type Chain, type Hex } from "viem";

/**
 * Base Sepolia con lo mínimo. La definición de viem/chains incluye los formatos y serializadores
 * propios de OP Stack (transacciones de depósito, comisiones de L1), que aquí no se usan y pesan
 * mucho en el navegador. Para leer, y para enviar transacciones EIP-1559 normales, basta con esto.
 */
const baseSepolia = defineChain({
  id: 84_532,
  name: "Base Sepolia",
  nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: ["https://sepolia.base.org"] } },
  blockExplorers: { default: { name: "Blockscout", url: "https://base-sepolia.blockscout.com" } },
  testnet: true,
});

/**
 * Todo lo que depende de la red vive aquí: cambiar de red (o añadir otra) es configuración.
 * El recibo guarda el `id` de la red, así que un sello siempre se comprueba en la red donde se hizo.
 */
export interface SelloNetwork {
  /** Identificador estable que se guarda en los recibos. */
  readonly id: string;
  readonly name: string;
  readonly chain: Chain;
  /** Dirección del contrato SelloRegistry. */
  readonly registry: Address;
  /** Bloque en que se desplegó el registro (para buscar eventos sin recorrer toda la cadena). */
  readonly deployBlock: bigint;
  /** Explorador de bloques, sin barra final. */
  readonly explorer: string;
  /** RPC público por defecto. Tiene límite de peticiones: el servidor puede usar otro. */
  readonly rpcUrl: string;
  /** Cuenta con la que sella sello.tapiador.eu: permite distinguir sus sellos de los de terceros. */
  readonly demoSealer: Address;
}

export const BASE_SEPOLIA: SelloNetwork = {
  id: "base-sepolia",
  name: "Base Sepolia",
  chain: baseSepolia,
  registry: "0xCeCc456e339047bbA466536DFF9247449D12A3D1",
  deployBlock: 61_489_984n,
  explorer: "https://base-sepolia.blockscout.com",
  rpcUrl: "https://sepolia.base.org",
  demoSealer: "0x29B6Cf9d90728d7694b3a3DdDba3da38314A7E83",
};

/** Red por defecto del demostrador. */
export const DEFAULT_NETWORK = BASE_SEPOLIA;

const NETWORKS: Readonly<Record<string, SelloNetwork>> = {
  [BASE_SEPOLIA.id]: BASE_SEPOLIA,
};

export class UnknownNetworkError extends Error {
  readonly code = "unknown-network";

  constructor(id: string) {
    super(`Red desconocida: «${id}».`);
    this.name = "UnknownNetworkError";
  }
}

export function getNetwork(id: string): SelloNetwork {
  const network = NETWORKS[id];
  if (!network) throw new UnknownNetworkError(id);
  return network;
}

/** Enlaces al explorador de bloques de la red. */
export const explorerUrl = {
  transaction: (network: SelloNetwork, hash: Hex) => `${network.explorer}/tx/${hash}`,
  address: (network: SelloNetwork, address: Address) => `${network.explorer}/address/${address}`,
  block: (network: SelloNetwork, block: bigint) => `${network.explorer}/block/${block}`,
  /** Pestaña del contrato, donde cualquiera puede consultar `sealOf` sin esta web. */
  registry: (network: SelloNetwork) =>
    `${network.explorer}/address/${network.registry}?tab=read_write_contract`,
};
