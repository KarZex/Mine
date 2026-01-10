import { world, system, EquipmentSlot,EntityComponentTypes } from "@minecraft/server"
import { ActionFormData, ModalFormData } from "@minecraft/server-ui"
import { isBlockUnder,isBlockFront,absVector2,Vector3Sub, getVector2E,DistanceVector3 } from "./usefulFunction.js"
import "./mining.js"
import "./form.js"

async function modeChange(player) {
	const mode = player.getDynamicProperty("autobreak:currentProfileIndex");
	const max = player.getDynamicProperty("autobreak:profile_num") +1;
	if( player.getDynamicProperty("autobreak:mode") == undefined ){
		player.setDynamicProperty("autobreak:mode",0);
	}
	let newmode = ((mode+1)%max);
	while( player.getDynamicProperty(`autobreak:profile${newmode}_disable`) == false ){
		newmode = ((newmode+1)%max);
	}
	player.setDynamicProperty("autobreak:currentProfileIndex",newmode);
	player.setDynamicProperty("autobreak:currentProfile",player.getDynamicProperty(`autobreak:profile${newmode}`));
	player.sendMessage(`${player.getDynamicProperty(`autobreak:profile${newmode}`)}`);
	player.sendMessage(`${player.getDynamicProperty(`autobreak:currentProfile`)}`);
	if( newmode == 0 ){
		player.sendMessage("AutoBreaking Mode: §c0,Disabled");
	}
	else{
		player.sendMessage(`AutoBreaking Mode: ${player.getDynamicProperty(`autobreak:profile${newmode}_name`)}`);
	}
}
async function doubleSneak(player) {
	let i = 0;
	player.addTag("doubleSneakCheck");
	while( true ){
		if( i <= 5 && !player.isSneaking ){
			break;
		}
		else if( i > 5 && !player.isSneaking ){
			player.removeTag("doubleSneakCheck");
			return false;
		}
		await system.waitTicks(1);
		i++;
	}
	i = 0;
	while( true ){
		if( player.isSneaking ){
			break;
		}
		else if( i > 6 ){
			player.removeTag("doubleSneakCheck");
			return false;
		}
		i++;
		await system.waitTicks(1);
	}
	player.removeTag("doubleSneakCheck");
	return true;
}
system.runInterval(() => {
	for (const player of world.getPlayers()) {
		if( player.isSneaking && !player.hasTag("doubleSneakCheck") ){
			doubleSneak(player).then( (result) => {
				if( result ){
					modeChange(player);
				}
			});
		}
		else{
			continue;
		}
	}
}, 1);


world.afterEvents.worldLoad.subscribe( async e => {
    await system.waitTicks(100);
	const players = world.getPlayers()
	for( const player of players ){
		if( player.getDynamicProperty("autobreak:currentProfileIndex") == undefined ){
			player.setDynamicProperty("autobreak:currentProfileIndex",0);
			player.setDynamicProperty("autobreak:currentProfile",`false,1,2,2,2,2,2,2,0,0,0,false,0,0,0,0,0,0,0`);
		}
		if( player.getDynamicProperty("autobreak:profile_num") == undefined ){
			player.setDynamicProperty("autobreak:profile_num",3);
			player.setDynamicProperty(`autobreak:profile1_name`,`デフォルト`);
			player.setDynamicProperty(`autobreak:profile2_name`,`整地`);
			player.setDynamicProperty(`autobreak:profile3_name`,`ブランチマイニング`);
			player.setDynamicProperty(`autobreak:profile1`,`true,64,8,8,8,8,8,8,0,0,0,false,0,0,0,0,0,0,0`);
			player.setDynamicProperty(`autobreak:profile2`,`true,512,8,8,32,0,8,8,2,0,0,true,6,6,0,0,6,6,8`);
			player.setDynamicProperty(`autobreak:profile3`,`true,64,0,0,0,1,32,0,2,0,0,true,0,0,0,0,16,0,8`);
			
		}
	}
} )