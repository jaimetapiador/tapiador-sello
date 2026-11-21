// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {Test} from "forge-std/Test.sol";
import {SelloRegistry} from "../src/SelloRegistry.sol";

contract SelloRegistryTest is Test {
    SelloRegistry internal registry;

    /// @dev Se calcula en setUp: sha256 es una llamada a un precompilado y consumiría vm.prank.
    bytes32 internal HASH;
    address internal constant ALICE = address(0xA11CE);
    address internal constant BOB = address(0xB0B);

    function setUp() public {
        registry = new SelloRegistry();
        HASH = sha256("Acta de prueba");
        vm.warp(1_790_000_000);
        vm.roll(1_000);
    }

    function test_SealStoresTimestampBlockAndSealer() public {
        vm.prank(ALICE);
        registry.seal(HASH);

        (uint48 timestamp, uint48 blockNumber, address sealer) = registry.sealOf(HASH);
        assertEq(timestamp, 1_790_000_000);
        assertEq(blockNumber, 1_000);
        assertEq(sealer, ALICE);
    }

    function test_SealEmitsEvent() public {
        vm.expectEmit(true, true, false, true, address(registry));
        emit SelloRegistry.Sealed(HASH, ALICE, 1_790_000_000);
        vm.prank(ALICE);
        registry.seal(HASH);
    }

    function test_UnknownHashReturnsZeros() public view {
        (uint48 timestamp, uint48 blockNumber, address sealer) = registry.sealOf(HASH);
        assertEq(timestamp, 0);
        assertEq(blockNumber, 0);
        assertEq(sealer, address(0));
    }

    function test_FirstSealPrevails() public {
        vm.prank(ALICE);
        registry.seal(HASH);

        vm.warp(1_790_000_100);
        vm.prank(BOB);
        vm.expectRevert(
            abi.encodeWithSelector(SelloRegistry.AlreadySealed.selector, HASH, 1_790_000_000)
        );
        registry.seal(HASH);

        (,, address sealer) = registry.sealOf(HASH);
        assertEq(sealer, ALICE);
    }

    function test_RevertsOnEmptyHash() public {
        vm.expectRevert(SelloRegistry.EmptyHash.selector);
        registry.seal(bytes32(0));
    }

    function testFuzz_AnyNonZeroHashCanBeSealedOnce(bytes32 hash, address who) public {
        vm.assume(hash != bytes32(0));
        vm.prank(who);
        registry.seal(hash);
        (uint48 timestamp,, address sealer) = registry.sealOf(hash);
        assertEq(timestamp, block.timestamp);
        assertEq(sealer, who);

        vm.expectRevert();
        registry.seal(hash);
    }
}
