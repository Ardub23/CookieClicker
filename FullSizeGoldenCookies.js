(function() {
    'use strict';

    let fullSizeGoldenCookiesLaunch = function()
    {
        Game.registerMod("fullSizeGoldenCookies",
        {
            init: function() {
				Game.shimmerTypes.golden.updateFunc = function(me) {
					let curve=1-Math.pow((me.life/(Game.fps*me.dur))*2-1,4);
					me.l.style.opacity=curve;
					//this line makes each golden cookie pulse in a unique way
					if (Game.prefs.fancy) me.l.style.transform='rotate('+(Math.sin(me.id*0.69)*24+Math.sin(Game.T*(0.35+Math.sin(me.id*0.97)*0.15)+me.id)*(3+Math.sin(me.id*0.36)*2))+'deg)';
					me.life--;
					if (me.life<=0) {this.missFunc(me);me.die();}
				}
			},

            save: function() {
                return "";
            },

            load: function(str) {
                // no-op
            },

            add_hook: function() {
                // no-op
            }
        });
    };

    setTimeout(fullSizeGoldenCookiesLaunch, 5000);
})();