cc.Class({
    extends: cc.Component,

    properties: {
        tipLabel:cc.Label,
        lblVersion:cc.Label,
        _stateStr:'',
        _progress:0.0,
        _splash:null,
        _isLoading:false,
    },

    // use this for initialization
    onLoad: function () {
        if(!cc.sys.isNative && cc.sys.isMobile){
            var cvs = this.node.getComponent(cc.Canvas);
            cvs.fitHeight = true;
            cvs.fitWidth = true;
        }
        this.initMgr();
        this.tipLabel.string = this._stateStr;
    },
    
    start:function(){        
        var self = this;
        self.checkVersion();    

    },
    
    initMgr:function(){
        cc.vv = {};

        this.lblVersion.string = cc.VERSION;

        var G3Plugin = require("G3Plugin")
        cc.vv.g3Plugin = new G3Plugin();

        //如果已经在大厅弹过提示
        if(cc.sys.localStorage.getItem("location_show") == 1){
            cc.vv.g3Plugin.init();
        }
        
        var UserMgr = require("UserMgr");
        cc.vv.userMgr = new UserMgr();
        
        var ReplayMgr = require("ReplayMgr");
        cc.vv.replayMgr = new ReplayMgr();
        
        cc.vv.http = require("HTTP");
        cc.vv.global = require("Global");
        cc.vv.net = require("Net");
        
        var GameNetMgr = require("GameNetMgr");
        cc.vv.gameNetMgr = new GameNetMgr();
        cc.vv.gameNetMgr.initHandlers();
        
        var AnysdkMgr = require("AnysdkMgr");
        cc.vv.anysdkMgr = new AnysdkMgr();
        cc.vv.anysdkMgr.init();
        
        var VoiceMgr = require("VoiceMgr");
        cc.vv.voiceMgr = new VoiceMgr();
        cc.vv.voiceMgr.init();
        
        var AudioMgr = require("AudioMgr");
        cc.vv.audioMgr = new AudioMgr();
        cc.vv.audioMgr.init();
        
        var Utils = require("Utils");
        cc.vv.utils = new Utils();

        var ClubMgr = require("ClubMgr");
        cc.vv.clubMgr = new ClubMgr();
        cc.vv.clubMgr.initMgr();

        var Version = require("Version");
        cc.args = this.urlParse();

        var HttpMgr = require("HttpMgr");
        cc.vv.httpMgr = new HttpMgr();

        var RunClockMgr = require("RunClockMgr");
        cc.vv.runClockMgr = new RunClockMgr();
        cc.vv.runClockMgr.initMgr();

        var ShareCtrl = require("ShareCtrl");
        cc.vv.shareCtrl = new ShareCtrl();

        var AlertMgr = require("AlertMgr");
        cc.vv.alert = new AlertMgr();

        //开机进入，弹分享提示
        cc.vv.pop_active = 1;

        cc.vv.ip_check = true;

        //历史遗留值
        cc.sys.location = 1;
    },
    
    urlParse:function(){
        var params = {};
        if(window.location == null){
            return params;
        }
        var name,value; 
        var str=window.location.href; //取得整个地址栏
        var num=str.indexOf("?") 
        str=str.substr(num+1); //取得所有参数   stringvar.substr(start [, length ]
        
        var arr=str.split("&"); //各个参数放到数组里
        for(var i=0;i < arr.length;i++){ 
            num=arr[i].indexOf("="); 
            if(num>0){ 
                name=arr[i].substring(0,num);
                value=arr[i].substr(num+1);
                params[name]=value;
            } 
        }
        return params;
    },
    
    checkVersion:function(){
        var self = this;
        var onGetVersion = function(ret){
            if(ret.version == null){
                cc.log3.debug("error.");
            }
            else{
                cc.vv.SI = ret;

                var version = ret.version;
                if(cc.sys.os == cc.sys.OS_IOS && ret.version_ios){
                    version = ret.version_ios;
                }
                
                //苹果支付
                if (ret.app_store_review) {
                    cc.sys.app_store_review = 1;
                }else{
                    cc.sys.app_store_review = 0;
                }
                // if(cc.sys.isNative && version != cc.sys.PUBLISH){
                //     cc.find("Canvas/alert").active = true;
                //     //cc.log3.debug('cc.VERSIO-----------------------N:' + cc.VERSION);
                // }
                // else{
                    self.startPreloading();
                // }
            }
        };
        
        var xhr = null;
        var complete = false;
        var fnRequest = function(){
            self._stateStr = "正在连接服务器";
            xhr = cc.vv.http.sendRequest("/get_serverinfo",null,function(ret){
                xhr = null;
                complete = true;
                onGetVersion(ret);
            });
            setTimeout(fn,5000);            
        }
        
        var fn = function(){
            if(!complete){
                if(xhr){
                    xhr.abort();
                    self._stateStr = "连接失败，即将重试";
                    setTimeout(function(){
                        fnRequest();
                    },5000);
                }
                else{
                    fnRequest();
                }
            }
        };
        fn();
    },
    
    onBtnDownloadClicked:function(){
        cc.sys.openURL(cc.vv.SI.appweb);
    },
    
    startPreloading:function(){
        this._stateStr = "正在加载资源，请稍候";
        this._isLoading = true;
        var self = this;
        
        cc.loader.onProgress = function ( completedCount, totalCount,  item ){
            //cc.log3.debug("completedCount:" + completedCount + ",totalCount:" + totalCount );
            if(self._isLoading){
                self._progress = completedCount/totalCount;
            }
        };
        
        cc.loader.loadResDir("textures", function (err, assets) {
            self.onLoadComplete();
        });      
    },
    
    onLoadComplete:function(){
        this._isLoading = false;
        this._stateStr = "准备登陆";
        cc.director.loadScene("login");
        cc.loader.onComplete = null;
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if(this._stateStr.length == 0){
            return;
        }
        this.tipLabel.string = this._stateStr + ' ';
        if(this._isLoading){
            this.tipLabel.string += Math.floor(this._progress * 100) + "%";   
        }
        else{
            var t = Math.floor(Date.now() / 1000) % 4;
            for(var i = 0; i < t; ++ i){
                this.tipLabel.string += '.';
            }            
        }
    }
});