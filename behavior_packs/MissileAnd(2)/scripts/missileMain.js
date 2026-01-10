import { world, system, EquipmentSlot,EntityComponentTypes } from "@minecraft/server"
import { ActionFormData, ModalFormData } from "@minecraft/server-ui"
import { isBlockUnder,isBlockFront,absVector2,Vector3Sub, getVector2E,DistanceVector3 } from "./usefulFunction.js"

const GrapplingHookCommponent = {
	async onUse(e,p){
		const user = e.source;
		const dimension = user.dimension;
		const params = p.params;
		const shot = params.shot_entity;
		const power = params.power;
		const V = user.getViewDirection();
		const FirePos = user.getHeadLocation();
		const shootView = {
		  x: V.x * power,
		  y: V.y * power,
		  z: V.z * power 
		}
		const fire = dimension.spawnEntity(shot,FirePos);
		dimension.playSound(`crossbow.shoot`,user.location)
		fire.getComponent(`minecraft:projectile`).owner = user
		fire.getComponent(`minecraft:projectile`).shoot( shootView );
	}
}

const RocketHookCommponent = {
	async onUse(e,p){
		const user = e.source;
		const dimension = user.dimension;
		const params = p.params;
		const shot = params.shot_entity;
		const power = params.power;
		const V = user.getViewDirection();
		const FirePos = user.getHeadLocation();
		const shootView = {
		  x: V.x * power,
		  y: V.y * power,
		  z: V.z * power 
		}
		const fire = dimension.spawnEntity(shot,FirePos);
		dimension.playSound(`crossbow.shoot`,user.location)
		fire.getComponent(`minecraft:projectile`).owner = user
		fire.getComponent(`minecraft:projectile`).shoot( shootView );
		fire.getComponent(EntityComponentTypes.Rideable).addRider(user);
		await system.waitTicks(10);
		fire.remove();

	}
}	

system.beforeEvents.startup.subscribe( e => {
	e.itemComponentRegistry.registerCustomComponent(`zex:grappling_hook`,GrapplingHookCommponent);
	e.itemComponentRegistry.registerCustomComponent(`zex:rocket_hook`,RocketHookCommponent);
})
/*
function missileLaunchingEvent( e ){
	const user = e.source;
    const dimension = user.dimension;
	const power = 1.1;
    const O = user.location;
    const V = user.getViewDirection();
    const FirePos = {
      x: O.x,
      y: O.y + 1.125,
      z: O.z 
    }
    const shootView = {
      x: V.x * power,
      y: V.y * power,
      z: V.z * power 
    }
    const fire = user.dimension.spawnEntity(`zex:hook_test`,FirePos);
	dimension.playSound(`crossbow.shoot`,user.location)
    fire.getComponent(`minecraft:projectile`).owner = user
    fire.getComponent(`minecraft:projectile`).shoot( shootView );
}
function missileLaunchingEvent2( e ){
	const user = e.source;
    const dimension = user.dimension;
	const power = 1.1;
    const O = user.location;
    const V = user.getViewDirection();
    const FirePos = .getHeadLocation();
    const shootView = {
      x: V.x * power,
      y: V.y * power,
      z: V.z * power 
    }
    const fire = user.dimension.spawnEntity(`zex:hook_ender`,FirePos);
	dimension.playSound(`crossbow.shoot`,user.location)
    fire.getComponent(`minecraft:projectile`).owner = user
    fire.getComponent(`minecraft:projectile`).shoot( shootView );
}
*/

/*
function debugLog( str ){
	world.sendMessage( `[Pal] ${str}` );
}

async function sliding(player) {
	let i = 0;
	player.addTag("pal_sliding");
	while( true ){
		i++;
		await system.waitTicks(1);
		if( !player.isSneaking ){
			break;
		}
		else if( i > 5 ){
			player.removeTag("pal_sliding");
			debugLog("Sliding failed");
			return false;
		}
	}
	i = 0;
	while( true ){
		i++;
		await system.waitTicks(1);
		if( player.isSneaking ){
			break;
		}
		else if( i > 5 ){
			player.removeTag("pal_sliding");
			debugLog("Sliding failed");
			return false;
		}
	}
	const V = player.getViewDirection();
	i = 0;
	player.applyKnockback(V.x,V.z,3,0);
	player.runCommand(`playanimation @s animation.pal.stone none 0 \"!query.is_on_ground\"`);
	player.addEffect(`hunger`,20,{ amplifier:40, showParticles: true })
	while( true ){
		i++;
		await system.waitTicks(1);
		if( i < 5 ){
			player.applyKnockback(V.x,V.z,(10-i)/5,0);
		}
		if( i > 10 || !player.isOnGround ){
			player.removeTag("pal_sliding");
			debugLog("Sliding success");
			return true;
		}
	}
	//const V = player.getViewDirection();
	player.applyKnockback(V.x,V.z,3,0);
	//player.addEffect(`speed`,10,{ amplifier:10, showParticles: false } );
	await system.waitTicks(20);
	debugLog("Sliding success");
	player.removeTag("pal_sliding");
	return true;
	
}

async function afterJump(player) {
	let i = 0;
	player.addTag("afterJump");
	while( true ){
		i++;
		await system.waitTicks(1);
		if( !player.isJumping ){
			break;
		}
		else if( player.isOnGround ){
			player.removeTag("afterJump");
			debugLog("afterJump failed");
			return false;
		}
	}
	i = 0;
	while( true ){
		i++;
		await system.waitTicks(1);
		const V = player.getViewDirection();
		i = 0;
		/*
		if( player.isJumping && isBlockUnder(player.dimension,player.location,2) == 1 ){
			player.applyKnockback(V.x,V.z,4,-1);
			player.runCommand(`playanimation @s animation.pal.stone none 0 \"!query.is_on_ground\"`);
			player.addEffect(`hunger`,20,{ amplifier:40, showParticles: true })
			player.removeTag("afterJump");
			debugLog("afterJump success");
			return true;
		}
		if( player.isSneaking ){
			player.clearVelocity();
			player.applyKnockback(V.x,V.z,2,0);
			player.addEffect(`hunger`,20,{ amplifier:40, showParticles: true })
			player.removeTag("afterJump");
			debugLog("afterJump success");
			return true;
		}
		else if( player.isOnGround || !player.hasTag("afterJump") ){
			player.removeTag("afterJump");
			debugLog("afterJump failed");
			return false;
		}
	}

	
}
*/

world.afterEvents.projectileHitEntity.subscribe( async e => {
	const dimension = e.dimension;
	const projectile = e.projectile;
	const owner = e.source;
	if( projectile.typeId == "zex:hook_test" && !projectile.hasTag(`runned`) ){
		try{
			projectile.addTag(`runned`);
			const victim = e.getEntityHit().entity;
			const dummyEntity = dimension.spawnEntity(`zex:hook_test_dummy`,victim.location);
			dummyEntity.getComponent(EntityComponentTypes.Leashable).leashTo(owner);
			const rideEntity = dimension.spawnEntity(`zex:hook_test_ride`,victim.location);
			dummyEntity.getComponent(EntityComponentTypes.Rideable).addRider(rideEntity);
			rideEntity.getComponent(EntityComponentTypes.Rideable).addRider(victim);
			await system.waitTicks(20);
			try{
				projectile.remove();
				dummyEntity.remove();
				rideEntity.remove();
			}catch{}
		}catch{}
	}
},)

world.afterEvents.projectileHitBlock.subscribe( async e => {
	const dimension = e.dimension;
	const projectile = e.projectile;
	const owner = e.source;
	if( projectile.typeId == "zex:hook_test" && !projectile.hasTag(`runned`) ){
		if( DistanceVector3(projectile.location,owner.location) < 64 ){
			projectile.addTag(`runned`);

			const dummyEntity = dimension.spawnEntity(`zex:hook_test_dummy`,owner.location);
			dummyEntity.getComponent(EntityComponentTypes.Leashable).leashTo(projectile);

			const rideEntity = dimension.spawnEntity(`zex:hook_test_ride`,owner.location);
			dummyEntity.getComponent(EntityComponentTypes.Rideable).addRider(rideEntity);
			rideEntity.getComponent(EntityComponentTypes.Rideable).addRider(owner);
			await system.waitTicks(100);
			try{
				owner.removeTag(`used_grappling_hook`);
				projectile.remove();
				dummyEntity.remove();
				rideEntity.remove();
			}catch{}
		}
		
	}
	else if( projectile.typeId == "zex:hook_ender" && !projectile.hasTag(`runned`) ){
		const block = e.getBlockHit().block;
		let i = 0;
		projectile.addTag(`runned`);
		while( true ){
			i++;
			if( block.above(i).typeId == "minecraft:air" ){
				owner.teleport( {
					  x: block.above(i).location.x + 0.5,
					  y: block.above(i).location.y + 0.1,
					  z: block.above(i).location.z + 0.5
				} );
				break;
			}
			if( i > 15 ){
				break;
			}
		}
		await system.waitTicks(1);
		dimension.playSound(`mob.endermen.portal`,owner.location);
		projectile.remove()
	}
	else if( projectile.typeId == "zex:hook_knockback" && !projectile.hasTag(`runned`) ){
		const block = e.getBlockHit().block;
		projectile.addTag(`runned`);
		dimension.playSound(`crossbow.loading.middle`,owner.location)
		const location = block.location;
		const O = owner.location;
		owner.addEffect(`slow_falling`,10)
		
		owner.applyKnockback(
			{
				x:Vector3Sub(O,location).x,
				z:Vector3Sub(O,location).z
			},
			(location.y - O.y)/4
		)
		await system.waitTicks(1);
		projectile.remove()
	}
} )
