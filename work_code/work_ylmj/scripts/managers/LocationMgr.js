cc.Class({
    extends: cc.Component,

    properties: {
    },

    // use this for initialization
    init: function () {
    },
    
    location:function(){
        if(!cc.sys.isNative){
            return;
        }

        if(cc.sys.os == cc.sys.OS_ANDROID){
            return jsb.reflection.callStaticMethod("cc/futuregame/majiang/location/LocationMgr", "getLocation", "()Ljava/lang/String;");
        }
        else if(cc.sys.os == cc.sys.OS_IOS){
            jsb.reflection.callStaticMethod("VoiceSDK", "finishRecord");
        }
    },
});
