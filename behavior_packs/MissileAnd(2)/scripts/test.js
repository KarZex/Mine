/*
  =============================================================
  Arena Layer Generator v17 (Asymmetric & Smooth Terrain)
  =============================================================
*/
import { world, system } from "@minecraft/server";

const BLOCK_SETS = {
    JEWEL: { random: ["minecraft:quartz_block", "minecraft:diamond_block", "minecraft:gold_block", "minecraft:lapis_block", "minecraft:emerald_block"] },
    NATURAL: { random: ["minecraft:grass", "minecraft:moss_block", "minecraft:dirt", "minecraft:coarse_dirt", "minecraft:podzol"] },
    RAINBOW: { random: ["minecraft:white_wool", "minecraft:light_blue_wool", "minecraft:magenta_wool", "minecraft:lime_wool", "minecraft:pink_wool", "minecraft:yellow_wool"] }
};

const BLOCK_SET_TYPES = ["JEWEL","NATURAL","RAINBOW"];
const SHAPES = ["CIRCLE","SQUARE","DONUT","ISLAND","STAR"];

// --- ヘルパー関数 ---
function getNoise(x, z, seed) {
    let n = Math.sin(x * 12.9898 + z * 78.233 + seed) * 43758.5453;
    return (n - Math.floor(n));
}

/**
 * 非対称で滑らかな高低差を計算（アメーバ状の起伏）
 */
function getSmoothAsymmetricHeight(x, z, maxH, seed) {
    if (maxH <= 0) return 0;

    // absを外して非対称に。複数の波を合成して四角形っぽさを排除する
    const s = 0.12; // 起伏の大きさ（小さいほどなだらか）
    const n1 = Math.sin(x * s + seed);
    const n2 = Math.cos(z * s * 0.8 + seed * 1.5);
    const n3 = Math.sin((x + z) * s * 0.5 + seed * 0.5);

    const combined = (n1 + n2 + n3) / 3; // -1.0 ~ 1.0
    const normalized = (combined + 1) / 2; // 0.0 ~ 1.0

    return Math.floor(normalized * (maxH + 1));
}

/**
 * 有機的な迷彩インデックス（こちらは模様の対称性を保つか、外すか選べますが今回は非対称に統一）
 */
function getOrganicCamoIndex(x, z, scale, seed, arrayLength) {
    const s = scale || 0.4;
    // ここも非対称にするならx, zのabsを外す
    const val1 = Math.sin(x * s + Math.sin(z * s * 0.5) + seed);
    const val2 = Math.cos(z * s + Math.cos(x * s * 0.5) + seed * 1.2);
    
    const finalSeed = getNoise(Math.floor((val1 + 1) * 10), Math.floor((val2 + 1) * 10), seed);
    return Math.floor(finalSeed * arrayLength);
}

/**
 * メイン生成関数
 */
function buildSmoothArena(player, type, radius, maxH, shape, scale) {
    const dim = player.dimension;
    const pos = player.location;
    const center = { x: Math.floor(pos.x), y: Math.floor(pos.y), z: Math.floor(pos.z) };

    const set = BLOCK_SETS[type] || BLOCK_SETS.JEWEL;
    const seed = Math.random() * 10000;
    const scanArea = Math.ceil(radius * 2);

    player.sendMessage(`§a[Smooth Build] §fType:§e${type} §fMaxH:§e${maxH} §fShape:§e${shape}`);

    for (let x = -scanArea; x <= scanArea; x++) {
        for (let z = -scanArea; z <= scanArea; z++) {
            const dist = Math.sqrt(x * x + z * z);
            const absX = Math.abs(x);
            const absZ = Math.abs(z);
            
            let shouldPlace = false;

            // 形状の判定（外枠自体は対称に保つのが一般的ですが、中身の起伏は非対称になります）
            switch (shape) {
                case "CIRCLE": shouldPlace = dist <= radius; break;
                case "SQUARE": shouldPlace = absX <= radius && absZ <= radius; break;
                case "DONUT":  shouldPlace = dist <= radius && dist >= radius / 2; break;
                case "ISLAND": 
                    const islandNoise = (Math.sin(x * 0.2) + Math.cos(z * 0.2)) * 3;
                    shouldPlace = dist <= (radius - 5 + islandNoise); 
                    break;
                case "STAR":
                    const t1 = (absX * 1.732 + z) <= radius && z >= -radius / 2;
                    const t2 = (absX * 1.732 - z) <= radius && z <= radius / 2;
                    shouldPlace = t1 || t2;
                    break;
            }

            if (shouldPlace) {
                // 滑らかな非対称段差を取得
                const h = getSmoothAsymmetricHeight(x, z, maxH, seed);
                
                // 柄のインデックス（非対称）
                const blockIndex = getOrganicCamoIndex(x, z, scale, seed, set.random.length);
                const blockId = set.random[blockIndex];

                // 設置
                dim.runCommand(`setblock ${center.x + x} ${center.y + h} ${center.z + z} ${blockId}`);
            }
        }
    }
}

// --- コマンド実行 ---
system.afterEvents.scriptEventReceive.subscribe((event) => {
    const args = event.message.split(" ");
    if (event.id === "test:script" && args[0] === "gen") {
        const type = (args[1] || "JEWEL").toUpperCase();
        const radius = parseInt(args[2]) || 20;
        const maxH = parseInt(args[3]) || 2;
        const shape = (args[4] || "CIRCLE").toUpperCase();
        const scale = args[5] ? parseFloat(args[5]) : 0.3;

        system.run(() => buildSmoothArena(event.sourceEntity, type, radius, maxH, shape, scale));
    }
    else if (event.id === "test:script" && args[0] === "random") {
        const type = BLOCK_SET_TYPES[Math.floor(Math.random() * BLOCK_SET_TYPES.length)];
        const radius = args[1] || 20;
        const maxH = Math.floor(Math.random() * 3) + 2; // 2~4の高さ
        const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
        const scale = (Math.random() * 0.4 + 0.1).toFixed(2);

        event.sourceEntity.runCommand(`scriptevent test:script gen ${type} ${radius} ${maxH} ${shape} ${scale}`);
    }
});