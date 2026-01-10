#execute as @a run scriptevent zex:pal
#execute as @a[tag=!climb] run execute at @s if block ^^2^0.3 air unless block ^^^0.3 air run scriptevent zex:climb

execute at @e[type=zex:hook_test] run particle minecraft:basic_crit_particle
execute at @e[type=zex:hook_ender] run particle minecraft:eyeofender_death_explode_particle
execute at @e[type=zex:hook_knockback] run particle minecraft:basic_crit_particle
execute at @e[type=zex:hook_rocket] run particle minecraft:basic_crit_particle