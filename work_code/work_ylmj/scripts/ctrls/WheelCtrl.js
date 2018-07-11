cc.Class({
    extends: cc.Component,

    properties: {
        _wheel:null,
        _HistoryViewlist:null,
        _HistoryContent:null,
        _viewitemTemp:null,
        LotteryHistoryData:null,
        
        _NoitceViewList:null,
        _NoticeConten:null,
        _NoticeitemTemp:null,
        LotteryNoticeData:null,
        _mobileInput:null,

        tip:cc.Node,
        no:-1,

        wheelAltas:{
            default:null,
            type:cc.SpriteAtlas
        },

        wheelSp:{
            default:null,
            type:cc.Sprite
        },
        
        maxSpeed:{
            default:24,
            type:cc.Float,
            max:24,
            min:2,
        },

        duration:{
            default:0.1,
            type:cc.Float,
            max:5,
            min:1,
            tooltip:"减速前旋转时间"
        },
        acc:{
            default:0.3,
            type:cc.Float,
            max:5,
            min:1,
            tooltip:"加速度"
        },

        targetID:{
            default:0,
            type:cc.Integer,
            max:7,
            min:0,
            tooltip:"指定结束时的齿轮"
        },
        /*
        springback:{
            default:false,
            tooltip:"旋转结束是否回弹"
        },
        */
        effectAudio:{
            default:null,
            url:cc.AudioClip
        }
    },

    // use this for initialization
    onLoad: function () {
        cc.log("....onload");
        this.wheelState = 0;    
        this.curSpeed = 0;
        this.spinTime = 0;                   //减速前旋转时间
        this.gearNum = 8;
        this.defaultAngle = -360/8/2;         //修正默认角度
        this.gearAngle = 360/this.gearNum;   //每个齿轮的角度
        
        this.finalAngle = 0;                 //最终结果指定的角度
        this.effectFlag = 0;                 //用于音效播放
        this.message = null;
        this.time = null;
        this.name = null;
        this.need_mobile = 0;

        /*
        if(!cc.sys.isBrowser)
        {
            cc.loader.loadRes('Sound/game_turntable', function(err,res){if(err){cc.log('...err:'+err);}});
        }
        */
        this._wheel = cc.find("Canvas/Wheels");

        this._HistoryViewlist = this._wheel.getChildByName("HistoryViewlist");
        this._HistoryContent = cc.find("view/content",this._HistoryViewlist);        
        this._viewitemTemp = this._HistoryContent.children[0];
        this._HistoryContent.removeChild(this._viewitemTemp);

        this._NoitceViewList = this._wheel.getChildByName("NoticeViewlist");
        this._NoticeConten = cc.find("view/content",this._NoitceViewList);
        this._NoticeitemTemp = this._NoticeConten.children[0];
        this._NoticeConten.removeChild(this._NoticeitemTemp);
        
        this._mobileInput  =  cc.find("Canvas/mobileInput");
        this._mobileInput.active = false;
        this._pnInput      =  this._mobileInput.getChildByName("Layout_pninput");
        this._pnconf       =  this._mobileInput.getChildByName("Layout_pnconf");
        this._pnInput.active = false;
        this._pnconf.active  = false;

        var node = cc.find("Canvas/bottom_left/btn_zp"); 
        this.addClickEvent(node,this.node,"WheelCtrl","onBtnWheelClicked");
        var node = cc.find("Canvas/Wheels/btn_back");
        this.addClickEvent(node,this.node,"WheelCtrl","onCloseBtnClick");

        this.wheel1 = cc.find("Canvas/Wheels/Wheel1");        
        this.spinBtn1 = cc.find("Canvas/Wheels/Wheel1/point_btn1").getComponent(cc.Button);
        
        this.wheel2 = cc.find("Canvas/Wheels/Wheel2");
        this.spinBtn2 = cc.find("Canvas/Wheels/Wheel2/point_btn2").getComponent(cc.Button);
        
        this.wheel2.active = false;
        this.spinBtn2.active = false;
        
        this.wheelSp  = this.wheel1.getChildByName("zp_1").getComponent(cc.Sprite);
        //this.wheelSp.node.rotation = this.defaultAngle;
        this.wheelSp.node.rotation = 0;
        
        this._choseLeftbtn  = cc.find("Canvas/Wheels/btn_1");
        this.chose_light1 = this._wheel.getChildByName("chose_1");

        this._choseRigthbtn = cc.find("Canvas/Wheels/btn_2");
        this.chose_light2 = this._wheel.getChildByName("chose_2");
        this.chose_light2.active = false;

        this.spinBtn1.node.on(cc.Node.EventType.TOUCH_END,function(event)
        {
            cc.log("begin spin");
            this.onSpinBtnClicked(2);
        }.bind(this));

        this.spinBtn2.node.on(cc.Node.EventType.TOUCH_END,function(event)
        {
            cc.log("begin spin");
            this.onSpinBtnClicked(5);
        }.bind(this));

        cc.vv.WheelCtrl = this;

        cc.vv.hall.getLotteryInfo();
    },
    
    onSpinBtnClicked :function (type){
        if(this.wheelState !== 0){
            return;
        }
        var no =  this.no;
        if(no == -1){
            cc.vv.alert.show("提示","网络异常，请重启游戏~~");
            return;
        }

        this.decAngle = 360;  // 减速旋转两圈
        //this.decAngle = 1.5*360;  // 减速旋转两圈
        //this.wheelState = 1;
        this.curSpeed = 0;
        this.spinTime = 0;

        this.message = null;
        this.time = null;
        this.name = null;
        this.need_mobile = 0;

        var self = this;

        type = 10;
        cc.vv.userMgr.getLottery(no,type,function(ret){
    
            if(ret.errcode !== 0){
                cc.log3.debug(ret.errmsg);
                cc.vv.alert.show("提示",ret.errmsg);
                self.wheelState = 0;
                self.message = null;
                self.time = null;
                self.name = null;
                self.need_mobile = 0;
            }
            else{
                cc.log3.debug(ret);
                
                self.wheelState = 1;

                self.targetID =  ret.seat;
                self.message  =  ret.message;
                self.time     =  ret.time;
                self.name     =  ret.name;
                self.need_mobile =  ret.need_mobile;
                self.caculateFinalAngle(self.targetID);

                cc.vv.audioMgr.playSFX("round.mp3");
            }
        });
    },

    addClickEvent:function(node,target,component,handler){
        var eventHandler = new cc.Component.EventHandler();
        eventHandler.target = target;
        eventHandler.component = component;
        eventHandler.handler = handler;

        var clickEvents = node.getComponent(cc.Button).clickEvents;
        clickEvents.push(eventHandler);
    },

    onCloseBtnClick :function(event){
        if(this.wheelState == 0){
            this._wheel.active = false;
            cc.vv.audioMgr.playSFX("ui_click.mp3");
        }
    },

    onBtnWheelClicked:function(){
        cc.vv.audioMgr.playSFX("ui_click.mp3");

        this._wheel.active = true;
        var self = this;
        cc.vv.userMgr.getLotteryHistory(function(data){
            self.LotteryHistoryData = data;
            self.initLotteryHistoryList(data);
        });

        cc.vv.userMgr.getLotteryNotic(function(data){
            self.LotteryNoticeData = data;
            self.initLotteryNoitce(data);
        });
    },

    getSpriteFrameByPicTip:function(spriteFrameName){
        return this.wheelAltas.getSpriteFrame(spriteFrameName);
    },

    initLotteryHistoryList:function(data){
        if(data == null){
            return;
        }

        for(var i = 0; i < data.length; ++i){
            var node = this.getViewItem(i);
            node.idx = i;
            node.getChildByName("re_time").getComponent(cc.Label).string = data[i].time;
            node.getChildByName("re_content").getComponent(cc.Label).string = data[i].name;
            
            var status0 = node.getChildByName("re_statues0");
            var status1 = node.getChildByName("re_statues1");
            if(data[i].status == 1){
                status0.active = true;
                status1.active = false;
                status0.getComponent(cc.Sprite).spriteFrameName = this.getSpriteFrameByPicTip('get');
            }
            else{
                status0.active = false;
                status1.active = true;
                status1.getComponent(cc.Sprite).spriteFrameName = this.getSpriteFrameByPicTip('noget');                
            }
        }

        this.shrinkContent(data.length);
        this._HistoryViewlist.getComponent(cc.ScrollView).scrollToLeft();  
    },
    
    getViewItem:function(index){
        var content = this._HistoryContent;
        if(content.childrenCount > index){
            return content.children[index];
        }
        var node = cc.instantiate(this._viewitemTemp);
        content.addChild(node);
        return node;
    },

    shrinkContent:function(num){
        while(this._HistoryContent.childrenCount > num){
            var lastOne = this._HistoryContent.children[this._HistoryContent.childrenCount -1];
            this._HistoryContent.removeChild(lastOne,true);
        }
    },


    initLotteryNoitce:function(data){
        if(data == null){
            return;
        }

        for(var i = 0; i < data.length; ++i){
            var node = this.getNoticeItem(i);
            node.idx = i;
            node.getChildByName("userid").getComponent(cc.Label).string = data[i].userid;
            node.getChildByName("name").getComponent(cc.Label).string = data[i].name;
        }

        this.shrinkNoticeContent(data.length);

        
    },
    
    getNoticeItem:function(index){
        var content = this._NoticeConten;
        if(content.childrenCount > index){
            return content.children[index];
        }
        var node = cc.instantiate(this._NoticeitemTemp);
        content.addChild(node);
        return node;
    },

    shrinkNoticeContent:function(num){
        while(this._NoticeConten.childrenCount > num){
            var lastOne = this._NoticeConten.children[this._NoticeConten.childrenCount -1];
            this._NoticeConten.removeChild(lastOne,true);
        }
    },

    start:function()
    {
        // cc.log('....start');
    },
    
    caculateFinalAngle:function(targetID)
    {
        this.finalAngle = 360-this.targetID*this.gearAngle + this.defaultAngle;
        /*
        if(this.springback)
        {
            this.finalAngle += this.gearAngle;
        }
        */
    },

    CircleCalc:function(centerX,centerY,radius,radian){
        let point = null;
        var fradian = radian * Math.PI / 180.0;
        var x =   centerX +  radius * Math.sin(fradian);
        var y =   centerY +  radius * Math.cos(fradian)
        point = cc.v2(x,y);
        return point;
    },

    onChoseBtnClick: function(event){
        if(this.wheelState !== 0){
                return;
        }
        
        cc.vv.audioMgr.playSFX("ui_click.mp3");
        if(event.target.name == "btn_1"){
            if(this.wheel1.active){
                return ;
            }   
            this.wheel1.active = true;
            this.spinBtn1.active= true;
            this.chose_light1.active = true;
            
            this.wheelSp  = this.wheel1.getChildByName("zp_1").getComponent(cc.Sprite);
            //this.wheelSp.node.rotation = this.defaultAngle;
            this.wheelSp.node.rotation = 0;

            /*
            let point1 = this.CircleCalc(-274,-360,360,30);
            let point2 = this.CircleCalc(-274,-360,360,60);
            let point3 = this.CircleCalc(-274,-360,360,90);
            let point4 = this.CircleCalc(-274,-360,360,100);
            //let point5 = this.CircleCalc(-274,-360,360,150);
            //let point6 = this.CircleCalc(-274,-360,360,180);
            let action = cc.cardinalSplineTo(1,[point1,point2,point3,point4],0);
            this.wheel1.runAction(cc.sequence(cc.show(),action,cc.callFunc(function () {
                this.wheel1.active = false;
            }, this)));
            */

            this.wheel2.active = false;
            this.spinBtn2.active = false;
            this.chose_light2.active = false;
        }else{
            if(this.wheel2.active){
                return ;
            } 
            this.wheel1.active = false;
            this.spinBtn1.active= false;
            this.chose_light1.active = false;
 
            this.wheelSp  = this.wheel2.getChildByName("zp_2").getComponent(cc.Sprite);
            //this.wheelSp.node.rotation = this.defaultAngle;
            this.wheelSp.node.rotation = 0;
            this.wheel2.active = true;

            this.spinBtn2.active = true;
            this.chose_light2.active = true;
        }
    },


    WheelUpdate:function(){
        this.schedule()
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {

        if(this.LotteryNoticeData){
            var y = this._NoticeConten.y;
            y += dt*14;

            //if(y + this._NoticeConten.height > 400){
            if(y > (this._NoticeConten.height+60)){
                y = -50;
            }
            this._NoticeConten.y = y;
        }

        if(this.wheelState == 0)
        {
            return;
        }
        //cc.log('......update');
        //cc.log('......state=%d',this.wheelState);
       
        this.effectFlag += this.curSpeed;
        if(!cc.sys.isBrowser && this.effectFlag >= this.gearAngle)
        {
            if(this.audioID)
            {
                // cc.audioEngine.pauseEffect(this.audioID);
            }
            // this.audioID = cc.audioEngine.playEffect(this.effectAudio,false);
            this.audioID = cc.audioEngine.playEffect(cc.url.raw('resources/Sound/game_turntable.mp3'));
            this.effectFlag = 0;
        }

        if(this.wheelState == 1)
        {
            // cc.log('....加速,speed:' + this.curSpeed);
            this.spinTime += dt;

            for(var i = 0; i< 20;i++){
                this.wheelSp.node.rotation = this.wheelSp.node.rotation + (this.curSpeed/20);
            }

            //this.wheelSp.node.rotation = this.wheelSp.node.rotation + this.curSpeed;
            if(this.curSpeed <= this.maxSpeed)
            {
                this.curSpeed += this.acc;
            }
            else
            {   
                /*
                if(1){
                    this.wheelState = 0;
                    return;
                }
                */

                if(this.spinTime<this.duration)
                {
                    return;
                }
                // cc.log('....开始减速');
                //设置目标角度
                this.finalAngle = 360-this.targetID*this.gearAngle + this.defaultAngle;
                this.maxSpeed = this.curSpeed;
                /*
                if(this.springback)
                {
                    this.finalAngle += this.gearAngle;
                }
                */
                this.wheelSp.node.rotation = this.finalAngle;
                this.wheelState = 2;
            }
        }
        else if(this.wheelState == 2)
        {
            // cc.log('......减速');
            var curRo = this.wheelSp.node.rotation; //应该等于finalAngle
            var hadRo = curRo - this.finalAngle;
            this.curSpeed = this.maxSpeed*((this.decAngle-hadRo)/this.decAngle) + 0.2; 
            this.wheelSp.node.rotation = curRo + this.curSpeed;

            if((this.decAngle-hadRo)<=0)
            {  
                // cc.log('....停止');
                this.wheelState = 0;
                this.wheelSp.node.rotation = this.finalAngle;
                /*
                if(this.springback)
                {
                    //倒转一个齿轮
                    var act = new cc.rotateBy(0.6, -this.gearAngle);
                    var seq = cc.sequence(new cc.delayTime(0.2),act,cc.callFunc(this.showRes, this));
                    this.wheelSp.node.runAction(seq);
                }
                else
                */
                {
                    this.showRes();
                    //获取最新获奖记录

                }
            }
        }
    },


    onPnSureClicked:function(){
        this._pnconf.active  = false;
        this._mobileInput.active =false;
    },

    onPnConfClicked:function(){

        var self = this;
        var onGet = function (ret) {
            if(ret.errcode != 0)
            {
                cc.vv.alert.show("提示",ret.errmsg);
            }
            else
            {
               cc.vv.alert.show("提示","提交成功");
               cc.vv.userMgr.mobile = self.mobile
               self._pnInput.active = false;
               self._mobileInput.active =false;
            }
        };

        this.mobile  = this._pnInput.getChildByName("phonenum").getComponent(cc.EditBox).string;
        if(!this.mobile){
            cc.vv.alert.show("提示",'请输入手机号');
            return;
        }

        var data = {
            account:cc.vv.userMgr.account,
            sign:cc.vv.userMgr.sign,
            userid:cc.vv.userMgr.userId,
            mobile:this.mobile
        };

        cc.vv.http.sendRequest("/mobile", data, onGet.bind(this));
    },

    onPnReWriteClocked:function(){
        this._pnInput.getChildByName("phonenum").getComponent(cc.EditBox).string = cc.vv.userMgr.mobile;
        this._pnInput.active = true;
        this._pnconf.active  = false;
    },

    showRes:function()
    {
        var self = this;
        if(this.message == null){
            cc.vv.alert.show("提示","网络异常!");
        }
        else{
            if(self.need_mobile != 1){
                cc.vv.hall.refreshInfo();
                cc.vv.tip.show(this.message);
            }
            else{
                cc.vv.alert.show("提示",this.message,function(){
                    //需要手机号
                    if(self.need_mobile == 1){
                        //判断本地是否有手机号                
                        if(cc.vv.userMgr.mobile){
                            self._pnconf.getChildByName("phonenum").getComponent(cc.Label).string = cc.vv.userMgr.mobile;

                            self._pnInput.active = false;
                            self._pnconf.active  = true;
                            self._mobileInput.active =true;
                        }else{
                            self._pnconf.active = false;
                            self._pnInput.active = true;                    
                            self._mobileInput.active =true;                    
                        }
                    }else{//不需要手机号
                        //刷新金币
                        cc.vv.hall.refreshInfo();
                    }
                    
                });
            }
            //刷新中奖列表
            
        }
    }
});