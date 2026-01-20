import { world, system, EquipmentSlot,EntityComponentTypes } from "@minecraft/server"
import { ActionFormData, ModalFormData } from "@minecraft/server-ui"
import { isBlockUnder,isBlockFront,absVector2,Vector3Sub, getVector2E,DistanceVector3 } from "./usefulFunction.js"
import { defaultProfile, defaultProfileDisable, defaultBlockIsntDrop,TOOL_SETTING, DEDUCE_DURABILITY,MAX_BLOCKS ,getBlockisCollective } from "./config.js"

system.afterEvents.scriptEventReceive.subscribe( e => {
	if( e.id == `autobreak:main` ){
		const user = e.sourceEntity;
		const form = new ActionFormData();
		form.title(`Setting`);
		form.button(`script.autobreak.myinfo.name`);
		form.button(`script.autobreak.profile.name`);
		form.show(user).then( r => {
			if (!r.canceled) {
				if( r.selection == 0 ){

				}
				else if( r.selection == 1 ){
					const form2 = new ActionFormData();
					form2.title(`profile setting`);
					form2.button(`script.autobreak.profile_enable.name`);
					form2.button(`script.autobreak.profile_list.name`);
					form2.button(`script.autobreak.add_profile.name`);
					form2.button(`script.autobreak.remove_profile.name`);
					form2.show(user).then( r2 => {
						if (!r2.canceled) {
							if( r2.selection == 0 ){
								const form3 = new ModalFormData();
								form3.title(`profile setting`);
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
									}

								})

							}
							else if( r2.selection == 1 ){
								const form3 = new ActionFormData();
								form3.title(`profile setting`);
								//world.sendMessage(`${user.getDynamicProperty(`autobreak:profile_true_num`)+1}`)
								form3.button(`${user.getDynamicProperty(`back`)}`);
								for( let i = 1; i < user.getDynamicProperty(`autobreak:profile_true_num`)+1; i++ ){
									form3.button(`${user.getDynamicProperty(`autobreak:profile${i}_name`)}`);
								//world.sendMessage(`${user.getDynamicProperty(`autobreak:profile_true_num`)+1}`)
								}
								


								form3.show(user).then( r3 => {
									if (!r3.canceled) {
										const profile = String(user.getDynamicProperty(`autobreak:profile${r3.selection}`)).split(`,`);
										const EnableBreak = profile[0] 
										const form4 = new ModalFormData();		
										let blockIsntDrops = []						
										for( let i = 0; i < user.getDynamicProperty(`autobreak:blockIsntDrop_num`); i++ ){
											blockIsntDrops.push(`${user.getDynamicProperty(`autobreak:blockIsntDrop${i}`)}`);
										}
										form4.title(`script.autobreak.profile_setting.name`);
										form4.textField(`script.autobreak.profile_name.name`,`${user.getDynamicProperty(`autobreak:profile${r3.selection}_name`)}`, {defaultValue: `${user.getDynamicProperty(`autobreak:profile${r3.selection}_name`)}`,tooltip:`script.autobreak.profile_name_tooltip.name`});
										form4.dropdown(`script.autobreak.mine_type.name`,[`script.autobreak.mine_type_no.name`,`script.autobreak.mine_type_flat.name`,`script.autobreak.mine_type_descent.name`,`script.autobreak.mine_type_rising.name`], {defaultValueIndex: Number(profile[0]),tooltip:`script.autobreak.mine_type_tooltip.name`});
										form4.slider({ translate: `script.autobreak.max_block.name` },0,Number(world.getDynamicProperty(`autobreak:maxBlock`)), {defaultValue: Number(profile[1]),tooltip:`script.autobreak.max_block_tooltip.name`});
										form4.slider({ translate: `script.autobreak.block_size_right.name` },0,32, {defaultValue: Number(profile[2]),tooltip:`script.autobreak.block_size_tooltip.name`});
										form4.slider({ translate: `script.autobreak.block_size_left.name` },0,32, {defaultValue: Number(profile[3]),tooltip:`script.autobreak.block_size_tooltip.name`});
										form4.slider({ translate: `script.autobreak.block_size_up.name` },0,32, {defaultValue: Number(profile[4]),tooltip:`script.autobreak.block_size_tooltip.name`});
										form4.slider({ translate: `script.autobreak.block_size_down.name` },0,32, {defaultValue: Number(profile[5]),tooltip:`script.autobreak.block_size_tooltip.name`});
										form4.slider({ translate: `script.autobreak.block_size_forward.name` },0,32, {defaultValue: Number(profile[6]),tooltip:`script.autobreak.block_size_tooltip.name`});
										form4.slider({ translate: `script.autobreak.block_size_back.name` },0,32, {defaultValue: Number(profile[7]),tooltip:`script.autobreak.block_size_tooltip.name`});
										form4.dropdown(`script.autobreak.item_drop_ignore.name`,[`script.autobreak.none.name`,`script.autobreak.no_drop_item_setting.name`,`script.autobreak.no_drop.name`],{defaultValue: Number(profile[8]),tooltip:`script.autobreak.item_drop_ignore_tooltip.name`});
										form4.dropdown(`script.autobreak.tree.name`,[`script.autobreak.leaves_log.name`,`script.autobreak.log_only.name`],{defaultValueIndex: Number(profile[9]),tooltip:`script.autobreak.tree_tooltip.name`});
										form4.dropdown(`script.autobreak.crops.name`,[`script.autobreak.no_seed.name`,`script.autobreak.seeding.name`],{defaultValueIndex: Number(profile[10]),tooltip:`script.autobreak.crops_tooltip.name`});
										form4.dropdown(`script.autobreak.ores.name`,[`script.autobreak.leaves_log.name`,`script.autobreak.log_only.name`], {defaultValueIndex: Number(profile[11]),tooltip:`script.autobreak.ores_tooltip.name`});
										form4.dropdown(`script.autobreak.get_block_isnt_drop.name`,blockIsntDrops, {defaultValueIndex: Number(profile[12]),tooltip:`script.autobreak.get_block_isnt_drop_tooltip.name`});
										form4.dropdown(`script.autobreak.consider_block.name`,[`script.autobreak.no.name`,`script.autobreak.yes.name`],{defaultValueIndex: Number(profile[13]),tooltip:`script.autobreak.consider_block_tooltip.name`});
										form4.slider(`script.autobreak.block_size_up.name`,0,32, {defaultValue: Number(profile[14]),tooltip:`script.autobreak.block_size_tooltip.name`});
										form4.slider(`script.autobreak.block_size_down.name`,0,32, {defaultValue: Number(profile[15]),tooltip:`script.autobreak.block_size_tooltip.name`});
										form4.show(user).then( r4 => {
											if (!r4.canceled) {
												user.setDynamicProperty(`autobreak:profile${r3.selection}_name`,r4.formValues[0]);
												const new_profile = `${r4.formValues[1]},${r4.formValues[2]},${r4.formValues[3]},${r4.formValues[4]},${r4.formValues[5]},${r4.formValues[6]},${r4.formValues[7]},${r4.formValues[8]},${r4.formValues[9]},${r4.formValues[10]},${r4.formValues[11]},${r4.formValues[12]},${r4.formValues[13]},${r4.formValues[14]},${r4.formValues[15]},${r4.formValues[16]}`;
												world.sendMessage(new_profile)
												user.setDynamicProperty(`autobreak:profile${r3.selection}`,new_profile);
											}
										})
									}
								} )


							}
						}
					} )

				}
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
		const R = defaultBlockIsntDrop.length;
		for( let i = 0; i < R; i++ ){
			player.setDynamicProperty(`autobreak:blockIsntDrop${i}_name`,`script.autobreak.blockIsntDrop${i}.name`);
			player.setDynamicProperty(`autobreak:blockIsntDrop${i}`,defaultBlockIsntDrop[i]);
			world.sendMessage(`aaaaa${player.getDynamicProperty(`autobreak:blockIsntDrop${i}`)}`);
		}
		player.runCommand(`give @s zex:setting`)
		player.setDynamicProperty("autobreak:currentProfileIndex",1);
		player.setDynamicProperty("autobreak:currentProfile",defaultProfile[1]);
		player.setDynamicProperty(`autobreak:profile_true_num`,C -1);
		player.setDynamicProperty(`autobreak:profile_num`,C - 1 - d);
		player.setDynamicProperty(`autobreak:blockIsntDrop_num`,R);
		world.setDynamicProperty(`autobreak:breakCountsTick`,0);
		//world.sendMessage(`aaaaa`);
		player.addTag(`startedB`);
	}
} )