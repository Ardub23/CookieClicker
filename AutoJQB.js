//******************************************
// AutoJQB.g Guard v1.0
// by Ardub23 (reddit.com/u/Ardub23)
// 
// CCSE and portions of this program's code
// by klattmose (reddit.com/u/klattmose)
//*******************************************

Game.Win('Third-party');
if(AutoJQB === undefined) var AutoJQB = {};
if(typeof CCSE == 'undefined') Game.LoadMod('https://klattmose.github.io/CookieClicker/' + (0 ? 'Beta/' : '') + 'CCSE.js');
AutoJQB.name = 'Auto JQB';
AutoJQB.version = '1.0';
AutoJQB.GameVersion = '2.019';

AutoJQB.launch = function(){
	AutoJQB.init = function(){
		AutoJQB.isLoaded = 1;
		AutoJQB.Backup = {};
		AutoJQB.config = {};
		
		AutoJQB.loadConfig();
		CCSE.customLoad.push(AutoJQB.loadConfig);
		CCSE.customSave.push(AutoJQB.saveConfig);
		
		AutoJQB.ReplaceGameMenu();
		
		AutoJQB.g = Game.ObjectsById[2].minigame;
		AutoJQB.busy = false;
		AutoJQB.refreshId = setInterval(AutoJQB.autoFarm, 1000*5);
		
		
		//***********************************
		//    Post-Load Hooks 
		//    To support other mods interfacing with this one
		//***********************************
		if(AutoJQB.postloadHooks) {
			for(var i = 0; i < AutoJQB.postloadHooks.length; ++i) {
				(AutoJQB.postloadHooks[i])();
			}
		}
		
		if(Game.Objects['Farm'].level < 9) {
			if (Game.prefs.popups) Game.Popup('Warning: Auto JQB will be disabled until your farms are level 9.');
			else Game.Notify('Warning: Auto JQB will be disabled until your farms are level 9.', '', '', 0, 1);
		} else {
			if (Game.prefs.popups) Game.Popup('Auto JQB loaded!');
			else Game.Notify('Auto JQB loaded!', '', '', 1, 1);
		}
	}


	//***********************************
	//    Configuration
	//***********************************
	AutoJQB.saveConfig = function(config){
		CCSE.save.OtherMods.AutoJQB = AutoJQB.config;
	}

	AutoJQB.loadConfig = function(){
		if(CCSE.save.OtherMods.AutoJQB)
			AutoJQB.config = CCSE.save.OtherMods.AutoJQB;
		else
			AutoJQB.config = {};
		
		// Default values if they're missing
		if(AutoJQB.config.plantQBs === undefined) AutoJQB.config.plantQBs = false;
		if(AutoJQB.config.doGoldenSwitch === undefined) AutoJQB.config.doGoldenSwitch = false;
		if(AutoJQB.config.switchWoodChips === undefined) AutoJQB.config.switchWoodChips = false;
		if(AutoJQB.config.clearJQBTiles === undefined) AutoJQB.config.clearJQBTiles = false;
		if(AutoJQB.config.startSaveScum === undefined) AutoJQB.config.startSaveScum = false;
		if(AutoJQB.config.harvestQBs === undefined) AutoJQB.config.harvestQBs = false;
		if(AutoJQB.config.switchFertilizer === undefined) AutoJQB.config.switchFertilizer = false;
		if(AutoJQB.config.plantElderworts === undefined) AutoJQB.config.plantElderworts = false;
		if(AutoJQB.config.harvestJQBs === undefined) AutoJQB.config.harvestJQBs = false;
	}
	
	AutoJQB.togglePlantQBs = function(){
		AutoJQB.config.plantQBs = !AutoJQB.config.plantQBs;
	}
	
	AutoJQB.toggleDoGoldenSwitch = function(){
		AutoJQB.config.doGoldenSwitch = !AutoJQB.config.doGoldenSwitch;
	}
	
	AutoJQB.toggleSwitchWoodChips = function(){
		AutoJQB.config.switchWoodChips = !AutoJQB.config.switchWoodChips;
	}
	
	AutoJQB.toggleClearJQBTiles = function(){
		AutoJQB.config.clearJQBTiles = !AutoJQB.config.clearJQBTiles;
	}
	
	AutoJQB.toggleStartSaveScum = function(){
		AutoJQB.config.startSaveScum = !AutoJQB.config.startSaveScum;
	}
	
	AutoJQB.toggleHarvestQBs = function(){
		AutoJQB.config.harvestQBs = !AutoJQB.config.harvestQBs;
	}
	
	AutoJQB.toggleSwitchFertilizer = function(){
		AutoJQB.config.switchFertilizer = !AutoJQB.config.switchFertilizer;
	}
	
	AutoJQB.togglePlantElderworts = function(){
		AutoJQB.config.plantElderworts = !AutoJQB.config.plantElderworts;
	}
	
	AutoJQB.toggleHarvestJQBs = function(){
		AutoJQB.config.harvestJQBs = !AutoJQB.config.harvestJQBs;
	}

	//***********************************
	//    Replacement
	//***********************************
	AutoJQB.ReplaceGameMenu = function(){	// TODO
		Game.customOptionsMenu.push(function(){
			var checkbox = function(func, condition){
				return '<input type="checkbox" onclick="' + func + '"' +
						((condition)? ' checked' : '') + '>';
			}
			
			var optionsMenu = ''
			
			if(Game.Objects['Farm'].level < 9) {
				optionsMenu += '<div class="listing"><div class="red"><b>All features of Auto JQB are disabled</b> because your farms are below level 9.</div> <small>(This is done to ensure that nothing goes wrong checking for tiles that aren\'t there. Once your farms are leveled up, this message should disappear.)</small></div>'
			}
			
			optionsMenu += '<div class="listing">' +
				checkbox('AutoJQB.togglePlantQBs()', AutoJQB.config.plantQBs) +
				'Auto-plant queenbeets in an empty garden</div>';
			
			optionsMenu += '<div class="listing">' +
				checkbox('AutoJQB.toggleDoGoldenSwitch()', AutoJQB.config.doGoldenSwitch) +
				'Manage golden switch' +
				'<div class="listing"><small>If the golden switch is on, briefly turn it off when auto-planting (to make seeds cheaper);</div>' +
				'<div class="listing">if it\'s off, briefly turn it on when auto-harvesting queenbeets (to increase gains).</small></div></div>';
			
			optionsMenu += '<div class="listing">' +
				checkbox('AutoJQB.toggleSwitchWoodChips()', AutoJQB.config.switchWoodChips) +
				'Switch soil to wood chips when juicy queenbeets have a chance to appear</div>';
			
			optionsMenu += '<div class="listing">' +
				checkbox('AutoJQB.toggleClearJQBTiles()', AutoJQB.config.clearJQBTiles) +
				'Clear away other plants (e.g. duketaters) in tiles where juicy queenbeets can grow</div>';
			
			optionsMenu += '<div class="listing">' +
				checkbox('AutoJQB.toggleStartSaveScum()', AutoJQB.config.startSaveScum) +
				'Automatically savescum for juicy queenbeets to appear when possible</div>';
			
			optionsMenu += '<div class="listing">' +
				checkbox('AutoJQB.toggleHarvestQBs()', AutoJQB.config.harvestQBs) +
				'Auto-harvest queenbeets after a juicy queenbeet appears</div>';
			
			optionsMenu += '<div class="listing">' +
				checkbox('AutoJQB.toggleSwitchFertilizer()', AutoJQB.config.switchFertilizer) +
				'Switch soil to fertilizer when waiting for plants to grow</div>';
			
			optionsMenu += '<div class="listing">' +
				checkbox('AutoJQB.togglePlantElderworts()', AutoJQB.config.plantElderworts) +
				'Auto-plant elderworts around growing juicy queenbeets</div>';
			
			optionsMenu += '<div class="listing">' +
				checkbox('AutoJQB.toggleHarvestJQBs()', AutoJQB.config.harvestJQBs) +
				'Auto-harvest mature juicy queenbeets (and surrounding elderworts)</div>';
			
			CCSE.AppendCollapsibleOptionsMenu(AutoJQB.name, optionsMenu);
		});
		
		Game.customStatsMenu.push(function(){
			CCSE.AppendStatsVersionNumber(AutoJQB.name, AutoJQB.version);
		});
	}

	
	//***********************************
	//    Auto farm loop
	//***********************************
	
	AutoJQB.autoFarm = function(){
		if(Game.Objects['Farm'].level < 9 || AutoJQB.busy || AutoJQB.g.freeze) return false;
		
		if(AutoJQB.countPlants() == 0) {			// Garden is empty
			if(AutoJQB.config.plantQBs && AutoJQB.g.plants['queenbeet'].unlocked &&
					AutoJQB.canAfford32('queenbeet')) {
				var hadGoldenSwitch = false;
				if(AutoJQB.config.doGoldenSwitch && Game.Has('Golden switch [off]')) {
					hadGoldenSwitch = true;
					Game.Upgrades['Golden switch [on]'].buy();
				}
				
				for(var y = 0; y < 6; y++) {
					for(var x = 0; x < 6; x++) {
						if((x!=1&&x!=4) || (y!=1&&y!=4)) {
							AutoJQB.g.seedSelected = AutoJQB.g.plants['queenbeet'].id;
							AutoJQB.g.clickTile(x,y);
						}
					}
				}
				
				if(hadGoldenSwitch) {
					Game.Upgrades['Golden switch [off]'].buy();
				}
			}
		} else if(AutoJQB.countJQBTiles() > 0) {	// At least one tile can grow a JQB
			if(AutoJQB.config.switchWoodChips)
				l('gardenSoil-4').click();
			
			if(AutoJQB.config.startSaveScum) {
				AutoJQB.mySaveString = Game.WriteSave(1);
				AutoJQB.desiredAmount = AutoJQB.countPlants(22) + 1;
				AutoJQB.busy = true;
				AutoJQB.saveScumLoop = setInterval(AutoJQB.saveScum, 10);
			}
		} else if(AutoJQB.countJQBTiles(true) > 0) {// Waiting for QBs to mature
			if(AutoJQB.config.switchFertilizer)
				l('gardenSoil-1').click();
		} else if(AutoJQB.countPlants(22) > 0) {	// Waiting for JQBs to mature
			if(AutoJQB.config.harvestJQBs) {
				for(var y = 1; y < 5; y++) {
					for(var x = 1; x < 5; x++) {
						var me = AutoJQB.g.getTile(x,y);
						if(me[0] == 22 && me[1] >= AutoJQB.g.plants['queenbeetLump'].mature) {
							AutoJQB.g.clickTile(x,y);
						}
					}
				}
				if(AutoJQB.countPlants(22) == 0) {
					Game.Objects['Farm'].minigame.harvestAll();
					return 1;
				}
			}
			
			if(AutoJQB.config.switchFertilizer)
				l('gardenSoil-1').click();
			
			// Harvest queenbeets
			if(AutoJQB.config.harvestQBs) {
				var hadGoldenSwitch = true;
				if(AutoJQB.config.doGoldenSwitch && Game.Has('Golden switch [on]')) {
					hadGoldenSwitch = false;
					Game.Upgrades['Golden switch [off]'].buy();
				}
				
				for(var y = 0; y < 6; y++) {
					for(var x = 0; x < 6; x++) {
						var me = AutoJQB.g.getTile(x,y);
						
						if(me[0] == 21 && me[1] >= AutoJQB.g.plants['queenbeet'].mature) {
							AutoJQB.g.clickTile(x,y);
						}
					}
				}
				
				if(!hadGoldenSwitch) {
					Game.Upgrades['Golden switch [off]'].buy();
				}
			}
			
			// Plant elderworts
			if(AutoJQB.config.plantElderworts && AutoJQB.g.plants['elderwort'].unlocked &&
					AutoJQB.canAfford32('elderwort')) {
				var hadGoldenSwitch = false;
				if(AutoJQB.config.doGoldenSwitch && Game.Has('Golden switch [off]')) {
					hadGoldenSwitch = true;
					Game.Upgrades['Golden switch [on]'].buy();
				}
				
				for(var y = 0; y < 6; y++) {
					for(var x = 0; x < 6; x++) {
						if(AutoJQB.g.getTile(x,y)[0] == 0 && ((x!=1&&x!=4) || (y!=1&&y!=4))) {
							AutoJQB.g.seedSelected = AutoJQB.g.plants['elderwort'].id;
							AutoJQB.g.clickTile(x,y);
						}
					}
				}
				
				if(hadGoldenSwitch) {
					Game.Upgrades['Golden switch [off]'].buy();
				}
			}
		}
	}
	
	AutoJQB.saveScum = function() {
		if(AutoJQB.g.freeze) return false;
		
		if(AutoJQB.countJQBTiles() == 0) {
			// Stop save-scumming if no more JQBs can grow
			AutoJQB.busy = false;
			clearInterval(AutoJQB.saveScumLoop);
		} else if(AutoJQB.countPlants(22) >= AutoJQB.desiredAmount) {
			// If we've gained a JQB, save and prepare to go for the next one
			AutoJQB.desiredAmount = AutoJQB.countPlants(22) + 1;
			AutoJQB.mySaveString = Game.WriteSave(1);
		} else if(AutoJQB.g.nextStep-Date.now() > 1000*(AutoJQB.g.soilsById[AutoJQB.g.soil].tick*60-2)) {
			// If time is just after a AutoJQB.g tick, load the save
			Game.ImportSaveCode(AutoJQB.mySaveString);
		} else if(AutoJQB.g.nextStep-Date.now() > 500 && AutoJQB.g.nextStep-Date.now() < 1000) {
			// Save again just before a garden tick
			AutoJQB.mySaveString = Game.WriteSave(1);
		}
	}
	
	//***********************************
	//    Check garden state
	//***********************************
	
	AutoJQB.countPlants = function(id) {
		count = 0;
		for (var y=0;y<6;y++){
			for (var x=0;x<6;x++){
				if (AutoJQB.g.isTileUnlocked(x,y)) {
					if((!id && AutoJQB.g.getTile(x,y)[0] > 0) || (id && AutoJQB.g.getTile(x,y)[0] == id)){
						count++;
					}
				}
			}
		}
		return count;
	}
	
	AutoJQB.countJQBTiles = function(includeImmature) {
		var possibleTiles = 0;
		for(var y = 1; y < 5; y++) {
			for(var x = 1; x < 5; x++) {
				if(AutoJQB.g.isTileUnlocked(x,y)) {
					var neighborQBs = 0;
					for(var i = -1; i <= 1; i++) {
						for(var j = -1; j <= 1; j++) {
							if(AutoJQB.g.isTileUnlocked(x+i,y+j) && !(i==0&&j==0)) {
								var neigh = AutoJQB.g.getTile(x+i,y+j);
								if(neigh[0] == 21 && (includeImmature || neigh[1] >= AutoJQB.g.plants['queenbeet'].mature))
									neighborQBs++;
							}
						}
					}
					if(neighborQBs >= 8 && AutoJQB.g.getTile(x,y)[0] != 22) {
						if(AutoJQB.config.clearJQBTiles) {
							AutoJQB.g.harvest(x,y);
							possibleTiles++;
						} else if(AutoJQB.g.getTile(x,y)[0] == 0) {
							possibleTiles++;
						}
					}
				}
			}
		}
		return possibleTiles;
	}
	
	AutoJQB.canAfford32 = function(plant) {
		if(!Game.Has('Golden switch [off]') || !AutoJQB.config.doGoldenSwitch)
			return (Game.cookies >= 32 * (AutoJQB.g.plants[plant].cost*60*Game.cookiesPs));
		
		var cost = Game.cookiesPs * 60 * 60;	// Cost of turning GS off
		
		var goldenSwitchMult=1.5;
		if (Game.Has('Residual luck'))
		{
			var upgrades=Game.goldenCookieUpgrades;
			for (var i in upgrades) {if (Game.Has(upgrades[i])) goldenSwitchMult+=0.1;}
		}
		
		var modifiedCPS = Game.cookiesPs / goldenSwitchMult;
		
		cost += 32 * (AutoJQB.g.plants[plant].cost*60*modifiedCPS);	// Cost of planting 32 after turning GS off
		cost += modifiedCPS * 60 * 60;	// Cost of turning GS back on
		
		return (Game.cookies >= cost);
	}
	
//***********************************
	//    Debug functions
	//***********************************
	
	AutoJQB.debug = {};
	
	AutoJQB.debug.fastFertilizer = function(enable) {
		// Because turbo-charged soil is too fast
		AutoJQB.g.soils['fertilizer'].tick = (enable)?0.125:3;
		
		if(AutoJQB.g.nextStep > Date.now() + AutoJQB.g.soilsById[AutoJQB.g.soil].tick*1000*60)
			AutoJQB.g.nextStep = Date.now() + AutoJQB.g.soilsById[AutoJQB.g.soil].tick*1000*60;
	}
	
	AutoJQB.debug.saveGarden = function() {
		AutoJQB.config.debugGardenSave = AutoJQB.g.plot;
	}
	
	AutoJQB.debug.loadGarden = function() {
		if(AutoJQB.config.debugGardenSave)
			Game.Objects['Farm'].minigame.plot = AutoJQB.config.debugGardenSave;
		// After loading the farm, save the game and reload to see the changes immediately
	}
	
	
	if(CCSE.ConfirmGameVersion(AutoJQB.name, AutoJQB.version, AutoJQB.GameVersion)) AutoJQB.init();
}

if(!AutoJQB.isLoaded){
	if(CCSE && CCSE.isLoaded){
		AutoJQB.launch();
	}
	else{
		if(!CCSE) var CCSE = {};
		if(!CCSE.postLoadHooks) CCSE.postLoadHooks = [];
		CCSE.postLoadHooks.push(AutoJQB.launch);
	}
}