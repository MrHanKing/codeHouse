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
        isClubPanel:false,
        _isClubSetJieMian:false,
        _isfirst:false,
        _difenxuanze:null,
        _zimo:null,
        _hengfanxuanze:null,
        _wanfaxuanze:null,
        _zuidafanshu:null,
        _jushuxuanze:null,
        _dianganghua:null,
        _leixingxuanze:null,
        _fufeiuanze:null,
        _version:"1.1",
    },

    // use this for initialization
    onLoad: function () {
        //俱乐部的界面刷新
        this._isfirst = true;
        if (this.isClubPanel) {
            this.refreshClubPanel();
            return;
        }

        //查找本地数据
        //var WanfaInfo =[1,0,0,0,0,0,0,0];
        var diquType = 0;
        var userData = JSON.parse(cc.sys.localStorage.getItem('WFInfo'));
        cc.log3.debug("userData" + userData);
        if(userData != null && userData.version == this._version){
            cc.log3.debug("userData.diqu ="+userData.diqu);
            diquType = userData.diqu;
        }
        else{
            cc.sys.localStorage.removeItem('WFInfo');
        }

        this._leixingxuanze = [];
        var t = this.node.getChildByName("leixingxuanze");
        for(var i = 0; i < t.childrenCount; ++i){
            var n = t.children[i].getComponent("RadioButton");
            if(n != null){
                this._leixingxuanze.push(n);
            }
        }

        for(var i = 0; i < this._leixingxuanze.length; ++i){
            this._leixingxuanze[i].check(false); 
        }
        this._leixingxuanze[diquType].check(true);

        this._fufeiuanze = [];
        var t = this.node.getChildByName("xuanzefanshi");
        for(var i = 0; i < t.childrenCount; ++i){
            var n = t.children[i].getComponent("RadioButton");
            if(n != null){
                this._fufeiuanze.push(n);
            }
        }

        var type = 0;
        for(var i = 0; i < this._leixingxuanze.length; ++i){
            if(this._leixingxuanze[i].checked){
                type = i;
                break;
            }     
        }

        var fufei = 0;
        for(var i = 0; i < this._fufeiuanze.length; ++i){
            if(this._fufeiuanze[i].checked){
                fufei =  i;
                break;
            }
        }

        this._difenxuanze = [];
        var t = this.node.getChildByName("difenxuanze");
        for(var i = 0; i < t.childrenCount; ++i){
            var n = t.children[i].getComponent("RadioButton");
            if(n != null){
                this._difenxuanze.push(n);
            }
        }
        
        this._zimo = [];
        var t = this.node.getChildByName("zimojiacheng");
        for(var i = 0; i < t.childrenCount; ++i){
            var n = t.children[i].getComponent("RadioButton");
            if(n != null){
                this._zimo.push(n);
            }
        }
        //cc.log3.debug(this._zimo);
        
        this._hengfanxuanze=[];
        var t = this.node.getChildByName("henfangxuanze");
        for(var i = 0; i < t.childrenCount; ++i){
            var n = t.children[i].getComponent("CheckBox");
            if(n != null){
                this._hengfanxuanze.push(n);
            }
        }
        //cc.log3.debug(this._hengfanxuanze);

        this._wanfaxuanze = [];
        var t = this.node.getChildByName("wanfaxuanze");
        for(var i = 0; i < t.childrenCount; ++i){
            var n = t.children[i].getComponent("RadioButton");
            if(n != null){
                this._wanfaxuanze.push(n);
            }
        }

        if(type == 0){
            this._wanfaxuanze[0].check(false);
            this._wanfaxuanze[1].check(true);
        }
        else{
            this._wanfaxuanze[0].check(true);
            this._wanfaxuanze[1].check(false);
        }

        //cc.log3.debug(this._wanfaxuanze);

        //used
        this._zuidafanshu = [];
        var t = this.node.getChildByName("zuidafanshu");
        var j = 0;
        for(var i = 0; i < t.childrenCount; ++i){
            var n = t.children[i].getComponent("RadioButton");
            if(n != null){                
                if(type == 0){
                    if(j==3){
                        n.node.active = true;
                        n.check(true);
                    }
                    else{
                        n.node.active = false;
                        n.check(false);
                    }
                }
                else{
                    if(j==3){
                        n.node.active = false;
                        n.check(false);
                    }
                    else{
                         n.node.active = true;
                         if(j==0){
                             n.check(true);
                         }
                         else{
                             n.check(false);
                         }
                    }
                }

                j++;
                this._zuidafanshu.push(n);
            }
        }
        //cc.log3.debug(this._zuidafanshu);
        
        this._jushuxuanze = [];
        var t = this.node.getChildByName("xuanzejushu");
        for(var i = 0; i < t.childrenCount; ++i){
            var n = t.children[i].getComponent("RadioButton");
            if(n != null){
                this._jushuxuanze.push(n);
                var titleContAA = null;
                var titleContFZ = null;
                
                var title = t.children[i].getChildByName("title").getComponent(cc.Label);
                
                if(i == 1){
                    titleContAA = "4局(钻石x1)";
                    titleContFZ = "4局(钻石x4)";
                }
                else if(i == 2){
                    titleContAA = "8局(钻石x2)";
                    titleContFZ = "8局(钻石x8)";
                }
                else if(i == 3){
                    titleContAA = "16局(钻石x4)";
                    titleContFZ = "16局(钻石x16)";
                }
                //AA制
                if(fufei == 0){
                    title.string = titleContAA;
                }
                else{
                    title.string = titleContFZ;
                }
            }            
        }
        
        var jushuxuanze = 0;
        for(var i = 0; i < this._jushuxuanze.length; ++i){
            if(this._jushuxuanze[i].checked){
                jushuxuanze = i;
                break;
            }
        }

        var payinfo = this.node.getChildByName("bg").getChildByName("payinfo").getComponent(cc.Label);
        var payinfoCont = null;
        //AA制
        if(fufei == 0){
            payinfoCont = "每人会消耗";
            if(jushuxuanze == 0){
                payinfoCont = payinfoCont +"1";
            }
            else if(jushuxuanze == 1){
                payinfoCont = payinfoCont +"2";
            }
            else{
                payinfoCont = payinfoCont +"4";
            }
        }
        else{
            payinfoCont = "房主会消耗";
            if(jushuxuanze == 0){
                payinfoCont = payinfoCont +"4";
            }
            else if(jushuxuanze == 1){
                payinfoCont = payinfoCont +"8";
            }
            else{
                payinfoCont = payinfoCont +"16";
            }
        }
        payinfoCont = payinfoCont + "颗钻石";
        payinfo.string = payinfoCont;


        this._dianganghua = [];
        var t = this.node.getChildByName("dianganghua");
        for(var i = 0; i < t.childrenCount; ++i){
            var n = t.children[i].getComponent("RadioButton");
            if(n != null){
                this._dianganghua.push(n);
            }
        }
        //cc.log3.debug(this._jushuxuanze);
    },

    setIsClubSetJieMian:function(trueorfalse) {
        this._isClubSetJieMian = trueorfalse;
    },

    //注 :这个js太糟糕了  有时间重构下
    setJieMian:function() {
        var data = cc.vv.clubMgr.getDefaultTableInfo();

        if (!data) {
            return;
        }
        
        var diquType = 0;
        if (data.type == "txmj") {
            cc.log("桐乡麻将");
            diquType = 0;
        }else if (data.type == "zqmj") {
            cc.log("洲泉麻将");
            diquType = 1;
        }else if (data.type == "cfmj"){
            cc.log("崇福麻将");
            diquType = 2;
        }

        for (const key in this._leixingxuanze) {
            if (this._leixingxuanze.hasOwnProperty(key)) {
                const element = this._leixingxuanze[key];
                if (key == diquType) {
                    this._leixingxuanze[key].check(true);
                }else{
                    this._leixingxuanze[key].check(false);
                }
            }
        }
        

        var fufei = 0;
        if (data.paytype == 2 || data.paytype == 1) {
            fufei = 1;
        }
        for (const key in this._fufeiuanze) {
            if (this._fufeiuanze.hasOwnProperty(key)) {
                const element = this._fufeiuanze[key];
                if (key == fufei) {
                    this._fufeiuanze[key].check(true);
                }else{
                    this._fufeiuanze[key].check(false);
                }
            }
        }
        
        //根据type切换显示
        var t = this.node.getChildByName("zuidafanshu");
        var j = 0;
        for(var i = 0; i < t.childrenCount; ++i){
            var n = t.children[i].getComponent("RadioButton");
            if(n != null){                
                if(diquType == 0){
                    if(j==3){
                        n.node.active = true;
                    }
                    else{
                        n.node.active = false;
                    }
                }
                else{
                    if(j==3){
                        n.node.active = false;
                    }
                    else{
                         n.node.active = true;
                    }
                }
                j++;
            }
        }
        //设置选择
        var zuidafanshu = 0;
        if (data.maxFan == 24) {
            zuidafanshu = 0;
        }else if (data.maxFan == 48) {
            zuidafanshu = 1;
        }else if (data.maxFan == 0) {
            zuidafanshu = 2;
        }else if (data.maxFan == 16) {
            zuidafanshu = 3;
        }
        for (const key in this._zuidafanshu) {
            if (this._zuidafanshu.hasOwnProperty(key)) {
                const element = this._zuidafanshu[key];
                if (key == zuidafanshu) {
                    this._zuidafanshu[key].check(true);
                }else{
                    this._zuidafanshu[key].check(false);
                }
            }
        }
        
        if (data.bbh == 1) {
            this._wanfaxuanze[0].check(true);
            this._wanfaxuanze[1].check(false);
        }else{
            this._wanfaxuanze[0].check(false);
            this._wanfaxuanze[1].check(true);
        }

        if (data.hengfan == 1) {
            this._hengfanxuanze[0].check(true);
        }else{
            this._hengfanxuanze[0].check(false);
        }

        var jushuxuanze = 0;
        if (data.maxGames == 4) {
            jushuxuanze = 0;
        }else if (data.maxGames == 8) {
            jushuxuanze = 1;
        }else if (data.maxGames == 16) {
            jushuxuanze = 2;
        }

        for (const key in this._jushuxuanze) {
            if (this._jushuxuanze.hasOwnProperty(key)) {
                const element = this._jushuxuanze[key];
                if (key == jushuxuanze) {
                    this._jushuxuanze[key].check(true);
                }else{
                    this._jushuxuanze[key].check(false);
                }
            }
        }

        this.setIsClubSetJieMian(false);
    },

    refreshClubPanel:function() {
        this._leixingxuanze = [];
        var t = this.node.getChildByName("leixingxuanze");
        for(var i = 0; i < t.childrenCount; ++i){
            var n = t.children[i].getComponent("RadioButton");
            if(n != null){
                this._leixingxuanze.push(n);
                n.check(false);
            }
        }
        this._leixingxuanze[0].check(true);

        this._fufeiuanze = [];
        var fufei = 0;
        var t = this.node.getChildByName("xuanzefanshi");
        for(var i = 0; i < t.childrenCount; ++i){
            var n = t.children[i].getComponent("RadioButton");
            if(n != null){
                this._fufeiuanze.push(n);
                n.check(false);
            }
        }
        this._fufeiuanze[0].check(true);

        this._difenxuanze = [];
        var t = this.node.getChildByName("difenxuanze");
        for(var i = 0; i < t.childrenCount; ++i){
            var n = t.children[i].getComponent("RadioButton");
            if(n != null){
                this._difenxuanze.push(n);
            }
        }
        
        this._zimo = [];
        var t = this.node.getChildByName("zimojiacheng");
        for(var i = 0; i < t.childrenCount; ++i){
            var n = t.children[i].getComponent("RadioButton");
            if(n != null){
                this._zimo.push(n);
            }
        }
        //cc.log3.debug(this._zimo);
        
        this._hengfanxuanze=[];
        var t = this.node.getChildByName("henfangxuanze");
        for(var i = 0; i < t.childrenCount; ++i){
            var n = t.children[i].getComponent("CheckBox");
            if(n != null){
                this._hengfanxuanze.push(n);
            }
        }
        //cc.log3.debug(this._hengfanxuanze);

        this._wanfaxuanze = [];
        var t = this.node.getChildByName("wanfaxuanze");
        for(var i = 0; i < t.childrenCount; ++i){
            var n = t.children[i].getComponent("RadioButton");
            if(n != null){
                this._wanfaxuanze.push(n);
            }
        }

        var type = 0;
        if(type == 0){
            this._wanfaxuanze[0].check(false);
            this._wanfaxuanze[1].check(true);
        }
        else{
            this._wanfaxuanze[0].check(true);
            this._wanfaxuanze[1].check(false);
        }

        //cc.log3.debug(this._wanfaxuanze);

        //used
        this._zuidafanshu = [];
        var t = this.node.getChildByName("zuidafanshu");
        var j = 0;
        for(var i = 0; i < t.childrenCount; ++i){
            var n = t.children[i].getComponent("RadioButton");
            if(n != null){                
                if(type == 0){
                    if(j==3){
                        n.node.active = true;
                        n.check(true);
                    }
                    else{
                        n.node.active = false;
                        n.check(false);
                    }
                }
                else{
                    if(j==3){
                        n.node.active = false;
                        n.check(false);
                    }
                    else{
                         n.node.active = true;
                         if(j==0){
                             n.check(true);
                         }
                         else{
                             n.check(false);
                         }
                    }
                }

                j++;
                this._zuidafanshu.push(n);
            }
        }
        //cc.log3.debug(this._zuidafanshu);
        
        this._jushuxuanze = [];
        var t = this.node.getChildByName("xuanzejushu");
        for(var i = 0; i < t.childrenCount; ++i){
            var n = t.children[i].getComponent("RadioButton");
            if(n != null){
                this._jushuxuanze.push(n);
                var titleContAA = null;
                var titleContFZ = null;
                
                var title = t.children[i].getChildByName("title").getComponent(cc.Label);
                
                if(i == 1){
                    titleContAA = "4局(钻石x1)";
                    titleContFZ = "4局(钻石x4)";
                }
                else if(i == 2){
                    titleContAA = "8局(钻石x2)";
                    titleContFZ = "8局(钻石x8)";
                }
                else if(i == 3){
                    titleContAA = "16局(钻石x4)";
                    titleContFZ = "16局(钻石x16)";
                }
                //AA制
                if(fufei == 0){
                    title.string = titleContAA;
                }
                else{
                    title.string = titleContFZ;
                }
            }            
        }
        
        var jushuxuanze = 0;
        for(var i = 0; i < this._jushuxuanze.length; ++i){
            this._jushuxuanze[i].check(false);
        }
        this._jushuxuanze[0].check(true);

        var payinfo = this.node.getChildByName("bg").getChildByName("payinfo").getComponent(cc.Label);
        var payinfoCont = null;
        //AA制
        if(fufei == 0){
            payinfoCont = "每人会消耗";
            if(jushuxuanze == 0){
                payinfoCont = payinfoCont +"1";
            }
            else if(jushuxuanze == 1){
                payinfoCont = payinfoCont +"2";
            }
            else{
                payinfoCont = payinfoCont +"4";
            }
        }
        else{
            payinfoCont = "亲友群会消耗";
            if(jushuxuanze == 0){
                payinfoCont = payinfoCont +"4";
            }
            else if(jushuxuanze == 1){
                payinfoCont = payinfoCont +"8";
            }
            else{
                payinfoCont = payinfoCont +"16";
            }
        }
        payinfoCont = payinfoCont +"颗钻石";
        payinfo.string = payinfoCont;


        this._dianganghua = [];
        var t = this.node.getChildByName("dianganghua");
        for(var i = 0; i < t.childrenCount; ++i){
            var n = t.children[i].getComponent("RadioButton");
            if(n != null){
                this._dianganghua.push(n);
            }
        }
        //cc.log3.debug(this._jushuxuanze);

        if (this._isClubSetJieMian) {
            this.setJieMian()
        }
    },

    onEnable:function() {
        //俱乐部的界面刷新
        if (this.isClubPanel && !this._isfirst) {
            this.refreshClubPanel();
            return;
        }

        this._isfirst = false;
    },
    
    onBtnBack:function(){
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        this.node.active = false;
    },
    
    onBtnOK:function(){
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        this.node.active = false;
        this.createRoom();
    },

    onBtnSaveClubRoomInfo:function(event, createOrSave){
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        this.node.active = false;
        this.refreshClubRoomInfo(createOrSave);
    },
    
    onBtnXuanze:function(){
        var fufei = 0;
        for(var i = 0; i < this._fufeiuanze.length; ++i){
            if(this._fufeiuanze[i].checked){
                fufei =  i;
                break;
            }
        }

        var jushuxuanze = 0;
        for(var i = 0; i < this._jushuxuanze.length; ++i){
            if(this._jushuxuanze[i].checked){
                jushuxuanze = i;
                break;
            }
        }

        var t = this.node.getChildByName("xuanzejushu");
        for(var i = 0; i < t.childrenCount; ++i){
            var n = t.children[i].getComponent("RadioButton");
            if(n != null){
                var titleContAA = null;
                var titleContFZ = null;
                var title = t.children[i].getChildByName("title").getComponent(cc.Label);
                
                if(i == 1){
                    titleContAA = "4局(钻石x1)";
                    titleContFZ = "4局(钻石x4)";
                }
                else if(i == 2){
                    titleContAA = "8局(钻石x2)";
                    titleContFZ = "8局(钻石x8)";
                }
                else if(i == 3){
                    titleContAA = "16局(钻石x4)";
                    titleContFZ = "16局(钻石x16)";
                }
                //AA制
                if(fufei == 0){
                    title.string = titleContAA;
                }
                else{
                    title.string = titleContFZ;
                }
            }            
        }

        var payinfo = this.node.getChildByName("bg").getChildByName("payinfo").getComponent(cc.Label);
        var payinfoCont = null;
        //AA制
        if(fufei == 0){
            payinfoCont = "每人会消耗";
            if(jushuxuanze == 0){
                payinfoCont = payinfoCont +"1";
            }
            else if(jushuxuanze == 1){
                payinfoCont = payinfoCont +"2";
            }
            else{
                payinfoCont = payinfoCont +"4";
            }
        }
        else{
            if (this.isClubPanel) {
                payinfoCont = "亲友群会消耗";
            }else{
                payinfoCont = "房主会消耗";
            }
            
            if(jushuxuanze == 0){
                payinfoCont = payinfoCont +"4";
            }
            else if(jushuxuanze == 1){
                payinfoCont = payinfoCont +"8";
            }
            else{
                payinfoCont = payinfoCont +"16";
            }
        }
        payinfoCont = payinfoCont +"颗钻石";
        payinfo.string = payinfoCont;
    },

    onBtnleiXingXuanZe:function(){
        var type = 0;
        for(var i = 0; i < this._leixingxuanze.length; ++i){
            if(this._leixingxuanze[i].checked){
                type = i;
                break;
            }     
        }
        
        this._zuidafanshu = [];
        var t = this.node.getChildByName("zuidafanshu");
        var j = 0;
        for(var i = 0; i < t.childrenCount; ++i){
            var n = t.children[i].getComponent("RadioButton");
            if(n != null){                
                if(type == 0){
                    if(j==3){
                        n.node.active = true;
                        n.check(true);
                    }
                    else{
                        n.node.active = false;
                        n.check(false);
                    }
                }
                else{
                    if(j==3){
                        n.node.active = false;
                        n.check(false);
                    }
                    else{
                         n.node.active = true;
                         if(j==0){
                             n.check(true);
                         }
                         else{
                             n.check(false);
                         }
                    }
                }

                j++;
                this._zuidafanshu.push(n);
            }
        }

        if(type == 0){
            this._wanfaxuanze[0].check(false);
            this._wanfaxuanze[1].check(true);
        }
        else{
            this._wanfaxuanze[0].check(true);
            this._wanfaxuanze[1].check(false);
        }

        var WFInfo ={
            version:this._version,
            diqu:type,
        };

        cc.sys.localStorage.setItem('WFInfo', JSON.stringify(WFInfo));
    },

    createRoomCallBack:function(ret){
        // ret.errcode = 999;
        if(ret.errcode == 999){
            cc.vv.wc.hide();
            cc.vv.alert.show("版本过旧","您的游戏版本过旧，现在将自动更新至最新版本后继续游戏！",function(){
                // cc.director.loadScene("update");
                cc.game.restart();
            },false);
            return;
        }

        if(ret.errcode !== 0){
            cc.vv.wc.hide();
            //cc.log3.debug(ret.errmsg);
            if(ret.errcode == 2222 || ret.errcode == 7){
                cc.vv.alert.show("提示","钻石不足，创建房间失败!是否进入商城购买？",function(){
                    cc.vv.hall.getComponent('Shop').onBtnShopClicked();
                },true);  
            }
            else{
                cc.vv.tip.show(ret.errmsg);
            }
        }
        else{
            cc.vv.ip_check = true;
            cc.vv.gameNetMgr.connectGameServer(ret);
        }
    },

    //普通创房
    createRoom:function(){
        var self = this;
        
        var difen = 0;
        var zimo = 0;
        var huansanzhang = 0;
        var jiangdui  = 0;
        var menqing   = 0;
        var tiandihu  = 1;

        /*
        var chipai   = self._wanfaxuanze[0].checked;
        var huapai   = self._wanfaxuanze[1].checked;
        var jiang258 = self._wanfaxuanze[2].checked;
        var bukao13  = self._wanfaxuanze[3].checked;
        var dui7     =  self._wanfaxuanze[4].checked;
        var baohu    =  self._wanfaxuanze[5].checked;
        var sfyg     =  self._wanfaxuanze[6].checked;
        */
        var chipai   = 1;
        var huapai   = 0;
        var jiang258 = 0;
        var bukao13  = 0;
        var dui7     = 0;
        var baohu    = 0;
        var sfyg     = 0;

        var hengfan  = self._hengfanxuanze[0].checked;

        var zuidafanshu = 0;
        for(var i = 0; i < self._zuidafanshu.length; ++i){
            if(self._zuidafanshu[i].checked){
                zuidafanshu = i;
                break;
            }     
        }

        var jushuxuanze = 0;
        for(var i = 0; i < self._jushuxuanze.length; ++i){
            if(self._jushuxuanze[i].checked){
                jushuxuanze = i;
                break;
            }     
        }
        
        var fufeixuanzhe = 0;
        for(var i = 0; i < self._fufeiuanze.length; ++i){
            if(self._fufeiuanze[i].checked){
                fufeixuanzhe = i;
                break;
            }
        }

        var dianganghua = 0;
        /*
        for(var i = 0; i < self._dianganghua.length; ++i){
            if(self._dianganghua[i].checked){
                dianganghua = i;
                break;
            }     
        }
        */

        var type = 0;
        for(var i = 0; i < this._leixingxuanze.length; ++i){
            if(this._leixingxuanze[i].checked){
                type = i;
                break;
            }
        }

        switch(type){
            case 0:
                cc.log3.debug("桐乡麻将");
                type = "txmj";                
                break;
            case 1:
                cc.log3.debug("洲泉麻将");
                type = "zqmj";               
                break;
            case 2:
                cc.log3.debug("崇福麻将");
                type = "cfmj"
                break;                
        }

        var bbh = 0;
        if(this._wanfaxuanze[0].checked){
            bbh = 1;
        }
        else{
            bbh = 0;
        }

        cc.log3.debug("get the type ="+type);
        var conf = {
            type:type,
            difen:difen,
            zimo:zimo,
            jiangdui:jiangdui,
            huansanzhang:huansanzhang,
            zuidafanshu:zuidafanshu,
            jushuxuanze:jushuxuanze,
            dianganghua:dianganghua,
            menqing:menqing,
            tiandihu:tiandihu,
            chipai:chipai,
            huapai:huapai,
            jiang258:jiang258,
            bukao13:bukao13,
            dui7:dui7,
            baohu:baohu,
            sfyg:sfyg,
            bbh:bbh,
            hengfan:hengfan,
            paytype:fufeixuanzhe
        }; 
        
        var data = {
            account:cc.vv.userMgr.account,
            version:cc.PROTOCOL_VERSION,
            sign:cc.vv.userMgr.sign,
            location:cc.vv.g3Plugin.getLocation(),
            conf:JSON.stringify(conf),
            locationDes:cc.vv.g3Plugin.getLocationDes()
        };
        cc.log3.debug(data);
        cc.vv.wc.show("正在创建房间");
        cc.vv.http.sendRequest("/create_private_room",data,self.createRoomCallBack);   
    },

    //俱乐部创建房间或者保存默认开房间数据 createOrSave 1 创建 2 保存
    refreshClubRoomInfo:function(createOrSave){
        var self = this;
        var difen = 0;
        var zimo = 0;
        var huansanzhang = 0;
        var jiangdui  = 0;
        var menqing   = 0;
        var tiandihu  = 1;

        /*
        var chipai   = self._wanfaxuanze[0].checked;
        var huapai   = self._wanfaxuanze[1].checked;
        var jiang258 = self._wanfaxuanze[2].checked;
        var bukao13  = self._wanfaxuanze[3].checked;
        var dui7     =  self._wanfaxuanze[4].checked;
        var baohu    =  self._wanfaxuanze[5].checked;
        var sfyg     =  self._wanfaxuanze[6].checked;
        */
        var chipai   = 1;
        var huapai   = 0;
        var jiang258 = 0;
        var bukao13  = 0;
        var dui7     = 0;
        var baohu    = 0;
        var sfyg     = 0;

        var hengfan  = self._hengfanxuanze[0].checked;

        var zuidafanshu = 0;
        for(var i = 0; i < self._zuidafanshu.length; ++i){
            if(self._zuidafanshu[i].checked){
                zuidafanshu = i;
                break;
            }     
        }

        var jushuxuanze = 0;
        for(var i = 0; i < self._jushuxuanze.length; ++i){
            if(self._jushuxuanze[i].checked){
                jushuxuanze = i;
                break;
            }     
        }
        
        var fufeixuanzhe = 0;
        for(var i = 0; i < self._fufeiuanze.length; ++i){
            if(self._fufeiuanze[i].checked){
                fufeixuanzhe = i;
                break;
            }
        }

        var fplay = 0;//0不免费 1免费
        var cost = 0;
        if (jushuxuanze == 0) {
            cost = 1;
        }
        if (jushuxuanze == 1) {
            cost = 2;
        }
        if (jushuxuanze == 2) {
            cost = 4;
        }
        //0表示aa 1表示俱乐部支付 这里转化成服务器对应的值
        if (fufeixuanzhe == 0) {
            fplay = 0;
            fufeixuanzhe = 0;
        }else if(fufeixuanzhe == 1){
            fplay = 1
            fufeixuanzhe = 1;
            cost = cost * 4;
        }
        
        if (zuidafanshu == 2) {
            cost = cost * 2;
        }


        var dianganghua = 0;
        /*
        for(var i = 0; i < self._dianganghua.length; ++i){
            if(self._dianganghua[i].checked){
                dianganghua = i;
                break;
            }     
        }
        */

        var type = 0;
        for(var i = 0; i < this._leixingxuanze.length; ++i){
            if(this._leixingxuanze[i].checked){
                type = i;
                break;
            }
        }

        switch(type){
            case 0:
                cc.log3.debug("桐乡麻将");
                type = "txmj";                
                break;
            case 1:
                cc.log3.debug("洲泉麻将");
                type = "zqmj";               
                break;
            case 2:
                cc.log3.debug("崇福麻将");
                type = "cfmj"
                break;                
        }

        var bbh = 0;
        if(this._wanfaxuanze[0].checked){
            bbh = 1;
        }
        else{
            bbh = 0;
        }

        var maxGames = 0;
        if (jushuxuanze == 0) {
            maxGames = 4;
        }
        if (jushuxuanze == 1) {
            maxGames = 8;
        }
        if (jushuxuanze == 2) {
            maxGames = 16;
        }

        
        var maxFan = 0;
        if (zuidafanshu == 0) {
            maxFan = 24;
        }
        if (zuidafanshu == 1) {
            maxFan = 48;
        }
        if (zuidafanshu == 2) {
            maxFan = 0;
        }
        if (zuidafanshu == 3) {
            maxFan = 16;
        }

        cc.log3.debug("get the type ="+type);
        //paytype 0 aa制
        var conf = {
            type:type,
            fplay:fplay,
            baseScore:1,
            difen:difen,
            zimo:zimo,
            jiangdui:jiangdui,
            huansanzhang:huansanzhang,
            zuidafanshu:zuidafanshu,
            jushuxuanze:jushuxuanze,
            hsz:huansanzhang,
            dianganghua:dianganghua,
            menqing:menqing,
            tiandihu:tiandihu,
            chipai:chipai,
            huapai:huapai,
            jiang258:jiang258,
            bukao13:bukao13,
            dui7:dui7,
            baohu:baohu,
            sfyg:sfyg,
            bbh:bbh,
            hengfan:hengfan,
            paytype:fufeixuanzhe,
            maxFan:maxFan,
            maxGames:maxGames,
            cost:cost,
            creator:cc.vv.userMgr.userid,
            clubid:cc.vv.clubMgr.selectedClubid
        };
        
        if (createOrSave == 2) {
            cc.vv.clubMgr.defaultClubConf = conf;
            cc.vv.clubMgr.sendDefaultTableInfo();
        }

        if (createOrSave == 1) {
            var data = {
                account:cc.vv.userMgr.account,
                version:cc.PROTOCOL_VERSION,
                sign:cc.vv.userMgr.sign,
                location:cc.vv.g3Plugin.getLocation(),
                conf:JSON.stringify(conf),
                locationDes:cc.vv.g3Plugin.getLocationDes()
            };
            cc.log(data);
            cc.vv.wc.show("正在创建房间");
            cc.vv.http.sendRequest("/create_private_room",data,self.createRoomCallBack);
        }
    },

    //默认开房
    onBtnDefaultRoom:function(params) {
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        var self = this;
        var conf = cc.vv.clubMgr.getDefaultTableInfo();
        if (!conf) {
            cc.vv.tip.show("没有默认的开房配置");
            return;
        }
        var data = {
            account:cc.vv.userMgr.account,
            version:cc.PROTOCOL_VERSION,
            sign:cc.vv.userMgr.sign,
            location:cc.vv.g3Plugin.getLocation(),
            conf:JSON.stringify(conf),
            locationDes:cc.vv.g3Plugin.getLocationDes()
        };
        cc.log(data);
        cc.vv.wc.show("正在创建房间");
        cc.vv.http.sendRequest("/create_private_room",data,self.createRoomCallBack);
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
