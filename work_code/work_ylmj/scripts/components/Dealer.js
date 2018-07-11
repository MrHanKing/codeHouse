cc.Class({
    extends: cc.Component,

    properties: {
        _getcode:null,
        _phonenum:null,
        _confirm_input:null,
        _pass_input:null,
        _passconfirm_input:null,
        _btn_dlsq:null,
        _btn_shenhe:null,
        _btn_rukou:null,
        _btn_sq:null,
        _Layout_info:null,
        _Layout_sqinput:null,
        _Layout_shenhe:null,
        _Layout_zhengshi:null,
        _btn_yaoqing:null,
        _wait:0,
    },

    // use this for initialization
    onLoad: function () {
        if(cc.vv == null){
            return;
        }
        this.initView();
    },
    
    initView:function(){
        this._Layout_sqinput = this.node.getChildByName("Layout_sqinput");
        this._Layout_shenhe = this.node.getChildByName("Layout_shenhe");
        this._Layout_zhengshi = this.node.getChildByName("Layout_zhengshi");
        this._Layout_info = this.node.getChildByName("Layout_info");
        this._btn_rukou = this.node.getChildByName("btn_rukou");
        this._btn_shenhe = this.node.getChildByName("btn_shenhe");
        this._btn_sq =  this._Layout_info.getChildByName("btn_sq");
        this._btn_dlsq =  this._Layout_sqinput.getChildByName("btn_dlsq");
        this._btn_yaoqing =  this.node.getChildByName("btn_yaoqing");
        this._getcode =  this._Layout_sqinput.getChildByName("getcode");
        this._phonenum =  this._Layout_sqinput.getChildByName("phonenum");
        this._confirm_input =  this._Layout_sqinput.getChildByName("confirm_input");
        this._pass_input =  this._Layout_sqinput.getChildByName("pass_input");
        this._passconfirm_input =  this._Layout_sqinput.getChildByName("passconfirm_input");

        cc.vv.utils.addClickEvent(this._btn_rukou,this.node,"Dealer","onBtnClicked");
        cc.vv.utils.addClickEvent(this._btn_shenhe,this.node,"Dealer","onBtnClicked");
        cc.vv.utils.addClickEvent(this._btn_sq,this.node,"Dealer","onBtnClicked");
        cc.vv.utils.addClickEvent(this._btn_dlsq,this.node,"Dealer","onBtnClicked");
        cc.vv.utils.addClickEvent(this._getcode,this.node,"Dealer","onBtnClicked");
        cc.vv.utils.addClickEvent(this._btn_yaoqing,this.node,"Dealer","onBtnClicked");

        this.node.getChildByName("name").getComponent(cc.Label).string = cc.vv.userMgr.userName;
        this.node.getChildByName("id").getComponent(cc.Label).string = "ID: " +cc.vv.userMgr.userId;

        this._Layout_info.active = true;
        this._Layout_sqinput.active = false;

        cc.vv.dealer = this;
    },

    showStatus:function(){
        switch(cc.vv.userMgr.dealer_status){
            case 0:{
                this._btn_sq.active = true;
                this.showDealerCode(false);
                this.showDealerError('');
            }
            break;
            //完全封死
            case -1:{
                this._btn_sq.active = false;
                this.showDealerCode(false);
                this.showDealerError('您的代理资格已取消');
            }
            break;
            //代理资格取消
            case 3:{
                this._Layout_sqinput.active = false;
                this._Layout_info.active = false;
                this._btn_rukou.active = true;
                // this._btn_yaoqing.active = true;
                this._Layout_zhengshi.active = true;
                this.showDealerCode(false);
                this.showDealerError('您的代理资格已冻结');
            }
            break;
            case 1:{
                this._Layout_sqinput.active = false;
                this._Layout_info.active = false;
                this._btn_rukou.active = true;
                this._btn_yaoqing.active = true;
                this._Layout_zhengshi.active = true;
                this.showDealerCode(true);
                this.showDealerError('');
            }
            break;
            //审核中
            case 2:{
                this._Layout_sqinput.active = false;
                this._Layout_info.active = false;
                this._btn_shenhe.active = true;
                this._btn_yaoqing.active = true;
                this._Layout_shenhe.active = true;
                this.showDealerCode(true);
                this.showDealerError('');
            }
            break;
        }
    },

    showDealerCode:function(show){
        
        this.node.getChildByName("code").active = show;

        if(show){
            this.node.getChildByName("code").getChildByName("label").getComponent(cc.Label).string = cc.vv.userMgr.dealer_code;
        }
    },

    showDealerError:function(msg){
        this.node.getChildByName("error").active = true;
        this.node.getChildByName("error").getComponent(cc.Label).string = msg;
    },

    onBtnClicked:function(event){

        var self = this;
        cc.vv.audioMgr.playSFX("ui_click.mp3");

        switch(event.target.name){
            case "btn_yaoqing":{
                this.node.active = false;
                cc.vv.hall.share_type = '1';
                cc.vv.hall.sharedWin.active = true;
            }   
            break;
            case "btn_shenhe":{
                cc.vv.alert.show("提示","您的代理申请正在审核中，请耐心等待");
            }   
            break;
            case "btn_rukou":{
                cc.sys.openURL("http://dealer.futuregame.cc/wtqp.php");
            }   
            break;
            case "btn_sq":{
                this._Layout_info.active = false;
                this._Layout_sqinput.active = true;
            }   
            break;
            case "btn_dlsq":{
                var onGet = function (ret) {
                    if(ret.errcode != 0)
                    {
                        cc.vv.alert.show("提示",ret.errmsg);
                    }
                    else
                    {
                        this._Layout_sqinput.active = false
                        // this._Layout_info.active = true;
                        this._Layout_shenhe.active = true;
                        this._btn_sq.active = false;
                        this._btn_shenhe.active = true;
                        this._btn_yaoqing.active = true;
                        

                        cc.vv.userMgr.dealer_code = cc.vv.userMgr.userId;
                        cc.vv.userMgr.dealer_status = 2;
                        this.showDealerCode(true);
                        cc.vv.alert.show("提示",ret.errmsg);
                    }
                };

                var mobile  = this._phonenum.getComponent(cc.EditBox).string;
                var identifying_code  = this._confirm_input.getComponent(cc.EditBox).string;
                var password  = this._pass_input.getComponent(cc.EditBox).string;

                if(!mobile){
                    cc.vv.alert.show("提示",'请输入手机号');
                    return;
                }

                if(!identifying_code){
                    cc.vv.alert.show("提示",'请输入验证码');
                    return;
                }

                if(!password){
                    cc.vv.alert.show("提示",'请输入密码');
                    return;
                }

                var data = {
                    account:cc.vv.userMgr.account,
                    userid:cc.vv.userMgr.userId,
                    sign:cc.vv.userMgr.sign,
                    name:cc.vv.userMgr.userName,
                    mobile:mobile,
                    identifying_code:identifying_code,
                    password:password
                };

                cc.vv.http.sendRequest("/register_dealer", data, onGet.bind(this));
            }   
            break;
            case "getcode":{

                if(self._wait > 0)return;

                var onGet = function (ret) {
                    if(ret.errcode != 0)
                    {
                        cc.vv.alert.show("提示",ret.errmsg);
                    }
                    else
                    {
                        self._wait = 60;
                        this._getcode.getChildByName("Label").getComponent(cc.Label).string = self._wait;
                        self._getcode.interactable = false;
                    }
                };

                var mobile  = this._phonenum.getComponent(cc.EditBox).string;
                if(!mobile){
                    cc.vv.alert.show("提示",'请输入手机号');
                    return;
                }

                var data = {
                    account:cc.vv.userMgr.account,
                    sign:cc.vv.userMgr.sign,
                    mobile:mobile
                };

                cc.vv.http.sendRequest("/get_identifying_code", data, onGet.bind(this));
            }   
            break;
        }
    },

  // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if(this._wait > 0){
            this._wait -= dt;
            var t = Math.ceil(this._wait);
            this._getcode.getChildByName("Label").getComponent(cc.Label).string = t; 
        }

        if(this._wait <0 && this._wait > -5){
            this._wait = -99;
            this._getcode.getChildByName("Label").getComponent(cc.Label).string = "获取验证码";
            this._getcode.interactable = true;
        }
    },
});
""