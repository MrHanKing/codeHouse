cc.Class({
    extends: cc.Component,

    properties: {
        _splash:null,
    },

    // use this for initialization
    onLoad: function () {
        if(!cc.sys.isNative && cc.sys.isMobile){
            var cvs = this.node.getComponent(cc.Canvas);
            cvs.fitHeight = true;
            cvs.fitWidth = true;
        }

        this._splash = cc.find("Canvas/splash");
        this._splash.active = true;
    },
    
    start:function(){        
        var self = this;
        var SHOW_TIME = 3000;
        var FADE_TIME = 500;
        if(cc.sys.os != cc.sys.OS_IOS || !cc.sys.isNative){
            self._splash.active = true;
            var t = Date.now();
            var fn = function(){
                var dt = Date.now() - t;
                if(dt < SHOW_TIME){
                    setTimeout(fn,33);
                }
                else {
                    var op = (1 - ((dt - SHOW_TIME) / FADE_TIME)) * 255;
                    if(op < 0){
                        self._splash.opacity = 0;
                        cc.director.loadScene("update"); 
                    }
                    else{
                        self._splash.opacity = op;
                        setTimeout(fn,33);   
                    }
                }
            };
            setTimeout(fn,33);
        }
        else{
            this._splash.active = false;
            cc.director.loadScene("update");
        }
    },
    
});