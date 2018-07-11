cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        _btnYXOpen:null,
        _btnYXClose:null,
        _btnYYOpen:null,
        _btnYYClose:null,
        _btnDialectOpen:null,
        _btnDialectClose:null,
        _btnHuyan:null,
        _tbL:null,
        _tbR:null,
        _pL:null,
        _pR:null,
        
        _tbchose:null,
    },

    // use this for initialization
    onLoad: function () {
        if(cc.vv == null){
            return;
        }
                
        this._btnYXOpen = this.node.getChildByName("yinxiao").getChildByName("btn_yx_open");
        this._btnYXClose = this.node.getChildByName("yinxiao").getChildByName("btn_yx_close");
        
        this._btnYYOpen = this.node.getChildByName("yinyue").getChildByName("btn_yy_open");
        this._btnYYClose = this.node.getChildByName("yinyue").getChildByName("btn_yy_close");

        this.chose = this.node.getChildByName("chose");
        this._tbchose = this.node.getChildByName("chose").getChildByName("TB_chose").getComponent(cc.Sprite);

        this._tbL = this.node.getChildByName("chose").getChildByName("TB_L");
        this._tbR = this.node.getChildByName("chose").getChildByName("TB_R");
        this._pL  = this.node.getChildByName("chose").getChildByName("P_L");
        this._pR  = this.node.getChildByName("chose").getChildByName("P_R");
        this.PModel = this.node.getChildByName("PModel");
        if (this.PModel) {
            this.btn_3D = this.PModel.getChildByName("btn_3D");
            this.btn_2D = this.PModel.getChildByName("btn_2D");
        }
        
        this.initButtonHandler(this.node.getChildByName("btn_close"));
        this.initButtonHandler(this.node.getChildByName("btn_exit"));

        if(this.node.getChildByName("btn_update") != null){
            this.initButtonHandler(this.node.getChildByName("btn_update"));
        }
        
        this.initButtonHandler(this._btnYXOpen);
        this.initButtonHandler(this._btnYXClose);
        this.initButtonHandler(this._btnYYOpen);
        this.initButtonHandler(this._btnYYClose);
        
        this.initButtonHandler(this._tbL);
        this.initButtonHandler(this._tbR);
    
        this.initButtonHandler(this._pL);
        this.initButtonHandler(this._pR);

        this._tbList = [0,1,2];
        
        var slider = this.node.getChildByName("yinxiao").getChildByName("progress");
        cc.vv.utils.addSlideEvent(slider,this.node,"Settings","onSlided");
        
        var slider = this.node.getChildByName("yinyue").getChildByName("progress");
        cc.vv.utils.addSlideEvent(slider,this.node,"Settings","onSlided");

        if(this.node.getChildByName("playinfo") != null){
            this.node.getChildByName("playinfo").getChildByName("username").getComponent(cc.Label).string = cc.vv.userMgr.userName;
            this.node.getChildByName("playinfo").getChildByName("userid").getComponent(cc.Label).string = "ID: " +cc.vv.userMgr.userId;
        }

        if(this.node.getChildByName("dialect") != null){
            this._btnDialectOpen = this.node.getChildByName("dialect").getChildByName("btn_fy_open");
            this._btnDialectClose = this.node.getChildByName("dialect").getChildByName("btn_fy_close");
            
            this.initButtonHandler(this._btnDialectOpen);
            this.initButtonHandler(this._btnDialectClose);

            var dealect = cc.sys.localStorage.getItem("dialect");
            if(dealect == null)dealect = 'difang';
            
            this._btnDialectOpen.getComponent(cc.Toggle).isChecked  = (dealect == 'difang');
            this._btnDialectClose.getComponent(cc.Toggle).isChecked  = (dealect == 'putong');
        }

        if(this.node.getChildByName("btn_huyan") != null){
            this._btnHuyan = this.node.getChildByName("btn_huyan");
            this.initButtonHandler(this._btnHuyan);

            var huyan = cc.sys.localStorage.getItem("huyan");
            if(huyan == null)huyan = 0;
            
            this._btnHuyan.getComponent(cc.Toggle).isChecked  = huyan=='1';

            //默认显示颜色
            var tbId = cc.sys.localStorage.getItem("tbID");
            if(tbId != null){
                this._tbchose.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByTableId(this._tbList[tbId]);
            }
        }
 
        this.refreshVolume();
        this.refreshbtn();
    },

    // onEnable:function(params) {
    //     this.refreshbtn();
    // },
    
    onSlided:function(slider){
        if(slider.node.parent.name == "yinxiao"){
            cc.vv.audioMgr.setSFXVolume(slider.progress);
        }
        else if(slider.node.parent.name == "yinyue"){
            cc.vv.audioMgr.setBGMVolume(slider.progress);
        }
        this.refreshVolume();
    },
    
    initButtonHandler:function(btn){
        cc.vv.utils.addClickEvent(btn,this.node,"Settings","onBtnClicked");    
    },
    
    refreshbtn:function(){
        var changjing = cc.vv.gameNetMgr.getChangJingTypeName();
        // if (this.chose && changjing == "3D") {
        //     this.chose.active = false;
        // }

        if(changjing == "2D" && this.PModel){
            this.btn_2D.getComponent(cc.Toggle).check();
        }
        if(changjing == "3D" && this.PModel){
            this.btn_3D.getComponent(cc.Toggle).check();
        }
    },

    refreshVolume:function(){
        
        this._btnYXClose.active = cc.vv.audioMgr.sfxVolume > 0;
        this._btnYXOpen.active = !this._btnYXClose.active;
        
        var yx = this.node.getChildByName("yinxiao");
        var width = 268 * cc.vv.audioMgr.sfxVolume;
        var progress = yx.getChildByName("progress")
        progress.getComponent(cc.Slider).progress = cc.vv.audioMgr.sfxVolume;
        progress.getChildByName("progress").width = width;  
        //yx.getChildByName("btn_progress").x = progress.x + width;
        
        
        this._btnYYClose.active = cc.vv.audioMgr.bgmVolume > 0;
        this._btnYYOpen.active = !this._btnYYClose.active;
        var yy = this.node.getChildByName("yinyue");
        var width = 268 * cc.vv.audioMgr.bgmVolume;
        var progress = yy.getChildByName("progress");
        progress.getComponent(cc.Slider).progress = cc.vv.audioMgr.bgmVolume; 
        
        progress.getChildByName("progress").width = width;
        //yy.getChildByName("btn_progress").x = progress.x + width;

        // if(this._btnDialectOpen != null){
        //     var dealect = cc.sys.localStorage.getItem("dialect");
        //     if(dealect == null)dealect = 'putong';
            
        //     // this._btnDialectOpen.active = (dealect == 'putong');
        //     // this._btnDialectClose.active = (dealect == 'difang');
        // }
        
    },
    
    setTbBg:function(tbId){
        this._tbchose.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByTableId(this._tbList[tbId]);
        cc.sys.localStorage.setItem("tbID",tbId);

        for(var i = 0; i< this._tbList.length;i++){
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
            var type = null;
            var bbh = cc.vv.gameNetMgr.conf.bbh;
            
            if(bbh == 1){
                type = "txbbh";
            }else{
                type = "fanhuamj";
            }            
            
            titles.getChildByName(type).getComponent(cc.Sprite).spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByTitleId(bbh==1?true:false,tbId);

            titles.getChildByName(type).active = true;  
        }
    },

    onBtnClicked:function(event){

        cc.vv.audioMgr.playSFX("ui_click.mp3");
        
        if(event.target.name == "btn_close"){
            this.node.active = false;
        }
        else if(event.target.name == "btn_update"){

            // cc.vv.anysdkMgr.logout();

            cc.sys.localStorage.removeItem("wx_account");
            cc.sys.localStorage.removeItem("wx_sign");
            cc.director.loadScene("login");
                        
        }
        else if(event.target.name == "btn_exit"){
            cc.game.end();
        }
        else if(event.target.name == "btn_yx_open"){
            cc.vv.audioMgr.setSFXVolume(1.0);
            this.refreshVolume(); 
        }
        else if(event.target.name == "btn_yx_close"){
            cc.vv.audioMgr.setSFXVolume(0);
            this.refreshVolume();
        }
        else if(event.target.name == "btn_yy_open"){
            cc.vv.audioMgr.setBGMVolume(1);
            this.refreshVolume();
        }
        else if(event.target.name == "btn_yy_close"){
            cc.vv.audioMgr.setBGMVolume(0);
            this.refreshVolume();
        }else if(event.target.name == "btn_fy_open"){
            cc.vv.audioMgr.dialect = 'difang';
            cc.sys.localStorage.setItem("dialect",'difang');
            // this.refreshVolume();
        }
        else if(event.target.name == "btn_fy_close"){
            cc.vv.audioMgr.dialect = 'putong';
            cc.sys.localStorage.setItem("dialect",'putong');
            // this.refreshVolume();
        }else if(event.target.name == "btn_huyan"){
            var toggle = event.target.getComponent(cc.Toggle);
            var checked = !toggle.isChecked;
            cc.find("Canvas/bg/Z_backgroud_night").active = checked;
            cc.sys.localStorage.setItem("huyan",checked?'1':'0');

            var titles = cc.find("Canvas/typeTitle");
            for(var i = 0; i < titles.children.length; ++i){
                titles.children[i].active = false;
            }
            
            if(cc.vv.gameNetMgr.conf){
                var type = null;
                var bbh = cc.vv.gameNetMgr.conf.bbh;
                
                if(bbh == 1){
                    type = "txbbh";
                }else{
                    type = "fanhuamj";
                }
            

                if(checked){
                    type = type + "_night";
                }

                titles.getChildByName(type).active = true;   
            }
        }else if(event.target.name == "TB_L"){            
            var tbId = cc.sys.localStorage.getItem("tbID");
            if(tbId == null)
                tbId = 0;
            
            tbId--
            if(tbId < 0){
                tbId = 0;
            }
            if(tbId >= this._tbList.length){
                tbId = this._tbList.length -1;
            }
            this.setTbBg(tbId);

        }else if(event.target.name == "TB_R"){
            var tbId = cc.sys.localStorage.getItem("tbID");
            if(tbId == null)
                tbId = 0;
            
            tbId++;
            if(tbId < 0){
                tbId = 0;
            }

            if(this._tbList.length == tbId){
                tbId = this._tbList.length-1;
            }            
            
            this.setTbBg(tbId);
        }else if(event.target.name == "P_L"){

        }else if(event.target.name == "P_R"){

        }
    },

    onToggle3DOr2D:function(event, customData){
        cc.log("onToggle3DOr2D");
        if ( !event.isChecked ) {
            return;
        }
        cc.vv.gameNetMgr.setGameSceneTo2DOr3D(customData);
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
