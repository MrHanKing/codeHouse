var Buffer = require('buffer').Buffer;
cc.Class({
    extends: cc.Component,

    properties: {
        HistoryItemPrefab:{
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
        _history:null,
        _viewlist:null,
        _detaillist:null,
        _content:null,
        _detail_content:null,
        _viewitemTemp:null,
        _ditailitemTemp:null,
        _historyData:null,
        _curRoomInfo:null,
        _emptyTip:null,
        _oneClick:true,
    },

    // use this for initialization
    onLoad: function () {
        this._history = this.node.getChildByName("history");
        this._history.active = false;
        
        this._emptyTip = this._history.getChildByName("emptyTip");
        this._emptyTip.active = true;
        
        this._viewlist = this._history.getChildByName("viewlist");
        this._content = cc.find("view/content",this._viewlist);

        this._viewitemTemp = this._content.children[0];
        this._content.removeChild(this._viewitemTemp);

        this._detaillist = this._history.getChildByName("detaillist");
        this._detail_content = cc.find("view/content",this._detaillist);
        
        this._ditailitemTemp = this._detail_content.children[0];
        this._detail_content.removeChild(this._ditailitemTemp);

        this._oneClick = true;

        // var node = cc.find("Canvas/bottom_left/btn_history"); 
        // cc.log3.debug("btn_history"+node);
        // this.addClickEvent(node,this.node,"History","onBtnHistoryClicked");
        
        // var node = cc.find("Canvas/history/btn_back");  
        // this.addClickEvent(node,this.node,"History","onBtnBackClicked");

        // var node = cc.find("Canvas/history/btn_viewHistory"); 
        // this.addClickEvent(node,this.node,"History","OnBtnReviewClicked");

        // var node = cc.find("Canvas/history/review/bind_ok"); 
        // this.addClickEvent(node,this.node,"History","OnBtnReviewOkClicked");

        
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
        if(this._curRoomInfo == null){
            this._historyData = null;
            this._history.active = false;    
        }
        else{
            this.initRoomHistoryList(this._historyData);  
            
            this._viewlist.active = true;      
            this._detaillist.active = false;   
        }
    },
    
    onBtnHistoryClicked:function(){

        cc.vv.audioMgr.playSFX("ui_click.mp3");

        this._history.active = true;
        var self = this;
        cc.vv.userMgr.getHistoryList(function(data){
            data.sort(function(a,b){
                return a.time < b.time; 
            });
            self._historyData = data;
            for(var i = 0; i < data.length; ++i){
                for(var j = 0; j < 4; ++j){
                    var s = data[i].seats[j];
                    s.name = new Buffer(s.name,'base64').toString();
                }
            }
            self.initRoomHistoryList(data);
        });
    },
    
    dateFormat:function(time){
        var date = new Date(time);
        var datetime = "{0}-{1}-{2} {3}:{4}:{5}";
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        month = month >= 10? month : ("0"+month);
        var day = date.getDate();
        day = day >= 10? day : ("0"+day);
        var h = date.getHours();
        h = h >= 10? h : ("0"+h);
        var m = date.getMinutes();
        m = m >= 10? m : ("0"+m);
        var s = date.getSeconds();
        s = s >= 10? s : ("0"+s);
        datetime = datetime.format(year,month,day,h,m,s);
        return datetime;
    },
    
    initRoomHistoryList:function(data){
        for(var i = 0; i < data.length; ++i){
            var node = this.getViewItem(i);
            node.idx = i;
            node.getChildByName("roomNo").getComponent(cc.Label).string = "房间ID:" + data[i].id;
            var datetime = this.dateFormat(data[i].time * 1000);
            node.getChildByName("time").getComponent(cc.Label).string = "时间:" + datetime;
            
            for(var j = 0; j < 4; ++j){
                var s = data[i].seats[j];

                if(s.userid == cc.vv.userMgr.userId){
                    node.getChildByName("id" + j).color = cc.color(228, 0, 0);
                    node.getChildByName("name" + j).color = cc.color(228, 0, 0);
                    node.getChildByName("win" + j).color = cc.color(228, 0, 0);
                }
                
                node.getChildByName("id" + j).getComponent(cc.Label).string = "ID : " + s.userid;
                node.getChildByName("name" + j).getComponent(cc.Label).string = s.name;
                node.getChildByName("win" + j).getComponent(cc.Label).string = "积分 : " + s.score;
            }

            this.addClickEvent(node,this.node,"History","onViewItemClicked");
        }
        this._emptyTip.active = data.length == 0;
        this.shrinkContent(data.length);
        this._curRoomInfo = null;
    },
    
    initGameHistoryList:function(roomInfo,data){

        data.sort(function(a,b){
           return a.create_time < b.create_time; 
        });

        this._viewlist.active = false;
        this._detaillist.active = true;

        for(var i = 0; i < data.length; ++i){

            var node = this.getDetialViewItem(i);
            var idx = data.length - i - 1;
            node.idx = data[i].id;
            var no = "" + (idx + 1);

            node.getChildByName("no").getComponent(cc.Label).string = "第" + no + "局";

            var datetime = this.dateFormat(data[i].create_time * 1000);
            node.getChildByName("time").getComponent(cc.Label).string = datetime;

            var result = JSON.parse(data[i].result);
            for (var j = 0; j < result.length; j++) {
               
                node.getChildByName("userid" + j).getComponent(cc.Label).string = "得分:"+result[j];
            }

            for (var j = 0; j < 4; ++j) {
                var s = roomInfo.seats[j];
                //s.name = new Buffer(s.name, 'base64').toString();
                node.getChildByName("username"+j).getComponent(cc.Label).string =  "名字:"+s.name;
            }

            var btn_review = node.getChildByName("btn_review");
            this.addClickEvent(btn_review, this.node, "History", "onBtnOpClicked");

            var btn_share = node.getChildByName("btn_share");
            this.addClickEvent(btn_share, this.node, "History", "onBtnShareClicked");
        }
        this.shrinkDeailtContent(data.length);
        this._curRoomInfo = roomInfo;
        this._detaillist.getComponent(cc.ScrollView).scrollToLeft();  

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

    getDetialViewItem:function(index){
        var content = this._detail_content;
        if(content.childrenCount > index){
            return content.children[index];
        }
        var node = cc.instantiate(this._ditailitemTemp);
        content.addChild(node);
        return node;
    },

    shrinkContent:function(num){
        while(this._content.childrenCount > num){
            var lastOne = this._content.children[this._content.childrenCount -1];
            this._content.removeChild(lastOne,true);
        }
    },

    shrinkDeailtContent:function(num){
        while(this._detail_content.childrenCount > num){
            var lastOne = this._detail_content.children[this._detail_content.childrenCount -1];
            this._detail_content.removeChild(lastOne,true);
        }
    },
    
    getGameListOfRoom:function(idx){
        var self = this;
        var roomInfo = this._historyData[idx];        
        cc.vv.userMgr.getGamesOfRoom(roomInfo.uuid,function(data){
            if(data != null && data.length > 0){
                self.initGameHistoryList(roomInfo,data);
            }
        });
    },
    
    getDetailOfGame:function(idx,userid){

        if(!this._oneClick)return;
        this._oneClick = false;

        var self = this;
        cc.vv.userMgr.getDetailOfGame(idx,userid,function(data){

            self._oneClick = true;

            if(!data){
                cc.vv.alert.show("提示",'错误的回看码');
                return;
            }

            var roomInfo = JSON.parse(data.room_info);

            if(!data.room_info){
                cc.vv.alert.show("提示",'房间信息不完全,不能查看');
                return;
            }

            var isCheck = false;
            for (var j = 0; j < 4; ++j) {
                var s = roomInfo.seats[j];
                s.name = new Buffer(s.name, 'base64').toString();

                if(s.userid == userid)isCheck = true;
            }

            if(!isCheck){
                cc.vv.alert.show("提示",'错误的回看码');
                return;
            }
            
            if(self._curRoomInfo != null){
                roomInfo = self._curRoomInfo;
            }

            data.base_info = JSON.parse(data.base_info);
            data.action_records = JSON.parse(data.action_records);
            cc.vv.gameNetMgr.prepareReplay(roomInfo,data,userid);
            cc.vv.replayMgr.init(data);
            cc.vv.gameNetMgr.loadGameScene();
        });
    },
    
    onViewItemClicked:function(event){

        cc.vv.audioMgr.playSFX("ui_click.mp3");

        var idx = event.target.idx;
        cc.log3.debug(idx);
        if(this._curRoomInfo == null){
            this.getGameListOfRoom(idx);
        }
        else{
            this.getDetailOfGame(idx,cc.vv.userMgr.userId);      
        }
    },
    
    onBtnOpClicked:function(event){

        cc.vv.audioMgr.playSFX("ui_click.mp3");

        var idx = event.target.parent.idx;
        cc.log3.debug(idx);
        if(this._curRoomInfo == null){
            this.getGameListOfRoom(idx);
        }
        else{
            this.getDetailOfGame(idx,cc.vv.userMgr.userId);      
        }
    },

    OnBtnReviewClicked:function(event){

        cc.vv.audioMgr.playSFX("ui_click.mp3");
        var node = cc.find("Canvas/history/review");  

        if(event.target.name == "btn_viewHistory"){
            node.active = true;
        }   
        else if(event.target.name == "btn_back"){
            node.active = false;
        }
    },

    OnBtnReviewOkClicked:function(event){
        
        cc.vv.audioMgr.playSFX("ui_click.mp3");

        var node = cc.find("Canvas/history/review");  
        var code  = node.getChildByName("codeInput").getComponent(cc.EditBox).string;
        if(code)
        {
            var len = (code.length == 13)?7:6;
            this.getDetailOfGame(code.substring(0,len),code.substring(len)); 
        }else{
            cc.vv.alert.show("提示",'请输入回看码');
        }

    },

    onBtnShareClicked:function(event){
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        var idx = event.target.parent.idx;
        cc.vv.shareCtrl.hallToShowBattleReward(idx);
    },

});
