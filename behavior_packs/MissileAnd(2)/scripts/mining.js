import { world, system, EquipmentSlot,EntityComponentTypes } from "@minecraft/server"
import { ActionFormData, ModalFormData } from "@minecraft/server-ui"
import { isBlockUnder,isBlockFront,absVector2,Vector3Sub, getVector2E,DistanceVector3 } from "./usefulFunction.js"
import { MAX_BLOCKS, MAX_DISTANCE_X, MAX_DISTANCE_Y_UP,MAX_DISTANCE_Y_DOWN, MAX_DISTANCE_Z,breakBlockAnotherId ,getBlockisCollective } from "./config.js"

function setDistance( player,forward,back,left,right ){
	if( -45 < player.getRotation().y && player.getRotation().y < 45  ){
		//west,east,north,south
		return [ left,right,back,forward ];
	}
	else if( 45 < player.getRotation().y && player.getRotation().y < 135  ){
		//west,east,north,south
		return [ forward,back,right,left ];
	}
	else if( -135 > player.getRotation().y || player.getRotation().y > 135  ){
		//west,east,north,south
		return [ right,left,forward,back ];
	}
	else if( -135 < player.getRotation().y && player.getRotation().y < -45  ){
		//west,east,north,south
		return [ back,forward,left,right ];
	}
}

async function breakBlockloot(player,blockId,location,view){
	const dim = world.getDimension(player.dimension.id);
	//world.sendMessage(`${blockId} vs ${dim.getBlock(location).typeId}`);
	//player.runCommand(`loot give @s mine ${location.x} ${location.y} ${location.z} mainhand`);
	const targetBlockId = dim.getBlock(location).typeId;
	
	const breakIds = breakBlockAnotherId(blockId,targetBlockId);
	const profile = String(player.getDynamicProperty(`autobreak:currentProfile`)).split(`,`);
	if( !breakIds || targetBlockId == "minecraft:air" ){ return; }
	if( player.getDynamicProperty(`autobreak:brokenBlocks`) >= Number(profile[1]) ){ return; }

	if(   
		location.x < player.getDynamicProperty(`autobreak:origBlock`).x - view[0] ||
		location.x > player.getDynamicProperty(`autobreak:origBlock`).x + view[1] ||
		location.y < player.getDynamicProperty(`autobreak:origBlock`).y - Number(profile[5]) ||
		location.y > player.getDynamicProperty(`autobreak:origBlock`).y + Number(profile[4]) ||
		location.z < player.getDynamicProperty(`autobreak:origBlock`).z - view[2] ||
		location.z > player.getDynamicProperty(`autobreak:origBlock`).z + view[3] 
	){ return; }

	player.runCommand(`loot give @s mine ${location.x} ${location.y} ${location.z} mainhand`);
	dim.setBlockType(location, "minecraft:air");
	player.setDynamicProperty(`autobreak:brokenBlocks`,player.getDynamicProperty(`autobreak:brokenBlocks`)+1);
	await system.waitTicks(1);
	for( let i = -1; i < 2; i++ ){
		for( let j = -1; j < 2; j++ ){
			for( let k = -1; k < 2; k++ ){
				breakBlockloot(player,blockId,{x:location.x+i,y:location.y+j,z:location.z+k},view);
				//await system.waitTicks(1);
			}
		}
	}
}

world.beforeEvents.playerBreakBlock.subscribe(ev => {
	if( ev.player.isSneaking && ev.player.getDynamicProperty("autobreak:currentProfileIndex") > 0 ){ 
		const location = ev.block.location;
		const blockId = ev.block.typeId;
		const player = ev.player;
		const origBlock = ev.block.location;
		const profile = player.getDynamicProperty(`autobreak:currentProfile`).split(`,`);
		if( profile[0] == `true` ){
			player.setDynamicProperty(`autobreak:brokenBlocks`,0);
			player.setDynamicProperty(`autobreak:origBlock`,origBlock);
			world.sendMessage(`${player.getRotation().y}`);
			const view = setDistance(player,Number(profile[6]),Number(profile[7]),Number(profile[3]),Number(profile[2]));
			//print(`Breaking block at ${location.x}, ${location.y}, ${location.z}`);
			system.runTimeout( async () => {
				for( let i = -1; i < 2; i++ ){
					for( let j = -1; j < 2; j++ ){
						for( let k = -1; k < 2; k++ ){
							breakBlockloot(player,blockId,{x:location.x+i,y:location.y+j,z:location.z+k},view);
						}
					}
				}
			} )
		}
	}
});