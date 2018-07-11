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
        _gameover:null,
        _gameresult:null,
        _seats:[],
        _isGameEnd:false,
        _pingju:null,
        _win:null,
        _lose:null,
        _draw:null,
        _saizi_1:null,
        _saizi_2:null,
    },

    // use this for initialization
    onLoad: function () {
        if(cc.vv == null){
            return;
        }
        if(cc.vv.gameNetMgr.conf == null){
            return;
        }
     
        this._gameover = this.node.getChildByName("game_over_xlch");
        
        this._gameover.active = false;
        
        this._pingju = this._gameover.getChildByName("pingju");
        this._win = this._gameover.getChildByName("win");
        this._lose = this._gameover.getChildByName("lose");
        this._draw =  this._gameover.getChildByName("draw");
        this._gameresult = this.node.getChildByName("game_result");
                
        var wanfa = this._gameover.getChildByName("wanfaninfo").getChildByName("wanfa").getComponent(cc.Label);
        wanfa.string = cc.vv.gameNetMgr.getWanfa();
        
        this._saizi_1   = this._gameover.getChildByName("saizi_1").getComponent(cc.Sprite);
        this._saizi_1.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameBySaiZiID(cc.vv.gameNetMgr.saizi_1);
        this._saizi_2   = this._gameover.getChildByName("saizi_2").getComponent(cc.Sprite);    
        this._saizi_2.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameBySaiZiID(cc.vv.gameNetMgr.saizi_2);

        var listRoot = this._gameover.getChildByName("result_list");
        for(var i = 1; i <= 4; ++i){
            var s = "s" + i;
            var sn = listRoot.getChildByName(s);
            var viewdata = {};
            viewdata.username = sn.getChildByName('username').getComponent(cc.Label);
            viewdata.reason = sn.getChildByName('reason').getComponent(cc.Label);
            
            var f = sn.getChildByName('fan');
            if(f != null){
                viewdata.fan = f.getComponent(cc.Label);    
            }
            
            viewdata.score = sn.getChildByName('score').getComponent(cc.Label);
            viewdata.hu = sn.getChildByName('hu');
            viewdata.mahjongs = sn.getChildByName('pai');
            viewdata.zhuang = sn.getChildByName('zhuang');
            viewdata.hupai = sn.getChildByName('hupai');
            viewdata._pengandgang = [];
            this._seats.push(viewdata);
        }
        
        //初始化网络事件监听器
        var self = this;
        this.node.on('game_over',function(data){self.onGameOver(data.detail);});
        
        this.node.on('game_end',function(data){self._isGameEnd = true;});
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

    onGameOver(data){
        this.onGameOver_XLCH(data);
    },
    
    getTargetSide:function(seatData,targetIndex){

        var targetSide = -1;
         //下家
        var nextIs = (seatData.seatindex + 1)%4; 
        //对家
        var faceIs = (seatData.seatindex + 2)%4;
        //上家 
        var lastIs = (seatData.seatindex + 3)%4;
        
        if(targetIndex == nextIs){
            targetSide = 2;
        }
        else if(targetIndex == faceIs){
            targetSide = 1;
        }
        else if(targetIndex == lastIs){
            targetSide = 0;
        }
        else{
            targetSide = -1;
        }
        return targetSide;
    },

    onGameOver_XLCH:function(data){
        cc.log3.debug(data);
        if(data.length == 0){
            this._gameresult.active = true;
            return;
        }
        this._gameover.active = true;
        this._pingju.active = false;
        this._win.active = false;
        this._lose.active = false;
        this._draw.active = false;

        this._saizi_1.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameBySaiZiID(cc.vv.gameNetMgr.saizi_1);
        this._saizi_2.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameBySaiZiID(cc.vv.gameNetMgr.saizi_2);
        this._gameover.getChildByName("time").getComponent(cc.Label).string = this.dateFormat();
        var draw  = data[cc.vv.gameNetMgr.seatIndex].draw;
        if(draw){
           this._draw.active = true; 
        }
        else{
            var myscore = data[cc.vv.gameNetMgr.seatIndex].score;
            if(myscore > 0){
                this._win.active = true;
                cc.vv.audioMgr.playSFX("win.mp3");
            }     
            else if(myscore < 0){
                this._lose.active = true;
                cc.vv.audioMgr.playSFX("lose.mp3");
            }
            else{
                this._pingju.active = true;
            }
        }
        

        //显示玩家信息
        for(var i = 0; i < 4; ++i){
            var seatView = this._seats[i];
            var userData = data[i];
            var hued = false;
            var actionArr = [];
            var is7pairs = false;
            var ischadajiao = false;
            var hupaiRoot = seatView.hupai;
            
            hupaiRoot.active = false;
            /*
            for(var j = 0; j < hupaiRoot.children.length; ++j){
                hupaiRoot.children[j].active = false;
            }
            */
            
            var hi = 0;
            for(var j = 0; j < userData.huinfo.length; ++j){
                var info = userData.huinfo[j];
                hued = hued || info.ishupai;
                if(info.ishupai){
                    hupaiRoot.active = true;

                    var sprite = hupaiRoot.getChildByName("MyMahJongPai").getComponent(cc.Sprite);                
                    
                    if (cc.vv.gameNetMgr.getChangJingTypeName() == "3D") {
                        sprite.spriteFrame = cc.vv.mahjongmgr.getJiesuanSpriteFrameByMJID("M_",info.pai);
                    }else{
                        sprite.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID("M_",info.pai);
                    }

                    var mask   = hupaiRoot.getChildByName("magic_mash");    
                    if(info.pai ==  cc.vv.gameNetMgr.magicPai){
                        mask.active = true;
                    }
                    else{
                        mask.active = false;
                    }                                    
                }
                

                var str = ""
                var sep = "";
                
                var dataseat = userData;
                if(!info.ishupai){
                    if(info.action == "fangpao"){
                        str = "放炮";
                    }

                    dataseat = data[info.target]; 
                    info = dataseat.huinfo[info.index];
                }
                else{
                    if(info.action == "hu"){
                        str = "接炮胡"
                    }
                    else if(info.action == "tianhu"){
                        str = "天胡";
                    }
                    else if(info.action == "dihu"){
                        str = "地胡";
                    }
                    else if(info.action == "quanlt"){
                        str = "全老头"
                    }
                    else if(info.action == "zimo"){
                        str = "自摸";
                    }
                    else if(info.action == "ddbaotou"){
                        str = "大吊暴头";
                    }
                    else if(info.action == "ddgangbao")
                    {
                        str = "大吊杠暴";
                    }
                    else if(info.action == "baotou"){
                        str = "暴头";
                    }
                    else if(info.action == "gangbao"){
                        str = "杠暴";
                    }
                    else if(info.action == "ddzimo"){
                        str = "大吊自摸";
                    }
                    else if(info.action == "gangkai"){
                        str = "杠开"
                    }


                    sep += "  "
                                        
                    if(info.pattern == "7pairs"){
                        str += "清七";
                        sep = " "
                    }
                    else if(info.pattern == "D7pairs"){
                        str += "大清七";
                        sep = " "
                    }
                    else if(info.pattern == "13bukao"){
                        str += "13不靠";
                        sep = " "
                    }

                    if(sep == ""){
                        str += "平胡";
                    }                                                                            
                }

                actionArr.push(str);

                if(cc.vv.gameNetMgr.conf.type != "txmj"){
                    if(info.gangnum){
                        actionArr.push("杠x" + info.gangnum);
                    }
                }

                if(info.huanum>0){
                    actionArr.push("花X"+info.huanum);
                }

                if(info.piaonum>0){
                    actionArr.push("飘X"+info.piaonum);
                }
            }
            
            seatView.hu.active = hued;
            
            if(cc.vv.gameNetMgr.conf.type == "txmj"){
                if(cc.vv.gameNetMgr.conf.bbh == 0){
                    if(userData.angangs.length){
                        actionArr.push("暗杠x" + userData.angangs.length);
                    }
                
                    if(userData.diangangs.length || userData.wangangs.length){
                        actionArr.push("明杠x" + (userData.diangangs.length + userData.wangangs.length));
                    }
                }
            }
           

            seatView.username.string = cc.vv.gameNetMgr.seats[i].name;
            seatView.zhuang.active = cc.vv.gameNetMgr.button == i;
            seatView.reason.string = actionArr.join(" ");
            
            if(userData.score > 0){
                seatView.score.string = "+" + userData.score;    
            }
            else{
                seatView.score.string = userData.score;
            }
           
            //隐藏所有牌
            for(var k = 0; k < seatView.mahjongs.childrenCount; ++k){
                var n = seatView.mahjongs.children[k];
                n.active = false;
            }

            var magicPai = cc.vv.gameNetMgr.magicPai;

            cc.vv.mahjongmgr.sortMJ(userData.holds,magicPai);
            
            var numOfGangs = userData.angangs.length + userData.wangangs.length + userData.diangangs.length;
           
            var lackingNum = (userData.pengs.length + numOfGangs + userData.chis.length)*3;
            //显示相关的牌
            for(var k = 0; k < userData.holds.length; ++k){
                var pai = userData.holds[k];
                var n = seatView.mahjongs.children[k + lackingNum];
                n.active = true;

                var sprite = n.getChildByName("MyMahJongPai").getComponent(cc.Sprite);                
                //var sprite = n.children[0].getComponent(cc.Sprite);

                if (cc.vv.gameNetMgr.getChangJingTypeName() == "3D") {
                    sprite.spriteFrame = cc.vv.mahjongmgr.getJiesuanSpriteFrameByMJID("M_",pai);
                }else{
                    sprite.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID("M_",pai);
                }

                var mask   = n.getChildByName("magic_mash");    
                if(pai ==  cc.vv.gameNetMgr.magicPai){
                    mask.active = true;
                }
                else{
                    mask.active = false;
                }                
            }
            
            
            for(var k = 0; k < seatView._pengandgang.length; ++k){
                seatView._pengandgang[k].active = false;
            }
            
            //初始化杠牌
            var targetSide = -1; 
            var index = 0;
            var gangs = userData.angangs;
            for(var k = 0; k < gangs.length; ++k){
                targetSide = this.getTargetSide(userData,gangs[k][0]);
                var mjid = [gangs[k][1],gangs[k][2],gangs[k][3],gangs[k][4]];
                this.initPengAndGangsAndChi(seatView,targetSide,index,mjid,"angang");
                index++;    
            }
            
            var gangs = userData.diangangs;
            for(var k = 0; k < gangs.length; ++k){
                targetSide = this.getTargetSide(userData,gangs[k][0]); 
                var mjid = [gangs[k][1],gangs[k][2],gangs[k][3],gangs[k][4]];
                this.initPengAndGangsAndChi(seatView,targetSide,index,mjid,"diangang");
                index++;    
            }
            
            var gangs = userData.wangangs;
            for(var k = 0; k < gangs.length; ++k){
                targetSide = this.getTargetSide(userData,gangs[k][0]);   
                var mjid = [gangs[k][1],gangs[k][2],gangs[k][3],gangs[k][4]];
                this.initPengAndGangsAndChi(seatView,targetSide,index,mjid,"wangang");
                index++;    
            }
            
            //初始化碰牌
            var pengs = userData.pengs
            if(pengs){
                for(var k = 0; k < pengs.length; ++k){
                    targetSide = this.getTargetSide(userData,pengs[k][0]);  
                    var mjid = [pengs[k][1],pengs[k][1],pengs[k][1]];
                    this.initPengAndGangsAndChi(seatView,targetSide,index,mjid,"peng");
                    index++;    
                } 
            }

            //初始化吃牌
            var chis = userData.chis;
            if(chis){
                for(var k = 0; k < chis.length; ++k){               
                    targetSide = chis[k][0];                     
                    var mjid = [chis[k][1],chis[k][2],chis[k][3]];
                    this.initPengAndGangsAndChi(seatView,targetSide,index,mjid,"chi");
                    index++;    
                }
            }
        }
    },
    
    
    initPengAndGangsAndChi:function(seatView,targetSide,index,mjid,flag){
        var pgroot = null;
        if(seatView._pengandgang.length <= index){
            pgroot = cc.instantiate(cc.vv.mahjongmgr.pengPrefabSelf);
            seatView._pengandgang.push(pgroot);
            pgroot.scaleX = 1.15;
            pgroot.scaleY = 1.15;
            seatView.mahjongs.addChild(pgroot);    
        }
        else{
            pgroot = seatView._pengandgang[index];
            pgroot.active = true;
        }
      
        //var sprites = pgroot.getComponentsInChildren(cc.Sprite);
        var  sprites = pgroot.children;
        for(var s = 0; s < sprites.length; ++s){
            var sprite   = sprites[s].getComponent(cc.Sprite);
            var mjSprite = sprites[s].children[0].getComponent(cc.Sprite);

            sprite.node.color = cc.color(255, 255, 255);
            sprite.node.opacity = 255;
            mjSprite.node.color = cc.color(255, 255, 255);

            if(sprite.node.name == "gang"){
                var isGang =((flag != "peng") && (flag != "chi"));
                sprite.node.active = isGang;
                sprite.node.scaleX = 1.0;
                sprite.node.scaleY = 1.0;
                if (cc.vv.gameNetMgr.getChangJingTypeName() == "3D") {
                    sprite.spriteFrame = cc.vv.mahjongmgr.getJiesuanBgSpriteFrame("myself");
                    mjSprite.spriteFrame = cc.vv.mahjongmgr.getJiesuanSpriteFrameByMJID("B_",mjid[s]);    
                }else{
                    sprite.spriteFrame   = cc.vv.mahjongmgr.getBgSpriteFrame("myself");
                    mjSprite.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID("B_",mjid[s]);    
                }
            }
            else{

                if(flag == "angang"){
                     if (cc.vv.gameNetMgr.getChangJingTypeName() == "3D") {
                        sprite.spriteFrame  =  cc.vv.mahjongmgr.getJiesuanBgSpriteFrame("myself");                                 
                        mjSprite.spriteFrame = cc.vv.mahjongmgr.getJiesuanSpriteFrameByMJID("B_",mjid[s]);
                    }else{
                        sprite.spriteFrame = cc.vv.mahjongmgr.getEmptySpriteFrame("myself");
                        mjSprite.spriteFrame = null;
                    }
                    sprite.node.scaleX = 1;
                    sprite.node.scaleY = 1;
                }
                else{                    
                    var empty = false;
                    if(flag!= "chi"){
                        if(targetSide == s){
                            if(s == 2){
                                //下家
                                empty = true;
                            }
                            else if(s == 1){
                                //对家                       
                                empty = true;                       
                            }
                            else if(s == 0){
                                //上家
                                empty = true;
                            }
                        }
                    }
                    else{
                        if(targetSide == mjid[s]){
                            empty = true;
                        }
                    }

                    if (cc.vv.gameNetMgr.getChangJingTypeName() == "3D") {
                        sprite.spriteFrame  =  cc.vv.mahjongmgr.getJiesuanBgSpriteFrame("myself");                                 
                        mjSprite.spriteFrame = cc.vv.mahjongmgr.getJiesuanSpriteFrameByMJID("B_",mjid[s]);
                    }else{
                        sprite.spriteFrame  =  cc.vv.mahjongmgr.getBgSpriteFrame("myself");                                 
                        mjSprite.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID("B_",mjid[s]);
                    }

                    sprite.node.scaleX = 1.0;
                    sprite.node.scaleY = 1.0;
                    if(empty && cc.vv.gameNetMgr.getChangJingTypeName() == "2D"){                        
                         sprite.node.color = cc.color(124,202,137);
                         mjSprite.node.color = cc.color(124,202,137);
                    }
                }
            }
        }
        pgroot.x = index * 55 * 3 + index * 30;
    },

    onBtnReadyClicked:function(){
        cc.log3.debug("onBtnReadyClicked");
        if(this._isGameEnd){
            this._gameresult.active = true;
        }
        else{
            cc.vv.net.send('ready');   
        }
        this._gameover.active = false;
    },
    
    onBtnShareClicked:function(){
        cc.log3.debug("onBtnShareClicked");
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
