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
        bgmVolume:1.0,
        sfxVolume:1.0,
        dialect:'difang',
        bgmAudioID:-1, 
    },

    // use this for initialization
    init: function () {
        var t = cc.sys.localStorage.getItem("bgmVolume");
        if(t != null){
            this.bgmVolume = parseFloat(t);    
        }
        
        var t = cc.sys.localStorage.getItem("sfxVolume");
        if(t != null){
            this.sfxVolume = parseFloat(t);    
        }

        var t = cc.sys.localStorage.getItem("dialect");
        if(t != null){
            this.dialect = t;
        }
        
        cc.game.on(cc.game.EVENT_HIDE, function () {
            cc.log3.debug("cc.audioEngine.pauseAll");
            cc.audioEngine.pauseAll();
        });
        cc.game.on(cc.game.EVENT_SHOW, function () {
            cc.log3.debug("cc.audioEngine.resumeAll");
            cc.audioEngine.resumeAll();
        });
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
    
    getUrl:function(url){
        return cc.url.raw("resources/sounds/" + url);
    },
    
    playBGM(url){
        var audioUrl = this.getUrl(url);
        cc.log3.debug(audioUrl);
        if(this.bgmAudioID >= 0){
            cc.audioEngine.stop(this.bgmAudioID);
        }
        this.bgmAudioID = cc.audioEngine.play(audioUrl,true,this.bgmVolume);
    },
    
    playSFX(url){
        var audioUrl = this.getUrl(url);
        if(this.sfxVolume > 0){
            var audioId = cc.audioEngine.play(audioUrl,false,this.sfxVolume);   
            return audioId; 
        }else{
            return -1;
        }
    },

    stopSFX(audioId){
        if(this.sfxVolume > 0 && audioId != -1 && audioId != null){
            cc.audioEngine.stop(audioId);
        }
    },

    playDialect(url,sex){

        if(sex != 1)sex =2;

        var audioUrl = this.getUrl(this.dialect + "_" + sex + "/" + url);
        if(this.sfxVolume > 0){
            var audioId = cc.audioEngine.play(audioUrl,false,this.sfxVolume);    
        }
    },
    
    setSFXVolume:function(v){
        if(this.sfxVolume != v){
            cc.sys.localStorage.setItem("sfxVolume",v);
            this.sfxVolume = v;
        }
    },
    
    setBGMVolume:function(v,force){
        if(this.bgmAudioID >= 0){
            if(v > 0){
                cc.audioEngine.resume(this.bgmAudioID);
            }
            else{
                cc.audioEngine.pause(this.bgmAudioID);
            }
            //cc.audioEngine.setVolume(this.bgmAudioID,this.bgmVolume);
        }
        if(this.bgmVolume != v || force){
            cc.sys.localStorage.setItem("bgmVolume",v);
            this.bgmVolume = v;
            cc.audioEngine.setVolume(this.bgmAudioID,v);
        }
    },
    
    pauseAll:function(){
        cc.audioEngine.pauseAll();
    },
    
    resumeAll:function(){
        cc.audioEngine.resumeAll();
    }
});
