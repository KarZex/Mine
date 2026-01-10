import { world, system, EquipmentSlot,EntityComponentTypes } from "@minecraft/server"
import { ActionFormData, ModalFormData } from "@minecraft/server-ui"
import { isBlockUnder,isBlockFront,absVector2,Vector3Sub, getVector2E,DistanceVector3 } from "./usefulFunction.js"
import { MAX_BLOCKS, MAX_DISTANCE_X, MAX_DISTANCE_Y_UP,MAX_DISTANCE_Y_DOWN, MAX_DISTANCE_Z,breakBlockAnotherId ,getBlockisCollective } from "./config.js"

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
									form3.toggle(`autobreak:profile${i}_name`, {defaultValue: !user.getDynamicProperty(`autobreak:profile${i}_disable`),tooltip:`max mining block size`});
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
										player.setDynamicProperty("autobreak:profile_num",sum);
									}

								})

							}
							else if( r2.selection == 1 ){
								const form3 = new ActionFormData();
								form3.title(`profile setting`);
								world.sendMessage(`${user.getDynamicProperty(`autobreak:profile_true_num`)+1}`)
								for( let i = 1; i < user.getDynamicProperty(`autobreak:profile_true_num`)+1; i++ ){
									form3.button(`${user.getDynamicProperty(`autobreak:profile${i}_name`)}`);
								world.sendMessage(`${user.getDynamicProperty(`autobreak:profile_true_num`)+1}`)
								}
								form3.show(user).then( r3 => {
									if (!r3.canceled) {
										const profile = String(user.getDynamicProperty(`autobreak:profile${r3.selection}`)).split(`,`);
										const EnableBreak = profile[0] 
										const form4 = new ModalFormData();
										form4.title(`profile setting`);
										form4.textField(`profile Name`,`${user.getDynamicProperty(`autobreak:profile${r3.selection}_name`)}`, {defaultValue: `${user.getDynamicProperty(`autobreak:profile${r3.selection}_name`)}`,tooltip:`max mining block size`});
										form4.toggle(`Enable mining`, {defaultValue: Boolean(profile[0]),tooltip:`max mining block size`});
										form4.textField(`Max Block`,`${profile[1]}`, {defaultValue: `${profile[1]}`,tooltip:`max mining block size`});
										form4.slider(`BlockSizeRight`,0,32, {defaultValue: Number(profile[2]),tooltip:`max mining block size`});
										form4.slider(`BlockSizeLeft`,0,32, {defaultValue: Number(profile[3]),tooltip:`max mining block size`});
										form4.slider(`blockSizeUP`,0,32, {defaultValue: Number(profile[4]),tooltip:`max mining block size`});
										form4.slider(`BlockSizeDOWN`,0,32, {defaultValue: Number(profile[5]),tooltip:`max mining block size`});
										form4.slider(`BlockSizeFoward`,0,32, {defaultValue: Number(profile[6]),tooltip:`max mining block size`});
										form4.slider(`BlockSizeBack`,0,32, {defaultValue: Number(profile[7]),tooltip:`max mining block size`});
										form4.dropdown(`itemDropignore`,[`none`,`dirt,stone,sand,etc..`,`ore only`,`no drop`],{defaultValue: Number(profile[8]),tooltip:`max mining block size`});
										form4.dropdown(`Tree`,[`Leaves+Log`,`Log`,`Log+rest`],{defaultValue: Number(profile[9]),tooltip:`max mining block size`});
										form4.dropdown(`Crops`,[`Seed`,`no Seed`],{defaultValue: Number(profile[10]),tooltip:`max mining block size`});
										form4.toggle(`Enable Auto Placing`, {defaultValue: Boolean(profile[11]),tooltip:`max mining block size`});
										form4.slider(`BlockSizeRight`,0,32, {defaultValue: Number(profile[12]),tooltip:`max mining block size`});
										form4.slider(`BlockSizeLeft`,0,32, {defaultValue: Number(profile[13]),tooltip:`max mining block size`});
										form4.slider(`blockSizeUP`,0,32, {defaultValue: Number(profile[14]),tooltip:`max mining block size`});
										form4.slider(`BlockSizeDOWN`,0,32, {defaultValue: Number(profile[15]),tooltip:`max mining block size`});
										form4.slider(`BlockSizeFoward`,0,32, {defaultValue: Number(profile[16]),tooltip:`max mining block size`});
										form4.slider(`BlockSizeBack`,0,32, {defaultValue: Number(profile[17]),tooltip:`max mining block size`});
										form4.slider(`torch`,0,16, {defaultValue: Number(profile[18]),tooltip:`max mining block size`});
										form4.show(user).then( r4 => {
											if (!r4.canceled) {
												user.setDynamicProperty(`autobreak:profile${r3.selection}_name`,r4.formValues[0]);
												const new_profile = `${r4.formValues[1]},${r4.formValues[2]},${r4.formValues[3]},${r4.formValues[4]},${r4.formValues[5]},${r4.formValues[6]},${r4.formValues[7]},${r4.formValues[8]},${r4.formValues[9]},${r4.formValues[10]},${r4.formValues[11]},${r4.formValues[12]},${r4.formValues[13]},${r4.formValues[14]},${r4.formValues[15]},${r4.formValues[16]},${r4.formValues[17]},${r4.formValues[18]},${r4.formValues[19]}`;
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
		const player = e.sourceEntity;
		if( player.getDynamicProperty("autobreak:currentProfileIndex") == undefined ){
			player.setDynamicProperty("autobreak:currentProfileIndex",0);
			player.setDynamicProperty("autobreak:currentProfile",`false,1,2,2,2,2,2,2,0,0,0,false,0,0,0,0,0,0,0`);
		}
		if( player.getDynamicProperty(`autobreak:profile_true_num`) == undefined ){
			player.setDynamicProperty(`autobreak:profile_num`,3);
			player.setDynamicProperty(`autobreak:profile_true_num`,3);
			player.setDynamicProperty(`autobreak:profile1_name`,`デフォルト`);
			player.setDynamicProperty(`autobreak:profile2_name`,`整地`);
			player.setDynamicProperty(`autobreak:profile3_name`,`ブランチマイニング`);
			player.setDynamicProperty(`autobreak:profile1`,`true,64,8,8,8,8,8,8,0,0,0,false,0,0,0,0,0,0,0`);
			player.setDynamicProperty(`autobreak:profile2`,`true,512,8,8,32,0,8,8,2,0,0,true,6,6,0,0,6,6,8`);
			player.setDynamicProperty(`autobreak:profile3`,`true,64,0,0,0,1,32,0,2,0,0,true,0,0,0,0,16,0,8`);
			
		}
	}
} )