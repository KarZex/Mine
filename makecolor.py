import numpy as np
from PIL import Image
import os
import json

block_directory = "./behavior_packs/MissileAnd(2)/blocks/colorblock"
block_texture_directory = "./resource_packs/MissileAnd(1)/textures/blocks/colorblock"
terrain_texture_path = "./resource_packs/MissileAnd(1)/textures/terrain_texture.json"

block_json_path = "./tool/colorblock.json"

color_bit = 8
colors = [ int( 256 / color_bit )*i for i in range(color_bit) ]
colors.append(255)

print(colors)

for r_color in colors:
    for g_color in colors:
        for b_color in colors:
            r_color_hex = format(r_color,"02x")
            g_color_hex = format(g_color,"02x")
            b_color_hex = format(b_color,"02x")

            #print( f"#{r_color_hex}{g_color_hex}{b_color_hex}" )

            block_color_id = f"{r_color_hex}{g_color_hex}{b_color_hex}"

            with open( block_json_path,"r" ) as f:
                block_json = json.load(f)
                block_json["minecraft:block"]["description"]["identifier"] = f"zex:color_{block_color_id}"
                block_json["minecraft:block"]["components"]["minecraft:material_instances"]["*"]["texture"] = f"color_{block_color_id}"
                block_json["minecraft:block"]["components"]["minecraft:map_color"] = f"#{block_color_id}"

            with open( f"{block_directory}/color_{block_color_id}.json","w" ) as f:
                json.dump(block_json,f,indent=2)

            img = Image.open(f"{block_texture_directory}/color_000000.png")
            pixels = img.load()
            replace = ( r_color,g_color,b_color )
            pixels[0, 0] = replace
            img.save(f"{block_texture_directory}/color_{block_color_id}.png")

            with open(terrain_texture_path,"r") as f:
                terrain_texture_json = json.load(f)
                terrain_texture_json["texture_data"][f"color_{block_color_id}"] = { "textures": [ f"textures/blocks/colorblock/color_{block_color_id}" ] }

            with open(terrain_texture_path,"w") as f:
                json.dump(terrain_texture_json,f,indent=2) 

            


