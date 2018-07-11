cc.Class({
    extends: cc.Component,

    properties: {

    },

    initMgr:function() {
        this._clocks = {};
        cc.director.getScheduler().schedule(this.update, this, 0.5, false);
    },

    addNewClock:function(name, runtime) {
        if (this._clocks[name]) {
            return;
        }else{
            this._clocks[name] = runtime;
        }
    },

    update:function(dt) {
        for (const key in this._clocks) {
            if (this._clocks[key] && typeof(this._clocks[key]) == "number"){
                if (this._clocks[key] > 0) {
                    this._clocks[key] = this._clocks[key] - dt;
                }
            }
        }
    },

    getClockTime:function(name) {
        if (this._clocks[name]) {
            return this._clocks[name] >= 0 ? this._clocks[name] : 0;
        }else{
            return 0;
        }
    },

    resetClock:function(name, time) {
        if (typeof(time) != "number") {
            cc.log("error input resetClock time");
            return;
        }
        this._clocks[name] = time;
    },
});