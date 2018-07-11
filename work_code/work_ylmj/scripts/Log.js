var Log = cc.Class({
    extends: cc.Component,
    statics: {
        _log:false,
        _error:true,
        _debug:false,
        _info:true,

        log:function(message){
            if(this._log){
                console.log(message);
            }
        },

        error:function(message){
            if(this._error){
                console.log(message);
            }
        },

        debug:function(message){
            if(this._debug){
                console.log(message);
            }
        },

        info:function(message){
            if(this._info){
                console.log(message);
            }
        }
    }
});
