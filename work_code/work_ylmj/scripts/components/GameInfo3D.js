//made by hanjun
//time 2018-07-05

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
        enjoyRoomSp: {
            // ATTRIBUTES:
            default: null,
            type: cc.SpriteFrame,
        },
        createRoomSp: {
            // ATTRIBUTES:
            default: null,
            type: cc.SpriteFrame,
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {

        this.txt_game = this.node.getChildByName("t_game").getComponent(cc.Label);
        this.txt_jushu = this.node.getChildByName("t_jushu").getComponent(cc.Label);
        this.txt_wanfa = this.node.getChildByName("t_wanfa").getComponent(cc.Label);
        this.txt_fengding = this.node.getChildByName("t_fengding").getComponent(cc.Label);
        this.txt_hengfan = this.node.getChildByName("t_hengfan").getComponent(cc.Label);
        this.txt_payInfo = this.node.getChildByName("t_pay").getComponent(cc.Label);
        this.btn_back = this.node.getChildByName("btn_back").getComponent(cc.Button);
        this.btn_joingame = this.node.getChildByName("btn_joingame").getComponent(cc.Button);

        this.btn_back.node.on('click', this.onBtnBack, this);
    },

    //infoData 房间信息
    //joinCallback 加入房间的回调函数 param 回调参数[]
    //isCreateRoom bool 创建房间？
    show(infoData, target, joinCallback, params, isCreateRoom, component, handler){
        
        if (!infoData) {
            cc.vv.tip.show("没有默认的开房配置");
            return;
        }

        this.node.active = true;
        this.btn_joingame.clickEvents = [];
        
        if (typeof(joinCallback) != "function") {
            this.btn_joingame.node.active = false;
        }else{
            this.btn_joingame.node.active = true;
            cc.vv.utils.addClickEvent(this.btn_joingame.node, target.node, component, handler);
        }

        this.btn_joingame.node.getComponent(cc.Sprite).spriteFrame = isCreateRoom ? this.createRoomSp : this.enjoyRoomSp;

        this.txt_game.string = cc.vv.utils.getGameNameByType(infoData.type);
        this.txt_jushu.string = infoData.maxGames + "局";
        this.txt_wanfa.string = cc.vv.utils.getGameTypeDesByAttr(infoData.bbh);
        this.txt_fengding.string = cc.vv.utils.getGameMaxFanDes(infoData.maxFan);
        this.txt_hengfan.string = cc.vv.utils.getGameHengFan(infoData.hengfan);
        this.txt_payInfo.string = cc.vv.utils.getGameFuFeiDes(infoData.paytype, infoData.clubid);
    },

    onBtnBack:function(params) {
        this.node.active = false;
    },

    // update (dt) {},
});
