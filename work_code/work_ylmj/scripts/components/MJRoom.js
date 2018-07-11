cc.Class({
    extends: cc.Component,

    properties: {
        lblRoomNo:{
            default:null,
            type:cc.Label
        },

        interactPrefab:{
            default:null,
            type:cc.Prefab
        },

        interactAltas:{
            default:null,
            type:cc.SpriteAtlas
        },

        // foo: {
        //    default: null,
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        _seats:[],
        _seats2:[],
        _timeLabel:null,
        _voiceMsgQueue:[],
        _lastPlayingSeat:null,
        _playingSeat:null,
        _lastPlayTime:null,
    },

    // use this for initialization
    onLoad: function () {
        if(cc.vv == null){
            return;
        }
        
        this.initView();
        this.initSeats();
        this.initEventHandlers();
    },
    
    initView:function(){
        var prepare = this.node.getChildByName("prepare");
        var seats = prepare.getChildByName("seats");
        for(var i = 0; i < seats.children.length; ++i){
            this._seats.push(seats.children[i].getComponent("Seat"));
        }
        this.MenuNode = cc.find("Canvas/menu");
        this.btn_menu_node = cc.find("Canvas/btn_menu");
        this.refreshBtns();
        
        this.lblRoomNo = cc.find("Canvas/infobar/Z_room_txt").getComponent(cc.Label);
        this._timeLabel = cc.find("Canvas/infobar/time").getComponent(cc.Label);
        this.lblRoomNo.string = "房号："+cc.vv.gameNetMgr.roomId;
        
        var gameChild = this.node.getChildByName("game");
        var sides = ["myself","right","up","left"];
        for(var i = 0; i < sides.length; ++i){
            var sideNode = gameChild.getChildByName(sides[i]);
            var seat = sideNode.getChildByName("seat");
            this._seats2.push(seat.getComponent("Seat"));
        }
        
        var btnWechat = cc.find("Canvas/prepare/btnWeichat");
        if(btnWechat){
            cc.vv.utils.addClickEvent(btnWechat,this.node,"MJRoom","onBtnWeichatClicked");
        }
               
        /*
        var huyan = cc.sys.localStorage.getItem("huyan");
        if(huyan == null)huyan = "0";
        cc.find("Canvas/bg/Z_backgroud_night").active = (huyan=='1');
        */

        //处理游戏背景跟类型的关系
        cc.vv.gameNetMgr.refreshBg();
        var tbId = cc.sys.localStorage.getItem("tbID");
        if(tbId == null)tbId = 0;
        
        var tbList = [0,1,2];

        if(tbId < 0){
            tbId = 0;
        }
        if(tbId >= tbList.length){
            tbId = tbList.length -1;
        }
        
        for(var i = 0; i < tbList.length;i++){
            var tbname = "Canvas/bg/Z_backgroud_"+i;
            if(tbId == i){
                cc.find(tbname).active = true;
            }
            else{
                cc.find(tbname).active = false;
            }
        }

        var titles = cc.find("Canvas/typeTitle");
        for(var i = 0; i < titles.children.length; ++i){
            titles.children[i].active = false;
        }
        
        if(cc.vv.gameNetMgr.conf){
            var type  = null;
            var bbh = cc.vv.gameNetMgr.conf.bbh;
            
            if(bbh == 1){
                type = "txbbh";
            }
            else{
                type = "fanhuamj";
            }
            titles.getChildByName(type).getComponent(cc.Sprite).spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByTitleId(bbh==1?true:false,tbId);            
            titles.getChildByName(type).active = true;   
        }
    },
    
    refreshBtns:function(){
        var prepare = this.node.getChildByName("prepare");
        var btnExit = prepare.getChildByName("btnExit");
        var btnDispress = prepare.getChildByName("btnDissolve");
        var btnWeichat = prepare.getChildByName("btnWeichat");
        var btnBack = prepare.getChildByName("btnBack");
        var isIdle = cc.vv.gameNetMgr.numOfGames == 0;

        if (cc.vv.gameNetMgr.getChangJingTypeName() == "3D") {
            this.btn_menu_node.active = !cc.vv.replayMgr.isReplay();
            var btn_menu_exit = this.node.getChildByName("menu").getChildByName("btnExit");
            var btn_menu_other_exit = this.node.getChildByName("menu").getChildByName("btnOtherExit");
            btn_menu_other_exit.active = !cc.vv.gameNetMgr.isOwner() && isIdle;
            btn_menu_exit.active = cc.vv.gameNetMgr.isOwner() && isIdle;
            //游戏进行的时候直接显示解散房间按钮
            if (!btn_menu_other_exit.active && !btn_menu_exit.active) {
                btn_menu_exit.active = true;
            }
        }else{
            //房间加入者，退出房间
            btnExit.active = !cc.vv.gameNetMgr.isOwner() && isIdle;
            btnBack.active = cc.vv.gameNetMgr.isOwner() && isIdle;
        }

        //房间创建者，退出房间
        btnDispress.active = cc.vv.gameNetMgr.isOwner() && isIdle;
       
        btnWeichat.active = isIdle;     
    },
    
    getSpriteFrameByInteract:function(act){
        var spriteFrameName = null;
        if(act == "zhadan"){
            spriteFrameName = "emoji_iconBomb";
        }else if(act == "poshui"){
            spriteFrameName = "emoji_iconBucket";
        }else if(act == "zhuaji"){
            spriteFrameName = "emoji_iconChick";
        }else if(act == "xianhua"){
            spriteFrameName = "emoji_iconFlower";
        }else if(act == "fanqie"){
            spriteFrameName = "emoji_iconTomatoes";
        }
        return this.interactAltas.getSpriteFrame(spriteFrameName);
    },

    playInteractVoice:function(act){
        var vioceName = null;
        if(act == "zhadan"){
            vioceName = "interact_bomb";
        }else if(act == "poshui"){
            vioceName = "interact_bucket";
        }else if(act == "zhuaji"){
            vioceName = "interact_chick";
        }else if(act == "xianhua"){
            vioceName = "interact_flower";
        }else if(act == "fanqie"){
            vioceName = "interact_tomatoes";
        }
        vioceName = vioceName +".mp3";
        cc.vv.audioMgr.playSFX(vioceName);
    },

    initEventHandlers:function(){
        var self = this;
        this.node.on('new_user',function(data){
            self.initSingleSeat(data.detail);
            cc.vv.tip.show(data.detail.name + ' 进入房间');
        });
        
        this.node.on('user_state_changed',function(data){
            self.initSingleSeat(data.detail);
        });
        
        this.node.on('game_begin',function(data){
            self.refreshBtns();
            self.initSeats();
        });
        
        this.node.on('game_num',function(data){
            self.refreshBtns();
        });

        this.node.on('game_huanpai',function(data){
            for(var i in self._seats2){
                self._seats2[i].refreshXuanPaiState();    
            }
        });
                
        this.node.on('huanpai_notify',function(data){
            var idx = data.detail.seatindex;
            var localIdx = cc.vv.gameNetMgr.getLocalIndex(idx);
            self._seats2[localIdx].refreshXuanPaiState();
        });
        
        this.node.on('game_huanpai_over',function(data){
            for(var i in self._seats2){
                self._seats2[i].refreshXuanPaiState();    
            }
        });
        
        this.node.on('voice_msg',function(data){
            var data = data.detail;
            self._voiceMsgQueue.push(data);
            self.playVoice();
        });
        
        this.node.on('chat_push',function(data){
            var data = data.detail;
            var idx = cc.vv.gameNetMgr.getSeatIndexByID(data.sender);
            var localIdx = cc.vv.gameNetMgr.getLocalIndex(idx);
            self._seats[localIdx].chat(data.content);
            self._seats2[localIdx].chat(data.content);
        });
        
        this.node.on('quick_chat_push',function(data){
            var data = data.detail;
            var idx = cc.vv.gameNetMgr.getSeatIndexByID(data.sender);
            var localIdx = cc.vv.gameNetMgr.getLocalIndex(idx);
            
            var index = data.content;
            var info = cc.vv.chat.getQuickChatInfo(index);
            self._seats[localIdx].chat(info.content);
            self._seats2[localIdx].chat(info.content);
            
            cc.vv.audioMgr.playSFX(info.sound);
        });
        
        this.node.on('emoji_push',function(data){
            var data = data.detail;
            var idx = cc.vv.gameNetMgr.getSeatIndexByID(data.sender);
            var localIdx = cc.vv.gameNetMgr.getLocalIndex(idx);
            cc.log3.debug(data);
            self._seats[localIdx].emoji(data.content);
            self._seats2[localIdx].emoji(data.content);
        });

        this.node.on('interact_push',function(data){
            var data = data.detail;
            var SenderIdx = cc.vv.gameNetMgr.getSeatIndexByID(data.sender);
            var ReceiverIdx = cc.vv.gameNetMgr.getSeatIndexByID(data.receiver);
            var SenderLocalIdx = cc.vv.gameNetMgr.getLocalIndex(SenderIdx);
            var ReceiverLocalIdx  = cc.vv.gameNetMgr.getLocalIndex(ReceiverIdx);
     
            var interactNode = cc.instantiate(self.interactPrefab);
            

            if(interactNode != null){      
                self.node.addChild(interactNode);        
                interactNode.getComponent(cc.Sprite).spriteFrame = self.getSpriteFrameByInteract(data.content);

                var senderPos   = self._seats[SenderLocalIdx].node.getPosition();
                var receiverPos = self._seats[ReceiverLocalIdx].node.getPosition();
                interactNode.active = true;
                interactNode.setPosition(senderPos);

                interactNode.runAction(cc.sequence(cc.show(),cc.moveTo(0.5,receiverPos),cc.hide(),cc.callFunc(function () {    
                    interactNode.active = false;               
                    self._seats[ReceiverLocalIdx].interact(data.content);
                    self._seats2[ReceiverLocalIdx].interact(data.content);
                    self.playInteractVoice(data.content);
                }, this)));
            }
        });

        this.node.on('game_over',function(data){
            var seats = cc.vv.gameNetMgr.seats;
            for(var i = 0; i < seats.length; ++i){
                self._seats[i].emoji(null);
                self._seats2[i].emoji(null);

                self._seats[i].chat(null);
                self._seats2[i].chat(null);

                self._seats[i].interact(null);
                self._seats2[i].interact(null);
            }
        });

    },
    
    initSeats:function(){
        var seats = cc.vv.gameNetMgr.seats;
        for(var i = 0; i < seats.length; ++i){
            this.initSingleSeat(seats[i]);
        }
    },
    
    initSingleSeat:function(seat){
        var index = cc.vv.gameNetMgr.getLocalIndex(seat.seatindex);
        var isOffline = !seat.online;
        var isZhuang = seat.seatindex == cc.vv.gameNetMgr.button;
        
        this._seats[index].setInfo(seat.name,seat.score);
        this._seats[index].setReady(seat.ready);
        this._seats[index].setOffline(isOffline);
        this._seats[index].setID(seat.userid);
        this._seats[index].voiceMsg(false);
        
        this._seats2[index].setInfo(seat.name,seat.score);
        this._seats2[index].setZhuang(isZhuang);
        this._seats2[index].setOffline(isOffline);
        this._seats2[index].setID(seat.userid);
        this._seats2[index].voiceMsg(false);
        this._seats2[index].refreshXuanPaiState();
    },
    
    //3d麻将才会用到
    onBtnMenuClicked:function(){
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        if (this.MenuNode) {
            this.MenuNode.active = !this.MenuNode.active;
        }else{
            cc.log("can not show this, MJRoom onBtnMenuClicked is error")
        }
    },

    onBtnSettingsClicked:function(){
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        cc.vv.popupMgr.showSettings();   
    },

    onBtnBackClicked:function(){
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        cc.vv.alert.show("返回大厅","返回大厅房间仍会保留，快去邀请大伙来玩吧！",function(){
           cc.vv.gameNetMgr.gameGoToHallOrClub(); 
        },true);
    },
    
    onBtnChatClicked:function(){
        
    },
    
    onBtnWeichatClicked:function(){
        cc.vv.audioMgr.playSFX("ui_click.mp3");

        var cntUser = 0;
        var cntMaxUser = 4;
        for (var i = 0; i < cntMaxUser; i++) {
            if (cc.vv.gameNetMgr.seats && cc.vv.gameNetMgr.seats[i] && cc.vv.gameNetMgr.seats[i].userid > 0) {
                cntUser++;
            }
        }

        cc.vv.shareCtrl.gameInviteFriend(cc.vv.gameNetMgr.roomId, cntMaxUser, cntUser);
    },
    
    onBtnDissolveClicked:function(){

        cc.vv.audioMgr.playSFX("ui_click.mp3");

        if(cc.vv.gameNetMgr.numOfGames == 0){
            cc.vv.alert.show("解散房间","解散房间不扣钻石，是否确定解散？",function(){
                cc.vv.net.send("dispress");    
            },true);
            return;
        }

        cc.vv.alert.show("解散房间","您现在在游戏中，是否确定解散？",function(){
            cc.vv.net.send("dissolve_request");    
        },true);
    },
    
    onBtnExit:function(){
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        cc.vv.net.send("exit");
    },
    
    playVoice:function(){
        if(this._playingSeat == null && this._voiceMsgQueue.length){
            cc.log3.debug("playVoice2");
            var data = this._voiceMsgQueue.shift();
            var idx = cc.vv.gameNetMgr.getSeatIndexByID(data.sender);
            var localIndex = cc.vv.gameNetMgr.getLocalIndex(idx);
            this._playingSeat = localIndex;
            this._seats[localIndex].voiceMsg(true);
            this._seats2[localIndex].voiceMsg(true);
            
            var msgInfo = JSON.parse(data.content);
            
            var msgfile = "voicemsg.amr";
            cc.log3.debug(msgInfo.msg.length);
            cc.vv.voiceMgr.writeVoice(msgfile,msgInfo.msg);
            cc.vv.voiceMgr.play(msgfile);
            this._lastPlayTime = Date.now() + msgInfo.time;
        }
    },
    
    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        var minutes = Math.floor(Date.now()/1000/60);
        if(this._lastMinute != minutes){
            this._lastMinute = minutes;
            var date = new Date();
            var h = date.getHours();
            h = h < 10? "0"+h:h;
            
            var m = date.getMinutes();
            m = m < 10? "0"+m:m;
            this._timeLabel.string = "" + h + ":" + m;             
        }
        
        
        if(this._lastPlayTime != null){
            if(Date.now() > this._lastPlayTime + 200){
                this.onPlayerOver();
                this._lastPlayTime = null;    
            }
        }
        else{
            this.playVoice();
        }
    },
    
        
    onPlayerOver:function(){
        cc.vv.audioMgr.resumeAll();
        cc.log3.debug("onPlayCallback:" + this._playingSeat);
        var localIndex = this._playingSeat;
        this._playingSeat = null;
        this._seats[localIndex].voiceMsg(false);
        this._seats2[localIndex].voiceMsg(false);
    },
    
    onDestroy:function(){
        cc.vv.voiceMgr.stop();
//        cc.vv.voiceMgr.onPlayCallback = null;
    }
});
