//*******************************************
// Disable Big Cookie v1.0.1
// by Ardub23 (reddit.com/u/Ardub23)
// 
// CCSE and portions of this program's code
// by klattmose (reddit.com/u/klattmose)
//*******************************************

Game.Win('Third-party');
if(DisableBigCookie === undefined) var DisableBigCookie = {};
if(typeof CCSE == 'undefined') Game.LoadMod('https://klattmose.github.io/CookieClicker/' + (0 ? 'Beta/' : '') + 'CCSE.js');
DisableBigCookie.name = 'Disable Big Cookie';
DisableBigCookie.version = '1.0.1';
DisableBigCookie.GameVersion = '2.019';

DisableBigCookie.launch = function(){
	DisableBigCookie.init = function(){
		DisableBigCookie.isLoaded = 1;
		DisableBigCookie.Backup = {};
		DisableBigCookie.config = {};
		
		DisableBigCookie.loadConfig();
		CCSE.customLoad.push(DisableBigCookie.loadConfig);
		CCSE.customSave.push(DisableBigCookie.saveConfig);
		
		DisableBigCookie.ReplaceGameMenu();
		l('bigCookie').hidden = DisableBigCookie.config.disabled;
		
		
		//***********************************
		//    Post-Load Hooks 
		//    To support other mods interfacing with this one
		//***********************************
		if(DisableBigCookie.postloadHooks) {
			for(var i = 0; i < DisableBigCookie.postloadHooks.length; ++i) {
				(DisableBigCookie.postloadHooks[i])();
			}
		}
		
		if (Game.prefs.popups) Game.Popup('DBC loaded!');
		else Game.Notify('DBC loaded!', '', '', 1, 1);
	}


	//***********************************
	//    Configuration
	//***********************************
	DisableBigCookie.saveConfig = function(config){
		CCSE.save.OtherMods.DisableBigCookie = DisableBigCookie.config;
	}

	DisableBigCookie.loadConfig = function(){
		if(CCSE.save.OtherMods.DisableBigCookie)
			DisableBigCookie.config = CCSE.save.OtherMods.DisableBigCookie;
		else
			DisableBigCookie.config = {};
		
		// Default values if they're missing
		if(DisableBigCookie.config.disabled === undefined) DisableBigCookie.config.disabled = false;
	}
	
	DisableBigCookie.toggleDisabled = function(){
		DisableBigCookie.config.disabled = !DisableBigCookie.config.disabled;
		l('bigCookie').hidden = DisableBigCookie.config.disabled;
	}
	

	//***********************************
	//    Replacement
	//***********************************
	DisableBigCookie.ReplaceGameMenu = function(){
		Game.customOptionsMenu.push(function(){
			var checkbox = function(func, condition){
				return '<input type="checkbox" '+Game.clickStr+'="' + func + '"' +
						((condition)? ' checked' : '') + '>';
			}
			
			var optionsMenu = '<div class="listing">' +
				checkbox('DisableBigCookie.toggleDisabled()', DisableBigCookie.config.disabled) +
				'<label>Disable the big cookie</label></div>';
			
			CCSE.AppendCollapsibleOptionsMenu(DisableBigCookie.name, optionsMenu);
		});
		
		Game.customStatsMenu.push(function(){
			CCSE.AppendStatsVersionNumber(DisableBigCookie.name, DisableBigCookie.version);
		});
	}

	if(CCSE.ConfirmGameVersion(DisableBigCookie.name, DisableBigCookie.version, DisableBigCookie.GameVersion)) DisableBigCookie.init();
}

if(!DisableBigCookie.isLoaded){
	if(CCSE && CCSE.isLoaded){
		DisableBigCookie.launch();
	}
	else{
		if(!CCSE) var CCSE = {};
		if(!CCSE.postLoadHooks) CCSE.postLoadHooks = [];
		CCSE.postLoadHooks.push(DisableBigCookie.launch);
	}
}