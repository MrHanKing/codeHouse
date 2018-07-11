cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        _pointers:null,
        _folds:null,
        _huas:null,
        _chupaiSprite:[],
    },

    // use this for initialization
    onLoad: function () {
        if(cc.vv == null){
            return;
        }
        
        this.initView();
        this.initEventHandler();
        
        this.initAllFolds();
        cc.vv.folds = this;
    },
    
    initView:function(){
        this._folds = {};
        this._pointers = {};
        this._huas = {};
        var game = this.node.getChildByName("game");
        var sides = ["myself","right","up","left"];
        for(var i = 0; i < sides.length; ++i){
            var sideName = sides[i];
            var sideRoot = game.getChildByName(sideName);

            var folds = [];
            var foldRoot = sideRoot.getChildByName("folds").getChildByName("list");
            for(var j = 0; j < foldRoot.children.length; ++j){
                var n = foldRoot.children[j];
                n.active = false;
                //var sprite = n.getComponent(cc.Sprite); 
                //sprite.spriteFrame = null;
                folds.push(n);            
            }
            this._folds[sideName] = folds; 
            this._pointers[sideName] = sideRoot.getChildByName("folds").getChildByName("pointer"); 
            this._chupaiSprite.push(sideRoot.getChildByName("folds").getChildByName("ChuPai"));
            
            var huas = [];
            var huaRoot = sideRoot.getChildByName("seat").getChildByName("piaohua");
            for(var k=0;k< huaRoot.children.length;++k){
                var n = huaRoot.children[k];
                n.active = false;
                var sprite = n.getComponent(cc.Sprite);
                //sprite.spriteFrame = null;
                huas.push(sprite);
            }
            this._huas[sideName] = huas;
        }
        
        this.hideAllFolds();
    },
    
    hideAllFolds:function(){
        for(var k in this._folds){
            var f = this._folds[i];
            for(var i in f){
                //f[i].node.active = false;
                f[i].active = false;
            }
        }
    },
    
    initEventHandler:function(){
        var self = this;
        this.node.on('game_begin',function(data){
            self.initAllFolds();
        });  
        
        this.node.on('game_sync',function(data){
            self.initAllFolds();
        });
        
        this.node.on('game_chupai_notify',function(data){
            self.initFolds(data.detail.seatData);
        });

        this.node.on('buhua_notify',function(data){
            self.initFolds(data.detail);
            self.initHuas(data.detail);
        });
        

        this.node.on('guo_notify',function(data){
            self.initFolds(data.detail);
        });
    },
    
    showChupai:function(){
        var pai = cc.vv.gameNetMgr.chupai;
        
        if( pai >= 0 ){ 
            var turnlocalIndex =  cc.vv.gameNetMgr.getLocalIndex(cc.vv.gameNetMgr.turn);
            var spriteChuai = this._chupaiSprite[turnlocalIndex].children[0].getComponent(cc.Sprite);
            spriteChuai.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID("M_",pai);
        

            for(var i = 0; i < cc.vv.gameNetMgr.seats.length; ++i){
                var seatData = cc.vv.gameNetMgr.seats[i];
                var localIndex = cc.vv.gameNetMgr.getLocalIndex(i);        
                
                if(turnlocalIndex == localIndex){
                    //get the last fold card
                    var folds = seatData.folds;
                    if(folds == null){
                        return;
                    }
                    var pre = cc.vv.mahjongmgr.getFoldPre(localIndex);
                    var side = cc.vv.mahjongmgr.getSide(localIndex);
                    var foldsSprites = this._folds[side];
                    var index = 0;
                    index = folds.length;
                    if(side == "right" || side == "up"){
                        index = foldsSprites.length - index - 1;
                    }
                    var sprite = foldsSprites[index];
                    //获得第一个空位置x,y
                    this._chupaiSprite[turnlocalIndex].x = sprite.x;
                    this._chupaiSprite[turnlocalIndex].y = sprite.y;
                    
                    this._chupaiSprite[turnlocalIndex].active = true;

                    this.setSpritePointer(sprite,side);
                }
            }
        }
    },
    
    hideChupai:function(){
        for(var i = 0; i < this._chupaiSprite.length; ++i){
            //this._chupaiSprite[i].node.active = false;
            this._chupaiSprite[i].active = false;
        }        
    },
    
    initAllFolds:function(){
        var seats = cc.vv.gameNetMgr.seats;
        for(var i in seats){
            this.initFolds(seats[i]);
            this.initHuas(seats[i]);
        }
        
        this.initPointer();
        
    },

    initHuas:function(seatData){
        var localIndex = cc.vv.gameNetMgr.getLocalIndex(seatData.seatindex);
        var pre = cc.vv.mahjongmgr.getFoldPre(localIndex);
        var side = cc.vv.mahjongmgr.getSide(localIndex);
        var huasSprites = this._huas[side];

        for(var i = 0; i< huasSprites.length;++i){
            var sprite = huasSprites[i];
            sprite.node.active = false;
        }
        
        if(cc.vv.replayMgr.isReplay() != true){
            if(seatData.huas && seatData.huas.length > 0){
                var sprite = huasSprites[seatData.piaonum -2];
                sprite.node.active = true;
            }
        }
    },


    initPointer:function(){
        var sides = ["myself","right","up","left"];
        for(var i = 0; i < sides.length; ++i){
            this._pointers[sides[i]].active = false;
        }
    },
    
    initFolds:function(seatData){
        var folds = seatData.folds;
        if(folds == null){
            return;
        }

        var localIndex = cc.vv.gameNetMgr.getLocalIndex(seatData.seatindex);
        var pre = cc.vv.mahjongmgr.getFoldPre(localIndex);
        var side = cc.vv.mahjongmgr.getSide(localIndex);
        
        var foldsSprites = this._folds[side];
        for(var i = 0; i < folds.length; ++i){
            var index = i;
            if(side == "right" || side == "up"){
                index = foldsSprites.length - i - 1;
            }
            var sprite = foldsSprites[index];

            if(sprite.active)continue;
            sprite.active = true;
            var mjSprite = sprite.children[0].getComponent(cc.Sprite);
            this.setSpriteFrameByMJID(pre,mjSprite,folds[i]);

            //最后一张，位置标识
            if(i == folds.length - 1){
                this.setSpritePointer(sprite,side);
            }
        }

        for(var i = folds.length; i < foldsSprites.length; ++i){
            var index = i;
            if(side == "right" || side == "up"){
                index = foldsSprites.length - i - 1;
            }
            var sprite = foldsSprites[index];

            if(!sprite.active)break;
            sprite.active = false;
        }  
    },
    
    setSpriteFrameByMJID:function(pre,sprite,mjid){
        sprite.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID(pre,mjid);
        sprite.node.active = true;
    },

    setSpritePointer:function(sprite,side){
        
        this.initPointer();
        this._pointers[side].active = true;

        switch(side){
            case "myself":
            {
                this._pointers[side].x = sprite.x;
                this._pointers[side].y = sprite.y + 50;
            }
            break;
            case "right":
            {
                this._pointers[side].x = sprite.x;
                this._pointers[side].y = sprite.y + 25;
            }
            break;
            case "up":
            {   
                this._pointers[side].x = sprite.x;
                this._pointers[side].y = sprite.y + 50;
            }
            break;
            case "left":
            {

                this._pointers[side].x = sprite.x;
                this._pointers[side].y = sprite.y + 25;
            }
            break;
        }
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
