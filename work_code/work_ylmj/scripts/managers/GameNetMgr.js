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
        dataEventHandler:null,
        roomId:null,
        maxNumOfGames:0,
        numOfGames:0,
        numOfMJ:0,
        liupaiCnt:0,
        shenyupai:0,
        magicPai:-1,
        saizi_1:-1,
        saizi_2:-1,
        seatIndex:-1,
        seats:null,
        turn:-1,
        button:-1,
        dingque:-1,
        chupai:-1,
        isDingQueing:false,
        isHuanSanZhang:false,
        gamestate:"",
        isOver:false,
        dissoveData:null,
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
    
    reset:function(){
        this.turn = -1;
        this.chupai = -1,
        this.dingque = -1;
        this.button = -1;
        this.magicPai = -1;
        this.saizi_1 =-1,
        this.saizi_2 =-1,

        this.gamestate = "";
        //this.dingque = -1;
        this.isDingQueing = false;
        this.isHuanSanZhang = false;
        this.curaction = null;
        for(var i = 0; i < this.seats.length; ++i){
            this.seats[i].holds = [];
            this.seats[i].folds = [];
            this.seats[i].pengs = [];
            this.seats[i].chis  = [];
            this.seats[i].huas  = [];
            this.seats[i].piaonum = 0;
            this.seats[i].angangs = [];
            this.seats[i].diangangs = [];
            this.seats[i].wangangs = [];
            this.seats[i].dingque = -1;
            this.seats[i].ready = false;
            this.seats[i].hued = false;
            this.seats[i].huanpais = null;
            
            this.huanpaimethod = -1;
        }
    },
    
    clear:function(){
        this.dataEventHandler = null;
        if(this.isOver == null){
            this.seats = null;
            this.roomId = null;
            this.maxNumOfGames = 0;
            this.numOfGames = 0;        
        }
    },
    
    dispatchEvent(event,data){
        if(this.dataEventHandler){
            this.dataEventHandler.emit(event,data);
        }    
    },
    
    getSeatIndexByID:function(userId){
        for(var i = 0; i < this.seats.length; ++i){
            var s = this.seats[i];
            if(s.userid == userId){
                return i;
            }
        }
        return -1;
    },
    
    isOwner:function(){
        return this.seatIndex == 0;   
    },
    
    getSeatByID:function(userId){
        var seatIndex = this.getSeatIndexByID(userId);
        var seat = this.seats[seatIndex];
        return seat;
    },
    
    getSelfData:function(){
        return this.seats[this.seatIndex];
    },
    
    getLocalIndex:function(index){
        var ret = (index - this.seatIndex + 4) % 4;
        return ret;
    },

    gameGoToHallOrClub:function() {
        if (this.conf && Number(this.conf.clubid) != 0) {
            cc.vv.userMgr.gotoClub();
        }else{
            cc.vv.userMgr.gotoHall();
        }
    },
    
    prepareReplay:function(roomInfo,detailOfGame,userid){
        this.dissoveData = null;
        this.roomId = roomInfo.id;
        this.seats = roomInfo.seats;
        this.turn = detailOfGame.base_info.button;
        this.button = detailOfGame.base_info.button;
        var baseInfo = detailOfGame.base_info;

        this.magicPai = baseInfo.magicPai;
        this.saizi_1  = baseInfo.saizi_1;
        this.saizi_2  = baseInfo.saizi_2;
        
        if(baseInfo.conf){
            this.maxNumOfGames = baseInfo.conf.maxGames;
            this.numOfGames = baseInfo.index + 1;
        }else{
            this.maxNumOfGames = 1;
            this.numOfGames = 1;
        }
    
        if(!this.seats){
            this.seats = roomInfo.seats;
        }

        for(var i = 0; i < this.seats.length; ++i){
            var s = this.seats[i];
            s.seatindex = i;
            s.score = null;
            s.holds = baseInfo.game_seats[i];
            s.pengs = [];
            s.chis = [];
            s.huas =[];
            s.piaonum = 0;
            s.angangs = [];
            s.diangangs = [];
            s.wangangs = [];
            s.folds = [];
            cc.log3.debug(s);
            if(userid == s.userid){
                this.seatIndex = i;
            }
        }

        if(baseInfo.conf){
            this.conf = baseInfo.conf;
        }else{
            this.conf = {
                type:baseInfo.type,
            }

            if(this.conf.type == null){
                this.conf.type == "txmj";
            }
        }
    },
    
    getWanfa:function(){
        var conf = this.conf;
        if(conf && conf.maxGames!=null && conf.maxFan!=null){
            var strArr = [];

            if(conf.type == "txmj"){
                strArr.push("桐乡");
            }
            else if(conf.type == "zqmj"){
                strArr.push("洲泉");
            }
            else{
                strArr.push("崇福");
            }
            
            if(conf.bbh == 1){
                strArr.push("白板花");
            }else{
                strArr.push("翻花");
            }

            if (conf.paytype == 1) {
                if (Number(conf.clubid) != 0) {
                    strArr.push("亲友群付费");
                }else{
                    strArr.push("房主付费");
                }
            }else if(conf.paytype == 0) {
                strArr.push("AA制");
            }
            
            strArr.push(conf.maxGames + "局");

            if(conf.maxFan == 0){
                strArr.push("不封顶");
            }else{
                strArr.push(conf.maxFan+"片封顶");
            }

            if(conf.hengfan){
                strArr.push("横翻");
            }else{
                strArr.push("不横翻");
            }
            return strArr.join(" ");
        }
        return "";
    },

    danmu:function(message){
        var root = cc.director.getScene().getChildByName('Canvas');
        
        //Prefab的路徑
        //不過因為我們的MyPrefab直接就放在 /assets/resources/ 下，就直接寫
        var prefabPath = 'prefabs/message';
        //Ps. 假設你是放在在resources下的prefabs資料夾中，你就得寫 'prefabs/MyPrefab'
        
        
        //這邊我們新增一個私有方法，來做為載入Prefab時的方法
        //(當然你也可以直接寫在loadRes參數上，我只是覺得這樣比較容易看清楚)
        var onResourceLoaded = function( errorMessage, loadedResource )
        {
            //一樣，養成檢查的好習慣
            if( errorMessage ) { cc.log( '載入Prefab失敗, 原因:' + errorMessage ); return; }
            if( !( loadedResource instanceof cc.Prefab ) ) { cc.log( '你載入的不是Prefab, 你做了什麼事?' ); return; } //這個是型別的檢查
            
            //接著，我們就可以進行實例化了
            var newMyPrefab = cc.instantiate( loadedResource );
            
            root.addChild(newMyPrefab);
        
            //随机出现高度
            var Rand = Math.round(Math.random() * 400) - 200; //四舍五入

            newMyPrefab.y = Rand;
            newMyPrefab.x = 650;

            newMyPrefab.getChildByName('message').getComponent(cc.Label).string = message;
            var length = newMyPrefab.getChildByName('message').width;
            newMyPrefab.width =  length + 70;
            
            newMyPrefab.runAction(
                cc.sequence( 
                    cc.moveTo(20.0,cc.p(-640 - newMyPrefab.width,Rand)),
                    cc.callFunc(function () {
                        newMyPrefab.removeFromParent();
                    },this)
                )
            );

        };

        //這邊才是真的使用cc.loader進行載入，並且呼叫我們上面寫的方法
        cc.loader.loadRes( prefabPath, onResourceLoaded );
    },
    
    initHandlers:function(){
        var self = this;
        cc.vv.net.addHandler("login_result",function(data){
            cc.log3.debug(data);
            if(data.errcode === 0){
                var data = data.data;
                self.roomId = data.roomid;
                self.conf = data.conf;
                self.maxNumOfGames = data.conf.maxGames;
                self.numOfGames = data.numofgames;
                self.seats = data.seats;
                self.seatIndex = self.getSeatIndexByID(cc.vv.userMgr.userId);
                self.magicPai =  data.seats[self.seatIndex].magicPai;
                self.saizi_1 = data.seats[self.seatIndex].saizi_1;
                self.saizi_2 = data.seats[self.seatIndex].saizi_2;
                self.isOver = false;
            }
            else{
                cc.log3.debug(data.errmsg);   
            }
        });
                
        cc.vv.net.addHandler("login_finished",function(data){
            cc.log3.debug("login_finished");
            self.loadGameScene()
        });

        cc.vv.net.addHandler("exit_result",function(data){
            self.roomId = null;
            self.turn = -1;
            self.dingque = -1;
            self.isDingQueing = false;
            self.seats = null;
        });
        
        cc.vv.net.addHandler("exit_notify_push",function(data){
           var userId = data;
           var s = self.getSeatByID(userId);
           if(s != null){
               s.userid = 0;
               s.name = "";
               self.dispatchEvent("user_state_changed",s);
           }
        });
        
        cc.vv.net.addHandler("dispress_push",function(data){
            self.roomId = null;
            self.turn = -1;
            self.dingque = -1;
            self.isDingQueing = false;
            self.seats = null;
        });
                
        cc.vv.net.addHandler("disconnect",function(data){
            if(self.roomId == null){
                self.gameGoToHallOrClub();
            }
            else{
                if(self.isOver == false){
                    cc.vv.userMgr.oldRoomId = self.roomId;
                    self.dispatchEvent("disconnect");                    
                }
                else{
                    self.roomId = null;
                }
            }
        });
        
        cc.vv.net.addHandler("new_user_comes_push",function(data){
            //cc.log3.debug(data);
            var seatIndex = data.seatindex;
            if(self.seats[seatIndex].userid > 0){
                self.seats[seatIndex].online = true;
            }
            else{
                data.online = true;
                self.seats[seatIndex] = data;
            }
            self.dispatchEvent('new_user',self.seats[seatIndex]);
        });
        
        cc.vv.net.addHandler("user_state_push",function(data){
            //cc.log3.debug(data);
            var userId = data.userid;
            var seat = self.getSeatByID(userId);
            seat.online = data.online;
            self.dispatchEvent('user_state_changed',seat);

            if(seat.online != null && !seat.online && self.isOver != true){
                cc.vv.tip.show(seat.name + ' 离线了');
            }
        });
        
        cc.vv.net.addHandler("user_ready_push",function(data){
            //cc.log3.debug(data);
            var userId = data.userid;
            var seat = self.getSeatByID(userId);
            seat.ready = data.ready;
            self.dispatchEvent('user_state_changed',seat);
        });
        
        cc.vv.net.addHandler("game_holds_push",function(data){
            var seat = self.seats[self.seatIndex]; 
            cc.log3.debug(data);
            seat.holds = data;
            
            for(var i = 0; i < self.seats.length; ++i){
                var s = self.seats[i]; 
                if(s.folds == null){
                    s.folds = [];
                }
                if(s.pengs == null){
                    s.pengs = [];
                }
                if(s.chis == null)
                {
                    s.chis =[];
                }
                if(s.huas == null)
                {
                    s.huas = [];
                }
                s.piaonum = 0;
                
                if(s.angangs == null){
                    s.angangs = [];
                }
                if(s.diangangs == null){
                    s.diangangs = [];
                }
                if(s.wangangs == null){
                    s.wangangs = [];
                }
                s.ready = false;
            }
            self.dispatchEvent('game_holds');
        });
        
        cc.vv.net.addHandler("game_magic_push",function(data){
            cc.log3.debug("game_magic_push");
            cc.log3.debug(data);
            self.magicPai = data;

            self.dispatchEvent('game_magic');
        });

        cc.vv.net.addHandler("message",function(data){
            var ret = data;
            switch(ret.type){
                // case "1":{
                //     if(!cc.vv.tip)return;
                //     cc.vv.tip.show(ret.message);
                // } 
                // break;
                case "2":{
                    if(!cc.vv.alert)return;
                    cc.vv.alert.show("提示",ret.message,function(){
                        switch(ret.action){
                            case "1":{  //重启
                                cc.game.restart();
                            }
                            break;
                            case "2":{  //游戏关闭
                                cc.vv.g3Plugin.end();
                            }
                            break;
                        }
                    },false); 
                }
                break;
                case "3":{
                    self.danmu(ret.message);
                }
                break;
            }
        });

        cc.vv.net.addHandler("game_saizi_push",function(data){
            cc.log3.debug("game_saizi_push");
            cc.log3.debug(data);
            self.saizi_1 = data.saizi_1;
            self.saizi_2 = data.saizi_2;
            self.dispatchEvent('game_saizi');
        });
        cc.vv.net.addHandler("game_begin_push",function(data){
            cc.log3.debug('game_begin_push');
            cc.log3.debug(data);
            self.button = data;
            self.turn = self.button;
            self.gamestate = "begin";
            self.dispatchEvent('game_begin');
        });
        
        cc.vv.net.addHandler("game_playing_push",function(data){
            cc.log3.debug('game_playing_push'); 
            self.gamestate = "playing"; 
            cc.vv.ip.check();
            self.dispatchEvent('game_playing');
        });
        
        cc.vv.net.addHandler("game_sync_push",function(data){
            cc.log3.debug("game_sync_push");
            cc.log3.debug(data);
            self.numOfMJ = data.numofmj;
            self.liupaiCnt=data.liupaiCnt;
            self.shenyupai = self.numOfMJ - self.liupaiCnt;
            self.magicPai =  data.magicPai;
            self.saizi_1 = data.saizi_1;
            self.saizi_2 = data.saizi_2;
            self.gamestate = data.state;
            /*
            if(self.gamestate == "dingque"){
                self.isDingQueing = true;
            }
            else if(self.gamestate == "huanpai"){
                self.isHuanSanZhang = true;
            }*/
            self.turn = data.turn;
            self.button = data.button;
            self.chupai = data.chuPai;
            self.huanpaimethod = data.huanpaimethod;
            for(var i = 0; i < 4; ++i){
                var seat = self.seats[i];
                var sd = data.seats[i];
                seat.holds = sd.holds;
                seat.folds = sd.folds;
                seat.angangs = sd.angangs;
                seat.diangangs = sd.diangangs;
                seat.wangangs = sd.wangangs;
                seat.pengs = sd.pengs;
                seat.chis  = sd.chis;
                seat.huas  = sd.huas;
                seat.piaonum = sd.piaonum;
                seat.dingque = sd.que;
                seat.hued = sd.hued; 
                seat.iszimo = sd.iszimo;
                seat.huinfo = sd.huinfo;
                seat.huanpais = sd.huanpais;
                if(i == self.seatIndex){
                    self.dingque = sd.que;
                }
           }
           //这个事件发出去ui也收不到的
        //    self.dispatchEvent('game_sync',data);
        });
        
        cc.vv.net.addHandler("game_dingque_push",function(data){
            self.isDingQueing = true;
            self.isHuanSanZhang = false;
            self.dispatchEvent('game_dingque');
        });
        
        cc.vv.net.addHandler("game_huanpai_push",function(data){
            self.isHuanSanZhang = true;
            self.dispatchEvent('game_huanpai');
        });
        
        cc.vv.net.addHandler("hangang_notify_push",function(data){
            self.dispatchEvent('hangang_notify',data);
        });
        
        cc.vv.net.addHandler("game_action_push",function(data){
            self.curaction = data;
            cc.log3.debug(data);
            self.dispatchEvent('game_action',data);
        });
        
        cc.vv.net.addHandler("game_chupai_push",function(data){
            cc.log3.debug('game_chupai_push');
            //cc.log3.debug(data);
            var turnUserID = data;
            var si = self.getSeatIndexByID(turnUserID);
            self.doTurnChange(si);
        });
        
        cc.vv.net.addHandler("game_num_push",function(data){
            self.numOfGames = data;
            self.dispatchEvent('game_num',data);
        });

        cc.vv.net.addHandler("game_over_push",function(data){
            cc.log3.debug('game_over_push');
            var results = data.results;
            for(var i = 0; i <  self.seats.length; ++i){
                self.seats[i].score = results.length == 0? 0:results[i].totalscore;
            }
            self.dispatchEvent('game_over',results);
            if(data.endinfo){
                self.isOver = true;
                for(var i = 0; i <  self.seats.length; ++i){
                    self.seats[i].score = data.endinfo[i].totalscore;
                }
                self.dispatchEvent('game_end',data.endinfo);    
            }
            self.reset();
            for(var i = 0; i <  self.seats.length; ++i){
                self.dispatchEvent('user_state_changed',self.seats[i]);    
            }
        });
        
        cc.vv.net.addHandler("mj_count_push",function(data){
            cc.log3.debug('mj_count_push');
            self.numOfMJ = data.numOfMJ;
            self.liupaiCnt = data.liupaiCnt;
            self.shenyupai = self.numOfMJ - self.liupaiCnt;
            //cc.log3.debug(data);
            self.dispatchEvent('mj_count',data);
        });
        
        cc.vv.net.addHandler("hu_push",function(data){
            cc.log3.debug('hu_push');
            cc.log3.debug(data);
            self.doHu(data);
        });
        
        cc.vv.net.addHandler("game_chupai_notify_push",function(data){
            var userId = data.userId;
            var pai = data.pai;
            var si = self.getSeatIndexByID(userId);
            self.doChupai(si,pai);
        });
        
        cc.vv.net.addHandler("game_mopai_push",function(data){
            cc.log3.debug('game_mopai_push');
            self.doMopai(self.seatIndex,data);
        });
        
        cc.vv.net.addHandler("guo_notify_push",function(data){
            cc.log3.debug('guo_notify_push');
            var userId = data.userId;
            var pai = data.pai;
            var si = self.getSeatIndexByID(userId);
            self.doGuo(si,pai);
        });
        
        cc.vv.net.addHandler("guo_result",function(data){
            cc.log3.debug('guo_result');
            self.dispatchEvent('guo_result');
        });
        
        cc.vv.net.addHandler("guohu_push",function(data){
            cc.log3.debug('guohu_push');
            self.dispatchEvent("push_notice",{info:"过胡",time:1.5});
        });
        
        cc.vv.net.addHandler("huanpai_notify",function(data){
            var seat = self.getSeatByID(data.si);
            seat.huanpais = data.huanpais;
            self.dispatchEvent('huanpai_notify',seat);
        });
        
        cc.vv.net.addHandler("game_huanpai_over_push",function(data){
            cc.log3.debug('game_huanpai_over_push');
            var info = "";
            var method = data.method;
            if(method == 0){
                info = "换对家牌";
            }
            else if(method == 1){
                info = "换下家牌";
            }
            else{
                info = "换上家牌";
            }
            self.huanpaimethod = method;
            cc.vv.gameNetMgr.isHuanSanZhang = false;
            self.dispatchEvent("game_huanpai_over");
            self.dispatchEvent("push_notice",{info:info,time:2});
        });
        
        cc.vv.net.addHandler("peng_notify_push",function(data){
            cc.log3.debug('peng_notify_push');
            cc.log3.debug(data);
            var userId = data.userid;
            var pai = data.pai;
            var si = self.getSeatIndexByID(userId);
            self.doPeng(si,data.pai);
        });

        cc.vv.net.addHandler("chupai_limit_notify_push",function(data){
            self.dispatchEvent('chupai_limit_notify_push',data);
        });

        cc.vv.net.addHandler("chi_notify_push",function(data){
            cc.log3.debug('chi_notify_push');
            cc.log3.debug(data);
            var userId = data.userid;
            var pai = data.pai;
            var chiPai = data.chiPai;
            var si = self.getSeatIndexByID(userId);
            self.doChi(si,data.pai,chiPai);
        });
        cc.vv.net.addHandler("buhua_notify_push",function(data){
            cc.log3.debug('buhua_notify_push');
            cc.log3.debug(data);
            var userId = data.userid;
            var pai    = data.pai;
            var piaonum =  data.piaonum;
            var si = self.getSeatIndexByID(userId);
            self.doBuhua(si,pai,piaonum);
        });
        cc.vv.net.addHandler("gang_notify_push",function(data){
            cc.log3.debug('gang_notify_push');
            cc.log3.debug(data);
            var userId = data.userid;
            var pai = data.pai;
            var gangpai =  data.gangpai;
            var si = self.getSeatIndexByID(userId);
            self.doGang(si,pai,gangpai,data.gangtype);
        });
        
        
        cc.vv.net.addHandler("game_dingque_notify_push",function(data){
            self.dispatchEvent('game_dingque_notify',data);
        });
        
        cc.vv.net.addHandler("game_dingque_finish_push",function(data){
            for(var i = 0; i < data.length; ++i){
                self.seats[i].dingque = data[i];
            }
            self.dispatchEvent('game_dingque_finish',data);
        });
        
        
        cc.vv.net.addHandler("chat_push",function(data){
            self.dispatchEvent("chat_push",data);    
        });
        
        cc.vv.net.addHandler("quick_chat_push",function(data){
            self.dispatchEvent("quick_chat_push",data);
        });
        
        cc.vv.net.addHandler("emoji_push",function(data){
            self.dispatchEvent("emoji_push",data);
        });

        cc.vv.net.addHandler("interact_push",function(data){
            self.dispatchEvent("interact_push",data);
        });

        cc.vv.net.addHandler("dissolve_notice_push",function(data){
            cc.log3.debug("dissolve_notice_push"); 
            cc.log3.debug(data);
            self.dissoveData = data;
            self.dispatchEvent("dissolve_notice",data);
        });
        
        cc.vv.net.addHandler("dissolve_cancel_push",function(data){
            self.dissoveData = null;
            self.dispatchEvent("dissolve_cancel",data);
        });
        
        cc.vv.net.addHandler("voice_msg_push",function(data){
            self.dispatchEvent("voice_msg",data);
        });
    },

    loadGameScene:function(){
        var changjing = this.getChangJingTypeName();
        if(changjing == "2D"){
            cc.director.loadScene("mjgame");
        }else if(changjing == "3D"){
            cc.director.loadScene("3Dmjgame");
        }
    },

    refreshBg:function(){
        var changjing = this.getChangJingTypeName();
        if(changjing == "2D"){

        }else if(changjing == "3D"){
            cc.sys.localStorage.setItem("tbID",0);
        }
    },

    setGameSceneTo2DOr3D:function(name){
        if(name == "2D" || name == "3D"){
            cc.sys.localStorage.setItem("changjing",name);
        }else{
            cc.log("setGameSceneTo2DOr3D have a bug");
            cc.sys.localStorage.setItem("changjing","3D");
        }
    },

    getChangJingTypeName:function(){
        var changjing = cc.sys.localStorage.getItem("changjing");
        if(changjing){
            return cc.sys.localStorage.getItem("changjing");
        }else{
            cc.sys.localStorage.setItem("changjing","3D");
            return "3D";
        }
    },
    
    doGuo:function(seatIndex,pai){
        var seatData = this.seats[seatIndex];
        var folds = seatData.folds;
        folds.push(pai);
        this.dispatchEvent('guo_notify',seatData);    
    },
    
    doMopai:function(seatIndex,pai){
        var seatData = this.seats[seatIndex];
        if(seatData.holds){
            seatData.holds.push(pai);
            this.dispatchEvent('game_mopai',{seatIndex:seatIndex,pai:pai});            
        }
    },
    
    doChupai:function(seatIndex,pai){
        this.chupai = pai;
        var seatData = this.seats[seatIndex];
        if(seatData.holds){             
            var idx = seatData.holds.indexOf(pai);
            seatData.holds.splice(idx,1);
        }
        this.dispatchEvent('game_chupai_notify',{seatData:seatData,pai:pai});    
    },
    
    doPeng:function(seatIndex,pai){
        var seatData = this.seats[seatIndex];
        //移除手牌
        if(seatData.holds){
            for(var i = 0; i < 2; ++i){
                var idx = seatData.holds.indexOf(pai[1]);
                seatData.holds.splice(idx,1);
            }                
        }
            
        //更新碰牌数据
        var pengs = seatData.pengs;
        pengs.push(pai);
            
        this.dispatchEvent('peng_notify',seatData);
    },
    
    doChi:function(seatIndex,pai,chiPai){

        var seatData = this.seats[seatIndex];
        //移除手牌
        if(seatData.holds){
            for(var i=1;i<chiPai.length;++i){
                if(chiPai[i] == pai){
                    continue;
                }

                var idx = seatData.holds.indexOf(chiPai[i]);
                if(idx == -1){  
                    continue;
                }
                seatData.holds.splice(idx,1);
            }       
        }

        //更新吃牌数据
        seatData.chis.push(chiPai);
       
        this.dispatchEvent('chi_notify',seatData);
    },

    doBuhua:function(seatIndex,pai,piaonum) {
        var seatData = this.seats[seatIndex];
        //更新补花牌数据
        if(seatData.holds){
            var idx = seatData.holds.indexOf(pai);
            if(idx != -1){  
                seatData.holds.splice(idx,1);
            }
        }

        if(seatData.huas){
            seatData.huas.push(pai);
        }

        seatData.piaonum = piaonum;

        this.dispatchEvent('buhua_notify',seatData);
    },

    getGangType:function(seatData,pai){
        if(seatData.pengs.indexOf(pai) != -1){
            return "wangang";
        }
        else{
            var cnt = 0;
            for(var i = 0; i < seatData.holds.length; ++i){
                if(seatData.holds[i] == pai){
                    cnt++;
                }
            }
            if(cnt == 3){
                return "diangang";
            }
            else{
                return "angang";
            }
        }
    },
    
    doGang:function(seatIndex,pai,gangActPais,gangtype){
        var seatData = this.seats[seatIndex];
    
        cc.log3.debug("doGang pai=" + pai);
        cc.log3.debug("doGang gangpai="+gangActPais);
        cc.log3.debug(seatData.holds);

        if(gangtype == ACTION_WANGGANE){
            cc.log3.debug(seatData.pengs);
            for(var idx =0;idx < seatData.pengs.length;++idx){
                if(seatData.pengs[idx][1] == pai){
                    cc.log3.debug("delet pengs idx=" + idx);
                    seatData.pengs.splice(idx,1);
                    break;
                }
            }
        }

        if(seatData.holds){
            if(gangtype == ACTION_ANGANE || gangtype == ACTION_ANGAME_SFYG || gangtype == ACTION_DIANGANE || gangtype == ACTION_WANGGANE){
                for(var i = 1; i <= gangActPais.length; ++i){
                    var idx = seatData.holds.indexOf(gangActPais[i]);
                    if(idx == -1){
                       continue;
                    }
                    seatData.holds.splice(idx,1);
                }
            }

            if(gangtype == ACTION_DIANGANE_SFYG){
                for(var i = 1; i <= gangActPais.length; ++i){

                    if(gangActPais[i] == pai)
                    {
                        continue;
                    }

                    var idx = seatData.holds.indexOf(gangActPais[i]);
                    if(idx == -1)
                    {   
                        continue;
                    }
                    seatData.holds.splice(idx,1);
                }
            }
        }

        if(ACTION_ANGANE == gangtype || gangtype == ACTION_ANGAME_SFYG )
        {
            seatData.angangs.push(gangActPais);
        }
        else if(ACTION_DIANGANE == gangtype || gangtype ==ACTION_DIANGANE_SFYG)
        {
            seatData.diangangs.push(gangActPais);
        }
        else if(ACTION_WANGGANE_SFYG == gangtype || ACTION_WANGGANE == gangtype)
        {
            seatData.wangangs.push(gangActPais);
        }
        
        this.dispatchEvent('gang_notify',{seatData:seatData,gangtype:gangtype});
    },

    doHu:function(data){
        this.dispatchEvent('hupai',data);
    },
    
    doTurnChange:function(si){
        var data = {
            last:this.turn,
            turn:si,
        }
        this.turn = si;
        this.dispatchEvent('game_chupai',data);
    },
    
    connectGameServer:function(data){
        this.dissoveData = null;
        cc.vv.net.ip = data.ip + ":" + data.port;
        cc.log3.debug(cc.vv.net.ip);
        var self = this;

        var onConnectOK = function(){
            cc.log3.debug("onConnectOK");
            var sd = {
                token:data.token,
                roomid:data.roomid,
                time:data.time,
                sign:data.sign,
            };
            cc.vv.net.send("login",sd);
        };
        
        var onConnectFailed = function(){
            cc.log3.debug("failed.");
            cc.vv.wc.hide();
        };
        cc.vv.wc.show("正在进入房间");
        cc.vv.net.connect(onConnectOK,onConnectFailed);
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
