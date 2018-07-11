var mahjongSprites = [];

cc.Class({
    extends: cc.Component,

    properties: {

        //旧资源暂时不删
        mahjongAltas:{
            default:null,
            type:cc.SpriteAtlas
        },
        //麻将牌大 值
        mahjongAltasBig:{
            default:null,
            type:cc.SpriteAtlas
        },
        //麻将牌小竖 值
        mahjongAltasSmallVertical:{
            default:null,
            type:cc.SpriteAtlas
        },
        //麻将牌小横 值
        mahjongAltasSmallCross:{
            default:null,
            type:cc.SpriteAtlas
        },

        //麻将牌背面左边或右边
        mahjongAltasPaiBgLeft:{
            default:null,
            type:cc.SpriteAtlas
        },

        //麻将牌背面对面
        mahjongAltasPaiBgUp:{
            default:null,
            type:cc.SpriteAtlas
        },

        //桌面上牌底 背景 竖
        mytbAltas:{
            default:null,
            type:cc.SpriteAtlas
        },

        //桌面上牌底 背景 横 右侧
        RTBAltas:{
            default:null,
            type:cc.SpriteAtlas
        },

        //桌面上牌底 背景 横 左侧
        LTBAltas:{
            default:null,
            type:cc.SpriteAtlas
        },

        //暗杠图片 竖
        CPG_M_AAltas:{
            default:null,
            type:cc.SpriteAtlas
        },

        ///暗杠图片 横
        CPG_R_AAltas:{
            default:null,
            type:cc.SpriteAtlas
        },

        //明杠图片 竖
        CPG_MAltas:{
            default:null,
            type:cc.SpriteAtlas
        },

        ///明杠图片 横
        CPG_RAltas:{
            default:null,
            type:cc.SpriteAtlas
        },

        //牌墙图片 up 和 myself 盖着的
        MWALLAltas:{
            default:null,
            type:cc.SpriteAtlas
        },

        //牌墙图片 up 和 myself 翻着的
        MW_WAltas:{
            default:null,
            type:cc.SpriteAtlas
        },

        //牌墙图片 left 和 right 盖着的
        RWALLAltas:{
            default:null,
            type:cc.SpriteAtlas
        },

        ///牌墙图片 left 和 right 翻着的
        RW_WAltas:{
            default:null,
            type:cc.SpriteAtlas
        },

        //风位图片
        FengWeiAltas:{
            default:null,
            type:cc.SpriteAtlas
        },

        //结算界面图
        jiesuanTu:{
            default:null,
            type:cc.SpriteFrame
        },
  
        pengPrefabSelf:{
            default:null,
            type:cc.Prefab
        },
        
        pengPrefabLeft:{
            default:null,
            type:cc.Prefab
        },
        
        pengPrefabRight:{
            default:null,
            type:cc.Prefab
        },
  
        saiziAltas:{
            default:null,
            type:cc.SpriteAtlas
        },
        tbAltas:{
            default:null,
            type:cc.SpriteAtlas
        },

        titlesAltas:{
            default:null,
            type:cc.SpriteAtlas
        },

        holdsEmpty:{
            default:[],
            type:[cc.SpriteFrame]
        },
        
        _sides:null,
        _pres:null,
        _foldPres:null,
    },
    
    onLoad:function(){
        if(cc.vv == null){
            return;
        }
        this._sides = ["myself","right","up","left"];
        this._pres = ["M_","R_","B_","L_"];
        this._foldPres = ["B_","R_","B_","L_"];
        cc.vv.mahjongmgr = this; 
        //筒
        for(var i = 1; i < 10; ++i){
            mahjongSprites.push("B" + i);        
        }
        
        //条
        for(var i = 1; i < 10; ++i){
            mahjongSprites.push("T" + i);
        }
        
        //万
        for(var i = 1; i < 10; ++i){
            mahjongSprites.push("W" + i);
        }
        

        //东南西北风
        mahjongSprites.push("F2");
        mahjongSprites.push("F3");
        mahjongSprites.push("F4");
        mahjongSprites.push("F5");

        //中、发、白
        mahjongSprites.push("F1");
        mahjongSprites.push("F6");
        mahjongSprites.push("F7");

        //春夏秋冬
        mahjongSprites.push("J1");
        mahjongSprites.push("J2");
        mahjongSprites.push("J3");
        mahjongSprites.push("J4");
        //菊兰梅竹
        mahjongSprites.push("H3");
        mahjongSprites.push("H2");
        mahjongSprites.push("H1");
        mahjongSprites.push("H4");

    },

    getJiesuanMahjongSpriteByID:function(id){
        return mahjongSprites[id];
    },
    
    getJiesuanSpriteFrameByMJID:function(pre,mjid){
        var spriteFrameName = this.getJiesuanMahjongSpriteByID(mjid);
   
        cc.log3.debug("spriteFrameName="+spriteFrameName);
        spriteFrameName = "MZ_" + spriteFrameName;

        return this.mahjongAltasBig.getSpriteFrame(spriteFrameName);
    },


    //根据位置 获得牌面值 isBig 大牌 用于手牌
    getMahjongSpriteByID:function(id, side, isBig){
        var forwardname = null;
        if(isBig){
            forwardname = "MZ_";
        }else{
            if(side == "right" || side == "left"){
                forwardname = "VZ_S_";
            }else{
                forwardname = "HZ_S_";
            }
        }

        if (forwardname) {
            return forwardname + mahjongSprites[id];
        }

        return null;
    },

    
    getMahjongType:function(id){
      if(id >= 0 && id < 9){
          return 0;
      }
      else if(id >= 9 && id < 18){
          return 1;
      }
      else if(id >= 18 && id < 27){
          return 2;
      }
    },
    
    getSpriteFrameByMJID:function(pre, mjid, side, isBig){
        var spriteFrameName = this.getMahjongSpriteByID(mjid, side, isBig);
   
        cc.log3.debug("spriteFrameName="+spriteFrameName);

        var mahjongAltas = null;
        if(isBig){
            mahjongAltas = this.mahjongAltasBig;
        }else{
            if(side == "right" || side == "left"){
                mahjongAltas = this.mahjongAltasSmallCross;
            }else{
                mahjongAltas = this.mahjongAltasSmallVertical;
            }
        }

        return mahjongAltas.getSpriteFrame(spriteFrameName);
    },

    getSpriteFrameByMJIDWithPenggang:function(pre, mjid, mjSpriteName){
        //吃碰杠的时候特殊处理
        //type 1 竖牌 2横牌
        var side = null;
        mjSpriteName = new String(mjSpriteName)
        if(mjSpriteName.search("HZ_S") >= 0){
            side = "myself";
        }else if(mjSpriteName.search("VZ_S") >= 0){
            side = "left";
        }else{
            cc.log("error getSpriteFrameByMJIDWithPenggang mjSpriteName:" + mjSpriteName)
            return;
        }

        var spriteFrameName = this.getMahjongSpriteByID(mjid, side, false);
   
        cc.log3.debug("spriteFrameName="+spriteFrameName);

        //type 1 大牌面; 2 小牌面竖; 3小牌面横
        var mahjongAltas = null;

        if(side == "myself" || side == "up"){
            mahjongAltas = this.mahjongAltasSmallVertical;
        }else{
            mahjongAltas = this.mahjongAltasSmallCross;
        }

        return mahjongAltas.getSpriteFrame(spriteFrameName);
    },
    
    getSpriteFrameBySaiZiID:function(saiziId){
        var spriteFrameName = "shaizi"+saiziId;
        return this.saiziAltas.getSpriteFrame(spriteFrameName);
    },

    getSpriteFrameByTableId:function(tabId){     
        var spriteFrameName = "tb_"+tabId;
        return this.tbAltas.getSpriteFrame(spriteFrameName);
    },

    getSpriteFrameByTitleId:function(bbh,tabId){
        var spriteFrameName = null;

        var temp = tabId;
        if(tabId==1){
            temp = 2;
        }else if(tabId==2){
            temp = 1;
        }

        if(bbh){
            spriteFrameName = "bbh_"+temp;
        }
        else{
            spriteFrameName = "ph_"+temp;
        }
        return this.titlesAltas.getSpriteFrame(spriteFrameName);
    },

    getAudioURLByMJID:function(id){
        var realId = 0;
        if(id >= 0 && id < 9){
            realId = id + 21;
        }
        else if(id >= 9 && id < 18){
            realId = id - 8;
        }
        else if(id >= 18 && id < 27){
            realId = id - 7;
        }else if(id >= 27 && id < 34){
            realId = id + 4;
        }
        return realId + ".mp3";
    },

    //可考虑废弃
    getEmptySpriteFrame:function(side, index){
        index = 14 - index;
        var name = null;
        if(index < 10){
            name = "HC_0" + index;
        }else{
            name = "HC_" + index;
        }

        if(side == "up"){     
            return this.mahjongAltasPaiBgUp.getSpriteFrame(name);
        }   
        else if(side == "myself"){
            return this.mahjongAltasPaiBgUp.getSpriteFrame(name);
        }
        else if(side == "left"){
            return this.mahjongAltasPaiBgLeft.getSpriteFrame(name);
        }
        else if(side == "right"){
            return this.mahjongAltasPaiBgLeft.getSpriteFrame(name);
        }
    },
    
    //结算界面用
    getJiesuanBgSpriteFrame:function() {
        return this.jiesuanTu;
    },


    getBgSpriteFrame:function(side){
         if(side == "up"){            
            return this.mahjongAltas.getSpriteFrame("tilebg_2_0");            
        }   
        else if(side == "myself"){
            return this.mahjongAltas.getSpriteFrame("tilebg_2_0");
        }
        else if(side == "left"){
            return this.mahjongAltas.getSpriteFrame("tilebg_1_0");
        }
        else if(side == "right"){
            return this.mahjongAltas.getSpriteFrame("tilebg_1_0");
        }
    },

    //手牌背面 图片
    getHoldsEmptySpriteFrame:function(side, nodeName){
        nodeName = new String(nodeName);
        var name = nodeName.slice(-2);
        if(side == "left"){
            name = 15 - Number(name);
        }

        if(Number(name) < 10){
            name = "HC_0" + name;
        }else{
            name = "HC_" + name;
        }

        if(side == "up"){
            return this.mahjongAltasPaiBgUp.getSpriteFrame(name);
        }   
        else if(side == "myself"){
            return null;
        }
        else if(side == "left"){
            return this.mahjongAltasPaiBgLeft.getSpriteFrame(name);
        }
        else if(side == "right"){
            return this.mahjongAltasPaiBgLeft.getSpriteFrame(name);
        }
    },
    
    sortMJ:function(mahjongs,magicpai){
        var self = this;
        mahjongs.sort(function(a,b){
            if(magicpai >= 0){
	        if(magicpai == a){
	            return -1;
                }
                else if(magicpai == b){
                    return 1;
                }
            }

            return a - b;
        });
    },
    
    getSide:function(localIndex){
        return this._sides[localIndex];
    },
    
    getPre:function(localIndex){
        return this._pres[localIndex];
    },
    
    getFoldPre:function(localIndex){
        return this._foldPres[localIndex];
    },

    //桌面上的牌背景 正面  name node节点的名字
    getSpriteFrameByFoldsPaiBg:function(name, side){
        name = new String(name);
        var line = Number(name.toString().slice(-3, -2));
        var atlas;

        if(line >= 4){
            line = 3;
        }

        var row = Number(name.toString().slice(-1));
        var num;
        if(side == "right"){
            num = (line - 1) * 6 + row - 1;
        }else{
            num = 18 - ( (line - 1) * 6 + row );
        }

        var subname;

        name = name.slice(-3);

        if(num >= 10){
            subname = "" + num;
        }else{
            subname = "0" + num;
        }

        
        if(side == "up" || side == "myself"){
            name = "MYTB_00" + subname + "_" + name;
            atlas = this.mytbAltas;
        }else if(side == "left"){
            name = "LTB_" + name;
            atlas = this.LTBAltas;
        }else if(side == "right"){
            name = "R_00" + subname + "_" + name;
            atlas = this.RTBAltas;
        }
        
        return atlas.getSpriteFrame(name);
    },

    //暗杠图片
    getSpriteFrameByAnGangBg:function(mingGangname, side){
        var altas;
        if(side == "up" || side == "myself"){
            altas = this.CPG_M_AAltas;
        }else{
            altas = this.CPG_R_AAltas;
        }

        mingGangname = new String(mingGangname);
        var resultname;
        if (mingGangname.slice(4, 5) == "A") {
            resultname = mingGangname;
        }else{
            resultname = mingGangname.slice(0, 4) + "A_" + mingGangname.slice(4);
        }
        return altas.getSpriteFrame(resultname);
    },

    //明杠图片
    getSpriteFrameByMingGangBg:function(anGangname, side){
        var altas;
        if(side == "up" || side == "myself"){
            altas = this.CPG_MAltas;
        }else{
            altas = this.CPG_RAltas;
        }

        anGangname = new String(anGangname);
        var resultname;
        if (anGangname.slice(4, 5) != "A") {
            resultname = anGangname;
        }else{
            resultname = anGangname.slice(0, 4) + anGangname.slice(6);
        }
        return altas.getSpriteFrame(resultname);
    },

    //获取牌墙的背景图
    //type 1 翻着的牌; 2 盖着的牌
    //index 倒数第几张牌
    getPaiQiangSpriteFrameBySide:function(side, index, type){
        var altas;
        var name;
        if(type == 1){
            if(side == "up"){
                name = "MW_W_U_0" + index;
                altas = this.MW_WAltas;
            }

            if(side == "myself"){
                name = "MW_W_U_" + (18 - index);
                altas = this.MW_WAltas;
            }

            if(side == "right"){
                name = "RW_W_U_" + (18 - index);
                altas = this.RW_WAltas;
            }

            if (side == "left") {
                name = "RW_W_U_0" + index;
                altas = this.RW_WAltas;
            }
        }

        if(type == 2){
            if(side == "up"){
                name = "MW_U_0" + index;
                altas = this.MWALLAltas;
            }

            if (side == "myself") {
                name = "MW_U_" + (18 - index);
                altas = this.MWALLAltas;
            }

            if(side == "right"){
                name = "RW_U_" + (18 - index);
                altas = this.RWALLAltas;
            }

            if(side == "left"){
                name = "RW_U_0" + index;
                altas = this.RWALLAltas;
            }
        }

        if (altas) {
            return altas.getSpriteFrame(name);
        }
        return null;
    },

    getFengWeiSpriteFrame:function(index){
        var name;
        if(index == 0){
            name = "arrow_E_BG";
            this.fenwei = "E";
        }

        if(index == 1){
            name = "arrow_N_BG";
            this.fenwei = "N";
        }

        if(index == 2){
            name = "arrow_W_BG";
            this.fenwei = "W";
        }

        if(index == 3){
            name = "arrow_S_BG";
            this.fenwei = "S";
        }

        return this.FengWeiAltas.getSpriteFrame(name);
    },

    getFengWeiLiangSpriteFrame:function(index){
        //这里index指 相距东位人的位置
        var name;
        if(this.fenwei){
            if(index == 0){
                name = "arrow_" + this.fenwei + "E";
            }
            if(index == 1){
                name = "arrow_" + this.fenwei + "S";
            }
            if(index == 2){
                name = "arrow_" + this.fenwei + "W";
            }
            if(index == 3){
                name = "arrow_" + this.fenwei + "N";
            }
            return this.FengWeiAltas.getSpriteFrame(name);
        }
    },
});