import {  world, system, EquipmentSlot,EntityComponentTypes } from "@minecraft/server"
import { ActionFormData, ModalFormData } from "@minecraft/server-ui"
import { isBlockUnder,isBlockFront,absVector2,Vector3Sub, getVector2E,DistanceVector3 } from "./usefulFunction.js"


//Block breaking configuration
export const MAX_BLOCKS = 64;
export const MAX_DISTANCE_X = 2;
export const MAX_DISTANCE_Y_UP = 3;
export const MAX_DISTANCE_Y_DOWN = 1;
export const MAX_DISTANCE_Z = 2;


//define log,leaves, etc. block types

export function breakBlockAnotherId(blockId,targetId){
    if( blockId.includes("leaves") || blockId.includes("log") ){
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

export const defaultProfile = [
    //Like CSV
    //EnableB,MAXBlocksize,BlockSizeRight,BlockSizeLeft,blockSizeUP,BlockSizeDOWN,BlockSizeFoward,BlockSizeBack,itemDropignore,Tree,Ore,crops,placing,BlockSizeRight,BlockSizeLeft,blockSizeUP,BlockSizeDOWN,BlockSizeFoward,BlockSizeBack,torch
    `false,1,2,2,2,2,2,2,0,0,0,false,0,0,0,0,0,0,0`, //Disabled
    `true,64,8,8,8,8,8,8,0,0,0,false,0,0,0,0,0,0,0`, //Default Setting
    `true,512,8,8,32,0,8,8,2,0,0,true,6,6,0,0,6,6,8`, //filling Setting
    `true,64,0,0,1,0,32,0,2,0,0,true,0,0,0,0,16,0,8` //branch mining Setting
]