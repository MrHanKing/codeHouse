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
        target:cc.Node,
        sprite:cc.SpriteFrame,
        checkedSprite:cc.SpriteFrame,
        checked:false,
        groupId:-1,
        uncheckedColor:{
            default: new cc.Color(94, 109, 1, 255)
        },
        title:cc.Node,
    },

    // use this for initialization
    onLoad: function () {
        if(cc.vv == null){
            return;
        }
        if(cc.vv.radiogroupmgr == null){
            var RadioGroupMgr = require("RadioGroupMgr");
            cc.vv.radiogroupmgr = new RadioGroupMgr();
            cc.vv.radiogroupmgr.init();
        }
        cc.log3.debug(typeof(cc.vv.radiogroupmgr.add));
        cc.vv.radiogroupmgr.add(this);

        this.refresh();
    },
    
    refresh:function(){
        var targetSprite = this.target.getComponent(cc.Sprite);
        if(this.checked){
            targetSprite.spriteFrame = this.checkedSprite;
            if(this.title){
                this.title.color = cc.Color.WHITE;
                this.title.getComponent(cc.LabelOutline).enabled = true;
            }
        }
        else{
            targetSprite.spriteFrame = this.sprite;
            if(this.title){
                this.title.color = this.uncheckedColor;
                this.title.getComponent(cc.LabelOutline).enabled = false;
            }
        }
    },
    
    check:function(value){
        this.checked = value;
        this.refresh();
    },
    
    onClicked:function(){
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        cc.vv.radiogroupmgr.check(this);
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
    
    onDestroy:function(){
        if(cc.vv && cc.vv.radiogroupmgr){
            cc.vv.radiogroupmgr.del(this);            
        }
    }
});
