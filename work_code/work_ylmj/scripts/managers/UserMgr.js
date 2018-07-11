var Buffer = require('buffer').Buffer;
cc.Class({
    extends: cc.Component,
    properties: {
        account:null,
	    userId:null,
		userName:null,
		lv:0,
		exp:0,
		coins:0,
		gems:0,
		sign:0,
        ip:"",
        sex:0,
        pid:0,
        pid_code:'',
        dealer_code:'',
        dealer_status:0,
        dealer_share:'',
        status:1,
        share:0,
        th_1:0,
        pay_type_list:[],
        shop_open:[],
        shop_closed_info:[],
        app_store_view:1,
        roomData:null,
        oldRoomId:null,
        mobile:null,
        //绑码 未绑码
        isBandding:false,
    },
    
    guestAuth:function(){
        var account = cc.args["account"];
        if(account == null){
            account = cc.sys.localStorage.getItem("account");
        }
        
        if(account == null){
            account = Date.now();
            cc.sys.localStorage.setItem("account",account);
        }
        
        cc.vv.http.sendRequest("/guest",{account:account},this.onAuth);
    },

    gotoHall:function(){
        cc.vv.wc.show("正在进入大厅中");
        cc.director.loadScene("hall",function(){
            cc.vv.hall.autoFunction();
            cc.vv.wc.hide();
        });
    },

    gotoClub:function(){
        cc.vv.wc.show("正在进入亲友群中");
        cc.director.loadScene("club",function(){
            cc.vv.clubMgr.refreshClubListData();
            cc.vv.wc.hide();
        });
    },
    
    onAuth:function(ret){
        var self = cc.vv.userMgr;
        if(ret.errcode !== 0){
            cc.log3.debug(ret.errmsg);
        }
        else{
            self.account = ret.account;
            self.sign = ret.sign;
            cc.vv.http.url = "http://" + cc.vv.SI.hall;
            self.login();
        }   
    },
    
    login:function(){
        var self = this;
        var onLogin = function(ret){

            if(ret.errcode !== 0){
                cc.log3.debug(ret.errmsg);
            }
            else{
                if(!ret.userid){
                    //jump to register user info.
                    //cc.director.loadScene("login");
                    cc.director.loadScene("createrole");
                }
                else{
                    // cc.log3.debug('---------------------------------登录返回');
                    //cc.log3.debug(ret);
                    self.account = ret.account;
        			self.userId = ret.userid;
        			self.userName = ret.name;
        			self.lv = ret.lv;
        			self.exp = ret.exp;
        			self.coins = ret.coins;
        			self.gems = ret.gems;
                    self.roomData = ret.roomid;
                    self.sex = ret.sex;
                    self.ip = ret.ip;
                    self.share = ret.share;
                    self.pid = ret.pid;
                    self.pid_code = ret.pid_code;
                    self.dealer_code = (ret.dealer_code != '')?ret.dealer_code:'undefined';
                    self.dealer_status = ret.dealer_status;
                    self.dealer_share = ret.dealer_share;
                    self.status = ret.status;
                    self.th_1=ret.th_1;
                    self.pay_type_list = ret.pay_type_list;
                    self.shop_open = ret.shop_open;
                    self.shop_closed_info = ret.shop_closed_info;
                    self.app_store_review = ret.app_store_review;
                    self.mobile = (ret.mobile != null)?ret.mobile:'';
                    //绑码 未绑码 赋值代码
                    if (ret.pid_code == "" || ret.pid_code == null) {
                        self.isBandding = false;
                    }else{
                        self.isBandding = true;
                    }
        			cc.vv.userMgr.gotoHall();
                }
            }
        };

        var xhr = null;
        var complete = false;
        var fnRequest = function(){
            cc.vv.wc.show("正在登录游戏");

            var loginData = {
                account:self.account,
                version:cc.VERSION,
                sign:self.sign
            };

            //包支持新版本定位
            //获取包括位置信息在内的客户端信息
            if(cc.sys.location == 1){
                loginData['client'] = cc.vv.g3Plugin.getClientParms();
            }

            xhr = cc.vv.http.sendRequest("/login",loginData,function(ret){
                xhr = null;
                complete = true;
                onLogin(ret);
            });
            setTimeout(fn,5000);            
        }
        
        var fn = function(){
            if(!complete){
                if(xhr){
                    xhr.abort();
                    cc.vv.wc.show("连接失败，即将重试");
                    setTimeout(function(){
                        fnRequest();
                    },3000);
                }
                else{
                    fnRequest();
                }
            }
        };
        fn();
    },
    
    create:function(name){
        var self = this;
        var onCreate = function(ret){
            if(ret.errcode !== 0){
                cc.log3.debug(ret.errmsg);
            }
            else{
                self.login();
            }
        };
        
        var data = {
            account:this.account,
            sign:this.sign,
            name:name
        };
        cc.vv.http.sendRequest("/create_user",data,onCreate);    
    },
    
    enterRoom:function(roomId,callback){
        var self = this;
        var onEnter = function(ret){
            // ret.errcode = 999;
            if(ret.errcode == 999){
                cc.vv.wc.hide();
                cc.vv.alert.show("版本过旧","您的游戏版本过旧，请退出游戏更新至最新版本后继续！",function(){
                    // cc.director.loadScene("update");
                    cc.game.restart();
                },false);
                return;
            }

            if(ret.errcode !== 0){
                if(ret.errcode == -1){
                    setTimeout(function(){
                        self.enterRoom(roomId,callback);
                    },5000);
                }
                else{
                    cc.vv.wc.hide();
                    if(callback != null){
                        callback(ret);
                    }
                }
            }
            else{
                if(callback != null){
                    callback(ret);
                }
                cc.vv.gameNetMgr.connectGameServer(ret);
            }
        };
        
        var data = {
            account:cc.vv.userMgr.account,
            version:cc.PROTOCOL_VERSION,
            sign:cc.vv.userMgr.sign,
            location:cc.vv.g3Plugin.getLocation(),
            roomid:roomId,
            locationDes:cc.vv.g3Plugin.getLocationDes()
        };


        var xhr = null;
        var complete = false;
        var fnRequest = function(){
            cc.vv.wc.show("正在进入房间 " + roomId);
            xhr = cc.vv.http.sendRequest("/enter_private_room",data,function(ret){
                xhr = null;
                complete = true;
                onEnter(ret);
            });
            setTimeout(fn,10000);            
        }
        
        var fn = function(){
            if(!complete){
                if(xhr){
                    xhr.abort();
                    cc.vv.wc.show("进入房间失败，即将重试");
                    setTimeout(function(){
                        fnRequest();
                    },3000);
                }
                else{
                    fnRequest();
                }
            }
        };
        fn();
    },
    getHistoryList:function(callback){
        var self = this;
        var onGet = function(ret){
            if(ret.errcode !== 0){
                cc.log3.debug(ret.errmsg);
            }
            else{
                cc.log3.debug(ret.history);
                if(callback != null){
                    callback(ret.history);
                }
            }
        };
        
        var data = {
            account:cc.vv.userMgr.account,
            sign:cc.vv.userMgr.sign,
        };
        cc.vv.http.sendRequest("/get_history_list",data,onGet);
    },

    
    getLottery:function(no,type,callback){
        var self = this;

        var onGet = function(ret){            
            callback(ret);
        };

        var data = {
            userid:cc.vv.userMgr.userId,
            no:no,
            type:type,
            account:cc.vv.userMgr.account,
            sign:cc.vv.userMgr.sign,
        }
        cc.vv.http.sendRequest("/lottery",data,onGet);
    },

    getLotteryHistory:function(callback){
        var self = this;
        var onGet = function(ret){
            if(ret.errcode !== 0){
                cc.log3.debug(ret.errmsg);
            }
            else{
                if(callback != null)
                {
                    callback(ret.history_list);
                }
            }
        };

        var data = {
            userid:cc.vv.userMgr.userId,
            account:cc.vv.userMgr.account,
            sign:cc.vv.userMgr.sign,
        };
        cc.vv.http.sendRequest("/lottery_history_list",data,onGet.bind(this));
    },
    

    getLotteryNotic:function(callback){
        var self = this;
        var onGet = function(ret){
            if(ret.errcode !== 0){
                cc.log3.debug(ret.errmsg);
            }
            else{
                if(callback != null){
                    callback(ret.notic);
                }
            }
        };

        var data = { 
            account:cc.vv.userMgr.account,
            sign:cc.vv.userMgr.sign,
        };
        cc.vv.http.sendRequest("/lottery_notic",data,onGet.bind(this));
    },

    getRankList:function(banktype,rank_flag,callback){
        var self = this;
        var onGet = function(ret){
            if(ret.errcode !== 0){
                cc.log3.debug(ret.errmsg);
            }
            else{
                if(callback != null){                    
                    var rank_type = ret.type;
                    var rank_flag  = ret.flag;
                    var rank_tip  =  ret.info;
                    var rankList =  ret.list;

                    var MyRankInfo = {
                        rank:ret.rank,
                        value:ret.value,
                    };

                    callback(rank_type,rank_flag,rank_tip,MyRankInfo,rankList);
                }
            }
        };

        var data = {
            userid:cc.vv.userMgr.userId,
            account:cc.vv.userMgr.account,
            sign:cc.vv.userMgr.sign,
            type:banktype,
            flag:rank_flag,
        };

        cc.vv.http.sendRequest("/rank_week",data,onGet.bind(this));
    },

    //获得新排行榜资料 中间那个排行榜 rank_flag 没用 适配老逻辑
    getNewRankList:function(type, rank_flag, callback) {
        var onGet = function(ret) {
             if(ret.errcode !== 0){
                cc.log3.debug(ret.errmsg);
            }
            else{
                if(callback != null){  
                    var rank_tip = "每周日晚24点结算排名";
                    var data = ret.msg;
                    callback(1, rank_flag, rank_tip, null, data);
                }
            }
        }
        var data = {
            rankType:type,//1是日排名前三十，2是周排名前三十
        };
        cc.vv.http.sendRequest("/get_user_rankList",data,onGet.bind(this));
    },

    refreshRankList:function(param){
        var self = this;
        var paihangbang = this.node.getChildByName("paihangbang");
        var paiHangScrollView = paihangbang.getChildByName("paiHangScrollView");
        var view = paiHangScrollView.getChildByName("view");
        var content = view.getChildByName("content");
        for(var i = 1; i <=30; i++ ) 
        {
            var item = content.getChildByName("item_"+i);
            item.active = false;
        }
        var onGet = function(ret){
            if(ret.errcode !== 0){
                console.log(ret.errmsg);
            }
            else{
                var list = ret.msg;
                if(list.length > 0){
                    for(var j = 1; j <=list.length; j++ ) 
                    {
                        var item = content.getChildByName("item_"+j);
                        var user_name = new Buffer(list[j-1].role_name,'base64').toString();
                        item.getChildByName("headimg").getChildByName("iconSprite").getChildByName("head").getComponent("ImageLoader").setUserID(list[j-1].role_id);
                        item.getChildByName("headimg").getChildByName("lblName").getComponent(cc.Label).string = user_name;
                        item.getChildByName("score").getComponent(cc.Label).string = "当前胜场："+list[j-1].wins;
                        item.active = true;
                    }
                }else
                {
                    return;
                }
            }
        };
        
        var data = {
            rankType:param,//1是日排名前三十，2是周排名前三十
        };
        cc.vv.http.sendRequest("/get_user_rankList",data,onGet.bind(this));
    },

    ShopPayOder:function(type,paytype,callback)
    {
        var onGet = function (ret) {
            
            if (ret.errcode !== 0) {
                cc.vv.alert.show("购买提示",ret.errmsg);
            }
            else {
                if (ret.url) {
                    callback(null, ret.url);
                }else{
                    cc.log("error data at userMgr ShopPayOder");
                }
            }
        };

        var data = {
            account:cc.vv.userMgr.account,
            sign:cc.vv.userMgr.sign,
            shopid:type,
            paytype:paytype,
        };

        cc.vv.http.sendRequest("/pay_order", data, onGet.bind(this));
    },

    getGamesOfRoom:function(uuid,callback){
        var self = this;
        var onGet = function(ret){
            if(ret.errcode !== 0){
                cc.log3.debug(ret.errmsg);
            }
            else{
                cc.log3.debug(ret.data);
                callback(ret.data);
            }
        };
        
        var data = {
            account:cc.vv.userMgr.account,
            sign:cc.vv.userMgr.sign,
            uuid:uuid,
        };
        cc.vv.http.sendRequest("/get_games_of_room",data,onGet);
    },
    
    getDetailOfGame:function(id,userid,callback){
        var self = this;
        var onGet = function(ret){
            if(ret.errcode !== 0){
                cc.log3.debug(ret.errmsg);
            }
            else{
                cc.log3.debug(ret.data);
                callback(ret.data);
            }       
        };
        
        var data = {
            account:cc.vv.userMgr.account,
            sign:cc.vv.userMgr.sign,
            userid:userid,
            id:id
        };
        cc.vv.http.sendRequest("/get_detail_of_game",data,onGet);
    }
});
