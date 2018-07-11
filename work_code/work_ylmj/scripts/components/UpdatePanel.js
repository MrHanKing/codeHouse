module.exports = cc.Class({
    extends: cc.Component,

    properties: {
        info: cc.Label,
        byteProgress: cc.ProgressBar,
        fileProgress: cc.ProgressBar,
        retryBtn: cc.Node
    },
    
    onLoad () {
    }
});
