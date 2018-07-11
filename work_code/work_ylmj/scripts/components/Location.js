cc.Class({
    extends: cc.Component,

    properties: {
        _location:null
    },

    // use this for initialization
    onLoad: function () {
        if(cc.vv == null){
            return;
        }

        this.initEventHandlers();
        this._location = this.node.getChildByName('location');
        this._location_alert = this._location.getChildByName('info_list').getChildByName('view').getChildByName('content').getChildByName('info').getComponent(cc.Label);

        //开局前检查定位
        if(cc.vv.gameNetMgr.numOfGames == 0){
            this.checkLineDistance();
        }
    },

    initEventHandlers:function(){

        var self = this;
        this.node.on('new_user',function(data){
            self.checkLineDistance();
        });

        // this.node.on('user_state_changed',function(data){
        //     if(cc.vv.gameNetMgr.numOfGames <= 1){
        //         self.checkLineDistance();
        //     }
        // });

    },

    onBtnDissolveClicked:function(){
        
        cc.vv.audioMgr.playSFX("ui_click.mp3");

        if(cc.vv.gameNetMgr.numOfGames == 0){
            cc.vv.net.send("exit");
            return;
        }

        cc.vv.alert.show("解散房间","您现在在游戏中，是否确定解散？",function(){
            cc.vv.net.send("dissolve_request");    
        },true);
    },
    
    onBtnShowClicked:function(event){
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        var self = this;

        //非定位包提示更新
        if(cc.sys.location != 1 && cc.sys.isNative){
            cc.vv.alert.show("更新提示","您的游戏版本不支持定位，点击确认下载新游戏",function(){
                cc.sys.openURL('http://down.178wsy.com/game2/');  
            },true);
            
            return;
        }

        this.show();
        this._location.active = true;
    },

    show:function(){

        var seats = this._location.getChildByName("seats");

        var gameChild = cc.find("Canvas/game");
        var sides = ["myself","right","up","left"];

        for(var i=0;i<4;i++){

            var to = cc.vv.gameNetMgr.getLocalIndex(i);

            //是否获取到定位
            var location = cc.vv.gameNetMgr.seats[i].location;
            if(cc.vv.gameNetMgr.seats[i].userid > 0 && (location == undefined || location == '' || location == '||' || location == '0:0' || location == 'old')){

                if(location == 'old'){
                    seats.children[to].getChildByName('info').getComponent(cc.Label).string = '无定位';
                }else{
                    seats.children[to].getChildByName('info').getComponent(cc.Label).string = '无位置';
                }

                seats.children[to].getChildByName('info').active = true;
                seats.children[to].getChildByName('pos_set').active = false;
                seats.children[to].getChildByName('pos_no').active = true;
            }else{
                seats.children[to].getChildByName('info').active = false;
                seats.children[to].getChildByName('pos_set').active = true;
                seats.children[to].getChildByName('pos_no').active = false;
            }

            if (cc.vv.gameNetMgr.seats && cc.vv.gameNetMgr.seats[i] && cc.vv.gameNetMgr.seats[i].userid > 0) {
                seats.children[to].getChildByName('name').getComponent(cc.Label).string = cc.vv.gameNetMgr.seats[i].name;
                seats.children[to].getChildByName('head').active = true;
                seats.children[to].getChildByName('head').getComponent("ImageLoader").setUserID(cc.vv.gameNetMgr.seats[i].userid);
            }else{
                seats.children[to].getChildByName('pos_set').active = true;
                seats.children[to].getChildByName('pos_no').active = false;
                seats.children[to].getChildByName('name').getComponent(cc.Label).string = '';
                seats.children[to].getChildByName('head').getComponent("ImageLoader").setUserID(null)
                seats.children[to].getChildByName('head').active = false;
            }
        }
        
        //算人与人之间距离
        this.calculateLineDistance(0,1);
        this.calculateLineDistance(0,2);
        this.calculateLineDistance(0,3);
        this.calculateLineDistance(1,2);
        this.calculateLineDistance(1,3);
        this.calculateLineDistance(2,3);
    },

    /**
     * 有人进出时，检查距离
     */
    checkLineDistance(){

        this._location_alert.string = '';

        //有人未开启定位
        for(var i=0;i<4;i++){
            if(cc.vv.gameNetMgr.seats && cc.vv.gameNetMgr.seats[i] && cc.vv.gameNetMgr.seats[i].userid > 0){
                if(cc.vv.gameNetMgr.seats[i].location == 'old'){
                    this._location_alert.string += cc.vv.gameNetMgr.seats[i].name + " 无定位功能\r\n" ;
                }else if(cc.vv.gameNetMgr.seats[i].location == undefined || cc.vv.gameNetMgr.seats[i].location == '||' || cc.vv.gameNetMgr.seats[i].location == ''){
                    this._location_alert.string += cc.vv.gameNetMgr.seats[i].name + " 无位置信息\r\n" ;
                }
            }
        }

        this.calculateLineDistanceCheck(0,1);
        this.calculateLineDistanceCheck(0,2);
        this.calculateLineDistanceCheck(0,3);
        this.calculateLineDistanceCheck(1,2);
        this.calculateLineDistanceCheck(1,3);
        this.calculateLineDistanceCheck(2,3);

        if(this._location_alert.string != ''){
            this.show();
            this._location.active = true;
        }
        
        //是否风险提示
        // this._location.getChildByName('info').active = isShow;
    },

    /**
     * 检查两人之间距离
     */
    calculateLineDistanceCheck:function(index1,index2){
        if (cc.vv.gameNetMgr.seats && cc.vv.gameNetMgr.seats[index1] && cc.vv.gameNetMgr.seats[index1].userid > 0
            && cc.vv.gameNetMgr.seats && cc.vv.gameNetMgr.seats[index2] && cc.vv.gameNetMgr.seats[index2].userid > 0) {

            var distance = cc.vv.g3Plugin.calculateLineDistance(cc.vv.gameNetMgr.seats[index1].location,cc.vv.gameNetMgr.seats[index2].location);

            //有人未开启定位
            if(distance == ''){
                return true;
            }

            //有两个之间距离小于100米
            if(distance < 1000){
                this._location_alert.string += cc.vv.gameNetMgr.seats[index1].name + " 和 " + cc.vv.gameNetMgr.seats[index2].name + " 距离相近\r\n" ;
                return true;
            }
        }

        return false;
    },

    calculateLineDistance:function(index1,index2){

        var inx1 = cc.vv.gameNetMgr.getLocalIndex(index1);
        var inx2 = cc.vv.gameNetMgr.getLocalIndex(index2);

        var node =  this._location.getChildByName("num_" + inx1 + "_" + inx2);
        if(inx1 > inx2){
            node =  this._location.getChildByName("num_" + inx2 + "_" + inx1);
        }

        //默认颜色
        node.color = cc.color(0, 0, 0);
     
        if (cc.vv.gameNetMgr.seats && cc.vv.gameNetMgr.seats[index1] && cc.vv.gameNetMgr.seats[index1].userid > 0
            && cc.vv.gameNetMgr.seats && cc.vv.gameNetMgr.seats[index2] && cc.vv.gameNetMgr.seats[index2].userid > 0) {

            var distance = cc.vv.g3Plugin.calculateLineDistance(cc.vv.gameNetMgr.seats[index1].location,cc.vv.gameNetMgr.seats[index2].location);
            if(distance == ''){
                node.getComponent(cc.Label).string = '未知';
            }else{
                distance = parseFloat(distance);

                //有小于100米，标记为红色
                if(distance < 1000){
                    node.color = cc.color(228, 0, 0);
                }

                if(distance > 10000){
                    distance = distance / 1000;
                    node.getComponent(cc.Label).string = "约" + parseInt(distance) + "公里"; 
                }else{
                    node.getComponent(cc.Label).string = "约" + parseInt(distance) + "米"; 
                }
            }
        }else{
            node.getComponent(cc.Label).string = '';
        }
    },

    
    onBtnCloseClicked:function(event){
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        this._location.active = false;
    },

});
