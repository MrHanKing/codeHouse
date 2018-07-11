
var ACTION_CHUPAI = 1;
var ACTION_MOPAI  = 2;
var ACTION_PENG   = 3;
var ACTION_GANG   = 4;
var ACTION_HU     = 5;
var ACTION_ZIMO   = 6;
var ACTION_CHI    = 7;
var ACTION_BUHUA  = 8;

var ACTION_ANGANE   = 9;
var ACTION_DIANGANE = 10;
var ACTION_WANGGANE = 11;

var ACTION_ANGAME_SFYG     = 12;
var ACTION_DIANGANE_SFYG   = 13;
var ACTION_WANGGANE_SFYG   = 14;

cc.Class({
    extends: cc.Component,

    properties: {        
        gameRoot:{
            default:null,
            type:cc.Node
        },
        
        prepareRoot:{
            default:null,
            type:cc.Node   
        },
        
        _myMJArr:[],
        _options:null,
        _selectedMJ:null,
        _touchMJXY:null,  
        _touchTuodong:null,
        _canChui:false,
        _touchMJ:null,
        _chupaiSprite:[],
        _mjcount:null,
        _gamecount:null,
        _magicPai:null,
        _saizi_1:null,
        _saizi_2:null,
        //_hupaiTips:[],
        //_hupaiLists:[],
        _playEfxs:[],
        _opts:[],
    },
    
    onLoad: function () {
        if(!cc.sys.isNative && cc.sys.isMobile){
            var cvs = this.node.getComponent(cc.Canvas);
            cvs.fitHeight = true;
            cvs.fitWidth = true;
        }
        if(!cc.vv){
            cc.director.loadScene("loading");
            return;
        }
        this.addComponent("NoticeTip");
        this.addComponent("Tip");
        //this.addComponent("GameOver");

        this.addComponent("PengGangs");
        //this.addComponent("MJRoom");
        this.addComponent("TimePointer");
        this.addComponent("GameResult");
        //this.addComponent("Chat");
        this.addComponent("Folds");
        //this.addComponent("ReplayCtrl");
        this.addComponent("PopupMgr");    
        this.addComponent("ReConnect");
        this.addComponent("Voice");
        //this.addComponent("UserInfoShow");
        this.addComponent("Ip");
        
        this.initView();
        this.initEventHandlers();
        
        this.gameRoot.active = false;
        this.prepareRoot.active = true;
        this.initWanfaLabel();
        this.onGameBeign();
        cc.vv.ip.check();
    },

    touchstart: function (event) {

        //如果不是自己的轮子，则忽略
        if(cc.vv.gameNetMgr.turn != cc.vv.gameNetMgr.seatIndex){
            cc.log3.debug("not your turn." + cc.vv.gameNetMgr.turn);
            return false;
        }

        if(!this._canChui)return false;

        //已经有状态不能拖
        if(this._touchMJ != null)return false;

        //已经选择的牌不能拖动
        this._touchMJ = event.target;
        if(this._touchMJ == this._selectedMJ)return false;

        this._touchMJ.opacity = 64;
        this._touchMJXY = event.target.getPosition();

        //将拖动牌显示为要打的牌
        //this._touchTuodong.getComponent(cc.Sprite).spriteFrame = this._touchMJ.getComponent(cc.Sprite).spriteFrame;
        this._touchTuodong.children[0].getComponent(cc.Sprite).spriteFrame = this._touchMJ.getChildByName("MyMahJongPai").getComponent(cc.Sprite).spriteFrame;
        
        this._touchTuodong.active = true;
        this._touchTuodong.setPosition(this._touchMJXY);
        return true;
    },

    touchmove: function (event) {

        if(this._touchMJ == null)return;

        var touch = event.getTouches(); 

        // if(this._selectedMJ != this._touchMJ){
            var delta = touch[0].getDelta();              //获取事件数据: delta
            this._touchTuodong.x += delta.x;
            this._touchTuodong.y += delta.y;
        // }
    },

    touchend: function (event) {

        if(this._touchMJ == null)return;
 
        this._touchTuodong.active = false;
        this._touchMJ.y = 0;
        this._touchMJ.opacity =255;
        this._touchMJ = null;  
    },

    touchcancel: function (event) {

        if(this._touchMJ == null)return;

        this._touchTuodong.active = false;
        this._touchMJ.y = 0;
        this._touchMJ.opacity =255;

        var touch = event.getTouches();  
        if(touch[0].getLocationY() > 120 ){

            //去掉点击选择，保障不要重复发送
            if(this._selectedMJ != null){
                this._selectedMJ.y = 0;
                this._selectedMJ.opacity =255;
                this._selectedMJ = null;
            }

            this.shoot(this._touchMJ.mjId); 
        }


        this._touchMJ = null;
    },
    
    initView:function(){
        
        //搜索需要的子节点
        var gameChild = this.node.getChildByName("game");
        
        this._mjcount = gameChild.getChildByName('mjcount').getComponent(cc.Label);
        this._mjcount.string = "剩余" + cc.vv.gameNetMgr.numOfMJ + "张" ;
        this._gamecount = gameChild.getChildByName('gamecount').getComponent(cc.Label);
        this._gamecount.string = "局数：" + "第" + cc.vv.gameNetMgr.numOfGames + "/" + cc.vv.gameNetMgr.maxNumOfGames + "局";

        this._magicPai  = gameChild.getChildByName('magicpaiinfo').children[0].getComponent(cc.Sprite);
        this._magicPai.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID("M_",cc.vv.gameNetMgr.magicPai);

        this._saizi_1   = gameChild.getChildByName("saizi_1").getComponent(cc.Sprite);
        this._saizi_1.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameBySaiZiID(cc.vv.gameNetMgr.saizi_1);
        this._saizi_2   = gameChild.getChildByName("saizi_2").getComponent(cc.Sprite);    
        this._saizi_2.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameBySaiZiID(cc.vv.gameNetMgr.saizi_2);

        var myselfChild = gameChild.getChildByName("myself");
        var myholds = myselfChild.getChildByName("holds").getChildByName("list");
        this._touchTuodong = myselfChild.getChildByName("holds").getChildByName("tuodong");
        
        for(var i = 0; i < myholds.children.length; ++i){
            var sprite = myholds.children[i].getComponent(cc.Sprite);
            this._myMJArr.push(sprite);
            //sprite.spriteFrame = null; 

            var button = myholds.children[i].getComponent(cc.Button);
            button.node.on(cc.Node.EventType.TOUCH_START, this.touchstart, this);
            button.node.on(cc.Node.EventType.TOUCH_MOVE, this.touchmove, this);
            button.node.on(cc.Node.EventType.TOUCH_END, this.touchend, this);
            button.node.on(cc.Node.EventType.TOUCH_CANCEL, this.touchcancel, this);
        }
        
        var realwidth = cc.director.getVisibleSize().width;
        myholds.scaleX *= realwidth/1280;
        myholds.scaleY *= realwidth/1280;  
        
        var sides = ["myself","right","up","left"];
        for(var i = 0; i < sides.length; ++i){
            var side = sides[i];            
            var sideChild = gameChild.getChildByName(side);
            this._playEfxs.push(sideChild.getChildByName("play_efx").getComponent(cc.Animation));            
            //this._chupaiSprite.push(sideChild.getChildByName("ChuPai"));
            var opt = sideChild.getChildByName("opt");
            opt.active = false;
            var sprite = opt.getChildByName("pai").children[0].getComponent(cc.Sprite);
            var data = {
                node:opt,
                sprite:sprite
            };
            this._opts.push(data);
        }
        
        var opts = gameChild.getChildByName("ops");
        var chiopts = gameChild.getChildByName("chipaiOps");
        var gangopts = gameChild.getChildByName("gangpaiOps");
        this._options = opts;
        this._ChipaiOpts = chiopts;
        this._GangpaiOpts = gangopts;
        this.hideOptions();
        cc.vv.folds.hideChupai();
        this.hideChipaiOpts();
        this.hideGangPaiOpts();
        this.hideReplay(gameChild);
    },

    hideReplay:function(gameChild){
        if(!cc.vv.replayMgr.isReplay())return;

        gameChild.getChildByName('mjcount').active = false;
        // gameChild.getChildByName('gamecount').active = false;
    },
    
   
    getActiveUserSex:function(seatIndex){
        var seatData = cc.vv.gameNetMgr.seats[seatIndex];
        var userid = seatData.userid;
        if(userid != null && userid > 0){
            var sex = 0;
            if(cc.vv.baseInfoMap){
                var info = cc.vv.baseInfoMap[userid];
                if(info){
                    sex = info.sex;
                }                
            }
            return sex;
        }

        return 0;
    },
    
    initEventHandlers:function(){
        cc.vv.gameNetMgr.dataEventHandler = this.node;
        
        //初始化事件监听器
        var self = this;
        
        this.node.on('game_holds',function(data){
           self.initMahjongs();
        
        });
        
        this.node.on('game_begin',function(data){
            self.onGameBeign();
        });
        
        this.node.on('game_sync',function(data){
            self.onGameBeign();
        });
        
        this.node.on('game_chupai',function(data){
            data = data.detail;
            cc.vv.folds.hideChupai();
        
            if(data.last != cc.vv.gameNetMgr.seatIndex){
                self.initMopai(data.last,null);   
            }
            if(!cc.vv.replayMgr.isReplay() && data.turn != cc.vv.gameNetMgr.seatIndex){
                self.initMopai(data.turn,-1);
            }
        });
        
        this.node.on('game_mopai',function(data){
            cc.vv.folds.hideChupai();
            data = data.detail;
            var pai = data.pai;
            var localIndex = cc.vv.gameNetMgr.getLocalIndex(data.seatIndex);
            if(localIndex == 0){
                var index = 13;
                var sprite = self._myMJArr[index];
                
                sprite.node.mjId = pai;  
                sprite.node.y = 0; 
                sprite.node.active = true; 
                            
                var gameChild  = self.node.getChildByName("game");
                var sideChild  = gameChild.getChildByName("myself");
                var holds = sideChild.getChildByName("holds").getChildByName("list");
                
                var mjSprite = holds.children[index].getChildByName("MyMahJongPai").getComponent(cc.Sprite);
                self.setSpriteFrameByMJID("M_",mjSprite,pai,index);

                var mask   = holds.children[index].getChildByName("magic_mash");                

                if(pai ==  cc.vv.gameNetMgr.magicPai){
                    mask.active = true;
                }
                else{
                    mask.active = false;
                }
                self._canChui = true;

                self.initMahjongs();
            }
            else if(cc.vv.replayMgr.isReplay()){
                self.initMopai(data.seatIndex,pai);
            }
        });
        
        this.node.on('game_action',function(data){
            self.showAction(data.detail);
        });
        
        this.node.on('hupai',function(data){
            var data = data.detail;
            //如果不是玩家自己，则将玩家的牌都放倒
            var seatIndex = data.seatindex;
            var localIndex = cc.vv.gameNetMgr.getLocalIndex(seatIndex);
            
            if(localIndex == 0){
                self.hideOptions();
                self.hideChipaiOpts();
                self.hideGangPaiOpts();
            }
            var seatData = cc.vv.gameNetMgr.seats[seatIndex];
            seatData.hued = true;
  
            self.initHupai(localIndex,data.hupai);
            if(data.iszimo){
                if(seatData.seatindex == cc.vv.gameNetMgr.seatIndex){
                    seatData.holds.pop();
                    self.initMahjongs();                
                }
                else{
                    self.initOtherMahjongs(seatData);
                }
            } 
           
            
            if(cc.vv.replayMgr.isReplay() == true){
                var opt = self._opts[localIndex];
                opt.node.active = true;
                opt.sprite.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID("M_",data.hupai);                
            }
            
            self.playEfx(localIndex,"play_hu");
            
            cc.vv.audioMgr.playDialect("hu.mp3",self.getActiveUserSex(seatIndex));
        });
        
        this.node.on('mj_count',function(data){
            self._mjcount.string = "剩余" + cc.vv.gameNetMgr.numOfMJ + "张";
        });
        
        this.node.on('game_magic',function(data){
            cc.log3.debug("magic pai = " + cc.vv.gameNetMgr.magicPai);
            self._magicPai.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID("M_",cc.vv.gameNetMgr.magicPai);
        });

        this.node.on('game_saizi',function(data){
            cc.log3.debug("saizi_1 = "+ cc.vv.gameNetMgr.saizi_1 + " saizi_2="+cc.vv.gameNetMgr.saizi_2);
            self._saizi_1.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameBySaiZiID(cc.vv.gameNetMgr.saizi_1);
            self._saizi_2.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameBySaiZiID(cc.vv.gameNetMgr.saizi_2);
        });

        this.node.on('game_num',function(data){
            self._gamecount.string = "局数：" + "第" + cc.vv.gameNetMgr.numOfGames + "/" + cc.vv.gameNetMgr.maxNumOfGames + "局";
        });
        
        this.node.on('game_over',function(data){
            self.gameRoot.active = false;
            self.prepareRoot.active = true;
        });
        
        
        this.node.on('game_chupai_notify',function(data){
            cc.vv.folds.hideChupai();
            var seatData = data.detail.seatData;
            //如果是自己，则刷新手牌
            if(seatData.seatindex == cc.vv.gameNetMgr.seatIndex){
                self.initMahjongs();                
            }
            else{
                self.initOtherMahjongs(seatData);
            }
            
            var audioUrl = cc.vv.mahjongmgr.getAudioURLByMJID(data.detail.pai);
            cc.vv.audioMgr.playDialect(audioUrl,self.getActiveUserSex(seatData.seatindex));

            cc.vv.folds.showChupai();
        });
        
        this.node.on('guo_notify',function(data){
            cc.vv.folds.hideChupai();
            self.hideOptions();
            self.hideChipaiOpts();
            self.hideGangPaiOpts();
            var seatData = data.detail;
            //如果是自己，则刷新手牌
            if(seatData.seatindex == cc.vv.gameNetMgr.seatIndex){
                self.initMahjongs();                
            }
            cc.vv.audioMgr.playSFX("give.mp3");
        });
        
        this.node.on('guo_result',function(data){
            self.hideOptions();
        });
        
        this.node.on('game_dingque_finish',function(data){
            self.initMahjongs();
        });

        this.node.on('chupai_limit_notify_push',function(data){
            var seatData = data.detail;
            if(seatData.seatindex == cc.vv.gameNetMgr.seatIndex){
                self._canChui = true;              
            }
        });
        
        this.node.on('peng_notify',function(data){
            cc.vv.folds.hideChupai();
            
            var seatData = data.detail;
            if(seatData.seatindex == cc.vv.gameNetMgr.seatIndex){
                self.initMahjongs();  
                self._canChui = true;              
            }
            else{
                self.initOtherMahjongs(seatData);
            }
            var localIndex = self.getLocalIndex(seatData.seatindex);
            self.playEfx(localIndex,"play_peng");
            cc.vv.audioMgr.playDialect("peng.mp3",self.getActiveUserSex(seatData.seatindex));
            self.hideOptions();
            self.hideChipaiOpts();
        });
        
         this.node.on('chi_notify',function(data){    
            cc.vv.folds.hideChupai();
            
            var seatData = data.detail;
            if(seatData.seatindex == cc.vv.gameNetMgr.seatIndex){
                self.initMahjongs();     
                self._canChui = true;           
            }
            else{
                self.initOtherMahjongs(seatData);
            }
            var localIndex = self.getLocalIndex(seatData.seatindex);
            self.playEfx(localIndex,"play_chi");
            cc.vv.audioMgr.playDialect("chi.mp3",self.getActiveUserSex(seatData.seatindex));
            self.hideOptions();
            self.hideChipaiOpts();
        });
	
        this.node.on('buhua_notify',function(data){
            cc.log3.debug("MJgame buhua_notify");
            var seatData = data.detail;
            if(seatData.seatindex == cc.vv.gameNetMgr.seatIndex){
                self.initMahjongs();   
                self._canChui = true;             
            }
            else{
                self.initOtherMahjongs(seatData);
            }
            var localIndex = self.getLocalIndex(seatData.seatindex);
            self.playEfx(localIndex,"play_buhua");
            cc.vv.audioMgr.playDialect("buhua.mp3",self.getActiveUserSex(seatData.seatindex));
            self.hideOptions();
        });

        this.node.on('gang_notify',function(data){
            cc.vv.folds.hideChupai();
            var data = data.detail;
            var seatData = data.seatData;
            var gangtype = data.gangtype;
            if(seatData.seatindex == cc.vv.gameNetMgr.seatIndex){
                self.initMahjongs();   
                self._canChui = true;             
            }
            else{
                self.initOtherMahjongs(seatData);
            }

            /*
            var localIndex = self.getLocalIndex(seatData.seatindex);
            if(gangtype == ACTION_WANGGANE || gangtype == ACTION_WANGGANE_SFYG){
                self.playEfx(localIndex,"play_guafeng");
                cc.vv.audioMgr.playSFX("guafeng.mp3");
            }
            else{
                self.playEfx(localIndex,"play_xiayu");
                cc.vv.audioMgr.playSFX("rain.mp3");
            }
            */

            self.hideChipaiOpts();
            self.hideGangPaiOpts();
        });
        
        this.node.on("hangang_notify",function(data){
            var data = data.detail;
            var localIndex = self.getLocalIndex(data);
            self.playEfx(localIndex,"play_gang");
            cc.vv.audioMgr.playDialect("gang.mp3",self.getActiveUserSex(data));
            self.hideOptions();
            self.hideGangPaiOpts();
            self.hideChipaiOpts();
        });
    },

    /*
    showChupai:function(){
        var pai = cc.vv.gameNetMgr.chupai; 
        if( pai >= 0 ){            
            var localIndex = this.getLocalIndex(cc.vv.gameNetMgr.turn);
            var sprite = this._chupaiSprite[localIndex].children[0].getComponent(cc.Sprite);
            sprite.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID("M_",pai);
            this._chupaiSprite[localIndex].active = true;
        }
    },

    hideChupai:function(){
        for(var i = 0; i < this._chupaiSprite.length; ++i){
            //this._chupaiSprite[i].node.active = false;
            this._chupaiSprite[i].active = false;
        }        
    },
    */

    showGang:function(pai,paiWik,actpai){
        cc.log3.debug("gang pai = "+pai+",paiWik ="+paiWik);
        if(paiWik.length == 1)
        {
            cc.vv.net.send("gang",{pai:actpai[0],Wik:paiWik[0]});
            return;
        }
        this.hideOptions();
        this._GangpaiOpts.active = true;
        for(var i =0; i<paiWik.length;++i)
        {
            this.addGangpai('pai_bottom',paiWik[i],pai,actpai[i]);
        }           
    },

    onGangChecked:function(event){
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        cc.log3.debug("onGangChecked pai="+event.target.pai);
        cc.log3.debug("onGangChecked paiWik="+event.target.paiWik);
        cc.vv.net.send("gang",{pai:event.target.pai,Wik:event.target.paiWik});
    },

    addGangpai:function(btnName,paiWik,pai,actpai){
        cc.log3.debug("the pai=" +pai+",the wik ="+paiWik);
        cc.log3.debug("the chipaiots num = " + this._GangpaiOpts.childrenCount);

        for(var i = 0; i < this._GangpaiOpts.childrenCount; ++i){
            var child = this._GangpaiOpts.children[i]; 

            cc.log3.debug("the child name = "+child.name);
            cc.log3.debug("the child active = "+child.active);

            if(child.name == "op" && child.active == false){
                child.active = true;                
                var spriteL = child.getChildByName("opTarget0").children[0].getComponent(cc.Sprite);
                cc.log3.debug("spriteL = "+spriteL);
                spriteL.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID("M_",actpai[0]);
                cc.log3.debug("spriteFrame = "+spriteL.spriteFrame);

                var spriteC = child.getChildByName("opTarget1").children[0].getComponent(cc.Sprite);
                spriteC.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID("M_",actpai[1]);

                var spriteR = child.getChildByName("opTarget2").children[0].getComponent(cc.Sprite);
                spriteR.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID("M_",actpai[2]);

                 var spriteR = child.getChildByName("opTarget3").children[0].getComponent(cc.Sprite);
                spriteR.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID("M_",actpai[3]);

                var btn = child.getChildByName(btnName); 
                
                btn.active = true;
                btn.pai = actpai;
                btn.paiWik = paiWik;
                cc.log3.debug("btn.pai:"+btn.pai);
                cc.log3.debug("btn.paiWik:"+btn.paiWik);
                return;
            }
        }
    },   

    hideGangPaiOpts:function(data){
        this._GangpaiOpts.active = false;
        cc.log3.debug("the hideGangPaiOpts num = " + this._GangpaiOpts.childrenCount);
        for(var i=0;i<this._GangpaiOpts.childrenCount;++i){
            var child = this._GangpaiOpts.children[i];
            cc.log3.debug("the child name = "+child.name);
            cc.log3.debug("the child active = "+child.active);
            if(child.name == "op"){
                child.active = false;                                
            }
        }
    },


    showChipai:function(pai,paiWik){
        cc.log3.debug("chi pai = "+pai+",paiWik ="+paiWik);
        
        if(paiWik == 0x01 || paiWik ==  0x02 || paiWik == 0x04){
            //单一吃型
            //发送，不用选择
             cc.vv.net.send("chi",{pai:pai,Wik:paiWik});
            return;
        }

        this.hideOptions();
        this._ChipaiOpts.active = true;

        if(paiWik & 0x01) { //左吃
            this.addChipai("pai_bottom",0x01,pai);
        }
        
        if(paiWik & 0x02){
            this.addChipai("pai_bottom",0x02,pai);
        }

        if(paiWik & 0x04){
            this.addChipai("pai_bottom",0x04,pai);
        }        
    },

     
    onChipaiChecked:function(event){
        cc.vv.audioMgr.playSFX("ui_click.mp3");
         cc.vv.net.send("chi",{pai:event.target.pai,Wik:event.target.paiWik});
    },

    addChipai:function(btnName,paiWik,pai){
        var paiL =0;
        var paiC =0;
        var paiR =0;
        cc.log3.debug("the pai=" +pai+",the wik ="+paiWik);
        if(paiWik == 0x01){
            paiL =pai;
            paiC =pai+1;
            paiR =pai+2;
        }else if(paiWik == 0x02){
            paiL =pai-1;
            paiC =pai;
            paiR =pai+1;
        }else if(paiWik == 0x04){
            paiL =pai-2;
            paiC =pai-1;
            paiR =pai;
        }


        for(var i = 0; i < this._ChipaiOpts.childrenCount; ++i){
            var child = this._ChipaiOpts.children[i]; 
            if(child.name == "op" && child.active == false){
                child.active = true;                
                //var spriteL = child.getChildByName("opTargetL").getComponent(cc.Sprite);
                var spriteL = child.getChildByName("opTargetL").children[0].getComponent(cc.Sprite);
                spriteL.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID("M_",paiL);
                //var spriteC = child.getChildByName("opTargetC").getComponent(cc.Sprite);
                var spriteC = child.getChildByName("opTargetC").children[0].getComponent(cc.Sprite);
                spriteC.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID("M_",paiC);

                //var spriteR = child.getChildByName("opTargetR").getComponent(cc.Sprite);
                var spriteR = child.getChildByName("opTargetR").children[0].getComponent(cc.Sprite);
                spriteR.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID("M_",paiR);

                var btn = child.getChildByName(btnName); 
                btn.active = true;
                btn.pai = pai;
                btn.paiWik = paiWik;
                return;
            }
        }
    },       

    hideChipaiOpts:function(data){
        this._ChipaiOpts.active = false;
        for(var i=0;i<this._ChipaiOpts.childrenCount;++i){
            var child = this._ChipaiOpts.children[i];
            if(child.name == "op"){
                child.active = false;                                
            }
        }
    },


    addOption:function(btnName,pai,paiWik){
        for(var i = 0; i < this._options.childrenCount; ++i){
            var child = this._options.children[i]; 
            //修改，切换后台后，一轮过后，还是这个动作时，数据没有变化（特别是吃的情况！会导致出现5张相同的牌）
            if(child.name == "op" && child.active == false){
                child.active = true;
                var btn = child.getChildByName(btnName); 
                btn.active = true;
                btn.pai = pai;      
                btn.paiWik = paiWik;
                return;
            }
        }
    },

    addOptionTmp:function(btnName,pai,paiWik,actpai){
        for(var i = 0; i < this._options.childrenCount; ++i){
            var child = this._options.children[i]; 
            if(child.name == "op" && child.active == false){
                child.active = true;
                var btn = child.getChildByName(btnName); 
                btn.active = true;
                btn.pai = pai;      
                btn.paiWik = paiWik;
                btn.actpai = actpai;
                return;
            }
        }
    },
    
    hideOptions:function(data){
        this._options.active = false;
        for(var i = 0; i < this._options.childrenCount; ++i){
            var child = this._options.children[i]; 
            if(child.name == "op"){
                child.active = false;
                child.getChildByName("btnPeng").active = false;
                child.getChildByName("btnGang").active = false;
                child.getChildByName("btnHu").active = false;
                child.getChildByName("btnChi").active = false;
            }
        }
    },
    
    showAction:function(data){
        if(this._options.active){
            this.hideOptions();
        }
        
        if(data && (data.hu || data.gang || data.peng|| data.chi || data.buhua)){
            this._options.active = true;
            if(data.chi){
                cc.log3.debug("data.pai"+data.pai+",paiWik = "+data.paiWik);
                this.addOption("btnChi",data.pai,data.paiWik);
            }

            if(data.peng){
                this.addOption("btnPeng",data.pai,null);
            }
                        
            if(data.gang){
                var gp = data.wik[0];
                this.addOptionTmp("btnGang",gp[1],data.wik,data.ActPai);
            }

            if(data.hu){
                this.addOption("btnHu",data.pai,null);
            }

            for(var i = 0; i < this._options.childrenCount; ++i){
                var child = this._options.children[i]; 
                if(child.name == "btnGuo"){
                    if(data.guo){
                        child.active = true;
                    }
                    else{
                        child.active = false;
                    }
                }
            }
        }
    },
    
    onOptionClicked:function(event){
        cc.log3.debug(event.target.pai);

        cc.vv.audioMgr.playSFX("ui_click.mp3");

        if(event.target.name == "btnPeng"){
            cc.vv.net.send("peng");
        }
        else if(event.target.name == "btnGang"){   
            this.showGang(event.target.pai,event.target.paiWik,event.target.actpai);
        }
        else if(event.target.name == "btnHu"){
            cc.vv.net.send("hu");
        }
        else if(event.target.name == "btnChi"){
            this.showChipai(event.target.pai,event.target.paiWik);
        }
        else if(event.target.name == "btnGuo"){
            cc.vv.net.send("guo");
        }
    },

    initWanfaLabel:function(){
        var wanfa = cc.find("Canvas/infobar/wanfa").getComponent(cc.Label);
        wanfa.string = cc.vv.gameNetMgr.getWanfa();
    },
    
    initHupai:function(localIndex,pai){
        //if(cc.vv.gameNetMgr.conf.type == "xlch"){
            /*
            var hupailist = this._hupaiLists[localIndex];
            for(var i = 0; i < hupailist.children.length; ++i){
                var hupainode = hupailist.children[i]; 
                if(hupainode.active == false){
                    var pre = cc.vv.mahjongmgr.getFoldPre(localIndex);
                    hupainode.getComponent(cc.Sprite).spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID(pre,pai);
                    hupainode.active = true;
                    break;
                }
            }   
            */
        //}
    },
    
    playEfx:function(index,name){
        this._playEfxs[index].node.active = true;
        this._playEfxs[index].play(name);
        this._playEfxs[index].node.scaleX = 0.8;
        this._playEfxs[index].node.scaleY = 0.8;
    },
    
    onGameBeign:function(){
        
        for(var i = 0; i < this._playEfxs.length; ++i){
            this._playEfxs[i].node.active = false;
        }

        for(var i = 0; i < cc.vv.gameNetMgr.seats.length; ++i){
            var seatData = cc.vv.gameNetMgr.seats[i];
            var localIndex = cc.vv.gameNetMgr.getLocalIndex(i);        
            
            if(seatData.huinfo){
                for(var j = 0; j < seatData.huinfo.length; ++j){
                    var info = seatData.huinfo[j];
                    if(info.ishupai){
                        this.initHupai(localIndex,info.pai);    
                    }
                }
            }
        }
        
        cc.vv.folds.hideChupai();
        this.hideOptions();
        this.hideChipaiOpts();
        this.hideGangPaiOpts();
        var sides = ["right","up","left"];        
        var gameChild = this.node.getChildByName("game");
        for(var i = 0; i < sides.length; ++i){
            var sideChild = gameChild.getChildByName(sides[i]);
            var holds = sideChild.getChildByName("holds");
            if(cc.vv.replayMgr.isReplay() == false){
                var holdsreplay = sideChild.getChildByName("holdsreplay");
                holdsreplay.active = false;
            }

            for(var j = 0; j < holds.childrenCount; ++j){
                var nc = holds.children[j];
                nc.active = true;
                //nc.scaleX = 1.0;
                //nc.scaleY = 1.0;
                var sprite = nc.getComponent(cc.Sprite); 
                sprite.spriteFrame = cc.vv.mahjongmgr.holdsEmpty[i+1];
            }            
        }
      
        if(cc.vv.gameNetMgr.gamestate == "" && cc.vv.replayMgr.isReplay() == false){
            return;
        }

        this.gameRoot.active = true;
        this.prepareRoot.active = false;
        this.initMahjongs();
        var seats = cc.vv.gameNetMgr.seats;
        for(var i in seats){
            var seatData = seats[i];
            var localIndex = cc.vv.gameNetMgr.getLocalIndex(i);
            if(localIndex != 0){
                this.initOtherMahjongs(seatData);
                if(i == cc.vv.gameNetMgr.turn){
                    this.initMopai(i,-1);
                }
                else{
                    this.initMopai(i,null);    
                }
            }
            
        }
        
        if(cc.vv.gameNetMgr.curaction != null){
            this.showAction(cc.vv.gameNetMgr.curaction);
            cc.vv.gameNetMgr.curaction = null;
        }
        cc.vv.folds.showChupai();
        this._canChui = (cc.vv.gameNetMgr.turn == cc.vv.gameNetMgr.seatIndex);
    },
    
    onMJClicked:function(event){
        //如果不是自己的轮子，则忽略
        if(cc.vv.gameNetMgr.turn != cc.vv.gameNetMgr.seatIndex){
            cc.log3.debug("not your turn." + cc.vv.gameNetMgr.turn);
            return;
        }

        if(!this._canChui)return;

        if(this._touchMJ != null){
            this._touchMJ.opacity =255;
            this._touchMJ = null;    
            this._touchTuodong.active = false;
        }    

        for(var i = 0; i < this._myMJArr.length; ++i){
            this._myMJArr[i].node.opacity = 255;
            if(event.target == this._myMJArr[i].node){
                //如果是再次点击，则出牌
                if(event.target == this._selectedMJ){
                    this.shoot(this._selectedMJ.mjId); 
                    this._selectedMJ.y = 0;
                    this._selectedMJ.opacity =255;
                    this._selectedMJ = null;
                    return;
                }
                if(this._selectedMJ != null){
                    this._selectedMJ.y = 0;
                }
                event.target.y = 15;
                this._selectedMJ = event.target;
                return;
            }
        }
    },
    
    //出牌
    shoot:function(mjId){
        if(mjId == null){
            return;
        }

        if(!this._canChui)return;

        var timePointer = this.node.getComponent("TimePointer");
        timePointer.stopDiDi();

        this._canChui = false;
        cc.vv.net.send('chupai',mjId);
        this._touchTuodong.active = false;
    },
    
    getMJIndex:function(side,index){
        if(side == "right" || side == "up"){
            return 13 - index;
        }
        return index;
    },
    
    initMopai:function(seatIndex,pai){
        var localIndex = cc.vv.gameNetMgr.getLocalIndex(seatIndex);
        var side = cc.vv.mahjongmgr.getSide(localIndex);
        var pre = cc.vv.mahjongmgr.getFoldPre(localIndex);
        
        var gameChild = this.node.getChildByName("game");
        var sideChild = gameChild.getChildByName(side);
        var lastIndex = this.getMJIndex(side,13);
        var holds = sideChild.getChildByName("holds");
        holds.active =  false;

        if(cc.vv.replayMgr.isReplay() && side != "myself"){
            var sideHoldsReplay = sideChild.getChildByName("holdsreplay");
            sideHoldsReplay.active =  false;
            holds = sideHoldsReplay;
        }
        holds.active = true;

        var nc = holds.children[lastIndex];

        //nc.scaleX = 1.0;
        //nc.scaleY = 1.0;
                        
        if(pai == null){
            nc.active = false;
        }
        else if(pai >= 0){
            nc.active = true;            
            var sprite = nc.getComponent(cc.Sprite); 
            var mjSprite = nc.getChildByName("MyMahJongPai").getComponent(cc.Sprite);
            mjSprite.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID(pre,pai);

            var mask   = nc.getChildByName("magic_mash");
            if(mask != null){
                if(pai ==  cc.vv.gameNetMgr.magicPai){ 
                    mask.active = true;
                }
                else{
                    mask.active = false;
                }
            }           
        }
        else if(pai != null){
            if(!cc.vv.replayMgr.isReplay()){
                nc.active = true;
                if(side == "up"){
                    nc.scaleX = 1.0;
                    nc.scaleY = 1.0;                    
                }
                var sprite = nc.getComponent(cc.Sprite);             
                sprite.spriteFrame = cc.vv.mahjongmgr.getHoldsEmptySpriteFrame(side);
            }            
        }

        //更新手牌数
        var ho = 0;
        for(var i=0; i<holds.children.length ;i++){
            if(holds.children[i].active){
                ho++;
            }
        }        
        this.setShoupai(localIndex,ho);
    },
    
    initEmptySprites:function(seatIndex){
        var localIndex = cc.vv.gameNetMgr.getLocalIndex(seatIndex);
        var side = cc.vv.mahjongmgr.getSide(localIndex);
        var pre = cc.vv.mahjongmgr.getFoldPre(localIndex);
        
        var gameChild = this.node.getChildByName("game");
        var sideChild = gameChild.getChildByName(side);
        var holds = sideChild.getChildByName("holds");
        var spriteFrame = cc.vv.mahjongmgr.getEmptySpriteFrame(side);
        for(var i = 0; i < holds.childrenCount; ++i){
            var nc = holds.children[i];
            //nc.scaleX = 1.0;
            //nc.scaleY = 1.0;
            
            var sprite = nc.getComponent(cc.Sprite); 
            sprite.spriteFrame = spriteFrame;
        }
    },
    
    initOtherMahjongs:function(seatData){
        var localIndex = this.getLocalIndex(seatData.seatindex);
        if(localIndex == 0){
            return;
        }
        var side = cc.vv.mahjongmgr.getSide(localIndex);
        var game = this.node.getChildByName("game");
        var sideRoot = game.getChildByName(side);
        var sideHolds = sideRoot.getChildByName("holds");        
        var sideHoldsReplay = sideRoot.getChildByName("holdsreplay");
        sideHolds.active = false;
        sideHoldsReplay.active = false;
    
        var holds = this.sortHolds(seatData);
        if(holds != null && holds.length > 0){           
            sideHolds = sideHoldsReplay;            
        }

        sideHolds.active = true;

        var num = 0;
        if(seatData.pengs != null){   
            num += seatData.pengs.length;
        }
        if(seatData.angangs != null){
            num += seatData.angangs.length;
        }
        if(seatData.diangangs != null){
             num += seatData.diangangs.length;
        }
        if(seatData.wangangs != null){
            num += seatData.wangangs.length;
        }
        if(seatData.chis != null){
            num += seatData.chis.length;
        }
        num = num*3;
	
	    for(var i = 0; i < num; ++i){
            var idx = this.getMJIndex(side,i);
            sideHolds.children[idx].active = false;
        }


        //更新手牌数
        this.setShoupai(localIndex,13 - num);

        //回放界面，holds为非NULL
        if(holds != null && holds.length > 0){

            var pre = cc.vv.mahjongmgr.getFoldPre(localIndex);
            for(var i = 0; i < holds.length; ++i){
                var idx = this.getMJIndex(side,i + num);

                var sprite = sideHolds.children[idx].getComponent(cc.Sprite); 
                sprite.node.active = true;

                var mjSprite = sideHolds.children[idx].getChildByName("MyMahJongPai").getComponent(cc.Sprite); 
                mjSprite.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID(pre,holds[i]);                            
            }
            
            if(holds.length + num == 13){
                var lasetIdx = this.getMJIndex(side,13);
                sideHolds.children[lasetIdx].active = false;
            }
        }
    },
    
    sortHolds:function(seatData){
        var holds = seatData.holds;
        if(holds == null){
            return null;
        }
        
        //如果手上的牌的数目是2,5,8,11,14，表示最后一张牌是刚摸到的牌
        var mopai = null;
        var l = holds.length;
        if( l == 2 || l == 5 || l == 8 || l == 11 || l == 14){
            mopai = holds.pop();
        }
                
        var magicPai = cc.vv.gameNetMgr.magicPai;
        cc.vv.mahjongmgr.sortMJ(holds,magicPai);
        
        //将摸牌添加到最后
        if(mopai != null){
            holds.push(mopai);
        }
        return holds;
    },

    setShoupai:function(setaIndex,value){
        // var localIndex = cc.vv.gameNetMgr.getLocalIndex(setaIndex);
        var side = cc.vv.mahjongmgr.getSide(setaIndex);

        var gameChild = this.node.getChildByName("game");
        var sideNode = gameChild.getChildByName(side);
        var seat = sideNode.getChildByName("seat");
        var shoupai = seat.getChildByName('shoupai').getComponent(cc.Label);

        shoupai.string = "手牌 X" + value;
    },
    
    initMahjongs:function(){

        this._touchTuodong.active = false;
        
        var seats = cc.vv.gameNetMgr.seats;
        var seatData = seats[cc.vv.gameNetMgr.seatIndex];
        var holds = this.sortHolds(seatData);
        if(holds == null){
            return;
        }
        
        var lackingNum = 0;
        if(seatData.pengs != null){   
            lackingNum += seatData.pengs.length;
        }
        if(seatData.angangs != null){
            lackingNum += seatData.angangs.length;
        }
        if(seatData.diangangs != null){
            lackingNum += seatData.diangangs.length;
        }
        if(seatData.wangangs != null){
            lackingNum += seatData.wangangs.length;
        }
        if(seatData.chis != null){
            lackingNum += seatData.chis.length;
        }

        //初始化手牌
        lackingNum = lackingNum *3;

        var localIndex = cc.vv.gameNetMgr.getLocalIndex(cc.vv.gameNetMgr.seatIndex);
        var side = cc.vv.mahjongmgr.getSide(localIndex);
        var pre = cc.vv.mahjongmgr.getFoldPre(localIndex);
        
        var gameChild = this.node.getChildByName("game");
        var sideChild = gameChild.getChildByName(side);
        var holdsChild = sideChild.getChildByName("holds").getChildByName("list");

        //更新手牌数
        this.setShoupai(localIndex,holds.length);

        for(var i = 0; i < holds.length; ++i){
            var mjid = holds[i];
            var sprite = this._myMJArr[i + lackingNum];
            sprite.node.mjId = mjid;
            sprite.node.y = 0;
            sprite.node.opacity = 255;
            sprite.node.active = true;
            var mjSprite = holdsChild.children[i + lackingNum].getChildByName("MyMahJongPai").getComponent(cc.Sprite); 

            this.setSpriteFrameByMJID("M_",mjSprite,mjid);

            var mask   = holdsChild.children[i + lackingNum].getChildByName("magic_mash");
            if(mjid ==  cc.vv.gameNetMgr.magicPai){
                mask.active = true;
            }
            else{
                mask.active = false;
            }
        }

        for(var i = 0; i < lackingNum; ++i){
            var sprite = this._myMJArr[i]; 
            sprite.node.mjId = null;
            //sprite.spriteFrame = null;
            sprite.node.active = false;
        }

        for(var i = lackingNum + holds.length; i < this._myMJArr.length; ++i){
            var sprite = this._myMJArr[i]; 
            sprite.node.mjId = null;
            //sprite.spriteFrame = null;
            sprite.node.active = false;            
        }
    },
    
    setSpriteFrameByMJID:function(pre,sprite,mjid){
        sprite.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID(pre,mjid);
        
        //sprite.node.y = 0; 
        sprite.node.opacity = 255; 
        sprite.node.active = true;
    },
    
    getLocalIndex:function(index){
        var ret = (index - cc.vv.gameNetMgr.seatIndex + 4) % 4;        
        return ret;
    },
    
    
    
    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
    },
    
    onDestroy:function(){
        cc.log3.debug("onDestroy");
        if(cc.vv){
            cc.vv.gameNetMgr.clear();   
        }
    }
});
