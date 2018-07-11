cc.Class({
    extends: cc.Component,

    properties: {
        gameStoreVersion:0,
        fkgmVersion:0,
	    mailVersion:0,
		noticeVersion:0,
        _sceneNode:null
    },

    getOtherUrlVersion:function(params) {
        var data = {};
        var callbackfun = function(ret) {
            if (ret.status != 1) {
                cc.log("error callbackfun:" + ret.message)
                return;
            }
            this.compareVersion(ret.data);
        }

        cc.vv.http.sendOtherRequest("/getGameUpdate", data, callbackfun.bind(this));
    },

    compareVersion:function(data) {
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const element = data[key];
                if (element.type == 1) {
                    if (element.version - Number(this.gameStoreVersion) > 0) {
                        this.getGameStoreInfo();
                        this.gameStoreVersion = element.version;
                    }
                }

                if (element.type == 2) {
                    if (element.version - Number(this.fkgmVersion) > 0) {
                        this.getGameMessageFkgmInfo();
                        this.fkgmVersion = element.version;
                    }
                }

                if (element.type == 3) {
                    if (element.version - Number(this.mailVersion) > 0) {
                        this.getGameMessageMailInfo();
                        this.mailVersion = element.version;
                    }
                }

                if (element.type == 4) {
                    if (element.version - Number(this.noticeVersion) > 0) {
                        this.getGameMessageNoticeInfo();
                        this.noticeVersion = element.version;
                    }
                }
            }
        }
    },

    getGameStoreInfo:function(callback) {
        var onGet = function (ret) {
            if (ret.status !== 1) {
                cc.log3.debug(ret.message);
            }
            else {
                // cc.log3.debug(ret);
                if(callback != null)
                {
                    callback(ret.data);
                }
                this.dispatchEvent("get_game_store_info",ret.data)
            }
        };

        var data = {
            // account:cc.vv.userMgr.account,
            // sign:cc.vv.userMgr.sign,
        };

        cc.vv.http.sendOtherRequest("/getGameStore", data, onGet.bind(this));
    },

    getGameMessageFkgmInfo:function(params) {
        var d = new Date();
        var n=d.toLocaleDateString();

        var onGet = function(ret){
            if(ret.status !== 1){
                cc.log3.debug(ret.message);
            }
            else{
                ret = ret.data;
                cc.vv.userMgr.gemstip.version = ret.version;
                cc.vv.userMgr.gemstip.msg = ret.msg.replace("<newline>","\n");

                this.fkgmVersion = ret.version;
                this.dispatchEvent("get_game_fkgm_info",ret)
            }
        };
        
        var data = {
            // account:cc.vv.userMgr.account,
            // sign:cc.vv.userMgr.sign,
            type:"fkgm",
            // version:null
        };

        //每天显示一次
        // if(n != cc.sys.localStorage.getItem("fkgm")){
            cc.vv.http.sendOtherRequest("/getGameMessage",data,onGet.bind(this));
        // }
    },

    getGameMessageMailInfo:function(params) {
        var self = this;
        var onGet = function(ret){
            if(ret.status !== 1){
                cc.log3.debug(ret.message);
            }
            else{
                ret = ret.data;
                cc.vv.userMgr.notice.version = ret.version;
                cc.vv.userMgr.notice.msg = ret.msg;

                this.noticeVersion = ret.version;
                this.dispatchEvent("get_game_mail_info",ret)
            }
        };
        
        var data = {
            // account:cc.vv.userMgr.account,
            // sign:cc.vv.userMgr.sign,
            type:"mail",
            // version:null
        };
        cc.vv.http.sendOtherRequest("/getGameMessage",data,onGet.bind(this));
    },

    getGameMessageNoticeInfo:function(params) {
        var onGet = function(ret){
            if(ret.status !== 1){
                cc.log3.debug(ret.message);
            }
            else{
                ret = ret.data;
                cc.vv.userMgr.notice.version = ret.version;
                cc.vv.userMgr.notice.msg = ret.msg;

                this.mailVersion = ret.version;
                this.dispatchEvent("get_game_notice_info",ret)
            }
        };
        
        var data = {
            // account:cc.vv.userMgr.account,
            // sign:cc.vv.userMgr.sign,
            type:"notice",
            // version:null
        };
        cc.vv.http.sendOtherRequest("/getGameMessage",data,onGet.bind(this));
    },

    setMgrEventNode:function(node){
        if (node) {
            this._sceneNode = node;
        }else{
            this._sceneNode = null;
        }
    },

    //界面事件发射
    dispatchEvent(event,data){
        if(this._sceneNode){
            this._sceneNode.emit(event,data);
        }
    },
})