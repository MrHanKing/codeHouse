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
        _gameresult:null,
        _share:null,
        _seats:[],
    },

    dateFormat:function(){
        var date = new Date();
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

    // use this for initialization
    onLoad: function () {
        if(cc.vv == null){
            return;
        }
        
        this._gameresult = this.node.getChildByName("game_result");
        this._share = this.node.getChildByName("share");
        //this._gameresult.active = false;

        this._gameresult.getChildByName("roomid").getComponent(cc.Label).string = cc.vv.gameNetMgr.roomId;
        this._gameresult.getChildByName("time").getComponent(cc.Label).string = this.dateFormat();

        var seats = this._gameresult.getChildByName("seats");
        for(var i = 0; i < seats.children.length; ++i){
            this._seats.push(seats.children[i].getComponent("Seat"));   
        }
        
        var btnClose = cc.find("Canvas/game_result/btnClose");
        if(btnClose){
            cc.vv.utils.addClickEvent(btnClose,this.node,"GameResult","onBtnCloseClicked");
        }
        
        var btnShare = cc.find("Canvas/game_result/btnShare");
        if(btnShare){
            cc.vv.utils.addClickEvent(btnShare,this.node,"GameResult","onAllBtnClicked");
        }

        var btnShareClose = cc.find("Canvas/share/btn_back");
        if(btnShareClose){
            cc.vv.utils.addClickEvent(btnShareClose,this.node,"GameResult","onAllBtnClicked");
        }

        var btnShareHaoyou = cc.find("Canvas/share/btn_share2haoyou");
        if(btnShareHaoyou){
            cc.vv.utils.addClickEvent(btnShareHaoyou,this.node,"GameResult","onAllBtnClicked");
        }

        var btnShareQuan = cc.find("Canvas/share/btn_share2quan");
        if(btnShareQuan){
            cc.vv.utils.addClickEvent(btnShareQuan,this.node,"GameResult","onAllBtnClicked");
        }
        
        //初始化网络事件监听器
        var self = this;
        this.node.on('game_end',function(data){self.onGameEnd(data.detail);});
    },
    
    showResult:function(seat,info,isZuiJiaPaoShou){
        seat.node.getChildByName("zuijiapaoshou").active = isZuiJiaPaoShou;
        
        seat.node.getChildByName("zimocishu").getComponent(cc.Label).string = info.numzimo;
        seat.node.getChildByName("jiepaocishu").getComponent(cc.Label).string = info.numjiepao;
        seat.node.getChildByName("dianpaocishu").getComponent(cc.Label).string = info.numdianpao;
        seat.node.getChildByName("angangcishu").getComponent(cc.Label).string = info.numangang;
        seat.node.getChildByName("minggangcishu").getComponent(cc.Label).string = info.numminggang;
        seat.node.getChildByName("chajiaocishu").getComponent(cc.Label).string = info.numchadajiao;
    },
    
    onGameEnd:function(endinfo){
        var seats = cc.vv.gameNetMgr.seats;
        var maxscore = -1;
        var maxdianpao = 0;
        var dianpaogaoshou = -1;
        for(var i = 0; i < seats.length; ++i){
            var seat = seats[i];
            if(seat.score > maxscore){
                maxscore = seat.score;
            }
            if(endinfo[i].numdianpao > maxdianpao){
                maxdianpao = endinfo[i].numdianpao;
                dianpaogaoshou = i;
            }
        }
        
        for(var i = 0; i < seats.length; ++i){
            var seat = seats[i];
            var isBigwin = false;
            if(seat.score > 0){
                isBigwin = seat.score == maxscore;
            }
            this._seats[i].setInfo(seat.name,seat.score, isBigwin);
            this._seats[i].setID(seat.userid);
            var isZuiJiaPaoShou = dianpaogaoshou == i;
            this.showResult(this._seats[i],endinfo[i],isZuiJiaPaoShou);
        }
    },
    
    onBtnCloseClicked:function(){
        cc.vv.gameNetMgr.gameGoToHallOrClub();
    },
    
    onAllBtnClicked:function(event){
        
        cc.vv.share_url = 'http://game.futuregame.cc/share/wtqp/' + cc.vv.userMgr.dealer_code;
        var self = this;

        //分享结果
        var shareCallback = function(code,msg,type){
            // cc.log3.debug("分享回调:" + code);
            switch ( code ) {
                    // case anysdk.ShareResultCode.kShareSuccess:{
                    case 0:{
    
                        var onGet = function(ret){
                            cc.vv.alert.show("提示",ret.errmsg);
                        };
                        
                        var data = {
                            account:cc.vv.userMgr.account,
                            sign:cc.vv.userMgr.sign,
                            type:type,
                            local:2
                        };

                        cc.vv.http.sendRequest("/share_success",data,onGet.bind(this));
                    }
                    break;
                default:
                    cc.vv.alert.show("提示",'分享失败，不能获得奖励哦~');
                    break;
            }
        }
        
        if(event.target.name == "btn_back"){
            this._share.active = false;
        }else if(event.target.name == "btnShare"){
            this._share.active = true;
        }else if(event.target.name == "btn_share2haoyou"){
            //朋友圈
            this._share.active = false;
            cc.vv.anysdkMgr.shareResult(1,shareCallback);
        }else if(event.target.name == "btn_share2quan"){
            //朋友圈
            this._share.active = false;
            cc.vv.anysdkMgr.shareResult(2,shareCallback);
        }
    }
});
