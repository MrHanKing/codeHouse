// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.clubToggle = this.node.getChildByName("ClubToggle");
        this.clubContent = this.node.getChildByName("ClubContent");
        this.clubContent_create = this.clubContent.getChildByName("ClubCreate");
        this.clubContent_join = this.clubContent.getChildByName("ClubJoin");

        this.createInfo = this.clubContent_create.getChildByName("CreateInfo");
        this.createDetail = this.clubContent_create.getChildByName("CreateDetail");

        this.clubname = this.createDetail.getChildByName("editbox_clubname");

        this.agreeCreate = false;

        this.clubToggle.getChildByName("toggle2").getComponent(cc.Toggle).check();
    },

    start () {
        this.refreshTitle();
    },

    // update (dt) {},
    onToggleCreateClub:function(data) {
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        cc.log("onToggleCreateClub");
        this.toggleCommon(data, 1);
    },

    onToggleJoinClub:function(data) {
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        cc.log("onToggleJoinClub");
        this.toggleCommon(data, 2);
    },

    toggleCommon:function(data, type){
        //type 1 创建俱乐部 , 2加入俱乐部
        if ( !data.isChecked ) {
            return;
        }
        this.refreshTitle(data);
        this.hideAllManage();
        if(type == 1){
            this.clubContent_create.active = true;
            this.refreshCreateClub();
        }

        if(type == 2){
            this.clubContent_join.active = true;
        }
    },

    refreshCreateClub:function(){
        if(this.agreeCreate){
            this.createInfo.active = false;
            this.createDetail.active = true;
        }else{
            this.createInfo.active = true;
            this.createDetail.active = false;
        }
    },

    refreshTitle:function() {
        for (var idx = 0; idx < this.clubToggle.childrenCount; idx++) {
            if(this.clubToggle.children[idx].getComponent(cc.Toggle).isChecked){
                this.clubToggle.children[idx].getChildByName("title").color = cc.Color.WHITE;
                this.clubToggle.children[idx].getChildByName("title").getComponent(cc.LabelOutline).enabled = true;
            }else{
                this.clubToggle.children[idx].getChildByName("title").color = new cc.Color(94, 109, 1, 255);
                this.clubToggle.children[idx].getChildByName("title").getComponent(cc.LabelOutline).enabled = false;
            }
        }
    },

    hideAllManage:function(){
        var childnum = this.clubContent.childrenCount;
        var childs = this.clubContent.children
        for (var idx = 0; idx < childnum; idx++) {
            childs[idx].active = false;
        }
    },

    onBtnCreatClub:function(){
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        var name = this.clubname.getComponent(cc.EditBox).string;
        cc.vv.clubMgr.creatClub(name, this.node);
    },

    onBtnAgreeCreate:function() {
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        this.agreeCreate = true;
        this.refreshCreateClub();
    },

    onBtnClose:function() {
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        this.node.active = false;
    }
});
