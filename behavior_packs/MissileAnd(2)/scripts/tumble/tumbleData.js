//tumbleData
import { world, system } from "@minecraft/server";

export const TUMBLE_POS = { x: 1680.0, y: 0, z: 1183.0 };

//slowness or speed block pool for trap layer not falling block pool
export const TRAP_BLOCK_POOL = [
    "minecraft:packed_ice",
    "minecraft:soul_sand", 
    "minecraft:slime",
    "minecraft:blue_ice"
];
export const BLOCK_SETS = {
    //Minecraft 1.8 Bountiful Update (Xbox TU31)
    JEWEL: { 
        random: [
            "minecraft:quartz_block", 
            "minecraft:diamond_block", 
            "minecraft:gold_block", 
            "minecraft:lapis_block", 
            "minecraft:emerald_block"
        ],
        trap: "minecraft:sand" 
    },
    MUSHROOMFIELD: {
        random: [
            "minecraft:mycelium",
            "minecraft:dirt",
            "minecraft:podzol"
        ],
        trap: "minecraft:gravel"
    },
    WOOL: {
        random: [
            "minecraft:white_wool",
            "minecraft:orange_wool", 
            "minecraft:magenta_wool", 
            "minecraft:light_blue_wool", 
            "minecraft:yellow_wool", 
            "minecraft:lime_wool", 
            "minecraft:pink_wool", 
            "minecraft:gray_wool", 
            "minecraft:light_gray_wool", 
            "minecraft:cyan_wool", 
            "minecraft:purple_wool", 
            "minecraft:blue_wool", 
            "minecraft:brown_wool", 
            "minecraft:green_wool", 
            "minecraft:red_wool", 
            "minecraft:black_wool"
        ],
        trap: "minecraft:sand"
    },
    STONE:{
        random: [
            "minecraft:stone",
            "minecraft:cobblestone",
            "minecraft:granite",
            "minecraft:diorite",
            "minecraft:andesite"
        ],
        trap: "minecraft:gravel"
    },
    NATURAL: { 
        random: [
            "minecraft:grass_block",
            "minecraft:dirt"
        ],
        trap: "minecraft:gravel"
    },
    TERRACOTTA: { 
        random: [
            "minecraft:white_terracotta",
            "minecraft:orange_terracotta", 
            "minecraft:magenta_terracotta", 
            "minecraft:light_blue_terracotta", 
            "minecraft:yellow_terracotta", 
            "minecraft:lime_terracotta", 
            "minecraft:pink_terracotta", 
            "minecraft:gray_terracotta", 
            "minecraft:light_gray_terracotta", 
            "minecraft:cyan_terracotta", 
            "minecraft:purple_terracotta", 
            "minecraft:blue_terracotta", 
            "minecraft:brown_terracotta", 
            "minecraft:green_terracotta", 
            "minecraft:red_terracotta", 
            "minecraft:black_terracotta"
        ],
        trap: "minecraft:gravel"
    },
    ORE:{
        random: [
            "minecraft:coal_ore",
            "minecraft:iron_ore",
            "minecraft:gold_ore",
            "minecraft:diamond_ore",
            "minecraft:emerald_ore",
            "minecraft:lapis_ore",
            "minecraft:redstone_ore"
        ],
        trap: "minecraft:gravel"
    },
    MONUMENT:{
        random: [
            "minecraft:prismarine",
            "minecraft:prismarine_bricks",
            "minecraft:dark_prismarine"
        ],
        trap: "minecraft:gravel"
    }


    //Minecraft 1.9 The Combat Update (Xbox TU41)


    //Minecraft 1.10 Frostburn Update (Xbox TU42)

    //Minecraft 1.11 Exploration Update (Xbox TU43)

    //Minecraft 1.12 World of Color Update (Xbox TU44)

    //Minecraft 1.13 Update Aquatic (Bedrock 1.8.0 , Xbox TU69)

    //From now console editon expired
    //Minecraft 1.14 Village & Pillage (Bedrock 1.12.0)

    //Minecraft 1.15 Buzzy Bees (Bedrock 1.14.0)

    //Minecraft 1.16 Nether Update (Bedrock 1.16.0)

    //Minecraft 1.17 Caves & Cliffs Part 1 (Bedrock 1.17.0)

    //Minecraft 1.18 Caves & Cliffs Part 2 (Bedrock 1.18.0)

    //Minecraft 1.19 The Wild Update (Bedrock 1.19.0)

    //Minecraft 1.20 Trails & Tales Update (Bedrock 1.20.0)

    //Minecraft 1.21 Tricky Trials Update (Bedrock 1.21.0)

    //Minecraft 1.21.2 Bundles of Bravery Update (Bedrock 1.21.40)

    //Minecraft 1.21.4 The Garden Awakens Update (Bedrock 1.21.50)

    //Minecraft 1.21.5 Spring to Life Update (Bedrock 1.21.70)

    //Minecraft 1.21.6 Chase the Skies Update (Bedrock 1.21.90)

    //Minecraft 1.21.9 The Copper Age Update (Bedrock 1.21.110)

    //Minecraft 1.21.11 Mounts of Mayhem Update (Bedrock 1.21.130)

    //Minecraft 26.1 Tiny Takeover Update (Bedrock 26.10)
};

export const BLOCK_SET_TYPES = Object.keys(BLOCK_SETS);
export const SHAPES = ["CIRCLE", "SQUARE", "STAR"];