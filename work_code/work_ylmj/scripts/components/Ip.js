cc.Class({
    extends: cc.Component,

    properties: {
        _alert:null,
        _btnOK:null,
        _btnCannel:null,
        _content:null,
        _lastChatTime:-1,
    },

    // use this for initialization
    onLoad: function () {
        if(cc.vv == null){
            return;
        }
        this._alert = cc.find("Canvas/ip_notice");
        this._content = cc.find("Canvas/ip_notice/content").getComponent(cc.Label);
        
        this._btnOK = cc.find("Canvas/ip_notice/btn_ok");
        cc.vv.utils.addClickEvent(this._btnOK,this.node,"Ip","onBtnClicked");
        
        this._btnCannel = cc.find("Canvas/ip_notice/btn_sqjsfj");
        cc.vv.utils.addClickEvent(this._btnCannel,this.node,"Ip","onBtnClicked");

        this._alert.active = false;
        cc.vv.ip = this;
    },
    
    onBtnClicked:function(event){
        
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        this._alert.active = false;

        var btnName = event.target.name;
        if(btnName == "btn_sqjsfj"){
            cc.vv.net.send("dispress2"); 
        }
    },

    check:function(){
        
        if(!cc.vv.ip_check)return;
        if(cc.vv.gameNetMgr.gamestate != "playing")return;
        if(!cc.vv.gameNetMgr.seats)return;

        cc.vv.ip_check = false;

        var seats = cc.vv.gameNetMgr.seats;
        var list = [];

        for (var i = 0; i< seats.length;i++) {
        
            var seatDataA = seats[i];
            if(!seatDataA.ip)return;
            var item = {ip:seatDataA.ip,names:[seatDataA.name]}
            
            for(var j = i+1; j < seats.length;j++){                
                var seatDataB = seats[j];
                if(seatDataB.userid == 0)return;
                if(seatDataA.ip == seatDataB.ip){
                    item.names.push(seatDataB.name);
                    i = j;
                }
            }

            if(item.names.length > 1){
                list.push(item);
            }
        }

        if(list.length > 0){

            var str = "";
            for (var i in list) {
                var ip = list[i].ip;
                if(ip.indexOf("::ffff:") != -1){
                    ip = ip.substr(7);
                }
                str += "[" + ip + "] :";
                for (var j in list[i].names) {
                    str += list[i].names[j] + "   ";
                }
                str += "\r\n";
            }
            
            this._content.string = str;
            this._alert.active = true;
            this._lastChatTime = 5;
        }
    },

    onDestory:function(){
        if(cc.vv){
            cc.vv.ip = null;    
        }
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if(this._lastChatTime > 0){
            this._lastChatTime -= dt;
            if(this._lastChatTime < 0){
                this._alert.active = false;
            }
        }
    }
});
