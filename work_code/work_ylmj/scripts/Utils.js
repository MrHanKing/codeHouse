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
    },

    addClickEvent:function(node,target,component,handler){
        cc.log3.debug(component + ":" + handler);
        var eventHandler = new cc.Component.EventHandler();
        eventHandler.target = target;
        eventHandler.component = component;
        eventHandler.handler = handler;

        var clickEvents = node.getComponent(cc.Button).clickEvents;
        clickEvents.push(eventHandler);
    },
    
    addSlideEvent:function(node,target,component,handler){
        var eventHandler = new cc.Component.EventHandler();
        eventHandler.target = target;
        eventHandler.component = component;
        eventHandler.handler = handler;

        var slideEvents = node.getComponent(cc.Slider).slideEvents;
        slideEvents.push(eventHandler);
    },

    addClickEventByParams:function(node, target, component, handler, Params){
        cc.log3.debug(component + ":" + handler);
        
        var eventHandler = new cc.Component.EventHandler();
        eventHandler.target = target;
        eventHandler.component = component;
        eventHandler.handler = handler
        eventHandler.customEventData = Params;

        var clickEvents = node.getComponent(cc.Button).clickEvents;
        clickEvents.push(eventHandler);
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },

    //
    //麻将部分工具
    getGameNameByType:function(type){
        var name;
        if(type == "txmj"){
            name = "桐乡麻将";
        }else if(type == "zqmj"){
            name = "洲泉麻将";
        }else if(type == "cfmj"){
            name = "崇福麻将";
        }
        return name;
    },

    getGameTypeDesByAttr:function(bbh){
        var typedes;
        if (bbh == 1) {
            typedes = "白板花麻将"
        }else{
            typedes = "翻花麻将"
        }
        return typedes;
    },

    getGameRuleDes:function(data, effectdes){
        if (effectdes) {
            effectdes.toString();
        }else{
            effectdes = " ";
        }

        var ruledex = "" + data.maxGames + "局";
        if(data.maxFan > 0){
            ruledex = ruledex + effectdes + data.maxFan + "片"
        }else{
            ruledex = ruledex + effectdes + "无封顶"
        }

        if(data.hengfan){
            ruledex = ruledex + effectdes + "横翻";
        }else{
            ruledex = ruledex + effectdes + "不横翻";
        }
        return ruledex;
    },

    getGameMaxFanDes:function(maxFan) {
        if(maxFan > 0){
            return maxFan + "片";
        }else{
            return "无封顶"
        }
    },

    getGameHengFan:function(hengfan) {
        if(hengfan){
            return "横翻计分";
        }else{
            return "横翻不计分";
        }
    },

    getGameFuFeiDes:function(fplay, clubid) {
        if (fplay == 0) {
            return "AA制支付";
        }

        if (fplay == 1) {
            if (Number(clubid) != 0) {
                return "亲友群支付";
            }else{
                return "房主支付"
            }
        }

        return "";
    },
});
