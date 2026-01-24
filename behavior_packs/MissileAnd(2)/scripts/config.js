import {  world, system, EquipmentSlot,EntityComponentTypes } from "@minecraft/server"
import { ActionFormData, ModalFormData } from "@minecraft/server-ui"
import { getInventoryItem,isBlockFront,absVector2,Vector3Sub, getVector2E,DistanceVector3 } from "./usefulFunction.js"


//Block breaking configuration

//一度に破壊できる最大ブロック数
//Maximum number of blocks that can be destroyed at once
export const MAX_BLOCKS = 1024;

//一括破壊時に耐久値が減少するか
//Durability decreases when destroyed
export const DEDUCE_DURABILITY = true;

//ツールによるブロック破壊の制限
//Restricting block destruction by tools
export const TOOL_SETTING = true;

//各方向の最大距離設定
//Maximum distance settings in each direction
export const DirectionBlock = 64;
//作物の設定
//Crop Settings
export const breakableCrops = [
    { blockId: "minecraft:wheat",placeBlock: "minecraft:wheat", seedItem: "minecraft:wheat_seeds",under:[ "minecraft:farmland" ] },
    { blockId: "minecraft:beetroot",placeBlock: "minecraft:beetroot", seedItem: "minecraft:beetroot_seeds",under:[ "minecraft:farmland" ] },
    { blockId: "minecraft:carrots",placeBlock: "minecraft:carrots", seedItem: "minecraft:carrot",under:[ "minecraft:farmland" ] },
    { blockId: "minecraft:potatoes",placeBlock: "minecraft:potatoes", seedItem: "minecraft:potato",under:[ "minecraft:farmland" ] },
    { blockId: "minecraft:pumpkin_stem",placeBlock: "minecraft:pumpkin_stem", seedItem: "minecraft:pumpkin_seeds",under:[ "minecraft:farmland" ] },
    { blockId: "minecraft:melon_stem",placeBlock: "minecraft:melon_stem", seedItem: "minecraft:melon_seeds",under:[ "minecraft:farmland" ] },
    { blockId: "minecraft:pumpkin",placeBlock: "minecraft:pumpkin_stem", seedItem: "minecraft:pumpkin_seeds",setBlock:"minecraft:farmland",under:[ "minecraft:dirt" ] },
    { blockId: "minecraft:melon_block",placeBlock: "minecraft:melon_stem", seedItem: "minecraft:melon_seeds",setBlock:"minecraft:farmland",under:[ "minecraft:dirt" ] },
    { blockId: "minecraft:bamboo",placeBlock: "minecraft:bamboo_sapling", seedItem: "minecraft:bamboo",under:[ "minecraft:grass_block","minecraft:dirt","minecraft:mycelium","minecraft:podzol","minecraft:red_sand","minecraft:sand","minecraft:gravel" ] },
    //{ blockId: "minecraft:cocoa",placeBlock: "minecraft:cocoa", seedItem: "minecraft:cocoa_beans",under:undefined },
    { blockId: "minecraft:reeds",placeBlock: "minecraft:reeds", seedItem: "minecraft:sugar_cane",under:[ "minecraft:grass_block","minecraft:dirt","minecraft:mycelium","minecraft:podzol","minecraft:red_sand","minecraft:sand","minecraft:gravel" ] },
    { blockId: "minecraft:sweet_berry_bush",placeBlock: "minecraft:sweet_berry_bush", seedItem: "minecraft:sweet_berries",under:[ "minecraft:grass_block","minecraft:dirt","minecraft:mycelium","minecraft:podzol","minecraft:red_sand","minecraft:sand","minecraft:gravel" ] },
    { blockId: "minecraft:nether_wart",placeBlock: "minecraft:nether_wart", seedItem: "minecraft:nether_wart",under:[ "minecraft:soul_sand","minecraft:soul_soil" ] },
    { blockId: "minecraft:chorus_plant",placeBlock: "minecraft:chorus_flower", seedItem: "minecraft:chorus_flower",under:[ "minecraft:end_stone" ] },
    { blockId: "minecraft:chorus_flower",placeBlock: "minecraft:chorus_flower", seedItem: "minecraft:chorus_flower",under:[ "minecraft:end_stone" ] },
    //Sakura SlashBlade Addon V4.0
    //https://github.com/KarZex/slashBladev3/releases/tag/v4.0
    { blockId: "zex:beanplant",placeBlock: "zex:beanplant", seedItem: "zex:brown_bean",under:[ "minecraft:farmland" ] },
    { blockId: "zex:tomato_crop",placeBlock: "zex:tomato_crop", seedItem: "zex:tomatoseed",under:[ "minecraft:farmland" ] },
    { blockId: "zex:onion_crop",placeBlock: "zex:onion_crop", seedItem: "zex:onionseed",under:[ "minecraft:farmland" ] },
    { blockId: "zex:buckwheat",placeBlock: "zex:buckwheat", seedItem: "zex:buckwheatseed",under:[ "minecraft:farmland" ] },
    { blockId: "zex:rapeseed",placeBlock: "zex:rapeseed", seedItem: "zex:rapeseeds",under:[ "minecraft:farmland" ] },
    { blockId: "zex:riceplant",placeBlock: "zex:riceplant", seedItem: "zex:riceplantseed",under:[ "minecraft:farmland" ] }
]

export const defaultProfile = [
    //Like CSV
    //EnableB,MAXBlocksize,BlockSizeRight,BlockSizeLeft,blockSizeUP,BlockSizeDOWN,BlockSizeFoward,BlockSizeBack,itemDropignore,Tree,Ore,crops,placing,BlockSizeRight,BlockSizeLeft,blockSizeUP,BlockSizeDOWN,BlockSizeFoward,BlockSizeBack,torch
    `0,1,2,2,2,2,2,2,0,0,0,0,0,0,0,0`, //§c無効
    `1,64,8,8,8,8,8,8,0,0,1,0,0,0,0,0`, //§aデフォルト
    `1,64,1,1,1,1,1,1,0,0,0,0,1,1,0,0`, //§b範囲破壊
    `1,512,8,8,32,0,8,8,1,0,0,1,1,1,0,0`, //§9整地
    `1,64,0,0,1,0,32,0,1,0,0,1,1,1,0,0`, //§eブランチマイニング
    `2,256,1,1,3,0,32,0,1,0,1,1,1,1,0,0`, //§d階段下り
    `3,256,1,1,3,0,32,0,1,0,1,1,1,1,0,0` //§3階段上り
]

export const defaultPlaceProfile = [
    //Like CSV
    //EnableB,MAXBlocksize,BlockSizeRight,BlockSizeLeft,blockSizeUP,BlockSizeDOWN,BlockSizeFoward,BlockSizeBack,itemDropignore,Tree,Ore,crops,placing,BlockSizeRight,BlockSizeLeft,blockSizeUP,BlockSizeDOWN,BlockSizeFoward,BlockSizeBack,torch
    `0,1,2,2,2,2,2,2,0,0,0,0,0,0,0,0`, //§c無効
    `1,64,4,0,4,0,4,0,0,0,1,0,0,0,0,0`, //§aデフォルト(右前)
    `1,1024,32,32,32,32,32,32,1,0,1,0,0,0,0,0`, //§b湧きつぶし
    `1,64,0,0,0,0,32,0,0,0,1,0,0,0,0,0`, //§e橋
    `2,64,0,0,0,0,32,0,0,0,1,0,0,0,0,0`, //§d階段下り
    `3,64,0,0,0,0,32,0,0,0,1,0,0,0,0,0`, //§3階段上り
    `1,128,8,8,0,0,8,8,0,0,1,0,0,0,0,0` //§6整地
]

export const defaultPlaceProfileDisable = [ true,true,false,false,false,false ];

export const defaultProfileDisable = [ true,true,false,false,false,false,false ];

export const defaultBlockIsntDrop = [
    //split ";"
    //<block id>;<block id>; ...
    ``,
    `minecraft:stone;minecraft:dirt;minecraft:grass;minecraft:sand;minecraft:gravel;minecraft:leaves;minecraft:deepslate;minecraft:sandstone;minecraft:netherrack;minecraft:soul_sand;minecraft:soul_soil;minecraft:snow;`
]

export const defaultBlockIsntDropName = [
    ``,
    `tile.stone.stone.name;tile.dirt.default.name;tile.sand.default.name;tile.gravel.name;tile.deepslate.name;tile.sandstone.name;tile.netherrack.name;tile.soul_soil.name;tile.soul_sand.name;tile.snow.name;tile.grass.name;tile.snow_layer.name;`
]

//一括破壊できないアイテム
//Indestructible items
export const NoBreakBlocks = [
    `minecraft:air`,
    //`minecraft:flowing_lava`,
    //`minecraft:lava`,
    `minecraft:water`,
    `minecraft:flowing_water`,
    `minecraft:bedrock`,
    `minecraft:mob_spawner`,
    `minecraft:barrier`,
    `minecraft:border`,
    `minecraft:command_block`,
    `minecraft:chain_command_block`,
    `minecraft:repeating_command_block`,
    `minecraft:end_gateway`,
    `minecraft:end_portal`,
    `minecraft:end_portal_frame`,
    `minecraft:invisible_bedrock`,
    `minecraft:jigsaw`,
    `minecraft:light_block`,
    `minecraft:nether_portal`,
    `minecraft:structure_block`,
    `minecraft:structure_void`,
    `minecraft:reinforced_deepslate`,
    `minecraft:vault`,
    `minecraft:ominous_vault`,
    `minecraft:trial_spawner`,
    `minecraft:ominous_trial_spawner`,
    //`minecraft:netherite_block`,
    //`minecraft:crying_obsidian`,
    `minecraft:glowing_obsidian`,
    //`minecraft:obsidian`,
    //`minecraft:respawn_anchor`,
    //`minecraft:ancient_debris`,
    //`minecraft:ender_chest`,
    `minecraft:heavy_core`,
    //`minecraft:hardened_glass`,
    //`minecraft:hardened_glass_pane`,
    `minecraft:budding_amethyst`,
    //`minecraft:chorus_plant`,
    //`minecraft:dirt_path`,
    `minecraft:farmland`,
    `minecraft:frogspawn`,
    `minecraft:infested_chiseled_stone_bricks`,
    `minecraft:infested_cracked_stone_bricks`,
    `minecraft:infested_cobblestone`,
    `minecraft:infested_deepslate`,
    `minecraft:infested_mossy_stone_bricks`,
    `minecraft:infested_stone`,
    `minecraft:infested_stone_bricks`,
    `minecraft:client_request_placeholder_block`,
    `minecraft:frosted_ice`,
]

export const PlaceableBlocks = [
    //`minecraft:activator_rail`,
    `minecraft:air`,
    `minecraft:allium`,
    `minecraft:azure_bluet`,
    `minecraft:bamboo`,
    `minecraft:banner`,
    `minecraft:blue_orchid`,
    `minecraft:brown_mushroom`,
    `minecraft:bubble_column`,
    `minecraft:cobweb`,
    `minecraft:coral`,
    `minecraft:coral_fan`,
    `minecraft:cornflower`,
    `minecraft:crimson_fungus`,
    `minecraft:crimson_roots`,
    `minecraft:dandelion`,
    `minecraft:dead_bush`,
    `minecraft:dead_coral`,
    `minecraft:dead_coral_fan`,
    //`minecraft:detector_rail`,
    `minecraft:end_gateway`,
    `minecraft:end_portal`,
    `minecraft:eyeblossom`,
    `minecraft:fern`,
    `minecraft:fire`,
    `minecraft:firefly_bush`,
    `minecraft:frogspawn`,
    `minecraft:glow_item_frame`,
    `minecraft:glow_lichen`,
    `minecraft:hanging_roots`,
    `minecraft:hanging_sign`,
    `minecraft:heavy_weighted_pressure_plate`,
    `minecraft:item_frame`,
    `minecraft:kelp`,
    `minecraft:large_fern`,
    `minecraft:lava`,
    `minecraft:leaf_litter`,
    `minecraft:lever`,
    `minecraft:light`,
    `minecraft:light_weighted_pressure_plate`,
    `minecraft:lilac`,
    `minecraft:lily_of_the_valley`,
    `minecraft:mangrove_propagule`,
    `minecraft:mushroom`,
    `minecraft:nether_fungus`,
    `minecraft:nether_portal`,
    `minecraft:nether_sprouts`,
    `minecraft:nether_wart`,
    `minecraft:oxeye_daisy`,
    `minecraft:paeonia`,
    `minecraft:peony`,
    `minecraft:pink_petals`,
    `minecraft:pitcher_plant`,
    `minecraft:polished_blackstone_button`,
    `minecraft:polished_blackstone_pressure_plate`,
    `minecraft:poppy`,
    `minecraft:powder_snow`,
    //`minecraft:powered_rail`,
    //`minecraft:rail`,
    `minecraft:red_mushroom`,
    ///`minecraft:redstone_torch`,
    `minecraft:redstone_wire`,
    `minecraft:rose_bush`,
    `minecraft:sapling`,
    `minecraft:sculk_vein`,
    `minecraft:seagrass`,
    `minecraft:short_dry_grass`,
    `minecraft:short_grass`,
    `minecraft:shrub`,
    `minecraft:small_dripleaf`,
    `minecraft:snow`,
    `minecraft:soul_fire`,
    //`minecraft:soul_torch`,
    `minecraft:spore_blossom`,
    `minecraft:stone_button`,
    `minecraft:stone_pressure_plate`,
    `minecraft:string`,
    `minecraft:structure_void`,
    `minecraft:sugar_cane`,
    `minecraft:sunflower`,
    `minecraft:tall_dry_grass`,
    `minecraft:tall_grass`,
    //`minecraft:torch`,
    `minecraft:torchflower`,
    `minecraft:tripwire_hook`,
    `minecraft:tulip`,
    `minecraft:twisting_vines`,
    //`minecraft:underwater_torch`,
    `minecraft:vines`,
    `minecraft:warped_fungus`,
    `minecraft:warped_roots`,
    `minecraft:water`,
    `minecraft:weeping_vines`,
    `minecraft:wither_rose`,
    `minecraft:wooden_button`,
    `minecraft:wooden_pressure_plate`
]

//define log,leaves, etc. block types

export function breakBlockAnotherId(blockId,targetId,is_9_enabled){
    if( is_9_enabled && ( blockId.includes("leaves") || blockId.includes("log") ) ){
        if( targetId.includes("leaves") || targetId.includes("log") ){
            return true;
        }
        else{
            return false;
        }
    }
    else if( blockId.includes("stem") || blockId.includes("wart_block") ){
        if( targetId.includes("stem") || targetId.includes("wart_block") ){
            return true;
        }
        else{
            return false;
        }
    }
    else if( blockId.includes("redstone_ore") || blockId.includes("lit_redstone_ore") ){
        if( targetId.includes("redstone_ore") || targetId.includes("lit_redstone_ore") ){
            return true;
        }
        else{
            return false;
        }
    }
    else if( blockId.includes("chorus_flower") || blockId.includes("chorus_plant") ){
        if( targetId.includes("chorus_flower") || targetId.includes("chorus_plant") ){
            return true;
        }
        else{
            return false;
        }
    }
    else if( blockId.includes("mushroom_block") ){
        if( targetId.includes("mushroom_block") ){
            return true;
        }
        else{
            return false;
        }
    }
    else if( blockId.includes("dirt") || blockId.includes("grass_block") || blockId.includes("mycelium") || blockId.includes("podzol") ){
        if( targetId.includes("dirt") || targetId.includes("grass_block") || targetId.includes("mycelium") || targetId.includes("podzol") ){
            return true;
        }
        else{
            return false;
        }
    }
    else{
        if( blockId == targetId ){
            return true;
        }
        else{
            return false;
        }
    }
}

export function getBlockisCollective(blockId){
    if( blockId.includes("leaves") || blockId.includes("log") || blockId.includes("stem") || blockId.includes("wart_block") || blockId.includes("mushroom_block") || blockId.includes("ore") ){
        return true
    }
    else{
        return false;
    }
}

export async function blockSeeding(crop,block,player){
    if( breakableCrops.some( item => item.blockId == crop ) ){
        const index = breakableCrops.findIndex(item => item.blockId === crop );
        if( breakableCrops[index].under == undefined || breakableCrops[index].under.includes(block.typeId) ){
            const dim = world.getDimension(player.dimension.id);
            if( getInventoryItem(player,breakableCrops[index].seedItem) > 0 ){
                await system.waitTicks(10);
                if( breakableCrops[index].setBlock != undefined ){
                    dim.setBlockType(block.location,breakableCrops[index].setBlock);
                }
                dim.setBlockType(block.above(1).location,breakableCrops[index].placeBlock);
                player.runCommand(`clear @s ${breakableCrops[index].seedItem} 0 1`);
            }
        }
        else{

        }

    }
    else{
        
    }
}

export const MAX_DISTANCE_X = 2;
export const MAX_DISTANCE_Y_UP = 3;
export const MAX_DISTANCE_Y_DOWN = 1;
export const MAX_DISTANCE_Z = 2;