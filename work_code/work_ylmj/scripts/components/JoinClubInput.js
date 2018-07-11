cc.Class({
    extends: cc.Component,

    properties: {
        nums:{
            default:[],
            type:[cc.Label]
        },
        _inputIndex:0,
        // foo: {
        //    default: null,
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
    },

    // use this for initialization
    onLoad: function () {
        
    },
    
    onEnable:function(){
        this.onResetClicked();
    },
    
    onInputFinished:function(clubId){
        this.onResetClicked();
        cc.vv.alert.show("提示","您申请加入亲友群：" + clubId,function(){
            cc.vv.clubMgr.applyInAClub(clubId);
        },true);
    },
    
    onInput:function(num){
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        if(this._inputIndex >= this.nums.length){
            return;
        }
        this.nums[this._inputIndex].string = num;
        this._inputIndex += 1;
        
        if(this._inputIndex == this.nums.length){
            var roomId = this.parseRoomID();
            cc.log3.debug("ok:" + roomId);
            this.onInputFinished(roomId);
        }
    },
    
    onN0Clicked:function(){
        this.onInput(0);  
    },
    onN1Clicked:function(){
        this.onInput(1);  
    },
    onN2Clicked:function(){
        this.onInput(2);
    },
    onN3Clicked:function(){
        this.onInput(3);
    },
    onN4Clicked:function(){
        this.onInput(4);
    },
    onN5Clicked:function(){
        this.onInput(5);
    },
    onN6Clicked:function(){
        this.onInput(6);
    },
    onN7Clicked:function(){
        this.onInput(7);
    },
    onN8Clicked:function(){
        this.onInput(8);
    },
    onN9Clicked:function(){
        this.onInput(9);
    },
    onResetClicked:function(){
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        for(var i = 0; i < this.nums.length; ++i){
            this.nums[i].string = "";
        }
        this._inputIndex = 0;
    },
    onDelClicked:function(){
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        if(this._inputIndex > 0){
            this._inputIndex -= 1;
            this.nums[this._inputIndex].string = "";
        }
    },
    onCloseClicked:function(){
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        this.node.active = false;
    },
    
    parseRoomID:function(){
        var str = "";
        for(var i = 0; i < this.nums.length; ++i){
            str += this.nums[i].string;
        }
        return str;
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
