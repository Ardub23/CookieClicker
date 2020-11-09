//*******************************************
// Disable Big Cookie v1.0.7
// by Ardub23 (reddit.com/u/Ardub23)
// 
// CCSE and portions of this program's code
// by klattmose (reddit.com/u/klattmose)
//*******************************************

Game.Win('Third-party');
if(DisableBigCookie === undefined) var DisableBigCookie = {};
if(typeof CCSE == 'undefined') Game.LoadMod('https://klattmose.github.io/CookieClicker/' + (0 ? 'Beta/' : '') + 'CCSE.js');
DisableBigCookie.name = 'Disable Big Cookie';
DisableBigCookie.version = '1.0.7';
DisableBigCookie.GameVersion = '2.031';

DisableBigCookie.launch = function(){
	DisableBigCookie.init = function(){
		DisableBigCookie.isLoaded = 1;
		DisableBigCookie.Backup = {};
		DisableBigCookie.config = {};
		
		DisableBigCookie.config = DisableBigCookie.defaultConfig();
		CCSE.customLoad.push(DisableBigCookie.load);
		CCSE.customSave.push(DisableBigCookie.save);
		
		DisableBigCookie.ReplaceGameMenu();
		DisableBigCookie.setBigCookie();
		
		
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
	DisableBigCookie.save = function(){
		if(CCSE.config.OtherMods.DisableBigCookie)
			delete CCSE.config.OtherMods.DisableBigCookie; // no need to keep this, it's now junk data
		return JSON.stringify(DisableBigCookie.config);
	}

	DisableBigCookie.load = function(str){
		if(!str) return;
		var config = JSON.parse(str);
		for(var pref in config){
			DisableBigCookie.config[pref] = config[pref];
		}
		DisableBigCookie.setBigCookie();
	}
	
	DisableBigCookie.defaultConfig = function() {
		return {allowBigCookie : true};
	}
	
	DisableBigCookie.toggle = function(prefName,button,on,off,invert) {
		DisableBigCookie.config[prefName]=!DisableBigCookie.config[prefName];
		l(button).innerHTML = (DisableBigCookie.config[prefName])?on:off;
		l(button).className='option'+((DisableBigCookie.config[prefName]^invert)?'':' off');
	}
	
	DisableBigCookie.setBigCookie = function() {
		l('bigCookie').hidden = !DisableBigCookie.config.allowBigCookie;
	}
	

	//***********************************
	//    Replacement
	//***********************************
	DisableBigCookie.ReplaceGameMenu = function(){
		function WriteButton(prefName,button,on,off,callback,invert){
			var invert=invert?1:0;
			if (!callback) callback='';
			callback+='PlaySound(\'snd/tick.mp3\');';
			return '<a class="option'+((DisableBigCookie.config[prefName]^invert)?'':' off')+'" id="'+button+'" '+Game.clickStr+'="DisableBigCookie.toggle(\''+prefName+'\',\''+button+'\',\''+on+'\',\''+off+'\',\''+invert+'\');'+callback+'">'+(DisableBigCookie.config[prefName]?on:off)+'</a>';
		}
		
		Game.customOptionsMenu.push(function(){
			var optionsMenu = '<div class="listing">' +
				WriteButton('allowBigCookie','allowBigCookieButton','Big cookie ON','Big cookie OFF','DisableBigCookie.setBigCookie();') +
				'</div>';
			
			CCSE.AppendCollapsibleOptionsMenu(DisableBigCookie.name, optionsMenu);
		});
		
		Game.customStatsMenu.push(function(){
			CCSE.AppendStatsVersionNumber(DisableBigCookie.name, DisableBigCookie.version);
		});
	}

	if(CCSE.ConfirmGameVersion(DisableBigCookie.name, DisableBigCookie.version, DisableBigCookie.GameVersion))
		Game.registerMod(DisableBigCookie.name, DisableBigCookie);
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