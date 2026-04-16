// SD-8510 CPU / VC-2 Computer System
// Copyright (C) 2025 Appledog Hu
//
// SPDX-License-Identifier: GPL-2.0-only WITH SD-8510-runtime-exception
// See LICENSE file for details.
//

// Stellar Dynamics SD-8510
// (C) 2025 Neo Hu
// Authors: Neo, Appledog
//

// CPU State - Global variables
let memory = Array.from({ length: 256 }, () => new Uint8Array(65536));
let IP = 0;  // Instruction pointer
let run_cpu = false;

// CPU REGISTERS (8-bit)
let REGISTER_A = 0;
let REGISTER_B = 0;
let REGISTER_X = 0;
let REGISTER_Y = 0;
let REGISTER_I = 0;
let REGISTER_J = 0;
let REGISTER_K = 0;
let REGISTER_T = 0;

// SHADOW or "DREAM" CPU REGISTERS (8-bit) for context switching
let DREGISTER_A = 0;
let DREGISTER_B = 0;
let DREGISTER_X = 0;
let DREGISTER_Y = 0;
let DREGISTER_I = 0;
let DREGISTER_J = 0;
let DREGISTER_K = 0;
let DREGISTER_T = 0;

// FLAGS Register
let FLAGS_REG = 0;
let DFLAGS_REG = 0;
let CARRY_FLAG = false;
let ZERO_FLAG = false;
let NEGATIVE_FLAG = false;
let OVERFLOW_FLAG = false;

// 16-bit pointer registers
let MP = 0;  // Memory Pointer
let DP = 0;  // Data Pointer
let EP = 0;  // Extra Pointer
let SP = 0;  // Stack Pointer
let VP = 0;  // Video Pointer
let IOP = 0; // IO Pointer

// Bank registers
let MB = 0;  // Memory Bank
let DB = 0;  // Data Bank
let CB = 0;  // Code Bank
let SB = 0;  // Stack Bank
let EB = 0;  // Extra Bank
let VB = 0;  // Video Bank
let IOB = 0; // IO Bank

// Shadow banks and pointers.
let DMP = 0;  // Memory Pointer
let DDP = 0;  // Data Pointer
let DEP = 0;  // Extra Pointer
let DSP = 0;  // Stack Pointer
let DVP = 0;  // Video Pointer
let DIOP = 0; // IO Pointer
let DMB = 0;  // Memory Bank
let DDB = 0;  // Data Bank
let DCB = 0;  // Code Bank
let DSB = 0;  // Stack Bank
let DEB = 0;  // Extra Bank
let DVB = 0;  // Video Bank
let DIOB = 0; // IO Bank


// using VAR because it's duplicated in assembler.js
var REG8_NAMES = ['A', 'B', 'X', 'Y', 'I', 'J', 'K', 'T', 'S', 'F'];
var REG16_NAMES = ['AB', 'XY', 'IJ', 'KT', 'MP', 'DP', 'EP', 'SP', 'CP', 'VP', 'IOP'];

/**
 * cpu_init
 * Initialize/reset the CPU to power-on state
 */
function cpu_init() {
    console.log("Initializing CPU...");

    // Initialize memory (64KB) // Zero bank 0 (or whichever bank you're initializing)
    // ram is not guaranteed to be zeroed on early computers.
    // memory[0].fill(0);

    // Reset registers
    REGISTER_A = 0;
    REGISTER_B = 0;
    REGISTER_X = 0;
    REGISTER_Y = 0;
    REGISTER_I = 0;
    REGISTER_J = 0;
    REGISTER_K = 0;
    REGISTER_T = 0;

    // Reset flags
    FLAGS_REG = 0;
    CARRY_FLAG = false;
    ZERO_FLAG = false;
    NEGATIVE_FLAG = false;
    OVERFLOW_FLAG = false;

    // Reset pointers
    MP = 0;
    DP = 0;
    EP = 0;
    SP = 0xFFFE;  // Stack grows downward from top
    VP = 0;
    IOP = 0;
    IP = 0;

    // Reset banks
    MB = 0;
    DB = 0;
    CB = 0;
    SB = 0;
    EB = 0;
    VB = 0;
    IOB = 0;

    // CPU starts halted
    run_cpu = false;

    console.log("CPU initialized: 64KB RAM, all registers zeroed");
}

/**
 * cpu_ljmp
 * Long jump - set code bank and instruction pointer, start execution
 */
function cpu_ljmp(bank, addr) {
    CB = bank & 0xFF;
    IP = addr & 0xFFFF;
    run_cpu = true;
    console.log(`CPU LJMP to bank ${bank}, address $${addr.toString(16).padStart(4, '0')}`);
}

/**
 * cpu_halt
 * Stop CPU execution
 */
function cpu_halt() {
    HALTED = true;
    console.log("=== CPU HALTED ===");
}

/**
 * cpu_dump_registers
 * Print current register state
 */
function cpu_dump_registers() {
    console.log("\n=== CPU Register Dump ===");
    console.log(`A=${REGISTER_A.toString(16).padStart(2,'0')} B=${REGISTER_B.toString(16).padStart(2,'0')} X=${REGISTER_X.toString(16).padStart(2,'0')} Y=${REGISTER_Y.toString(16).padStart(2,'0')}`);
    console.log(`I=${REGISTER_I.toString(16).padStart(2,'0')} J=${REGISTER_J.toString(16).padStart(2,'0')} K=${REGISTER_K.toString(16).padStart(2,'0')} T=${REGISTER_T.toString(16).padStart(2,'0')}`);
    console.log(`AB=${((REGISTER_B << 8) | REGISTER_A).toString(16).padStart(4,'0')} XY=${((REGISTER_Y << 8) | REGISTER_X).toString(16).padStart(4,'0')} IJ=${((REGISTER_J << 8) | REGISTER_I).toString(16).padStart(4,'0')} KT=${((REGISTER_T << 8) | REGISTER_K).toString(16).padStart(4,'0')}`);
    console.log(`IP=$${IP.toString(16).padStart(4,'0')} Flags: C=${CARRY_FLAG?1:0} Z=${ZERO_FLAG?1:0} N=${NEGATIVE_FLAG?1:0} V=${OVERFLOW_FLAG?1:0}`);
    console.log(`MP=$${MP.toString(16).padStart(4,'0')} DP=$${DP.toString(16).padStart(4,'0')} EP=$${EP.toString(16).padStart(4,'0')} SP=$${SP.toString(16).padStart(4,'0')} IP=$${IP.toString(16).padStart(4,'0')} VP=$${VP.toString(16).padStart(4,'0')} IOP=$${IOP.toString(16).padStart(4,'0')}`);
    console.log(`MB=$${MB.toString(16).padStart(4,'0')} DB=$${DB.toString(16).padStart(4,'0')} EB=$${EB.toString(16).padStart(4,'0')} SB=$${SP.toString(16).padStart(4,'0')} CB=$${CB.toString(16).padStart(4,'0')} VB=$${VB.toString(16).padStart(4,'0')} IOB=$${IOB.toString(16).padStart(4,'0')}`);

}

function cpu_dump_ram(bank, addr, rows=16) {
    for (let row = 0; row < rows; row++) {
        let offset = addr + (row * 16);
        let hex_str = `${bank.toString(16).padStart(2,'0').toUpperCase()}:${offset.toString(16).padStart(4, '0').toUpperCase()}: `;
        let ascii_str = '';

        // Print 16 bytes in hex
        for (let col = 0; col < 16; col++) {
            let byte_addr = offset + col;
            if (byte_addr > 0xFFFF) break;

            let byte = memory[bank][byte_addr];
            hex_str += byte.toString(16).padStart(2, '0').toUpperCase() + ' ';

            // ASCII interpretation (printable chars 32-126)
            if (byte >= 32 && byte <= 126) {
                ascii_str += String.fromCharCode(byte);
            } else {
                ascii_str += '.';
            }
        }

        console.log(`${hex_str} | ${ascii_str}`);
    }
}


function get_register_8bit(reg_num) {
    switch(reg_num) {
        case 0: return REGISTER_A;
        case 1: return REGISTER_B;
        case 2: return REGISTER_X;
        case 3: return REGISTER_Y;
        case 4: return REGISTER_I;
        case 5: return REGISTER_J;
        case 6: return REGISTER_K;
        case 7: return REGISTER_T;
        case 8: return SP & 0xFF;        // S (low byte)
        case 9: return FLAGS_REG;
        default: return 0;
    }
}

function get_dregister_8bit(reg_num) {
    switch(reg_num) {
        case 0: return DREGISTER_A;
        case 1: return DREGISTER_B;
        case 2: return DREGISTER_X;
        case 3: return DREGISTER_Y;
        case 4: return DREGISTER_I;
        case 5: return DREGISTER_J;
        case 6: return DREGISTER_K;
        case 7: return DREGISTER_T;
        case 8: return DSP & 0xFF;        // S (low byte)
        case 9: return DFLAGS_REG;
        default: return 0;
    }
}

function set_register_8bit(reg_num, value) {
    value = value & 0xFF;
    switch(reg_num) {
        case 0: REGISTER_A = value; break;
        case 1: REGISTER_B = value; break;
        case 2: REGISTER_X = value; break;
        case 3: REGISTER_Y = value; break;
        case 4: REGISTER_I = value; break;
        case 5: REGISTER_J = value; break;
        case 6: REGISTER_K = value; break;
        case 7: REGISTER_T = value; break;
        case 8: SP = (SP & 0xFF00) | value; break;  // S (set low byte)
        case 9: FLAGS_REG = value; break;
    }
}

function set_dregister_8bit(reg_num, value) {
    value = value & 0xFF;
    switch(reg_num) {
        case 0: DREGISTER_A = value; break;
        case 1: DREGISTER_B = value; break;
        case 2: DREGISTER_X = value; break;
        case 3: DREGISTER_Y = value; break;
        case 4: DREGISTER_I = value; break;
        case 5: DREGISTER_J = value; break;
        case 6: DREGISTER_K = value; break;
        case 7: DREGISTER_T = value; break;
        case 8: DSP = (DSP & 0xFF00) | value; break;  // S (set low byte)
        case 9: DFLAGS_REG = value; break;
    }
}

function get_register_16bit(reg_num) {
    switch(reg_num) {
        case 0: return (REGISTER_B << 8) | REGISTER_A;  // AB
        case 1: return (REGISTER_Y << 8) | REGISTER_X;  // XY
        case 2: return (REGISTER_J << 8) | REGISTER_I;  // IJ
        case 3: return (REGISTER_T << 8) | REGISTER_K;  // KT
        case 4: return MP;
        case 5: return DP;
        case 6: return EP;
        case 7: return SP;
        case 8: return IP;  // CP
        case 9: return VP;
        case 10: return IOP;
        default: return 0;
    }
}

function get_dregister_16bit(reg_num) {
    switch(reg_num) {
        case 0: return (DREGISTER_B << 8) | DREGISTER_A;  // AB
        case 1: return (DREGISTER_Y << 8) | DREGISTER_X;  // XY
        case 2: return (DREGISTER_J << 8) | DREGISTER_I;  // IJ
        case 3: return (DREGISTER_T << 8) | DREGISTER_K;  // KT
        case 4: return DMP;
        case 5: return DDP;
        case 6: return DEP;
        case 7: return DSP;
        case 8: return DIP;  // CP
        case 9: return DVP;
        case 10: return DIOP;
        default: return 0;
    }
}

function set_register_16bit(reg_num, value) {
    value = value & 0xFFFF;
    switch(reg_num) {
        case 0:  // AB - A is LOW byte, B is HIGH byte
            REGISTER_A = value & 0xFF;           // A = low byte (bits 0-7)
            REGISTER_B = (value >> 8) & 0xFF;    // B = high byte (bits 8-15)
            break;
        case 1:  // XY - X is LOW byte, Y is HIGH byte
            REGISTER_X = value & 0xFF;           // X = low byte
            REGISTER_Y = (value >> 8) & 0xFF;    // Y = high byte
            break;
        case 2:  // IJ - I is LOW byte, J is HIGH byte
            REGISTER_I = value & 0xFF;           // I = low byte
            REGISTER_J = (value >> 8) & 0xFF;    // J = high byte
            break;
        case 3:  // KT - K is HIGH byte, T is LOW byte (EXCEPTION)
            REGISTER_K = value & 0xFF;           // T = low byte
            REGISTER_T = (value >> 8) & 0xFF;    // K = high byte
            break;
        case 4: MP = value; break;
        case 5: DP = value; break;
        case 6: EP = value; break;
        case 7: SP = value; break;
        case 8: IP = value; break;  // CP
        case 9: VP = value; break;
        case 10: IOP = value; break;
    }
}

function set_dregister_16bit(reg_num, value) {
    value = value & 0xFFFF;
    switch(reg_num) {
        case 0:  // AB - A is LOW byte, B is HIGH byte
            DREGISTER_A = value & 0xFF;           // A = low byte (bits 0-7)
            DREGISTER_B = (value >> 8) & 0xFF;    // B = high byte (bits 8-15)
            break;
        case 1:  // XY - X is LOW byte, Y is HIGH byte
            DREGISTER_X = value & 0xFF;           // X = low byte
            DREGISTER_Y = (value >> 8) & 0xFF;    // Y = high byte
            break;
        case 2:  // IJ - I is LOW byte, J is HIGH byte
            DREGISTER_I = value & 0xFF;           // I = low byte
            DREGISTER_J = (value >> 8) & 0xFF;    // J = high byte
            break;
        case 3:  // KT - K is HIGH byte, T is LOW byte (EXCEPTION)
            DREGISTER_K = value & 0xFF;           // T = low byte
            DREGISTER_T = (value >> 8) & 0xFF;    // K = high byte
            break;
        case 4: DMP = value; break;
        case 5: DDP = value; break;
        case 6: DEP = value; break;
        case 7: DSP = value; break;
        case 8: DIP = value; break;  // CP
        case 9: DVP = value; break;
        case 10: DIOP = value; break;
    }
}

function set_flags_from_result(result) {
    ZERO_FLAG = (result & 0xFF) === 0;
    CARRY_FLAG = result > 255 || result < 0;
    NEGATIVE_FLAG = (result & 0x80) !== 0;
}

function set_flags_from_result_16bit(result) {
    ZERO_FLAG = (result & 0xFFFF) === 0;
    CARRY_FLAG = result > 65535 || result < 0;
    NEGATIVE_FLAG = (result & 0x8000) !== 0;
}

function fetch_byte() {
    let byte = memory[CB][IP];
    IP = (IP + 1) & 0xFFFF;
    return byte;
}

function fetch_byte_signed() {
    let byte = memory[CB][IP];
    IP = (IP + 1) & 0xFFFF;
    return byte > 127 ? byte - 256 : byte;  // Convert to signed
}

function fetch_word() {
    let low = fetch_byte();
    let high = fetch_byte();
    return (high << 8) | low;
}

function push_word(value) {
    // Push high byte first
    SP = (SP - 1) & 0xFFFF;
    memory[SB][SP] = (value >> 8) & 0xFF;
    // Then push low byte
    SP = (SP - 1) & 0xFFFF;
    memory[SB][SP] = value & 0xFF;
}

function pop_word() {
    // Pop low byte first (it's on top)
    let low = memory[SB][SP];
    SP = (SP + 1) & 0xFFFF;
    // Then pop high byte
    let high = memory[SB][SP];
    SP = (SP + 1) & 0xFFFF;
    return (high << 8) | low;
}

function push_byte(value) {
    // push low byte
    SP = (SP - 1) & 0xFFFF;
    memory[SB][SP] = value & 0xFF;
}

function pop_byte() {
    // Pop low byte first (it's on top)
    let b = memory[SB][SP] & 0xFF;
    SP = (SP + 1) & 0xFFFF;
    return b;
}


/**
 * execute_instruction
 * Fetch, decode, and execute one instruction
 */
function cpu_step() {
    let opcode = fetch_byte();

    let debug = 0;
    //console.log(` *** pre: A=${REGISTER_A} B=${REGISTER_B} X=${REGISTER_X} Y=${REGISTER_Y} MB=${MB}, DB=${DB}, CB=${CB}`);
    //cpu_dump_ram(255,0xF0F0, 1);

    switch(opcode) {
        // LD instructions - all variants (opcodes 0-29)
        case OP.LDA_IMM: case OP.LDB_IMM: case OP.LDX_IMM: case OP.LDY_IMM:
        case OP.LDI_IMM: case OP.LDJ_IMM: case OP.LDK_IMM: case OP.LDT_IMM:
        case OP.LDS_IMM: case OP.LDF_IMM: {
            let reg = Math.floor((opcode - OP.LDA_IMM) / 3);  // Determine which register (0-9)
            let value = fetch_byte();
            set_register_8bit(reg, value);
            ZERO_FLAG = value === 0;
            NEGATIVE_FLAG = (value & 0x80) !== 0;
            debug && console.log(`  LD${REG8_NAMES[reg]} #${value}`);
            break;
        }

        case OP.LDA_ZP: case OP.LDB_ZP: case OP.LDX_ZP: case OP.LDY_ZP:
        case OP.LDI_ZP: case OP.LDJ_ZP: case OP.LDK_ZP: case OP.LDT_ZP:
        case OP.LDS_ZP: case OP.LDF_ZP: {
            let reg = Math.floor((opcode - OP.LDA_IMM) / 3);
            let addr = fetch_byte();
            let value = memory[MB][addr];
            set_register_8bit(reg, value);
            ZERO_FLAG = value === 0;
            NEGATIVE_FLAG = (value & 0x80) !== 0;
            debug && console.log(`  LD${REG8_NAMES[reg]} [$${addr.toString(16).padStart(2,'0')}] (value=$${value.toString(16).padStart(2,'0')})`);
            break;
        }

        case OP.LDA_ABS: case OP.LDB_ABS: case OP.LDX_ABS: case OP.LDY_ABS:
        case OP.LDI_ABS: case OP.LDJ_ABS: case OP.LDK_ABS: case OP.LDT_ABS:
        case OP.LDS_ABS: case OP.LDF_ABS: {
            let reg = Math.floor((opcode - OP.LDA_IMM) / 3);
            let addr = fetch_word();
            let value = memory[MB][addr];
            set_register_8bit(reg, value);
            ZERO_FLAG = value === 0;
            NEGATIVE_FLAG = (value & 0x80) !== 0;
            debug && console.log(`  LD${REG8_NAMES[reg]} [$${addr.toString(16).padStart(4,'0')}] (value=$${value.toString(16).padStart(2,'0')})`);
            break;
        }

        case OP.LDA_IND_REG: {
            let ptr_reg = fetch_byte();
            let addr = get_register_16bit(ptr_reg);
            REGISTER_A = memory[MB][addr];
            ZERO_FLAG = REGISTER_A === 0;
            NEGATIVE_FLAG = (REGISTER_A & 0x80) !== 0;
            debug && console.log(`  LDA [${REG16_NAMES[ptr_reg]}] (addr=$${addr.toString(16).padStart(4,'0')}, value=$${REGISTER_A.toString(16).padStart(2,'0')})`);
            break;
        }
        case OP.LDB_IND_REG: {
            let ptr_reg = fetch_byte();
            let addr = get_register_16bit(ptr_reg);
            REGISTER_B = memory[MB][addr];
            ZERO_FLAG = REGISTER_B === 0;
            NEGATIVE_FLAG = (REGISTER_B & 0x80) !== 0;
            debug && console.log(`  LDB [${REG16_NAMES[ptr_reg]}] (addr=$${addr.toString(16).padStart(4,'0')}, value=$${REGISTER_B.toString(16).padStart(2,'0')})`);
            break;
        }
        case OP.LDX_IND_REG: {
            let ptr_reg = fetch_byte();
            let addr = get_register_16bit(ptr_reg);
            REGISTER_X = memory[MB][addr];
            ZERO_FLAG = REGISTER_X === 0;
            NEGATIVE_FLAG = (REGISTER_X & 0x80) !== 0;
            debug && console.log(`  LDX [${REG16_NAMES[ptr_reg]}] (addr=$${addr.toString(16).padStart(4,'0')}, value=$${REGISTER_X.toString(16).padStart(2,'0')})`);
            break;
        }
        case OP.LDY_IND_REG: {
            let ptr_reg = fetch_byte();
            let addr = get_register_16bit(ptr_reg);
            REGISTER_Y = memory[MB][addr];
            ZERO_FLAG = REGISTER_Y === 0;
            NEGATIVE_FLAG = (REGISTER_Y & 0x80) !== 0;
            debug && console.log(`  LDY [${REG16_NAMES[ptr_reg]}] (addr=$${addr.toString(16).padStart(4,'0')}, value=$${REGISTER_Y.toString(16).padStart(2,'0')})`);
            break;
        }
        case OP.STA_IND_REG: {
            let ptr_reg = fetch_byte();
            let addr = get_register_16bit(ptr_reg);
            memory[MB][addr] = REGISTER_A;
            debug && console.log(`  STA [${REG16_NAMES[ptr_reg]}] (addr=$${addr.toString(16).padStart(4,'0')}, value=$${REGISTER_A.toString(16).padStart(2,'0')})`);
            break;
        }
        case OP.STB_IND_REG: {
            let ptr_reg = fetch_byte();
            let addr = get_register_16bit(ptr_reg);
            memory[MB][addr] = REGISTER_B;
            debug && console.log(`  STA [${REG16_NAMES[ptr_reg]}] (addr=$${addr.toString(16).padStart(4,'0')}, value=$${REGISTER_B.toString(16).padStart(2,'0')})`);
            break;
        }
        case OP.STX_IND_REG: {
            let ptr_reg = fetch_byte();
            let addr = get_register_16bit(ptr_reg);
            memory[MB][addr] = REGISTER_X;
            debug && console.log(`  STA [${REG16_NAMES[ptr_reg]}] (addr=$${addr.toString(16).padStart(4,'0')}, value=$${REGISTER_X.toString(16).padStart(2,'0')})`);
            break;
        }
        case OP.STY_IND_REG: {
            let ptr_reg = fetch_byte();
            let addr = get_register_16bit(ptr_reg);
            memory[MB][addr] = REGISTER_Y;
            debug && console.log(`  STA [${REG16_NAMES[ptr_reg]}] (addr=$${addr.toString(16).padStart(4,'0')}, value=$${REGISTER_Y.toString(16).padStart(2,'0')})`);
            break;
        }

        // ST instructions (opcodes 30-49)
        case OP.STA_ZP: case OP.STB_ZP: case OP.STX_ZP: case OP.STY_ZP:
        case OP.STI_ZP: case OP.STJ_ZP: case OP.STK_ZP: case OP.STT_ZP:
        case OP.STS_ZP: case OP.STF_ZP: {
            let reg = Math.floor((opcode - OP.STA_ZP) / 2);
            let addr = fetch_byte();
            let value = get_register_8bit(reg);
            memory[MB][addr] = value & 0xFF;
            ZERO_FLAG = value === 0;
            NEGATIVE_FLAG = (value & 0x80) !== 0;
            debug && console.log(`  ST${REG8_NAMES[reg]} [$${addr.toString(16).padStart(2,'0')}] (value=$${value.toString(16).padStart(2,'0')})`);
            break;
        }

        case OP.STA_ABS: case OP.STB_ABS: case OP.STX_ABS: case OP.STY_ABS:
        case OP.STI_ABS: case OP.STJ_ABS: case OP.STK_ABS: case OP.STT_ABS:
        case OP.STS_ABS: case OP.STF_ABS: {
            let reg = Math.floor((opcode - OP.STA_ZP) / 2);
            let addr = fetch_word();
            let value = get_register_8bit(reg);
            memory[MB][addr] = value & 0xFF;
            ZERO_FLAG = value === 0;
            NEGATIVE_FLAG = (value & 0x80) !== 0;
            debug && console.log(`  ST${REG8_NAMES[reg]} [$${addr.toString(16).padStart(4,'0')}] (value=$${value.toString(16).padStart(2,'0')})`);
            break;
        }

        // Implicit 8-bit logic (99-102)
        case OP.AND: {
            let result = REGISTER_A & REGISTER_B;
            REGISTER_A = result & 0xFF;
            ZERO_FLAG = result === 0;
            NEGATIVE_FLAG = (result & 0x80) !== 0;
            debug && console.log(`  AND: A=${REGISTER_A.toString(16).padStart(2,'0')}`);
            break;
        }

        case OP.OR: {
            let result = REGISTER_A | REGISTER_B;
            REGISTER_A = result & 0xFF;
            ZERO_FLAG = result === 0;
            NEGATIVE_FLAG = (result & 0x80) !== 0;
            debug && console.log(`  OR: A=${REGISTER_A.toString(16).padStart(2,'0')}`);
            break;
        }

        case OP.XOR: {
            let result = REGISTER_A ^ REGISTER_B;
            REGISTER_A = result & 0xFF;
            ZERO_FLAG = result === 0;
            NEGATIVE_FLAG = (result & 0x80) !== 0;
            debug && console.log(`  XOR: A=${REGISTER_A.toString(16).padStart(2,'0')}`);
            break;
        }

        case OP.NOT: {
            let result = ~REGISTER_A;
            REGISTER_A = result & 0xFF;
            ZERO_FLAG = result === 0;
            NEGATIVE_FLAG = (result & 0x80) !== 0;
            debug && console.log(`  NOT: A=${REGISTER_A.toString(16).padStart(2,'0')}`);
            break;
        }

        // Explicit 8-bit logic (103-109)
        case OP.AND_REG_IMM: {
            let reg = fetch_byte();
            let value = fetch_byte();
            let result = get_register_8bit(reg) & value;
            set_register_8bit(reg, result);
            ZERO_FLAG = result === 0;
            NEGATIVE_FLAG = (result & 0x80) !== 0;
            debug && console.log(`  AND reg${reg}, $${value.toString(16).padStart(2,'0')}`);
            break;
        }

        case OP.AND_REG_REG: {
            let dest = fetch_byte();
            let src = fetch_byte();
            let result = get_register_8bit(dest) & get_register_8bit(src);
            set_register_8bit(dest, result);
            ZERO_FLAG = result === 0;
            NEGATIVE_FLAG = (result & 0x80) !== 0;
            debug && console.log(`  AND reg${dest}, reg${src}`);
            break;
        }

        case OP.OR_REG_IMM: {
            let reg = fetch_byte();
            let value = fetch_byte();
            let result = get_register_8bit(reg) | value;
            set_register_8bit(reg, result);
            ZERO_FLAG = result === 0;
            NEGATIVE_FLAG = (result & 0x80) !== 0;
            debug && console.log(`  OR reg${reg}, $${value.toString(16).padStart(2,'0')}`);
            break;
        }

        case OP.OR_REG_REG: {
            let dest = fetch_byte();
            let src = fetch_byte();
            let result = get_register_8bit(dest) | get_register_8bit(src);
            set_register_8bit(dest, result);
            ZERO_FLAG = result === 0;
            NEGATIVE_FLAG = (result & 0x80) !== 0;
            debug && console.log(`  OR reg${dest}, reg${src}`);
            break;
        }

        case OP.XOR_REG_IMM: {
            let reg = fetch_byte();
            let value = fetch_byte();
            let result = get_register_8bit(reg) ^ value;
            set_register_8bit(reg, result);
            ZERO_FLAG = result === 0;
            NEGATIVE_FLAG = (result & 0x80) !== 0;
            debug && console.log(`  XOR reg${reg}, $${value.toString(16).padStart(2,'0')}`);
            break;
        }

        case OP.XOR_REG_REG: {
            let dest = fetch_byte();
            let src = fetch_byte();
            let result = get_register_8bit(dest) ^ get_register_8bit(src);
            set_register_8bit(dest, result);
            ZERO_FLAG = result === 0;
            NEGATIVE_FLAG = (result & 0x80) !== 0;
            debug && console.log(`  XOR reg${dest}, reg${src}`);
            break;
        }

        case OP.NOT_REG: {
            let reg = fetch_byte();
            let result = ~get_register_8bit(reg);
            set_register_8bit(reg, result & 0xFF);
            ZERO_FLAG = (result & 0xFF) === 0;
            NEGATIVE_FLAG = (result & 0x80) !== 0;
            debug && console.log(`  NOT reg${reg}`);
            break;
        }


        // 16-bit logic (implicit) (116-119)
        case OP.ANDX: {
            let ab = (REGISTER_A << 8) | REGISTER_B;
            let xy = (REGISTER_X << 8) | REGISTER_Y;
            let result = ab & xy;
            REGISTER_A = (result >> 8) & 0xFF;
            REGISTER_B = result & 0xFF;
            ZERO_FLAG = result === 0;
            debug && console.log(`  ANDX: AB=$${result.toString(16).padStart(4,'0')}`);
            break;
        }

        case OP.ORX: {
            let ab = (REGISTER_A << 8) | REGISTER_B;
            let xy = (REGISTER_X << 8) | REGISTER_Y;
            let result = ab | xy;
            REGISTER_A = (result >> 8) & 0xFF;
            REGISTER_B = result & 0xFF;
            ZERO_FLAG = result === 0;
            debug && console.log(`  ORX: AB=$${result.toString(16).padStart(4,'0')}`);
            break;
        }

        case OP.XORX: {
            let ab = (REGISTER_A << 8) | REGISTER_B;
            let xy = (REGISTER_X << 8) | REGISTER_Y;
            let result = ab ^ xy;
            REGISTER_A = (result >> 8) & 0xFF;
            REGISTER_B = result & 0xFF;
            ZERO_FLAG = result === 0;
            debug && console.log(`  XORX: AB=$${result.toString(16).padStart(4,'0')}`);
            break;
        }

        case OP.NOTX: {
            let ab = (REGISTER_A << 8) | REGISTER_B;
            let result = (~ab) & 0xFFFF;
            REGISTER_A = (result >> 8) & 0xFF;
            REGISTER_B = result & 0xFF;
            ZERO_FLAG = result === 0;
            debug && console.log(`  NOTX: AB=$${result.toString(16).padStart(4,'0')}`);
            break;
        }

        // 16-bit logic (explicit) (179-185)
        case OP.ANDX_REG_IMM: {
            let reg = fetch_byte();
            let value = fetch_word();
            let reg_value = get_register_16bit(reg);
            let result = reg_value & value;
            set_register_16bit(reg, result);
            ZERO_FLAG = result === 0;
            debug && console.log(`  ANDX reg${reg}, $${value.toString(16).padStart(4,'0')}`);
            break;
        }

        case OP.ANDX_REG_REG: {
            let dest = fetch_byte();
            let src = fetch_byte();
            let result = get_register_16bit(dest) & get_register_16bit(src);
            set_register_16bit(dest, result);
            ZERO_FLAG = result === 0;
            debug && console.log(`  ANDX reg${dest}, reg${src}`);
            break;
        }

        case OP.ORX_REG_IMM: {
            let reg = fetch_byte();
            let value = fetch_word();
            let reg_value = get_register_16bit(reg);
            let result = reg_value | value;
            set_register_16bit(reg, result);
            ZERO_FLAG = result === 0;
            debug && console.log(`  ORX reg${reg}, $${value.toString(16).padStart(4,'0')}`);
            break;
        }

        case OP.ORX_REG_REG: {
            let dest = fetch_byte();
            let src = fetch_byte();
            let result = get_register_16bit(dest) | get_register_16bit(src);
            set_register_16bit(dest, result);
            ZERO_FLAG = result === 0;
            debug && console.log(`  ORX reg${dest}, reg${src}`);
            break;
        }

        case OP.XORX_REG_IMM: {
            let reg = fetch_byte();
            let value = fetch_word();
            let reg_value = get_register_16bit(reg);
            let result = reg_value ^ value;
            set_register_16bit(reg, result);
            ZERO_FLAG = result === 0;
            debug && console.log(`  XORX reg${reg}, $${value.toString(16).padStart(4,'0')}`);
            break;
        }

        case OP.XORX_REG_REG: {
            let dest = fetch_byte();
            let src = fetch_byte();
            let result = get_register_16bit(dest) ^ get_register_16bit(src);
            set_register_16bit(dest, result);
            ZERO_FLAG = result === 0;
            debug && console.log(`  XORX reg${dest}, reg${src}`);
            break;
        }

        case OP.NOTX_REG: {
            let reg = fetch_byte();
            let value = get_register_16bit(reg);
            let result = (~value) & 0xFFFF;
            set_register_16bit(reg, result);
            ZERO_FLAG = result === 0;
            debug && console.log(`  NOTX reg${reg}`);
            break;
        }

        // Shifts and rotates (110-115)
        case OP.SHL: {
            let reg = fetch_byte();
            let value = get_register_8bit(reg);
            CARRY_FLAG = (value & 0x80) !== 0;  // Bit 7 goes into carry
            value = (value << 1) & 0xFF;
            set_register_8bit(reg, value);
            ZERO_FLAG = value === 0;
            NEGATIVE_FLAG = (value & 0x80) !== 0;
            debug && console.log(`  SHL ${REG8_NAMES[reg]}`);
            break;
        }

        case OP.SHR: {
            let reg = fetch_byte();
            let value = get_register_8bit(reg);
            CARRY_FLAG = (value & 0x01) !== 0;  // Bit 0 goes into carry
            value = value >> 1;
            set_register_8bit(reg, value);
            ZERO_FLAG = value === 0;
            NEGATIVE_FLAG = false;  // High bit always 0 after SHR
            debug && console.log(`  SHR ${REG8_NAMES[reg]}`);
            break;
        }

        case OP.ROL: {
            let reg = fetch_byte();
            let value = get_register_8bit(reg);
            let old_carry = CARRY_FLAG ? 1 : 0;
            CARRY_FLAG = (value & 0x80) !== 0;
            value = ((value << 1) | old_carry) & 0xFF;
            set_register_8bit(reg, value);
            ZERO_FLAG = value === 0;
            NEGATIVE_FLAG = (value & 0x80) !== 0;
            debug && console.log(`  ROL ${REG8_NAMES[reg]} result=${value.toString(16)}`);
            break;
        }

        case OP.ROR: {
            let reg = fetch_byte();
            let value = get_register_8bit(reg);
            let old_carry = CARRY_FLAG ? 1 : 0;
            CARRY_FLAG = (value & 0x01) !== 0;  // Bit 0 goes into carry
            value = (value >> 1) | (old_carry << 7);  // Carry rotates into bit 7
            set_register_8bit(reg, value);
            ZERO_FLAG = value === 0;
            NEGATIVE_FLAG = (value & 0x80) !== 0;
            debug && console.log(`  ROR ${REG8_NAMES[reg]}`);
            break;
        }

        case OP.ROTL: {
            let reg = fetch_byte();
            let value = get_register_8bit(reg);
            let bit7 = (value & 0x80) >> 7;  // Save bit 7
            value = ((value << 1) | bit7) & 0xFF;  // Bit 7 rotates to bit 0
            set_register_8bit(reg, value);
            ZERO_FLAG = value === 0;
            NEGATIVE_FLAG = (value & 0x80) !== 0;
            debug && console.log(`  ROTL ${REG8_NAMES[reg]}`);
            break;
        }

        case OP.ROTR: {
            let reg = fetch_byte();
            let value = get_register_8bit(reg);
            let bit0 = value & 0x01;  // Save bit 0
            value = (value >> 1) | (bit0 << 7);  // Bit 0 rotates to bit 7
            set_register_8bit(reg, value);
            ZERO_FLAG = value === 0;
            NEGATIVE_FLAG = (value & 0x80) !== 0;
            debug && console.log(`  ROTR ${REG8_NAMES[reg]}`);
            break;
        }

        // INC 8-bit registers (75-82)
        case OP.INC_A: case OP.INC_B: case OP.INC_X: case OP.INC_Y:
        case OP.INC_I: case OP.INC_J: case OP.INC_K: case OP.INC_T: {
            let reg = opcode - OP.INC_A;  // 0=A, 1=B, 2=X, etc.
            let value = get_register_8bit(reg);
            value = (value + 1) & 0xFF;
            set_register_8bit(reg, value);
            ZERO_FLAG = value === 0;
            NEGATIVE_FLAG = (value & 0x80) !== 0;
            debug && console.log(`  INC ${REG8_NAMES[reg]}: value=${value}`);
            break;
        }

        // DEC 8-bit registers (87-94)
        case OP.DEC_A: case OP.DEC_B: case OP.DEC_X: case OP.DEC_Y:
        case OP.DEC_I: case OP.DEC_J: case OP.DEC_K: case OP.DEC_T: {
            let reg = opcode - OP.DEC_A;  // 0=A, 1=B, 2=X, etc.
            let value = get_register_8bit(reg);
            value = (value - 1) & 0xFF;
            set_register_8bit(reg, value);
            ZERO_FLAG = value === 0;
            NEGATIVE_FLAG = (value & 0x80) !== 0;
            debug && console.log(`  DEC ${REG8_NAMES[reg]}: value=${value}`);
            break;
        }

        // INC 16-bit register pairs (83-86)
        case OP.INC_AB: case OP.INC_XY: case OP.INC_IJ: case OP.INC_KT: {
            let pair_index = opcode - OP.INC_AB;  // 0=AB, 1=XY, 2=IJ, 3=KT
            let value = get_register_16bit(pair_index);
            value = (value + 1) & 0xFFFF;
            set_register_16bit(pair_index, value);
            ZERO_FLAG = value === 0;
            debug && console.log(`  INC ${REG16_NAMES[pair_index]}: value=$${value.toString(16).padStart(4,'0')}`);
            break;
        }

        // DEC 16-bit register pairs (95-98)
        case OP.DEC_AB: case OP.DEC_XY: case OP.DEC_IJ: case OP.DEC_KT: {
            let pair_index = opcode - OP.DEC_AB;  // 0=AB, 1=XY, 2=IJ, 3=KT
            let value = get_register_16bit(pair_index);
            value = (value - 1) & 0xFFFF;
            set_register_16bit(pair_index, value);
            ZERO_FLAG = value === 0;
            debug && console.log(`  DEC ${REG16_NAMES[pair_index]}: value=$${value.toString(16).padStart(4,'0')}`);
            break;
        }

        // Flag instructions (189-196)
        case OP.CLC: {
            CARRY_FLAG = false;
            debug && console.log(`  CLC`);
            break;
        }

        case OP.SEC: {
            CARRY_FLAG = true;
            debug && console.log(`  SEC`);
            break;
        }

        case OP.CLV: {
            OVERFLOW_FLAG = false;
            debug && console.log(`  CLV`);
            break;
        }

        case OP.SEV: {
            OVERFLOW_FLAG = true;
            debug && console.log(`  SEV`);
            break;
        }

        case OP.CLZ: {
            ZERO_FLAG = false;
            debug && console.log(`  CLZ`);
            break;
        }

        case OP.SEZ: {
            ZERO_FLAG = true;
            debug && console.log(`  SEZ`);
            break;
        }

        case OP.CLN: {
            NEGATIVE_FLAG = false;
            debug && console.log(`  CLN`);
            break;
        }

        case OP.SEN: {
            NEGATIVE_FLAG = true;
            debug && console.log(`  SEN`);
            break;
        }

        // Implicit 8 and 16 bit Arithmetic (50-59)
        case OP.ADD: {
            let result = REGISTER_A + REGISTER_B;
            set_flags_from_result(result);
            REGISTER_A = result & 0xFF;
            debug && console.log(`  ADD: A=${REGISTER_A}, CF=${CARRY_FLAG}, ZF=${ZERO_FLAG}`);
            break;
        }

        case OP.SUB: {
            let result = REGISTER_A - REGISTER_B;
            debug && console.log(`  SUB: pre: A=${REGISTER_A}, B=${REGISTER_B}`);
            set_flags_from_result(result);
            REGISTER_A = result & 0xFF;
            debug && console.log(`  SUB post: A=${REGISTER_A}, CF=${CARRY_FLAG}, ZF=${ZERO_FLAG}`);
            break;
        }

        case OP.MUL: {
            let result = REGISTER_A * REGISTER_B;
            REGISTER_A = result & 0xFF;
            REGISTER_B = (result >> 8) & 0xFF;
            CARRY_FLAG = REGISTER_A > 0;
            ZERO_FLAG = result === 0;
            debug && console.log(`  MUL: result=${result} (A=${REGISTER_A}, B=${REGISTER_B})`);
            break;
        }

        case OP.DIV: {
            if (REGISTER_B === 0) {
                // Division by zero - set error state
                REGISTER_A = 0;
                REGISTER_B = 0;
                CARRY_FLAG = true;  // Indicate error
                debug && console.log(`  DIV: Division by zero!`);
            } else {
                let quotient = Math.floor(REGISTER_A / REGISTER_B);
                let remainder = REGISTER_A % REGISTER_B;
                REGISTER_A = quotient & 0xFF;
                REGISTER_B = remainder & 0xFF;
                ZERO_FLAG = quotient === 0;
                CARRY_FLAG = false;
                debug && console.log(`  DIV: A=${REGISTER_A} (quotient), B=${REGISTER_B} (remainder)`);
            }
            break;
        }

        case OP.MOD: {      // 54
            REGISTER_A = REGISTER_A % REGISTER_B;
            ZERO_FLAG = REGISTER_A === 0;
            CARRY_FLAG = false;
            debug && console.log(`  MOD: A=${REGISTER_A} (remainder)`);
            break;
        }

        // ADDX: 55,    // AB = AB + XY
        case OP.ADDX: {
            let ab = (REGISTER_B << 8) | REGISTER_A;  // B is high byte
            let xy = (REGISTER_Y << 8) | REGISTER_X;  // Y is high byte
            let result = ab + xy;
            set_flags_from_result_16bit(result);
            REGISTER_A = result & 0xFF;           // A = low byte
            REGISTER_B = (result >> 8) & 0xFF;    // B = high byte
            debug && console.log(`  ADDX: AB=$${result.toString(16).padStart(4,'0')}, CF=${CARRY_FLAG}`);
            break;
        }

        //SUBX: 56,    // AB = AB - XY
        case OP.SUBX: {
            let ab = (REGISTER_B << 8) | REGISTER_A;  // B is high byte
            let xy = (REGISTER_Y << 8) | REGISTER_X;  // Y is high byte
            let result = ab - xy;
            set_flags_from_result_16bit(result);
            REGISTER_A = result & 0xFF;           // A = low byte
            REGISTER_B = (result >> 8) & 0xFF;    // B = high byte
            debug && console.log(`  SUBX: AB=$${result.toString(16).padStart(4,'0')}, CF=${CARRY_FLAG}`);
            break;
        }

        //MULX: 57,    // AB:XY = AB * XY (32-bit result)
        case OP.MULX: {
            let ab = (REGISTER_B << 8) | REGISTER_A;
            let xy = (REGISTER_Y << 8) | REGISTER_X;
            let result = ab * xy;

            // Manual flag setting for 32-bit
            ZERO_FLAG = result === 0;
            CARRY_FLAG = result > 0xFFFF;  // Set if doesn't fit in 16 bits

            REGISTER_A = result & 0xFF;
            REGISTER_B = (result >> 8) & 0xFF;
            REGISTER_X = (result >> 16) & 0xFF;
            REGISTER_Y = (result >> 24) & 0xFF;

            debug && console.log(`  MULX: result=$${result.toString(16).padStart(8,'0')} (A=${REGISTER_A.toString(16).padStart(2,'0')}, B=${REGISTER_B.toString(16).padStart(2,'0')}, X=${REGISTER_X.toString(16).padStart(2,'0')}, Y=${REGISTER_Y.toString(16).padStart(2,'0')})`);
            break;
        }

        //DIVX: 58,    // AB = AB / XY
        case OP.DIVX: {
            let ab = (REGISTER_B << 8) | REGISTER_A;
            let xy = (REGISTER_Y << 8) | REGISTER_X;

            if (xy === 0) {
                // Division by zero
                REGISTER_A = 0;
                REGISTER_B = 0;
                CARRY_FLAG = true;  // Indicate error
                ZERO_FLAG = true;
                debug && console.log(`  DIVX: Division by zero!`);
            } else {
                let quotient = Math.floor(ab / xy);

                ZERO_FLAG = quotient === 0;
                CARRY_FLAG = false;

                REGISTER_A = quotient & 0xFF;
                REGISTER_B = (quotient >> 8) & 0xFF;

                debug && console.log(`  DIVX: AB=$${quotient.toString(16).padStart(4,'0')} (quotient)`);
            }
            break;
        }

        //MODX: 59,    // AB = AB % XY
        case OP.MODX: {
            let ab = (REGISTER_B << 8) | REGISTER_A;
            let xy = (REGISTER_Y << 8) | REGISTER_X;

            if (xy === 0) {
                // Modulo by zero
                REGISTER_A = 0;
                REGISTER_B = 0;
                CARRY_FLAG = true;  // Indicate error
                ZERO_FLAG = true;
                debug && console.log(`  MODX: Modulo by zero!`);
            } else {
                let remainder = ab % xy;

                ZERO_FLAG = remainder === 0;
                CARRY_FLAG = false;

                REGISTER_A = remainder & 0xFF;
                REGISTER_B = (remainder >> 8) & 0xFF;

                debug && console.log(`  MODX: AB=$${remainder.toString(16).padStart(4,'0')} (remainder)`);
            }
            break;
        }

        // Explicit arithmetic (60-74)
        case OP.ADD_REG_IMM:
        case OP.SUB_REG_IMM:
        case OP.MUL_REG_IMM:
        case OP.DIV_REG_IMM:
        case OP.MOD_REG_IMM: {
            let reg = fetch_byte();
            let value = fetch_byte();
            let reg_value = get_register_8bit(reg);
            let result;

            let op_type = opcode - OP.ADD_REG_IMM;  // 0=ADD, 3=SUB, 6=MUL, 9=DIV, 12=MOD
            let base_op = Math.floor(op_type / 3);

            switch(base_op) {
                case 0: // ADD
                    result = reg_value + value;
                    set_flags_from_result(result);
                    set_register_8bit(reg, result & 0xFF);
                    debug && console.log(`  ADD ${REG8_NAMES[reg]}, ${value}`);
                    break;
                case 1: // SUB
                    result = reg_value - value;
                    set_flags_from_result(result);
                    set_register_8bit(reg, result & 0xFF);
                    debug && console.log(`  SUB ${REG8_NAMES[reg]}, ${value}`);
                    break;
                case 2: // MUL
                    result = reg_value * value;
                    CARRY_FLAG = result > 255;
                    ZERO_FLAG = (result & 0xFF) === 0;
                    set_register_8bit(reg, result & 0xFF);
                    debug && console.log(`  MUL ${REG8_NAMES[reg]}, ${value}`);
                    break;
                case 3: // DIV
                    if (value === 0) {
                        set_register_8bit(reg, 0);
                        CARRY_FLAG = true;
                        debug && console.log(`  DIV ${REG8_NAMES[reg]}, ${value} - Division by zero!`);
                    } else {
                        result = Math.floor(reg_value / value);
                        ZERO_FLAG = result === 0;
                        CARRY_FLAG = false;
                        set_register_8bit(reg, result & 0xFF);
                        debug && console.log(`  DIV ${REG8_NAMES[reg]}, ${value}`);
                    }
                    break;
                case 4: // MOD
                    if (value === 0) {
                        set_register_8bit(reg, 0);
                        CARRY_FLAG = true;
                        debug && console.log(`  MOD ${REG8_NAMES[reg]}, ${value} - Modulo by zero!`);
                    } else {
                        result = reg_value % value;
                        ZERO_FLAG = result === 0;
                        CARRY_FLAG = false;
                        set_register_8bit(reg, result & 0xFF);
                        debug && console.log(`  MOD ${REG8_NAMES[reg]}, ${value}`);
                    }
                    break;
            }
            break;
        }

        case OP.ADD_REG_MEM:
        case OP.SUB_REG_MEM:
        case OP.MUL_REG_MEM:
        case OP.DIV_REG_MEM:
        case OP.MOD_REG_MEM: {
            let reg = fetch_byte();
            let addr = fetch_word();
            let value = memory[MB][addr];
            let reg_value = get_register_8bit(reg);
            let result;

            let op_type = opcode - OP.ADD_REG_IMM;
            let base_op = Math.floor(op_type / 3);

            switch(base_op) {
                case 0: // ADD
                    result = reg_value + value;
                    set_flags_from_result(result);
                    set_register_8bit(reg, result & 0xFF);
                    debug && console.log(`  ADD ${REG8_NAMES[reg]}, [$${addr.toString(16).padStart(4,'0')}]`);
                    break;
                case 1: // SUB
                    result = reg_value - value;
                    set_flags_from_result(result);
                    set_register_8bit(reg, result & 0xFF);
                    debug && console.log(`  SUB ${REG8_NAMES[reg]}, [$${addr.toString(16).padStart(4,'0')}]`);
                    break;
                case 2: // MUL
                    result = reg_value * value;
                    CARRY_FLAG = result > 255;
                    ZERO_FLAG = (result & 0xFF) === 0;
                    set_register_8bit(reg, result & 0xFF);
                    debug && console.log(`  MUL ${REG8_NAMES[reg]}, [$${addr.toString(16).padStart(4,'0')}]`);
                    break;
                case 3: // DIV
                    if (value === 0) {
                        set_register_8bit(reg, 0);
                        CARRY_FLAG = true;
                        debug && console.log(`  DIV ${REG8_NAMES[reg]}, [$${addr.toString(16).padStart(4,'0')}] - Division by zero!`);
                    } else {
                        result = Math.floor(reg_value / value);
                        ZERO_FLAG = result === 0;
                        CARRY_FLAG = false;
                        set_register_8bit(reg, result & 0xFF);
                        debug && console.log(`  DIV ${REG8_NAMES[reg]}, [$${addr.toString(16).padStart(4,'0')}]`);
                    }
                    break;
                case 4: // MOD
                    if (value === 0) {
                        set_register_8bit(reg, 0);
                        CARRY_FLAG = true;
                        debug && console.log(`  MOD ${REG8_NAMES[reg]}, [$${addr.toString(16).padStart(4,'0')}] - Modulo by zero!`);
                    } else {
                        result = reg_value % value;
                        ZERO_FLAG = result === 0;
                        CARRY_FLAG = false;
                        set_register_8bit(reg, result & 0xFF);
                        debug && console.log(`  MOD ${REG8_NAMES[reg]}, [$${addr.toString(16).padStart(4,'0')}]`);
                    }
                    break;
            }
            break;
        }

        case OP.ADD_REG_REG:
        case OP.SUB_REG_REG:
        case OP.MUL_REG_REG:
        case OP.DIV_REG_REG:
        case OP.MOD_REG_REG: {
            let dest = fetch_byte();
            let src = fetch_byte();
            let dest_value = get_register_8bit(dest);
            let src_value = get_register_8bit(src);
            let result;

            let op_type = opcode - OP.ADD_REG_IMM;
            let base_op = Math.floor(op_type / 3);

            switch(base_op) {
                case 0: // ADD
                    result = dest_value + src_value;
                    set_flags_from_result(result);
                    set_register_8bit(dest, result & 0xFF);
                    debug && console.log(`  ADD ${REG8_NAMES[dest]}, ${REG8_NAMES[src]}`);
                    break;
                case 1: // SUB
                    result = dest_value - src_value;
                    debug && console.log(`  SUB: pre: ${REG8_NAMES[dest]}=${dest_value}, ${REG8_NAMES[src]}=${src_value}`);
                    set_flags_from_result(result);
                    set_register_8bit(dest, result & 0xFF);
                    debug && console.log(`  SUB ${REG8_NAMES[dest]}, ${REG8_NAMES[src]}`);
                    break;
                case 2: // MUL
                    result = dest_value * src_value;
                    CARRY_FLAG = result > 255;
                    ZERO_FLAG = (result & 0xFF) === 0;
                    set_register_8bit(dest, result & 0xFF);
                    debug && console.log(`  MUL ${REG8_NAMES[dest]}, ${REG8_NAMES[src]}`);
                    break;
                case 3: // DIV
                    if (src_value === 0) {
                        set_register_8bit(dest, 0);
                        CARRY_FLAG = true;
                        debug && console.log(`  DIV ${REG8_NAMES[dest]}, ${REG8_NAMES[src]} - Division by zero!`);
                    } else {
                        result = Math.floor(dest_value / src_value);
                        ZERO_FLAG = result === 0;
                        CARRY_FLAG = false;
                        set_register_8bit(dest, result & 0xFF);
                        debug && console.log(`  DIV ${REG8_NAMES[dest]}, ${REG8_NAMES[src]}`);
                    }
                    break;
                case 4: // MOD
                    if (src_value === 0) {
                        set_register_8bit(dest, 0);
                        CARRY_FLAG = true;
                    } else {
                        result = dest_value % src_value;
                        ZERO_FLAG = result === 0;
                        CARRY_FLAG = false;
                        set_register_8bit(dest, result & 0xFF);
                        debug && console.log(`  MOD ${REG8_NAMES[dest]}, ${REG8_NAMES[src]}`);
                    }
                    break;
            }
            break;
        }

        // INC pointer registers (228-231)
        case OP.INC_MP:
        case OP.INC_DP:
        case OP.INC_EP:
        case OP.INC_SP: {
            let ptr_index = (opcode - OP.INC_MP) + 4;  // 4=MP, 5=DP, 6=EP, 7=SP
            let value = get_register_16bit(ptr_index);
            value = (value + 1) & 0xFFFF;
            set_register_16bit(ptr_index, value);
            ZERO_FLAG = value === 0;
            debug && console.log(`  INC ${REG16_NAMES[ptr_index]}: value=$${value.toString(16).padStart(4,'0')}`);
            break;
        }

        // DEC pointer registers (232-235)
        case OP.DEC_MP:
        case OP.DEC_DP:
        case OP.DEC_EP:
        case OP.DEC_SP: {
            let ptr_index = (opcode - OP.DEC_MP) + 4;  // 4=MP, 5=DP, 6=EP, 7=SP
            let value = get_register_16bit(ptr_index);
            value = (value - 1) & 0xFFFF;
            set_register_16bit(ptr_index, value);
            ZERO_FLAG = value === 0;
            debug && console.log(`  DEC ${REG16_NAMES[ptr_index]}: value=$${value.toString(16).padStart(4,'0')}`);
            break;
        }

        // Comparison (121-129)
        case OP.CMP: {
            let result = REGISTER_A - REGISTER_B;
            ZERO_FLAG = (result & 0xFF) === 0;
            CARRY_FLAG = REGISTER_A >= REGISTER_B;  // ← FIX: Unsigned comparison
            NEGATIVE_FLAG = (result & 0x80) !== 0;
            debug && console.log(`  CMP A, B: ZF=${ZERO_FLAG}, CF=${CARRY_FLAG}`);
            break;
        }

        case OP.CMP_REG_IMM: {
            //console.log(`  [DEBUG] IP before fetch: ${IP.toString(16)}`);
            let reg = fetch_byte();
            //console.log(`  [DEBUG] Fetched reg: ${reg}`);
            let value = fetch_byte();
            //console.log(`  [DEBUG] Fetched value: ${value}`);
            let reg_value = get_register_8bit(reg);
            let result = reg_value - value;
            ZERO_FLAG = (result & 0xFF) === 0;
            CARRY_FLAG = reg_value >= value;  // ← FIX: Unsigned comparison
            NEGATIVE_FLAG = (result & 0x80) !== 0;
            debug && console.log(`  CMP ${REG8_NAMES[reg]}(${reg_value}), ${value}: ZF=${ZERO_FLAG}`);
            break;
        }


        case OP.CMP_REG_MEM: {
            let reg = fetch_byte();
            let addr = fetch_word();
            let reg_value = get_register_8bit(reg);
            let mem_value = memory[MB][addr];
            let result = reg_value - mem_value;
            ZERO_FLAG = (result & 0xFF) === 0;
            CARRY_FLAG = reg_value >= mem_value;  // ← FIX: Unsigned comparison
            NEGATIVE_FLAG = (result & 0x80) !== 0;
            debug && console.log(`  CMP ${REG8_NAMES[reg]}, [$${addr.toString(16).padStart(4,'0')}]`);
            break;
        }

        case OP.CMP_REG_REG: {
            let reg1 = fetch_byte();
            let reg2 = fetch_byte();
            let value1 = get_register_8bit(reg1);
            let value2 = get_register_8bit(reg2);
            let result = value1 - value2;
            ZERO_FLAG = (result & 0xFF) === 0;
            CARRY_FLAG = value1 >= value2;  // ← FIX: Unsigned comparison
            NEGATIVE_FLAG = (result & 0x80) !== 0;
            debug && console.log(`  CMP ${REG8_NAMES[reg1]}, ${REG8_NAMES[reg2]}`);
            break;
        }



        case OP.CMPX: {
            let ab = (REGISTER_B << 8) | REGISTER_A;
            let xy = (REGISTER_Y << 8) | REGISTER_X;
            let result = ab - xy;
            ZERO_FLAG = (result & 0xFFFF) === 0;
            CARRY_FLAG = ab >= xy;  // ← FIX: Unsigned comparison
            NEGATIVE_FLAG = (result & 0x8000) !== 0;
            debug && console.log(`  CMPX: AB vs XY`);
            break;
        }

        case OP.CMPX_REG_IMM: {
            let reg = fetch_byte();
            let value = fetch_word();
            let reg_value = get_register_16bit(reg);
            let result = reg_value - value;
            ZERO_FLAG = (result & 0xFFFF) === 0;
            CARRY_FLAG = reg_value >= value;  // ← FIX: Unsigned comparison
            NEGATIVE_FLAG = (result & 0x8000) !== 0;
            debug && console.log(`  CMPX ${REG16_NAMES[reg]}, $${value.toString(16).padStart(4,'0')}`);
            break;
        }

        case OP.CMPX_REG_REG: {
            let reg1 = fetch_byte();
            let reg2 = fetch_byte();
            let value1 = get_register_16bit(reg1);
            let value2 = get_register_16bit(reg2);
            let result = value1 - value2;
            ZERO_FLAG = (result & 0xFFFF) === 0;
            CARRY_FLAG = CARRY_FLAG = value1 >= value2;  // ← FIX: Unsigned comparison
            NEGATIVE_FLAG = (result & 0x8000) !== 0;
            debug && console.log(`  CMPX ${REG16_NAMES[reg1]}, ${REG16_NAMES[reg2]}`);
            break;
        }


        // Jumps & Calls (130-155)
        // i. Relative jumps (130-138)
        case OP.BRJ: {
            let offset = fetch_byte_signed();

            IP = (IP + offset) & 0xFFFF;
            debug && console.log(`  BRJ ${offset >= 0 ? '+' : ''}${offset}`);

            break;
        }
        case OP.BCS: {
            let offset = fetch_byte_signed();
            if (CARRY_FLAG) {
                IP = (IP + offset) & 0xFFFF;
                debug && console.log(`  BCS ${offset >= 0 ? '+' : ''}${offset} (taken)`);
            } else {
                debug && console.log(`  BCS ${offset >= 0 ? '+' : ''}${offset} (not taken)`);
            }
            break;
        }

        case OP.BCC: {
            let offset = fetch_byte_signed();
            if (!CARRY_FLAG) {
                IP = (IP + offset) & 0xFFFF;
                debug && console.log(`  BCC ${offset >= 0 ? '+' : ''}${offset} (taken)`);
            } else {
                debug && console.log(`  BCC ${offset >= 0 ? '+' : ''}${offset} (not taken)`);
            }
            break;
        }

        case OP.BMI: {
            let offset = fetch_byte_signed();
            if (NEGATIVE_FLAG) {
                IP = (IP + offset) & 0xFFFF;
                debug && console.log(`  BMI ${offset >= 0 ? '+' : ''}${offset} (taken)`);
            } else {
                debug && console.log(`  BMI ${offset >= 0 ? '+' : ''}${offset} (not taken)`);
            }
            break;
        }

        case OP.BPL: {
            let offset = fetch_byte_signed();
            if (!NEGATIVE_FLAG) {
                IP = (IP + offset) & 0xFFFF;
                debug && console.log(`  BPL ${offset >= 0 ? '+' : ''}${offset} (taken)`);
            } else {
                debug && console.log(`  BPL ${offset >= 0 ? '+' : ''}${offset} (not taken)`);
            }
            break;
        }

        case OP.BVS: {
            let offset = fetch_byte_signed();
            if (OVERFLOW_FLAG) {
                IP = (IP + offset) & 0xFFFF;
                debug && console.log(`  BVS ${offset >= 0 ? '+' : ''}${offset} (taken)`);
            } else {
                debug && console.log(`  BVS ${offset >= 0 ? '+' : ''}${offset} (not taken)`);
            }
            break;
        }

        case OP.BVC: {
            let offset = fetch_byte_signed();
            if (!OVERFLOW_FLAG) {
                IP = (IP + offset) & 0xFFFF;
                debug && console.log(`  JNO_REL ${offset >= 0 ? '+' : ''}${offset} (taken)`);
            } else {
                debug && console.log(`  JNO_REL ${offset >= 0 ? '+' : ''}${offset} (not taken)`);
            }
            break;
        }

        // ii. Jumps and Calls (139-155)
        case OP.JMP: {
            let addr = fetch_word();
            IP = addr;
            debug && console.log(`  JMP $${addr.toString(16).padStart(4,'0')}`);
            break;
        }

        case OP.JZ: {
            let addr = fetch_word();
            if (ZERO_FLAG) {
                IP = addr;
                debug && console.log(`  JZ $${addr.toString(16).padStart(4,'0')} (taken)`);
            } else {
                debug && console.log(`  JZ $${addr.toString(16).padStart(4,'0')} (not taken)`);
            }
            break;
        }

        case OP.JNZ: {
            let addr = fetch_word();
            if (!ZERO_FLAG) {
                IP = addr;
                debug && console.log(`  JNZ $${addr.toString(16).padStart(4,'0')} (taken)`);
            } else {
                debug && console.log(`  JNZ $${addr.toString(16).padStart(4,'0')} (not taken)`);
            }
            break;
        }

        case OP.JC: {
                let addr = fetch_word();
                if (CARRY_FLAG) {
                    IP = addr;
                    debug && console.log(`  JC $${addr.toString(16).padStart(4,'0')} (taken)`);
                } else {
                    debug && console.log(`  JC $${addr.toString(16).padStart(4,'0')} (not taken)`);
                }
                break;
            }

        case OP.JNC: {
                let addr = fetch_word();
                if (!CARRY_FLAG) {
                    IP = addr;
                    debug && console.log(`  JNC $${addr.toString(16).padStart(4,'0')} (taken)`);
                } else {
                    debug && console.log(`  JNC $${addr.toString(16).padStart(4,'0')} (not taken)`);
                }
                break;
            }

        case OP.JN: {
                let addr = fetch_word();
                if (NEGATIVE_FLAG) {
                    IP = addr;
                    debug && console.log(`  JN $${addr.toString(16).padStart(4,'0')} (taken)`);
                } else {
                    debug && console.log(`  JN $${addr.toString(16).padStart(4,'0')} (not taken)`);
                }
                break;
            }

        case OP.JNN: {
                let addr = fetch_word();
                if (!NEGATIVE_FLAG) {
                    IP = addr;
                    debug && console.log(`  JNN $${addr.toString(16).padStart(4,'0')} (taken)`);
                } else {
                    debug && console.log(`  JNN $${addr.toString(16).padStart(4,'0')} (not taken)`);
                }
                break;
            }

        case OP.JO: {
                let addr = fetch_word();
                if (OVERFLOW_FLAG) {
                    IP = addr;
                    debug && console.log(`  JO $${addr.toString(16).padStart(4,'0')} (taken)`);
                } else {
                    debug && console.log(`  JO $${addr.toString(16).padStart(4,'0')} (not taken)`);
                }
                break;
            }

        case OP.JNO: {
                let addr = fetch_word();
                if (!OVERFLOW_FLAG) {
                    IP = addr;
                    debug && console.log(`  JNO $${addr.toString(16).padStart(4,'0')} (taken)`);
                } else {
                    debug && console.log(`  JNO $${addr.toString(16).padStart(4,'0')} (not taken)`);
                }
                break;
            }

        case OP.JMP_IND: {
                let ptr_addr = fetch_word();
                let target_low = memory[CB][ptr_addr];
                let target_high = memory[CB][(ptr_addr + 1) & 0xFFFF];
                let target = (target_high << 8) | target_low;
                IP = target;
                debug && console.log(`  JMP [$${ptr_addr.toString(16).padStart(4,'0')}] -> $${target.toString(16).padStart(4,'0')}`);
                break;
            }

        // Register jumps
        case OP.JMP_REG: {
                let reg = fetch_byte();
                let addr = get_register_16bit(reg);
                IP = addr;
                debug && console.log(`  JMP ${REG16_NAMES[reg]} ($${addr.toString(16).padStart(4,'0')})`);
                break;
            }

        case OP.JMP_IND_REG: {
                let reg = fetch_byte();
                let ptr_addr = get_register_16bit(reg);
                let target_low = memory[CB][ptr_addr];
                let target_high = memory[CB][(ptr_addr + 1) & 0xFFFF];
                let target = (target_high << 8) | target_low;
                IP = target;
                debug && console.log(`  JMP [${REG16_NAMES[reg]}] -> $${target.toString(16).padStart(4,'0')}`);
                break;
            }


        case OP.CALL_RESERVED: {
            debug && console.log(`  Reserved subroutine opcode ${opcode}`);
            break;
        }

        // Subroutines (152-155)
        case OP.CALL: {
            //cpu_dump_registers();
            let addr = fetch_word();
            // Push return address (current IP) onto stack
            debug && console.log(`  Before push_word in CALL: SP=$${SP.toString(16)}`);
            push_word(IP);
            debug && console.log(`  After push_word in CALL: SP=$${SP.toString(16)}`);
            // Jump to subroutine
            IP = addr;
            debug && console.log(`  CALL $${addr.toString(16).padStart(4,'0')}`);
            break;
        }

        case OP.CALL_IND: {
            let ptr_addr = fetch_word();
            let target_low = memory[CB][ptr_addr];
            let target_high = memory[CB][(ptr_addr + 1) & 0xFFFF];
            let target = (target_high << 8) | target_low;
            // Push return address
            push_word(IP)
            // Jump to subroutine
            IP = target;
            debug && console.log(`  CALL [$${ptr_addr.toString(16).padStart(4,'0')}] -> $${target.toString(16).padStart(4,'0')}`);
            break;
        }

        case OP.CALL_IND_REG: {
            let reg = fetch_byte();
            let ptr_addr = get_register_16bit(reg);
            let target_low = memory[CB][ptr_addr];
            let target_high = memory[CB][(ptr_addr + 1) & 0xFFFF];
            let target = (target_high << 8) | target_low;
            // Push return address
            push_word(IP)
            // Jump to subroutine
            IP = target;
            debug && console.log(`  CALL [${REG16_NAMES[reg]}] -> $${target.toString(16).padStart(4,'0')}`);
            break;
        }

        case OP.RET: {
            // Pop return address from stack
            IP = pop_word();
            debug && console.log(`  RET -> $${IP.toString(16).padStart(4,'0')}`);
            break;
        }

        case OP.INT: {
            let int_num = fetch_byte();

            // INT 02h: System timer (32-bit milliseconds)
            if ((int_num === 2) && (REGISTER_A === 0)) {
                let ms = Math.floor(performance.now()) >>> 0;  // Ensure unsigned 32-bit

                REGISTER_A = ms & 0xFF;              // Lowest byte
                REGISTER_B = (ms >> 8) & 0xFF;       // Second byte
                REGISTER_X = (ms >> 16) & 0xFF;      // Third byte
                REGISTER_Y = (ms >> 24) & 0xFF;      // Highest byte

                console.log(`  INT 02h: Timer=${ms}ms (AB:XY=$${ms.toString(16).padStart(8, '0')})`);
                break;  // Don't do normal INT processing
            }

            if ((int_num === 2) && (REGISTER_A === 1)) {
                let unixtime = Math.floor(Date.now() / 1000);  // Unix time in seconds

                REGISTER_A = unixtime & 0xFF;              // Bits 0-7 (lowest byte)
                REGISTER_B = (unixtime >> 8) & 0xFF;       // Bits 8-15
                REGISTER_X = (unixtime >> 16) & 0xFF;      // Bits 16-23
                REGISTER_Y = (unixtime >> 24) & 0xFF;      // Bits 24-31 (highest byte)

                console.log(`Unix time: ${unixtime} (AB:XY = $${unixtime.toString(16).padStart(8, '0')})`);
                break; // done
            }

            // INT 03h: Command line processing
            if (int_num === 3) {
                let line_addr = (REGISTER_Y << 8) | REGISTER_X;
                //let cmd_type = REGISTER_A;  // Before we read the line

                // Read the line from video memory (bank 255)
                let line = '';
                for (let i = 0; i < 22; i++) {
                    let ch = memory[VB][line_addr + i];
                    if (ch === 0) break;
                    line += String.fromCharCode(ch);
                }
                line = line.trim();

                //console.log(`Command line: "${line}"`);

                // Determine command type from first character if it's a digit
                if (line.length > 0 && line[0] >= '0' && line[0] <= '9') {
                    print_to_screen_multi('');
                    handle_line_entry(line);
                } else if (line.toUpperCase().startsWith('RUN')) {
                    print_to_screen_multi('');
                    handle_run();
                } else if (line.toUpperCase().startsWith('SYS')) {
                    print_to_screen_multi('');
                    print_to_screen_multi('');
                    handle_sys(line);
                } else if (line.toUpperCase().startsWith('LIST')) {
                    print_to_screen_multi('');
                    print_to_screen_multi('');
                    handle_list();
                    print_to_screen_multi('');
                } else if (line.toUpperCase().startsWith('RENUMBER')) {
                    print_to_screen_multi('');
                    handle_renumber();
                } else if (line.toUpperCase().startsWith('NEW')) {
                    print_to_screen_multi('');
                    handle_new();
                } else if (line.toUpperCase().startsWith('REGS')) {
                    print_to_screen_multi('');
                    handle_regs();
                } else if (line.toUpperCase().startsWith('DUMP')) {
                    print_to_screen_multi('');
                    handle_dump(line);
                } else {
                    // Unrecognized command
                    if (line.length > 0) {
                        print_to_screen_multi('');
                        print_to_screen_multi('?ERROR\n');
                    } else {
                        print_to_screen_multi('');
                    }
                }

                break;  // Don't continue to do normal INT processing
            }

            // 1. Push return address (like CALL)
            push_word(IP);      // Push IP (16-bit): [low byte][high byte]
            push_byte(CB);      // Push CB last (bank = highest byte)
            push_byte(FLAGS);   // Flags on top

            // Stack now: [...][IP_low][IP_high][CB][FLAGS] ← SP
            // This represents: CB:IP as a 24-bit address

            // 3. Set interrupt flag (disable further interrupts)
            INTERRUPT_FLAG = true;

            // 4. Look up interrupt vector in jump table at $E000
            let vector_addr = 0xE000 + (int_num * 2);
            let target_low = memory[CB][vector_addr];
            let target_high = memory[CB][vector_addr + 1];
            let target = (target_high << 8) | target_low;

            // 5. Jump to handler
            IP = target;

            console.log(`  INT ${int_num} -> $${target.toString(16).padStart(4,'0')}`);
            break;
        }

        case OP.RTI: {
            // 1. Pop flags (restores interrupt flag state)
            FLAGS_REG = pop_byte();     // Pop FLAGS_REG first (was: FLAGS, an error).
            // Decode flags
            CARRY_FLAG = (FLAGS_REG & 0x01) !== 0;
            ZERO_FLAG = (FLAGS_REG & 0x02) !== 0;
            NEGATIVE_FLAG = (FLAGS_REG & 0x80) !== 0;
            OVERFLOW_FLAG = (FLAGS_REG & 0x40) !== 0;
            INTERRUPT_FLAG = (FLAGS_REG & 0x04) !== 0;

            // Pop CB and IP.
            CB = pop_byte();        // Pop CB (bank)
            IP = pop_word();        // Pop IP (16-bit address)

            debug && console.log(`  RTI -> $${IP.toString(16).padStart(4,'0')}`);
            break;
        }
        // Stack operations (124-129)
        case OP.PUSH_REG: {
            let reg = fetch_byte();
            let value = get_register_8bit(reg);
            SP = (SP - 1) & 0xFFFF;
            memory[SB][SP] = value & 0xFF;
            debug && console.log(`  PUSH reg${reg} (value=${value})`);
            break;
        }

        case OP.PUSH_IMM: {
            let value = fetch_byte();
            SP = (SP - 1) & 0xFFFF;
            memory[SB][SP] = value;
            debug && console.log(`  PUSH #${value}`);
            break;
        }

        case OP.PUSH_MEM: {
            let addr = fetch_word();
            let value = memory[MB][addr];
            SP = (SP - 1) & 0xFFFF;
            memory[SB][SP] = value;
            debug && console.log(`  PUSH [$${addr.toString(16).padStart(4,'0')}]`);
            break;
        }

        case OP.POP_REG: {
            let reg = fetch_byte();
            let value = memory[SB][SP];
            SP = (SP + 1) & 0xFFFF;
            set_register_8bit(reg, value);
            debug && console.log(`  POP reg${reg} (value=${value})`);
            break;
        }

        case OP.POP_MEM: {
            let addr = fetch_word();
            memory[MB][addr] = memory[SB][SP];
            SP = (SP + 1) & 0xFFFF;
            debug && console.log(`  POP [$${addr.toString(16).padStart(4,'0')}]`);
            break;
        }

        case OP.POP_IND_REG: {
            let reg = fetch_byte();
            let addr = get_register_16bit(reg);
            SP = (SP + 1) & 0xFFFF;
            memory[MB][addr] = memory[SB][SP];
            debug && console.log(`  POP [${REG16_NAMES[reg]}]`);
            break;
        }

        case OP.PUSHL: { // 236
            let reg = fetch_byte();
            let value = get_register_16bit(reg);
            SP = (SP - 1) & 0xFFFF;
            memory[SB][SP] = (value >> 8) & 0xFF;
            SP = (SP - 1) & 0xFFFF;
            memory[SB][SP] = value & 0xFF;
            debug && console.log(`  PUSHL ${REG16_NAMES[reg]}`);
            break;
        }

        case OP.POPL: {
            let reg = fetch_byte();
            let low = memory[SB][SP];              // Pop low byte
            SP = (SP + 1) & 0xFFFF;
            let high = memory[SB][SP];             // Pop high byte
            SP = (SP + 1) & 0xFFFF;
            let value = (high << 8) | low;
            set_register_16bit(reg, value);
            debug && console.log(`  POPL reg${reg} (value=$${value.toString(16).padStart(4,'0')})`);
            break;
        }

        case OP.PUSHA: {
            // Push 8-bit registers (A, B, X, Y, I, J, K, T, S, F)
            for (let i = 0; i <= 9; i++) {
                if (i === 8) continue;
                let value = get_register_8bit(i);
                SP = (SP - 1) & 0xFFFF;
                memory[SB][SP] = value;
            }

            // Push 16-bit pointers (MP, DP, VP, IOP - skip SP and IP)
            for (let i = 4; i < 11; i++) {
                if (i === 7 || i === 8) continue;  // Skip SP (7) and IP (8)
                let value = get_register_16bit(i);
                SP = (SP - 1) & 0xFFFF;
                memory[SB][SP] = (value >> 8) & 0xFF;
                SP = (SP - 1) & 0xFFFF;
                memory[SB][SP] = value & 0xFF;
            }

            // Push bank registers (MB, DB, EB, VB, IOB - NOT SB!)
            const banks = [MB, DB, EB, VB, IOB];
            for (let bank of banks) {
                SP = (SP - 1) & 0xFFFF;
                memory[SB][SP] = bank & 0xFF;
            }

            debug && console.log(`  PUSHA`);
            break;
        }

        case OP.POPA: {
            // Pop bank registers (reverse order - NOT SB!)
            IOB = memory[SB][SP]; SP = (SP + 1) & 0xFFFF;
            VB = memory[SB][SP]; SP = (SP + 1) & 0xFFFF;
            EB = memory[SB][SP]; SP = (SP + 1) & 0xFFFF;
            DB = memory[SB][SP]; SP = (SP + 1) & 0xFFFF;
            MB = memory[SB][SP]; SP = (SP + 1) & 0xFFFF;

            // Pop 16-bit pointers (reverse)
            for (let i = 10; i >= 4; i--) {
                if (i === 7 || i === 8) continue;  // Skip SP and IP
                let low = memory[SB][SP];
                SP = (SP + 1) & 0xFFFF;
                let high = memory[SB][SP];
                SP = (SP + 1) & 0xFFFF;
                set_register_16bit(i, (high << 8) | low);
            }

            // Pop 8-bit registers (reverse)
            for (let i = 9; i >= 0; i--) {
                if (i === 8) continue;
                let value = memory[SB][SP];
                SP = (SP + 1) & 0xFFFF;
                set_register_8bit(i, value);
            }

            debug && console.log(`  POPA`);
            break;
        }

        case OP.XDR: {
            let reg = fetch_byte();
            let normal = get_register_8bit(reg);
            let dream = get_dregister_8bit(reg);
            set_register_8bit(reg, dream);
            set_dregister_8bit(reg, normal);
            debug && console.log(`  XDR ${REG8_NAMES[reg]}`);
            break;
        }

        case OP.XSR: {
            let reg = fetch_byte();
            let normal = get_register_16bit(reg);
            let dream = get_dregister_16bit(reg);
            set_register_16bit(reg, dream);
            set_dregister_16bit(reg, normal);
            debug && console.log(`  XSR ${REG16_NAMES[reg]}`);
            break;
        }

        case OP.CLI: {
            FLAGS_REG &= ~FLAGS.I;   // Clear Interrupt flag
            debug && console.log(`  CLI`);
            break;
        }
        case OP.SEI: {
            FLAGS_REG |= FLAGS.I;   // set interrupt
            debug && console.log(`  SEI`);
            break;
        }

        // banking ops
        case OP.GETMB: {
            // set banks operate like LDA but into bank.
            let value = MB;
            REGISTER_A = value;
            ZERO_FLAG = value === 0;
            debug && console.log(`  GETMB (A=${value})`);
            break;
        }
        case OP.GETDB: {
            let value = DB;
            REGISTER_A = value;
            ZERO_FLAG = value === 0;
            debug && console.log(`  GETDB (A=${value})`);
            break;
        }
        case OP.GETCB: {
            let value = CB;
            REGISTER_A = value;
            ZERO_FLAG = value === 0;
            debug && console.log(`  GETCB (A=${value})`);
            break;
        }
        case OP.GETSB: {
            let value = SB;
            REGISTER_A = value;
            ZERO_FLAG = value === 0;
            debug && console.log(`  GETSB (A=${value})`);
            break;
        }
        case OP.GETEB: {
            let value = EB;
            REGISTER_A = value;
            ZERO_FLAG = value === 0;
            debug && console.log(`  GETEB (A=${value})`);
            break;
        }

        case OP.SETMB: {
            let value = REGISTER_A;
            MB = value;
            ZERO_FLAG = value === 0;
            debug && console.log(`  SETMB #${value}`);
            break;
        }

        case OP.SETDB: {
            let value = REGISTER_A;
            DB = value;
            ZERO_FLAG = value === 0;
            debug && console.log(`  SETDB #${value}`);
            break;
        }

        case OP.SETCB: {
            let value = REGISTER_A;
            CB = value;
            ZERO_FLAG = value === 0;
            debug && console.log(`  SETCB #${value}`);
            break;
        }
        case OP.SETSB: {
            let value = REGISTER_A;
            SB = value;
            ZERO_FLAG = value === 0;
            debug && console.log(`  SETSB #${value}`);
            break;
        }
        case OP.SETEB: {
            let value = REGISTER_A;
            EB = value;
            ZERO_FLAG = value === 0;
            debug && console.log(`  SETEB #${value}`);
            break;
        }
        case OP.SETVB: {
            let value = REGISTER_A;
            VB = value;
            ZERO_FLAG = value === 0;
            debug && console.log(`  SETVB #${value}`);
            break;
        }
        case OP.SETIOB: {
            let value = REGISTER_A;
            IOB = value;
            ZERO_FLAG = value === 0;
            debug && console.log(`  SETIOB #${value}`);
            break;
        }

        case OP.SETMP: {
            // SETMP: Set Memory Pointer from X:AB
            // MB = X (bank)
            // MP = AB (16-bit address)

            MB = REGISTER_X & 0xFF;
            let addr = (REGISTER_B << 8) | REGISTER_A;
            set_register_16bit(4, addr);  // MP is index 4 in REG16_NAMES

            debug && console.log(`  SETMP: MB=${MB}, MP=$${addr.toString(16).padStart(4,'0')}`);
            break;
        }

        case OP.GETMP: {
            // GETMP: Get Memory Pointer into X:AB
            // X = MB (bank)
            // AB = MP (address)

            REGISTER_X = MB & 0xFF;
            let mp = get_register_16bit(4);  // MP is index 4
            REGISTER_A = mp & 0xFF;
            REGISTER_B = (mp >> 8) & 0xFF;

            debug && console.log(`  GETMP: X=${REGISTER_X}, AB=$${mp.toString(16).padStart(4,'0')}`);
            break;
        }


        // MOV operations (203-215)
        case OP.MOV_REG_REG: { // 0
            let param = fetch_byte();
            let dest = (param >> 4) & 0x0F;
            let src = param & 0x0F;
            let value = get_register_16bit(src);
            set_register_16bit(dest, value);
            debug && console.log(`  MOV ${REG16_NAMES[dest]}, ${REG16_NAMES[src]} (value=${value})`);
            break;
        }

        case OP.MOV_REG_IMM: {  // 1
            let reg = fetch_byte();
            let l = fetch_byte();
            let h = fetch_byte();
            let value = (h << 8) | l;
            set_register_16bit(reg, value);
            debug && console.log(`  MOV ${REG16_NAMES[reg]}, $${value.toString(16).padStart(4,'0')}`);
            break;
        }

        case OP.MOV_REG_ZP:
        case OP.MOV_REG_MEM: {  // 3
            let reg = fetch_byte();
            let addr = fetch_word();
            let l = memory[MB][addr];
            let h = memory[MB][addr+1];
            let value = (h << 8) | l;
            set_register_16bit(reg, value);
            addr = addr.toString(16).padStart(4,'0').toUpperCase();
            value = value.toString(16).toUpperCase();
            debug && console.log(`  MOV ${REG16_NAMES[reg]}, [$${addr.toString(16).padStart(4,'0')}] (value=$${value.toString(16).padStart(4,'0')})`);
            break;
        }

        // MOV_REG_REGIND (opcode 4) - MOV A, [B] (load from address in register)
        case OP.MOV_REG_REGIND: {
            let dest_reg = fetch_byte();
            let ptr_reg = fetch_byte();
            let addr = get_register_16bit(ptr_reg) & 0xFFFF;  // Get address from pointer register
            let l = memory[MB][addr] & 0xFF;
            let h = memory[MB][addr+1] & 0xFF;
            let value = (h << 8) | l;
            set_register_16bit(dest_reg, value);
            debug && console.log(`  MOV ${REG16_NAMES[dest_reg]}, [${REG16_NAMES[ptr_reg]}] (addr=$${addr.toString(16).padStart(4,'0')}, value=$${value.toString(16).padStart(4,'0')})`);
            break;
        }

        // MOV_MEM_REG (opcode 5) - MOV [$1000], A (store register to memory)
        case OP.MOV_MEM_REG: {
            let addr = fetch_word();
            let src_reg = fetch_byte();
            let value = get_register_16bit(src_reg);
            const l  = value & 0xFF;
            const h = (value >>> 8) & 0xFF;
            memory[MB][addr] = l;
            memory[MB][addr+1] = h;
            debug && console.log(`  MOV [$${addr.toString(16).padStart(4,'0')}], ${REG16_NAMES[src_reg]} (value=$${value})`);
            break;
        }

        // MOV_MEM_IMM (opcode 6) - MOV [$1000], 42 (store immediate to memory)
        case OP.MOV_MEM_IMM: {
            let addr = fetch_word();
            let value = fetch_byte();
            memory[MB][addr] = value & 0xFF;
            debug && console.log(`  MOV [$${addr.toString(16).padStart(4,'0')}], $${value.toString(16).padStart(4,'0')}`);
            break;
        }

        // MOV_MEM_MEM (opcode 7) - Copy memory to memory
        case OP.MOV_MEM_MEM: {
            let dest_addr = fetch_word();
            let src_addr = fetch_word();
            let value = memory[MB][src_addr];
            memory[MB][dest_addr] = value & 0xFF;
            debug && console.log(`  MOV [$${dest_addr.toString(16).padStart(4,'0')}], [$${src_addr.toString(16).padStart(4,'0')}] (value=$${value.toString(16).padStart(4,'0')})`);
            break;
        }

        // MOV_MEM_REGIND (opcode 8) - Store from register-indirect to memory
        case OP.MOV_MEM_REGIND: {
            let dest_addr = fetch_word();
            let ptr_reg = fetch_byte();
            let src_addr = get_register_16bit(ptr_reg);
            let value = memory[MB][src_addr];
            memory[MB][dest_addr] = value & 0xFF;
            debug && console.log(`  MOV [$${dest_addr.toString(16).padStart(4,'0')}], [${REG16_NAMES[ptr_reg]}] (value=$${value.toString(16).padStart(4,'0')})`);
            break;
        }

        // MOV_REGIND_REG (opcode 9) - Store register to register-indirect
        case OP.MOV_REGIND_REG: {
            let ptr_reg = fetch_byte();
            let src_reg = fetch_byte();
            let addr = get_register_16bit(ptr_reg);
            let value = get_register_16bit(src_reg);
            const l  = value & 0xFF;
            const h = (value >>> 8) & 0xFF;
            memory[MB][addr] = l;
            memory[MB][addr+1] = h;
            debug && console.log(`  MOV [${REG16_NAMES[ptr_reg]}], ${REG16_NAMES[src_reg]} (addr=$${addr.toString(16).padStart(4,'0')}, value=$${value.toString(16).padStart(4,'0')})`);
            break;
        }

        // MOV_REGIND_IMM (opcode 10) - Store immediate to register-indirect
        case OP.MOV_REGIND_IMM: {
            let ptr_reg = fetch_byte();
            let value = fetch_byte();
            let addr = get_register_16bit(ptr_reg);
            memory[MB][addr] = value & 0xFF;
            debug && console.log(`  MOV [${REG16_NAMES[ptr_reg]}], $${value.toString(16).padStart(4,'0')} (addr=$${addr.toString(16).padStart(4,'0')})`);
            break;
        }

        // MOV_REGIND_MEM (opcode 11) - Load from memory to register-indirect
        case OP.MOV_REGIND_MEM: {
            let ptr_reg = fetch_byte();
            let src_addr = fetch_word();
            let addr = get_register_16bit(ptr_reg);
            let value = memory[MB][src_addr];
            memory[MB][addr] = value & 0xFF;
            debug && console.log(`  MOV [${REG16_NAMES[ptr_reg]}], [$${src_addr.toString(16).padStart(4,'0')}] (dest=$${addr.toString(16).padStart(4,'0')}, value=$${value.toString(16).padStart(4,'0')})`);
            break;
        }

        // MOV_REGIND_REGIND (opcode 12) - Copy register-indirect to register-indirect
        case OP.MOV_REGIND_REGIND: {
            let dest_ptr = fetch_byte();
            let src_ptr = fetch_byte();
            let dest_addr = get_register_16bit(dest_ptr);
            let src_addr = get_register_16bit(src_ptr);
            let value = memory[MB][src_addr];
            memory[MB][dest_addr] = value & 0xFF;
            debug && console.log(`  MOV [${REG16_NAMES[dest_ptr]}], [${REG16_NAMES[src_ptr]}] (src=$${src_addr.toString(16).padStart(4,'0')}, dest=$${dest_addr.toString(16).padStart(4,'0')}, value=${value})`);
            break;
        }

        case OP.MEMCOPY: {
            let count = get_register_16bit(3);  // KT = byte count

            debug && console.log(`  MEMCOPY: Copying ${count} bytes from MB:${MP.toString(16).padStart(4,'0')} to MB:${DP.toString(16).padStart(4,'0')}`);

            while (count > 0) {
                memory[MB][DP] = memory[MB][MP];
                MP = (MP + 1) & 0xFFFF;
                DP = (DP + 1) & 0xFFFF;
                count--;
            }

            // Update KT register to 0
            set_register_16bit(3, 0);
            //cpu_dump_ram(255,0xF0A0, 1);
            debug && console.log(`  MEMCOPY: Complete. MP=${MP.toString(16).padStart(4,'0')}, DP=${DP.toString(16).padStart(4,'0')}`);
            break;
        }

        case OP.MEMCOPYB: {
            let count = get_register_16bit(3);

            debug && console.log(`=== MEMCOPYB START ===`);
            debug && console.log(`  Source: Bank ${MB}, Address $${MP.toString(16).padStart(4,'0')}`);
            debug && console.log(`  Dest:   Bank ${DB}, Address $${DP.toString(16).padStart(4,'0')}`);
            debug && console.log(`  Count:  ${count} bytes`);
            debug && console.log(`  First source byte: $${memory[MB][MP].toString(16).padStart(2,'0')}`);

            let copied = 0;
            while (count > 0) {
                let byte = memory[MB][MP];
                memory[DB][DP] = byte;

                // Debug first few bytes
                if (copied < 5) {
                    debug && console.log(`  Copy [${copied}]: ${MB}:${MP.toString(16)} ($${byte.toString(16)}) -> ${DB}:${DP.toString(16)}`);
                }

                MP = (MP + 1) & 0xFFFF;
                DP = (DP + 1) & 0xFFFF;
                count--;
                copied++;
            }

            set_register_16bit(3, 0);
            debug && console.log(`  Copied ${copied} bytes`);
            debug && console.log(`=== MEMCOPYB END ===`);
            break;
        }
        case OP.SCAN: {
            // Search for byte in A within memory range starting at MP for KT bytes
            DP = MP;
            let found = false;
            let count = (REGISTER_T << 8) | REGISTER_K;  // KT as 16-bit count

            while (count > 0) {
                if (memory[DB][DP] === REGISTER_A) {
                    // Found - DP points to match
                    ZERO_FLAG = false;
                    found = true;
                    debug && console.log(`  SCAN: Found at $${DP.toString(16).padStart(4,'0')}`);
                    break;
                }
                DP = (DP + 1) & 0xFFFF;
                count--;
            }

            // Update KT with remaining count
            REGISTER_K = count & 0xFF;
            REGISTER_T = (count >> 8) & 0xFF;

            // Set XY to found byte
            REGISTER_X = (DP-MP) & 0xFF;
            REGISTER_Y = ((DP-MP) >> 8) & 0xFF;

            if (!found) {
                ZERO_FLAG = true;
                debug && console.log(`  SCAN: Not found`);
            }

            break;
        }


        // Bit packing operations (221-225)
        case OP.PAB: {
            // Pack low 4 bits of B into high nibble of A (preserves low nibble of A)
            REGISTER_A = (REGISTER_A & 0x0F) | ((REGISTER_B & 0x0F) << 4);
            debug && console.log(`  PAB: A=$${REGISTER_A.toString(16).padStart(2,'0')}`);
            break;
        }

        case OP.UAB: {
            // Unpack high 4 bits of A into B, zero them in A
            REGISTER_B = (REGISTER_A >> 4) & 0x0F;
            REGISTER_A = REGISTER_A & 0x0F;
            debug && console.log(`  UAB: A=$${REGISTER_A.toString(16)}, B=$${REGISTER_B.toString(16)}`);
            break;
        }

        case OP.PXY: {
            // Pack low 4 bits of X and Y into A (Y=high, X=low)
            REGISTER_A = ((REGISTER_Y & 0x0F) << 4) | (REGISTER_X & 0x0F);
            debug && console.log(`  PXY: A=$${REGISTER_A.toString(16).padStart(2,'0')}`);
            break;
        }

        case OP.UXY: {
            // Unpack A into X (low 4 bits) and Y (high 4 bits)
            REGISTER_X = REGISTER_A & 0x0F;
            REGISTER_Y = (REGISTER_A >> 4) & 0x0F;
            debug && console.log(`  UXY: X=$${REGISTER_X.toString(16)}, Y=$${REGISTER_Y.toString(16)}`);
            break;
        }

        // Special (253-255)
        case OP.NOP:
            if (debug) console.log("  NOP");
            break;

        case OP.HALT:
            debug && console.log("  HALT");
            cpu_halt();
            cpu_dump_registers();
            //cpu_dump_ram(255,0xF000);
            break;

        default:
            if (debug) console.log(`  UNKNOWN OPCODE: ${opcode}`);
            cpu_halt();
            cpu_dump_registers();
            break;
    }
}

////////////////////////////////////////////////////////////////////////////////////////
// CPU main loop
////////////////////////////////////////////////////////////////////////////////////////
let HALTED = true;
let cpuRunning = false;
const channel = new MessageChannel();
const port = channel.port2;
channel.port1.onmessage = cpuLoop;

// Note: 338742 Approximates a 1.023 mHz processor with code that runs about 3.02 cycles per opcode average.
// Double it for a C128 in "2mhz" mode (was 2.046mhz).
const TARGET_OPCODES_PER_SEC = 150_000;  // a bit slow but for testing.
const INSTRUCTIONS_PER_BATCH = 10_000;

function cpuLoop() {
    if (!cpuRunning || HALTED) return;

    let count = 0;
    let timer_counter = 0;
    const start = performance.now();

    while (!HALTED && count < INSTRUCTIONS_PER_BATCH) {
        cpu_step();
        count++;
        timer_counter++

        if (timer_counter > 1000) {
            timer_counter = 0;
            let ms = Math.floor(performance.now()) >>> 0;  // Ensure unsigned 32-bit
            memory[VB][61684] = ms & 0xFF;          // $F0F4 low byte of jiffy timer
            memory[VB][61685] = (ms >> 8) & 0xFF;   // $F0F5 second byte of jiffy timer
            memory[VB][61686] = (ms >> 16) & 0xFF;  // $F0F6 third byte of jiffy timer
            memory[VB][61687] = (ms >> 24) & 0xFF;  // $F0F7 high byte of jiffy timer
        }
    }

    const end = performance.now();
    const elapsed = end - start;
    const targetTime = (INSTRUCTIONS_PER_BATCH / TARGET_OPCODES_PER_SEC) * 1000;
    const delay = Math.max(0, targetTime - elapsed);

    if (delay > 1) {
        setTimeout(() => port.postMessage(0), delay); // throttle
    } else {
        port.postMessage(0); // run next batch immediately if we're close to target
    }
}

var cputimer = 0;
function cpu_start() {
    cpuRunning = true;
    HALTED = false;
    cputimer = performance.now();  // start timer

    cpu_ljmp(0, 0xE000); // start at KERNAL

    port.postMessage(0);  // kick off
}

function cpu_stop() {
    cpuRunning = false;
}

function print_to_screen_multi(text) {
    // Get current cursor position
    let x = memory[VB][0xF0FC];
    let y = memory[VB][0xF0FD];

    let lines = text.split('\n');

    for (let line of lines) {
        // Write line to screen at current position
        for (let i = 0; i < line.length && i < 22; i++) {
            let offset = y * 22 + x + i + 0xF100;
            if (offset < 0xF2FA) {  // Don't overflow character map
                memory[VB][offset] = line.charCodeAt(i);
            }
        }

        // Move to next line
        y++;
        x = 0;

        // Scroll if needed
        if (y >= 23) {
            // Scroll screen up (call line_feed logic)
            // Copy rows 1-22 to 0-21
            for (let i = 0; i < 484; i++) {
                memory[VB][0xF100 + i] = memory[VB][0xF116 + i];  // chars
                memory[VB][0xF300 + i] = memory[VB][0xF316 + i];  // colors
            }
            // Clear bottom row
            for (let i = 0; i < 22; i++) {
                memory[VB][0xF2E4 + i] = 32;  // spaces
                memory[VB][0xF4E4 + i] = 0xB5;  // default color
            }
            y = 22;
        }
    }

    // Update cursor position
    memory[VB][0xF0FC] = x;
    memory[VB][0xF0FD] = y;
}

let userprogram = {};  // Line-numbered program storage

function handle_line_entry(line) {
    let parts = line.split(' ');
    let line_num = parseInt(parts[0]);
    let code = parts.slice(1).join(' ');

    if (code.length === 0) {
        delete userprogram[line_num];
        console.log(`Deleted line ${line_num}`);
    } else {
        userprogram[line_num] = code;
        console.log(`Stored line ${line_num}: ${code}`);
    }
}

function handle_run() {
    if (Object.keys(userprogram).length === 0) {
        print_to_screen_multi('?PROGRAM EMPTY\n');
        return;
    }

    // Convert to assembly
    let asm_text = '.address $0100\n';
    let line_nums = Object.keys(userprogram).map(Number).sort((a,b) => a-b);

    for (let num of line_nums) {
        asm_text += `${num} ${userprogram[num]}\n`;
    }

    console.log('Assembling:', asm_text);

    try {
        let assembled = assemble_src(asm_text);
        let resolved = resolve_labels(assembled, kernal_labels);
        load_at(0, resolved);

        print_to_screen_multi('RUNNING...\n');

        // CALL to $0100 (push return address and jump)
        SP = (SP - 1) & 0xFFFF;
        memory[SB][SP] = (IP >> 8) & 0xFF;
        SP = (SP - 1) & 0xFFFF;
        memory[SB][SP] = IP & 0xFF;
        IP = 0x0100;

    } catch(e) {
        console.error('Assembly error:', e);
        print_to_screen_multi('?SYNTAX ERROR\n');
    }
}

function handle_list() {
    if (Object.keys(userprogram).length === 0) {
        print_to_screen_multi('PROGRAM EMPTY\n');
        return;
    }

    let line_nums = Object.keys(userprogram).map(Number).sort((a,b) => a-b);
    let output = '';
    for (let num of line_nums) {
        output += `${num} ${userprogram[num]}\n`;
    }
    print_to_screen_multi(output);
}

function handle_new() {
    userprogram = {};
    print_to_screen_multi('NEW PROGRAM\n');
}

function handle_renumber() {
    let line_nums = Object.keys(userprogram).map(Number).sort((a,b) => a-b);
    let new_program = {};
    let new_num = 10;

    for (let old_num of line_nums) {
        new_program[new_num] = userprogram[old_num];
        new_num += 10;
    }

    userprogram = new_program;
    print_to_screen_multi('RENUMBERED\n');
}

function handle_sys(line) {
    // Parse address from "SYS 8192" or "SYS $2000" or "SYS 0x2000"
    let parts = line.split(/\s+/);
    if (parts.length < 2) {
        print_to_screen_multi('?SYNTAX ERROR\n');
        return;
    }

    let addr_str = parts[1];
    let addr;

    if (addr_str.startsWith('$')) {
        addr = parseInt(addr_str.substring(1), 16);
    } else if (addr_str.startsWith('0x') || addr_str.startsWith('0X')) {
        addr = parseInt(addr_str, 16);
    } else if (addr_str.startsWith('#')) {
        addr = parseInt(addr_str.substring(1), 10);
    } else {
        addr = parseInt(addr_str, 10);
    }

    if (isNaN(addr)) {
        print_to_screen_multi('?SYNTAX ERROR\n');
        return;
    }

    print_to_screen_multi(`CALLING $${addr.toString(16).toUpperCase()}\n`);

    // CALL to address
    SP = (SP - 1) & 0xFFFF;
    memory[SB][SP] = (IP >> 8) & 0xFF;
    SP = (SP - 1) & 0xFFFF;
    memory[SB][SP] = IP & 0xFF;
    IP = addr & 0xFFFF;
}

function handle_regs() {
    let output = '';
    output += `A=${REGISTER_A.toString(16).padStart(2,'0').toUpperCase()} `;
    output += `B=${REGISTER_B.toString(16).padStart(2,'0').toUpperCase()} `;
    output += `X=${REGISTER_X.toString(16).padStart(2,'0').toUpperCase()} `;
    output += `Y=${REGISTER_Y.toString(16).padStart(2,'0').toUpperCase()}\n`;
    output += `I=${REGISTER_I.toString(16).padStart(2,'0').toUpperCase()} `;
    output += `J=${REGISTER_J.toString(16).padStart(2,'0').toUpperCase()} `;
    output += `K=${REGISTER_K.toString(16).padStart(2,'0').toUpperCase()} `;
    output += `T=${REGISTER_T.toString(16).padStart(2,'0').toUpperCase()}\n`;

    let AB = (REGISTER_B << 8) | REGISTER_A;
    let XY = (REGISTER_Y << 8) | REGISTER_X;
    let IJ = (REGISTER_J << 8) | REGISTER_I;
    let KT = (REGISTER_T << 8) | REGISTER_K;

    output += `AB=${AB.toString(16).padStart(4,'0').toUpperCase()} `;
    output += `XY=${XY.toString(16).padStart(4,'0').toUpperCase()}\n`;
    output += `IJ=${IJ.toString(16).padStart(4,'0').toUpperCase()} `;
    output += `KT=${KT.toString(16).padStart(4,'0').toUpperCase()}\n`;
    output += `FLAGS: C${CARRY_FLAG?1:0} Z${ZERO_FLAG?1:0} N${NEGATIVE_FLAG?1:0} V${OVERFLOW_FLAG?1:0}\n\n`;
    output += `MP=${MB.toString(16).padStart(2,'0').toUpperCase()}:${MP.toString(16).padStart(4,'0').toUpperCase()} `;
    output += `DP=${DB.toString(16).padStart(2,'0').toUpperCase()}:${DP.toString(16).padStart(4,'0').toUpperCase()}\n`;
    output += `EP=${EB.toString(16).padStart(2,'0').toUpperCase()}:${EP.toString(16).padStart(4,'0').toUpperCase()} `;
    output += `SP=${SB.toString(16).padStart(2,'0').toUpperCase()}:${SP.toString(16).padStart(4,'0').toUpperCase()}\n`;
    output += `IP=${CB.toString(16).padStart(2,'0').toUpperCase()}:${IP.toString(16).padStart(4,'0').toUpperCase()} `;
    output += `VP=${VB.toString(16).padStart(2,'0').toUpperCase()}:${VP.toString(16).padStart(4,'0').toUpperCase()}\n`;

    print_to_screen_multi(output);
}

function handle_dump(line) {
    // Parse address from "DUMP 8192" or "DUMP $2000"
    let parts = line.split(/\s+/);
    if (parts.length < 2) {
        print_to_screen_multi('?SYNTAX ERROR\n');
        return;
    }

    let addr_str = parts[1];
    let addr;

    if (addr_str.startsWith('$')) {
        addr = parseInt(addr_str.substring(1), 16);
    } else if (addr_str.startsWith('0x')) {
        addr = parseInt(addr_str, 16);
    } else if (addr_str.startsWith('#')) {
        addr = parseInt(addr_str.substring(1), 10);
    } else {
        addr = parseInt(addr_str, 10);
    }

    if (isNaN(addr)) {
        print_to_screen_multi('?SYNTAX ERROR\n');
        return;
    }

    // Dump 8 rows of 4 bytes
    let output = '';
    for (let row = 0; row < 8; row++) {
        let offset = addr + (row * 4);
        let hex_str = `${offset.toString(16).padStart(4, '0').toUpperCase()}: `;

        for (let col = 0; col < 4; col++) {
            let byte_addr = offset + col;
            if (byte_addr > 0xFFFF) break;

            let byte = memory[CB][byte_addr];
            hex_str += byte.toString(16).padStart(2, '0').toUpperCase() + ' ';
        }

        output += hex_str + '\n';
    }

    print_to_screen_multi(output);
}
