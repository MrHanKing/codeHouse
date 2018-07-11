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
        _userinfo:null,
        _userId:null,
    },

    // use this for initialization
    onLoad: function () {
        if(cc.vv == null){
            return;
        }
        
        this._userinfo = cc.find("Canvas/userinfo");
        this._userinfo.active = false;
        //this._zhadan  = this._userinfo.getChildByName("zhadan");
        //this._poshui  = this._userinfo.getChildByName("poshui");
        //this._zhuaji  = this._zhuaji.getChildByName("zhuaji");
        //this._xianhua = this._xianhua.getChildByName();
        cc.vv.utils.addClickEvent(this._userinfo,this.node,"UserInfoShow","onClicked");
        this._userId = null;

        //踢出成员按钮  俱乐部专用
        this.outClubManNode = this._userinfo.getChildByName("btn_kick");

        cc.vv.userinfoShow = this;
    },
    
    show:function(name,userId,iconSprite,sex,ip, location, clubManType){
        if(userId != null && userId > 0){
            this._userId = userId;
            this._userinfo.active = true;
            this._userinfo.getChildByName("icon").getComponent(cc.Sprite).spriteFrame = iconSprite.spriteFrame;
            this._userinfo.getChildByName("name").getComponent(cc.Label).string = name;
            this._userinfo.getChildByName("ip").getComponent(cc.Label).string = '';

            if (location) {
                if (this._userinfo.getChildByName("location")) {
                    this._userinfo.getChildByName("location").getComponent(cc.Label).string = (location == "old") ? "未知地址" : location;
                }
            }else{
                if (this._userinfo.getChildByName("location")) {
                    if (cc.vv.g3Plugin && cc.vv.g3Plugin.getLocation) {
                        this._userinfo.getChildByName("location").getComponent(cc.Label).string = cc.vv.g3Plugin.getLocationDes();
                    }else{
                        this._userinfo.getChildByName("location").getComponent(cc.Label).string = "未知地址";
                    }
                }
            }
            
            if(ip != null){
                this._userinfo.getChildByName("ip").getComponent(cc.Label).string = "IP: " + ip.replace("::ffff:","");
            }
            
            this._userinfo.getChildByName("id").getComponent(cc.Label).string = "ID: " + userId;
            var sex_female = this._userinfo.getChildByName("sex_female");
            sex_female.active = false;
            
            var sex_male = this._userinfo.getChildByName("sex_male");
            sex_male.active = false;
            
            if(sex == 1){
                sex_male.active = true;
            }   
            else if(sex == 2){
                sex_female.active = true;
            }

            if (this.outClubManNode) {
                if (clubManType == 2) {
                    this.outClubManNode.active = false;
                    return;
                }else{
                    this.outClubManNode.active = true;
                }
                this.outClubManNode.getComponent(cc.Button).clickEvents = [];
                cc.vv.utils.addClickEventByParams(this.outClubManNode, this.node, "UserInfoShow", "onBtnOutClubMan", [userId]);
            }
        }
    },

    onBtnOutClubMan:function(event, customData) {
        this._userinfo.active = false;
        if (!customData[0]) {
            return;
        }
        cc.vv.clubMgr.sendClubKick(null, customData[0]);
    },
    
    onInteractClicked:function(event){
        cc.log3.debug(event.target.name);    
        
        if(cc.vv.userMgr.userId == this._userId){
            cc.vv.tip.show('不能送给自己哦~~');
            return;
        }   

        //互动频率限制
        if(cc.vv.userMgr.interactTime != undefined){
            var timestamp=new Date().getTime();
            if(timestamp - 30000 < cc.vv.userMgr.interactTime){
                cc.vv.tip.show('您发的太快了，歇一下吧~~');
                return;
            }
        }

        cc.vv.userMgr.interactTime = new Date().getTime();

        cc.vv.net.send("interact",{interactName:event.target.name,receiverId:this._userId});
        this._userinfo.active = false;
    },

    onClicked:function(){
        this._userId = null;
        this._userinfo.active = false;
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
