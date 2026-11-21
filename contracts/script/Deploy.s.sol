// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {Script, console} from "forge-std/Script.sol";
import {SelloRegistry} from "../src/SelloRegistry.sol";

/// @notice Despliega SelloRegistry con la cuenta de la demo (SELLO_PRIVATE_KEY en .env.local).
contract Deploy is Script {
    function run() external returns (SelloRegistry registry) {
        uint256 key = vm.envUint("SELLO_PRIVATE_KEY");
        vm.startBroadcast(key);
        registry = new SelloRegistry();
        vm.stopBroadcast();
        console.log("SelloRegistry desplegado en", address(registry));
    }
}
