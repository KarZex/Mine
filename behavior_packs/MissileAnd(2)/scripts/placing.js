import { world, system, EquipmentSlot,EntityComponentTypes,ItemComponentTypes } from "@minecraft/server"
import { ActionFormData, ModalFormData } from "@minecraft/server-ui"
import { getInventoryItem,isBlockFront,absVector2,Vector3Sub, getVector2E,DistanceVector3 } from "./usefulFunction.js"
import { PlaceableBlocks, blockSeeding, MAX_DISTANCE_Y_UP,MAX_DISTANCE_Y_DOWN, MAX_DISTANCE_Z,breakBlockAnotherId ,getBlockisCollective } from "./config.js"

function getBlockIsntDrop( player,DropRuleId, blockId ){
	let Str = player.getDynamicProperty(`autobreak:blockIsntDrop${DropRuleId}`)
	if( Str == undefined ){
		Str = `minecraft:stone;minecraft:dirt;minecraft:grass;minecraft:sand;minecraft:gravel;minecraft:leaves`
	}
	const blocks = Str.split(`;`);
	if( blocks.includes(blockId) ){
		return false
	}
	else{
		return true
	}
}

function setDistance( player,forward,back,left,right ){
	if( -45 < player.getRotation().y && player.getRotation().y < 45  ){
		//south z+
		//west,east,north,south
		return [ right,left,back,forward,0 ];
	}
	else if( 45 < player.getRotation().y && player.getRotation().y < 135  ){
		//west x-
		//west,east,north,south
		return [ forward,back,right,left,90 ];
	}
	else if( -135 > player.getRotation().y || player.getRotation().y > 135  ){
		//north z-
		//west,east,north,south
		return [ left,right,forward,back,180 ];
	}
	else if( -135 < player.getRotation().y && player.getRotation().y < -45  ){
		//east x+
		//west,east,north,south
		return [ back,forward,left,right,-90 ];
	}
}

function getBreakingUp( O,P,view ){
	const viewDirection = view[4];
	if( viewDirection == 0 ){
		return { x:P.x,y:P.y + ( P.z - O.z ),z:P.z };
	}
	else if( viewDirection == 90 ){
		return { x:P.x,y:P.y - ( P.x - O.x ),z:P.z };
	}
	else if( viewDirection == 180 ){
		return { x:P.x,y:P.y - ( P.z - O.z ),z:P.z };
	}
	else if( viewDirection == -90 ){
		return { x:P.x,y:P.y + ( P.x - O.x ),z:P.z };
	}
	else{
		return P
	}
}

function getBreakingDown( O,P,view ){
	const viewDirection = view[4];
	if( viewDirection == 0 ){
		return { x:P.x,y:P.y - ( P.z - O.z ),z:P.z };
	}
	else if( viewDirection == 90 ){
		return { x:P.x,y:P.y + ( P.x - O.x ),z:P.z };
	}
	else if( viewDirection == 180 ){
		return { x:P.x,y:P.y + ( P.z - O.z ),z:P.z };
	}
	else if( viewDirection == -90 ){
		return { x:P.x,y:P.y - ( P.x - O.x ),z:P.z };
	}
	else{
		return P
	}
}

function profileUporDown( profile0 ){  
	if( profile0 == 1 ){
		return 0;
	}
	else if( profile0 == 2 ){
		return -1;
	}
	else if( profile0 == 3 ){
		return 1;
	}
	else{
		return 0;
	}
}

function getorigin2( O,P,view,profile0 ){
	const viewDirection = view[4];
	if( viewDirection == 0 ){
		//world.sendMessage(`view z+ ${}`)
		return ( P.z - O.z ) * profileUporDown(profile0);
	}
	else if( viewDirection == 90 ){
		return -( P.x - O.x ) * profileUporDown(profile0);
	}
	else if( viewDirection == 180 ){
		return -( P.z - O.z ) * profileUporDown(profile0);
	}
	else if( viewDirection == -90 ){
		return ( P.x - O.x ) * profileUporDown(profile0);
	}
	else{
		return 0;
	}
}

function damageing(player){
	const toolDamage = player.getDynamicProperty(`autobreak:toolldamage`);
	try{
		const gun = player.getComponent(EntityComponentTypes.Equippable).getEquipment(EquipmentSlot.Mainhand);
		const dmgCom = gun.getComponent(ItemComponentTypes.Durability);
		const ench = gun.getComponent(ItemComponentTypes.Enchantable);
		if( dmgCom.maxDurability - dmgCom.damage > 0 ){
			if( ench.hasEnchantment(`minecraft:unbreaking`) ){
				const level = ench.getEnchantment(`minecraft:unbreaking`).level;
				if( Math.random() < 1/level ){
					dmgCom.damage = dmgCom.damage + 1;
					player.getComponent("minecraft:inventory").container.setItem(player.selectedSlotIndex, gun);
				}
			}
			else{
				dmgCom.damage = dmgCom.damage + 1;
				player.getComponent("minecraft:inventory").container.setItem(player.selectedSlotIndex, gun);
			}
			return true
		}
		else{
			return false
		}
	}
	catch{
		return false
	}
}

async function placingBlock(player,blockId,location,view,profile,states){
	//world.sendMessage(`${Number(profile[1])}`)
	const dim = world.getDimension(player.dimension.id);
	//world.sendMessage(`${blockId} vs ${dim.getBlock(location).typeId}`);
	//player.runCommand(`loot give @s mine ${location.x} ${location.y} ${location.z} mainhand`);
	const targetBlockId = dim.getBlock(location).typeId;
	const O = player.getDynamicProperty(`autobreak:origBlock`);
	const d = Number(profile[9]);
	//world.sendMessage(`${dim.getBlock(location).below(1).typeId}`);
	//world.sendMessage(`${profile} ${Number(profile[8])}`)
	if( !PlaceableBlocks.includes(targetBlockId) ){ return; }
	if( Number(profile[8]) == 1 && (PlaceableBlocks.includes(dim.getBlock(location).below(1).typeId) || dim.getBlock(location).below(1).typeId == blockId) ){ return; }
	if( player.getDynamicProperty(`autobreak:placedBlocks`) >= Number(profile[1]) ){ return; }
	//world.sendMessage(`${dim.getBlock(location).canBeDestroyedByLiquidSpread("Water")}`);
	//world.sendMessage(`${location.x},${location.y},${location.z},xz${getorigin2( O,location,view,Number(profile[0]) )},MIN${O.y - Number(profile[5]) + getorigin2( O,location,view,Number(profile[0]) )},MAX${O.y + Number(profile[4]) + getorigin2( O,location,view,Number(profile[0]) )}`)
	if(
		location.x < O.x - view[0] ||
		location.x > O.x + view[1] ||
		location.y < O.y - Number(profile[5]) + getorigin2( O,location,view,Number(profile[0]) ) ||
		location.y > O.y + Number(profile[4]) + getorigin2( O,location,view,Number(profile[0]) ) ||
		location.z < O.z - view[2] ||
		location.z > O.z + view[3] 
	){ return; }
	if( getInventoryItem(player,blockId) == 0 ){ return; }
	else{ player.runCommand(`clear @s ${blockId} 0 1`); }
	//player.runCommand(`loot give @s mine ${location.x} ${location.y} ${location.z} mainhand`);
	player.setDynamicProperty(`autobreak:placedBlocks`,player.getDynamicProperty(`autobreak:placedBlocks`)+1);
	dim.setBlockType(location, blockId);
	dim.setBlockPermutation(location,states);
	await system.waitTicks(1);
	//world.sendMessage(`${location.x},${location.y},${location.z}`);
	//dim.setBlockType({x:location.x+2,y:location.y,z:location.z}, "minecraft:emerald_block");
	for( let i = -1; i < 2; i++ ){
		for( let j = -1; j < 2; j++ ){
			for( let k = -1; k < 2; k++ ){
				const P = {x:location.x+i*(1+d),y:location.y+j*(1+d),z:location.z+k*(1+d)};
				placingBlock(player,blockId,P,view,profile,states);
				//dim.setBlockType({x:P.x+1,y:P.y,z:P.z}, "minecraft:bedrock");
				//world.sendMessage(`${P.x},${P.y},${P.z},,${location.y+j},,${getorigin2( O,location,view,Number(profile[0]) )}`)
				/*
				if( Number(profile[0]) == 1 ){
					breakBlockloot(player,blockId,P,view,profile);
				}
				else if( Number(profile[0]) == 2 ){
					breakBlockloot(player,blockId,getBreakingDown(O,P,view),view,profile);
				}
				else if( Number(profile[0]) == 3 ){
					breakBlockloot(player,blockId,getBreakingUp(O,P,view),view,profile);
				}
				*/
				//await system.waitTicks(1);
			}
		}
	}
}

world.afterEvents.playerPlaceBlock.subscribe( async ev => {
	if( ev.player.isSneaking && ev.player.getDynamicProperty("autobreak:place_currentProfileIndex") > 0 ){ 
		const location = ev.block.location;
		const blockId = ev.block.typeId;
		const player = ev.player;
		const origBlock = ev.block.location;
		let profileId = player.getDynamicProperty("autobreak:place_currentProfileIndex");
		const profileStr = player.getDynamicProperty(`autobreak:place_profile${profileId}`);
		//world.sendMessage(`${profileStr}`)
		const profile = profileStr.split(`,`);
		//world.sendMessage(`${profile[1]}`)
		//world.sendMessage(`${profile[13]}`);
		//world.sendMessage(`${ev.block.canBeDestroyedByLiquidSpread("Water")}`);
		try{
			const offGun = player.getComponent(EntityComponentTypes.Equippable).getEquipmentSlot(EquipmentSlot.Offhand);
			if( offGun.typeId != "zex:allowdipo" ){ return false; }

		}catch{  return false; }
		if( Number(profile[0]) > 0 ){
			const states = ev.block.permutation;
			const d = Number(profile[9]);
			//world.sendMessage(`[${Object.keys(a)}],[${Object.values(a)}]`);
			player.setDynamicProperty(`autobreak:placedBlocks`,1);
			player.setDynamicProperty(`autobreak:origBlock`,origBlock);
			//world.sendMessage(`${player.getRotation().y}`);
			const view = setDistance(player,Number(profile[6]),Number(profile[7]),Number(profile[3]),Number(profile[2]));
			//world.sendMessage(`Breaking block at ${location.x}, ${location.y}, ${location.z}`);
			system.runTimeout( async () => {
				for( let i = -1; i < 2; i++ ){
					for( let j = -1; j < 2; j++ ){
						for( let k = -1; k < 2; k++ ){
							const P = {x:location.x+i*(1+d),y:location.y+j*(1+d),z:location.z+k*(1+d)};
							//player.dimension.setBlockType({x:P.x+1,y:P.y,z:P.z}, "minecraft:bedrock");
							placingBlock(player,blockId,P,view,profile,states);
							//world.sendMessage(`${P.x},${P.y},${P.z},,${location.y+j},,${getorigin2( O,location,view,Number(profile[0]) )}`)
						}
					}
				}
			} )
		}
	}
});