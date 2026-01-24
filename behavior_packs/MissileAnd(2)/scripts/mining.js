import { world, system, EquipmentSlot,EntityComponentTypes,ItemComponentTypes } from "@minecraft/server"
import { ActionFormData, ModalFormData } from "@minecraft/server-ui"
import { isBlockUnder,isBlockFront,absVector2,Vector3Sub, getVector2E,DistanceVector3 } from "./usefulFunction.js"
import { NoBreakBlocks, blockSeeding, MAX_DISTANCE_Y_UP,MAX_DISTANCE_Y_DOWN, MAX_DISTANCE_Z,breakBlockAnotherId ,getBlockisCollective } from "./config.js"

function blockDestroyTool( item,block ){
	if( 
		block.hasTag(`minecraft:stone_tier_destructible`) && 
		!item.hasTag(`minecraft:stone_tier`) && 
		!item.hasTag(`minecraft:iron_tier`) && 
		!item.hasTag(`minecraft:diamond_tier`) && 
		!item.hasTag(`minecraft:netherite_tier`) 
	){ return false; }
	if( 
		block.hasTag(`minecraft:iron_tier_destructible`) && 
		!item.hasTag(`minecraft:iron_tier`) && 
		!item.hasTag(`minecraft:diamond_tier`) && 
		!item.hasTag(`minecraft:netherite_tier`) 
	){ return false; }
	if( 
		block.hasTag(`minecraft:diamond_tier_destructible`) && 
		!item.hasTag(`minecraft:diamond_tier`) && 
		!item.hasTag(`minecraft:netherite_tier`) 
	){ return false; }
	if( 
		block.hasTag(`minecraft:netherite_tier_destructible`) && 
		!item.hasTag(`minecraft:netherite_tier`) 
	){ return false; }
	if( block.hasTag(`minecraft:is_pickaxe_item_destructible`) && !item.hasTag(`minecraft:is_pickaxe`) ){ return false; }
	if( block.hasTag(`minecraft:is_axe_item_destructible`) && !item.hasTag(`minecraft:is_axe`) ){ return false; }
	if( block.hasTag(`minecraft:is_shovel_item_destructible`) && !item.hasTag(`minecraft:is_shovel`) ){ return false; }
	if( block.hasTag(`minecraft:is_shears_item_destructible`) && !item.hasTag(`minecraft:is_shears`) ){ return false; }
	if( block.hasTag(`minecraft:is_sword_item_destructible`) && !item.hasTag(`minecraft:is_sword`) && !item.hasTag(`minecraft:is_shears`) ){ return false; }
	if( !block.typeId.includes("leaves") && !block.typeId.includes("wart_block") && block.hasTag(`minecraft:is_hoe_item_destructible`) && !item.hasTag(`minecraft:is_hoe`) ){ return false; }
	return true;
}

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
	//const toolDamage = player.getDynamicProperty(`autobreak:toolldamage`);
	if( player.getGameMode() == "Creative" || !world.getDynamicProperty(`autobreak:use_item`) ){
		return true;
	}
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

async function breakBlockloot(player,blockId,location,view,profile,item){
	//world.sendMessage(`${Number(profile[1])}`)
	const dim = world.getDimension(player.dimension.id);
	//world.sendMessage(`${blockId} vs ${dim.getBlock(location).typeId}`);
	//player.runCommand(`loot give @s mine ${location.x} ${location.y} ${location.z} mainhand`);
	const targetBlockId = dim.getBlock(location).typeId;
	const O = player.getDynamicProperty(`autobreak:origBlock`);
	//world.sendMessage(`${Boolean((profile[9]) == `0`)}`)
	const breakIds = breakBlockAnotherId(blockId,targetBlockId,Boolean((profile[9]) == `0`));
	//world.sendMessage(`${Boolean(profile[13])}`);
	const blockTags = dim.getBlock(location).getTags();
	if( ( Number(profile[11]) == 0 && !breakIds ) || NoBreakBlocks.includes(targetBlockId) ){  return; }
	if( player.getDynamicProperty(`autobreak:brokenBlocks`) >= Number(profile[1]) ){ return; }
	if( world.getDynamicProperty(`autobreak:use_tool`) && !blockDestroyTool(item,dim.getBlock(location)) ){ return; }
	//world.sendMessage(`${location.x},${location.y},${location.z},xz${getorigin2( O,location,view,Number(profile[0]) )},MIN${O.y - Number(profile[5]) + getorigin2( O,location,view,Number(profile[0]) )},MAX${O.y + Number(profile[4]) + getorigin2( O,location,view,Number(profile[0]) )}`)
	if(
		location.x < O.x - view[0] ||
		location.x > O.x + view[1] ||
		location.y < O.y - Number(profile[5]) + getorigin2( O,location,view,Number(profile[0]) ) ||
		location.y > O.y + Number(profile[4]) + getorigin2( O,location,view,Number(profile[0]) ) ||
		location.z < O.z - view[2] ||
		location.z > O.z + view[3] 
	){ return; }
	if( !damageing(player) ){ return; }
	//player.runCommand(`loot give @s mine ${location.x} ${location.y} ${location.z} mainhand`);
	if( profile[8] == 0 || ( getBlockIsntDrop(player,Number(profile[8]),targetBlockId) )  ){
		player.runCommand(`loot spawn ${player.location.x} ${player.location.y} ${player.location.z} mine ${location.x} ${location.y} ${location.z} mainhand`);
	}
	player.setDynamicProperty(`autobreak:brokenBlocks`,player.getDynamicProperty(`autobreak:brokenBlocks`)+1);
	dim.setBlockType(location, "minecraft:air");
	if( Number(profile[10]) == 1 ){ blockSeeding(targetBlockId,dim.getBlock(location).below(1),player); }
	await system.waitTicks(1);
	//world.sendMessage(`${location.x},${location.y},${location.z}`);
	//dim.setBlockType({x:location.x+2,y:location.y,z:location.z}, "minecraft:emerald_block");
	for( let i = -1; i < 2; i++ ){
		for( let j = -1; j < 2; j++ ){
			for( let k = -1; k < 2; k++ ){
				const P = {x:location.x+i,y:location.y+j,z:location.z+k};
				breakBlockloot(player,blockId,P,view,profile,item);
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

world.beforeEvents.playerBreakBlock.subscribe( async ev => {
	if( ev.player.isSneaking && ev.player.getDynamicProperty("autobreak:currentProfileIndex") > 0 ){ 
		const location = ev.block.location;
		const blockId = ev.block.typeId;
		const player = ev.player;
		const origBlock = ev.block.location;
		let item = undefined;
		let profileId = player.getDynamicProperty("autobreak:currentProfileIndex");
		//world.sendMessage(`Blocktags:${ev.block.getTags()}`)
		/*
		try{
			const gun = player.getComponent(EntityComponentTypes.Equippable).getEquipmentSlot(EquipmentSlot.Mainhand);
			if( gun.getDynamicProperty("autobreak:currentProfile") != undefined ){
				profileId = gun.getDynamicProperty("autobreak:currentProfileIndex");
			}
		}catch{}
		*/
		const profileStr = player.getDynamicProperty(`autobreak:profile${profileId}`);
		//world.sendMessage(`${profileStr}`)
		const profile = profileStr.split(`,`);
		//world.sendMessage(`${profile[1]}`)
		//world.sendMessage(`${profile[13]}`);
		//world.sendMessage(`${Boolean(profile[13])}`);
		if( Number(profile[0]) > 0 ){
			try{
				const gun = player.getComponent(EntityComponentTypes.Equippable).getEquipment(EquipmentSlot.Mainhand);
				const dmgCom = gun.getComponent(ItemComponentTypes.Durability);
				if( dmgCom.damage == undefined ){
					return false
				}
				else{
					//world.sendMessage(`itemtags:${gun.getTags()}`)
					item = gun;
					
				}
			}catch{ return false }
			player.setDynamicProperty(`autobreak:brokenBlocks`,1);
			player.setDynamicProperty(`autobreak:origBlock`,origBlock);
			//world.sendMessage(`${player.getRotation().y}`);
			const view = setDistance(player,Number(profile[6]),Number(profile[7]),Number(profile[3]),Number(profile[2]));
			//world.sendMessage(`Breaking block at ${location.x}, ${location.y}, ${location.z}`);
			if( Number(profile[10]) == 1 ){ blockSeeding(blockId,ev.block.below(1),player); }
			system.runTimeout( async () => {
				for( let i = -1; i < 2; i++ ){
					for( let j = -1; j < 2; j++ ){
						for( let k = -1; k < 2; k++ ){
							const P = {x:location.x+i,y:location.y+j,z:location.z+k};
							//player.dimension.setBlockType({x:P.x+1,y:P.y,z:P.z}, "minecraft:bedrock");
							breakBlockloot(player,blockId,P,view,profile,item);
							//world.sendMessage(`${P.x},${P.y},${P.z},,${location.y+j},,${getorigin2( O,location,view,Number(profile[0]) )}`)
						}
					}
				}
			} )
		}
	}
});