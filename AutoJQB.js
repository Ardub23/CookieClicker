//******************************************
// Auto JQB v0.3.2
// by Ardub23 (reddit.com/u/Ardub23)
// 
// CCSE and portions of this program's code
// by klattmose (reddit.com/u/klattmose)
//*******************************************

Game.Win('Third-party');
if(AutoJQB === undefined) var AutoJQB = {};
if(typeof CCSE == 'undefined') Game.LoadMod('https://klattmose.github.io/CookieClicker/' + (0 ? 'Beta/' : '') + 'CCSE.js');
AutoJQB.name = 'Auto JQB';
AutoJQB.version = '0.3.2';
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
		
		// All settings are off by default
		if(AutoJQB.config.plantQBs === undefined) AutoJQB.config.plantQBs = false;
		if(AutoJQB.config.doGoldenSwitch === undefined) AutoJQB.config.doGoldenSwitch = false;
		if(AutoJQB.config.switchWoodChips === undefined) AutoJQB.config.switchWoodChips = false;
		if(AutoJQB.config.clearJQBTiles === undefined) AutoJQB.config.clearJQBTiles = false;
		if(AutoJQB.config.startSaveScum === undefined) AutoJQB.config.startSaveScum = false;
		if(AutoJQB.config.harvestQBs === undefined) AutoJQB.config.harvestQBs = false;
		if(AutoJQB.config.switchFertilizer === undefined) AutoJQB.config.switchFertilizer = false;
		if(AutoJQB.config.plantElderworts === undefined) AutoJQB.config.plantElderworts = false;
		if(AutoJQB.config.JQBGrowthCount === undefined) AutoJQB.config.JQBGrowthCount = 0;
		if(AutoJQB.config.harvestJQBs === undefined) AutoJQB.config.harvestJQBs = false;
	}
	
	AutoJQB.toggle = function(prefName,button,on,off,invert) {
		AutoJQB.config[prefName]=!AutoJQB.config[prefName];
		l(button).innerHTML = (AutoJQB.config[prefName])?on:off;
		l(button).className='option'+((AutoJQB.config[prefName]^invert)?'':' off');
	}
	
	AutoJQB.setJQBGrowthCount = function(num){
		AutoJQB.config.JQBGrowthCount = num;
	}
	
	AutoJQB.allOn = function(){
		for(var i in AutoJQB.config) {
			if(AutoJQB.config[i] === false) {
				AutoJQB.config[i] = true;
			}
		}
	}
	
	AutoJQB.allOff = function(){
		for(var i in AutoJQB.config) {
			if(AutoJQB.config[i] === true) {
				AutoJQB.config[i] = false;
			}
		}
	}
	
	//***********************************
	//    Replacement
	//***********************************
	AutoJQB.ReplaceGameMenu = function(){
		function WriteButton(prefName,button,on,off,callback,invert){
			var invert=invert?1:0;
			if (!callback) callback='';
			callback+='PlaySound(\'snd/tick.mp3\');';
			return '<a class="option'+((AutoJQB.config[prefName]^invert)?'':' off')+'" id="'+button+'" '+Game.clickStr+'="AutoJQB.toggle(\''+prefName+'\',\''+button+'\',\''+on+'\',\''+off+'\',\''+invert+'\');'+callback+'">'+(AutoJQB.config[prefName]?on:off)+'</a>';
		}
		
		function WriteSlider(slider, leftText, rightText, startValueFunction, callback, min, max, step){
			if (!callback) callback = '';
			if (!min) min = 0;
			if (!max) max = 100;
			if (!step) step = 1;
			return '<div class="sliderBox"><div style="float:left;">' + leftText + '</div><div style="float:right;" id="' + slider + 'RightText">' + rightText.replace('[$]', startValueFunction()) + '</div><input class="slider" style="clear:both;" type="range" min="' + min + '" max="' + max + '" step="' + step + '" value="' + startValueFunction() + '" onchange="' + callback + '" oninput="'+callback+'" onmouseup="PlaySound(\'snd/tick.mp3\');" id="' + slider + '"/></div>';
		}
		
		Game.customOptionsMenu.push(function(){
			var optionsMenu = ''
			
			if(Game.Objects['Farm'].level < 9) {
				optionsMenu += '<div class="listing"><div class="red"><b>All features of Auto JQB are disabled</b> because your farms are below level 9.</div> <small>(This is done to ensure that nothing goes wrong checking for tiles that aren\'t there. Once your farms are leveled up, this message should disappear.)</small></div>'
			}
			
			optionsMenu += '<div class="listing">' +
				WriteButton('plantQBs','plantQBsButton','Plant queenbeets ON','Plant queenbeets OFF') +
				'<label>(auto-plant queenbeets when the garden is empty)</label></div>';
			
			optionsMenu += '<div class="listing">' +
				WriteButton('doGoldenSwitch','doGoldenSwitchButton','Manage golden switch ON','Manage golden switch OFF') +
				'<label>(If the golden switch is on, briefly turn it off when auto-planting; if it\'s off, briefly turn it on when auto-harvesting queenbeets)</div>';
			
			optionsMenu += '<div class="listing">' +
				WriteButton('switchFertilizer','switchFertilizerButton','Switch to fertilizer ON','Switch to fertilizer OFF') +
				'<label>(Switch soil to fertilizer when waiting for plants to grow)</label></div>';
			
			optionsMenu += '<div class="listing">' +
				WriteButton('switchWoodChips','switchWoodChipsButton','Switch to wood chips ON','Switch to wood chips OFF') +
				'<label>(Switch soil to wood chips when juicy queenbeets have a chance to appear)</label></div>';
			
			optionsMenu += '<div class="listing">' +
				WriteButton('clearJQBTiles','clearJQBTilesButton','Clear JQB tiles ON','Clear JQB tiles OFF') +
				'<label>Clear away other plants <small>(e.g. duketaters)</small> in tiles where juicy queenbeets could grow</label></div>';
			
			optionsMenu += '<div class="listing">' +
				WriteButton('startSaveScum','startSaveScumButton','Auto-start savescum ON','Auto-start savescum OFF') +
				'<label>(Begin auto-savescumming for juicy queenbeets as soon as one can appear'
			if(AutoJQB.countJQBTiles() == 0 || AutoJQB.config.startSaveScum) {
				optionsMenu += '; <small>if disabled, buttons to kickstart the savescumming yourself will appear here when a JQB is possible.</small>)</label></div>'
			} else {
				// 'Start auto-savescumming' buttons
				optionsMenu += ')</label></div>';
				optionsMenu += '<div class="listing"><a class="option" '+Game.clickStr+'="AutoJQB.mySaveString=Game.WriteSave(1); AutoJQB.desiredAmount=AutoJQB.countPlants(22)+1; AutoJQB.busy=true; AutoJQB.saveScumLoop=setInterval(AutoJQB.saveScum,10,1); PlaySound(\'snd/tick.mp3\');">Savescum 1 JQB</a> ';
				optionsMenu += '<a class="option" '+Game.clickStr+'="AutoJQB.mySaveString=Game.WriteSave(1); AutoJQB.desiredAmount=AutoJQB.countPlants(22)+1; AutoJQB.busy=true; AutoJQB.saveScumLoop=setInterval(AutoJQB.saveScum,10); PlaySound(\'snd/tick.mp3\');">Savescum max JQBs</a> ';
				optionsMenu += '<a class="option" '+Game.clickStr+'="clearInterval(AutoJQB.saveScumLoop); AutoJQB.busy=false; PlaySound(\'snd/tick.mp3\');"' + (AutoJQB.busy?'':' hidden') + '>Cancel savescumming</a></div>';
			}
			
			optionsMenu += '<div class="listing">' +
				WriteButton('harvestQBs','harvestQBsButton','Harvest queenbeets ON','Harvest queenbeets OFF') +
				'<label>(Harvest queenbeets after all possible juicy queenbeets have appeared)</label></div>';
			
			optionsMenu += '<div class="listing">' +
				WriteButton('plantElderworts','plantElderwortsButton','Plant elderworts ON','Plant elderworts OFF') +
				'<label>Auto-plant elderworts around growing juicy queenbeets</label></div>';
			
			optionsMenu += '<div class="listing">' +
				WriteSlider('JQBGrowthSlider', '# JQBs to scum growth for', '[$]', function(){return AutoJQB.config.JQBGrowthCount}, "AutoJQB.setJQBGrowthCount(Math.round(l('JQBGrowthSlider').value)); l('JQBGrowthSliderRightText').innerHTML = AutoJQB.config.JQBGrowthCount;", 0, 3, 1) + '<label>(Auto-savescum to ensure that the specified number of juicy queenbeets age with each tick; set to 0 to disable. <small>4 isn\'t an option because it usually takes longer than 3 minutes to savescum for all 4 to age.</small>)</label></div>';
			
			optionsMenu += '<div class="listing">' +
				WriteButton('harvestJQBs','harvestJQBsButton','Harvest juicy queenbeets ON','Harvest juicy queenbeets OFF') +
				'<label>(Harvest mature juicy queenbeets; <small>if all that remains is elderworts, they will be harvested too<small>)</label></div>';
			
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
				
				setTimeout(function() {	// Wait 500 ms to ensure that golden switch CPS change registers
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
				}, 500);
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
				if(AutoJQB.countPlants(8) == AutoJQB.countPlants()) {	// All remaining plants are elderworts
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
				
				setTimeout(function() {
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
				}, 500);
			}
			
			// Plant elderworts
			if(AutoJQB.config.plantElderworts && AutoJQB.g.plants['elderwort'].unlocked &&
					AutoJQB.canAfford32('elderwort') && AutoJQB.countPlants(8) == 0) {
				var hadGoldenSwitch = false;
				if(AutoJQB.config.doGoldenSwitch && Game.Has('Golden switch [off]')) {
					hadGoldenSwitch = true;
					Game.Upgrades['Golden switch [on]'].buy();
				}
				
				setTimeout(function(){
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
				}, 500);
			}
			
			// Begin JQB growth savescumming
			if(AutoJQB.config.JQBGrowthCount > 0) {
				if(AutoJQB.JQBLocations === undefined) {
					AutoJQB.JQBLocations = [];
				}
				if(AutoJQB.JQBLocations.length == 0) {
					for(var y = 1; y < 5; y++) {
						for(var x = 1; x < 5; x++) {
							if(AutoJQB.g.getTile(x,y)[0] == 22 && AutoJQB.g.getTile(x,y)[1] < AutoJQB.g.plants['queenbeetLump'].mature) {
								AutoJQB.JQBLocations.push([x,y, AutoJQB.g.getTile(x,y)[1]]);
							}
						}
					}
					AutoJQB.mySaveString = Game.WriteSave(1);
					AutoJQB.saveScumLoop = setInterval(AutoJQB.saveScumJQBGrowth, 10, AutoJQB.config.JQBGrowthCount);
				}
			}
		}
	}
	
	AutoJQB.saveScum = function(justOne) {
		if(AutoJQB.g.freeze || AutoJQB.countJQBTiles() == 0) {
			// Stop save-scumming if garden is frozen or no more JQBs can grow
			AutoJQB.busy = false;
			clearInterval(AutoJQB.saveScumLoop);
		} else if(AutoJQB.countPlants(22) >= AutoJQB.desiredAmount) {
			// If we've gained a JQB, save and prepare to go for the next one
			AutoJQB.desiredAmount = AutoJQB.countPlants(22) + 1;
			AutoJQB.mySaveString = Game.WriteSave(1);
			
			if(justOne) {
				AutoJQB.busy = false;
				clearInterval(AutoJQB.saveScumLoop);
			}
		} else if(AutoJQB.g.nextStep-Date.now() > 1000*(AutoJQB.g.soilsById[AutoJQB.g.soil].tick*60-2)) {
			// If time is just after a AutoJQB.g tick, load the save
			Game.ImportSaveCode(AutoJQB.mySaveString);
		} else if(AutoJQB.g.nextStep-Date.now() > 500 && AutoJQB.g.nextStep-Date.now() < 1000) {
			// Save again just before a garden tick
			AutoJQB.mySaveString = Game.WriteSave(1);
		}
	}
	
	AutoJQB.saveScumJQBGrowth = function(count) {
		if(!count) count = 1;
		
		if(AutoJQB.g.freeze || AutoJQB.JQBLocations.length == 0 || AutoJQB.config.JQBGrowthCount == 0) {
			// Stop savescumming if garden is frozen, no JQBs are immature, or option is disabled
			clearInterval(AutoJQB.saveScumLoop);
			AutoJQB.busy = false;
			AutoJQB.JQBLocations = [];
			return false;
		}
		
		var numGrown = 0;
		
		// Count # of JQBs that have grown
		for(var i = 0; i < AutoJQB.JQBLocations.length; i++) {
			var me = AutoJQB.JQBLocations[i];
			if(AutoJQB.g.getTile(me[0],me[1])[1] > me[2]) {
				numGrown++;
			}
		}
		
		// If (count) or more have grown
		if(numGrown >= Math.min(AutoJQB.JQBLocations.length, count)) {
			AutoJQB.mySaveString = Game.WriteSave(1);
			
			// Update JQBLocations
			for(var i = 0; i < AutoJQB.JQBLocations.length; i++) {
				var me = AutoJQB.JQBLocations[i];
				AutoJQB.JQBLocations[i][2] = AutoJQB.g.getTile(me[0],me[1])[1];
				// If the JQB is mature or missing, remove it from consideration
				if(AutoJQB.g.getTile(me[0],me[1])[0] != 22 || [1] >= AutoJQB.g.plants['queenbeetLump'].mature) {
					AutoJQB.JQBLocations.splice(i,1);
					i--;
				}
			}
		} else if(AutoJQB.g.nextStep-Date.now() > 1000*(AutoJQB.g.soilsById[AutoJQB.g.soil].tick*60-2)) {
			// If time is just after a garden tick, load the save
			Game.ImportSaveCode(AutoJQB.mySaveString);
		} else if(AutoJQB.g.nextStep-Date.now() > 500 && AutoJQB.g.nextStep-Date.now() < 1000) {
			// Save again just before a garden tick
			AutoJQB.mySaveString = Game.WriteSave(1);
		}
	}
	
	//***********************************
	//    Functions to assess garden state
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
						}
						if(AutoJQB.g.getTile(x,y)[0] == 0) {
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
		
		if(AutoJQB.g.nextStep > Date.now() + AutoJQB.g.soilsById[AutoJQB.g.soil].tick*1000*60) {
			AutoJQB.g.nextStep = Date.now() + AutoJQB.g.soilsById[AutoJQB.g.soil].tick*1000*60;
			AutoJQB.mySaveString = Game.WriteSave(1);	// So the change doesn't get overwritten if a savescum loop is active
		}
	}
	
	AutoJQB.debug.saveGarden = function() {
		AutoJQB.config.debugGardenSave = Game.Objects['Farm'].minigame.plot;
	}
	
	// After loading the farm, changes won't be immediately visible; save and reload to see them.
	AutoJQB.debug.loadGarden = function() {
		if(AutoJQB.config.debugGardenSave)
			Game.Objects['Farm'].minigame.plot = AutoJQB.config.debugGardenSave;
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