/*
  =============================================================
  Arena Layer Generator v32 (Context-Aware Traps & Falling Blocks)
  =============================================================
*/
import { world, system } from "@minecraft/server";
import { BLOCK_SETS, TRAP_BLOCK_POOL } from "./tumbleData.js";

// --- ヘルパー関数 ---
function getNoise(x, z, seed) {
    let n = Math.sin(x * 12.9898 + z * 78.233 + seed) * 43758.5453;
    return (n - Math.floor(n));
}

function getShapeBoundary(x, z, shape) {
    const absX = Math.abs(x);
    const absZ = Math.abs(z);
    switch (shape) {
        case "SQUARE": return Math.max(absX, absZ);
        case "STAR":
            const t1 = (absX * 1.732 + z);
            const t2 = (absX * 1.732 - z);
            return Math.max(t1, t2, absZ * 2) / 1.1;
        case "CIRCLE":
        case "ISLAND":
        default: return Math.sqrt(x * x + z * z);
    }
}

function getAdvancedHeight(x, z, maxH, seed, mode, freq, radius, innerRadius, shape, boundary) {
    if (maxH <= 0) return 0;
    const f = freq || 0.15;
    let n = 0;
    if (mode === 2) {
        const range = radius - innerRadius;
        const normDist = range > 0 ? (boundary - innerRadius) / range : 0;
        const wave = Math.sin(normDist * Math.PI * 2.5 + seed); 
        n = (normDist * 1.2) + (wave * 0.4); 
        if (n > 1) n = 1; else if (n < -1) n = -1;
    } else if (mode === 1) {
        n = (Math.sin(x * f + seed) + Math.cos(z * f * 0.7 + seed) + Math.sin((x + z) * f * 1.5 + seed * 0.5)) / 3;
    } else {
        n = (Math.sin(x * f + seed) + Math.cos(z * f * 0.7 + seed)) / 2;
    }
    return Math.floor(((n + 1) / 2) * (maxH + 1));
}

function getOrganicCamoIndex(x, z, scale, seed, arrayLength) {
    const s = scale || 0.3;
    const noiseX = x * s + Math.sin(z * s * 0.8 + seed);
    const noiseZ = z * s + Math.cos(x * s * 0.8 + seed * 1.1);
    const patchSeed = getNoise(Math.floor(noiseX), Math.floor(noiseZ), seed);
    return Math.floor(patchSeed * arrayLength);
}

function placeDecoration(dim, x, y, z, blockId) {
    const topY = y + 1;
    if (blockId === "minecraft:grass_block" || blockId === "minecraft:dirt") {
        if (Math.random() < 0.2) dim.runCommand(`setblock ${x} ${topY} ${z} short_grass`);
    } else if (blockId === "minecraft:podzol") {
        dim.runCommand(`setblock ${x} ${topY} ${z} tall_grass ["upper_block_bit"=false]`);
    } else if (blockId === "minecraft:soul_sand") {
        dim.runCommand(`setblock ${x} ${topY} ${z} minecraft:nether_wart ["age"=3]`);
    }
}

/**
 * メイン生成関数
 */
export function buildFinalArena(dim, type, radius, innerRadius, maxH, shape, scale, trapMode, terrainMode, freq, center) {
    const set = BLOCK_SETS[type] || BLOCK_SETS.JEWEL;
    const seed = Math.random() * 10000;
    const scanArea = Math.ceil(radius * 1.2);

    // セット内からTNT用落下ブロックを取得
    const selectedFalling = set.trap; 
    // 外部プールから今回の単体トラップブロックを1つ選定
    const selectedSpecialTrap = TRAP_BLOCK_POOL[Math.floor(Math.random() * TRAP_BLOCK_POOL.length)];
    
    // activeBlockPool の構築
    // trapModeがONなら、[通常ランダム + セット内TNT用ブロック + 外部単体トラップ]
    const activeBlockPool = trapMode ? [...set.random, selectedFalling, selectedSpecialTrap] : [...set.random];

    console.warn(`[Build v32] TNT-Falling: ${selectedFalling}, Special-Trap: ${selectedSpecialTrap}`);

    for (let x = -scanArea; x <= scanArea; x++) {
        for (let z = -scanArea; z <= scanArea; z++) {
            const boundary = getShapeBoundary(x, z, shape);
            const shouldPlace = (boundary <= radius && boundary >= innerRadius);

            if (shouldPlace) {
                const h = getAdvancedHeight(x, z, maxH, seed, terrainMode, freq, radius, innerRadius, shape, boundary);
                const blockIndex = getOrganicCamoIndex(x, z, scale, seed, activeBlockPool.length);
                const blockId = activeBlockPool[blockIndex];
                const targetY = center.y + h;

                if (trapMode && blockId === selectedFalling) {
                    // --- TNTトラップ（BLOCK_SETSのtrapプロパティを使用） ---
                    dim.runCommand(`setblock ${center.x + x} ${targetY - 1} ${center.z + z} minecraft:tnt`);
                    dim.runCommand(`setblock ${center.x + x} ${targetY} ${center.z + z} ${blockId}`);
                    dim.runCommand(`setblock ${center.x + x} ${targetY + 1} ${center.z + z} minecraft:stone_pressure_plate`);
                } else {
                    // --- 通常設置（TRAP_BLOCK_POOLから選ばれた特殊ブロックもここを通る） ---
                    dim.runCommand(`setblock ${center.x + x} ${targetY} ${center.z + z} ${blockId}`);
                    placeDecoration(dim, center.x + x, targetY, center.z + z, blockId);
                }
            }
        }
    }
}

// --- コマンド受信部は変更なし ---
system.afterEvents.scriptEventReceive.subscribe((event) => {
    const args = event.message.split(" ");
    if (event.id === "test:script" && args[0] === "gen") {
        const type = (args[1] || "JEWEL").toUpperCase();
        const radius = parseInt(args[2]) || 20;
        const innerRadius = parseInt(args[3]) || 0;
        const maxH = parseInt(args[4]) || 0;
        const shape = (args[5] || "CIRCLE").toUpperCase();
        const scale = args[6] ? parseFloat(args[6]) : 0.3;
        const trapMode = args[7] === "1";
        const terrainMode = parseInt(args[8]) || 0;
        const freq = args[9] ? parseFloat(args[9]) : 0.15;

        let targetPos;
        if (args[10] !== undefined && args[11] !== undefined && args[12] !== undefined) {
            targetPos = { x: Math.floor(parseFloat(args[10])), y: Math.floor(parseFloat(args[11])), z: Math.floor(parseFloat(args[12])) };
        } else {
            const pos = event.sourceEntity ? event.sourceEntity.location : { x: 0, y: 0, z: 0 };
            targetPos = { x: Math.floor(pos.x), y: Math.floor(pos.y), z: Math.floor(pos.z) };
        }

        const dim = event.sourceEntity ? event.sourceEntity.dimension : world.getDimension("overworld");
        system.run(() => buildFinalArena(dim, type, radius, innerRadius, maxH, shape, scale, trapMode, terrainMode, freq, targetPos));
    }
});