import { world, system, EquipmentSlot,EntityComponentTypes,ItemComponentTypes, Dimension } from "@minecraft/server"
import { ActionFormData, ModalFormData } from "@minecraft/server-ui"
import { isBlockUnder,isBlockFront,absVector2,Vector3Sub, getVector2E,DistanceVector3 } from "./usefulFunction.js"
import "./mining.js"
import "./form.js"
import "./placing.js"

function getNewMode(mode,max,player){
	let newmode = ((mode+1)%max);
	while( player.getDynamicProperty(`autobreak:profile${newmode}_disable`) == false ){
		//world.sendMessage(`${newmode}`);
		newmode = ((newmode+1)%max);
	}
	return newmode;
}

function printmode( player,mode ){
	if( mode == 0 ){
		player.sendMessage({ rawtext: [ { translate:`script.autobreak.currentmode.name` },{ translate:`script.autobreak.disable.name` } ]});
	}
	else{
		player.sendMessage({ rawtext: [ { translate:`script.autobreak.currentmode.name` },{ translate:`${player.getDynamicProperty(`autobreak:profile${mode}_name`)}` } ]});
	}
	printmodeSneak(player)
}
function printmodeSneak( player ){
	let mode = player.getDynamicProperty("autobreak:currentProfileIndex");
	/*
	try{
		const gun = player.getComponent(EntityComponentTypes.Equippable).getEquipmentSlot(EquipmentSlot.Mainhand);
		if( gun.getDynamicProperty("autobreak:currentProfileIndex") != undefined ){
			mode = gun.getDynamicProperty("autobreak:currentProfileIndex");
		}
	}catch{}
	*/
	if( mode == 0 ){
		player.runCommand(`titleraw @s actionbar {\"rawtext":[{\"translate\":\"script.autobreak.currentmode.name\"},{\"translate\":\"script.autobreak.disable.name\"}]}`);
	}
	else{
		player.runCommand(`titleraw @s actionbar {\"rawtext":[{\"translate\":\"script.autobreak.currentmode.name\"},{\"translate\":\"${player.getDynamicProperty(`autobreak:profile${mode}_name`)}\"}]}`);
	}
}

async function modeChange(player) {
	const mode = player.getDynamicProperty("autobreak:currentProfileIndex");
	const max = player.getDynamicProperty("autobreak:profile_num") +1;
	const newmode = getNewMode(mode,max,player);
	//world.sendMessage(`${newmode}`);
	/*
	try{
		const gun = player.getComponent(EntityComponentTypes.Equippable).getEquipmentSlot(EquipmentSlot.Mainhand);
		const currentProfile = gun.getDynamicProperty("autobreak:currentProfile");
		if( currentProfile == undefined ){
			gun.setDynamicProperty("autobreak:currentProfile",player.getDynamicProperty(`autobreak:profile${newmode}`));
			gun.setDynamicProperty("autobreak:currentProfileIndex",newmode);
			printmode(player,newmode);
		}
		else{
			const mode_item = gun.getDynamicProperty("autobreak:currentProfileIndex");
			const newmode_item = getNewMode(mode_item,max,player);
			//world.sendMessage(`${mode_item},${newmode_item}`);
			gun.setDynamicProperty("autobreak:currentProfile",player.getDynamicProperty(`autobreak:profile${newmode_item}`));
			gun.setDynamicProperty("autobreak:currentProfileIndex",newmode_item);
			printmode(player,newmode_item);
		}
	}
	catch{
		player.setDynamicProperty("autobreak:currentProfileIndex",newmode);
		player.setDynamicProperty("autobreak:currentProfile",player.getDynamicProperty(`autobreak:profile${newmode}`));
		printmode(player,newmode);
	}
	*/
	player.setDynamicProperty("autobreak:currentProfileIndex",newmode);
	player.setDynamicProperty("autobreak:currentProfile",player.getDynamicProperty(`autobreak:profile${newmode}`));
	printmode(player,newmode);

	//player.sendMessage(`${player.getDynamicProperty(`autobreak:profile${newmode}`)}`);
	//player.sendMessage(`${player.getDynamicProperty(`autobreak:currentProfile`)}`);
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
			printmodeSneak(player);
			/*
			doubleSneak(player).then( (result) => {
				if( result ){
					modeChange(player);
				}
			});
			*/
		}
		else{
			continue;
		}
	}
}, 1);

world.afterEvents.itemUse.subscribe( e => {
	const player = e.source;
	const item = e.itemStack;
	if( item.typeId == "zex:allowdipo" ){
		const from = new ActionFormData();
		let indexs = [];
		from.title(`mode`);
		for( let i = 0; i < player.getDynamicProperty(`autobreak:place_profile_true_num`)+1; i++ ){
			if( player.getDynamicProperty(`autobreak:place_profile${i}_disable`) ){
				from.button(`${player.getDynamicProperty(`autobreak:place_profile${i}_name`)}`);
				indexs.push(i);
			}
		}
		from.show(player).then( r => {
			if( !r.canceled ){
				const newMode = indexs[r.selection];
				player.setDynamicProperty("autobreak:place_currentProfileIndex",newMode );
				player.setDynamicProperty("autobreak:place_currentProfile",player.getDynamicProperty(`autobreak:place_profile${newMode}`));
				printmode(player,newMode);
			}
		})
	}
	else if( 
		player.isSneaking && (
		item.hasTag(`minecraft:is_pickaxe`) ||
		item.hasTag(`minecraft:is_axe`) ||
		item.hasTag(`minecraft:is_shovel`) ||
		item.hasTag(`minecraft:is_shears`) ||
		item.hasTag(`minecraft:is_hoe`) )
	){
		const from = new ActionFormData();
		let indexs = [];
		from.title(`mode`);
		for( let i = 0; i < player.getDynamicProperty(`autobreak:profile_true_num`)+1; i++ ){
			if( player.getDynamicProperty(`autobreak:profile${i}_disable`) ){
				from.button(`${player.getDynamicProperty(`autobreak:profile${i}_name`)}`);
				indexs.push(i);
			}
		}
		from.show(player).then( r => {
			if( !r.canceled ){
				const newMode = indexs[r.selection];
				player.setDynamicProperty("autobreak:currentProfileIndex",newMode );
				player.setDynamicProperty("autobreak:currentProfile",player.getDynamicProperty(`autobreak:profile${newMode}`));
				printmode(player,newMode);
			}
		})
	}
} )

const AutoMiningSettingCommponent = {
	async onUse(e,p){
		const user = e.source;
		user.runCommand(`scriptevent autobreak:main`);
	}
}

const BlockIsntDropCommponent = {
	async onPlayerInteract(e,p){
		const user = e.source;
		const dimension = e.dimension;
		const block = e.block;
		let i = 0;
		let str = ``;
		let str2 = ``;
		while( true ){
			i++;
			const targetBlock = block.above(i);
			if( targetBlock.typeId == `minecraft:air` || targetBlock.typeId == `minecraft:bedrock` ){
				break;
			}
			if( !str.includes(`${targetBlock.typeId}`) ){
				str += `${targetBlock.typeId};`
				str2 += `${targetBlock.localizationKey};`
			}
		}
		world.sendMessage(`${str}`);
		const outBlocks = str2.split(`;`);
		let raw = []
		for ( let outBlock of outBlocks ){
			//world.sendMessage(`${outBlock}`);
			if( outBlock.includes("minecraft:") ){
				outBlock = outBlock.replace("minecraft:","");
			}
			raw.push({ translate:`${outBlock}` });
			raw.push({ text:`; ` });
		}
		world.sendMessage({ rawtext: raw });
	}
}

system.beforeEvents.startup.subscribe( e => {
	e.itemComponentRegistry.registerCustomComponent(`zex:setting`,AutoMiningSettingCommponent);
	e.blockComponentRegistry.registerCustomComponent(`zex:block_isnt_drop`,BlockIsntDropCommponent);
})