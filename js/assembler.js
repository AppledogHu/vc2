// SD-8510 CPU / VC-2 Computer System
// Copyright (C) 2025 Appledog Hu
//
// SPDX-License-Identifier: GPL-2.0-only WITH SD-8510-runtime-exception
// See LICENSE file for details.
//

// Stellar Dynamics SD-8510 VC2-Assembler
// (C) 2025 Neo Hu
// Authors: Neo, Appledog
//

// Opcode enumeration - COMPLETE ISA
//
const OP = {
    // LD instructions (load into 8-bit register) - opcodes 0-29
    // LDA (0-2)
    LDA_IMM: 0,       // LDA #42
    LDA_ZP: 1,        // LDA [$00]
    LDA_ABS: 2,       // LDA [$1000]

    // LDB (3-5)
    LDB_IMM: 3,
    LDB_ZP: 4,
    LDB_ABS: 5,

    // LDX (6-8)
    LDX_IMM: 6,
    LDX_ZP: 7,
    LDX_ABS: 8,

    // LDY (9-11)
    LDY_IMM: 9,
    LDY_ZP: 10,
    LDY_ABS: 11,

    // LDI (12-14)
    LDI_IMM: 12,
    LDI_ZP: 13,
    LDI_ABS: 14,

    // LDJ (15-17)
    LDJ_IMM: 15,
    LDJ_ZP: 16,
    LDJ_ABS: 17,

    // LDK (18-20)
    LDK_IMM: 18,
    LDK_ZP: 19,
    LDK_ABS: 20,

    // LDT (21-23)
    LDT_IMM: 21,
    LDT_ZP: 22,
    LDT_ABS: 23,

    // LDS (24-26) - Stack pointer low byte
    LDS_IMM: 24,
    LDS_ZP: 25,
    LDS_ABS: 26,

    // LDF (27-29) - Flags register
    LDF_IMM: 27,
    LDF_ZP: 28,
    LDF_ABS: 29,

    // Around line 238-245 in your OP constant
    LDA_IND_REG: 238,
    LDB_IND_REG: 239,
    LDX_IND_REG: 240,
    LDY_IND_REG: 241,

    // ST instructions (store from 8-bit register) - opcodes 30-49
    // STA (30-31)
    STA_ZP: 30,
    STA_ABS: 31,

    // STB (32-33)
    STB_ZP: 32,
    STB_ABS: 33,

    // STX (34-35)
    STX_ZP: 34,
    STX_ABS: 35,

    // STY (36-37)
    STY_ZP: 36,
    STY_ABS: 37,

    // STI (38-39)
    STI_ZP: 38,
    STI_ABS: 39,

    // STJ (40-41)
    STJ_ZP: 40,
    STJ_ABS: 41,

    // STK (42-43)
    STK_ZP: 42,
    STK_ABS: 43,

    // STT (44-45)
    STT_ZP: 44,
    STT_ABS: 45,

    // STS (46-47) - Stack pointer low byte
    STS_ZP: 46,
    STS_ABS: 47,

    // STF (48-49) - Flags register
    STF_ZP: 48,
    STF_ABS: 49,

    STA_IND_REG: 242,
    STB_IND_REG: 243,
    STX_IND_REG: 244,
    STY_IND_REG: 245,

    // Implicit arithmetic (50-59)
    ADD: 50,     // A = A + B
    SUB: 51,     // A = A - B
    MUL: 52,     // AB = A * B
    DIV: 53,     // A = A / B, B = remainder
    MOD: 54,     // A = A % B
    ADDX: 55,    // AB = AB + XY
    SUBX: 56,    // AB = AB - XY
    MULX: 57,    // AB:XY = AB * XY (32-bit result)
    DIVX: 58,    // AB = AB / XY
    MODX: 59,    // AB = AB % XY

    // Explicit arithmetic (60-74)
    // likely to be removed or some (like reg, reg) kept but result goes into AB.
    ADD_REG_IMM: 60,
    ADD_REG_MEM: 61,
    ADD_REG_REG: 62,
    SUB_REG_IMM: 63,
    SUB_REG_MEM: 64,
    SUB_REG_REG: 65,
    MUL_REG_IMM: 66,
    MUL_REG_MEM: 67,
    MUL_REG_REG: 68,
    DIV_REG_IMM: 69,
    DIV_REG_MEM: 70,
    DIV_REG_REG: 71,
    MOD_REG_IMM: 72,
    MOD_REG_MEM: 73,
    MOD_REG_REG: 74,

    // INC operations (75-86)
    INC_A: 75, INC_B: 76, INC_X: 77, INC_Y: 78,
    INC_I: 79, INC_J: 80, INC_K: 81, INC_T: 82,
    INC_AB: 83, INC_XY: 84, INC_IJ: 85, INC_KT: 86,
    INC_MP: 228, INC_DP: 229, INC_EP: 230, INC_SP: 231,

    // DEC operations (87-98)
    DEC_A: 87, DEC_B: 88, DEC_X: 89, DEC_Y: 90,
    DEC_I: 91, DEC_J: 92, DEC_K: 93, DEC_T: 94,
    DEC_AB: 95, DEC_XY: 96, DEC_IJ: 97, DEC_KT: 98,
    DEC_MP: 232, DEC_DP: 233, DEC_EP: 234, DEC_SP: 235,

    // Implicit logic (99-102)
    AND: 99,     // A = A & B
    OR: 100,     // A = A | B
    XOR: 101,    // A = A ^ B
    NOT: 102,    // A = ~A

    // Explicit logic (103-109)
    AND_REG_IMM: 103,
    AND_REG_REG: 104,
    OR_REG_IMM: 105,
    OR_REG_REG: 106,
    XOR_REG_IMM: 107,
    XOR_REG_REG: 108,
    NOT_REG: 109,

    // 16-bit logic operations (after existing logic ops)
    // These would go around opcodes 221-227 (after MEMCOPYB, in the reserved space)

    ANDX: 116,         // ANDX AB, XY (16-bit AND)
    ORX: 117,          // ORX AB, XY (16-bit OR)
    XORX: 118,         // XORX AB, XY (16-bit XOR)
    NOTX: 119,         // NOTX AB (16-bit NOT)

    ANDX_REG_IMM: 120, // ANDX AB, $1234
    ANDX_REG_REG: 179, // ANDX AB, XY
    ORX_REG_IMM: 180,  // ORX AB, $1234
    ORX_REG_REG: 181,  // ORX AB, XY
    XORX_REG_IMM: 182, // XORX AB, $1234
    XORX_REG_REG: 183, // XORX AB, XY
    NOTX_REG: 184,     // NOTX AB (takes register operand)

    // Shifts and rotates (110-115)
    SHL: 110,
    SHR: 111,
    ROL: 112,
    ROR: 113,
    ROTL: 114,
    ROTR: 115,

    // Comparison (121-129)
    CMP: 121,
    CMP_REG_IMM: 122,
    CMP_REG_MEM: 123,
    CMP_REG_REG: 124,
    CMPX: 125,
    CMPX_REG_IMM: 126,
    CMPX_REG_REG: 127,
    CMP_RESERVED_1: 128,
    CMP_RESERVED_2: 129,

    // Branch instructions (relative) (130-138)
    BRJ: 130,  // Branch always (unconditional relative jump)
    BEQ: 131,  // Branch if equal (Z=1)
    BNE: 132,  // Branch if not equal (Z=0)
    BCS: 133,  // Branch if carry set (C=1)
    BCC: 134,  // Branch if carry clear (C=0)
    BMI: 135,  // Branch if minus (N=1)
    BPL: 136,  // Branch if plus (N=0)
    BVS: 137,  // Branch if overflow set (V=1)
    BVC: 138,  // Branch if overflow clear (V=0)


    // Jumps - Absolute (139-148)
    JMP: 139, JZ: 140, JNZ: 141, JC: 142, JNC: 143,
    JN: 144, JNN: 145, JO: 146, JNO: 147, JMP_IND: 148,

    // Jumps - Register (149-150)
    JMP_REG: 149,
    JMP_IND_REG: 150,

    // Subroutines (151-155)
    CALL_RESERVED: 151,
    CALL: 152, CALL_IND: 153, CALL_IND_REG: 154, RET: 155,
    JSR: 252, RTS: 155, // analogies for CALL and RET

    // Stack (156-161)
    PUSH_REG: 156,
    PUSH_IMM: 157,
    PUSH_MEM: 158,
    POP_REG: 159,
    POP_MEM: 160,
    POP_IND_REG: 161,
    PUSHL: 236, // pushes a 16 bit register
    POPL: 237, // pops a 16 bit register
    PUSHA: 166,
    POPA: 167,

    // CPU ops (162-168)
    INT: 162,
    CLI: 163,
    SEI: 164,
    RTI: 165,
    XDR: 168,       // exchanges 8 bit register for shadow d-register. For context switching.
    XSR: 222,       // exchanges 16 bit register for shadow d-register. For context switching.

    // Bank operations (169-178) -- works with A only.
    SETMB: 169, SETDB: 170, SETCB: 171, SETSB: 172, SETEB: 173,
    GETMB: 174, GETDB: 175, GETCB: 176, GETSB: 177, GETEB: 178,

    SETMP: 246, SETDP: 247,  // set X:AB to pointer.
    IN: 248, OUT: 249, // in: load A from MB:MP (no increment). out: write A to DB:DP (no increment).


    // Reserved bank operations (185-188)
    SETVB: 185,
    GETVB: 186,
    SETIOB: 187,
    GETIOB: 188,

    // Flag instructions (189-196)
    CLC: 189, SEC: 190, CLV: 191, SEV: 192,
    CLZ: 193, SEZ: 194, CLN: 195, SEN: 196,

    // Reserved flag operations (197-202)
    SETF3: 197, GETF3: 198,
    SETF4: 199, GETF4: 200,
    SETF5: 201, GETF5: 202,

    // MOV operations (16-bit only) - opcodes 203-215
    MOV_REG_REG: 203,       // MOV AB, XY
    MOV_REG_IMM: 204,       // MOV AB, $1234
    MOV_REG_ZP: 205,        // MOV AB, [$00] (reserved)
    MOV_REG_MEM: 206,       // MOV AB, [$1000]
    MOV_REG_REGIND: 207,    // MOV AB, [MP]
    MOV_MEM_REG: 208,       // MOV [$1000], AB
    MOV_MEM_IMM: 209,       // MOV [$1000], $1234
    MOV_MEM_MEM: 210,       // MOV [$1000], [$2000]
    MOV_MEM_REGIND: 211,    // MOV [$1000], [MP]
    MOV_REGIND_REG: 212,    // MOV [MP], AB
    MOV_REGIND_IMM: 213,    // MOV [MP], $1234
    MOV_REGIND_MEM: 214,    // MOV [MP], [$1000]
    MOV_REGIND_REGIND: 215, // MOV [MP], [DP]

    // Block operations (216-220)
    MEMCOPY: 216,       // copies MP to DP w
    SCAN: 217,
    MEMCOPYB: 218,
    BLOCK_RESERVED_1: 219,
    BLOCK_RESERVED_2: 220,

    // Bit packing operations
    PXY: 223,       // Packs the low four bits of X and the low four bits of Y into A (A = XXXXYYYY). Reverses UXY.
    UXY: 224,       // Unpacks A into X and Y; If A = LLLLHHHH then X = LLLL and Y = HHHH (low and high bits). Reverses PXY.
    PAB: 225,       // packs the lower four bits of B into the high four bits of A.
    UAB: 221,       // Unpacks the high four bits of A into B and zeroes them in A.

    // Special (254-255)
    NOP: 254,
    HALT: 255
};

/**
 * FLAGS Register (8-bit Processor Status)
 *
 * Bit layout (6502-inspired):
 *
 *   7  6  5  4  3  2  1  0
 *   N  V  -  -  -  I  Z  C
 *
 * C (Carry) - Bit 0
 *   Set when addition produces carry out (result > 255) or subtraction requires borrow
 *
 * Z (Zero) - Bit 1
 *   Set when result of operation equals zero
 *
 * I (Interrupt Disable) - Bit 3
 *   When set: Hardware interrupts (IRQ) disabled
 *   When clear: Hardware interrupts enabled
 *   Modified by: SEI (set), CLI (clear)
 *
 * V (Overflow) - Bit 6
 *   Set when signed arithmetic produces incorrect sign
 *
 * N (Negative) - Bit 7
 *   Set when bit 7 of result is 1 (negative in signed arithmetic)
 *
 * Reserved bits (2, 4, 5): Available for future extensions
 */
const FLAGS = {
    C: 0x01,  // Carry         (bit 0)
    Z: 0x02,  // Zero          (bit 1)
    I: 0x08,  // Interrupt     (bit 3)
    V: 0x40,  // Overflow      (bit 6)
    N: 0x80   // Negative      (bit 7)
};

/**
 * Register encoding for 8-bit operations (LD/ST/arithmetic/logic):
 * 0=A, 1=B, 2=X, 3=Y, 4=I, 5=J, 6=K, 7=T
 * 8=AB, 9=XY, 10=IJ, 11=KT
 * 12=MP, 13=DP, 14=EP, 15=SP
 */
// using VAR because it's duplicated in cpu.js
var REG8_NAMES = ['A', 'B', 'X', 'Y', 'I', 'J', 'K', 'T', 'S', 'F'];

/**
 * Register encoding for 16-bit operations (MOV only):
 * 0=AB, 1=XY, 2=IJ, 3=KT
 * 4=MP, 5=DP, 6=EP, 7=SP
 * 8=CP, 9=VP, 10=IOP
 * 11-15=Reserved
 */
// using VAR because it's duplicated in cpu.js
var REG16_NAMES = ['AB', 'XY', 'IJ', 'KT', 'MP', 'DP', 'EP', 'SP', 'CP', 'VP', 'IOP'];

function register_to_number_8bit(reg) {
    const index = REG8_NAMES.indexOf(reg.toUpperCase());
    if (index === -1) {
        console.error(`Unknown 8-bit register: ${reg}`);
        return 0;
    }
    return index;
}

function register_to_number_16bit(reg) {
    const index = REG16_NAMES.indexOf(reg.toUpperCase());
    if (index === -1) {
        console.error(`Unknown 16-bit register: ${reg}`);
        return 0;
    }
    return index;
}


/**
 * parse_number
 * Parses numbers in multiple formats: decimal, hex ($XX or 0xXX), binary (0bXXX)
 */
function parse_number(str) {
    str = str.trim().toUpperCase();

    // Decimal with # prefix
    if (str.startsWith('#')) {
        return parseInt(str.substring(1), 10);
    }

    // Hex with $ prefix
    if (str.startsWith('$')) {
        let hex_part = str.substring(1);
        let match = hex_part.match(/^[0-9A-F]{1,4}/);
        if (match) {
            return parseInt(match[0], 16);
        }
        return 0;
    }

    // Hex with 0x prefix
    if (str.startsWith('0X') || str.startsWith('0x')) {
        let hex_part = str.substring(2);
        let match = hex_part.match(/^[0-9A-F]{1,4}/);
        if (match) {
            return parseInt(match[0], 16);
        }
        return 0;
    }

    // Binary with 0b prefix
    if (str.startsWith('0B') || str.startsWith('0b')) {
        return parseInt(str.substring(2), 2);
    }

    // Default: decimal
    return parseInt(str, 10);
}

function is_number(operand) {
    let r = parse_number(operand);
    if (isNaN(r)) return false;
    return true;
}

/**
 * strip_comments
 * Removes comments (after ; // or / or #) from a line
 */
function strip_comments(line) {
    // Handle // comments
    let doubleSlash = line.indexOf('//');
    if (doubleSlash >= 0) {
        line = line.substring(0, doubleSlash);
    }

    // Handle other comment types
    let comment_chars = [';'];
    for (let char of comment_chars) {
        let pos = line.indexOf(char);
        if (pos >= 0) {
            line = line.substring(0, pos);
        }
    }
    return line.trim();
}

/**
 * assemble_instruction
 * Assembles a single instruction line into bytecode
 *
 * Returns: {bytes: [...], address_offsets: [...]} or null for labels
 */
function assemble_instruction(line) {
    line = line.trim();//.toUpperCase();

    let parts = line.split(/[\s,]+/);
    let instruction = parts[0];
    let operand1 = parts[1] || '';
    let operand2 = parts[2] || '';


    // Normalize LD* to use dedicated opcodes
    if (instruction.startsWith('LD') && instruction.length === 3) {
        let reg = instruction[2];
        if (!['A', 'B', 'X', 'Y', 'I', 'J', 'K', 'T', 'S', 'F'].includes(reg)) {
            console.error(`${instruction}: LD only works with 8-bit registers (A,B,X,Y,I,J,K,T,S,F)`);
            return {bytes: [], address_offsets: []};
        }
        return assemble_ld(reg, operand1);
    }

    // Normalize ST* to use dedicated opcodes
    if (instruction.startsWith('ST') && instruction.length === 3) {
        let reg = instruction[2];
        if (!['A', 'B', 'X', 'Y', 'I', 'J', 'K', 'T', 'S', 'F'].includes(reg)) {
            console.error(`${instruction}: ST only works with 8-bit registers (A,B,X,Y,I,J,K,T,S,F)`);
            return {bytes: [], address_offsets: []};
        }
        return assemble_st(reg, operand1);
    }

    let bytes = [];
    let address_offsets = [];

    switch(instruction) {
        case 'MOV':
            return assemble_mov(operand1, operand2);
        case 'ADDX':
            return {bytes: [OP.ADDX], address_offsets: []};
        case 'SUBX':
            return {bytes: [OP.SUBX], address_offsets: []};
        case 'MULX':
            return {bytes: [OP.MULX], address_offsets: []};
        case 'DIVX':
            return {bytes: [OP.DIVX], address_offsets: []};
        case 'MODX':
            return {bytes: [OP.MODX], address_offsets: []};

        // Implicit/Explicit arithmetic
        case 'ADD':
        case 'SUB':
        case 'MUL':
        case 'DIV':
        case 'MOD':
            if (!operand1) {
                // Implicit - no operands
                return {bytes: [OP[instruction]], address_offsets: []};
            } else {
                // Explicit - has operands
                return assemble_arithmetic(instruction, operand1, operand2);
            }

        // INC (supports both 8-bit and 16-bit registers)
        case 'INC': {
            let reg = operand1.toUpperCase();

            // Map register names to opcodes
            const reg_opcodes = {
                'A': OP.INC_A, 'B': OP.INC_B, 'X': OP.INC_X, 'Y': OP.INC_Y,
                'I': OP.INC_I, 'J': OP.INC_J, 'K': OP.INC_K, 'T': OP.INC_T,
                'AB': OP.INC_AB, 'XY': OP.INC_XY, 'IJ': OP.INC_IJ, 'KT': OP.INC_KT,
                'MP': OP.INC_MP, 'DP': OP.INC_DP, 'EP': OP.INC_EP, 'SP': OP.INC_SP
            };

            if (reg_opcodes[reg] === undefined) {
                console.error(`Unknown register for INC: ${reg}`);
                return {bytes: [], address_offsets: []};
            }

            bytes = [reg_opcodes[reg]];
            return {bytes, address_offsets: []};
        }

        // DEC (supports both 8-bit and 16-bit registers)
        case 'DEC': {
            let reg = operand1.toUpperCase();

            // Map register names to opcodes
            const reg_opcodes = {
                'A': OP.DEC_A, 'B': OP.DEC_B, 'X': OP.DEC_X, 'Y': OP.DEC_Y,
                'I': OP.DEC_I, 'J': OP.DEC_J, 'K': OP.DEC_K, 'T': OP.DEC_T,
                'AB': OP.DEC_AB, 'XY': OP.DEC_XY, 'IJ': OP.DEC_IJ, 'KT': OP.DEC_KT,
                'MP': OP.DEC_MP, 'DP': OP.DEC_DP, 'EP': OP.DEC_EP, 'SP': OP.DEC_SP
            };

            if (reg_opcodes[reg] === undefined) {
                console.error(`Unknown register for DEC: ${reg}`);
                return {bytes: [], address_offsets: []};
            }

            bytes = [reg_opcodes[reg]];
            return {bytes, address_offsets: []};
        }

        // Logic operations
        case 'AND':
            if (!operand1) return {bytes: [OP.AND], address_offsets: []};
            return assemble_logic('AND', operand1, operand2);
        case 'OR':
            if (!operand1) return {bytes: [OP.OR], address_offsets: []};
            return assemble_logic('OR', operand1, operand2);
        case 'XOR':
            if (!operand1) return {bytes: [OP.XOR], address_offsets: []};
            return assemble_logic('XOR', operand1, operand2);
        case 'NOT':
            if (!operand1) return {bytes: [OP.NOT], address_offsets: []};
            bytes = [OP.NOT_REG, register_to_number_8bit(operand1)];
            return {bytes, address_offsets: []};


        // Implicit 16-bit logic
        case 'ANDX':
            if (!operand1) return {bytes: [OP.ANDX], address_offsets: []};
            return assemble_logic_16bit('ANDX', operand1, operand2);
        case 'ORX':
            if (!operand1) return {bytes: [OP.ORX], address_offsets: []};
            return assemble_logic_16bit('ORX', operand1, operand2);
        case 'XORX':
            if (!operand1) return {bytes: [OP.XORX], address_offsets: []};
            return assemble_logic_16bit('XORX', operand1, operand2);
        case 'NOTX':
            if (!operand1) return {bytes: [OP.NOTX], address_offsets: []};
            bytes = [OP.NOTX_REG, register_to_number_16bit(operand1)];
            return {bytes, address_offsets: []};


        // Shifts and rotates
        case 'SHL':
        case 'SHR':
        case 'ROL':
        case 'ROR':
        case 'ROTL':
        case 'ROTR':
            return assemble_shift_rotate(instruction, operand1);

        // Comparison
        case 'CMP':
            if (!operand1) return {bytes: [OP.CMP], address_offsets: []};
            return assemble_cmp(operand1, operand2);
        case 'CMPX':
            return assemble_cmpx(operand1, operand2);

        // Branch instructions (relative jumps)
        case 'BRJ':
        case 'BEQ':
        case 'BNE':
        case 'BCS':
        case 'BCC':
        case 'BMI':
        case 'BPL':
        case 'BVS':
        case 'BVC':
            return assemble_branch(instruction, operand1);

        // Jumps
        case 'JMP':
        case 'JZ':
        case 'JNZ':
        case 'JC':
        case 'JNC':
        case 'JN':
        case 'JNN':
        case 'JO':
        case 'JNO':
            return assemble_jump(instruction, operand1);

        // Calls
        case 'CALL':
            return assemble_call(operand1);
        case 'RET':
            return {bytes: [OP.RET], address_offsets: []};

        // Stack
        case 'PUSHL':
            if (!REG16_NAMES.includes(operand1.toUpperCase())) {
                throw new Error(`PUSHL requires 16-bit register (AB,XY,IJ,KT,MP,DP,EP,SP), got: ${operand1}`);
            }
            return assemble_push(operand1);

        case 'PUSH':
            return assemble_push(operand1);

        case 'POPL':
            if (!REG16_NAMES.includes(operand1.toUpperCase())) {
                throw new Error(`POPL requires 16-bit register (AB,XY,IJ,KT,MP,DP,EP,SP), got: ${operand1}`);
            }
            return assemble_pop(operand1);

        case 'POP':
            return assemble_pop(operand1);

        case 'PUSHA':
            return {bytes: [OP.PUSHA], address_offsets: []};
        case 'POPA':
            return {bytes: [OP.POPA], address_offsets: []};


        // CPU operations
        case 'INT':
            bytes = [OP.INT, parse_number(operand1)];
            return {bytes, address_offsets: []};
        case 'CLI':
            return {bytes: [OP.CLI], address_offsets: []};
        case 'SEI':
            return {bytes: [OP.SEI], address_offsets: []};
        case 'RTI':
            return {bytes: [OP.RTI], address_offsets: []};
        case 'XDR': {
            let reg = register_to_number_8bit(operand1);
            return {bytes: [OP.XDR, reg], address_offsets: []};
        }
        case 'XSR': {
            let reg = register_to_number_16bit(operand1);
            return {bytes: [OP.XSR, reg], address_offsets: []};
        }
        // Bank operations
        case 'SETMB':
            return {bytes: [OP.SETMB], address_offsets: []};
        case 'SETDB':
            return {bytes: [OP.SETDB], address_offsets: []};
        case 'SETCB':
            return {bytes: [OP.SETCB], address_offsets: []};
        case 'SETSB':
            return {bytes: [OP.SETSB], address_offsets: []};
        case 'SETEB':
            return {bytes: [OP.SETEB], address_offsets: []};
        case 'SETVB':
            return {bytes: [OP.SETVB], address_offsets: []};
        case 'SETIOB':
            return {bytes: [OP.SETIOB], address_offsets: []};
        case 'GETMB':
            return {bytes: [OP.GETMB], address_offsets: []};
        case 'GETDB':
            return {bytes: [OP.GETDB], address_offsets: []};
        case 'GETCB':
            return {bytes: [OP.GETCB], address_offsets: []};
        case 'GETSB':
            return {bytes: [OP.GETSB], address_offsets: []};
        case 'GETEB':
            return {bytes: [OP.GETEB], address_offsets: []};
        case 'GETVB':
            return {bytes: [OP.GETVB], address_offsets: []};
        case 'GETIOB':
            return {bytes: [OP.GETIOB], address_offsets: []};

        // Flag operations
        case 'CLC':
            return {bytes: [OP.CLC], address_offsets: []};
        case 'SEC':
            return {bytes: [OP.SEC], address_offsets: []};
        case 'CLV':
            return {bytes: [OP.CLV], address_offsets: []};
        case 'SEV':
            return {bytes: [OP.SEV], address_offsets: []};
        case 'CLZ':
            return {bytes: [OP.CLZ], address_offsets: []};
        case 'SEZ':
            return {bytes: [OP.SEZ], address_offsets: []};
        case 'CLN':
            return {bytes: [OP.CLN], address_offsets: []};
        case 'SEN':
            return {bytes: [OP.SEN], address_offsets: []};

        // Block operations
        case 'MEMCOPY':
            return {bytes: [OP.MEMCOPY], address_offsets: []};
        case 'MEMCOPYB':
            return {bytes: [OP.MEMCOPYB], address_offsets: []};
        case 'SCAN':
            return {bytes: [OP.SCAN], address_offsets: []};

        // bit packing:
        case 'PAB':
            return {bytes: [OP.PAB], address_offsets: []};
        case 'UAB':
            return {bytes: [OP.UAB], address_offsets: []};
        case 'PXY':
            return {bytes: [OP.PXY], address_offsets: []};
        case 'UXY':
            return {bytes: [OP.UXY], address_offsets: []};
        // Special
        case 'NAP':
            return {bytes: [OP.NAP], address_offsets: []};
        case 'NOP':
            return {bytes: [OP.NOP], address_offsets: []};
        case 'HALT':
            return {bytes: [OP.HALT], address_offsets: []};

        default:
            console.error("Unknown instruction: " + instruction);
            return {bytes: [], address_offsets: []};
    }
}

// Helper functions for assembly

function is_register(op) {
    let reg = op.toUpperCase();
    return REG8_NAMES.includes(reg) || REG16_NAMES.includes(reg);
}

function is_indirect(op) {
    return op.startsWith('[') && op.endsWith(']');
}

function extract_brackets(op) {
    return op.slice(1, -1);
}

function assemble_ld(reg, operand) {
    let bytes = [];
    let address_offsets = [];

    // Map register to base opcode (each register has 3 opcodes: IMM, ZP, ABS)
    const reg_base = {
        'A': OP.LDA_IMM,
        'B': OP.LDB_IMM,
        'X': OP.LDX_IMM,
        'Y': OP.LDY_IMM,
        'I': OP.LDI_IMM,
        'J': OP.LDJ_IMM,
        'K': OP.LDK_IMM,
        'T': OP.LDT_IMM,
        'S': OP.LDS_IMM,
        'F': OP.LDF_IMM
    };

    let base = reg_base[reg];

    if (is_indirect(operand)) {
        let inner = extract_brackets(operand);

        // Check for register indirect FIRST
        if (REG16_NAMES.includes(inner.toUpperCase())) {
            let ptr_reg = register_to_number_16bit(inner);
            let opcode_map = {
                'A': OP.LDA_IND_REG,
                'B': OP.LDB_IND_REG,
                'X': OP.LDX_IND_REG,
                'Y': OP.LDY_IND_REG
            };
            return {bytes: [opcode_map[reg], ptr_reg], address_offsets: []};
        }

        // Now parse as address
        let addr = parse_number(inner);

        if (addr <= 0xFF) {
            // Zero page
            bytes = [base + 1, addr];
            address_offsets = [];
        } else {
            // Absolute
            bytes = [base + 2, addr & 0xFF, (addr >> 8) & 0xFF];
            address_offsets = [1]; // load [addr] should never get relocated.
        }
    } else {
        // Immediate
        let value = parse_number(operand);
        bytes = [base, value & 0xFF];
    }

    return {bytes, address_offsets};
}

function assemble_st(reg, operand) {
    let bytes = [];
    let address_offsets = [];

    // Map register to base opcode (each register has 2 opcodes: ZP, ABS)
    const reg_base = {
        'A': OP.STA_ZP,
        'B': OP.STB_ZP,
        'X': OP.STX_ZP,
        'Y': OP.STY_ZP,
        'I': OP.STI_ZP,
        'J': OP.STJ_ZP,
        'K': OP.STK_ZP,
        'T': OP.STT_ZP,
        'S': OP.STS_ZP,
        'F': OP.STF_ZP
    };

    let base = reg_base[reg];

    if (!is_indirect(operand)) {
        console.error(`ST${reg} requires memory address: ST${reg} [$addr]`);
        return {bytes: [], address_offsets: []};
    }

    let inner = extract_brackets(operand);

// Check for register indirect FIRST
    if (REG16_NAMES.includes(inner.toUpperCase())) {
        let ptr_reg = register_to_number_16bit(inner);
        let opcode_map = {
            'A': OP.STA_IND_REG,
            'B': OP.STB_IND_REG,
            'X': OP.STX_IND_REG,
            'Y': OP.STY_IND_REG
        };
        return {bytes: [opcode_map[reg], ptr_reg], address_offsets: []};
    }

    // Now parse as address
    let addr = parse_number(inner);

    if (addr <= 0xFF) {
        // Zero page
        bytes = [base, addr];
        address_offsets = [];
    } else {
        // Absolute
        bytes = [base + 1, addr & 0xFF, (addr >> 8) & 0xFF];
        address_offsets = [1];
    }

    return {bytes, address_offsets};
}

function assemble_mov(dest, src) {
    let bytes = [];
    let address_offsets = [];

    // MOV only works with 16-bit registers
    if (is_register(dest) && !REG16_NAMES.includes(dest.toUpperCase())) {
        console.error(`MOV dest must be 16-bit register (AB,XY,IJ,KT,MP,DP,EP,SP,CP,VP,IOP): ${dest}`);
        return {bytes: [], address_offsets: []};
    }

    if (is_register(src) && !REG16_NAMES.includes(src.toUpperCase())) {
        console.error(`MOV src must be 16-bit register: ${src}`);
        return {bytes: [], address_offsets: []};
    }

    let dest_indirect = is_indirect(dest);
    let src_indirect = is_indirect(src);

    // MOV REG, REG
    if (!dest_indirect && !src_indirect && is_register(dest) && is_register(src)) {
        let dest_num = register_to_number_16bit(dest);
        let src_num = register_to_number_16bit(src);
        bytes = [OP.MOV_REG_REG, (dest_num << 4) | src_num];
        return {bytes, address_offsets};
    }

    // MOV REG, immediate (16-bit)
    if (!dest_indirect && !src_indirect && is_register(dest) && !is_register(src)) {

        if (src.startsWith('@')) {
            bytes = [OP.MOV_REG_IMM, register_to_number_16bit(dest), 0xFF, 0xFF];
            bytes._label = src.substring(1);  // Remove @ and store label name
            address_offsets = [2];  // Bytes at positions 2 and 3 will be filled by resolve_labels
            return {bytes, address_offsets};
        }

        let value = parse_number(src);
        //console.log(`  Parsed value: ${value}`);
        bytes = [OP.MOV_REG_IMM, register_to_number_16bit(dest), value & 0xFF, (value >> 8) & 0xFF];
        return {bytes, address_offsets};
    }

    // MOV [addr], REG
    if (dest_indirect && !src_indirect && is_register(src)) {
        let addr_str = extract_brackets(dest);

        if (is_register(addr_str)) {
            // MOV [MP], AB - register indirect
            bytes = [OP.MOV_REGIND_REG, register_to_number_16bit(addr_str), register_to_number_16bit(src)];
            return {bytes, address_offsets: []};
        } else {
            // MOV [$1000], AB - absolute
            let addr = parse_number(addr_str);
            bytes = [OP.MOV_MEM_REG, addr & 0xFF, (addr >> 8) & 0xFF, register_to_number_16bit(src)];
            address_offsets = [1];
            return {bytes, address_offsets};
        }
    }

    // MOV REG, [addr]
    if (!dest_indirect && src_indirect && is_register(dest)) {
        let addr_str = extract_brackets(src);

        if (is_register(addr_str)) {
            // MOV AB, [MP] - register indirect
            bytes = [OP.MOV_REG_REGIND, register_to_number_16bit(dest), register_to_number_16bit(addr_str)];
            return {bytes, address_offsets: []};
        } else {
            // MOV AB, [$1000] - absolute
            let addr = parse_number(addr_str);
            bytes = [OP.MOV_REG_MEM, register_to_number_16bit(dest), addr & 0xFF, (addr >> 8) & 0xFF];
            address_offsets = [2];
            return {bytes, address_offsets};
        }
    }

    // MOV [addr1], [addr2]
    if (dest_indirect && src_indirect) {
        let dest_str = extract_brackets(dest);
        let src_str = extract_brackets(src);

        // Both register indirect
        if (is_register(dest_str) && is_register(src_str)) {
            bytes = [OP.MOV_REGIND_REGIND, register_to_number_16bit(dest_str), register_to_number_16bit(src_str)];
            return {bytes, address_offsets: []};
        }

        // Dest absolute, src register indirect
        if (!is_register(dest_str) && is_register(src_str)) {
            let addr = parse_number(dest_str);
            bytes = [OP.MOV_MEM_REGIND, addr & 0xFF, (addr >> 8) & 0xFF, register_to_number_16bit(src_str)];
            address_offsets = [1];
            return {bytes, address_offsets};
        }

        // Dest register indirect, src absolute
        if (is_register(dest_str) && !is_register(src_str)) {
            let addr = parse_number(src_str);
            bytes = [OP.MOV_REGIND_MEM, register_to_number_16bit(dest_str), addr & 0xFF, (addr >> 8) & 0xFF];
            address_offsets = [2];
            return {bytes, address_offsets};
        }

        // Both absolute
        let dest_addr = parse_number(dest_str);
        let src_addr = parse_number(src_str);
        bytes = [OP.MOV_MEM_MEM,
            dest_addr & 0xFF, (dest_addr >> 8) & 0xFF,
            src_addr & 0xFF, (src_addr >> 8) & 0xFF];
        address_offsets = [1, 3];
        return {bytes, address_offsets};
    }

    // MOV [reg], immediate
    if (dest_indirect && !src_indirect && !is_register(src)) {
        let addr_str = extract_brackets(dest);
        let value = parse_number(src);

        if (is_register(addr_str)) {
            // MOV [MP], $1234 - register indirect
            bytes = [OP.MOV_REGIND_IMM, register_to_number_16bit(addr_str), value & 0xFF, (value >> 8) & 0xFF];
            return {bytes, address_offsets: []};
        } else {
            // MOV [$1000], $1234 - absolute
            let addr = parse_number(addr_str);
            bytes = [OP.MOV_MEM_IMM, addr & 0xFF, (addr >> 8) & 0xFF, value & 0xFF, (value >> 8) & 0xFF];
            address_offsets = [1];
            return {bytes, address_offsets};
        }
    }

    console.error("Invalid MOV syntax: MOV " + dest + ", " + src);
    return {bytes: [], address_offsets: []};
}

function assemble_shift_rotate(instruction, reg) {
    let opcode_map = {
        'SHL': OP.SHL,
        'SHR': OP.SHR,
        'ROL': OP.ROL,
        'ROR': OP.ROR,
        'ROTL': OP.ROTL,
        'ROTR': OP.ROTR
    };

    let bytes = [opcode_map[instruction], register_to_number_8bit(reg)];
    return {bytes, address_offsets: []};
}

function assemble_branch(instruction, operand) {
    let bytes = [];
    let address_offsets = [];

    let branch_map = {
        'BRJ': OP.BRJ, 'BEQ': OP.BEQ, 'BNE': OP.BNE,
        'BCS': OP.BCS, 'BCC': OP.BCC, 'BMI': OP.BMI,
        'BPL': OP.BPL, 'BVS': OP.BVS, 'BVC': OP.BVC
    };

    if (operand.startsWith('@')) {
        // Label reference - will be resolved to relative offset later
        bytes = [branch_map[instruction], 0xFF];
        bytes._label = operand.substring(1);
        bytes._is_relative = true;  // Mark as relative for label resolution
        address_offsets = [1];
    } else if (operand.startsWith('+') || operand.startsWith('-')) {
        // Explicit relative offset like "+10" or "-5"
        let offset = parseInt(operand);
        if (offset < -128 || offset > 127) {
            throw new Error(`Branch offset ${offset} out of range (-128 to +127)`);
        }
        bytes = [branch_map[instruction], offset & 0xFF];
        address_offsets = [];  // No relocation needed
    } else {
        // Direct number - treat as relative offset
        let offset = parse_number(operand);
        if (offset < -128 || offset > 127) {
            throw new Error(`Branch offset ${offset} out of range (-128 to +127)`);
        }
        bytes = [branch_map[instruction], offset & 0xFF];
        address_offsets = [];
    }

    return {bytes, address_offsets};
}

function assemble_jump(instruction, operand) {
    let bytes = [];
    let address_offsets = [];

    let abs_map = {
        'JMP': OP.JMP, 'JZ': OP.JZ, 'JNZ': OP.JNZ,
        'JC': OP.JC, 'JNC': OP.JNC, 'JN': OP.JN,
        'JNN': OP.JNN, 'JO': OP.JO, 'JNO': OP.JNO
    };

    if (operand.startsWith('@')) {
        // Label reference
        bytes = [abs_map[instruction], 0xFF, 0xFF];
        bytes._label = operand.substring(1);
        address_offsets = [1];
    } else if (is_indirect(operand)) {
        // Indirect jump
        bytes = [OP.JMP_IND, 0xFF, 0xFF];
        let addr = parse_number(extract_brackets(operand));
        bytes[1] = addr & 0xFF;
        bytes[2] = (addr >> 8) & 0xFF;
        address_offsets = [1];
    } else {
        // Direct address
        let addr = parse_number(operand);
        bytes = [abs_map[instruction], addr & 0xFF, (addr >> 8) & 0xFF];
        address_offsets = [1];
    }

    return {bytes, address_offsets};
}

function assemble_call(operand) {
    let bytes = [];
    let address_offsets = [];

    if (operand.startsWith('@')) {
        bytes = [OP.CALL, 0xFF, 0xFF];
        bytes._label = operand.substring(1);
        address_offsets = [1];
    } else {
        let addr = parse_number(operand);
        bytes = [OP.CALL, addr & 0xFF, (addr >> 8) & 0xFF];
        address_offsets = [1];
    }

    return {bytes, address_offsets};
}

function assemble_push(operand) {
    let bytes = [];
    let address_offsets = [];

    if (operand.startsWith('#')) {
        // PUSH #immediate (explicit)
        let value = parse_number(operand.substring(1));
        bytes = [OP.PUSH_IMM, value & 0xFF];
    } else if (is_number(operand)) {
        // PUSH 99 (bare number = immediate)
        let value = parse_number(operand);
        bytes = [OP.PUSH_IMM, value & 0xFF];
    } else if (is_indirect(operand)) {
        let inner = extract_brackets(operand);

        if (REG16_NAMES.includes(inner.toUpperCase())) {
            // PUSH [reg16] - indirect register
            let reg = register_to_number_16bit(inner);
            bytes = [OP.PUSH_IND_REG, reg];
        } else {
            // PUSH [addr] - memory
            let addr = parse_number(inner);
            bytes = [OP.PUSH_MEM, addr & 0xFF, (addr >> 8) & 0xFF];
            address_offsets = [1];
        }
    } else if (REG16_NAMES.includes(operand.toUpperCase())) {
        // PUSHL reg16
        let reg = register_to_number_16bit(operand);
        bytes = [OP.PUSHL, reg];
    } else {
        // PUSH reg8
        let reg = register_to_number_8bit(operand);
        bytes = [OP.PUSH_REG, reg];
    }

    return {bytes, address_offsets};
}

function assemble_pop(operand) {
    let bytes = [];
    let address_offsets = [];

    if (is_indirect(operand)) {
        let inner = extract_brackets(operand);
        if (REG16_NAMES.includes(inner.toUpperCase())) {
            // POP [reg16]
            let reg = register_to_number_16bit(inner);
            bytes = [OP.POP_IND_REG, reg];
        } else {
            // POP [addr]
            let addr = parse_number(inner);
            bytes = [OP.POP_MEM, addr & 0xFF, (addr >> 8) & 0xFF];
            address_offsets = [1];
        }
    } else if (REG16_NAMES.includes(operand.toUpperCase())) {
        // POPL reg16
        let reg = register_to_number_16bit(operand);
        bytes = [OP.POPL, reg];
    } else {
        // POP reg8
        let reg = register_to_number_8bit(operand);
        bytes = [OP.POP_REG, reg];
    }

    return {bytes, address_offsets};
}

function assemble_logic(op, operand1, operand2) {
    let bytes = [];
    let address_offsets = [];

    let opcode_map_imm = {
        'AND': OP.AND_REG_IMM,
        'OR': OP.OR_REG_IMM,
        'XOR': OP.XOR_REG_IMM
    };

    let opcode_map_reg = {
        'AND': OP.AND_REG_REG,
        'OR': OP.OR_REG_REG,
        'XOR': OP.XOR_REG_REG
    };

    if (!is_register(operand1)) {
        console.error(`${op} first operand must be a register`);
        return {bytes: [], address_offsets: []};
    }

    if (is_register(operand2)) {
        // REG, REG
        bytes = [opcode_map_reg[op], register_to_number_8bit(operand1), register_to_number_8bit(operand2)];
    } else {
        // REG, IMM
        bytes = [opcode_map_imm[op], register_to_number_8bit(operand1), parse_number(operand2)];
    }

    return {bytes, address_offsets};
}


// Helper function
function assemble_logic_16bit(op, operand1, operand2) {
    let bytes = [];
    let address_offsets = [];

    let opcode_map_imm = {
        'ANDX': OP.ANDX_REG_IMM,
        'ORX': OP.ORX_REG_IMM,
        'XORX': OP.XORX_REG_IMM
    };

    let opcode_map_reg = {
        'ANDX': OP.ANDX_REG_REG,
        'ORX': OP.ORX_REG_REG,
        'XORX': OP.XORX_REG_REG
    };

    if (!REG16_NAMES.includes(operand1.toUpperCase())) {
        console.error(`${op} first operand must be a 16-bit register`);
        return {bytes: [], address_offsets: []};
    }

    if (REG16_NAMES.includes(operand2.toUpperCase())) {
        // REG, REG
        bytes = [opcode_map_reg[op], register_to_number_16bit(operand1), register_to_number_16bit(operand2)];
    } else {
        // REG, IMM (16-bit immediate)
        let value = parse_number(operand2);
        bytes = [opcode_map_imm[op], register_to_number_16bit(operand1), value & 0xFF, (value >> 8) & 0xFF];
    }

    return {bytes, address_offsets};
}

function assemble_arithmetic(op, operand1, operand2) {
    let bytes = [];
    let address_offsets = [];

    let base_opcodes = {
        'ADD': OP.ADD_REG_IMM,
        'SUB': OP.SUB_REG_IMM,
        'MUL': OP.MUL_REG_IMM,
        'DIV': OP.DIV_REG_IMM,
        'MOD': OP.MOD_REG_IMM
    };

    if (!is_register(operand1)) {
        console.error(`${op} first operand must be a register`);
        return {bytes: [], address_offsets: []};
    }

    let reg_num = register_to_number_8bit(operand1);

    if (is_register(operand2)) {
        // REG, REG
        bytes = [base_opcodes[op] + 2, reg_num, register_to_number_8bit(operand2)];
    } else if (is_indirect(operand2)) {
        // REG, [MEM]
        let addr = parse_number(extract_brackets(operand2));
        bytes = [base_opcodes[op] + 1, reg_num, addr & 0xFF, (addr >> 8) & 0xFF];
        address_offsets = [2];
    } else {
        // REG, IMM
        bytes = [base_opcodes[op], reg_num, parse_number(operand2)];
    }

    return {bytes, address_offsets};
}

function assemble_cmp(operand1, operand2) {
    let bytes = [];
    let address_offsets = [];

    if (!is_register(operand1)) {
        console.error("CMP first operand must be a register");
        return {bytes: [], address_offsets: []};
    }

    let reg_num = register_to_number_8bit(operand1);

    if (is_register(operand2)) {
        bytes = [OP.CMP_REG_REG, reg_num, register_to_number_8bit(operand2)];
    } else if (is_indirect(operand2)) {
        let addr = parse_number(extract_brackets(operand2));
        bytes = [OP.CMP_REG_MEM, reg_num, addr & 0xFF, (addr >> 8) & 0xFF];
        address_offsets = [2];
    } else {
        bytes = [OP.CMP_REG_IMM, reg_num, parse_number(operand2)];
        //console.log(`DEBUG: cmp reg imm as ${bytes}`);
    }

    return {bytes, address_offsets};
}

function assemble_cmpx(operand1, operand2) {
    let bytes = [];
    let address_offsets = [];

    if (!operand1 || !operand2) {
        // Implicit CMPX (AB and XY)
        return {bytes: [OP.CMPX], address_offsets: []};
    }

    if (is_register(operand2)) {
        bytes = [OP.CMPX_REG_REG, register_to_number_16bit(operand1), register_to_number_16bit(operand2)];
    } else {
        let value = parse_number(operand2);
        bytes = [OP.CMPX_REG_IMM, register_to_number_16bit(operand1), value & 0xFF, (value >> 8) & 0xFF];
    }

    return {bytes, address_offsets};
}

/**
 * assemble_program
 *
 * Assembles a line-numbered assembly language program into machine code bytecode.
 *
 * IN:
 *   program - --Object where keys are line numbers and values are instruction strings--
 *             --Example: { 10: "LDA 5", 20: "ADD", 30: "HALT" }--
 *             Example: accepts the result of prep_source()
 *
 * OUT:
 *   Returns an array of bytes representing the assembled machine code
 *
 * SIDE EFFECTS:
 *   Modifies program object to include metadata:
 *     - source: original instruction
 *     - bytes: assembled bytes
 *     - address_offsets: which bytes are addresses (for relocation)
 *     - position: byte offset in assembled program
 *     - label: (if line defines a label) the label name
 *
 *   Also adds program._labels mapping label names to positions
 */
function assemble_program(program) {
    let bytecode = {};  // Sparse map: address → byte array
    let labels = {};
    let position = 0x0000;  // Current assembly position

    // Sort line numbers to process in order
    let line_numbers = Object.keys(program).map(Number).sort((a, b) => a - b);

    for (let line_num of line_numbers) {
        let instruction = program[line_num];
        let line_valid = false;

        //console.log(" *** assembling: " + instruction);

        // Handle .address directive
        if (instruction.toLowerCase().startsWith('.address')) {
            let addr_str = instruction.split(/\s+/)[1];
            position = parse_number(addr_str);
            //console.log(`[Line ${line_num}] .address directive: position set to $${position.toString(16).padStart(4, '0')}`);
            line_valid = true;
        }

        else if (instruction.toLowerCase().startsWith('.bytes')) {
            let bytes_str = instruction.substring(6).trim();
            let byte_values = [];

            let in_quotes = false;
            let current_token = '';
            let escaped = false;

            for (let i = 0; i < bytes_str.length; i++) {
                let char = bytes_str[i];

                if (escaped) {
                    // Handle escape sequences
                    switch(char) {
                        case 'n': current_token += '\n'; break;
                        case 't': current_token += '\t'; break;
                        case 'r': current_token += '\r'; break;
                        case '\\': current_token += '\\'; break;
                        case '"': current_token += '"'; break;
                        default: current_token += char; break;
                    }
                    escaped = false;
                } else if (char === '\\' && in_quotes) {
                    escaped = true;
                } else if (char === '"') {
                    in_quotes = !in_quotes;
                    current_token += char;
                } else if (char === ',' && !in_quotes) {
                    // Process token
                    if (current_token.trim()) {
                        let token = current_token.trim();
                        if (token.startsWith('"') && token.endsWith('"')) {
                            let str = token.slice(1, -1);
                            for (let c of str) {
                                byte_values.push(c.charCodeAt(0));
                            }
                        } else {
                            byte_values.push(parse_number(token));
                        }
                    }
                    current_token = '';
                } else {
                    current_token += char;
                }
            }

            // Process last token
            if (current_token.trim()) {
                let token = current_token.trim();
                if (token.startsWith('"') && token.endsWith('"')) {
                    let str = token.slice(1, -1);
                    for (let c of str) {
                        byte_values.push(c.charCodeAt(0));
                    }
                } else {
                    byte_values.push(parse_number(token));
                }
            }

            // Store bytes
            for (let i = 0; i < byte_values.length; i++) {
                bytecode[position + i] = byte_values[i] & 0xFF;
            }

            position += byte_values.length;
            line_valid = true;
        }
        else if (instruction.startsWith('.word')) {
            let label = instruction.split(/\s+/)[1];

            if (label.startsWith('@')) {
                // Store placeholder
                bytecode[position] = 0xFF;
                bytecode[position + 1] = 0xFF;

                if (!bytecode._label_refs) {
                    bytecode._label_refs = [];
                }
                bytecode._label_refs.push({
                    label: label.substring(1),
                    position: position,
                    offsets: [0],
                    is_relative: false
                });
            } else {
                let value = parse_number(label);
                bytecode[position] = value & 0xFF;
                bytecode[position + 1] = (value >> 8) & 0xFF;
            }

            position += 2;
            line_valid = true;
        }

        // Handle labels
        else if (instruction.endsWith(':')) {
            let label_name = instruction.slice(0, -1);
            labels[label_name] = position;
            //console.log(`[Line ${line_num}] Label '${label_name}' at $${position.toString(16).padStart(4, '0')}`);
            line_valid = true;
        } else {
            // Assemble instruction
            let result = assemble_instruction(instruction);

            if (result.bytes.length > 0) {
                // Store bytes at current position
                if (!bytecode[position]) {
                    bytecode[position] = [];
                }

                // Copy instruction bytes
                for (let i = 0; i < result.bytes.length; i++) {
                    bytecode[position + i] = result.bytes[i];
                }

                // Track label references for this instruction
                if (result.bytes._label) {
                    if (!bytecode._label_refs) {
                        bytecode._label_refs = [];
                    }
                    bytecode._label_refs.push({
                        label: result.bytes._label,
                        position: position,
                        offsets: result.address_offsets,
                        is_relative: result.bytes._is_relative || false
                    });
                }

                //console.log(`[Line ${line_num}] $${position.toString(16).padStart(4, '0')}: ${instruction} → [${result.bytes.join(', ')}]`);

                // Advance position
                position += result.bytes.length;
                line_valid = true;
            }
        }
        if (!line_valid) {
            console.warn(`[Line ${line_num}] WARNING: Invalid or empty instruction: "${instruction}"`);
        }
    }

    return {
        bytecode: bytecode,
        labels: labels
    };
}


/**
 * resolve_labels
 * Resolves all label references to their positions (base address 0)
 *
 * IN: assembled program object (with _labels and _label references)
 * OUT: new program object with labels resolved (no side effects)
 */
function resolve_labels(assembled, fallback_labels = null) {
    let {bytecode, labels} = assembled;

    if (!bytecode._label_refs) {
        return bytecode;  // No labels to resolve
    }

    for (let ref of bytecode._label_refs) {
        let label_addr = labels[ref.label];

        // If not found locally, try fallback labels
        if (label_addr === undefined && fallback_labels) {
            label_addr = fallback_labels[ref.label];
            if (label_addr === undefined){
                label_addr = fallback_labels[ref.label.toLowerCase()];
            }
        }



        if (label_addr === undefined) {
            throw new Error(`Undefined label: ${ref.label}`);
        }

        if (ref.is_relative) {
            // Relative branch - calculate offset from end of instruction
            let instruction_end = ref.position + 2;  // Branch opcode + offset byte
            let offset = label_addr - instruction_end;

            if (offset < -128 || offset > 127) {
                throw new Error(`Branch to ${ref.label} out of range: ${offset}`);
            }

            bytecode[ref.position + 1] = offset & 0xFF;
        } else {
            // Absolute address - write little-endian
            for (let offset of ref.offsets) {
                bytecode[ref.position + offset] = label_addr & 0xFF;
                bytecode[ref.position + offset + 1] = (label_addr >> 8) & 0xFF;
            }
        }
    }

    delete bytecode._label_refs;  // Clean up
    return bytecode;
}

/**
 * load_at
 *
 * loads the assembled and resolved bytes into a memory bank.
 *
 */
function load_at(bank, bytecode) {
    let count = 0;
    for (let addr in bytecode) {
        if (addr === '_label_refs') continue;
        let address = parseInt(addr);
        memory[bank][address] = bytecode[addr];
        count++;
    }

    console.log(` *** load_at(): Loaded ${count} bytes into bank ${bank}`);
}


/**
 * assemble_lines
 * was: assemble_text
 * Assembles assembly source with line numbers in text format
 */
function assemble_lines(text) {
    let lines = text.split('\n');
    let program = {};

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (!line || line.startsWith('//') || line.startsWith(';')) continue;

        const match = line.match(/^(\d+)\s+(.+)$/);
        if (match) {
            const lineNum = parseInt(match[1]);
            let code = match[2].trim();

            // Strip inline comments
            code = strip_comments(code);
            if (!code) continue;  // Skip if only comment

            program[lineNum] = code;
        } else {
            console.error(`ERROR: Line ${i + 1} missing line number: "${line}"`);
        }
    }

    return assemble_program(program);
}

/**
 * assemble_src
 * Takes source text, strips any existing line numbers,
 * then renumbers everything as 10, 20, 30...
 */
function assemble_src(text) {
    let lines = text.split('\n');
    let renumbered_lines = [];
    let line_num = 10;

    for (let line of lines) {
        line = line.trim();

        // Skip completely empty lines
        if (!line) continue;

        // Strip comments FIRST
        line = strip_comments(line);
        if (!line) continue;  // Skip if only comment

        // Check if line starts with a number and strip it
        const match = line.match(/^(\d+)\s+(.+)$/);
        if (match) {
            line = match[2].trim();
        }

        // Add renumbered line
        renumbered_lines.push(`${line_num} ${line}`);
        line_num += 10;
    }

    let renumbered_text = renumbered_lines.join('\n');
    return assemble_lines(renumbered_text);
}

let kernal_labels = {};  // Global variable to store KERNAL labels
function load_and_assemble(filename, callback) {
    fetch(filename)
        .then(response => response.text())
        .then(text => {
            let assembled = assemble_src(text);
            let resolved = resolve_labels(assembled);

            // Save KERNAL labels globally
            kernal_labels = assembled.labels;

            // DEBUG: Show labels
            // useful for writing down kernal address
            console.log("=== LABELS ===");
            for (let label in assembled.labels) {
                console.log(`  ${label}: $${assembled.labels[label].toString(16).padStart(4,'0')}`);
            }

            // Prompt for ROM download
            //if (confirm('Download binary ROM (.bin)?')) {
            //    download_binary_rom(resolved, filename.replace('.sda', '.bin'));
            //}

            //if (confirm('Download source ROM (.sda)?')) {
            //    download_source_rom(resolved, filename.replace('.sda', '_rom.sda'));
            //}

            load_at(0, resolved);

            if (callback) callback();
        });
}

function download_binary_rom(bytecode, filename = 'program.bin') {
    // Find the span of addresses used
    let addresses = Object.keys(bytecode)
        .filter(k => k !== '_label_refs')
        .map(Number)
        .sort((a, b) => a - b);

    if (addresses.length === 0) {
        console.error('No bytes to save');
        return;
    }

    let start_addr = addresses[0];
    let end_addr = addresses[addresses.length - 1];
    let size = end_addr - start_addr + 1;

    // Create binary blob
    let binary = new Uint8Array(size + 4); // +4 for header

    // Write header: start address (16-bit little-endian)
    binary[0] = start_addr & 0xFF;
    binary[1] = (start_addr >> 8) & 0xFF;
    binary[2] = size & 0xFF;
    binary[3] = (size >> 8) & 0xFF;

    // Write program data
    for (let addr of addresses) {
        let offset = addr - start_addr + 4; // +4 for header
        binary[offset] = bytecode[addr];
    }

    // Create download
    let blob = new Blob([binary], { type: 'application/octet-stream' });
    let url = URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    console.log(`Downloaded ${filename}: ${size} bytes at $${start_addr.toString(16).padStart(4,'0')}`);
}

function download_source_rom(bytecode, filename = 'program.sda') {
    let addresses = Object.keys(bytecode)
        .filter(k => k !== '_label_refs')
        .map(Number)
        .sort((a, b) => a - b);

    if (addresses.length === 0) {
        console.error('No bytes to save');
        return;
    }

    let source = '';
    let current_addr = null;
    let byte_buffer = [];

    for (let addr of addresses) {
        // Check if we need a new .address directive
        if (current_addr === null || addr !== current_addr + 1) {
            // Flush any pending bytes
            if (byte_buffer.length > 0) {
                source += format_bytes_line(byte_buffer);
                byte_buffer = [];
            }

            // New address block
            source += `.address $${addr.toString(16).padStart(4,'0').toUpperCase()}\n`;
        }

        byte_buffer.push(bytecode[addr]);
        current_addr = addr;

        // Flush buffer every 16 bytes for readability
        if (byte_buffer.length >= 16) {
            source += format_bytes_line(byte_buffer);
            byte_buffer = [];
        }
    }

    // Flush remaining bytes
    if (byte_buffer.length > 0) {
        source += format_bytes_line(byte_buffer);
    }

    // Create download
    let blob = new Blob([source], { type: 'text/plain' });
    let url = URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    console.log(`Downloaded ${filename}`);
}

function format_bytes_line(bytes) {
    let hex_values = bytes.map(b => `0x${b.toString(16).padStart(2,'0').toUpperCase()}`).join(',');
    return `    .bytes ${hex_values}\n`;
}

// Add a global function to save the last assembled program
let last_assembled_bytecode = null;

function save_last_assembly_as_binary(filename = 'program.bin') {
    if (!last_assembled_bytecode) {
        console.error('No program assembled yet');
        return;
    }
    download_binary_rom(last_assembled_bytecode, filename);
}

function save_last_assembly_as_source(filename = 'program.sda') {
    if (!last_assembled_bytecode) {
        console.error('No program assembled yet');
        return;
    }
    download_source_rom(last_assembled_bytecode, filename);
}
