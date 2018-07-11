cc.Class({
    extends: cc.Component,

    properties: {
        _android:"com/eaugame/wtmahjong/SdkPlugin",
        _ios:"ShareSDKTool",
        _share_call:null,
        _isCapturing:false,
    },

    // use this for initialization
    onLoad: function () {
    },

    /**
     * 登录回调
     */
    onUserResult:function(code, msg){
        cc.log3.debug("on user result action.");
        cc.log3.debug("msg:"+msg); 
        cc.log3.debug("code:"+code);        //这里可以根据返回的 code 和 msg 做相应的处理

        cc.log("haha~~~~!!!!")
        // cc.vv.wc.hide();

        switch(code){
            case 1:{
                cc.vv.userMgr.login(msg);
            }
            break;
            case 0:{
                cc.vv.alert.show("登录失败","请重新登录");
            }
            break;
            case -1:{
                cc.vv.alert.show("登录失败","您已取消授权登录");
            }
            break;
        }
    },
    
    /**
     * 分享回调
     */
    onShareResult:function(code, msg){
        console.log("onShareResult + " + code);
        switch(code){
            case 1:{
                if(this._share_call){
                    this._share_call(code,"分享成功");
                    this._share_call = null;
                }
            }
            break;
            case 0:{
                cc.vv.tip.show("您分享已被取消");
            }
            break;
            case -1:{
                cc.vv.alert.show("分享失败","您是否安装了相应的软件");
            }
            break;
        }
    },

    /**
     * 初始化，预获取授权
     */
    init:function(){ 
        
        if(!cc.sys.isNative){
            return;
        }

        if(cc.sys.os == cc.sys.OS_ANDROID){
            var location = jsb.reflection.callStaticMethod(this._android, "init", "()V");
            return location;
        }

        if(cc.sys.os == cc.sys.OS_IOS){
            var location = jsb.reflection.callStaticMethod(this._ios, "init");
            return location;
        }
    },

    /**
     * 获取客户端参数
     */
    getClientParms:function(){

        if(!cc.sys.isNative){
            return '';
        }

        if(cc.sys.os == cc.sys.OS_ANDROID){
            var parms = jsb.reflection.callStaticMethod(this._android, "getClientParms", "()Ljava/lang/String;");
            return parms;
        }

        if(cc.sys.os == cc.sys.OS_IOS){
            var parms = jsb.reflection.callStaticMethod(this._ios, "getClientParms");
            return parms;
        }
    },

    /**
     * 获取客户端定位
     */
    getLocation:function(){
        
        if(cc.sys.location != 1){
            return 'old';
        }

        cc.log("getLocation");
        if(!cc.sys.isNative){
            return '';
        }

        if(cc.sys.os == cc.sys.OS_ANDROID){
            var parms = jsb.reflection.callStaticMethod(this._android, "getLocation", "()Ljava/lang/String;");
            cc.log("locatino and:" + parms);
            return parms;
        }

        if(cc.sys.os == cc.sys.OS_IOS){
        // if (true) {
            var parms = jsb.reflection.callStaticMethod(this._ios, "getLocation");
            //修正ios经纬度搞反了
            // var parms = "33.3333|172381.313121"
            var _strarray = parms.split("|");
            if (_strarray.length >= 1) {
                parms = _strarray[1] + "|" + _strarray[0];
            }
            return parms;
        }
    },

    getLocationDes:function(){
        cc.log("getLocationDes");
        
        if(!cc.sys.isNative){
            return '没有定位权限, 未知地址';
        }

        if(cc.sys.os == cc.sys.OS_ANDROID){
            var parms = jsb.reflection.callStaticMethod(this._android, "getLocationDes", "()Ljava/lang/String;");
            cc.log("locatino and:" + parms);
            return parms;
        }

        if(cc.sys.os == cc.sys.OS_IOS){
            var parms = jsb.reflection.callStaticMethod(this._ios, "getLocationDes");
            return parms;
        }
    },

    /**
     * 获取客户端参数
     */
    calculateLineDistance:function(startLatlng,endLatlng){

        if(startLatlng == undefined || startLatlng == '' || startLatlng == '||' || startLatlng == 'old')return '';
        if(endLatlng == undefined || endLatlng == '' || endLatlng == '||' || endLatlng == 'old')return '';

        var startArr = startLatlng.split("|");
        var endArr = endLatlng.split("|");

        var lat1 = startArr[1];
        var lng1 = startArr[0];
        var lat2 = endArr[1];
        var lng2 = endArr[0];

        var EARTH_RADIUS = 6378137.0;    //单位M  
        var PI = Math.PI;  
          
        var radLat1 = (lat1*PI/180.0);  
        var radLat2 = (lat2*PI/180.0);  
          
        var a = radLat1 - radLat2;  
        var b = (lng1*PI/180.0) - (lng2*PI/180.0);  
          
        var s = 2*Math.asin(Math.sqrt(Math.pow(Math.sin(a/2),2) + Math.cos(radLat1)*Math.cos(radLat2)*Math.pow(Math.sin(b/2),2)));  
        s = s*EARTH_RADIUS;  
        s = Math.round(s*10000)/10000.0;

        return s;

        // if(!cc.sys.isNative){
        //     return '';
        // }

        // if(cc.sys.location != 1){
        //     return '';
        // }

        // if(cc.sys.os == cc.sys.OS_ANDROID){
        //     var location = jsb.reflection.callStaticMethod(this._android, "calculateLineDistance", "(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;",startLatlng,endLatlng);
        //     return location;
        // }

        // if(cc.sys.os == cc.sys.OS_IOS){
        //     var location = jsb.reflection.callStaticMethod(this._ios, "calculateLineDistance:endLatlng:",startLatlng,endLatlng);
        //     return location;
        // }
    },

    /**
     * 获取外部房间号
     */
    getRoomId:function(){

        if(!cc.sys.isNative){
            return '';
        }

        if(cc.sys.os == cc.sys.OS_ANDROID){
            var roomid = jsb.reflection.callStaticMethod(this._android, "getRoomid", "()Ljava/lang/String;");
            return roomid;
        }

        if(cc.sys.os == cc.sys.OS_IOS){
            var roomid = jsb.reflection.callStaticMethod(this._ios, "getRoomid");
            return roomid;
        }
    },

    /**
     * 获取外部房间号
     */
    wxShareImg:function(to,imgurl,width,height){

        if(!cc.sys.isNative){
            return;
        }

        if(cc.sys.os == cc.sys.OS_ANDROID){
            // jsb.reflection.callStaticMethod(this._android, "WxShareImg", "(Ljava/lang/String;Ljava/lang/String;II)V",to,imgurl,width,height);
             jsb.reflection.callStaticMethod(this._android, "shareImg", "(ILjava/lang/String;Ljava/lang/String;Ljava/lang/String;)V",to,"截图分享",imgurl,"");
        }

        if(cc.sys.os == cc.sys.OS_IOS){
            jsb.reflection.callStaticMethod(this._ios, "WxShareImg:file:",to,imgurl);
        }
    },
    
    /**
     * H5支付
     */
    webPay:function(url){

        if(!cc.sys.isNative){
            return;
        }

        if(cc.sys.os == cc.sys.OS_ANDROID){
            jsb.reflection.callStaticMethod(this._android, "wxpay", "(Ljava/lang/String;)V",url);
            return;
        }
        
        if(cc.sys.os == cc.sys.OS_IOS){
            cc.vv.hall.webView.url = url;
            return;
        }
    },

    /**
     * 分享文字
     */
    shareText:function(platfrom,title,text,func){

        if(!cc.sys.isNative){
            return;
        }

        if(cc.sys.os == cc.sys.OS_ANDROID){
            jsb.reflection.callStaticMethod(this._android, "shareText", "(ILjava/lang/String;Ljava/lang/String;)V",platfrom,title,text);
        }

        if(cc.sys.os == cc.sys.OS_IOS){
            jsb.reflection.callStaticMethod(this._ios, "shareText:to:",platfrom,title,text);
        }

        this._share_call = func;
    },

    /**
     * web
     */
    shareWeb:function(platfrom,title,text,imgurl,url,func){

        if(!cc.sys.isNative){
            return;
        }

        if(cc.sys.os == cc.sys.OS_ANDROID){
            jsb.reflection.callStaticMethod(this._android, "shareWeb", "(ILjava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V",platfrom,title,text,imgurl,url);
        }

        if(cc.sys.os == cc.sys.OS_IOS){
            var type = this.getIosType(platfrom);
            jsb.reflection.callStaticMethod(this._ios, "shareUrl:UrlTitle:Type:",url,title,type);
        }

        this._share_call = func;
    },

    getIosType:function(platfrom) {
        platfrom = Number(platfrom);
        //好友
        if (platfrom == 1) {
            return 22;
        }
        //朋友圈
        if (platfrom == 2) {
            return 23
        }
    },
    /**
     * 分享图片
     */
    shareImg:function(platfrom,title,imgurl,url,func){

        if(!cc.sys.isNative){
            return;
        }

        if(cc.sys.os == cc.sys.OS_ANDROID){
            jsb.reflection.callStaticMethod(this._android, "shareImg", "(ILjava/lang/String;Ljava/lang/String;Ljava/lang/String;)V",platfrom,title,imgurl,url);
        }

        if(cc.sys.os == cc.sys.OS_IOS){
            jsb.reflection.callStaticMethod(this._ios, "shareImg:Type:","new_dairy_share",23);
        }

        this._share_call = func;
    },

    //截屏分享
    screenShare:function(platfrom,callback){

        if(this._isCapturing){
            return;
        }

        this._share_call = callback;
        this._isCapturing = true;

        var size = cc.director.getWinSize();
        var fileName = "result_share.jpg";
        var fullPath = jsb.fileUtils.getWritablePath() + fileName;
        if(jsb.fileUtils.isFileExist(fullPath)){
            jsb.fileUtils.removeFile(fullPath);
            jsb.fileUtils.removeFile(jsb.fileUtils.getWritablePath() + "result_share_1.jpg");
            jsb.fileUtils.removeFile(jsb.fileUtils.getWritablePath() + "result_share_2.jpg");
        }

        var texture = new cc.RenderTexture(Math.floor(size.width), Math.floor(size.height));
        texture.setPosition(cc.p(size.width/2, size.height/2));
        texture.begin();
        cc.director.getRunningScene().visit();
        texture.end();
        texture.saveToFile(fileName, cc.IMAGE_FORMAT_JPEG);
        
        var self = this;
        var tryTimes = 0;
        var fn = function(){
            if(jsb.fileUtils.isFileExist(fullPath)){
                      
                var height = 400;
                var scale = height/size.height;
                var width = Math.floor(size.width * scale);

                var height2 = 100;
                var scale2 = height2/size.height;
                var width2 = Math.floor(size.width * scale2);

                cc.vv.g3Plugin.saveShareImg(jsb.fileUtils.getWritablePath(),fileName,width,height,width2,height2);

                if(cc.sys.os == cc.sys.OS_ANDROID || cc.sys.os == cc.sys.OS_IOS){
                    cc.vv.g3Plugin.shareImg(platfrom,"","","",callback);     
                }

                self._isCapturing = false;
            }
            else{
                tryTimes++;
                if(tryTimes > 10){
                    console.log("time out...");
                    return;
                }
                setTimeout(fn,50); 
            }
        }
        setTimeout(fn,50);
    },

       /**
     * 压缩分享的图片
     */
    saveShareImg:function(path,img,width,height,width2,height2){
        
        if(!cc.sys.isNative){
            return;
        }

        if(cc.sys.os == cc.sys.OS_ANDROID){
            jsb.reflection.callStaticMethod(this._android, "saveBitmap", "(Ljava/lang/String;Ljava/lang/String;IIII)V",path,img,width,height,width2,height2);
        }

        if(cc.sys.os == cc.sys.OS_IOS){
            jsb.reflection.callStaticMethod(this._ios, "saveBitmap:file:width:height:width2:height2:",path,img,width,height,width2,height2);
        }
    },

    /**
     * 登录
     */
    login:function(platfrom){
        if(!cc.sys.isNative){
            return;
        }

        if(cc.sys.os == cc.sys.OS_ANDROID){
            jsb.reflection.callStaticMethod(this._android, "login", "(I)V",platfrom);
        }

        if(cc.sys.os == cc.sys.OS_IOS){
            jsb.reflection.callStaticMethod(this._ios, "login:platfrom:",platfrom);
        }
    },

    /**
     * 登出
     */
    logout:function(platfrom){
        if(!cc.sys.isNative){
            return;
        }

        if(cc.sys.os == cc.sys.OS_ANDROID){
            jsb.reflection.callStaticMethod(this._android, "logout", "(I)V",platfrom);
        }

        if(cc.sys.os == cc.sys.OS_IOS){
            jsb.reflection.callStaticMethod(this._ios, "logout:platfrom:",platfrom);
        }
    },
    onLoginResp:function(code){
        console.log("onLoginResp");
        code = JSON.stringify(code);
        var fn = function(ret){
            var log111 = JSON.stringify(ret);  
            console.log("onLoginResp ret :" + log111);
            if(ret.errcode == 0){
                cc.sys.localStorage.setItem("wx_account",ret.account);
                cc.sys.localStorage.setItem("wx_sign",ret.sign);
            }
            cc.vv.userMgr.onAuth(ret);
        }
        console.log("onLoginResp ret.code :" + code);
        cc.vv.http.sendRequest("/wechat_auth",{code:code,os:cc.sys.os},fn, cc.vv.http.master_url);
    },

    weChatLogin : function(){
        var that = this;
        //微信登录
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod(this._android, "weChatLogin", "()V");  
            this.schedule(function(){  
                var wxLoginSuccess = jsb.reflection.callStaticMethod(this._android, "wxLoginIsSuccess", "()Z");  
                if(wxLoginSuccess){  
                    //获得授权信息  
                    var autoInfo = jsb.reflection.callStaticMethod(this._android, "getWxAutoMessage", "()Ljava/lang/String;");  
                    var jsonInfo = JSON.parse(autoInfo);  
                    
                    //如果登录成功的话将授权信息发送给后端  
                    console.log("autoInfo is " + autoInfo);
                    jsonInfo.access_token = jsonInfo.token;
                    //cc.vv.userMgr.onAuth(autoInfo)
                    //关闭所有计数器  
                    this.unscheduleAllCallbacks();   
                    if(autoInfo != ""){
                        that.onLoginResp(jsonInfo);
                        // cc.vv.http.getCode(jsonInfo.refresh_token, this.onLoginResp);
                    }
                }  
            },0.5);  
        }

        if(cc.sys.os == cc.sys.OS_IOS){
            var platfrom = 997;
            var result = null;
            jsb.reflection.callStaticMethod(this._ios, "thirdLoginWithType:result:",platfrom,result);
            this.schedule(function(){  
                var wxLoginSuccess = jsb.reflection.callStaticMethod(this._ios, "getwxLoginIsSuccess");  
                if(wxLoginSuccess){  
                    //获得授权信息  
                    var autoInfo = jsb.reflection.callStaticMethod(this._ios, "getInfo");  
                    var jsonInfo = JSON.parse(autoInfo);  
                    console.log("jsonInfo is " + jsonInfo);
                    //关闭所有计数器  
                    this.unscheduleAllCallbacks();   
                    if(autoInfo != ""){
                        that.onLoginResp(jsonInfo);
                    }
                }  
            },0.5);  
        }
    },

    toLogin:function(){

    },

    payMoney:function(productid) {
        if (productid) {
            if(cc.sys.os == cc.sys.OS_IOS){
                jsb.reflection.callStaticMethod(this._ios, "getAppStore:", productid);
            }
        }
    },

    onPayResult:function(code, msg) {
        console.log("onPayResult + " + code + "|msg:" + msg);
        switch(code){
            case 1:{
                cc.vv.tip.show("支付成功");
            }
            break;
            case 0:{
                cc.vv.tip.show("支付取消");
            }
            break;
            case -1:{
                cc.vv.alert.show("支付失败","您是否安装了相应的软件");
            }
            break;
        }
    },
});
