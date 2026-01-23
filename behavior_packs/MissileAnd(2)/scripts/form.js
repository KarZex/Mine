import { world, system, EquipmentSlot,EntityComponentTypes } from "@minecraft/server"
import { ActionFormData, ModalFormData } from "@minecraft/server-ui"
import { isBlockUnder,isBlockFront,absVector2,Vector3Sub, getVector2E,DistanceVector3 } from "./usefulFunction.js"
import { defaultProfile, defaultProfileDisable, defaultBlockIsntDrop,TOOL_SETTING, DEDUCE_DURABILITY,MAX_BLOCKS ,defaultPlaceProfile,defaultPlaceProfileDisable,defaultBlockIsntDropName,DirectionBlock } from "./config.js"
import { getBlockTexts } from "./missileMain.js"
system.afterEvents.scriptEventReceive.subscribe( e => {
	if( e.id == `autobreak:main` ){
		const user = e.sourceEntity;
		const form = new ActionFormData();
		form.title(`Setting`);
		form.button(`script.autobreak.myinfo.name`);
		form.button(`script.autobreak.break_profile.name`);
		form.button(`script.autobreak.place_profile.name`);
		form.show(user).then( r => {
			if (!r.canceled) {
				if( r.selection == 0 ){

				}
				else if( r.selection == 1 ){
					user.runCommand(`scriptevent autobreak:phone_break_profile`);

				}
				else if( r.selection == 2 ){
					user.runCommand(`scriptevent autobreak:phone_place_profile`);

				}
			}
		} )
	}
	else if(  e.id == `autobreak:block_isnt_drop_setting` ){
		const user = e.sourceEntity;
		const str = e.message[0];
		const str2 = e.message[1];
		const form3 = new ActionFormData();
		form3.title(`script.autobreak.break_drop_setting.name`);
		let j = 0;
		while( true ){
			try{
				if( user.getDynamicProperty(`autobreak:blockIsntDrop${j}`) != undefined ){
					j++
				}
				else{ break; }
			}	catch{ break; }
		}

		for( let i = 0; i < j; i++ ){
			form3.button({ translate: `${user.getDynamicProperty(`autobreak:blockIsntDrop${i}_name`)}` });
		}
		form3.show(user).then( r3 => {

			if (!r3.canceled) {
				const form4 = new ActionFormData();
				const newRule = str2.split(`;`);
				const oldRule = String(user.getDynamicProperty(`autobreak:blockIsntDrop${r3.selection}_name`)).split(`;`);
				let message = [];
				const newBlocks = newRule.filter(x => !oldRule.includes(x));
				const deleteBlocks = oldRule.filter(x => !newRule.includes(x));

				for( const block of newRule ){
					if( newBlocks.includes(block) ){
						message.push({ text: `§a+` });
						message.push({ translate: `${block}` });
						message.push({ text: `§r,` });
					}
					else{
						message.push({ translate: `${block}` });
						message.push({ text: `§r,` });
					}
				}
				for( const block of deleteBlocks ){
					message.push({ text: `§c-` });
					message.push({ translate: `${block}` });
					message.push({ text: `§r,` });
				}
				form4.body({ rawtext: message });
				form4.button({ translate: `script.autobreak.yes.name` });
				form4.button({ translate: `script.autobreak.no.name` });
				form4.show(user).then( r4 => {
					if (!r4.canceled) {
						if( r4.selection == 0 ){
							user.setDynamicProperty(`autobreak:blockIsntDrop${i}`,str);
							user.setDynamicProperty(`autobreak:blockIsntDrop${i}_name`,str2);
						}
						else if( r4.selection == 1 ){
							//do nothing
						}
					}
				})
			}

		})
	}
	else if( e.id == `autobreak:phone_break_profile` ){
		const user = e.sourceEntity;
		const form2 = new ActionFormData();
		form2.title(`script.autobreak.break_profile.name`);
		form2.button(`script.autobreak.profile_enable.name`);
		form2.button(`script.autobreak.profile_list.name`);
		form2.button(`script.autobreak.add_profile.name`);
		form2.button(`script.autobreak.remove_profile.name`);
		form2.show(user).then( r2 => {
			if (!r2.canceled) {
				if( r2.selection == 0 ){
					user.runCommand(`scriptevent autobreak:phone_break_profile_enable`);
				}
				else if( r2.selection == 1 ){
					user.runCommand(`scriptevent autobreak:phone_break_profile_list`);
				}
				else if( r2.selection == 2 ){
					user.runCommand(`scriptevent autobreak:phone_break_drop_setting`);
				}
			}
		} )
	}
	else if( e.id == `autobreak:phone_break_profile_enable` ){
		const user = e.sourceEntity;
		const form3 = new ModalFormData();
		form3.title(`script.autobreak.profile_enable.name`);
		for( let i = 1; i < user.getDynamicProperty(`autobreak:profile_true_num`)+1; i++ ){
			form3.toggle({ translate: `${user.getDynamicProperty(`autobreak:profile${i}_name`)}` }, {defaultValue: user.getDynamicProperty(`autobreak:profile${i}_disable`)});
		}
		form3.show(user).then( r3 => {
			if (!r3.canceled) {
				let sum = 0;
				for( let i = 0; i < user.getDynamicProperty(`autobreak:profile_true_num`)+1; i++ ){
					user.setDynamicProperty(`autobreak:profile${i+1}_disable`,r3.formValues[i]);
					if( r3.formValues[i] == true ){
						sum++
					}
				}
				user.setDynamicProperty("autobreak:profile_num",sum);
				user.runCommand(`scriptevent autobreak:phone_break_profile`);
			}

		})
	}
	else if( e.id == `autobreak:phone_break_profile_list` ){
		const user = e.sourceEntity;
		const form3 = new ActionFormData();
		form3.title(`script.autobreak.profile_list.name`);
		//world.sendMessage(`${user.getDynamicProperty(`autobreak:profile_true_num`)+1}`)
		form3.button(`script.autobreak.add.name`);
		for( let i = 1; i < user.getDynamicProperty(`autobreak:profile_true_num`)+1; i++ ){
			form3.button(`${user.getDynamicProperty(`autobreak:profile${i}_name`)}`);
		//world.sendMessage(`${user.getDynamicProperty(`autobreak:profile_true_num`)+1}`)
		}
		


		form3.show(user).then( r3 => {
			if (!r3.canceled) {
				const profile = String(user.getDynamicProperty(`autobreak:profile${r3.selection}`)).split(`,`);
				const EnableBreak = profile[0] 
				const form4 = new ModalFormData();		
				let j = 0;
				while( true ){
					try{
						if( user.getDynamicProperty(`autobreak:blockIsntDrop${j}`) != undefined ){
							j++
						}
						else{ break; }
					}	catch{ break; }
				}
				let blockIsntDrops = []						
				for( let i = 0; i < j; i++ ){
					blockIsntDrops.push({ rawtext: getBlockTexts(user.getDynamicProperty(`autobreak:blockIsntDrop${i}_name`)) });
				}
				form4.title(`script.autobreak.profile_setting.name`);
				form4.textField(`script.autobreak.profile_name.name`,`${user.getDynamicProperty(`autobreak:profile${r3.selection}_name`)}`, {defaultValue: `${user.getDynamicProperty(`autobreak:profile${r3.selection}_name`)}`,tooltip:`script.autobreak.profile_name_tooltip.name`});
				form4.dropdown(`script.autobreak.mine_type.name`,[`script.autobreak.mine_type_no.name`,`script.autobreak.mine_type_flat.name`,`script.autobreak.mine_type_descent.name`,`script.autobreak.mine_type_rising.name`], {defaultValueIndex: Number(profile[0]),tooltip:`script.autobreak.mine_type_tooltip.name`});
				form4.slider({ translate: `script.autobreak.max_block.name` },0,Number(world.getDynamicProperty(`autobreak:maxBlock`)), {defaultValue: Number(profile[1]),tooltip:`script.autobreak.max_block_tooltip.name`});
				form4.slider({ translate: `script.autobreak.block_size_right.name` },0,DirectionBlock, {defaultValue: Number(profile[2]),tooltip:`script.autobreak.block_size_tooltip.name`});
				form4.slider({ translate: `script.autobreak.block_size_left.name` },0,DirectionBlock, {defaultValue: Number(profile[3]),tooltip:`script.autobreak.block_size_tooltip.name`});
				form4.slider({ translate: `script.autobreak.block_size_up.name` },0,DirectionBlock, {defaultValue: Number(profile[4]),tooltip:`script.autobreak.block_size_tooltip.name`});
				form4.slider({ translate: `script.autobreak.block_size_down.name` },0,DirectionBlock, {defaultValue: Number(profile[5]),tooltip:`script.autobreak.block_size_tooltip.name`});
				form4.slider({ translate: `script.autobreak.block_size_forward.name` },0,DirectionBlock, {defaultValue: Number(profile[6]),tooltip:`script.autobreak.block_size_tooltip.name`});
				form4.slider({ translate: `script.autobreak.block_size_back.name` },0,DirectionBlock, {defaultValue: Number(profile[7]),tooltip:`script.autobreak.block_size_tooltip.name`});
				form4.dropdown(`script.autobreak.item_drop_ignore.name`,blockIsntDrops,{defaultValue: Number(profile[8]),tooltip:`script.autobreak.item_drop_ignore_tooltip.name`});
				form4.dropdown(`script.autobreak.tree.name`,[`script.autobreak.leaves_log.name`,`script.autobreak.log_only.name`],{defaultValueIndex: Number(profile[9]),tooltip:`script.autobreak.tree_tooltip.name`});
				form4.dropdown(`script.autobreak.crops.name`,[`script.autobreak.no_seed.name`,`script.autobreak.seeding.name`],{defaultValueIndex: Number(profile[10]),tooltip:`script.autobreak.crops_tooltip.name`});
				form4.dropdown(`script.autobreak.consider_block.name`,[`script.autobreak.no.name`,`script.autobreak.yes.name`],{defaultValueIndex: Number(profile[11]),tooltip:`script.autobreak.consider_block_tooltip.name`});
				//form4.dropdown(`script.autobreak.ores.name`,[`script.autobreak.leaves_log.name`,`script.autobreak.log_only.name`], {defaultValueIndex: Number(profile[11]),tooltip:`script.autobreak.ores_tooltip.name`});
				//form4.dropdown(`script.autobreak.get_block_isnt_drop.name`,blockIsntDrops, {defaultValueIndex: Number(profile[12]),tooltip:`script.autobreak.get_block_isnt_drop_tooltip.name`});
				//form4.dropdown(`script.autobreak.consider_block.name`,[`script.autobreak.no.name`,`script.autobreak.yes.name`],{defaultValueIndex: Number(profile[13]),tooltip:`script.autobreak.consider_block_tooltip.name`});
				//form4.slider(`script.autobreak.block_size_up.name`,0,32, {defaultValue: Number(profile[14]),tooltip:`script.autobreak.block_size_tooltip.name`});
				//form4.slider(`script.autobreak.block_size_down.name`,0,32, {defaultValue: Number(profile[15]),tooltip:`script.autobreak.block_size_tooltip.name`});
				form4.show(user).then( r4 => {
					if (!r4.canceled) {
						if( r3.selection != 0 ){
							user.setDynamicProperty(`autobreak:profile${r3.selection}_name`,r4.formValues[0]);
							const new_profile = `${r4.formValues[1]},${r4.formValues[2]},${r4.formValues[3]},${r4.formValues[4]},${r4.formValues[5]},${r4.formValues[6]},${r4.formValues[7]},${r4.formValues[8]},${r4.formValues[9]},${r4.formValues[10]},${r4.formValues[11]},${r4.formValues[12]}`;
							//world.sendMessage(new_profile)
							user.setDynamicProperty(`autobreak:profile${r3.selection}`,new_profile);
							user.runCommand(`scriptevent autobreak:phone_break_profile_list`);
						}
						else{
							const C = user.getDynamicProperty(`autobreak:profile_true_num`)+1;
							user.setDynamicProperty(`autobreak:profile${C}_name`,r4.formValues[0]);
							const new_profile = `${r4.formValues[1]},${r4.formValues[2]},${r4.formValues[3]},${r4.formValues[4]},${r4.formValues[5]},${r4.formValues[6]},${r4.formValues[7]},${r4.formValues[8]},${r4.formValues[9]},${r4.formValues[10]},${r4.formValues[11]},${r4.formValues[12]}`;
							//world.sendMessage(new_profile)
							user.setDynamicProperty(`autobreak:profile${C}`,new_profile);
							user.setDynamicProperty(`autobreak:profile${C}_disable`,false);
							const prev_num = user.getDynamicProperty(`autobreak:profile_true_num`);
							user.setDynamicProperty(`autobreak:profile_true_num`,prev_num+1);
							const prev_enable_num = user.getDynamicProperty(`autobreak:profile_num`);
							user.setDynamicProperty(`autobreak:profile_num`,prev_enable_num+1);
							user.runCommand(`scriptevent autobreak:phone_break_profile_list`);
						}
					}
				})
			}
		} )
	}

	else if( e.id == `autobreak:phone_break_drop_setting` ){
		const user = e.sourceEntity;
		const form3 = new ActionFormData();
		form3.title(`script.autobreak.break_drop_setting.name`);
		form3.body(`script.autobreak.break_drop_setting_tooltip.name`);
		world.sendMessage(`${user.getDynamicProperty(`autobreak:blockIsntDrop1`)}`)
		for( let i = 0; user.getDynamicProperty(`autobreak:blockIsntDrop${i}`) != undefined ; i++ ){
			form3.button({ rawtext: getBlockTexts(user.getDynamicProperty(`autobreak:blockIsntDrop${i}_name`)) });
		}
		form3.show(user).then( r3 => {
			if (!r3.canceled) {
				const form4 = new ActionFormData();
				const blocks = String(user.getDynamicProperty(`autobreak:blockIsntDrop${r3.selection}`)).split(`;`);
				const blocks2 = String(user.getDynamicProperty(`autobreak:blockIsntDrop${r3.selection}_name`)).split(`;`);
				let message = [];
				for( const block of blocks ){
					message.push({ text: `id:${block} `});
					message.push({ text: `name:` });
					message.push({ translate: `${blocks2[blocks.indexOf(block)]}` });
					message.push({ text: `,\n` });
				}
				form4.body({ rawtext: message });
				form4.show(user).then( r4 => {
					user.runCommand(`scriptevent autobreak:phone_break_drop_setting`);
				})
			}

		})
	}

	else if( e.id == `autobreak:phone_place_profile` ){
		const user = e.sourceEntity;
		const form2 = new ActionFormData();
		form2.title(`script.autobreak.place_profile.name`);
		form2.button(`script.autobreak.profile_enable.name`);
		form2.button(`script.autobreak.profile_list.name`);
		form2.button(`script.autobreak.add_profile.name`);
		form2.button(`script.autobreak.remove_profile.name`);
		form2.show(user).then( r2 => {
			if (!r2.canceled) {
				if( r2.selection == 0 ){
					user.runCommand(`scriptevent autobreak:phone_place_profile_enable`);
				}
				else if( r2.selection == 1 ){
					user.runCommand(`scriptevent autobreak:phone_place_profile_list`);
				}
				else if( r2.selection == 2 ){
					user.runCommand(`scriptevent autobreak:phone_place_profile_enable`);
				}
				else if( r2.selection == 3 ){
					user.runCommand(`scriptevent autobreak:phone_place_profile_enable`);
				}
			}
		} )
	}
	else if( e.id == `autobreak:phone_place_profile_enable` ){
		const user = e.sourceEntity;
		const form3 = new ModalFormData();
		form3.title(`script.autobreak.profile_enable.name`);
		for( let i = 1; i < user.getDynamicProperty(`autobreak:place_profile_true_num`)+1; i++ ){
			form3.toggle({ translate: `${user.getDynamicProperty(`autobreak:place_profile${i}_name`)}` }, {defaultValue: user.getDynamicProperty(`autobreak:place_profile${i}_disable`)});
		}
		form3.show(user).then( r3 => {
			if (!r3.canceled) {
				let sum = 0;
				for( let i = 0; i < user.getDynamicProperty(`autobreak:place_profile_true_num`)+1; i++ ){
					user.setDynamicProperty(`autobreak:place_profile${i+1}_disable`,r3.formValues[i]);
					if( r3.formValues[i] == true ){
						sum++
					}
				}
				user.setDynamicProperty("autobreak:place_profile_num",sum);
				user.runCommand(`scriptevent autobreak:phone_place_profile`);
			}

		})
	}
	else if( e.id == `autobreak:phone_place_profile_list` ){
		const user = e.sourceEntity;
		const form3 = new ActionFormData();
		form3.title(`script.autobreak.profile_list.name`);
		//world.sendMessage(`${user.getDynamicProperty(`autobreak:profile_true_num`)+1}`)
		form3.button(`script.autobreak.add.name`);
		for( let i = 1; i < user.getDynamicProperty(`autobreak:place_profile_true_num`)+1; i++ ){
			form3.button(`${user.getDynamicProperty(`autobreak:place_profile${i}_name`)}`);
		//world.sendMessage(`${user.getDynamicProperty(`autobreak:profile_true_num`)+1}`)
		}
		


		form3.show(user).then( r3 => {
			if (!r3.canceled) {
				const profile = String(user.getDynamicProperty(`autobreak:place_profile${r3.selection}`)).split(`,`);
				const EnableBreak = profile[0] 
				const form4 = new ModalFormData();		
				let blockIsntDrops = []						
				for( let i = 0; i < user.getDynamicProperty(`autobreak:blockIsntDrop_num`); i++ ){
					blockIsntDrops.push(`${user.getDynamicProperty(`autobreak:blockIsntDrop${i}`)}`);
				}
				form4.title(`script.autobreak.profile_setting.name`);
				form4.textField(`script.autobreak.profile_name.name`,`${user.getDynamicProperty(`autobreak:place_profile${r3.selection}_name`)}`, {defaultValue: `${user.getDynamicProperty(`autobreak:place_profile${r3.selection}_name`)}`,tooltip:`script.autobreak.profile_name_tooltip.name`});
				form4.dropdown(`script.autobreak.mine_type.name`,[`script.autobreak.mine_type_no.name`,`script.autobreak.mine_type_flat.name`,`script.autobreak.mine_type_descent.name`,`script.autobreak.mine_type_rising.name`], {defaultValueIndex: Number(profile[0]),tooltip:`script.autobreak.mine_type_tooltip.name`});
				form4.slider({ translate: `script.autobreak.max_block.name` },0,Number(world.getDynamicProperty(`autobreak:maxBlock`)), {defaultValue: Number(profile[1]),tooltip:`script.autobreak.max_block_tooltip.name`});
				form4.slider({ translate: `script.autobreak.block_size_right.name` },0,DirectionBlock, {defaultValue: Number(profile[2]),tooltip:`script.autobreak.block_size_tooltip.name`});
				form4.slider({ translate: `script.autobreak.block_size_left.name` },0,DirectionBlock, {defaultValue: Number(profile[3]),tooltip:`script.autobreak.block_size_tooltip.name`});
				form4.slider({ translate: `script.autobreak.block_size_up.name` },0,DirectionBlock, {defaultValue: Number(profile[4]),tooltip:`script.autobreak.block_size_tooltip.name`});
				form4.slider({ translate: `script.autobreak.block_size_down.name` },0,DirectionBlock, {defaultValue: Number(profile[5]),tooltip:`script.autobreak.block_size_tooltip.name`});
				form4.slider({ translate: `script.autobreak.block_size_forward.name` },0,DirectionBlock, {defaultValue: Number(profile[6]),tooltip:`script.autobreak.block_size_tooltip.name`});
				form4.slider({ translate: `script.autobreak.block_size_back.name` },0,DirectionBlock, {defaultValue: Number(profile[7]),tooltip:`script.autobreak.block_size_tooltip.name`});
				form4.dropdown(`script.autobreak.covor.name`,[`script.autobreak.none.name`,`script.autobreak.covor_enable.name`],{defaultValueIndex: Number(profile[8]),tooltip:`script.autobreak.covor_tooltip.name`});
				/*
				form4.dropdown(`script.autobreak.tree.name`,[`script.autobreak.leaves_log.name`,`script.autobreak.log_only.name`],{defaultValueIndex: Number(profile[9]),tooltip:`script.autobreak.tree_tooltip.name`});
				form4.dropdown(`script.autobreak.crops.name`,[`script.autobreak.no_seed.name`,`script.autobreak.seeding.name`],{defaultValueIndex: Number(profile[10]),tooltip:`script.autobreak.crops_tooltip.name`});
				form4.dropdown(`script.autobreak.ores.name`,[`script.autobreak.leaves_log.name`,`script.autobreak.log_only.name`], {defaultValueIndex: Number(profile[11]),tooltip:`script.autobreak.ores_tooltip.name`});
				form4.dropdown(`script.autobreak.get_block_isnt_drop.name`,blockIsntDrops, {defaultValueIndex: Number(profile[12]),tooltip:`script.autobreak.get_block_isnt_drop_tooltip.name`});
				form4.dropdown(`script.autobreak.consider_block.name`,[`script.autobreak.no.name`,`script.autobreak.yes.name`],{defaultValueIndex: Number(profile[13]),tooltip:`script.autobreak.consider_block_tooltip.name`});
				*/
				form4.slider(`script.autobreak.block_d.name`,0,DirectionBlock, {defaultValue: Number(profile[9]),tooltip:`script.autobreak.block_d_tooltip.name`});
				//form4.slider(`script.autobreak.block_size_down.name`,0,32, {defaultValue: Number(profile[15]),tooltip:`script.autobreak.block_size_tooltip.name`});
				form4.show(user).then( r4 => {
					if (!r4.canceled) {
						if( r3.selection != 0 ){
							user.setDynamicProperty(`autobreak:place_profile${r3.selection}_name`,r4.formValues[0]);
							const new_profile = `${r4.formValues[1]},${r4.formValues[2]},${r4.formValues[3]},${r4.formValues[4]},${r4.formValues[5]},${r4.formValues[6]},${r4.formValues[7]},${r4.formValues[8]},${r4.formValues[9]},${r4.formValues[10]}`;
							//world.sendMessage(`${new_profile} ${Number(new_profile.split(`,`)[8])}`)
					
							user.setDynamicProperty(`autobreak:place_profile${r3.selection}`,new_profile);
							user.runCommand(`scriptevent autobreak:phone_place_profile_list`);
						}
						else{
							const C = user.getDynamicProperty(`autobreak:place_profile_true_num`)+1;
							user.setDynamicProperty(`autobreak:place_profile${C}_name`,r4.formValues[0]);
							const new_profile = `${r4.formValues[1]},${r4.formValues[2]},${r4.formValues[3]},${r4.formValues[4]},${r4.formValues[5]},${r4.formValues[6]},${r4.formValues[7]},${r4.formValues[8]},${r4.formValues[9]},${r4.formValues[10]}`;
							//world.sendMessage(`${new_profile} ${Number(new_profile.split(`,`)[8])}`)
							user.setDynamicProperty(`autobreak:place_profile${C}`,new_profile);
							user.setDynamicProperty(`autobreak:place_profile${C}_disable`,false);
							const prev_num = user.getDynamicProperty(`autobreak:place_profile_true_num`);
							user.setDynamicProperty(`autobreak:place_profile_true_num`,prev_num+1);
							const prev_enable_num = user.getDynamicProperty(`autobreak:place_profile_num`);
							user.setDynamicProperty(`autobreak:place_profile_num`,prev_enable_num+1);
							user.runCommand(`scriptevent autobreak:phone_place_profile_list`);
						}
					}
				})
			}
		} )
	}
	else if( e.id == `autobreak:init` ){
		if( world.getDynamicProperty(`autobreak:maxBlock`) == undefined ){
			world.setDynamicProperty(`autobreak:maxBlock`,MAX_BLOCKS);
		}
		if( world.getDynamicProperty(`autobreak:use_item`) == undefined ){
			world.setDynamicProperty(`autobreak:use_item`,DEDUCE_DURABILITY);
		}
		if( world.getDynamicProperty(`autobreak:use_tool`) == undefined ){
			world.setDynamicProperty(`autobreak:use_tool`,TOOL_SETTING);
		}

		const player = e.sourceEntity;
		let d = 0;
		const C = defaultProfile.length;
		//world.sendMessage(`${defaultProfile.length}`);
		for( let i = 0; i < C; i++ ){
			//world.sendMessage(`aaaaa`);
			//player.getDynamicProperty(`autobreak:profile${i}_name`)
			player.setDynamicProperty(`autobreak:profile${i}_name`,`script.autobreak.defprofile${i}.name`);
			player.setDynamicProperty(`autobreak:profile${i}`,defaultProfile[i]);
			player.setDynamicProperty(`autobreak:profile${i}_disable`,defaultProfileDisable[i]);

			if( defaultProfileDisable[i] ){
				d++;
			}
		}
		player.setDynamicProperty(`autobreak:profile_true_num`,C -1);
		player.setDynamicProperty(`autobreak:profile_num`,C - 1 - d);
		player.setDynamicProperty("autobreak:currentProfileIndex",1);
		player.setDynamicProperty("autobreak:currentProfile",defaultProfile[1]);


		const R = defaultBlockIsntDrop.length;
		for( let i = 0; i < R; i++ ){
			player.setDynamicProperty(`autobreak:blockIsntDrop${i}_name`,defaultBlockIsntDropName[i]);
			player.setDynamicProperty(`autobreak:blockIsntDrop${i}`,defaultBlockIsntDrop[i]);
			//world.sendMessage(`aaaaa${player.getDynamicProperty(`autobreak:blockIsntDrop${i}`)}`);
		}
		player.setDynamicProperty(`autobreak:blockIsntDrop_num`,R);


		const P = defaultPlaceProfile.length;
		d = 0;
		for( let i = 0; i < C; i++ ){
			//world.sendMessage(`aaaaa`);
			//player.getDynamicProperty(`autobreak:profile${i}_name`)
			player.setDynamicProperty(`autobreak:place_profile${i}_name`,`script.autobreak.place_defprofile${i}.name`);
			player.setDynamicProperty(`autobreak:place_profile${i}`,defaultPlaceProfile[i]);
			player.setDynamicProperty(`autobreak:place_profile${i}_disable`,defaultPlaceProfileDisable[i]);

			if( defaultPlaceProfileDisable[i] ){
				d++;
			}
		}
		player.setDynamicProperty(`autobreak:place_profile_true_num`,P -1);
		player.setDynamicProperty(`autobreak:place_profile_num`,P - 1 - d);
		player.setDynamicProperty("autobreak:place_currentProfileIndex",1);
		player.setDynamicProperty("autobreak:place_currentProfile",defaultPlaceProfile[1]);

		player.runCommand(`give @s zex:setting`)
		world.setDynamicProperty(`autobreak:breakCountsTick`,0);
		//world.sendMessage(`aaaaa`);
		player.addTag(`automining2`);
	}
} )