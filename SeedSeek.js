//***********************************************
// Seed Seek v1.0.12
// by Ardub23 (reddit.com/u/Ardub23)
// 
// CCSE and some portions of this program's code
// by klattmose (reddit.com/u/klattmose)
//***********************************************

Game.Win('Third-party');
if(SeedSeek === undefined) var SeedSeek = {};
if(typeof CCSE == 'undefined') Game.LoadMod('https://klattmose.github.io/CookieClicker/' + (0 ? 'Beta/' : '') + 'CCSE.js');
SeedSeek.name = 'Seed Seek';
SeedSeek.version = '1.0.12';
SeedSeek.GameVersion = '2.052';

SeedSeek.launch = function(){
	SeedSeek.init = function(){
		SeedSeek.isLoaded = 1;
		SeedSeek.Backup = {};
		SeedSeek.config = {};
		
		SeedSeek.config = SeedSeek.defaultConfig();
		CCSE.customSave.push(function() {
			CCSE.config.OtherMods.SeedSeek = SeedSeek.config;
		});
		CCSE.customLoad.push(function() {
			if (CCSE.config.OtherMods.SeedSeek)
				SeedSeek.config = CCSE.config.OtherMods.SeedSeek;
			else
				SeedSeek.config = SeedSeek.defaultConfig();
		});
		
		CCSE.MinigameReplacer(SeedSeek.ReplaceFarmTooltip, 'Farm');
		SeedSeek.ReplaceGameMenu();
		
		
		//***********************************
		//    Post-load hooks 
		//    To support other mods interfacing with this one
		//***********************************
		if(SeedSeek.postloadHooks) {
			for(var i = 0; i < SeedSeek.postloadHooks.length; ++i) {
				(SeedSeek.postloadHooks[i])();
			}
		}
		
		var startupStr = (Math.random() < 0.01)?'Seed Seek\'s sleek, see?':'Seed Seek loaded!';
		if (Game.prefs.popups) Game.Popup(startupStr);
		else Game.Notify(startupStr, '', '', 1, 1);
	}


	//***********************************
	//    Configuration
	//***********************************
	SeedSeek.defaultConfig = function(){
		return {
			showAll: false,
			growingPlantsUsable: true,
			hideForGrowingPlants: false,
			removeTutorial: true,
			hideForGrowingPlants: false
		};
	}
	
	SeedSeek.toggle = function(prefName,button,on,off,invert) {
		SeedSeek.config[prefName] = !SeedSeek.config[prefName];
		l(button).innerHTML = (SeedSeek.config[prefName])? on : off;
		l(button).className = 'option' + ((SeedSeek.config[prefName]^invert)? '' : ' off');
	}

	//***********************************
	//    Replacement
	//***********************************
	SeedSeek.ReplaceGameMenu = function(){
		function WriteButton(prefName,button,on,off,callback,invert){
			var invert=invert?1:0;
			if (!callback) callback='';
			callback+='PlaySound(\'snd/tick.mp3\');';
			return '<a class="option'+((SeedSeek.config[prefName]^invert)?'':' off')+'" id="'+button+'" '+Game.clickStr+'="SeedSeek.toggle(\''+prefName+'\',\''+button+'\',\''+on+'\',\''+off+'\',\''+invert+'\');'+callback+'">'+(SeedSeek.config[prefName]?on:off)+'</a>';
		}
		
		Game.customOptionsMenu.push(function(){
			CCSE.AppendCollapsibleOptionsMenu(SeedSeek.name,
				'<div class="listing">' + WriteButton('removeTutorial','removeTutorialButton','Remove tutorial ON','Remove tutorial OFF') + '<label>(remove the tutorial from the "Garden info" tooltip)</label><br/>' +
				WriteButton('showAll','showAllButton','Show all mutations ON','Show all mutations OFF') + '<label>(show all possible mutations, including ones for plants whose seeds you\'ve already unlocked)</label><br/>' +
				WriteButton('growingPlantsUsable','growingPlantsUsableButton','Consider growing plants usable ON','Consider growing plants usable OFF') + '<label>(consider plants that are growing in your garden to be usable for mutations, even if you haven\'t unlocked the seed yet)</label><br/>' +
				WriteButton('hideForGrowingPlants','hideForGrowingPlantsButton','Hide mutations for growing plants ON','Hide mutations for growing plants OFF') + '<label>(mutations for plants that are growing in your garden will be hidden, as if the seed were already unlocked; the "show all mutations" option overrides this)</label></div>'
			);
		});
		
		Game.customStatsMenu.push(function(){
			CCSE.AppendStatsVersionNumber(SeedSeek.name, SeedSeek.version);
		});
	}

	SeedSeek.ReplaceFarmTooltip = function() {
		if(!Game.customMinigame['Farm'].toolTooltip) Game.customMinigame['Farm'].toolTooltip = [];
		Game.customMinigame['Farm'].toolTooltip.push(function(id, str){
			if(id == 0) {
				var listAdded = false;
				
				if(str.indexOf('<!--EndAJQBStatus-->') > 0) {
					// Add list immediately after Auto JQB status, if present
					str = str.substring(0, str.indexOf('<!--EndAJQBStatus-->')+20) +
							'<div class="line" style="clear:both;"></div>'
							+ SeedSeek.recipesToDisplay() +
							str.substring(str.indexOf('<!--EndAJQBStatus-->')+20);
					listAdded = true;
				}
				
				if(SeedSeek.config.removeTutorial) {
					str = str.substring(0, str.indexOf('<img src')) + // everything before the image
							(listAdded? '' : SeedSeek.recipesToDisplay()) +
							str.substring(str.indexOf('</small>')+8); // everything after the tutorial
				} else if(!listAdded) {
					str = str.substring(0, str.indexOf('</small>')+8) +
							'<div style="clear:both;" class="line"></div>' +
							SeedSeek.recipesToDisplay() +
							str.substring(str.indexOf('</small>')+8);
				}
			}
			return str;
		});
	}
	
	//***********************************
	//    Available recipes
	//***********************************
	
	SeedSeek.recipesToDisplay = function(){
		var recipesList = '<!--BeginSeedSeekList-->' +
				'<div width="100%"><b>Possible mutations:</b><br/>';
		var listedARecipe = false;
		
		var garden = Game.Objects['Farm'].minigame;
		
		for(i = 0; i < garden.plantsById.length; i++)
			garden.plantsById[i].isGrowing = false;
		
		for(x = 0; x < garden.plot.length; x++) {
			for(y = 0; y < garden.plot.length; y++) {
				if(garden.plot[x][y][0] > 0) {
					garden.plantsById[garden.plot[x][y][0] - 1].isGrowing = true;
				}
			}
		}
		
		for(i = 0; i < garden.plantsById.length; i++) {
			var resultSeed = garden.plantsById[i];
			
			// If this is called before the garden is unlocked, the seed data gets overwritten, so we call it here.
			if(!resultSeed.recipes)
				SeedSeek.addPlantInfo();
			
			if(SeedSeek.config.showAll || (resultSeed.unlocked == 0 && !(resultSeed.isGrowing && SeedSeek.config.hideForGrowingPlants))) {
				
				var usableRecipes = [];
				
				// Check each recipe for resultSeed to see if it's usable
				for(j = 0; j < resultSeed.recipes.length; j++) {
					var recipe = resultSeed.recipes[j];
					var canUseRecipe = true;
					
					for(k = 0; k < recipe.parents.length; k++) {
						if(recipe.parents[k].plant.unlocked == 0 &&
								!(SeedSeek.config.growingPlantsUsable && recipe.parents[k].plant.isGrowing)) {
							canUseRecipe = false;
							break;
						}
					}
					
					if(canUseRecipe) usableRecipes.push(recipe);
				}
				
				if(usableRecipes.length > 0) {
					listedARecipe = true;
					// Display the result and all usable recipes
					recipesList += '<b>' + resultSeed.name + '</b><br/>';
					for(j = 0; j < usableRecipes.length; j++) {
						var recipe = usableRecipes[j];
						
						recipesList += '&nbsp;&nbsp;&nbsp;<small>(' + recipe.chance +
								')</small> <div class="shadowFilter" style="display:inline-block;">';
						
						for(k = 0; k < recipe.parents.length; k++) {
							var parent = recipe.parents[k];
							
							if(parent.plant.seedImgOffset) {
								// Using l as a variable causes problems because l is a function in Game.Logic
								for(ii = 0; ii < ((parent.count)? parent.count : 1); ii++) {
									recipesList += '<div class="gardenSeedTiny" style="background-position:0px ' +
													parent.plant.seedImgOffset + 'px;"></div>';
								}
							}
							
							if(parent.count) {
								recipesList += parent.count + '<small>×</small>';
							}
							recipesList += parent.plant.name + ' ';
						}
						recipesList += '</div><br/>';
						
						if(recipe.note) {
							recipesList += '&nbsp;&nbsp;&nbsp;&nbsp;<span class="gray">└ <small>' +
									recipe.note + '</small></span><br/>';
						}
					}
				}
			}
		}
		
		if(!listedARecipe) {
			recipesList += '<b>None.</b><br/>';
		}
		
		return recipesList + '<!--EndSeedSeekList-->';
	}
	
	SeedSeek.addPlantInfo = function(){
		var plants = Game.Objects['Farm'].minigame.plants;
		
		plants["bakerWheat"].seedImgOffset = "0";
		plants["bakerWheat"].recipes = [
			{chance:"20%", parents:[{plant:plants["bakerWheat"], count:2}]},
			{chance:"5%", parents:[{plant:plants["thumbcorn"], count:2}]}
		];
		
		plants["thumbcorn"].seedImgOffset = "-48";
		plants["thumbcorn"].recipes = [
			{chance:"5%", parents:[{plant:plants["bakerWheat"], count:2}]},
			{chance:"10%", parents:[{plant:plants["thumbcorn"], count:2}]},
			{chance:"2%", parents:[{plant:plants["cronerice"], count:2}]}
		];
		
		plants["cronerice"].seedImgOffset = "-96";
		plants["cronerice"].recipes = [
			{chance:"1%", parents:[{plant:plants["bakerWheat"]}, {plant:plants["thumbcorn"]}]}
		];
		
		plants["gildmillet"].seedImgOffset = "-144";
		plants["gildmillet"].recipes = [
			{chance:"3%", parents:[{plant:plants["thumbcorn"]}, {plant:plants["cronerice"]}]}
		];
		
		plants["clover"].seedImgOffset = "-192";
		plants["clover"].recipes = [
			{chance:"3%", parents:[{plant:plants["bakerWheat"]}, {plant:plants["gildmillet"]}]},
			{chance:"0.7%", parents:[{plant:plants["clover"], count:2}], note:"No more than 4 adjacent ordinary clovers, regardless of maturity"}
		];
		
		plants["goldenClover"].seedImgOffset = "-240";
		plants["goldenClover"].recipes = [
			{chance:"0.07%", parents:[{plant:plants["bakerWheat"]}, {plant:plants["gildmillet"]}]},
			{chance:"0.01%", parents:[{plant:plants["clover"], count:2}], note:"No more than 4 adjacent ordinary clovers, regardless of maturity"},
			{chance:"0.07%", parents:[{plant:plants["clover"], count:4}]}
		];
		
		plants["shimmerlily"].seedImgOffset = "-288";
		plants["shimmerlily"].recipes = [
			{chance:"2%", parents:[{plant:plants["gildmillet"]}, {plant:plants["clover"]}]}
		];
		
		plants["elderwort"].seedImgOffset = "-336";
		plants["elderwort"].recipes = [
			{chance:"1%", parents:[{plant:plants["cronerice"]}, {plant:plants["shimmerlily"]}]},
			{chance:"0.2%", parents:[{plant:plants["cronerice"]}, {plant:plants["wrinklegill"]}]}
		];
		
		plants["bakeberry"].seedImgOffset = "-384";
		plants["bakeberry"].recipes = [
			{chance:"0.1%", parents:[{plant:plants["bakerWheat"], count:2}]}
		];
		
		plants["chocoroot"].seedImgOffset = "-432";
		plants["chocoroot"].recipes = [
			{chance:"10%", parents:[{plant:plants["bakerWheat"]}, {plant:plants["brownMold"]}], note:"The brown mold doesn't have to be mature"}
		];
		
		plants["whiteChocoroot"].seedImgOffset = "-480";
		plants["whiteChocoroot"].recipes = [
			{chance:"10%", parents:[{plant:plants["chocoroot"]}, {plant:plants["whiteMildew"]}], note:"The white mildew doesn't have to be mature"}
		];
		
		plants["whiteMildew"].seedImgOffset = "-1248";
		plants["whiteMildew"].recipes = [
			{chance:"50%", parents:[{plant:plants["brownMold"]}], note:"No more than 1 adjacent white mildew, regardless of maturity"}
		];
		
		plants["brownMold"].seedImgOffset = "-1296";
		plants["brownMold"].recipes = [
			{chance:"0.0–19.8%", parents:[{plant:plants["meddleweed"]}], note:"Appears when uprooting meddleweed; chance increases with age"},
			{chance:"50%", parents:[{plant:plants["brownMold"]}], note:"No more than 1 adjacent brown mold, regardless of maturity"}
		];
		
		plants["meddleweed"].seedImgOffset = "-1392";
		plants["meddleweed"].recipes = [
			{chance:"0.2%", parents:[], note:"May appear in an empty tile with no adjacent plants"},
			{chance:"15%", parents:[{plant:plants["meddleweed"]}], note:"No more than 3 adjacent meddleweeds, regardless of maturity"}
		];
		
		plants["whiskerbloom"].seedImgOffset = "-528";
		plants["whiskerbloom"].recipes = [
			{chance:"1%", parents:[{plant:plants["shimmerlily"]}, {plant:plants["whiteChocoroot"]}]}
		];
		
		plants["chimerose"].seedImgOffset = "-576";
		plants["chimerose"].recipes = [
			{chance:"5%", parents:[{plant:plants["shimmerlily"]}, {plant:plants["whiskerbloom"]}]},
			{chance:"0.5%", parents:[{plant:plants["chimerose"], count:2}]}
		];
		
		plants["nursetulip"].seedImgOffset = "-624";
		plants["nursetulip"].recipes = [
			{chance:"5%", parents:[{plant:plants["whiskerbloom"], count:2}]}
		];
		
		plants["drowsyfern"].seedImgOffset = "-672";
		plants["drowsyfern"].recipes = [
			{chance:"0.5%", parents:[{plant:plants["chocoroot"]}, {plant:plants["keenmoss"]}]}
		];
		
		plants["wardlichen"].seedImgOffset = "-720";
		plants["wardlichen"].recipes = [
			{chance:"0.5%", parents:[{plant:plants["cronerice"]}, {plant:plants["keenmoss"]}]},
			{chance:"0.5%", parents:[{plant:plants["cronerice"]}, {plant:plants["whiteMildew"]}]},
			{chance:"5%", parents:[{plant:plants["wardlichen"]}], note:"No more than 1 adjacent wardlichen, regardless of maturity"}
		];
		
		plants["keenmoss"].seedImgOffset = "-768";
		plants["keenmoss"].recipes = [
			{chance:"10%", parents:[{plant:plants["brownMold"]}, {plant:plants["greenRot"]}]},
			{chance:"5%", parents:[{plant:plants["keenmoss"]}], note:"No more than 1 adjacent keenmoss, regardless of maturity"}
		];
		
		plants["queenbeet"].seedImgOffset = "-816";
		plants["queenbeet"].recipes = [
			{chance:"0.5%", parents:[{plant:plants["bakeberry"]}, {plant:plants["chocoroot"]}]}
		];
		
		// Hey Orteil, thanks for not naming this one juicyQueenbeet. I really wanted to spend my time checking
		// every single plant name for other ones that make no sense.
		plants["queenbeetLump"].seedImgOffset = "-864";
		plants["queenbeetLump"].recipes = [
			{chance:"0.1%", parents:[{plant:plants["queenbeet"], count:8}]}
		];
		
		plants["duketater"].seedImgOffset = "-912";
		plants["duketater"].recipes = [
			{chance:"0.1%", parents:[{plant:plants["queenbeet"], count:2}]}
		];
		
		plants["crumbspore"].seedImgOffset = "-960";
		plants["crumbspore"].recipes = [
			{chance:"0.0–19.8%", parents:[{plant:plants["meddleweed"]}], note:"Appears when uprooting meddleweed; chance increases with age"},
			{chance:"7%", parents:[{plant:plants["crumbspore"]}], note:"No more than 1 adjacent crumbspore, regardless of maturity"},
			{chance:"0.5%", parents:[{plant:plants["doughshroom"], count:2}]}
		];
		
		plants["doughshroom"].seedImgOffset = "-1152";
		plants["doughshroom"].recipes = [
			{chance:"0.5%", parents:[{plant:plants["crumbspore"], count:2}]},
			{chance:"7%", parents:[{plant:plants["doughshroom"]}], note:"No more than 1 adjacent doughshroom, regardless of maturity"}
		];
		
		plants["glovemorel"].seedImgOffset = "-1008";
		plants["glovemorel"].recipes = [
			{chance:"2%", parents:[{plant:plants["thumbcorn"]}, {plant:plants["crumbspore"]}]}
		];
		
		plants["cheapcap"].seedImgOffset = "-1056";
		plants["cheapcap"].recipes = [
			{chance:"4%", parents:[{plant:plants["shimmerlily"]}, {plant:plants["crumbspore"]}]}
		];
		
		plants["foolBolete"].seedImgOffset = "-1104";
		plants["foolBolete"].recipes = [
			{chance:"4%", parents:[{plant:plants["doughshroom"]}, {plant:plants["greenRot"]}]}
		];
		
		plants["wrinklegill"].seedImgOffset = "-1200";
		plants["wrinklegill"].recipes = [
			{chance:"4%", parents:[{plant:plants["brownMold"]}, {plant:plants["crumbspore"]}]}
		];
		
		plants["greenRot"].seedImgOffset = "-1344";
		plants["greenRot"].recipes = [
			{chance:"5%", parents:[{plant:plants["clover"]}, {plant:plants["whiteMildew"]}]}
		];
		
		plants["shriekbulb"].seedImgOffset = "-1440";
		plants["shriekbulb"].recipes = [
			{chance:"0.1%", parents:[{plant:plants["elderwort"]}, {plant:plants["wrinklegill"]}]},
			{chance:"0.1%", parents:[{plant:plants["elderwort"], count:5}]},
			{chance:"0.5%", parents:[{plant:plants["duketater"], count:3}], note:"The duketaters don't have to be mature"},
			{chance:"0.2%", parents:[{plant:plants["doughshroom"], count:4}], note:"The doughshrooms don't have to be mature"},
			{chance:"0.1%", parents:[{plant:plants["queenbeet"], count:5}]},
			{chance:"0.5%", parents:[{plant:plants["shriekbulb"]}], note:"No more than 1 adjacent shriekbulb, regardless of maturity"}
		];
		
		plants["tidygrass"].seedImgOffset = "-1488";
		plants["tidygrass"].recipes = [
			{chance:"0.2%", parents:[{plant:plants["bakerWheat"]}, {plant:plants["whiteChocoroot"]}]}
		];
		
		plants["everdaisy"].seedImgOffset = "-1536";
		plants["everdaisy"].recipes = [
			{chance:"0.2%", parents:[{plant:plants["elderwort"], count:3}, {plant:plants["tidygrass"], count:3}]}
		];
		
		plants["ichorpuff"].seedImgOffset = "-1584";
		plants["ichorpuff"].recipes = [
			{chance:"0.2%", parents:[{plant:plants["elderwort"]}, {plant:plants["crumbspore"]}]}
		];
	}
	
	if(CCSE.ConfirmGameVersion(SeedSeek.name, SeedSeek.version, SeedSeek.GameVersion))
		Game.registerMod(SeedSeek.name, SeedSeek);
}

if(!SeedSeek.isLoaded){
	if(CCSE && CCSE.isLoaded){
		SeedSeek.launch();
	}
	else{
		if(!CCSE) var CCSE = {};
		if(!CCSE.postLoadHooks) CCSE.postLoadHooks = [];
		CCSE.postLoadHooks.push(SeedSeek.launch);
	}
}