//******************************************
// Auto JQB v1.1.0
// by Ardub23 (reddit.com/u/Ardub23)
// 
// CCSE and portions of this program's code
// by klattmose (reddit.com/u/klattmose)
//*******************************************

Game.Win('Third-party');
if(AutoJQB === undefined) var AutoJQB = {};
if(typeof CCSE == 'undefined') Game.LoadMod('https://klattmose.github.io/CookieClicker/' + (0 ? 'Beta/' : '') + 'CCSE.js');
AutoJQB.name = 'Auto JQB';
AutoJQB.version = '1.1.0';
AutoJQB.GameVersion = '2.031';

AutoJQB.launch = function(){
	AutoJQB.init = function(){
		AutoJQB.isLoaded = 1;
		AutoJQB.Backup = {};
		AutoJQB.config = {};
		
		AutoJQB.config = AutoJQB.defaultConfig();
		CCSE.customLoad.push(AutoJQB.load);
		CCSE.customSave.push(AutoJQB.save);
		
		CCSE.MinigameReplacer(AutoJQB.ReplaceFarmTooltip, 'Farm');
		AutoJQB.ReplaceGameMenu();
		
		AutoJQB.g = Game.Objects['Farm'].minigame;
		CCSE.MinigameReplacer(function(){
			AutoJQB.g = Game.Objects['Farm'].minigame;
			AutoJQB.busy = false;
			AutoJQB.scumCount = 0;
			AutoJQB.refreshId = setInterval(AutoJQB.autoFarm, 1000*5);	// run every 5 seconds
		}, 'Farm');
		
		
		//***********************************
		//    Post-Load Hooks 
		//    To support other mods interfacing with this one
		//***********************************
		if(AutoJQB.postloadHooks) {
			for(var i = 0; i < AutoJQB.postloadHooks.length; ++i) {
				(AutoJQB.postloadHooks[i])();
			}
		}
		
		var startupStr = (Game.Objects['Farm'].level < 3)
				? 'Warning: Auto JQB will be disabled until your farms are level 3.'
				: 'Auto JQB loaded!'
		
		if (Game.prefs.popups)
			Game.Popup(startupStr);
		else
			Game.Notify(startupStr, '', '', 0, 1);
	}
	
	//***********************************
	//    Configuration
	//***********************************
	AutoJQB.save = function(){
		if(CCSE.config.OtherMods.AutoJQB)
			delete CCSE.config.OtherMods.AutoJQB; // no need to keep this, it's now junk data
		return JSON.stringify(AutoJQB.config);
	}

	AutoJQB.load = function(str){
		if(!str) return;
		var config = JSON.parse(str);
		for(var pref in config){
			AutoJQB.config[pref] = config[pref];
		}
	}
	
	AutoJQB.defaultConfig = function(){
		return {
			plantQBs: false,
			doGoldenSwitch: false,
			switchFertilizer: false,
			switchWoodChips: false,
			clearJQBTiles: false,
			startSaveScum: false,
			harvestQBs: false,
			plantElderworts: false,
			JQBGrowthCount: 0,
			harvestJQBs: false
		};
	}
	
	AutoJQB.toggle = function(prefName,button,on,off,invert) {
		AutoJQB.config[prefName]=!AutoJQB.config[prefName];
		l(button).innerHTML = (AutoJQB.config[prefName])?on:off;
		l(button).className='option'+((AutoJQB.config[prefName]^invert)?'':' off');
	}
	
	AutoJQB.recommendedSettings = function() {
		if(!AutoJQB.config.plantQBs) l('plantQBsButton').click();
		if(!AutoJQB.config.doGoldenSwitch) l('doGoldenSwitchButton').click();
		if(!AutoJQB.config.switchFertilizer) l('switchFertilizerButton').click();
		if(AutoJQB.config.switchWoodChips) l('switchWoodChipsButton').click();
		if(!AutoJQB.config.clearJQBTiles) l('clearJQBTilesButton').click();
		if(!AutoJQB.config.startSaveScum) l('startSaveScumButton').click();
		if(!AutoJQB.config.harvestQBs) l('harvestQBsButton').click();
		if(!AutoJQB.config.plantElderworts) l('plantElderwortsButton').click();
		AutoJQB.config.JQBGrowthCount = l('JQBGrowthSliderRightText').innerHTML = l('JQBGrowthSlider').value = 3;
		if(!AutoJQB.config.harvestJQBs) l('harvestJQBsButton').click();
	}
	
	AutoJQB.allOff = function() {
		if(AutoJQB.config.plantQBs) l('plantQBsButton').click();
		if(AutoJQB.config.doGoldenSwitch) l('doGoldenSwitchButton').click();
		if(AutoJQB.config.switchFertilizer) l('switchFertilizerButton').click();
		if(AutoJQB.config.switchWoodChips) l('switchWoodChipsButton').click();
		if(AutoJQB.config.clearJQBTiles) l('clearJQBTilesButton').click();
		if(AutoJQB.config.startSaveScum) l('startSaveScumButton').click();
		if(AutoJQB.config.harvestQBs) l('harvestQBsButton').click();
		if(AutoJQB.config.plantElderworts) l('plantElderwortsButton').click();
		AutoJQB.config.JQBGrowthCount = l('JQBGrowthSliderRightText').innerHTML = l('JQBGrowthSlider').value = 0;
		if(AutoJQB.config.harvestJQBs) l('harvestJQBsButton').click();
	}
	
	AutoJQB.setJQBGrowthCount = function(num){
		AutoJQB.config.JQBGrowthCount = num;
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
			
			if(Game.Objects['Farm'].level < 3) {
				optionsMenu += '<div class="listing"><div style="color:#FF5555"><big>All features of Auto JQB are disabled because your farms are below level 9.</big></div> <small>(This is done to ensure that nothing goes wrong checking for tiles that aren\'t there. Once your farms are leveled up, this message should disappear.)</small></div>'
			}
			
			optionsMenu += '<div class="listing">' +
				'<a class="option" id="RecommendedOptionsButton" ' + Game.clickStr +
				'="AutoJQB.recommendedSettings();">Recommended settings</a> ' +
				'<a class="option" id="AllOffButton" ' + Game.clickStr +
				'="AutoJQB.allOff();">All settings OFF</a></div>';
			
			optionsMenu += '<div class="listing">' +
				WriteButton('plantQBs','plantQBsButton','Plant queenbeets ON','Plant queenbeets OFF') +
				'<label>(plant queenbeets when the garden is empty)</label><br/>';
			
			optionsMenu +=
				WriteButton('doGoldenSwitch','doGoldenSwitchButton','Manage golden switch ON','Manage golden switch OFF') +
				'<label>(if the golden switch is on, briefly turn it off when auto-planting; if it\'s off, briefly turn it on when auto-harvesting queenbeets)</label><br/>';
			
			optionsMenu +=
				WriteButton('switchFertilizer','switchFertilizerButton','Switch to fertilizer ON','Switch to fertilizer OFF') +
				'<label>(switch soil to fertilizer when waiting for plants to grow)</label><br/>';
			
			optionsMenu +=
				WriteButton('switchWoodChips','switchWoodChipsButton','Switch to wood chips ON','Switch to wood chips OFF') +
				'<label>(switch soil to wood chips when juicy queenbeets have a chance of appearing; <small>not recommended if "Auto-start savescum" is on</small>)</label><br/>';
			
			optionsMenu +=
				WriteButton('clearJQBTiles','clearJQBTilesButton','Clear JQB tiles ON','Clear JQB tiles OFF') +
				'<label>(clear away other plants, <small>e.g. duketaters,</small> in tiles where juicy queenbeets could grow)</label><br/>';
			
			optionsMenu +=
				WriteButton('startSaveScum','startSaveScumButton','Auto-start savescum ON','Auto-start savescum OFF') +
				'<label>(begin auto-savescumming for juicy queenbeets as soon as one can appear'
			if(AutoJQB.countJQBTiles() == 0 || AutoJQB.config.startSaveScum) {
				optionsMenu += '; <small>if disabled, buttons to kickstart the savescumming yourself will appear here when a JQB is possible</small>)</label><br/>'
			} else {
				optionsMenu += ')</label><br/>';
				
				// 'Start auto-savescumming' buttons
				optionsMenu += '<a class="option' + (AutoJQB.scumCount!=1&&!AutoJQB.g.freeze?'':' off') + '" id="scum1JQBButton" '+Game.clickStr+'="AutoJQB.setScum(1); PlaySound(\'snd/tick.mp3\');">Savescum 1 JQB</a> ';
				optionsMenu += '<a class="option' + (AutoJQB.scumCount<=1&&!AutoJQB.g.freeze?'':' off') + '" id="scumMaxJQBsButton" '+Game.clickStr+'="AutoJQB.setScum(4); PlaySound(\'snd/tick.mp3\');">Savescum max JQBs</a> ';
				optionsMenu += '<a class="option' + (AutoJQB.scumCount>0&&!AutoJQB.g.freeze?'':' off') + '" id="cancelSaveScumButton" '+Game.clickStr+'=AutoJQB.setScum(0); "PlaySound(\'snd/tick.mp3\');">Cancel savescumming</a><br/>';
			}
			
			optionsMenu +=
				WriteButton('harvestQBs','harvestQBsButton','Harvest queenbeets ON','Harvest queenbeets OFF') +
				'<label>(harvest queenbeets after all possible juicy queenbeets have appeared)</label><br/>';
			
			optionsMenu +=
				WriteButton('plantElderworts','plantElderwortsButton','Plant elderworts ON','Plant elderworts OFF') +
				'<label>(plant elderworts around growing juicy queenbeets)</label><br/>';
			
			optionsMenu +=
				WriteSlider('JQBGrowthSlider', '# JQBs to scum growth for', '[$]', function(){return AutoJQB.config.JQBGrowthCount}, "AutoJQB.setJQBGrowthCount(Math.round(l('JQBGrowthSlider').value)); l('JQBGrowthSliderRightText').innerHTML = AutoJQB.config.JQBGrowthCount;", 0, 4, 1) + '<label>(savescum to ensure that the specified number of juicy queenbeets age with each tick; <small>4 is not recommended, as it can take longer than three minutes to get all 4 to age</small>)</label><br/>';
			
			optionsMenu +=
				WriteButton('harvestJQBs','harvestJQBsButton','Harvest juicy queenbeets ON','Harvest juicy queenbeets OFF') +
				'<label>(harvest mature juicy queenbeets; <small>if this leaves nothing but elderworts, they will be harvested too<small>)</label></div>';
			
			CCSE.AppendCollapsibleOptionsMenu(AutoJQB.name, optionsMenu);
		});
		
		Game.customStatsMenu.push(function(){
			CCSE.AppendStatsVersionNumber(AutoJQB.name, AutoJQB.version);
		});
	}
	
	AutoJQB.ReplaceFarmTooltip = function() {
		if(!Game.customMinigame['Farm'].toolTooltip)
			Game.customMinigame['Farm'].toolTooltip = [];
		if(AutoJQB.status == undefined) AutoJQB.status = 'Not yet determined';
		Game.customMinigame['Farm'].toolTooltip.push(function(id, str){
			if(id == 0) {
				var statusLine = '<!--BeginAJQBStatus--><div width="100%">' +
						'<b>Auto JQB status:</b><br/>' +
						AutoJQB.status;
				
				if(AutoJQB.g.soils['fertilizer'].tick == 0.125)
					statusLine += '<br/>(<b>Debug:</b> fast fertilizer active)';
				
				statusLine += '</div><!--EndAJQBStatus-->';
				
				if(str.indexOf('<!--BeginSeedSeekList-->') > 0) {
					// Add status immediately before Seed Seek list, if present
					return str.substring(0, str.indexOf('<!--BeginSeedSeekList-->')) +
							statusLine + '<div class="line" style="clear:both;"></div>' +
							str.substring(str.indexOf('<!--BeginSeedSeekList-->'));
				} else {
					// Otherwise, add status after tutorial
					return str.substring(0, str.indexOf('</small>')+8) +
							'<div class="line" style="clear:both;"></div>' +
							statusLine + str.substring(str.indexOf('</small>')+8);
				}
			} else return str;
		});
	}
	
	//***********************************
	//    Auto farm loop
	//***********************************
	
	AutoJQB.autoFarm = function() {
		var g = AutoJQB.g;
		
		if(Game.Objects['Farm'].level < 3)
			AutoJQB.status = 'Disabled until farms are level 3';
		else if(g.freeze)
			AutoJQB.status = 'Disabled while garden is frozen';
		
		if(Game.Objects['Farm'].level < 3 || AutoJQB.busy || g.freeze)
			return false;
		
		// Harvest mature JQBs
		if(AutoJQB.config.harvestJQBs) {
			for(var y = 1; y < 5; y++) {
				for(var x = 1; x < 5; x++) {
					var me = g.getTile(x,y);
					if(me[0] == 22 && me[1] >= g.plants['queenbeetLump'].mature) {
						g.clickTile(x,y);
					}
				}
			}
			if(AutoJQB.countPlants(8) + AutoJQB.countPlants(13) == AutoJQB.countPlants()) {
				// All remaining plants are elderworts or meddleweeds
				Game.Objects['Farm'].minigame.harvestAll();
			}
		}
		
		if(AutoJQB.countPlants() == 0) {	// Garden is empty
			AutoJQB.status = 'Waiting for queenbeets to be ' +
					(!g.plants['queenbeet'].unlocked? 'unlocked'
							: !AutoJQB.canAfford('queenbeet')? 'affordable'
															 : 'planted');
			
			if(AutoJQB.config.plantQBs && g.plants['queenbeet'].unlocked &&
					AutoJQB.canAfford('queenbeet')) {
				AutoJQB.status = 'Planting queenbeets';
				AutoJQB.hadGoldenSwitch = false;
				if(AutoJQB.config.doGoldenSwitch && Game.Has('Golden switch [off]')) {
					AutoJQB.hadGoldenSwitch = true;
					Game.Upgrades['Golden switch [on]'].buy();
				}
				
				setTimeout(function() {	// Wait 500 ms to ensure that GS CPS change registers
					AutoJQB.plantQBs();
					
					if(AutoJQB.hadGoldenSwitch) {
						Game.Upgrades['Golden switch [off]'].buy();
					}
				}, 500);
			}
		} else if(AutoJQB.countJQBTiles() > 0) {	// At least one tile can grow a JQB
			if(AutoJQB.config.switchWoodChips)
				l('gardenSoil-4').click();
			
			if(AutoJQB.config.startSaveScum) {
				AutoJQB.status = 'Waiting for garden tick to savescum for JQB to appear';
				AutoJQB.mySaveString = Game.WriteSave(1);
				AutoJQB.desiredAmount = AutoJQB.countPlants(22) + 1;
				AutoJQB.busy = true;
				AutoJQB.saveScumLoop = setInterval(AutoJQB.saveScum, 10);
			} else {
				AutoJQB.status = 'Waiting for JQBs to appear';
			}
		} else if(AutoJQB.countJQBTiles(true) > 0) {// Waiting for QBs to mature
			AutoJQB.status = 'Waiting for queenbeets to mature';
			if(AutoJQB.config.switchFertilizer)
				l('gardenSoil-1').click();
		} else if(AutoJQB.countPlants(22) > 0) {	// Waiting for JQBs to mature
			AutoJQB.status = (AutoJQB.config.harvestJQBs)
					? 'Waiting to harvest JQBs once mature'
					: 'Waiting for JQBs to mature';
			
			if(AutoJQB.config.switchFertilizer)
				l('gardenSoil-1').click();
			
			// Harvest queenbeets (their purpose is already served)
			if(AutoJQB.config.harvestQBs && AutoJQB.countPlants(21) > 0) {
				AutoJQB.hadGoldenSwitch = true;
				if(AutoJQB.config.doGoldenSwitch && Game.Has('Golden switch [on]')) {
					// Turn GS on before harvesting queenbeets
					AutoJQB.hadGoldenSwitch = false; // to turn it back off later
					Game.Upgrades['Golden switch [off]'].buy();
				}
				
				setTimeout(function() {
					for(var y = 0; y < 6; y++) {
						for(var x = 0; x < 6; x++) {
							var me = g.getTile(x,y);
							
							if(me[0] == 21 && me[1] >= g.plants['queenbeet'].mature) {
								g.clickTile(x,y);
							}
						}
					}
					
					if(!AutoJQB.hadGoldenSwitch) {
						Game.Upgrades['Golden switch [on]'].buy();
					}
				}, 500);
			}
			
			// Plant elderworts
			if(AutoJQB.config.plantElderworts && g.plants['elderwort'].unlocked &&
					AutoJQB.canAfford('elderwort') && // TODO: Determine # needed
					AutoJQB.countPlants(8) == 0) {
				AutoJQB.hadGoldenSwitch = false;
				if(AutoJQB.config.doGoldenSwitch && Game.Has('Golden switch [off]')) {
					AutoJQB.hadGoldenSwitch = true;
					Game.Upgrades['Golden switch [on]'].buy();
				}
				
				setTimeout(function(){
					for(var y = 1; y < 5; y++) {
						for(var x = 1; x < 5; x++) {
							// If this is an immature JQB
							if(g.getTile(x,y)[0] == 22 &&
									g.getTile(x,y)[1] < g.plants['queenbeetLump'].mature) {
								// Plant elderworts in the surrounding tiles
								for(var y2 = -1; y2 <= 1; y2++) {
									for(var x2 = -1; x2 <= 1; x2++) {
										if((y2 != 0 || x2 != 0) &&
												g.isTileUnlocked(x+x2,y+y2) &&
												g.getTile(x+x2,y+y2)[0] == 0) {
											g.seedSelected = g.plants['elderwort'].id;
											g.clickTile(x+x2,y+y2);
										}
									}
								}
							}
						}
					}
					
					if(AutoJQB.hadGoldenSwitch) {
						Game.Upgrades['Golden switch [off]'].buy();
					}
				}, 500);
			}
			
			// Begin JQB growth savescumming
			if(AutoJQB.config.JQBGrowthCount > 0) {
				AutoJQB.status = 'Waiting for garden tick to savescum JQB growth';
				if(AutoJQB.JQBLocations === undefined) {
					// This is a list of JQBs in the garden;
					// each element is an array of the form [x, y, age]
					AutoJQB.JQBLocations = [];
				}
				if(AutoJQB.JQBLocations.length == 0) {
					for(var y = 1; y < 5; y++) {
						for(var x = 1; x < 5; x++) {
							// If this is an immature JQB
							if(g.getTile(x,y)[0] == 22 &&
									g.getTile(x,y)[1] < g.plants['queenbeetLump'].mature) {
								AutoJQB.JQBLocations.push([x, y, g.getTile(x,y)[1]]);
							}
						}
					}
					AutoJQB.mySaveString = Game.WriteSave(1);
					AutoJQB.saveScumLoop = setInterval(AutoJQB.saveScumJQBGrowth, 10);
				}
			}
		} else {
			AutoJQB.status = 'On hold (unknown garden state; clear your garden to enable auto-farming)';
		}
	}
	
	AutoJQB.plantQBs = function() {
		var g = AutoJQB.g;
		
		var xMin, yMin, xMax, yMax;
		var xExc1, xExc2, yExc1, yExc2;
		
		switch(Game.Objects['Farm'].level) {
			case 0:
			case 1:
			case 2:
				console.log('Error: AutoJQB.plantQBs() called with farm level < 3');
				return;
			case 3:
			case 4:
			case 5:
				xMin = yMin = 2;
				xMax = yMax = 4;
				xExc1 = xExc2 = yExc1 = yExc2 = 3;
				break;
			case 6:
				xMin = yMin = 1;
				xMax = 5;
				yMax = 3;
				xExc1 = 2; xExc2 = 4;
				yExc1 = yExc2 = 2;
				break;
			case 7:
				xMin = yMin = 1;
				xMax = yMax = 5;
				xExc1 = yExc1 = 2;
				xExc2 = yExc2 = 4;
				break;
			case 8:
				xMin = 0;
				yMin = 1;
				xMax = yMax = 5;
				xExc1 = 1;
				yExc1 = 2;
				xExc2 = yExc2 = 4;
				break;
			case 9:
			default:
				xMin = yMin = 0;
				xMax = yMax = 5;
				xExc1 = yExc1 = 1;
				xExc2 = yExc2 = 4;
		}
		
		console.log('xMin:' + xMin + ' xMax:' + xMax + ' yMin:' + yMin + ' yMax:' + yMax)
		console.log('xExc1:' + xExc1 + ' xExc2:' + xExc2 + ' yExc1:' + yExc1 + ' yExc2:' + yExc2);
		
		for(var y = yMin; y <= yMax; y++) {
			for(var x = xMin; x <= xMax; x++) {
				if((x!=xExc1 && x!=xExc2) || (y!=yExc1 && y!=yExc2)) {
					g.seedSelected = g.plants['queenbeet'].id;
					g.clickTile(x,y);
				}
			}
		}
	}
	
	AutoJQB.setScum = function(count) {
		if(count === undefined || count < 0) count = 0;
		AutoJQB.scumCount = count;
		
		if(count == 0) {
			clearInterval(AutoJQB.saveScumLoop);
			AutoJQB.busy=false;
		} else {
			AutoJQB.mySaveString=Game.WriteSave(1);
			AutoJQB.desiredAmount=AutoJQB.countPlants(22)+1;
			AutoJQB.busy=true;
			clearInterval(AutoJQB.saveScumLoop);
			AutoJQB.saveScumLoop=setInterval(AutoJQB.saveScum,10,(count==1)); 
		}
		// If garden is frozen, all three buttons are dimmed to show that they're inactive
		l('scum1JQBButton').className = 'option' +
				(AutoJQB.scumCount!=1 && !AutoJQB.g.freeze? '' : ' off');
		l('scumMaxJQBsButton').className = 'option' +
				(AutoJQB.scumCount<=1 && !AutoJQB.g.freeze? '' : ' off');
		l('cancelSaveScumButton').className = 'option' +
				(AutoJQB.scumCount>0 && !AutoJQB.g.freeze? '' : ' off');
	}
	
	AutoJQB.saveScum = function(justOne) {
		var g = AutoJQB.g;
		
		if(g.freeze || AutoJQB.countJQBTiles() == 0) {
			// Stop save-scumming if garden is frozen or no more JQBs can grow
			AutoJQB.busy = false;
			AutoJQB.scumCount = 0;
			clearInterval(AutoJQB.saveScumLoop);
		} else if(AutoJQB.countPlants(22) >= AutoJQB.desiredAmount) {
			// If we've gained a JQB, save and prepare to go for the next one
			AutoJQB.mySaveString = Game.WriteSave(1);
			
			if(justOne || AutoJQB.countJQBTiles() == 0) {
				// Done save scumming
				AutoJQB.status = 'Finished savescumming; determining what to do next';
				AutoJQB.scumCount = 0;
				AutoJQB.busy = false;
				clearInterval(AutoJQB.saveScumLoop);
			} else {
				AutoJQB.status = 'Got a JQB; preparing to savescum for another';
				AutoJQB.desiredAmount = AutoJQB.countPlants(22) + 1;
				// Pause the loop for 3 seconds
				clearInterval(AutoJQB.saveScumLoop);
				setTimeout(function() {
					AutoJQB.saveScumLoop = setInterval(AutoJQB.saveScum, 10);
				}, 3000);
			}
		} else if(g.nextStep - Date.now() > 1000*(g.soilsById[g.soil].tick*60-2)) {
			// If time is just after a garden tick, load the save
			AutoJQB.status = 'Savescumming for a JQB to appear';
			Game.ImportSaveCode(AutoJQB.mySaveString);
		} else if(g.nextStep - Date.now() > 500 && g.nextStep-Date.now() < 1000) {
			// Save again just before a garden tick
			AutoJQB.status = 'Preparing to savescum for a JQB to appear';
			AutoJQB.mySaveString = Game.WriteSave(1);
		}
	}
	
	AutoJQB.saveScumJQBGrowth = function() {
		var g = AutoJQB.g;
		
		if(g.freeze || AutoJQB.JQBLocations.length == 0 || AutoJQB.countPlants(22) == 0 ||
				AutoJQB.config.JQBGrowthCount == 0) {
			// Stop savescumming if garden is frozen, no JQBs are immature, or option is disabled
			clearInterval(AutoJQB.saveScumLoop);
			AutoJQB.busy = false;
			AutoJQB.JQBLocations = [];
			return false;
		}
		
		var numGrown = 0;
		var target = Math.min(AutoJQB.JQBLocations.length, AutoJQB.config.JQBGrowthCount);
		
		// Count # of JQBs that have grown
		for(var i = 0; i < AutoJQB.JQBLocations.length; i++) {
			var me = AutoJQB.JQBLocations[i];
			if(g.getTile(me[0],me[1])[1] > me[2]) {
				numGrown++;
			}
		}
		
		// If (count) or more have grown
		if(numGrown >= target) {
			AutoJQB.status = numGrown + ' JQB' + (numGrown>1? 's' : '') +
					' aged; preparing to savescum on next tick';
			AutoJQB.mySaveString = Game.WriteSave(1);
			
			// Update ages in JQBLocations
			for(var i = 0; i < AutoJQB.JQBLocations.length; i++) {
				var me = AutoJQB.JQBLocations[i];
				AutoJQB.JQBLocations[i][2] = g.getTile(me[0],me[1])[1];
				// If the JQB is mature or missing, remove it from consideration
				if(g.getTile(me[0],me[1])[0] != 22 ||
						g.getTile(me[0],me[1])[1] >= g.plants['queenbeetLump'].mature) {
					AutoJQB.JQBLocations.splice(i,1);
					i--;
				}
			}
			
			// Pause the loop for 3 seconds
			clearInterval(AutoJQB.saveScumLoop);
			setTimeout(function() {
				AutoJQB.saveScumLoop = setInterval(AutoJQB.saveScumJQBGrowth, 10);
			}, 3000);
		} else if(g.nextStep-Date.now() > 1000*(g.soilsById[g.soil].tick*60-2)) {
			// If time is just after a garden tick, load the save
			AutoJQB.status = 'Savescumming for ' + target +
					' JQB' + (target>1? 's' : '') + ' to age';
			Game.ImportSaveCode(AutoJQB.mySaveString);
		} else if(g.nextStep-Date.now() > 500 && g.nextStep-Date.now() < 1000) {
			// Save again just before a garden tick
			AutoJQB.status = 'About to savescum for ' + target +
					' JQB' + (target>1? 's' : '') + ' to age';
			AutoJQB.mySaveString = Game.WriteSave(1);
		}
	}
	
	//***********************************
	//    Functions to assess garden state
	//***********************************
	
	AutoJQB.countPlants = function(id) {
		var g = AutoJQB.g;
		
		count = 0;
		for (var y=0;y<6;y++){
			for (var x=0;x<6;x++){
				if (g.isTileUnlocked(x,y)) {
					if((!id && g.getTile(x,y)[0] > 0) || (id && g.getTile(x,y)[0] == id)){
						count++;
					}
				}
			}
		}
		return count;
	}
	
	AutoJQB.countJQBTiles = function(includeImmature) {
		if(AutoJQB.g === undefined) return false;
		
		var g = AutoJQB.g;
		
		var possibleTiles = 0;
		for(var y = 1; y < 5; y++) {
			for(var x = 1; x < 5; x++) {
				if(g.isTileUnlocked(x,y)) {
					var neighborQBs = 0;
					for(var i = -1; i <= 1; i++) {
						for(var j = -1; j <= 1; j++) {
							if(g.isTileUnlocked(x+i,y+j) && !(i==0&&j==0)) {
								var neigh = g.getTile(x+i,y+j);
								if(neigh[0] == 21 && (includeImmature || neigh[1] >= g.plants['queenbeet'].mature))
									neighborQBs++;
							}
						}
					}
					if(neighborQBs >= 8 && g.getTile(x,y)[0] != 22) {
						if(AutoJQB.config.clearJQBTiles) {
							g.harvest(x,y);
						}
						if(g.getTile(x,y)[0] == 0) {
							possibleTiles++;
						}
					}
				}
			}
		}
		return possibleTiles;
	}
	
	AutoJQB.canAfford = function(plant) {
		var g = AutoJQB.g;
		
		var count;
		switch(Game.Objects['Farm'].level) {
			case 0:
			case 1:
			case 2:
				console.log('Error: AutoJQB.canAfford() called with farm level < 3');
				return false;
			case 3:
			case 4:
			case 5:
				count = 8;
				break;
			case 6:
				count = 13;
				break;
			case 7:
				count = 21;
				break;
			case 8:
				count = 26;
				break;
			case 9:
			default:
				count = 32;
		}
		
		if(!Game.Has('Golden switch [off]') // GS is off (or not even available)
				|| !AutoJQB.config.doGoldenSwitch) {
			// Use current CpS to determine cost
			return (Game.cookies >= count * (g.plants[plant].cost*60*Game.cookiesPs));
		}
		
		// Calculate cost based on lower sans-GS CpS
		var cost = Game.Upgrades['Golden switch [off]'].getPrice();	// Cost of turning GS off
		
		// Determine how much the GS is affecting CpS
		var goldenSwitchMult = 1.5;
		if(Game.Has('Residual luck')) {
			var upgrades = Game.goldenCookieUpgrades;
			for(var i in upgrades) {
				if(Game.Has(upgrades[i]))
					goldenSwitchMult += 0.1;
			}
		}
		
		var modifiedCPS = Game.cookiesPs / goldenSwitchMult;
		// Cost of planting after turning GS off
		cost += count * (g.plants[plant].cost*60*modifiedCPS);
		
		// Cost of turning GS back on
		cost += Game.Upgrades['Golden switch [off]'].getPrice() / goldenSwitchMult;
		
		// We're ignoring the possibility that it might be cheaper to leave the GS on
		return (Game.cookies >= cost);
	}
	
	//***********************************
	//    Debug functions
	//***********************************
	
	AutoJQB.debug = {};
	
	AutoJQB.debug.setFastFertilizer = function(enable) {
		// Because turbo-charged soil is too fast; tick every 7.5 seconds
		var g = AutoJQB.g;
		
		g.soils['fertilizer'].tick = (enable)?0.125:3;
		
		if(g.nextStep > Date.now() + g.soilsById[g.soil].tick*1000*60) {
			g.nextStep = Date.now() + g.soilsById[g.soil].tick*1000*60;
			AutoJQB.mySaveString = Game.WriteSave(1);	// So the change doesn't get overwritten if a savescum loop is active
		}
	}
	
	AutoJQB.debug.saveGarden = function() {
		var g = AutoJQB.g;
		
		AutoJQB.config.debugGardenSave = [];
		for(var row = 0; row < g.plot.length; row++) {
			AutoJQB.config.debugGardenSave.push([]);
			for(var tile = 0; tile < g.plot[row].length; tile++) {
				AutoJQB.config.debugGardenSave[row].push([]);
				for(var i = 0; i < g.plot[row][tile].length; i++) {
					AutoJQB.config.debugGardenSave[row][tile].push(g.plot[row][tile][i]);
				}
			}
		}
	}
	
	// After loading the garden, changes won't be immediately visible;
	// save and reload to see them.
	AutoJQB.debug.loadGarden = function() {
		if(!AutoJQB.config.debugGardenSave) return;
		
		var dgs = AutoJQB.config.debugGardenSave;
		var g = AutoJQB.g;
		
		for(var row = 0; row < dgs.length; row++) {
			for(var tile = 0; tile < dgs[row].length; tile++) {
				g.plot[row][tile] = [];
				for(var i = 0; i < dgs[row][tile].length; i++) {
					g.plot[row][tile].push(dgs[row][tile][i]);
				}
			}
		}
		
		if(AutoJQB.countPlants() != 0) {
			// I don't know how to redraw the garden oops
			console.log('If the garden appears unchanged, this is a visual bug; ' +
					'save and refresh the page to fix it.')
		}
	}
	
	
	if(CCSE.ConfirmGameVersion(AutoJQB.name, AutoJQB.version, AutoJQB.GameVersion))
		Game.registerMod(AutoJQB.name, AutoJQB);
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