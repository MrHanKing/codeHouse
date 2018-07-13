var IOSPayMoney = [
            { "price": 6, "diamond": 12, "productid" : "pay10712"},
            { "price": 12, "diamond": 26, "productid" : "pay10726"},
            { "price": 40, "diamond": 108, "productid" : "pay107108"},
            { "price": 68, "diamond": 268, "productid" : "pay107268"},
            { "price": 118, "diamond": 528, "productid" : "pay107528"},
        ];

cc.Class({
    extends: cc.Component,

    properties: {
        ShopItemPrefab:{
            default:null,
            type:cc.Prefab,
        },
    
        // foo: {
        //    default: null,
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        zuanshitupian:{
            default:[],
            type:[cc.SpriteFrame]
        },
        _shop:null,
        _viewlist:null,
        _content:null,
        _viewitemTemp:null,
        _shopData:null,
        _curRoomInfo:null,
        _emptyTip:null,
    },

    // use this for initialization
    onLoad: function () {
        cc.log3.debug("load shop win!!!")
        this._shop = this.node.getChildByName("shop");
        this._shop.active = false;
        this.txt_bandding = this._shop.getChildByName("txt_banddingSpeak");
        
        
        this._viewlist = this._shop.getChildByName("shoplist");
        this._content = cc.find("view/content",this._viewlist);
        
        this._viewitemTemp = this._content.children[0];
        this._content.removeChild(this._viewitemTemp);

        var node = cc.find("Canvas/bottom_left/btn_shop"); 
        cc.log3.debug("btn_shop"+node);

        this.addClickEvent(node,this.node,"Shop","onBtnShopClicked");
        
        var node = cc.find("Canvas/shop/btn_back");  
        this.addClickEvent(node,this.node,"Shop","onBtnBackClicked");
    },
    
    addClickEvent:function(node,target,component,handler){
        var eventHandler = new cc.Component.EventHandler();
        eventHandler.target = target;
        eventHandler.component = component;
        eventHandler.handler = handler;

        var clickEvents = node.getComponent(cc.Button).clickEvents;
        clickEvents.push(eventHandler);
    },
    
    onBtnBackClicked:function(){
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        cc.vv.hall.refreshInfo();
        this._shop.active = false;  
    },
    
    onBtnShopClicked:function(){

        cc.vv.audioMgr.playSFX("ui_click.mp3");

        if(cc.sys.os == cc.sys.OS_ANDROID || cc.sys.os == cc.sys.OS_IOS){

            if(cc.sys.os == cc.sys.OS_ANDROID && cc.vv.userMgr.shop_open[0] != '1'){
                cc.vv.alert.show("提示",cc.vv.userMgr.shop_closed_info[0]);
                return;
            }

            if(cc.sys.os == cc.sys.OS_IOS && cc.vv.userMgr.shop_open[1] != '1'){
                cc.vv.alert.show("提示",cc.vv.userMgr.shop_closed_info[1]);
                return;
            }
        }

        cc.log3.debug("onBtnShopClicked");
        this._shop.active = true;
        var self = this;
        
        
        cc.vv.httpMgr.getGameStoreInfo(function(data){
            self._shopData = data;
            //审核状态 
            if(cc.sys.os == cc.sys.OS_IOS && cc.sys.app_store_review == 1){
                self.initIOSShopList();
            }else{
                self.initShopList(data);
            }
        });
    },
    
    initShopList:function(data){
        this.txt_bandding.active = cc.vv.userMgr.isBandding;
        for(var i = 0; i < data.length; ++i){
            //隐藏特惠
            if(cc.vv.userMgr.th_1 == 1 && data[i].id == 99){
                continue;
            }
            var node = this.getViewItem(i);
            node.idx = i;
            // cc.log3.debug("data.id:"+data[i].id);
            // cc.log3.debug("data.name:"+data[i].name);
            // cc.log3.debug("data.cash:"+data[i].cash);
            // cc.log3.debug("data.diamond:"+data[i].diamond);
            // cc.log3.debug("data.present:"+data[i].present);
            // cc.log3.debug("data.original_price:"+data[i].original_price);
            // cc.log3.debug("data.original_price:"+data[i].current_price);
            // cc.log3.debug("data.game_id:"+data[i].game_id);
            // cc.log3.debug("data.is_hot:"+data[i].is_hot);
            // cc.log3.debug("data.regulations_info:"+data[i].regulations_info);
            // cc.log3.debug("data.nullity:"+data[i].nullity);

            // var is_hot =  (data[i].is_hot == 1)?true:false;
            node.getChildByName("HotSaleImgic").active =  (data[i].is_hot == 1);
            // node.getChildByName("ThSaleImgic").active =  (data[i].is_hot == 2);
            node.getChildByName("ItemTitle").getComponent(cc.Label).string = data[i].name;

            var shopTip = node.getChildByName("ShopTipImg");
            shopTip.active = cc.vv.userMgr.isBandding;
            if(data[i].regulations_info == '' || data[i].regulations_info == '没有送哦'){
                shopTip.active = false;
            }else{
                shopTip.getChildByName("Shoptip").getComponent(cc.Label).string =  data[i].regulations_info;
            }

            node.getChildByName("OriginalPrice").active = false;
            node.getChildByName("OriginalPrice").getComponent(cc.Label).string = "原价：1钻=" + data[i].original_price/100 + "元";

            var diamondNum = 0;
            if (cc.vv.userMgr.isBandding) {
                diamondNum = data[i].diamond + data[i].present;
            }else{
                diamondNum = data[i].diamond;
            }

            node.getChildByName("CurrentPrice").active = false;
            node.getChildByName("CurrentPrice").getComponent(cc.Label).string = "现价：1钻=" + ((data[i].cash/100) / diamondNum).toFixed(2) + "元";

            node.getChildByName("Diamond").getComponent(cc.Sprite).spriteFrame = this.zuanshitupian[i];

            var btnOp = node.getChildByName("Button_ShopOk");
            btnOp.idx = data[i].id;
            btnOp.getChildByName("price").getComponent(cc.Label).string = data[i].cash/100 + "元";
        }

        this.shrinkContent(data.length);
        this._curRoomInfo = null;
        this._viewlist.getComponent(cc.ScrollView).scrollToLeft();
    },

    //苹果内购写死
    initIOSShopList:function() {
        
        this.txt_bandding.active = cc.vv.userMgr.isBandding;
        for(var i = 0; i < 5; ++i){

            var node = this.getViewItem(i);
            node.idx = i;

            node.getChildByName("HotSaleImgic").active = false;

            node.getChildByName("ItemTitle").getComponent(cc.Label).string = IOSPayMoney[i].diamond + "钻石";

            var shopTip = node.getChildByName("ShopTipImg");
            shopTip.active = false;
            
            node.getChildByName("OriginalPrice").active = false;

            node.getChildByName("CurrentPrice").getComponent(cc.Label).string = "现价：1钻=" + (IOSPayMoney[i].price/IOSPayMoney[i].diamond).toFixed(2) + "元";

            var btnOp = node.getChildByName("Button_ShopOk");
            btnOp.idx = i;
            btnOp.getChildByName("price").getComponent(cc.Label).string = IOSPayMoney[i].price + "元";
        }

        this.shrinkContent(5);
        this._curRoomInfo = null;
        this._viewlist.getComponent(cc.ScrollView).scrollToLeft();
    },
    
    
    getViewItem:function(index){
        var content = this._content;
        if(content.childrenCount > index){
            return content.children[index];
        }
        var node = cc.instantiate(this._viewitemTemp);
        content.addChild(node);
        return node;
    },

    shrinkContent:function(num){
        while(this._content.childrenCount > num){
            var lastOne = this._content.children[this._content.childrenCount -1];
            this._content.removeChild(lastOne,true);
        }
    },
   
    onBtnOpClicked:function(event){

        cc.vv.audioMgr.playSFX("ui_click.mp3");

        var idx = event.target.idx;
        
        //审核状态 cc.sys.os == cc.sys.OS_IOS && cc.sys.app_store_review == 1
        
        if(cc.sys.os == cc.sys.OS_IOS && cc.sys.app_store_review == 1){

            cc.vv.g3Plugin.payMoney(IOSPayMoney[idx].productid);

            return;
        }

        cc.vv.shop_index = idx;
        if(cc.vv.userMgr.pay_type_list.length == 1){
            cc.vv.hall.shopPay(cc.vv.userMgr.pay_type_list[0]);
        }else{

            var list = cc.vv.hall.payWin.getChildByName('list');

            var index = 0;
            if(cc.sys.os == cc.sys.OS_IOS){
                index = 3;
            }

            // var pay_type_list = cc.vv.userMgr.pay_type_list.split(',');
            var pay_type_list = cc.vv.userMgr.pay_type_list;

            for(var i=0;i<1;i++){
                list.getChildByName('btn_' + i).active = pay_type_list[index+i] !="0";
                list.getChildByName('btn_' + i).pay_data = i + 1;
            }

            cc.vv.hall.payWin.active = true;
        }        
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
