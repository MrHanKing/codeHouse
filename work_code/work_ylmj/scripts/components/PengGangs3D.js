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
    },

    // use this for initialization
    onLoad: function () {
        if(!cc.vv){
            return;
        }
        
        var gameChild = this.node.getChildByName("game");
        var myself = gameChild.getChildByName("myself");
        var pengangroot = myself.getChildByName("penggangs");
        var realwidth = cc.director.getVisibleSize().width;
        var scale = realwidth / 1280;
        pengangroot.scaleX *= scale;
        pengangroot.scaleY *= scale;
        
        var self = this;
        this.node.on('peng_notify',function(data){
            var data = data.detail;
            self.onPengGangChanged(data);
        });

        this.node.on('chi_notify',function(data){
            var data = data.detail;
            self.onPengGangChanged(data);
        });

       
        this.node.on('gang_notify',function(data){
            var data = data.detail;
            self.onPengGangChanged(data.seatData);
        });
        
        this.node.on('game_begin',function(data){
            self.onGameBein();
        });
        
        var seats = cc.vv.gameNetMgr.seats;
        for(var i in seats){
            this.onPengGangChanged(seats[i]);
        }
    },
    
    onGameBein:function(){
        this.hideSide("myself");
        this.hideSide("right");
        this.hideSide("up");
        this.hideSide("left");
    },
    
    hideSide:function(side){
        var gameChild = this.node.getChildByName("game");
        var myself = gameChild.getChildByName(side);
        var pengangroot = myself.getChildByName("penggangs");
        if(pengangroot){
            for(var i = 0; i < pengangroot.childrenCount; ++i){
                pengangroot.children[i].active = false;
            }         
        }
    },

    hideSubPengang:function(root){
        if(root){
            for(var i = 0; i < root.childrenCount; ++i){
                root.children[i].active = false;
            }         
        }
    },
    
    getTargetSide:function(seatData,targetIndex){

        var targetSide = -1;
         //下家
        var nextIs = (seatData.seatindex + 1)%4; 
        //对家
        var faceIs = (seatData.seatindex + 2)%4;
        //上家 
        var lastIs = (seatData.seatindex + 3)%4;
        
        if(targetIndex == nextIs){
            targetSide = 2;
        }
        else if(targetIndex == faceIs){
            targetSide = 1;
        }
        else if(targetIndex == lastIs){
            targetSide = 0;
        }
        else{
            targetSide = -1;
        }
        return targetSide;
    },

    onPengGangChanged:function(seatData){
        
        if(seatData.angangs == null && seatData.diangangs == null && seatData.wangangs == null && seatData.pengs == null && seatData.chis == null){
            cc.log3.debug("no peng ,gang,chi,hua!! index = "+seatData.seatindex);
            return;
        }
        var localIndex = cc.vv.gameNetMgr.getLocalIndex(seatData.seatindex);
        var side = cc.vv.mahjongmgr.getSide(localIndex);
        var pre = cc.vv.mahjongmgr.getFoldPre(localIndex);

        cc.log3.debug("onPengGangChanged=" + localIndex);
        cc.log3.debug("side="+side);
        cc.log3.debug("pre = "+pre);

        var gameChild = this.node.getChildByName("game");
        var myself = gameChild.getChildByName(side);
        var pengangroot = myself.getChildByName("penggangs");
        
        for(var i = 0; i < pengangroot.childrenCount; ++i){
            pengangroot.children[i].active = false;
        }
        
        var targetSide = -1; 
        //初始化杠牌
        var index = 0;
        var gangs = seatData.angangs;
        for(var i = 0; i < gangs.length; ++i){            
            targetSide = this.getTargetSide(seatData,gangs[i][0]);
            var mjid = [gangs[i][1],gangs[i][2],gangs[i][3],gangs[i][4]];
            cc.log3.debug(mjid);
            this.initPengAndGangAndChis(pengangroot,side,pre,targetSide,index,mjid,"angang");
            index++;
        }

        var gangs = seatData.diangangs;
        for(var i = 0; i < gangs.length; ++i){
            targetSide = this.getTargetSide(seatData,gangs[i][0]);
            var mjid = [gangs[i][1],gangs[i][2],gangs[i][3],gangs[i][4]];
            cc.log3.debug(mjid);
            this.initPengAndGangAndChis(pengangroot,side,pre,targetSide,index,mjid,"diangang");
            index++;    
        }
        
        var gangs = seatData.wangangs;
        for(var i = 0; i < gangs.length; ++i){       
            targetSide = this.getTargetSide(seatData,gangs[i][0]);     
            var mjid = [gangs[i][1],gangs[i][2],gangs[i][3],gangs[i][4]];
            cc.log3.debug(mjid);
            this.initPengAndGangAndChis(pengangroot,side,pre,targetSide,index,mjid,"wangang");
            index++;    
        }
        
        //初始化碰牌
        var pengs = seatData.pengs;
        if(pengs){
            for(var i = 0; i < pengs.length; ++i){     
                targetSide = this.getTargetSide(seatData,pengs[i][0]);              
                var mjid = [pengs[i][1],pengs[i][1],pengs[i][1]];
                this.initPengAndGangAndChis(pengangroot,side,pre,targetSide,index,mjid,"peng");
                index++;    
            }
        }

        var chis =  seatData.chis;
        if(chis){
            for(var i=0;i<chis.length;i++){                    
                targetSide = chis[i][0];        
                var mjid = [chis[i][1],chis[i][2],chis[i][3]];
                this.initPengAndGangAndChis(pengangroot,side,pre,targetSide,index,mjid,"chi");
                index++;
            }
        }
    },
   
    initPengAndGangAndChis:function(pengangroot,side,pre,targetSide,index,mjid,flag){
        var pgroot = null;

        pgroot = pengangroot.children[index];
        pgroot.active = true;

        //
        this.hideSubPengang(pgroot);
        var name = null;
        //确定控件名字
        //targetside 0 上家 1对家 2下家
        //chi特殊处理
        if(flag == "chi"){
            for(let a = 0; a<mjid.length; a++){
                if(targetSide == mjid[a]){
                    targetSide = a;
                    break;
                }
            }
        }

        if(targetSide == 1){
            name = "_C";
        }   
        else if(targetSide == 0){
            name = "_L";
        }
        else if(targetSide == 2){
            name = "_R";
        }else if(targetSide == -1){
            //暗杠
            name = "_C";
        }

        if((flag != "peng") && (flag != "chi")){
            name = "Gang" + name;
        }else{
            name = "Peng" + name;
        }

        //取得penggang麻将组节点
        var sprites = null;
        for (let idx = 0; idx < pgroot.children.length; idx++) {
            if(name == pgroot.children[idx].name){
                pgroot.children[idx].active = true;
                sprites = pgroot.children[idx].children;
                break;
            }
        }

        if (!sprites) {
            cc.log("error sprites in initPengAndGangAndChis")
            return;
        }
        //var sprites = pgroot.getComponentsInChildren(cc.Sprite);
        for(var s = 0; s < sprites.length; ++s){            
            var sprite   = sprites[s].getComponent(cc.Sprite);
            var mjSprite = sprites[s].children[0].getComponent(cc.Sprite);

            sprite.node.color = cc.color(255, 255, 255);
            sprite.node.opacity = 255;
            mjSprite.node.color = cc.color(255, 255, 255);


            if(sprite.node.name == "B_MJ_UP" && flag != "angang"){
                var isGang = ((flag != "peng") && (flag != "chi"));
                if(cc.vv.mahjongmgr.getSpriteFrameByMingGangBg(sprite.spriteFrame.name, side)){
                    sprite.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMingGangBg(sprite.spriteFrame.name, side);
                }
                mjSprite.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJIDWithPenggang(pre, mjid[s], mjSprite.spriteFrame.name); 
                sprite.node.active = isGang;
            }
            else{
                
                if(flag == "angang"){
                    if(cc.vv.mahjongmgr.getSpriteFrameByAnGangBg(sprite.spriteFrame.name, side)){
                        sprite.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByAnGangBg(sprite.spriteFrame.name, side);
                    }
                    mjSprite.spriteFrame = null;
                }
                else{                                     
                    var mjIdx = s;
                    
                    if(side == "up" ||side == "right"){
                        if(s == 2){
                            mjIdx = 0;
                        }
                        else if(s == 0){
                            mjIdx = 2;
                        }
                        else {
                            mjIdx = 1;
                        }
                    }
                    
                    if(cc.vv.mahjongmgr.getSpriteFrameByMingGangBg(sprite.spriteFrame.name, side)){
                        sprite.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMingGangBg(sprite.spriteFrame.name, side);
                    }
                    mjSprite.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJIDWithPenggang(pre, mjid[mjIdx], mjSprite.spriteFrame.name);               
                }
                
            }
        }
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
