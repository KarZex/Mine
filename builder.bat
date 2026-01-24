@echo off
rd /S /Q output
mkdir output
cd behavior_packs
mkdir AutoMining
xcopy /Y /E .\MissileAnd(2) .\AutoMining
cd ..
cd resource_packs
mkdir AutoMining
xcopy /Y /E .\MissileAnd(1) .\AutoMining
cd ..
python builder.py
"C:\Program Files\7-Zip\7z.exe" a -tzip ./output/AutoMiningB.zip .\behavior_packs\AutoMining
"C:\Program Files\7-Zip\7z.exe" a -tzip ./output/AutoMiningR.zip .\resource_packs\AutoMining
rename output\AutoMiningB.zip Usefull_Addon_B.mcpack
rename output\AutoMiningR.zip Usefull_Addon_R.mcpack
rd /S /Q behavior_packs\AutoMining
rd /S /Q resource_packs\AutoMining
del output\AutoMiningB.zip
del output\AutoMiningR.zip
echo Addon files have been built and renamed successfully.
pause