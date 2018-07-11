var Buffer = require('buffer').Buffer;
cc.Class({
    extends: cc.Component,

    properties: {
        
        chartAltas:{
            default:null,
            type:cc.SpriteAtlas
        },
        moving:false,
        _ChartWin:null,
        _chartbtn:null,
        _hallad:null,
        _topbtn:null,

        _tip:null,
        _viewlistThb:null,
        _contentThb:null,
        _viewitemTempThb:null,        
        _selfItemThb:null,

        _viewlistJfb:null,
        _contentJfb:null,
        _viewitemTempJfb:null,        
        _selfItemJfb:null,

        _viewlistKjb:null,
        _contentKjb:null,
        _viewitemTempKjb:null,        
        _selfItemKjb:null,

        _RankType:1,
        _thbData:null,
        _mythbRank:null,
        _thbTip:null,
        _thbflag:null,

        _jfbData:null,
        _myjfRank:null,
        _jfbTip:null,
        _jfbflag:null,

        _kjbData:null,
        _mykjbRank:null,
        _kjbTip:null,
        _kjbflag:null,
    },

    // use this for initialization
    onLoad: function () {
        cc.log3.debug("load chart win!!!")
        this._ChartWin = this.node.getChildByName("chart");
        this._ChartWin.active = false;
        this._topbtn = this._ChartWin.getChildByName("topbtn");

        this._hallad =  this.node.getChildByName("hall_ad");

        this._tip   =  this._ChartWin.getChildByName("tip_label").getComponent(cc.Label);

        //thb
        this._viewlistThb = this._ChartWin.getChildByName("ViewlistThb");
        this._contentThb = cc.find("view/content",this._viewlistThb);
        this._viewitemTempThb = this._contentThb.children[0];
        this._contentThb.removeChild(this._viewitemTempThb);
        this._selfItemThb =  this._ChartWin.getChildByName("selfThb");
        this._viewlistThb.active = false;
        this._selfItemThb.active = false;

        //jfb
        this._viewlistJfb = this._ChartWin.getChildByName("ViewlistJfb");
        this._contentJfb = cc.find("view/content",this._viewlistJfb);
        this._viewitemTempJfb = this._contentJfb.children[0];
        this._contentJfb.removeChild(this._viewitemTempJfb);
        this._selfItemJfb =  this._ChartWin.getChildByName("selfJfb");
        this._viewlistJfb.active = false;
        this._selfItemJfb.active = false;

        //kjb
        this._viewlistKjb = this._ChartWin.getChildByName("ViewlistKjb");
        this._contentKjb = cc.find("view/content",this._viewlistKjb);
        this._viewitemTempKjb = this._contentKjb.children[0];
        this._contentKjb.removeChild(this._viewitemTempKjb);
        this._selfItemKjb =  this._ChartWin.getChildByName("selfKjb");
        this._viewlistKjb.active = false;
        this._selfItemKjb.active = false;

        var node = this._chartbtn = cc.find("Canvas/bottom_left/btn_chart"); 
        this.addClickEvent(node,this.node,"Chart","onBtnChartClicked");
        var node = cc.find("Canvas/chart/btn_back");  
        this.addClickEvent(node,this.node,"Chart","onBtnBackClicked");
    },
    
    addClickEvent:function(node,target,component,handler){
        var eventHandler = new cc.Component.EventHandler();
        eventHandler.target = target;
        eventHandler.component = component;
        eventHandler.handler = handler;

        var clickEvents = node.getComponent(cc.Button).clickEvents;
        clickEvents.push(eventHandler);
    },

    getSpriteFrameByPicTip:function(spriteFrameName){
        return this.chartAltas.getSpriteFrame(spriteFrameName);
    },

    onBtnBackClicked:function(){
        var self = this;
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        if(this.moving){
            return;
        }
        
        this._ChartWin.runAction(cc.sequence(cc.show(),cc.moveTo(0.3,cc.p(-600,0)),cc.hide(),cc.callFunc(function () {
                self._chartbtn.active = true;            
                // self._hallad.active   = true;
        }, this)));
    },
    
    onBtnChartClicked:function(){
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        cc.log3.debug("onBtnChartClicked");

        var self = this;
        
        this._chartbtn.active = false;
        this._hallad.active   = false;

        this._ChartWin.setPosition(cc.p(-600,0));
        this._ChartWin.active =  true;
        this.moving =  true;
        this._ChartWin.runAction(cc.sequence(cc.show(),cc.moveTo(0.3,cc.p(0,0)),cc.callFunc(function () {
            this.moving = false;
        }, this)));

        var rank_flag = null;
        if(this._RankType == 0){
            rank_flag =  this._thbflag;
        }
        else if(this._RankType == 1){
            rank_flag = this._jfbflag;
        }
        else if(this._RankType == 2){
            rank_flag = this._kjbflag;
        }

        if (this._RankType == 1) {
            cc.vv.userMgr.getNewRankList(2, rank_flag, function(rankType,rank_flag,rank_tip,MyRankInfo,data){
                self.getRankListCallback(rankType,rank_flag,rank_tip,MyRankInfo,data);
            });
        }else{
            cc.vv.userMgr.getRankList(this._RankType,rank_flag,function(rankType,rank_flag,rank_tip,MyRankInfo,data){
                self.getRankListCallback(rankType,rank_flag,rank_tip,MyRankInfo,data);
            });
        }
    },

    getRankListCallback:function(rankType,rank_flag,rank_tip,MyRankInfo,data){

        if(rankType == 0){
            this._selfItemThb.active = true;
            this._viewlistThb.active = true;
            this._tip.string = this._thbTip;
        }else if(rankType == 1){
            this._selfItemJfb.active = true;
            this._viewlistJfb.active = true;
            this._tip.string = this._jfbTip;
        }else if(rankType == 2){
            this._selfItemKjb.active = true;
            this._viewlistKjb.active = true;
            this._tip.string = this._kjbTip; 
        }

        if(rankType == 0){
            this._tip.string = rank_tip;
        }else if(rankType == 1){
            this._tip.string = rank_tip;
        }else if(rankType == 2){
            this._tip.string = rank_tip;
        }

        if(data != null){
            if(rankType == 0){
                this._thbData = data;
                this._mythbRank = MyRankInfo;
                this._thbTip = rank_tip;
                this._thbflag = rank_flag;
            }else if(rankType == 1){
                this._jfbData = data;
                this._myjfRank = MyRankInfo;
                this._jfbTip = rank_tip;
                this._jfbflag = rank_flag;
            }else if(rankType == 2){
                this._kjbData = data;
                this._mykjbRank = MyRankInfo;
                this._kjbTip =  rank_tip;
                this._kjbflag = rank_flag;
            }

            if(this._RankType == rankType){
                this.initRankList(this._RankType);
            }
        }
        

        var selfItem = null;
        var viewlist =  null;

        if(this._RankType == 0){
            selfItem = this._mythbRank;
            viewlist = this._thbData;
        }
        else if(this._RankType == 1){
            selfItem = this._myjfRank;
            viewlist = this._jfbData;
        }
        else if(this._RankType == 2){
            selfItem = this._mykjbRank;
            viewlist = this._kjbData;
        }

        if(selfItem == null){
            this._selfItemThb.active = false;
            this._selfItemJfb.active = false;
            this._selfItemKjb.active = false;
        }  

        if(viewlist == null){
            this._viewlistThb.active = false;
            this._viewlistJfb.active = false;
            this._viewlistKjb.active = false;
        }
    },

    initRankList:function(rankType){
        var picTagSpriteFrame =  null;   
        var myRankInfo = null;
        var data = null;
        var tip = null;
        var selfItem = null;
        var viewlist =  null;

        if(rankType == 0){
            picTagSpriteFrame = this.getSpriteFrameByPicTip("zuan");
            myRankInfo = this._mythbRank;
            data   = this._thbData;
            tip    =  this._thbTip;
            selfItem = this._selfItemThb;
            viewlist = this._viewlistThb;
        }
        else if(rankType == 1){
            picTagSpriteFrame =  this.getSpriteFrameByPicTip("coin");
            myRankInfo = this._myjfRank;
            data   = this._jfbData;
            tip    = this._jfbTip;
            selfItem = this._selfItemJfb;
            viewlist = this._viewlistJfb;
        }
        else if(rankType == 2){
            picTagSpriteFrame =  this.getSpriteFrameByPicTip("ju");
            myRankInfo = this._mykjbRank;
            data   = this._kjbData;
            tip    = this._kjbTip;
            selfItem = this._selfItemKjb;
            viewlist = this._viewlistKjb;
        }
        
        if(data == null){
            selfItem.active = false;
            viewlist.active = false;
            return;
        }

        this._tip.string = tip;

        if(rankType == 1){
            for(var i = 0; i < data.length; ++i){
                var node = this.getViewItem(i);
                node.idx = i;

                var index = i+1;
                if(i < 3){
                    node.getChildByName("top").getComponent(cc.Sprite).spriteFrame =  this.getSpriteFrameByPicTip("top_no"+index);
                }
                else{
                    node.getChildByName("top").getComponent(cc.Sprite).spriteFrame =  null;
                }

                node.getChildByName("paiwei").getComponent(cc.Label).string = index;

                //headimg
                if(data[i].role_id){
                    var imageLoader = node.getChildByName("head").getComponent("ImageLoader");
                    imageLoader.setUserID(data[i].role_id);
                }

                node.getChildByName("name").getComponent(cc.Label).string = new Buffer(data[i].role_name,'base64').toString();
                node.getChildByName("id").getComponent(cc.Label).string = data[i].role_id;
                node.getChildByName("picTag").active = null;
                node.getChildByName("score").getComponent(cc.Label).string = "胜率:" + data[i].wins;
            }
        }else{
            for(var i = 0; i < data.length; ++i){
                var node = this.getViewItem(i);
                node.idx = i;

                var index = i+1;
                if(i < 3){
                    node.getChildByName("top").getComponent(cc.Sprite).spriteFrame =  this.getSpriteFrameByPicTip("top_no"+index);
                }
                else{
                    node.getChildByName("top").getComponent(cc.Sprite).spriteFrame =  null;
                }

                node.getChildByName("paiwei").getComponent(cc.Label).string = index;

                //headimg
                if(data[i].headimg){
                    var imageLoader = node.getChildByName("head").getComponent("NetImageLoader");
                    imageLoader.setUserImg(data[i].headimg);
                }

                node.getChildByName("name").getComponent(cc.Label).string = new Buffer(data[i].name,'base64').toString();
                node.getChildByName("id").getComponent(cc.Label).string = data[i].userid;
                node.getChildByName("picTag").getComponent(cc.Sprite).spriteFrame = picTagSpriteFrame;
                node.getChildByName("score").getComponent(cc.Label).string = data[i].value;        
            }
        }

        this.shrinkContent(data.length);
        viewlist.getComponent(cc.ScrollView).scrollToLeft();  

        //self
        if (rankType == 1) {
            selfItem.active  = false;
            viewlist.active  = true;
            return;
        }

        var rankItem =  selfItem.getChildByName("rankItem");     
        rankItem.getChildByName("top").getComponent(cc.Sprite).spriteFrame =  null;   

        rankItem.getChildByName("paiwei").active   = false;
        rankItem.getChildByName("nopaiwei").active = false;

        if(myRankInfo.rank == 0){            
            rankItem.getChildByName("paiwei").active   = true;
            rankItem.getChildByName("paiwei").getComponent(cc.Label).string = "";
        }
        else{
            if(myRankInfo.rank < 4){
                rankItem.getChildByName("top").getComponent(cc.Sprite).spriteFrame =  this.getSpriteFrameByPicTip("top_no"+(myRankInfo.rank-1)); 
            }         
            
            if(myRankInfo.rank>100){
                rankItem.getChildByName("nopaiwei").active = true;
            }
            else{
                rankItem.getChildByName("paiwei").active   = true;
                rankItem.getChildByName("paiwei").getComponent(cc.Label).string = myRankInfo.rank;
            }
        }
        
        var imgLoader = rankItem.getChildByName("head").getComponent("ImageLoader");
        imgLoader.setUserID(cc.vv.userMgr.userId);

        rankItem.getChildByName("name").getComponent(cc.Label).string = cc.vv.userMgr.userName;
        rankItem.getChildByName("id").getComponent(cc.Label).string = cc.vv.userMgr.userId;
        rankItem.getChildByName("picTag").getComponent(cc.Sprite).spriteFrame = picTagSpriteFrame;
        rankItem.getChildByName("score").getComponent(cc.Label).string = myRankInfo.value;

        selfItem.active  = true;
        viewlist.active  = true;


    },
    
    
    getViewItem:function(index){
        var viewitemTemp =  null;
        var content = null;
        if(this._RankType == 0){
            content = this._contentThb;
            viewitemTemp =  this._viewitemTempThb;
        }
        else if(this._RankType == 1){
            content = this._contentJfb;
            viewitemTemp = this._viewitemTempJfb;
        }
        else if(this._RankType == 2){
            content = this._contentKjb;
            viewitemTemp = this._viewitemTempKjb;
        }
        
        if(content.childrenCount > index){
            return content.children[index];
        }
        var node = cc.instantiate(viewitemTemp);
        content.addChild(node);
        return node;
    },

    shrinkContent:function(num){
        var content = null;
        if(this._RankType == 0){
            content = this._contentThb;
        }
        else if(this._RankType == 1){
            content = this._contentJfb;
        }
        else if(this._RankType == 2){
            content = this._contentKjb;
        }

        while(content.childrenCount > num){
            var lastOne = content.children[content.childrenCount -1];
            content.removeChild(lastOne,true);
        }
    },
    
    onBtnRankTypeClicked:function(event){
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        var self = this;
        var touchRankType = 0;
        var rank_flag = null;
        if(event.target.name == "thb_btn"){
            touchRankType = 0;
            rank_flag =  this._thbflag;
            if(this._thbTip){
                this._tip.string = this._thbTip;
            }
        }
        else if(event.target.name == "jfb_btn"){
            touchRankType = 1;
            rank_flag = this._jfbflag;
            if(this._jfbTip){
                this._tip.string = this._jfbTip;
            }
        }
        else if(event.target.name == "kjb_btn"){
            touchRankType = 2;
            rank_flag = this._kjbflag;
            if(this._kjbTip){
                this._tip.string = this._kjbTip; 
            }
        }

        if(touchRankType == this._RankType){
            return;
        }

        if(this._RankType == 0){
            this._selfItemThb.active = false;
            this._viewlistThb.active = false;
        }
        else if(this._RankType == 1){
            this._selfItemJfb.active = false;
            this._viewlistJfb.active = false;
        }
        else if(this._RankType == 2){
            this._selfItemKjb.active = false;
            this._viewlistKjb.active = false;
        }



        var bbb=Math.abs(touchRankType-this._RankType);              
        var time =  bbb * 0.1;

        this._RankType = touchRankType;  

        if (this._RankType == 1) {
            cc.vv.userMgr.getNewRankList(2, rank_flag, function(rankType,rank_flag,rank_tip,MyRankInfo,data){
                self.getRankListCallback(rankType,rank_flag,rank_tip,MyRankInfo,data);
            });
        }else{
            cc.vv.userMgr.getRankList(this._RankType,rank_flag,function(rankType,rank_flag,rank_tip,MyRankInfo,data){
                self.getRankListCallback(rankType,rank_flag,rank_tip,MyRankInfo,data);
            });
        }

        this._topbtn.runAction(cc.sequence(cc.show(),cc.moveTo(time,cc.p(event.target.x,event.target.y)),cc.callFunc(function () {
            //self.initRankList(this._RankType);
        }, this)));  
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
