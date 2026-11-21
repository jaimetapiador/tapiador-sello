// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

/// @title SelloRegistry
/// @notice Registro público de huellas SHA-256 de documentos. Cada huella se sella una sola vez:
///         el primer sello prevalece y no se puede sobrescribir ni borrar.
/// @dev Demostrador de sello.tapiador.eu. Cualquiera puede sellar; cada registro guarda la cuenta
///      que lo hizo, así que los sellos de la demo se distinguen por su cuenta.
contract SelloRegistry {
    /// @dev Cabe en una sola posición de almacenamiento (48 + 48 + 160 bits).
    struct Seal {
        uint48 timestamp;
        uint48 blockNumber;
        address sealer;
    }

    mapping(bytes32 hash => Seal) private _seals;

    /// @notice Se emite al sellar una huella nueva.
    event Sealed(bytes32 indexed hash, address indexed sealer, uint256 timestamp);

    /// @notice La huella ya estaba sellada; se devuelve la fecha del sello original.
    error AlreadySealed(bytes32 hash, uint256 timestamp);

    /// @notice La huella cero no es una huella válida.
    error EmptyHash();

    /// @notice Sella una huella con la fecha y el bloque actuales.
    function seal(bytes32 hash) external {
        if (hash == bytes32(0)) revert EmptyHash();
        Seal storage existing = _seals[hash];
        if (existing.timestamp != 0) revert AlreadySealed(hash, existing.timestamp);

        // uint48 basta hasta dentro de millones de años tanto para la fecha como para el bloque.
        _seals[hash] = Seal({
            // forge-lint: disable-next-line(unsafe-typecast)
            timestamp: uint48(block.timestamp),
            // forge-lint: disable-next-line(unsafe-typecast)
            blockNumber: uint48(block.number),
            sealer: msg.sender
        });
        emit Sealed(hash, msg.sender, block.timestamp);
    }

    /// @notice Devuelve el sello de una huella. Si no está sellada, todo vale cero.
    function sealOf(bytes32 hash)
        external
        view
        returns (uint48 timestamp, uint48 blockNumber, address sealer)
    {
        Seal storage s = _seals[hash];
        return (s.timestamp, s.blockNumber, s.sealer);
    }
}
