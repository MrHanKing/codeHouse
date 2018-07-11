function loadImage(url,callback){
    cc.loader.load(url,function (err,tex) {
        var spriteFrame = new cc.SpriteFrame(tex, cc.Rect(0, 0, tex.width, tex.height));
        callback(spriteFrame);
    });
};

function loadHeadImage(url,callback){
    cc.loader.load({url:url,type:"png"},function (err,tex) {
        var spriteFrame = new cc.SpriteFrame(tex, cc.Rect(0, 0, tex.width, tex.height));
        callback(spriteFrame);
    });
};

cc.Class({
    extends: cc.Component,
    properties: {
    },

    // use this for initialization
    onLoad: function () {
        this.setupSpriteFrame();
    },
    
    setUrl:function(url){
        var self = this;
        loadImage(url,function (spriteFrame) {
            self._spriteFrame = spriteFrame;
            self.setupSpriteFrame();
        });
    },

    setUserImg:function(url){
        var self = this;
        loadHeadImage(url,function (spriteFrame) {
            self._spriteFrame = spriteFrame;
            self.setupSpriteFrame();
        });
    },
    
    setupSpriteFrame:function(){
        if(this._spriteFrame){
            var spr = this.getComponent(cc.Sprite);
            if(spr){
                spr.spriteFrame = this._spriteFrame;    
            }
        }
    },

    setUrlcallback:function(url,callback){
        var self = this;
        loadImage(url,function (spriteFrame) {
            self._spriteFrame = spriteFrame;
            self.setupSpriteFrame();
            if(callback){
                callback(spriteFrame);
            }
        });
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
