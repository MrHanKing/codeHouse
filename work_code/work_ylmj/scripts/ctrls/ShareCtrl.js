cc.Class({
    extends: cc.Component,

    properties: {

    },

    shareCallback:function(code,msg,type){
        console.log("shareCallback code:" + code + "|msg:" + msg);
        switch ( code ) {
            case 1:{
                    var onGet = function(ret){
                        console.log("shareCallback onGet:" + ret);
                        if(ret.errcode == 0){
                            cc.vv.alert.show("提示",ret.errmsg);

                            //分享成功后不弹
                            // if(type == '1'){
                            //     var now = new Date();
                            //     var day = now.getFullYear() + '/' + now.getMonth() + '/' + now.getDate();
                            //     cc.sys.localStorage.setItem("pop_active",day);    
                            // }
                            
                            // self.refreshInfo();
                        }else{
                            cc.vv.alert.show("提示",ret.errmsg);
                        }
                    };
                    
                    var data = {
                        account:cc.vv.userMgr.account,
                        sign:cc.vv.userMgr.sign,
                        type:type,
                        userid:cc.vv.userMgr.userId,
                        local:1
                    };

                    cc.vv.http.sendRequest("/share_success",data,onGet.bind(this));
                }
                break;
            default:
                cc.vv.alert.show("提示",'分享失败，不能获得奖励哦~');
                break;
        }
    },

    //大厅分享图片
    //platform 1 好友  2 朋友圈
    //type 暂时无用
    hallShareImage:function(platform, type){
        var title = '我是' + cc.vv.userMgr.userName + '，快和我一起玩梧桐棋牌！';
        var platform = Number(platform);
        var url = 'http://game.futuregame.cc/share/wtqp/' + cc.vv.userMgr.dealer_code;
        var thumbImage = jsb.fileUtils.fullPathForFilename('res/raw-assets/resources/textures/actives/dairy_share_thumb.jpg');

        if (type == 1) {
            var txt = '使用我的邀请码：' + cc.vv.userMgr.dealer_code + '在福利中使用，送大把钻石哦！';
            cc.vv.g3Plugin.shareImg(platform, txt, thumbImage, url, this.shareCallback.bind(this));
            return;
        }

        var imgPath = jsb.fileUtils.fullPathForFilename('res/raw-assets/resources/textures/actives/new_dairy_share.jpg');
        var searchpath = jsb.fileUtils.getSearchPaths();
        console.log("imgPath is " + jsb.fileUtils.isFileExist(imgPath));
        console.log("thumbImage is " + jsb.fileUtils.isFileExist(thumbImage));
        console.log("searchpath is " + searchpath);
        cc.vv.g3Plugin.shareImg(platform, title, thumbImage, url, this.shareCallback.bind(this));
    },
    
    //大厅邀请好友
    hallGetMoreFriend:function(){
        var title = "快来打麻将,一起领钻石";
        var text = cc.vv.userMgr.userName + "邀请你一起进入梧桐棋牌，海量钻石免费领，快来一起玩耍！";
        var imageurl = "https://fir.im/mdy3";
        var url = "http://wtmjhot.legaogame.com/api/user/inviteUser?userid=" + cc.vv.userMgr.userId;
        cc.vv.g3Plugin.shareWeb(1,title,text,imageurl,url,null);
    },
    
    //大厅分享战绩
    hallToShowBattleReward:function(idx){
        var title = "梧桐棋牌-回放码-" + idx + cc.vv.userMgr.userId + " 点击复制";
        var text = cc.vv.userMgr.userName + "分享了一个回放码：" +  idx + cc.vv.userMgr.userId + ",在大厅点击战绩/回放码按钮，并输入相应回放码。";

        var url = 'http://wtmjhot.legaogame.com/api/user/share?share=' + idx + cc.vv.userMgr.userId;
        cc.vv.g3Plugin.shareWeb(1,title,text,url,url,null);
    },

    //游戏内邀请好友
    gameInviteFriend:function(roomId, cntMaxUser, cntUser) {
        var title = "梧桐棋牌房间号：" + roomId + ' [缺' + (cntMaxUser - cntUser) + "人]";
        // cc.vv.share_url = 'http://game.futuregame.cc/room/wtqp/' + cc.vv.gameNetMgr.roomId;
        // cc.log3.debug(title);
        var txt_des = "房号:" + cc.vv.gameNetMgr.roomId + " 玩法:" + cc.vv.gameNetMgr.getWanfa();
        // cc.log3.debug("房号:" + cc.vv.gameNetMgr.roomId + " 玩法:" + cc.vv.gameNetMgr.getWanfa());
        // cc.vv.anysdkMgr.share(title,"玩法:" + cc.vv.gameNetMgr.getWanfa(),'0','2','');
        var url = "http://www.legaogame.com/web/ahjzmj/mj/wtmj/index.html";
        //现在没有 后面采用图片远程url
        var imageurl = "";
        // var imgPath = jsb.fileUtils.fullPathForFilename('res/raw-assets/resources/textures/public/icon.png');
        cc.vv.g3Plugin.shareWeb(1,title,txt_des,url,url,null);
    },

    //游戏内战绩分享
    gameToShowBattleReward:function(platform, shareCallback) {
        //方法在anysdkmgr里 暂时不移
    },
});