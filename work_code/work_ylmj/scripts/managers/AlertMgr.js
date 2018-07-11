// made by HanJun
// 2018-07-10

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
        _instancePanel:null,
        _prefabUrl:"prefabs/alert",
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    getInstance:function(params) {
        var self = this;
        if (this._instancePanel == null || !this._instancePanel.isValid) {
            var anode = cc.find("Canvas/alert");
            if (anode) {
                this._instancePanel = anode;
                return;
            }
            
            cc.loader.loadRes(this._prefabUrl, function(errorMessage,loadedResource){
                //检查资源加载
                if( errorMessage ) { cc.log( '载入预制资源失败, 原因:' + errorMessage ); return; }
                if( !( loadedResource instanceof cc.Prefab ) ) { cc.log( '你载入的不是预制资源!' ); return; } 
                //开始实例化预制资源
                self._instancePanel = cc.instantiate(loadedResource);

                var CanvasNode = cc.find("Canvas");
                //将预制资源添加到父节点
                CanvasNode.addChild(self._instancePanel);

                self.showPanel()
            });
        }
    },

    show:function(title,content,onok,needcancel) {
        this.title = title;
        this.content = content;
        this.onok = onok;
        this.needcancel = needcancel;
        this.getInstance();
        this.showPanel();
    },

    showPanel:function() {
        if (this._instancePanel == null || !this._instancePanel.isValid) {
            return;
        }

        this._instancePanel.getComponent("Alert").show(this.title, this.content, this.onok, this.needcancel);
    },

    onDestory:function(){
        if(this._instancePanel){
            this._instancePanel = null;
        }
    }
    // update (dt) {},
});
