cc.Class({
    extends: cc.Component,

    properties: {
        _arrow:null,
        _arrow_pointer:null,
        _pointer:null,
        _timeLabel:null,
        _time:-1,
        _stop:false,
        _alertTime:-1,
        _audioId:-1,
        // foo: {
        //    default: null,
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
    },

    // use this for initialization
    onLoad: function () {
        var gameChild = this.node.getChildByName("game");
        this._arrow = gameChild.getChildByName("arrow");
        this._arrow_pointer = this._arrow.getChildByName("arrow_pointer");
        this._pointer = this._arrow_pointer.getChildByName("pointer");
        this.initPointer();
        
        this._timeLabel = this._arrow.getChildByName("lblTime").getComponent(cc.Label);
        this._timeLabel.string = "00";
        
        var self = this;
        
        this.node.on('game_begin',function(data){   
            self._stop = false;                   
            self.initPointer();
        });
        
        this.node.on('game_chupai',function(data){
            self._stop = false;
            self.initPointer();
            self._time = 10;
            self._alertTime = 3;
            self.stopDiDi();
        });

        this.node.on("game_over",function(data){
            self._stop = true;
            self.stopDiDi();
        });

        this.node.on("peng_notify",function(data){
            self.stopDiDi();
        });

        this.node.on("chi_notify",function(data){
            self.stopDiDi();
        });

        this.node.on("buhua_notify",function(data){
            self.stopDiDi();
        });

        this.node.on("gang_notify",function(data){
            self.stopDiDi();
        });

        this.node.on("game_end",function(data){
            self._stop = true;
            self.stopDiDi();
        });
    }, 
    
    initPointer:function(){
        if(cc.vv == null){
            return;
        }
        this._arrow.active = cc.vv.gameNetMgr.gamestate == "playing";
        if(!this._arrow.active){
            return;
        }


        var turn;
        var localIndex;
        if(cc.vv.gameNetMgr.getChangJingTypeName() == "2D"){
            var zhuanIndex = cc.vv.gameNetMgr.getLocalIndex(cc.vv.gameNetMgr.button);
            this._arrow_pointer.rotation = 180-zhuanIndex * 90;  
    
            turn = cc.vv.gameNetMgr.turn;
            localIndex = cc.vv.gameNetMgr.getLocalIndex(turn);
            var turnNum =  (this._arrow_pointer.rotation / 90);
  
            localIndex = (turnNum + localIndex +4)%4;

            for(var i = 0; i < this._pointer.children.length; ++i){
                this._pointer.children[i].active = i == localIndex;
            }
        }else if(cc.vv.gameNetMgr.getChangJingTypeName() == "3D"){
            //底盘位置
            var kaishizhuanIndex = cc.vv.gameNetMgr.getLocalIndex(0);
            this._arrow_pointer.getChildByName("Z_arrow_frame").getComponent(cc.Sprite).spriteFrame = cc.vv.mahjongmgr.getFengWeiSpriteFrame(kaishizhuanIndex);

            //亮图位置
            turn = cc.vv.gameNetMgr.turn;
            localIndex = cc.vv.gameNetMgr.getLocalIndex(turn);  

            for(var i = 0; i < this._pointer.children.length; ++i){
                if(i == localIndex){
                    var haha = cc.vv.mahjongmgr.getFengWeiLiangSpriteFrame(turn);
                    this._pointer.children[i].getComponent(cc.Sprite).spriteFrame = haha;
                }
                this._pointer.children[i].active = (i == localIndex);
            }
        }
    },

    stopDiDi:function(){
        if(this._audioId == -1)return;
        cc.vv.audioMgr.stopSFX(this._audioId);
        this._audioId = -1;
    },
    
    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if(this._time > 0){
            this._time -= dt;
            if(!this._stop && !(cc.vv.replayMgr.isReplay()) && this._alertTime > 0 && this._time < this._alertTime){
                this._audioId = cc.vv.audioMgr.playSFX("timeup_alarm.mp3");
                this._alertTime = -1;
            }
            var pre = "";
            if(this._time < 0){
                this._time = 0;
            }
            
            var t = Math.ceil(this._time);
            if(t < 10){
                pre = "0";
            }
            this._timeLabel.string = pre + t; 
        }
    },
});
