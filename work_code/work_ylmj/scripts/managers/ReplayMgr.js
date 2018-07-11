var ACTION_CHUPAI = 1;
var ACTION_MOPAI  = 2;
var ACTION_PENG   = 3;
var ACTION_GANG   = 4;
var ACTION_HU     = 5;
var ACTION_ZIMO   = 6;
var ACTION_CHI    = 7;
var ACTION_BUHUA  = 8;

var ACTION_ANGANE   = 9;
var ACTION_DIANGANE = 10;
var ACTION_WANGGANE = 11;

var ACTION_ANGAME_SFYG     = 12;
var ACTION_DIANGANE_SFYG   = 13;
var ACTION_WANGGANE_SFYG   = 14;


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
        _lastAction:null,
        _actionRecords:null,
        _currentIndex:0,
    },

    // use this for initialization
    onLoad: function () {

    },
    
    clear:function(){
        this._lastAction = null;
        this._actionRecords = null;
        this._currentIndex = 0;
    },
    
    init:function(data){
        this._actionRecords = data.action_records;
        if(this._actionRecords == null){
            this._actionRecords = {};
        }
        this._currentIndex = 0;
        this._lastAction = null;
    },
    
    isReplay:function(){
        return this._actionRecords != null;    
    },
    
    getNextAction:function(){
        if(this._currentIndex >= this._actionRecords.length){
            return null;
        }
        
        var si = this._actionRecords[this._currentIndex++];
        var action = this._actionRecords[this._currentIndex++];
        var pai = this._actionRecords[this._currentIndex++];
        var actPai =this._actionRecords[this._currentIndex++];
        return {si:si,type:action,pai:pai,actPai:actPai};
    },
    
    takeAction:function(){
        var action = this.getNextAction();
        if(this._lastAction != null && (this._lastAction.type == ACTION_CHUPAI || this._lastAction.type ==ACTION_BUHUA )){
            if(action != null && action.type != ACTION_PENG && action.type != ACTION_GANG && action.type != ACTION_HU && action.type != ACTION_CHI){
                cc.vv.gameNetMgr.doGuo(this._lastAction.si,this._lastAction.pai);
            }
        }
        this._lastAction = action;
        if(action == null){
            return -1;
        }
        var nextActionDelay = 1.0;
        if(action.type == ACTION_CHUPAI){
            //cc.log3.debug("chupai");
            cc.vv.gameNetMgr.doChupai(action.si,action.pai);
            return 1.0;
        }
        else if(action.type == ACTION_MOPAI){
            //cc.log3.debug("mopai");
            cc.vv.gameNetMgr.doMopai(action.si,action.pai);
            cc.vv.gameNetMgr.doTurnChange(action.si);
            return 0.5;
        }
        else if(action.type == ACTION_PENG){
            //cc.log3.debug("peng");
            cc.vv.gameNetMgr.doPeng(action.si,action.actPai);
            cc.vv.gameNetMgr.doTurnChange(action.si);
            return 1.0;
        }
        else if(action.type == ACTION_ANGANE||action.type ==ACTION_DIANGANE || action.type == ACTION_WANGGANE
        || action.type == ACTION_ANGAME_SFYG||action.type ==ACTION_DIANGANE_SFYG || action.type == ACTION_WANGGANE_SFYG){
            //cc.log3.debug("gang");

            cc.vv.gameNetMgr.dispatchEvent('hangang_notify',action.si);
            cc.vv.gameNetMgr.doGang(action.si,action.pai,action.actPai,action.type);
            cc.vv.gameNetMgr.doTurnChange(action.si);
            return 1.0;
        }
        else if(action.type == ACTION_HU){
            //cc.log3.debug("hu");
            cc.vv.gameNetMgr.doHu({seatindex:action.si,hupai:action.pai,iszimo:false});
            return 1.5;
        }
        else if(action.type == ACTION_ZIMO)
        {
            cc.vv.gameNetMgr.doHu({seatindex:action.si,hupai:action.pai,iszimo:true});
            return 1.5;
        }
        else if(action.type ==  ACTION_CHI)
        {
            cc.vv.gameNetMgr.doChi(action.si,action.pai,action.actPai);
            return 1.0;
        }
        else if(action.type == ACTION_BUHUA)
        {
            cc.vv.gameNetMgr.doBuhua(action.si,action.pai,0);
            return 1.0;
        }
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
