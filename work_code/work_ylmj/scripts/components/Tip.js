cc.Class({
    extends: cc.Component,

    properties: {
        _alert:null,
        _content:null,
    },

    // use this for initialization
    onLoad: function () {
        if(cc.vv == null){
            return;
        }
        this._alert = cc.find("Canvas/tip");
        this._content = cc.find("Canvas/tip/content").getComponent(cc.Label);

        this._alert.active = false;
        cc.vv.tip = this;
    },

    
    show:function(content){
        this._content.string = content;
        this._alert.active = true;
        this._alert.opacity = 0;
        this._alert.runAction(cc.sequence(
            cc.moveTo(0.2, cc.p(0, -150)),
            cc.spawn(cc.moveTo(0.2, cc.p(0, -120)), cc.fadeIn(0.2)),
            cc.delayTime(1),
            cc.spawn(cc.moveTo(0.2, cc.p(0, -90)), cc.fadeOut(0.2)),
        ));
    },
    
    onDestory:function(){
        if(cc.vv){
            cc.vv.tip = null;    
        }
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
