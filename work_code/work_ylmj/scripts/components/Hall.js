var Net = require("Net")
var Global = require("Global")
cc.Class({
    extends: cc.Component,

    properties: {
        lblName:cc.Label,
        lblVersion:cc.Label,
        lblCoins:cc.Label,
        lblGems:cc.Label,
        lblID:cc.Label,
        lblNotice:cc.Label,
        lblannounce_msg:cc.Label,
        joinGameWin:cc.Node,
        createRoomWin:cc.Node,
        settingsWin:cc.Node,
        helpWin:cc.Node,
        realName:cc.Node,
        cooperationNode:cc.Node,
        huodongWin:cc.Node,
        xiaoxiWin:cc.Node,
        bindWin:cc.Node,
        payWin:cc.Node,
        sharedWin:cc.Node,
        announceWin:cc.Node,
        btnJoinGame:cc.Node,
        btnReturnGame:cc.Node,
        sprHeadImg:cc.Sprite,
        webView:cc.WebView,
        coinWin:cc.Node,
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
    
    initNetHandlers:function(){
        var self = this;
    },
    

    // use this for initialization
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
        this.initLabels();
        
        if(cc.vv.gameNetMgr.roomId == null){            
            this.btnJoinGame.active = true;
            this.btnReturnGame.active = false;
            //闪烁效果
            //var action = cc.blink(2, 10);
            //this.btnJoinGame.runAction(action);
        }
        else{
            this.btnJoinGame.active = false;
            this.btnReturnGame.active = true;
        }

        //var params = cc.vv.args;
        var roomId = cc.vv.userMgr.oldRoomId 
        if( roomId != null){
            cc.vv.ip_check = false;
            cc.vv.userMgr.oldRoomId = null;
            cc.vv.userMgr.enterRoom(roomId);
        }
        
        var imgLoader = this.sprHeadImg.node.getComponent("ImageLoader");
        imgLoader.setUserID(cc.vv.userMgr.userId);

        imgLoader = cc.find("Canvas/settings/playinfo/userhead").getComponent("ImageLoader");
        imgLoader.setUserID(cc.vv.userMgr.userId);

        // imgLoader = cc.find("Canvas/tuiguang/userhead").getComponent("ImageLoader");
        // imgLoader.setUserID(cc.vv.userMgr.userId);

        cc.vv.utils.addClickEvent(this.sprHeadImg.node,this.node,"Hall","onBtnClicked");

        this.btnClub = cc.find("Canvas/btn_JoinClub");
        cc.vv.utils.addClickEvent(this.btnClub, this.node, "Hall", "onBtnClubClicked");
        this.ClubPage = cc.find("Canvas/ClubPage");
        
        this.addComponent("UserInfoShow");
        
        this.initButtonHandler("Canvas/bottom_left/btn_shezhi");
        this.initButtonHandler("Canvas/bottom_left/btn_help");
        this.initButtonHandler("Canvas/bottom_left/btn_xiaoxi");
        this.initButtonHandler("Canvas/bottom_left/btn_huodong");
        this.initButtonHandler("Canvas/bottom_left/btn_tuiguang");
        this.initButtonHandler("Canvas/bottom_left/btn_bind");
        this.initButtonHandler("Canvas/bottom_left/btn_share");

        var btnGetMoreFriend = cc.find("Canvas/active/list/8/inviteBtn");
        btnGetMoreFriend.on('click', this.onBtnGetMoreFriend, this);

        this.txt_manNum = cc.find("Canvas/active/list/8/conterBox/inputSpr1/num1");
        this.txt_gemsNum = cc.find("Canvas/active/list/8/conterBox/inputSpr2/num2");

        this.helpWin.addComponent("OnBack");
        this.xiaoxiWin.addComponent("OnBack");
        this.bindWin.addComponent("OnBack");
        this.payWin.addComponent("OnBack");
        this.sharedWin.addComponent("OnBack");
        this.announceWin.addComponent("OnBack");
        this.huodongWin.addComponent("OnBack");
        // this.dailiWin.addComponent("OnBack");
        this.coinWin.addComponent("OnBack");
        this.realName.addComponent("OnBack");
        this.cooperationNode.addComponent("OnBack");
        
        cc.log3.debug("55555");
        if(!cc.vv.userMgr.notice){
            cc.vv.userMgr.notice = {
                version:null,
                msg:"数据请求中...",
            }
        }
        
        if(!cc.vv.userMgr.gemstip){
            cc.vv.userMgr.gemstip = {
                version:null,
                msg:"数据请求中...",
            }
        }

        this.initEventListens();
        cc.vv.httpMgr.setMgrEventNode(this.node);
        
        this.lblNotice.string = cc.vv.userMgr.notice.msg; 
        cc.vv.hall = this;

        this.scheduleFunCall = function() {
            cc.vv.httpMgr.getOtherUrlVersion();
        }

        //版本比较
        this.schedule(this.scheduleFunCall.bind(this),300);
    },

    //设置对model层消息的监听
    initEventListens:function() {
        this.node.on('get_game_fkgm_info', this.refreshGemsTipGai, this);
        this.node.on('get_game_mail_info', this.refreshMailGai, this);
        this.node.on('get_game_notice_info', this.refreshNoticeGai, this);

        cc.vv.clubMgr.rootNode = this.node;
        this.node.on('change_club_success', this.hallEnterClub, this);
    },

    autoFunction:function(){
        this.refreshInfo();
        this.refreshNotice();
        this.refreshMail();
        this.refreshGemsTip();
        this.hideShop();
        this.androidListener();
        this.autoBind();
        this.autoJoinRoom();
        //this.activeLoader();
        // this.getLotteryInfo();
        this.popActive();
    },

    popActive:function(){
        
        //后续从游戏中返回大厅不弹
        if(cc.vv.pop_active != 1)return;
        
        var now = new Date();
        var day = now.getFullYear() + '/' + now.getMonth() + '/' + now.getDate();

        if(cc.sys.localStorage.getItem("pop_active") != day){
            cc.vv.pop_active = 0;
            cc.sys.localStorage.setItem("pop_active",day);    

            cc.find('Canvas/active').active = true;
            this.getBindInfo();
        }

        //如果没有在大厅弹过提示
        if(cc.sys.location == 1 && cc.sys.localStorage.getItem("location_show") != 1){
            cc.vv.alert.show("获取位置","同意获取定位可以让您查看他人位置信息，有效防止游戏作弊！",function(){
                cc.vv.g3Plugin.init();
                cc.sys.localStorage.setItem("location_show",1);
            },false);
        }
    },

    //在线客服
    customerService:function(){

        var md5 = require('../MD5');
        var sign = cc.md5(cc.vv.userMgr.account + cc.vv.userMgr.ip).toLowerCase();
        var url = "";
        if(cc.sys.os == cc.sys.OS_ANDROID){
            url = "https://vs.rainbowred.com/visitor/mobile/chat.html?companyId=93&echatTag=androidWuTongMaJiang";
        }

        if(cc.sys.os == cc.sys.OS_IOS){
            url = "https://vs.rainbowred.com/visitor/mobile/chat.html?companyId=93&echatTag=iosWuTongMaJiang"
        }
        
        // cc.vv.tip.show("客服链接暂未给到");
        if (url != "") {
            cc.sys.openURL(url);
        }else{
            cc.vv.tip.show("你的设备不是手机,不支持客服系统!");
        }
    },

    onBtnGetMoreFriend:function(params) {
        cc.vv.shareCtrl.hallGetMoreFriend();
    },

    //实名认证
    onButtonRealNameClick:function(){  
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        this.realName.active = true;
    },
    //实名认证同意
    onButtonRealNameEndClick:function(){
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        if (cc.find("Canvas/realName/centre/name/nameInput").getComponent(cc.EditBox).string === ""){
            //name不能为空
            cc.log("名字不能为空---------------");
            cc.vv.tip.show("名字不能为空！");
        }else if (cc.find("Canvas/realName/centre/id/idInput").getComponent(cc.EditBox).string === ""){
            //id不能为空
            cc.vv.tip.show("身份证号不能为空！");
            cc.log("身份证号不能为空-----------------------");
        }else {
            this.realName.active = false;
            cc.vv.tip.show("认证成功！");
            cc.log("实名认证成功--------------");
        }
    },
    //商务合作
    onButtonCooperationClick:function(){
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        this.cooperationNode.active = true;
    },

    androidListener:function(){
        
        //只做安卓的检测
        if(cc.sys.os != cc.sys.OS_ANDROID){
            return;
        }

        var keyboardListener = cc.EventListener.create({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed:  function(keyCode, event){

                if(keyCode == cc.KEY.back){

                    if(cc.vv.gameNetMgr.roomId != null){
                        cc.vv.alert.show("退出游戏","您正在游戏中，请不要退出游戏");
                        return;
                    }

                    cc.vv.alert.show("退出游戏","才玩一会会儿的，再打几局吧~~",function(){
                        cc.director.end();  
                    },true);
                }
            }
        });

        cc.eventManager.addListener(keyboardListener, this.node);
    },

    dailiRequest:function(){
        this.node.getChildByName("tuiguang").getChildByName("Layout_info").active = false;
        this.node.getChildByName("tuiguang").getChildByName("Layout_sqinput").active = true;
    },

    activeLoader:function(){

        var self = this;
        var onGet = function(ret){
            
            var imageLoader = cc.find("Canvas/active/list/1/active_1").getComponent("NetImageLoader");
            imageLoader.setUrl(ret.active_1);

            imageLoader = cc.find("Canvas/active/list/2/active_2").getComponent("NetImageLoader");
            imageLoader.setUrl(ret.active_2);

            imageLoader = cc.find("Canvas/active/list/3/active_3").getComponent("NetImageLoader");
            imageLoader.setUrl(ret.active_3);

            imageLoader = cc.find("Canvas/hall_ad").getComponent("NetImageLoader");
            imageLoader.setUrl(ret.active_0);

            var lable = cc.find("Canvas/active/toggles/1/title").getComponent(cc.Label);
            lable.string = ret.name_1;

            lable = cc.find("Canvas/active/toggles/2/title").getComponent(cc.Label);
            lable.string = ret.name_2;

            lable = cc.find("Canvas/active/toggles/3/title").getComponent(cc.Label);
            lable.string = ret.name_3;
        };
        
        var data = {
            code:'wtqp'
        };
        cc.vv.http.sendRequest("/package1001/active",data,onGet.bind(this),'http://service.futuregame.cc');
    },

    getLotteryInfo:function(){
        var self = this;

        var onGet = function(ret){   
            if(ret.errcode !== 0){
                cc.log3.debug(ret.errmsg);
            }
            else{
                cc.vv.WheelCtrl.no = ret.no;
            }
        };

        var data = {
            account:cc.vv.userMgr.account,
            sign:cc.vv.userMgr.sign,
        }

        cc.vv.http.sendRequest("/lottery_info",data,onGet);
    },

    hideShop:function(){

        //隐藏商城
        // if((cc.sys.os == cc.sys.OS_ANDROID && cc.vv.userMgr.shop_open[0] != 1)
        //     || (cc.sys.os == cc.sys.OS_IOS && cc.vv.userMgr.shop_open[1] != 1)){

        //     this.node.getChildByName("top_left").getChildByName("btn_add_gems").active = false;
        //     this.node.getChildByName("bottom_left").getChildByName("btn_shop").active = false;
        //     this.node.getChildByName("bottom_left").getChildByName("shop_title").active = false;            
        // }

        //如果配置成为APP STORE专用版本
        if(cc.sys.os == cc.sys.OS_IOS && cc.sys.app_store_review == 1 && cc.vv.userMgr.app_store_review == 1){
            // this.node.getChildByName("bottom_left").getChildByName("btn_shop").active = false;
            // this.node.getChildByName("bottom_left").getChildByName("shop_title").active = false;  
            this.node.getChildByName("bottom_left").getChildByName("btn_bind").active = false;
            this.node.getChildByName("bottom_left").getChildByName("bind_title").active = false;  
        }
    },
    
    refreshInfo:function(){
        var self = this;
        var onGet = function(ret){
            if(ret.errcode != 0){
                cc.log3.debug(ret.errmsg);
            }
            else{
                if(ret.gems != null){
                    this.lblGems.string = ret.gems;    
                    this.lblCoins.string = ret.coins;
                    // this.lblCoins2.string = ret.coins;
                }
            }
        };
        
        var data = {
            account:cc.vv.userMgr.account,
            sign:cc.vv.userMgr.sign,
        };
        cc.vv.http.sendRequest("/get_user_status",data,onGet.bind(this));
    },

    //made by hanjun 框架引起的问题 暂时修正  加入框架的事件机制后调整 函数名后面带Gai的暂时都是这个问题
    refreshGemsTipGai:function(event) {
        var data = event.detail
        this.lblannounce_msg.string = data.msg;
    },


    refreshGemsTip:function(){
        cc.vv.httpMgr.getGameMessageFkgmInfo();
    },

    onActiviItemClick:function(event,data){

        var toggles = cc.find("Canvas/active/scrollview/view/content");
        var list = cc.find("Canvas/active/list")

        for(var i = 0; i < toggles.children.length; ++i){
            var button = toggles.children[i].getComponent("RadioButton");
            button.checked = (toggles.children[i].name == data);
        }

        for(var i = 0; i < list.children.length; ++i){
            list.children[i].active = (list.children[i].name == data);
        }

        if (data == 8) {
            this.getBindInfo();
        }
    },

    getBindInfo:function(params) {
         
        var self = this;
        var onGet = function(ret){
            self.txt_manNum.getComponent(cc.Label).string = (typeof(ret.true_invite) == "number") ? ret.true_invite : 0;
            self.txt_gemsNum.getComponent(cc.Label).string = (typeof(ret.gems) == "number") ? ret.gems : 0;
        };
        
        var data = {
            userId:cc.vv.userMgr.userId,
        };
        cc.vv.http.sendRequest("/api/user/invitegems",data,onGet.bind(this), "http://wtmjhot.legaogame.com");
    },
    
    refreshNoticeGai:function(event){
        var data = event.detail
        this.lblNotice.string = data.msg;
    },

    refreshNotice:function(){
        cc.vv.httpMgr.getGameMessageNoticeInfo();
    },
    
    refreshMailGai:function(event) {
        var data = event.detail
        this.xiaoxiWin.getChildByName("info").getComponent(cc.Label).string = data.msg;
    },

    refreshMail:function(){
        cc.vv.httpMgr.getGameMessageMailInfo();
    },

    autoBind:function(){
        if(cc.vv.userMgr.pid == 0 && cc.vv.userMgr.dealer_share != ''){
            this.bindCode(cc.vv.userMgr.dealer_share);
        }
    },

    autoJoinRoom:function(){
        
        var self = this;
        var fn = function(){
            
            if(cc.vv && cc.vv.userMgr.roomData){
                cc.vv.userMgr.enterRoom(cc.vv.userMgr.roomData);
                cc.vv.userMgr.roomData = null;
                return;
            }
            
            if(cc.director.getScene().name != 'hall'){
                setTimeout(fn,3000);
                return;
            }
            
            //从分享链获取
            var roomid = cc.vv.g3Plugin.getRoomId();
            console.log("autoJoinRoom : roomid" + roomid);
            
            if(roomid == '' || roomid == null){
                setTimeout(fn,3000);
                return;
            }

            var reg = new RegExp(/^\d{6}$/);
            if(reg.test(roomid)){
                cc.vv.alert.show('进入房间','您正准备进入' + roomid +'房间，请确认是否继续进入？',function(){
                    cc.vv.ip_check = false;
                    var join = self.joinGameWin.getComponent('JoinGameInput');
                    join.onInputFinished(roomid);
                },true);
            }else{
                cc.vv.alert.show('进入房间','你的手机无法获取到房间号，请尝试在分享页间中点击复制房间号进入');
                setTimeout(fn,3000);
            }
        }

        fn();
            
    },
   
    bindCode:function(dealer_id)
    {
        var onGet = function (ret) {
            if(ret.errcode != 0)
            {
                cc.vv.alert.show("提示",ret.errmsg);
            }
            else
            {
                cc.vv.alert.show("提示",ret.errmsg);
                this.bindWin.active = false;
                cc.vv.userMgr.pid = 1;
                cc.vv.userMgr.pid_code = dealer_id;
                cc.vv.userMgr.isBandding = true;
                this.refreshInfo();
            }
        };

        var data = {
            account:cc.vv.userMgr.account,
            sign:cc.vv.userMgr.sign,
            dealer_id:dealer_id
        };

        cc.vv.http.sendRequest("/bind", data, onGet.bind(this));
    },

    initButtonHandler:function(btnPath){
        var btn = cc.find(btnPath);
        
        cc.log3.debug(btnPath + " = " + btn);
        cc.vv.utils.addClickEvent(btn,this.node,"Hall","onBtnClicked");        
    },
    
    shopPay:function(pay_type){
        
        //正常状态
        cc.vv.userMgr.ShopPayOder(cc.vv.shop_index,pay_type,function(type,data){
            
            cc.vv.alert.show("购买提示","如果您支付成功，钻石将在1分钟内发送到您的余额~~");

            cc.sys.openURL(data);   
        });
    },

    onBtnPayClicked:function(event,data){
        
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        data = event.target.pay_data;

        this.payWin.active = false;
        this.shopPay(data);
    },
    
    
    initLabels:function(){
        this.lblName.string = cc.vv.userMgr.userName;
        this.lblCoins.string = cc.vv.userMgr.coins;
        // this.lblCoins2.string = cc.vv.userMgr.coins;
        this.lblGems.string = cc.vv.userMgr.gems;
        this.lblVersion.string = cc.VERSION;
        this.lblID.string = "ID:" + cc.vv.userMgr.userId;
    },
    
    onBtnClicked:function(event){

        cc.vv.audioMgr.playSFX("ui_click.mp3");

        if(event.target.name == "btn_shezhi"){
            this.settingsWin.active = true;
        } 
        else if(event.target.name == 'btn_coins_help'){
            this.coinWin.active = true;
        }  
        else if(event.target.name == "btn_help"){
            this.helpWin.active = true;
        }
        else if(event.target.name == "btn_xiaoxi"){
            this.xiaoxiWin.active = true;
        }
        else if(event.target.name == "btn_bind")
        {
            this.bindWin.active = true;

            if(cc.vv.userMgr.isBandding){
                this.bindWin.getChildByName("codeInput").active = false;
                this.bindWin.getChildByName("bind_ok").active = false;
                this.bindWin.getChildByName("inputbg").active = false;

                this.bindWin.getChildByName("used_info").getComponent(cc.Label).string = "您已经使用了邀请码：" + cc.vv.userMgr.pid_code;
                this.bindWin.getChildByName("used_info").active = true;
            }

        }
        else if(event.target.name == "btn_huodong")
        {
            this.huodongWin.active = true;
            this.getBindInfo();
        }
        else if(event.target.name == "btn_tuiguang")
        {
            // this.dailiWin.active = true;
            cc.vv.dealer.showStatus();
        }
        else if(event.target.name == "btn_share")
        {
            cc.vv.hall.share_type = 0;
            this.sharedWin.active = true;
        }
        else if(event.target.name == "btn_active_share")
        {
            cc.vv.hall.share_type = 0;
            this.shareImg('1');
        }
        else if(event.target.name == "head"){
            cc.vv.userinfoShow.show(cc.vv.userMgr.userName,cc.vv.userMgr.userId,this.sprHeadImg,cc.vv.userMgr.sex,cc.vv.userMgr.ip);
        }else if(event.target.name == "btn_active_5"){
            cc.sys.openURL('http://down.178wsy.com/game/');
        }
    },

    onBtnClubClicked:function(params) {
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        cc.vv.clubMgr.enterClub(this.ClubPage);
        // this.ClubPage.active = !this.ClubPage.active;
    },

    hallEnterClub:function(params) {
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        cc.vv.clubMgr.enterClub(this.ClubPage);
    },

    shareImg:function(type){

        if(cc.vv.hall.share_type == 1){
            cc.vv.shareCtrl.hallShareImage(type, 1);
        }else{
            // cc.vv.share_url = 'http://game.futuregame.cc/download/'+cc.GAME_CODE;
            // var title = cc.GAME_NAME + '-开启好友棋牌时代';
            // var txt = '和你的好友开启新游戏棋牌时代，感受全新好友圈棋牌新乐趣！';
            if (cc.sys.isNative) {
                cc.vv.shareCtrl.hallShareImage(type);
            }
        }
    },

    onShareChicked:function(event){
        
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        
        var self = this;
        
        if(event.target.name == "btn_share2haoyou")
        {
            this.shareImg('1');
        }
        else
        {
            this.shareImg('2'); 
        }        
    },

    onBindChicked:function() {

        cc.vv.audioMgr.playSFX("ui_click.mp3");

        var bind = this.node.getChildByName("bind");
        
        var code  = bind.getChildByName("codeInput").getComponent(cc.EditBox).string;
        if(code)
        {
            this.bindCode(code);
        }else{
            cc.vv.alert.show("提示",'请输入邀请码');
        }
    },
    onJoinGameClicked:function(){
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        this.joinGameWin.active = true;
        this.autoJoinRoom();
    },

    onJoinPvpGame:function(){
        cc.vv.tip.show("敬请期待");
    },
    
    onReturnGameClicked:function(){
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        cc.vv.gameNetMgr.loadGameScene();
    },
    
    onBtnAddGemsClicked:function(){
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        var shopWin  =  this.node.getChildByName("shop");
        shopWin.active = true;
        this.refreshInfo();
    },
    
    onCreateRoomClicked:function(){
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        if(cc.vv.gameNetMgr.roomId != null){
            cc.vv.alert.show("提示","房间已经创建!\n必须解散当前房间才能创建新的房间");
            return;
        }
        cc.log3.debug("onCreateRoomClicked");
        this.createRoomWin.active = true;   
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        var x = this.lblNotice.node.x;
        x -= dt*100;
        if(x + this.lblNotice.node.width < -1000){
            x = 500;
        }
        this.lblNotice.node.x = x;
    },

    onDestroy:function(params) {
        this.unschedule(this.scheduleFunCall.bind(this));
    }
});
