// SD-8510 CPU / VC-2 Computer System
// Copyright (C) 2025 Appledog Hu
//
// SPDX-License-Identifier: GPL-2.0-only WITH SD-8510-runtime-exception
// See LICENSE file for details.
//

// VC-2 "Virtual Computer Model 2
// (C) 2025 Neo Hu
//
// main.js
// program loader
//

// Example test program
console.log("=== 8-bit CPU Simulator ===\n");

// Initialize CPU
cpu_init();

//Load and run test program
load_and_assemble('asm/sdsystem64.sda', function () {
    // Run the CPU

    cpu_start();
});

// Start video mode before starting CPU
VB = 0;       // was $FF
VP = 61440;     // $F000 -- same

vm0_init_bank(VB);
vm0_init_video('fsc');
vm0_start_video();


