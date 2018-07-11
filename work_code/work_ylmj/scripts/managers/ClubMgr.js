cc.Class({
    extends: cc.Component,

    properties: {
       
    },

    // use this for initialization
    onLoad: function () {

    },
    
    start:function(){

    },
    
    initMgr:function(){

        //玩家是否有俱乐部
        this.IHaveClub = false;

        //界面root节点
        this.rootNode = null;

        //缓存俱乐部数据
        this.myClubs = {};
        this.clubTables = {};

        //俱乐部列表数据 id 跟type列表
        this.club_list = null;
        //会长数据
        this.president = null;
        //俱乐部当前人数
        this.club_current_num = null;
        //俱乐部最大人数
        this.club_max_num = null;
        //俱乐部开桌上限
        this.club_table_max = null;
        //消息列表
        this.info_list = null;
        //历史战绩数据
        this.histroy_info_list = null;
        //成员列表数据
        this.man_infos = null;
        //申请列表数据
        this.apply_infos = null;
        //玩法设置数据
        this.defaultinfo = null;
        this.rankinfo = null;
        //管理员设置数据
        this.managerList = null;

        //默认俱乐部设置
        this.defaultClubConf = null;

        //选中的俱乐部
        this.selectedClubid = null;
    },

    initHandlers:function(params) {
    },

    removeHandlers:function(params) {
        //net层没有remove方法后续补上
    },

    getClubid:function(club_id){
        if(club_id){
            return club_id;
        }else{
            if(this.selectedClubid){
                return this.selectedClubid;
            }else{
                cc.log("error selectedClubid:" + this.selectedClubid);
            }
        }
    },

    //创建俱乐部
    creatClub:function( m_name, rootnode) {
        var accountid = cc.vv.userMgr.account;
        cc.log("creatClub accountid:" + accountid);
        var data = {
            account:accountid,
            name:m_name
        };

        var that = this;
        var callback = function(ret) {
            cc.log(ret);
            // if (ret.errcode == 1) {
            //     //不是代理
            //     cc.vv.tip.show("非代理成员无法创建俱乐部");
            // }

            // if (ret.errcode == 2) {
            //     //钻石不够
            //     cc.vv.tip.show("钻石不足，无法创建");
            // }

            // if (ret.errcode == 3) {
            //     //重名
            //     cc.vv.tip.show("名字重复，无法创建");
            // }

            if (ret.errcode == 0) {
                //创建成功
                cc.vv.tip.show("俱乐部创建成功");
                if (rootnode) {
                    rootnode.active = false;
                }
                that.dispatchEvent("change_club_success", null);
            }else{
                cc.vv.tip.show("" + ret.errmsg);
            }
        }

        cc.vv.http.sendRequest("/create_club", data, callback);
    },

    //尝试进入我的俱乐部列表
    enterClub:function( joinClubNode ) {
        var useid = cc.vv.userMgr.userId;
        var data = {
            userid:useid
        };

        var that = this;
        var callback = function(ret) {
            cc.log(ret);
            if (ret.errcode != 0) {
                cc.log("error enterClub:" + ret.errmsg);
                return;
            }

            ret.data = that.filterData(ret.data);
            //club_id,type
            that.club_list = ret.data;
            
            if (!ret.data || that.club_list.length == 0 || that.checkClubsTypeIs4(ret.data)) {
                // 没有俱乐部
                if (joinClubNode) {
                    joinClubNode.active = true;
                }
            }else{
                that.iWantClubsMessage();
                cc.vv.wc.show("正在进入亲友群");
                cc.director.loadScene("club", function(params) {
                    cc.vv.wc.hide();
                });
            }
        }

        cc.vv.http.sendRequest("/enter_club", data, callback);
    },

    //过滤俱乐部列表
    filterData:function(data) {
        var result = [];
        if (data && data.length) {
            for (let index = 0; index < data.length; index++) {
                const element = data[index];
                if (element.type != 4) {
                    result.push(element);
                }
            }
        }
        return result;
    },

    //检查俱乐部类型是否都是4
    checkClubsTypeIs4:function(club_list){
        for (let idx = 0; idx < club_list.length; idx++) {
            if(club_list[idx].type != 4){
                return false;
            }
        }
        return true;
    },

    //俱乐部内部刷新数据
    refreshClubListData:function() {
        var useid = cc.vv.userMgr.userId;
        var data = {
            userid:useid
        };

        var that = this;
        var callback = function(ret) {
            cc.log(ret);
            if (ret.errcode != 0) {
                cc.log("error refreshClubListData:" + ret.errmsg);
                return;
            }
            ret.data = that.filterData(ret.data);
            //club_id,type
            that.club_list = ret.data;
            if (!ret.data || that.club_list.length == 0 || that.checkClubsTypeIs4(ret.data)) {
                // 没有俱乐部
                that.close();
            }else{
                that.iWantClubsMessage();
            }
        }

        cc.vv.http.sendRequest("/enter_club", data, callback);
    },

    //请求俱乐部数据
    iWantClubsMessage:function() {
        if (!(this.club_list.length && this.club_list.length > 0)) {
            return;
        }
        this.myClubs = {};

        var index = 0;
        var club_id = this.club_list[index].club_id;

        var data = {
            id:club_id
        };

        var that = this;
        var callback = function(ret) {
            cc.log(ret);
            if (ret.errcode != 0) {
                cc.log("error :" + ret.errmsg);
                return;
            }

            //存储俱乐部数据
            if (ret.data && ret.data[0] && ret.data[0].name) {
                that.myClubs[ret.data[0].id] = ret.data[0];
            }
            
            index = index + 1;
            if(index >= that.club_list.length){
                //刷新大厅界面
                that.dispatchEvent("refresh_club_hallroom", null)
            }else{
                data.id = that.club_list[index].club_id;
                cc.vv.http.sendRequest("/club_info", data, callback);
            }
        }

        cc.vv.http.sendRequest("/club_info", data, callback);
    },

    //请求某个俱乐部数据
    iWantOneClubsMessage:function(club_id){
        var data = {
            id:club_id
        };

        var that = this;
        var callback = function(ret) {
            cc.log(ret);
            if (ret.errcode != 0) {
                cc.log("error :" + ret.errmsg);
                return;
            }

            //存储俱乐部数据
            if (ret.data && ret.data[0] && ret.data[0].name) {
                that.myClubs[ret.data[0].id] = ret.data[0];
            }
            that.dispatchEvent("change_club_main_info", null)
        }

        cc.vv.http.sendRequest("/club_info", data, callback);
    },

    //消息列表请求
    requestClubInfos:function(club_id) {
        var data = {
            id:club_id
        };

        var that = this;
        var callback = function(ret) {
            cc.log(ret);
            if (ret.errcode != 0) {
                cc.log("error :" + ret.errmsg);
                return;
            }
            
            that.info_list = ret.data;
            that.dispatchEvent("club_message", null)
        }

        cc.vv.http.sendRequest("/club_message", data, callback);
    },

    //成员列表数据请求
    requestClubManInfos:function(club_id) {
        var data = {
            id:club_id,
            type:-1
        };

        var that = this;
        var callback = function(ret) {
            cc.log(ret);
            if (ret.errcode != 0) {
                cc.log("error :" + ret.errmsg);
                return;
            }
            
            that.man_infos = ret.data;
            that.dispatchEvent("club_member_list", null)
        }

        cc.vv.http.sendRequest("/club_member_list", data, callback);
    },

    //申请列表数据请求
    requestClubApplyInfos:function(oldpar) {
        var club_id = this.selectedClubid;
        var data = {
            id:club_id,
            type:4
        };

        var that = this;

        var callback = function(ret) {
            cc.log(ret);
            if (ret.errcode != 0) {
                cc.log("error :" + ret.errmsg);
                return;
            }
            
            that.apply_infos = ret.data;
            that.dispatchEvent("club_apply_infos", null);
        }

        cc.vv.http.sendRequest("/club_member_list", data, callback);
    },

    //管理员数据列表请求
    requestClubManageList:function(club_id) {
        var clubid = this.getClubid(club_id);
        var data = {
            id:clubid,
            type:1
        };

        var that = this;

        var callback = function(ret) {
            cc.log(ret);
            if (ret.errcode != 0) {
                cc.log("error :" + ret.errmsg);
                return;
            }
            
            that.managerList = ret.data;
            that.dispatchEvent("club_manager_list", null);
        }

        cc.vv.http.sendRequest("/club_member_list", data, callback);
    },

    //请求历史列表数据
    requestHistoryList:function(club_id) {
        var data = {
            account:cc.vv.userMgr.account,
            sign:cc.vv.userMgr.sign,
            clubid:club_id
        };

        var that = this;

        var callback = function(ret) {
            cc.log(ret);
            if (ret.errcode != 0) {
                cc.log("error :" + ret.errmsg);
                return;
            }
            
            that.histroy_info_list = ret.data;
            that.dispatchEvent("club_histroy_fights", null);
        }

        cc.vv.http.sendRequest("/get_club_history_list",data, callback);
    },

    //申请加入某个俱乐部
    applyInAClub:function(club_id){
        var useid = cc.vv.userMgr.userId;
        var data = {
            id:club_id,
            target_id:useid
        };

        var that = this;

        var callback = function(ret) {
            cc.log(ret);
            if (ret.errcode != 0) {
                cc.log("error :" + ret.errmsg);
                cc.vv.tip.show("" + ret.errmsg);
                return;
            }
            cc.vv.tip.show("申请成功,请耐心等待审核");
        }

        cc.vv.http.sendRequest("/club_mem_apply", data, callback);
    },

    //添加俱乐部消息
    sendClubMessage:function(club_id, messageStr){
        var data = {
            id:club_id,
            message:messageStr
        };

        var that = this;
        var callback = function(ret) {
            cc.log(ret);
            if (ret.errcode != 0) {
                cc.log("error :" + ret.errmsg);
                return;
            }
            cc.vv.tip.show("添加俱乐部消息成功")
        }

        cc.vv.http.sendRequest("/add_club_message", data, callback);
    },

    //修改俱乐部名字
    sendChangeClubName:function(club_id, club_name){
        var data = {
            id:club_id,
            name:club_name
        };

        var that = this;
        var callback = function(ret) {
            cc.log(ret);
            if (ret.errcode != 0) {
                cc.log("error :" + ret.errmsg);
                return;
            }
            cc.vv.tip.show("修改俱乐部名字成功")
        }

        cc.vv.http.sendRequest("/club_update_name", data, callback);
    },

    //1修改俱乐部标题 2修改俱乐部公告
    sendChangeClubTitleOrGongGao:function(club_id, messageStr, mtype){
        var data = {
            id:club_id,
            info:messageStr,
            type:mtype
        };

        var that = this;
        var callback = function(ret) {
            cc.log(ret);
            if (ret.errcode != 0) {
                cc.log("error :" + ret.errmsg);
                return;
            }

            if(mtype == 1){
                cc.vv.tip.show("修改俱乐部标题成功");
                that.myClubs[club_id].name = messageStr;
            }

            if(mtype == 2){
                cc.vv.tip.show("修改俱乐部公告成功");
                that.myClubs[club_id].gonggao = messageStr;
            }
            that.dispatchEvent("change_club_main_info",null);
        }

        cc.vv.http.sendRequest("/club_update_info", data, callback);
    },

    //管理员设置 和审核成员通过  2是创建者 1是管理员 0是普通成员  4是待审核成员 5是红名 6是黑名
    sendChangeClubMen:function(club_id, mtype, targetid){
        var data = {
            id:club_id,
            type:mtype,
            target_id:targetid
        };

        var that = this;
        var callback = function(ret) {
            cc.log(ret);
            if (ret.errcode != 0) {
                cc.log("error :" + ret.errmsg);
                return;
            }
            cc.vv.tip.show("成员身份修改成功");
            that.dispatchEvent("club_update_mem",null);
        }

        cc.vv.http.sendRequest("/club_update_mem", data, callback);
    },

    //扩张桌子或椅子
    sendAddTablesOrMens:function(club_id, mtype){
        var message = null;
        if(mtype == 1){
            message = "扩张俱乐部桌子成功";
            if(this.myClubs[club_id].max_count > 10){
                cc.vv.tip.show("俱乐部桌子已达上限,不能再扩展了");
                return;
            }
        }

        if(mtype == 2){
            message = "扩张俱乐部人数成功";
            if(this.myClubs[club_id].max_mem > 100){
                cc.vv.tip.show("俱乐部人数已达上限,不能再扩展了")
                return;
            }
        }

        //type 1是扩展桌子， 2是扩展人数
        var data = {
            id:club_id,
            type:mtype
        };

        var that = this;
        var callback = function(ret) {
            cc.log(ret);
            if (ret.errcode != 0) {
                cc.log("error :" + ret.errmsg);
                return;
            }

            cc.vv.tip.show("" + message);
            if(mtype == 1){
                that.myClubs[club_id].max_count = 100;
            }else{
                that.myClubs[club_id].max_mem = 300;
            }
            that.dispatchEvent("change_club_main_info",null)
        }

        cc.vv.http.sendRequest("/club_add_max", data, callback);
    },
    
    //解散或者退出
    sendExitClub:function(club_id, mtype){
        //type 1是自己退出， 2是解散俱乐部
        var useid = cc.vv.userMgr.userId;
        var data = {
            id:club_id,
            userid:useid,
            type:mtype
        };

        var that = this;
        var callback = function(ret) {
            cc.log(ret);
            if (ret.errcode != 0) {
                cc.log("error :" + ret.errmsg);
                return;
            }

            if(mtype == 1){
                cc.vv.tip.show("退出俱乐部成功")
            }

            if(mtype == 2){
                cc.vv.tip.show("解散俱乐部成功")
            }
            that.dispatchEvent('change_club_success', null);
        }

        cc.vv.http.sendRequest("/club_exit", data, callback);
    },

    // 踢出对象 拒绝成员加入
    sendClubKick:function(oldpar, targetid){
        var useid = cc.vv.userMgr.userId;
        var club_id = this.selectedClubid;
        var data = {
            id:club_id,
            userid:useid,
            target_id:targetid
        };

        var that = this;
        var callback = function(ret) {
            cc.log(ret);
            if (ret.errcode != 0) {
                cc.log("error :" + ret.errmsg);
                return;
            }

            cc.vv.tip.show("操作成功")
            that.dispatchEvent('change_club_kick', null);
        }

        cc.vv.http.sendRequest("/club_kick", data, callback);
    },

    // 修改默认桌子类型
    sendDefaultTableInfo:function(){
        var club_id = this.selectedClubid;
        var mbase_info = JSON.stringify(this.defaultClubConf);
        var data = {
            id:club_id,
            base_info:mbase_info
        };

        var that = this;
        var callback = function(ret) {
            cc.log(ret);
            if (ret.errcode != 0) {
                cc.log("error :" + ret.errmsg);
                return;
            }

            cc.vv.tip.show("操作成功")
            that.myClubs[club_id].base_info = mbase_info;
            that.dispatchEvent('change_default_table_info', null);
        }

        cc.vv.http.sendRequest("/club_update_setting", data, callback);
    },

    //请求桌子列表
    requestTableList:function() {
        var data = {
            club_id:this.selectedClubid
        };

        var clubid = this.selectedClubid;
        var that = this;
        var callback = function(ret) {
            cc.log(ret);
            if (ret.errcode != 0) {
                cc.log("error :" + ret.errmsg);
                return;
            }
            that.clubTables[clubid] = ret.data;
            // cc.vv.tip.show("俱乐部钻石充值成功");
            that.dispatchEvent('get_rooms_of_club', null);
        }

        cc.vv.http.sendRequest("/get_rooms_of_club", data, callback);
    },

    //删除桌子
    removeTable:function(params) {
        var data = {
            club_id:this.selectedClubid
        };

        var clubid = this.selectedClubid;
        var that = this;
        var callback = function(ret) {
            cc.log(ret);
            if (ret.errcode != 0) {
                cc.log("error :" + ret.errmsg);
                return;
            }
            
            cc.vv.tip.show("解散成功");
            that.requestTableList();
        }

        cc.vv.http.sendRequest("/get_rooms_of_club", data, callback);
    },

    addZuanShiToClub:function(gemsNum) {
        var data = {
            id:this.selectedClubid,
            account:cc.vv.userMgr.account,
            gems:gemsNum
        };

        var that = this;
        var callback = function(ret) {
            cc.log(ret);
            if (ret.errcode != 0) {
                cc.log("error :" + ret.errmsg);
                return;
            }

            cc.vv.tip.show("俱乐部钻石充值成功，钻石增加" + ret.gems)
            that.iWantOneClubsMessage(that.selectedClubid);
        }

        cc.vv.http.sendRequest("/club_add_gems", data, callback);
    },

    //获取默认桌子数据
    getDefaultTableInfo:function() {
        var data = JSON.parse(this.myClubs[this.selectedClubid].base_info);
        if (data) {
            data.creator = cc.vv.userMgr.userId;
        }
        return data;
    },

    //界面事件发射
    dispatchEvent(event,data){
        if(this.rootNode){
            this.rootNode.emit(event,data);
        }
    },

    //退出
    close:function(params) {
        // this.removeHandlers();
        cc.vv.userMgr.gotoHall();;
    },
});