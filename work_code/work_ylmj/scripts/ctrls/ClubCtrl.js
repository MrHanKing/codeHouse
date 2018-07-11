cc.Class({
    extends: cc.Component,

    properties: {
       item:{
           default:null,
           tooltip:"俱乐部预制体",
           type:cc.Prefab
       },
       tableItem:{
           default:null,
           tooltip:"俱乐部桌子",
           type:cc.Prefab
       },
       historyItem:{
        default:null,
        tooltip:"俱乐部历史消息",
        type:cc.Prefab
       },
       memberItem:{
        default:null,
        tooltip:"俱乐部玩家",
        type:cc.Prefab
       },
       applyItem:{
        default:null,
        tooltip:"俱乐部申请",
        type:cc.Prefab
       },
       iconMaster:{
        default:null,
        tooltip:"会长身份图",
        type:cc.SpriteFrame
       },
       iconAdmin:{
        default:null,
        tooltip:"管理员身份图",
        type:cc.SpriteFrame
       },
       iconMember:{
        default:null,
        tooltip:"普通成员身份图",
        type:cc.SpriteFrame
       },
    },

    // use this for initialization
    onLoad: function () {
        //玩家身份 2是创建者 1是管理员 0是普通成员  4是待审核成员 5是红名 6是黑名
        this.playerType = 0;

        //当前选中的俱乐部名字
        this.selectedClubName = null;

        this.clubLobby = this.node.getChildByName("ClubLobby");
        this.clubpage = this.node.getChildByName("ClubPage");
        this.CreateRoom = this.node.getChildByName("CreateRoom");
        this.CreateRoom_btnsave = this.CreateRoom.getChildByName("btn_save");
        this.CreateRoom_btnok = this.CreateRoom.getChildByName("btn_ok");

        this.userinfo = this.node.getChildByName("userinfo");
        this.btnClose = this.clubLobby.getChildByName("btn_back");
        this.node_club_waitinfo = this.clubLobby.getChildByName("club_waitinfo");


        this.changClubInfo = this.node.getChildByName("changClubInfo");
        this.changebox = this.changClubInfo.getChildByName("changebox");
        this.txt_des = this.changClubInfo.getChildByName("txt_des");
        this.btn_ok = this.changClubInfo.getChildByName("btn_ok");
        this.btn_close = this.changClubInfo.getChildByName("btn_close");
        this.changebox_title = this.changClubInfo.getChildByName("txt_title");

        this.clubManage = this.node.getChildByName("ClubManage");
        this.clubInfo = this.node.getChildByName("ClubInfo");
        //clubLobby
        var club_info = this.clubLobby.getChildByName("Club_info")
        this.club_name = club_info.getChildByName("Club_name");
        this.club_id = club_info.getChildByName("club_id");
        this.playerIdentitySprite = club_info.getChildByName("ClubRole");
        this.gongGao = club_info.getChildByName("text_gonggao");
        this.fanKaNum = club_info.getChildByName("num_roomcard");
        this.diamondNum = club_info.getChildByName("num_zs");

        this.btnMessage = club_info.getChildByName("btn_message");
        this.btnManage = club_info.getChildByName("btn_manage");
        this.redNode = this.btnManage.getChildByName("red");
        this.btnMessageClose = this.clubInfo.getChildByName("btn_back");
        this.btnManageClose = this.clubManage.getChildByName("btn_back");

        this.scrollViewClub = this.clubLobby.getChildByName("Club_list").getChildByName("ScrollView_Clubs").getComponent(cc.ScrollView);
        this.scrollViewTableList = this.clubLobby.getChildByName("Club_list").getChildByName("ScrollView_ClubTableList").getComponent(cc.ScrollView);

        //clubManage
        this.toggleClubManage = this.clubManage.getChildByName("Toggle_ClubManage");
        this.clubHistory = this.toggleClubManage.getChildByName("Club_histroy");
        this.clubMembers = this.toggleClubManage.getChildByName("Club_members");
        this.clubApplys = this.toggleClubManage.getChildByName("Club_applys");
        this.clubGameSet = this.toggleClubManage.getChildByName("Club_GameSet");
        this.manageRedNode = this.clubApplys.getChildByName("red");

        this.clubAdminSet = this.toggleClubManage.getChildByName("Club_adminSet")

        this.clubManageDetail = this.clubManage.getChildByName("ClubManageDetail");
        this.scrollViewHistory = this.clubManageDetail.getChildByName("Club_histroy").getChildByName("Histroy_ScrollView").getComponent(cc.ScrollView);
        this.scrollViewMembers = this.clubManageDetail.getChildByName("Club_members").getChildByName("Members_ScrollView").getComponent(cc.ScrollView);
        this.scrollViewApply = this.clubManageDetail.getChildByName("Club_apply").getChildByName("Apply_ScrollView").getComponent(cc.ScrollView);
        this.node_club_gameSet = this.clubManageDetail.getChildByName("Club_gameSet")
        this.clubGameSet_gameName = this.node_club_gameSet.getChildByName("Club_DefaultSet").getChildByName("text_GameName");
        this.clubGameSet_detail = this.node_club_gameSet.getChildByName("Club_DefaultSet").getChildByName("text_detail");

        this.node_club_adminSet = this.clubManageDetail.getChildByName("Club_adminSet")

        //clubInfo
        this.toggleClubMessage = this.clubInfo.getChildByName("Toggle_ClubMessage");
        this.clubHallInfo = this.toggleClubMessage.getChildByName("Club_Info");
        this.clubMessage = this.toggleClubMessage.getChildByName("Club_message");

        this.clubMessageDetail = this.clubInfo.getChildByName("ClubMessageDetail")
        this.btnChangeClubName = this.clubMessageDetail.getChildByName("Club_info").getChildByName("Club_details").getChildByName("btn_rename");
        this.btnAddClubManMax = this.clubMessageDetail.getChildByName("Club_info").getChildByName("Club_details").getChildByName("btn_addmembers");
        this.btnAddClubTable = this.clubMessageDetail.getChildByName("Club_info").getChildByName("Club_details").getChildByName("btn_addtables");
        this.btnXiugaigonggao = this.clubMessageDetail.getChildByName("Club_info").getChildByName("ClubMessage").getChildByName("btn_modify");

        this.btnaddzs = this.clubMessageDetail.getChildByName("Club_info").getChildByName("btn_addzs")
        this.btnLeave = this.clubMessageDetail.getChildByName("Club_info").getChildByName("btn_leave")
        this.btnDismiss = this.clubMessageDetail.getChildByName("Club_info").getChildByName("btn_dismiss")

        //倒计时
        this.btnClubClock = this.clubLobby.getChildByName("Club_list").getChildByName("ScrollView_ClubTableList").getChildByName("node_refresh").getChildByName("btn_refresh");
        this.txtClubClockTime = this.clubLobby.getChildByName("Club_list").getChildByName("ScrollView_ClubTableList").getChildByName("node_refresh").getChildByName("txt_time");

        this.node_gameinfo = this.node.getChildByName("gameinfo");
        this.btn_joingame = this.node_gameinfo.getChildByName("btn_joingame");

        this.registerBtnEvents();

        this.initEventListens();

        //处理网络层已处理完 但scene未加载的情况
        this.notLoad = true;
        // this.refreshHallroom();
        setTimeout(function(){
            if (this.notLoad) {
                this.refreshHallroom();
            }
        }.bind(this),500)

        var that = this;
        this.node.runAction(cc.repeatForever(cc.sequence(
            cc.callFunc(function(params) {
                that.refreshClubClock();
            }),
            cc.delayTime(0.5)
        )))

        //每秒请求次桌子
        this.clubLobby.runAction(cc.repeatForever(cc.sequence(
            cc.delayTime(2),
            cc.callFunc(function(params) {
                cc.log("this.clubLobby.runAction cc.vv.clubMgr.requestTableList")
                cc.vv.clubMgr.requestTableList();
            })
        )))
    },

    start:function(){   
    },

    refreshRedNode:function() {
        this.getSelectedClubName();
        cc.vv.clubMgr.requestClubApplyInfos();
    },

    //设置对model层消息的监听
    initEventListens:function() {
        cc.vv.clubMgr.rootNode = this.node;
        //俱乐部界面基本信息刷新
        // this.node.on('enter_club_info', this.refreshEnterClubInfo, this);
        this.node.on('club_message', this.refreshClubInfos, this);
        this.node.on('club_histroy_fights', this.refreshHistoryList, this);
        this.node.on('club_member_list', this.refreshMembers, this);
        this.node.on('club_apply_infos', this.refreshClubApplyInfos, this);
        // this.node.on('club_setting_infos', this.refreshSettingInfos, this);
        this.node.on('club_manager_list', this.refreshManagerList, this);
        //刷新大厅数据
        this.node.on('refresh_club_hallroom', this.refreshHallroom, this);

        this.node.on('change_club_success', this.refreshClubSuccess, this);
        //选中公会数据变化
        this.node.on('change_club_main_info', this.changeClubMainInfo, this);

        this.node.on('change_club_kick', this.clubUpdateMen, this);

        this.node.on('change_default_table_info', this.refreshSettingInfos, this);

        this.node.on('club_update_mem', this.clubUpdateMen, this);

        this.node.on('get_rooms_of_club', this.refreshScrollViewClubTables, this);
    },

    refreshClubApplyInfos:function() {
        var show = (cc.vv.clubMgr.apply_infos && cc.vv.clubMgr.apply_infos.length && cc.vv.clubMgr.apply_infos.length != 0);
        if (show == null) {
            show = false;
        }
        this.redNode.active = show;
        this.manageRedNode.active = show;
        if (this.clubLobby.active == true) {
            this.refreshApplyList();
        }else{

        }
        // if (this.clubManage.active == true) {
            
        // }
    },

    //初始化注册按钮事件
    registerBtnEvents:function() {

        this.btnClose.on('click', this.onBtnClose, this);

        this.btnMessage.on('click', this.onBtnMessageClick, this);
        this.btnManage.on('click', this.onBtnManageClick, this);
        this.btnMessageClose.on('click', this.onBtnMessageClose, this)
        this.btnManageClose.on('click', this.onBtnManageClose, this)

        this.clubHistory.on('toggle', this.onToggleHistory, this);
        this.clubMembers.on('toggle', this.onToggleMembers, this);
        this.clubApplys.on('toggle', this.onToggleApplys, this);
        this.clubGameSet.on('toggle', this.onToggleGameSet, this);
        this.clubAdminSet.on('toggle', this.onToggleAdminSet, this);

        this.clubHallInfo.on('toggle', this.onToggleHallInfo, this);
        this.clubMessage.on('toggle', this.onToggleMessage, this);

        this.btnLeave.on('click', this.onBtnLeaveClub, this)
        this.btnDismiss.on('click', this.onBtnDismissClub, this)
    },

    dateFormat:function(time, type){
        var date = new Date(time);
        var bigtime = "{0}/{1}/{2} {3}:{4}:{5}";
        var smalltime = "{0}:{1}:{2}";
        var resulttime = "";
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        month = month >= 10? month : ("0"+month);
        var day = date.getDate();
        day = day >= 10? day : ("0"+day);
        var h = date.getHours();
        h = h >= 10? h : ("0"+h);
        var m = date.getMinutes();
        m = m >= 10? m : ("0"+m);
        var s = date.getSeconds();
        s = s >= 10? s : ("0"+s);

        // if(type == 1){
            resulttime = bigtime.format(year,month,day,h,m,s);
        // }
        // if (type == 2) {
        //     resulttime = smalltime.format(h,m,s);
        // }
        return resulttime;
    },
    
    //刷新大厅数据
    refreshHallroom:function(){
        this.notLoad = false;
        this.createScrollViewClub();
        this.refreshClubInfoView();
        this.createScrollViewClubTables()
    },

    refreshClubSuccess:function(params) {
        cc.vv.clubMgr.refreshClubListData();
        //关闭俱乐部信息界面
        this.onBtnMessageClose();
    },

    changeClubMainInfo:function(){
        this.refreshEnterClubInfo();
        this.refreshClubInfoView();
        this.createScrollViewClub();
    },

    clubUpdateMen:function(params) {
        //成员列表界面
        if(this.clubManageDetail.getChildByName("Club_members").active == true){
            cc.vv.clubMgr.requestClubManInfos(Number(this.selectedClubName));
        }
        //申请列表界面
        if(this.clubManageDetail.getChildByName("Club_apply").active == true){
            cc.vv.clubMgr.requestClubApplyInfos(Number(this.selectedClubName));
        }
        //管理员列表界面
        if(this.clubManageDetail.getChildByName("Club_adminSet").active == true){
            cc.vv.clubMgr.requestClubManageList(Number(this.selectedClubName));
        }
        //历史列表界面
        if(this.clubManageDetail.getChildByName("Club_histroy").active == true){
            cc.vv.clubMgr.requestHistoryList(Number(this.selectedClubName));
        }
        //玩法设置界面
        if(this.clubManageDetail.getChildByName("Club_gameSet").active == true){
            this.refreshSettingInfos();
        }
    },

    getPlayerInfoByUseId:function(id){

    },

    getSpriteFrameByType:function(type){
        if (type == 0) {
            return this.iconMember;
        }else if(type == 1){
            return this.iconAdmin;
        }else if(type == 2){
            return this.iconMaster;
        }
    },

    //根据node的name取得对应俱乐部列表数据 废弃
    getDataByName:function(name){
        var data = null;
        for (var i = 0; i < cc.vv.clubMgr.club_list.length; i++) {
            if (cc.vv.clubMgr.club_list[i].club_name == name) {
                data = cc.vv.clubMgr.club_list[i];
                break;
            }
        }
        return data;
    },

    //获得选中的俱乐部
    getSelectedClubName:function() {
        var childNum = this.scrollViewClub.content.childrenCount;
        var childrens = this.scrollViewClub.content.children;
        for (var idx = 0; idx < childNum; idx++) {
            if(childrens[idx].getComponent(cc.Toggle).isChecked){
                this.selectedClubName = childrens[idx].name;
                cc.vv.clubMgr.selectedClubid = childrens[idx].name;
                this.playerType = this.getPlayerTypeByClubName(this.selectedClubName);
                return childrens[idx].name;
            }
        }
        return null;
    },

    getClubIdByClubName:function(club_name){
        
        return cc.vv.clubMgr.myClubs[club_name].id;
    },

    //
    getPlayerTypeByClubName:function(club_name){
        var id = this.getClubIdByClubName(club_name);
        return this.getPlayerTypeByClubId(id);
    },

    //获得俱乐部对应身份
    getPlayerTypeByClubId:function(id){
        for (let index = 0; index < cc.vv.clubMgr.club_list.length; index++) {
            if (cc.vv.clubMgr.club_list[index].club_id == id) {
                return cc.vv.clubMgr.club_list[index].type;
            }
        }
        cc.log("some one can be error in getPlayerTypeByClubId");
        return 0;
    },

    createScrollViewClubTables:function(params) {
        this.getSelectedClubName();
        cc.vv.clubMgr.requestTableList();
    },

    //创建俱乐部桌子列表
    refreshScrollViewClubTables:function() {
        var node = this.scrollViewTableList.content;
        node.removeAllChildren();
        var clubname = this.getSelectedClubName();
        cc.log("创建了俱乐部的桌子 clubname:" + clubname)
        var data = cc.vv.clubMgr.clubTables[clubname];
        // let mPrefab = cc.instantiate(this.tableItem)
        // if (mPrefab && data && data.base_info) {
        //     //设置对象属性
        //     this.initTable(mPrefab, data.base_info);//后续传入data
        //     node.addChild(mPrefab);
        // }
        this.node_club_waitinfo.active = !data;
        if (!data) {
            return;
        }

        for (let key in data){
            let mPrefab = cc.instantiate(this.tableItem)
            if (mPrefab && data[key] && data[key].base_info) {
                //设置对象属性
                this.initTable(mPrefab, data[key]);//后续传入data
                node.addChild(mPrefab);
            }
        }
    },

    //初始化俱乐部桌子
    initTable:function( tablePrefab , data ) {
        cc.log("创建了桌子:");
        var baseinfo_data = JSON.parse(data.base_info);
        tablePrefab.getChildByName("txt_playNum").getComponent(cc.Label).string = this.getGameRuleDes(baseinfo_data, "\n");
        // tablePrefab.getChildByName("ui_tableinfo").getChildByName("AA").getComponent(cc.Label).string = (baseinfo_data.fplay == 0? "AA" : "群");
        tablePrefab.getChildByName("ui_tableinfo").getChildByName("gamename").getComponent(cc.Label).string = this.getGameTypeDesByAttr(baseinfo_data.bbh);
        // tablePrefab.getChildByName("btn_closeTable").active = false;
        // (this.playerType == 1 || this.playerType == 2);
        var players = tablePrefab.getChildByName("players");
        var btnJoinGame = tablePrefab.getChildByName("btn_joinGame");

        var mannumber = 0;
        for (let idx = 0; idx < 4; idx++) {
            var num = idx + 1;
            var player = players.getChildByName("player" + num);
            var key = "user_id" + idx
            var id = data[key];//服务器暂时没给数据
            if (id == 0) {
                player.active = false;
                continue;
            }else{
                mannumber = mannumber + 1;
                player.active = true;
            }
            //设置头像 名字
            // var callback = function(info) {
            //     player.getChildByName("name").getComponent(cc.Label).string = info.name;
            // }
            player.getComponent("ImageLoader").setUserID(id, null);    
        }

        //增加桌子上的按钮点击事件
        // btnClose.name = data.id;
        btnJoinGame.name = data.id;
        btnJoinGame.base_info = baseinfo_data;
        // btnClose.on("click", this.onTableBtnClose, this)
        //坐满的话 不能进入桌子
        if (mannumber == 4) {
            tablePrefab.getChildByName("txt_gameStatus").getComponent(cc.Label).string = "游戏中";
        }else{
            tablePrefab.getChildByName("txt_gameStatus").getComponent(cc.Label).string = "等待中";
            btnJoinGame.on("click", this.onBtnTable, this);
        }
    },

    onBtnTable:function(event) {
        cc.log("onBtnTable");
        this.node_gameinfo.active = true;
        this.btn_joingame.name = event.target.name;
        var baseinfo_data = event.target.base_info;

        this.node_gameinfo.getChildByName("t_game").getComponent(cc.Label).string = this.getGameNameByType(baseinfo_data.type);
        this.node_gameinfo.getChildByName("t_jushu").getComponent(cc.Label).string = baseinfo_data.maxGames + "局";
        this.node_gameinfo.getChildByName("t_wanfa").getComponent(cc.Label).string = this.getGameTypeDesByAttr(baseinfo_data.bbh);
        this.node_gameinfo.getChildByName("t_fengding").getComponent(cc.Label).string = this.getGameMaxFanDes(baseinfo_data.maxFan);
        this.node_gameinfo.getChildByName("t_hengfan").getComponent(cc.Label).string = this.getGameHengFan(baseinfo_data.hengfan);
        this.node_gameinfo.getChildByName("t_pay").getComponent(cc.Label).string = this.getGameFuFeiDes(baseinfo_data.fplay);

        this.btn_joingame.getComponent(cc.Button).clickEvents = [];
        this.btn_joingame.on("click", this.onTableBtnJoinGame, this);
    },

    onBtnCloseGameInfo:function(params) {
        this.node_gameinfo.active = false;
    },

    //创建俱乐部列表
    createScrollViewClub:function() {
        var node = this.scrollViewClub.content;
        node.removeAllChildren();

        for (let key in cc.vv.clubMgr.myClubs){
            let mPrefab = cc.instantiate(this.item)
            if (mPrefab) {
                //设置对象属性
                mPrefab.name = cc.vv.clubMgr.myClubs[key].id.toString();
                this.initcrollViewClub(mPrefab, cc.vv.clubMgr.myClubs[key])

                //设置toggle监听
                mPrefab.on('toggle', this.onToggleClub ,this)
                node.addChild(mPrefab);
            }
        }
    },

    //初始化俱乐部列表信息
    initcrollViewClub:function(tablePrefab, data) {
        tablePrefab.getChildByName("Club_name").getComponent(cc.Label).string = data.name;
        tablePrefab.getChildByName("text_gonggao").getComponent(cc.Label).string = data.gonggao ? data.gonggao : "暂无公告";
    },

    //刷新大厅左上角信息
    refreshClubInfoView:function() {
        var clubname = this.getSelectedClubName();
        var data = cc.vv.clubMgr.myClubs[clubname];
        if(data){
            this.club_name.getComponent(cc.Label).string = data.name;
            this.club_id.getComponent(cc.Label).string = "群号:" + data.id;
            this.gongGao.getComponent(cc.Label).string = data.gonggao ? data.gonggao : "暂无公告";
            // this.fanKaNum.getComponent(cc.Label).string = data.club_roomcard;
            this.diamondNum.getComponent(cc.Label).string = this.getGemsShow(data.gems, clubname);
            this.playerIdentitySprite.getComponent(cc.Sprite).spriteFrame = this.getSpriteFrameByType(this.playerType);
        }
        this.btnManage.getComponent(cc.Button).interactable = (this.playerType == 1 || this.playerType == 2);
        if (this.playerType == 1 || this.playerType == 2) {
            this.refreshRedNode();
        }else{
            this.redNode.active = false;
        }
    },

    //打开信息界面
    onBtnMessageClick:function() {
        console.log("onBtnMessageClick");
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        this.clubManage.active = false;
        this.clubInfo.active = true;

        //会长和管理员
        this.btnChangeClubName.active = (this.playerType == 1 || this.playerType == 2);
        this.btnAddClubManMax.active = (this.playerType == 1 || this.playerType == 2);
        this.btnAddClubTable.active = (this.playerType == 1 || this.playerType == 2);
        this.btnXiugaigonggao.active = (this.playerType == 1 || this.playerType == 2);
        this.btnaddzs.active = (this.playerType == 2);
        this.btnLeave.active = (this.playerType != 2);
        this.btnDismiss.active = (this.playerType == 2);

        //刷新信息
        this.refreshHallInfo();
    },

    //打开管理界面
    onBtnManageClick:function() {
        console.log("onBtnManageClick");
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        this.clubManage.active = true;
        this.clubInfo.active = false;

        //会长显示按钮
        this.clubAdminSet.active = (this.playerType == 2)
        
        //获得选中的列表然后请求
        this.clubUpdateMen();
        // this.refreshHistory();
    },

    onBtnMessageClose:function() {
        console.log("onBtnMessageClose");
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        this.clubInfo.active = false;
    },

    onBtnManageClose:function() {
        console.log("onBtnManageClose");
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        this.clubManage.active = false;
    },

    //俱乐部选择
    onToggleClub:function( event ) {
        console.log("onToggleClub");
        var data = event.detail;
        if ( !data.isChecked ) {
            return;
        }

        //重置其他toggle
        var name = data.node.name;
        var childNum = this.scrollViewClub.content.childrenCount;
        var childrens = this.scrollViewClub.content.children;
        for (var idx = 0; idx < childNum; idx++) {
            if (childrens[idx].name != name) {
                childrens[idx].getComponent(cc.Toggle).uncheck();
            }
        }

        var mmdata = this.getDataByName(name);
        this.createScrollViewClubTables(mmdata);
        this.refreshClubInfoView(mmdata)
    },

    //桌子解散
    onTableBtnClose:function(event) {
        console.log("OnTableBtnClose");
    },

    isIInTables:function(tableid) {
        var data = cc.vv.clubMgr.clubTables[cc.vv.clubMgr.selectedClubid];

        if (!data) {
            return;
        }

        for (let key in data){
            if (tableid == data[key].id) {
                for (let key2 = 0; key2 < 4; key2++) {
                    if(data[key]["user_id" + key2] == cc.vv.userMgr.userId){
                        return true;
                    }
                }
                return false;
            }
        }
    },

    //加入桌子的游戏
    onTableBtnJoinGame:function(event) {
        console.log("OnTableBtnJoinGame");
        if (this.isIInTables(event.target.name)) {
            cc.vv.gameNetMgr.loadGameScene();
        }else{
            cc.vv.userMgr.enterRoom(Number(event.target.name),function(ret){
                cc.vv.ip_check = true;
                if(ret.errcode == 0){
                }
                else{
                    
                    if (ret.errcode == 5){
                        cc.vv.alert.show("提示","钻石不足，加入房间失败!是否进入商城购买？",function(){
                            cc.vv.hall.getComponent('Shop').onBtnShopClicked();
                        },true);  
                    }else{
                        var content = "房间["+ roomId +"]不存在，请重新输入!";
                        if(ret.errcode == 4){
                            content = "房间["+ roomId + "]已满!";
                        }
                        cc.vv.tip.show("提示",content);
                    }

                    cc.vv.hall.autoJoinRoom();
                }
            }.bind(this)); 
        }
    },

    //toggle按钮
    onToggleHistory:function(event) {
        console.log("onToggleHistory");
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        var data = event.detail;
        if ( !data.isChecked ) {
            return;
        }
        this.refreshHistory();
    },

    refreshHistory:function(){
        this.hideAllManage();
        this.clubManageDetail.getChildByName("Club_histroy").active = true;
        var clubid = this.getClubIdByClubName(this.selectedClubName);
        cc.vv.clubMgr.requestHistoryList(clubid);
    },

    onToggleMembers:function(event) {
        console.log("onToggleMembers");
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        var data = event.detail;
        if ( !data.isChecked ) {
            return;
        }
        this.hideAllManage();
        this.clubManageDetail.getChildByName("Club_members").active = true;
        var clubid = this.getClubIdByClubName(this.selectedClubName);
        cc.vv.clubMgr.requestClubManInfos(clubid);
    },

    onToggleApplys:function(event) {
        console.log("onToggleApplys");
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        var data = event.detail;
        if ( !data.isChecked ) {
            return;
        }
        this.hideAllManage();
        this.clubManageDetail.getChildByName("Club_apply").active = true;
        var clubid = this.getClubIdByClubName(this.selectedClubName);
        cc.vv.clubMgr.requestClubApplyInfos(clubid);
    },

    onToggleGameSet:function(event) {
        console.log("onToggleGameSet");
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        var data = event.detail;
        if ( !data.isChecked ) {
            return;
        }
        this.hideAllManage();
        this.clubManageDetail.getChildByName("Club_gameSet").active = true;
        this.refreshSettingInfos()
    },

    onToggleAdminSet:function(event) {
        console.log("onToggleAdminSet");
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        var data = event.detail;
        if ( !data.isChecked ) {
            return;
        }
        this.hideAllManage();
        this.clubManageDetail.getChildByName("Club_adminSet").active = true;
        cc.vv.clubMgr.requestClubManageList();
    },

    onToggleHallInfo:function(event) {
        console.log("onToggleHallInfo");
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        var data = event.detail;
        if ( !data.isChecked ) {
            return;
        }
        this.refreshHallInfo();
    },

    onToggleMessage:function(event) {
        console.log("onToggleMessage");
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        var data = event.detail;
        if ( !data.isChecked ) {
            return;
        }
        this.hideAllMessage();
        // this.clubMessageDetail.getChildByName("").active = true;
        var clubid = this.getClubIdByClubName(this.selectedClubName);
        cc.vv.clubMgr.requestClubInfos(clubid);
    },

    //消息界面内容隐藏
    hideAllMessage:function() {
        var childnum = this.clubMessageDetail.childrenCount;
        var childs = this.clubMessageDetail.children
        for (var idx = 0; idx < childnum; idx++) {
            childs[idx].active = false;
        }
    },

    //管理界面内容全隐藏
    hideAllManage:function() {
        var childnum = this.clubManageDetail.childrenCount;
        var childs = this.clubManageDetail.children
        for (var idx = 0; idx < childnum; idx++) {
            childs[idx].active = false;
        }
    },

    refreshHallInfo:function(){
        this.hideAllMessage();
        this.clubMessageDetail.getChildByName("Club_info").active = true;
        this.refreshEnterClubInfo()
    },

    //钻石显示
    getGemsShow:function(gems, clubid) {
        var type = this.getPlayerTypeByClubId(clubid);
        if (type == 2) {
            return gems;
        }

        if (gems < 50) {
            return "极少";
        }

        if (gems >= 50 && gems < 100) {
            return "较少";
        }

        if (gems >= 100) {
            return "充足";
        }
    },

    //俱乐部简介界面
    refreshEnterClubInfo:function() {
        var selectedclubData = cc.vv.clubMgr.myClubs[this.selectedClubName]
        var node = this.clubMessageDetail.getChildByName("Club_info");
        var masterInfo = node.getChildByName("masterInfo")
        var ClubMessage = node.getChildByName("ClubMessage")
        var Club_details = node.getChildByName("Club_details")

        node.getChildByName("num_zs").getComponent(cc.Label).string = this.getGemsShow(selectedclubData.gems, this.selectedClubName);
        
        masterInfo.getChildByName("id").getComponent(cc.Label).string = "ID:" + selectedclubData.huizhang_id;
        //设置其他基础信息
        var callback = function(info) {
            masterInfo.getChildByName("name").getComponent(cc.Label).string = info.name;
        }
        masterInfo.getChildByName("headMask").getChildByName("head").getComponent("ImageLoader").setUserID(selectedclubData.huizhang_id, callback)

        ClubMessage.getChildByName("content").getComponent(cc.Label).string = selectedclubData.gonggao ? selectedclubData.gonggao : "暂无公告";

        Club_details.getChildByName("bg1").getChildByName("text_clubname").getComponent(cc.Label).string = selectedclubData.name;
        Club_details.getChildByName("bg2").getChildByName("text_clubname").getComponent(cc.Label).string = selectedclubData.curr_mem + "/" + selectedclubData.max_mem + "人";
        Club_details.getChildByName("bg3").getChildByName("text_clubname").getComponent(cc.Label).string = "最多可开" + selectedclubData.max_count + "桌";
    },

    //刷新俱乐部消息列表
    refreshClubInfos:function() {

    },

    //刷新历史战绩界面
    refreshHistoryList:function() {
        var node = this.scrollViewHistory.content;
        node.removeAllChildren();

        var data = cc.vv.clubMgr.histroy_info_list;

        data.sort(function(a,b){
           return b.create_time - a.create_time;
        });

        var num = data.length;

        for (var idx = 0; idx < num; idx++) {
            let mPrefab = cc.instantiate(this.historyItem)
            if (mPrefab) {
                //设置对象属性
                this.initHistoryItem(mPrefab, data[idx]);//后续传入data
                node.addChild(mPrefab);
            }
        }
    },
    //设置历史战绩的数据
    initHistoryItem:function(prefab, data) {
        var historydata = JSON.parse(data.history);
        var maxindex = 0;
        var maxscore = 0;
        prefab.getChildByName("text_roomNum").getComponent(cc.Label).string = historydata.id;
        // prefab.getChildByName("text_roomDate").getComponent(cc.Label).string = this.dateFormat(historydata.time * 1000, 1);
        prefab.getChildByName("text_roomTime").getComponent(cc.Label).string = this.dateFormat(historydata.time * 1000, 2);
        
        for (let index = 0; index < historydata.seats.length; index++) {
            var player = prefab.getChildByName("Player" + (index + 1))
            player.getComponent("ImageLoader").setUserID(historydata.seats[index].userid, function(info){
                player.getChildByName("name").getComponent(cc.Label).string = info.name;
            })
            player.getChildByName("id").getComponent(cc.Label).string = "ID:" + historydata.seats[index].userid;
            player.getChildByName("score").getComponent(cc.Label).string = historydata.seats[index].score;

            if (historydata.seats[index].score >= maxscore) {
                maxscore = historydata.seats[index].score;
                maxindex = index;
            }
        }
        //大赢家图片
        var pos = prefab.getChildByName("Player" + (maxindex + 1)).getPosition();
        prefab.getChildByName("dayinjia").setPosition(cc.p(pos.x - 25, pos.y + 10));
    },

    //刷新玩家列表
    refreshMembers:function() {
        var node = this.scrollViewMembers.content;
        node.removeAllChildren();

        var data = cc.vv.clubMgr.man_infos;

        for (let key in data){
            if (data[key].type == 0 || data[key].type == 1 || data[key].type == 2) {
                let mPrefab = cc.instantiate(this.memberItem)
                if (mPrefab) {
                    //设置对象属性
                    mPrefab.name = "" + data[key].user_id;
                    this.initMembersItem(mPrefab, data[key]);//后续传入data
                    node.addChild(mPrefab);
                }
            }
        }
    },

    //设置玩家列表的数据
    initMembersItem:function(prefab, data) {
        var useid = data.user_id;
        var type = data.type;
       
        var that = this;
        //设置身份
        var oneSpriteFrame = this.getSpriteFrameByType(type);
        prefab.getChildByName("role").getComponent(cc.Sprite).spriteFrame = oneSpriteFrame;
        //设置其他基础信息
        var callback = function(info) {
            prefab.getChildByName("text_Name").getComponent(cc.Label).string = info.name;
            cc.vv.utils.addClickEventByParams(prefab, that.node, "ClubCtrl", "onBtnShowUseInfo", [info.name, data.user_id, oneSpriteFrame, type]);
        }

        prefab.getChildByName("headMask").getChildByName("head").getComponent("ImageLoader").setUserID(useid, callback)

    },

    onBtnShowUseInfo:function(event, customData) {
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        var userSpriteFrame = event.target.getChildByName("headMask").getChildByName("head").getComponent(cc.Sprite);
        cc.vv.userinfoShow.show(customData[0], customData[1], userSpriteFrame, 0, null, "", customData[3]);  
    },

    //刷新申请列表
    refreshApplyList:function() {
        var node = this.scrollViewApply.content;
        node.removeAllChildren();

        var num = 0;
        var data = cc.vv.clubMgr.apply_infos;

        for (let key in data){
            num = num + 1
            let mPrefab = cc.instantiate(this.applyItem)
            if (mPrefab) {
                //设置对象属性
                this.initApplyItem(mPrefab, data[key]);//后续传入data
                node.addChild(mPrefab);
            }
        }
    },

    //设置玩家列表的数据
    initApplyItem:function(prefab, data) {
        var useid = data.user_id;
        prefab.name = "" + useid;

        prefab.getChildByName("text_ID").getComponent(cc.Label).string = "ID:" + useid;

        var callback = function(info) {
            prefab.getChildByName("text_Name").getComponent(cc.Label).string = info.name;
        }

        prefab.getChildByName("headMask").getChildByName("head").getComponent("ImageLoader").setUserID(useid, callback);

        cc.vv.utils.addClickEventByParams(prefab.getChildByName("btn_yes"), this.node, "ClubCtrl", "onBtnAgreeApply", [useid]);
        cc.vv.utils.addClickEventByParams(prefab.getChildByName("btn_no"), this.node, "ClubCtrl", "onBtnCloseApply", [useid]);
    },


    //
    getGameNameByType:function(type){
        var name;
        if(type == "txmj"){
            name = "桐乡麻将";
        }else if(type == "zqmj"){
            name = "洲泉麻将";
        }else if(type == "cfmj"){
            name = "崇福麻将";
        }
        return name;
    },

    getGameTypeDesByAttr:function(bbh){
        var typedes;
        if (bbh == 1) {
            typedes = "白板花麻将"
        }else{
            typedes = "翻花麻将"
        }
        return typedes;
    },

    getGameRuleDes:function(data, effectdes){
        if (effectdes) {
            effectdes.toString();
        }else{
            effectdes = " ";
        }

        var ruledex = "" + data.maxGames + "局";
        if(data.maxFan > 0){
            ruledex = ruledex + effectdes + data.maxFan + "片"
        }else{
            ruledex = ruledex + effectdes + "无封顶"
        }

        if(data.hengfan){
            ruledex = ruledex + effectdes + "横翻";
        }else{
            ruledex = ruledex + effectdes + "不横翻";
        }
        return ruledex;
    },

    getGameMaxFanDes:function(maxFan) {
        if(maxFan > 0){
            return maxFan + "片";
        }else{
            return "无封顶"
        }
    },

    getGameHengFan:function(hengfan) {
        if(hengfan){
            return "横翻计分";
        }else{
            return "横翻不计分";
        }
    },

    getGameFuFeiDes:function(fplay) {
        if (fplay == 0) {
            return "AA制支付";
        }

        if (fplay == 1) {
            return "亲友群支付";
        }

        return "";
    },

    //玩法设置界面
    refreshSettingInfos:function() {
        var data = JSON.parse(cc.vv.clubMgr.myClubs[this.selectedClubName].base_info)

        var name;
        var typedes;
        var ruledex;
        var fufeides;

        if(data){
            name = this.getGameNameByType(data.type);
            typedes = this.getGameTypeDesByAttr(data.bbh);
            ruledex = this.getGameRuleDes(data);
            fufeides = this.getGameFuFeiDes(data.fplay)
        }else{
            name = "暂未设置";
            typedes = "";
            ruledex = "请先设置默认玩法";
            fufeides = "";
        }
        
        this.clubGameSet_gameName.getComponent(cc.Label).string = name;
        this.clubGameSet_detail.getComponent(cc.Label).string = fufeides + " " + typedes + " " + ruledex;
    },

    onBtnAgreeApply:function(event, customData){
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        var data = customData;
        var id = this.getClubIdByClubName(this.selectedClubName);
        cc.vv.clubMgr.sendChangeClubMen(id, 0, customData[0]);
    },

    onBtnCloseApply:function(event, customData){
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        var data = customData;
        var id = this.getClubIdByClubName(this.selectedClubName);
        cc.vv.clubMgr.sendClubKick(id, customData[0]);
    },

    //管理员界面
    refreshManagerList:function() {
        for (let index = 0; index < 3; index++) {
            let node = this.node_club_adminSet.getChildByName("admin" + (index + 1))
            if (cc.vv.clubMgr.managerList && cc.vv.clubMgr.managerList[index]) {
                node.getChildByName("admininfo").active = true;
                node.getChildByName("setadmin").active = false;
                node.getChildByName("admininfo").getChildByName("headMask").getChildByName("head").getComponent("ImageLoader").setUserID(cc.vv.clubMgr.managerList[index].user_id, function(info) {
                    node.getChildByName("admininfo").getChildByName("text_Name").getComponent(cc.Label).string = info.name;
                })
                // node.getChildByName("admininfo").getChildByName("head").getComponent(cc.Label).string = cc.vv.clubMgr.managerList[index].
                // node.getChildByName("admininfo").getChildByName("text_Name").getComponent(cc.Label).string = cc.vv.clubMgr.managerList[index].name;
                node.getChildByName("admininfo").getChildByName("text_ID").getComponent(cc.Label).string = "ID:" + cc.vv.clubMgr.managerList[index].user_id;
            }else{
                node.getChildByName("admininfo").active = false;
                node.getChildByName("setadmin").active = true;
            }
        }
    },

    //根据类型刷新弹窗界面
    refreshChangeClubInfo:function(type, message, ok_callback, title){
        //还原事件列表跟输入内容
        this.changebox.getComponent(cc.EditBox).placeholder = "请输入内容";
        this.changebox.getComponent(cc.EditBox).string = "";
        this.changebox_title.getComponent(cc.Label).string = title;
        this.ok_callback = ok_callback;

        this.changClubInfo.active = true;
        //type 1 提示字  2 输入
        if(type == 2){
            this.changebox.active = true;
            this.txt_des.active = false;
            this.btn_ok.on('click', ok_callback, this);
            this.btn_close.on('click', this.onBtnChangeClubInfoView, this);
        }else{
            this.changebox.active = false;
            this.txt_des.active = true;
            this.txt_des.getComponent(cc.Label).string = message;
            this.btn_ok.on('click', ok_callback, this);
            this.btn_close.on('click', this.onBtnChangeClubInfoView, this);
        }
    },

    onBtnChangeClubInfoView:function(){
        cc.log("onBtnChangeClubInfoView");
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        this.changClubInfo.active = !this.changClubInfo.active;
        if (this.changClubInfo.active == false && this.ok_callback) {
            this.btn_ok.off('click', this.ok_callback, this);
            this.btn_close.off('click', this.onBtnChangeClubInfoView, this);
        }
    },

    onBtnAddMens:function(){
        cc.log("onBtnAddMens");
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        var that = this;
        var club_id = this.getClubIdByClubName(this.selectedClubName);
        if (cc.vv.clubMgr.myClubs[club_id].max_mem >= 300) {
            cc.vv.tip.show("人数已达上限,不能再扩展了!");
            return;
        }
        this.refreshChangeClubInfo(1, "消耗钻石增加人数上限", function(){
            cc.vv.clubMgr.sendAddTablesOrMens(club_id, 2);
            that.onBtnChangeClubInfoView();
        }, "扩展人数上限");
    },

    onBtnAddTables:function(){
        cc.log("onBtnAddTables");
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        var that = this;
        var club_id = this.getClubIdByClubName(this.selectedClubName);
        if (cc.vv.clubMgr.myClubs[club_id].max_count >= 100) {
            cc.vv.tip.show("桌子已达上限,不能再扩展了!");
            return;
        }
        this.refreshChangeClubInfo(1, "消耗钻石增加桌子上限", function(){
            cc.vv.clubMgr.sendAddTablesOrMens(club_id, 1);
            that.onBtnChangeClubInfoView();
        }, "扩张桌子上限");
    },

    onBtnChangeClubName:function(){
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        var club_id = this.getClubIdByClubName(this.selectedClubName);
        var that = this;
        this.refreshChangeClubInfo(2, "修改亲友群名字", function(){
            var messageStr = that.changebox.getComponent(cc.EditBox).string;
            cc.vv.clubMgr.sendChangeClubTitleOrGongGao(club_id, messageStr, 1);
            that.onBtnChangeClubInfoView();
        }, "修改亲友群名字");
    },

    onBtnChangeClubGongGao:function(){
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        var that = this;
        var club_id = this.getClubIdByClubName(this.selectedClubName);
        this.refreshChangeClubInfo(2, "修改亲友群公告", function(){
            var messageStr = that.changebox.getComponent(cc.EditBox).string;
            cc.vv.clubMgr.sendChangeClubTitleOrGongGao(club_id, messageStr, 2);
            that.onBtnChangeClubInfoView();
        }, "修改亲友群公告");
    },

    onBtnAddZs:function(params) {
        cc.log("onBtnAddZs");
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        var that = this;
        var club_id = this.getClubIdByClubName(this.selectedClubName);
        this.refreshChangeClubInfo(2, "增加亲友群钻石数量", function(){
            // cc.vv.tip.show("接口暂未给到");
            var gemsNum = Number(that.changebox.getComponent(cc.EditBox).string);
            if (gemsNum == 'NaN' || !gemsNum) {
                cc.vv.tip.show("请输入正确的钻石数量！");
                that.changebox.getComponent(cc.EditBox).string = "";
                return;
            }
            cc.vv.clubMgr.addZuanShiToClub(gemsNum);
            that.onBtnChangeClubInfoView();
        }, "增加亲友群钻石数量");
    },

    onBtnAddManageMans:function(params) {
        cc.log("onBtnAddManageMans");
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        var that = this;
        var club_id = this.getClubIdByClubName(this.selectedClubName);
        this.refreshChangeClubInfo(2, "创建管理员", function(){
            var targetid = that.changebox.getComponent(cc.EditBox).string;
            cc.vv.clubMgr.sendChangeClubMen(club_id, 1, targetid);
            that.onBtnChangeClubInfoView();
        }, "请输入管理员ID");
    },

    onBtnCancelManageMan:function(event, customData) {
        cc.log("onBtnCancelManageMan");
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        var club_id = this.getClubIdByClubName(this.selectedClubName);
        var index = Number(customData) - 1;

        if (cc.vv.clubMgr.managerList[index]) {
            cc.vv.clubMgr.sendChangeClubMen(club_id, 0, cc.vv.clubMgr.managerList[index].user_id);
        }
    },

    onBtnLeaveClub:function(params) {
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        var id = this.getClubIdByClubName(this.selectedClubName);
        cc.vv.clubMgr.sendExitClub(id, 1);
    },

    onBtnDismissClub:function(params) {
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        var id = this.getClubIdByClubName(this.selectedClubName);
        cc.vv.clubMgr.sendExitClub(id, 2);
    },

    onBtnClubPageShow:function(params){
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        this.clubpage.active = !this.clubpage.active;
    },

    onBtnSetDefaultPlay:function(params){
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        this.CreateRoom.getComponent("CreateRoom").setIsClubSetJieMian(true);
        this.CreateRoom.active = !this.CreateRoom.active;
        this.CreateRoom_btnsave.active = true;
        this.CreateRoom_btnok.active = false;
    },

    //自选开房
    onBtnOpenCustomRoom:function(params){
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        this.CreateRoom.active = !this.CreateRoom.active;
        this.CreateRoom_btnsave.active = false;
        this.CreateRoom_btnok.active = true;
    },

    //默认开房
    onBtnDefaultRoom:function(params) {
        var infoData = cc.vv.clubMgr.getDefaultTableInfo();
        this.node_gameinfo.getComponent("GameInfo3D").show(infoData, this, this.joinCallback, null, true)
    },

    joinCallback:function(params) {
        this.CreateRoom.getComponent("CreateRoom").onBtnDefaultRoom();
    },

    onBtnClose:function(params) {
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        cc.vv.clubMgr.close();
    },

    //俱乐部倒计时
    onBtnClubClock:function(params) {
        cc.vv.runClockMgr.resetClock("clubclock", 30);
        this.refreshClubClock();
        cc.vv.clubMgr.requestTableList();
    },

    refreshClubClock:function() {
        var time = cc.vv.runClockMgr.getClockTime("clubclock");
        if (time > 0) {
            this.btnClubClock.getComponent(cc.Button).interactable = false;
            this.txtClubClockTime.active = true;
            this.txtClubClockTime.getComponent(cc.Label).string = "冷却:" + time.toFixed(0);
        }else{
            this.btnClubClock.getComponent(cc.Button).interactable = true;
            this.txtClubClockTime.active = false;
        }
    },

});