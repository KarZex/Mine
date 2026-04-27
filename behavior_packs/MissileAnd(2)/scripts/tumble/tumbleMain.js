import { world, system } from "@minecraft/server";
import "./test.js";
import { buildFinalArena } from "./test.js";
import { TUMBLE_POS,BLOCK_SETS,BLOCK_SET_TYPES,SHAPES } from "./tumbleData.js";


world.afterEvents.entityHitBlock.subscribe( e => {
    const player = e.damagingEntity;
    const block = e.hitBlock;
    const location = block.location;
    if( player.typeId == "minecraft:player" && 
        -40 <= location.x - TUMBLE_POS.x && location.x - TUMBLE_POS.x <= 40 &&
        35 <= location.y - TUMBLE_POS.y && location.y - TUMBLE_POS.y <= 90 &&
        -40 <= location.z - TUMBLE_POS.z && location.z - TUMBLE_POS.z <= 40
     ){
        world.getDimension("overworld").runCommand(`fill ${location.x} ${location.y} ${location.z} ${location.x} ${location.y} ${location.z} minecraft:air destroy`);
    }
})


system.afterEvents.scriptEventReceive.subscribe( async e => {
    if( e.id == "tumble:start" ){
        //loading
        world.getDimension("overworld").runCommand(`tickingarea add circle ${TUMBLE_POS.x} ${TUMBLE_POS.y} ${TUMBLE_POS.z} 3 tumble true`);
        
        await system.waitTicks(20);
        //clear arena
        for(let i = 0; i < 4; i++){
            world.getDimension("overworld").runCommand(`fill ${TUMBLE_POS.x} ${35+i*16} ${TUMBLE_POS.z} ${TUMBLE_POS.x+40} ${35+(i+1)*16} ${TUMBLE_POS.z+40} air`)
            world.getDimension("overworld").runCommand(`fill ${TUMBLE_POS.x} ${35+i*16} ${TUMBLE_POS.z} ${TUMBLE_POS.x-40} ${35+(i+1)*16} ${TUMBLE_POS.z+40} air`)
            world.getDimension("overworld").runCommand(`fill ${TUMBLE_POS.x} ${35+i*16} ${TUMBLE_POS.z} ${TUMBLE_POS.x+40} ${35+(i+1)*16} ${TUMBLE_POS.z-40} air`)
            world.getDimension("overworld").runCommand(`fill ${TUMBLE_POS.x} ${35+i*16} ${TUMBLE_POS.z} ${TUMBLE_POS.x-40} ${35+(i+1)*16} ${TUMBLE_POS.z-40} air`)
        }
        await system.waitTicks(20);

        //generate arena 3 times
        for(let i=0; i<3; i++){
            let pos = {
                x:TUMBLE_POS.x,
                y:64 - i*12,
                z:TUMBLE_POS.z
            }
            const type = BLOCK_SET_TYPES[Math.floor(Math.random() * BLOCK_SET_TYPES.length)];
            const radius = 16 + i * 8;
            const innerRadius = Math.floor(Math.random() * 2) * radius / 4; // 半径の0%か50%のどちらかをランダムに内径とする
            const outerRadius = radius - innerRadius;
            const maxH = Math.floor(Math.random() * 3) + 2;
            const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
            const scale = (Math.random() * 0.3 + 0.1).toFixed(2);
            const trapMode = Number(Math.random() < 0.5);
            const terrainMode = Math.floor(Math.random() * 3);
            const freq = (Math.random() * 0.2 + 0.2 + (0.2 * terrainMode)).toFixed(2);
            buildFinalArena(world.getDimension("overworld"), type, radius, innerRadius, maxH, shape, scale, trapMode, terrainMode, freq, pos);
            await system.waitTicks(20);
        }

        world.getDimension("overworld").runCommand(`tickingarea remove tumble`);

    }
})

