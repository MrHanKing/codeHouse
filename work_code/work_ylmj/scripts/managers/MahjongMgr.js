var mahjongSprites = [];

cc.Class({
    extends: cc.Component,

    properties: {

        mahjongAltas:{
            default:null,
            type:cc.SpriteAtlas
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
    
    getMahjongSpriteByID:function(id){
        return mahjongSprites[id];
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
    
    getSpriteFrameByMJID:function(pre,mjid){
        var spriteFrameName = this.getMahjongSpriteByID(mjid);
   
        cc.log3.debug("spriteFrameName="+spriteFrameName);

        return this.mahjongAltas.getSpriteFrame(spriteFrameName);
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
    
    getEmptySpriteFrame:function(side){
        if(side == "up"){            
            return this.mahjongAltas.getSpriteFrame("tilebg_2_2");
        }   
        else if(side == "myself"){
            return this.mahjongAltas.getSpriteFrame("tilebg_2_2");
        }
        else if(side == "left"){
            return this.mahjongAltas.getSpriteFrame("tilebg_1_2");
        }
        else if(side == "right"){
            return this.mahjongAltas.getSpriteFrame("tilebg_1_2");
        }
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

    getHoldsEmptySpriteFrame:function(side){
        if(side == "up"){
            return this.mahjongAltas.getSpriteFrame("tilebg_2_1");
        }   
        else if(side == "myself"){
            return null;
        }
        else if(side == "left"){
            return this.mahjongAltas.getSpriteFrame("tilebg_1_1");
        }
        else if(side == "right"){
            return this.mahjongAltas.getSpriteFrame("tilebg_1_1");
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
    }
});
