cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        _isCapturing:false,
        _shareCallback:false,
        _payCallback:null,
        _shareType:'0',
    },

    // use this for initialization
    onLoad: function () {
    },
    
    init:function(){  
        if(cc.sys.os == cc.sys.OS_ANDROID || cc.sys.os == cc.sys.OS_IOS){
            var agent = anysdk.agentManager;
            this.user_plugin = agent.getUserPlugin();
            this.user_plugin.setListener(this.onUserResult, this);
            
            this.share_plugin = agent.getSharePlugin();
            this.share_plugin.setListener(this.onShareResult,this);

            this.iap_plugin = agent.getIAPPlugin();

            if(this.iap_plugin){
                this.iap_plugin.setListener(this.onPayResult, this);
            }
        }
    },

    onPayResult:function(code, msg, info){
        if(this._payCallback)this._payCallback(code,msg,info);
    },
    
    onUserResult:function(code, msg){
        // cc.log3.debug("on user result action.");
        // cc.log3.debug("msg:"+msg); 
        // cc.log3.debug("code:"+code);        //这里可以根据返回的 code 和 msg 做相应的处理
        switch(code) {
            case anysdk.UserActionResultCode.kInitSuccess://初始化 SDK 成功回调
                //SDK 初始化成功，游戏相关处理
                cc.log3.debug("SDK初始化成功");
                break;
            case anysdk.UserActionResultCode.kInitFail://初始化 SDK 失败回调
                //SDK 初始化失败，游戏相关处理
                cc.log3.debug("SDK初始化失败");
                break;
            case anysdk.UserActionResultCode.kLoginSuccess:
                //登录成功
                //do something
                cc.log3.debug("SDK登录成功");
                var uid = this.user_plugin.getUserID();
                var arr = msg.toString().split("|");  
                
                var account = arr[0];
                var sign = arr[1];
                
                var ret = {
                    errcode:0,
                    account:account,
                    sign:sign
			    };
			    
                cc.sys.localStorage.setItem("wx_account",ret.account);
                cc.sys.localStorage.setItem("wx_sign",ret.sign);
                 
                cc.vv.userMgr.onAuth(ret);
                 
                break;
            case anysdk.UserActionResultCode.kLoginFail:
                //登录失败
                cc.log3.debug("登录失败");
                break;
            case anysdk.UserActionResultCode.kLoginNetworkError:
                //登录网络出错
                cc.log3.debug("登录网络出错");
                break;
            case anysdk.UserActionResultCode,kLoginCancel:
            	//登录取消
            	cc.log3.debug("登录取消");
            	break;
        }
    },
    
    onShareResult:function(code, msg){
        // cc.log("share result, resultcode:"+code+", msg: "+msg);
        this._shareCallback = this._shareCallback == null? nop:this._shareCallback;
        this._shareCallback(code,msg,this._shareType);
    },

    //截屏分享
    shareResult:function(shareTo,callback){
        if(this._isCapturing){
            return;
        }

        this._shareCallback = callback;
        this._shareType = shareTo;

        this._isCapturing = true;
        var size = cc.director.getWinSize();
        var fileName = "result_share.jpg";
        var fullPath = jsb.fileUtils.getWritablePath() + fileName;
        if(jsb.fileUtils.isFileExist(fullPath)){
            jsb.fileUtils.removeFile(fullPath);
        }

        var self = this;
        var height = 320;
        var scale = height/size.height;
        var width = Math.floor(size.width * scale);
        var callbackFun = function(params) {
            if(jsb.fileUtils.isFileExist(fullPath)){
                                
                cc.vv.g3Plugin.wxShareImg(shareTo,fullPath,width,height);

                self._isCapturing = false;
            }
        }

        var curScene = cc.director.getRunningScene();
        var texture = cc.RenderTexture.create(size.width, size.height);
        texture.setPosition(cc.p(size.width/2, size.height/2));
        texture.begin();
        curScene.visit();
        texture.end();
        
        texture.saveToFile(fileName, cc.ImageFormat.JPG, false, function(){
            //截屏成功回调
            console.log("makeWeChatSharePic  saveToFile");
            setTimeout(function(){
                self.makeWeChatSharePic(fileName, fileName, scale, callbackFun);
            },10)
        });

        // var tryTimes = 0;
        // var fn = function(){
        //     if(jsb.fileUtils.isFileExist(fullPath)){
                                
                
        //         //platfrom,title,imgurl,url,func
        //         cc.vv.g3Plugin.shareImg(shareTo,"战绩分享",fullPath,"",null);

        //         self._isCapturing = false;
        //     }
        //     else{
        //         tryTimes++;
        //         if(tryTimes > 10){
        //             console.log("time out...");
        //             return;
        //         }
        //         setTimeout(fn,50); 
        //     }
        // }
        // setTimeout(fn,50);
    },

    makeWeChatSharePic: function(filePath, name, scale, callbackFun) {
        console.log("makeWeChatSharePic");
        if (!cc.sys.isNative)return;//只支持native
        var self = this;
        var m_filepath = jsb.fileUtils.getWritablePath()+filePath;//图片最后存储路径
        var size = cc.winSize;//屏幕size
        var rt = cc.RenderTexture.create(size.width*scale, size.height*scale);
        //开始绘制截屏
        cc.director.getTextureCache().removeTextureForKey(m_filepath);
        var m_node = this.createCustSprite(m_filepath)
        m_node.setAnchorPoint(cc.p(0,0))
        cc.director.getScene().addChild(m_node)
        m_node.scale = scale
        m_node._sgNode.addChild(rt);
        rt.setVisible(false);
        rt.begin();
        m_node._sgNode.visit();
        rt.end();
        // m_node.active = false
        rt.saveToFile(name, cc.ImageFormat.JPG, false, function(){
            //截屏成功回调
            console.log("makeWeChatSharePic  saveToFile");
            rt.removeFromParent();
            m_node.removeFromParent();
            callbackFun();
        });
    },

    createCustSprite: function(filePath){
        var node = new cc.Node();
        var sp = node.addComponent(cc.Sprite);
        var tex = cc.director.getTextureCache().addImage(filePath)
        var frame=new cc.SpriteFrame(tex);
        sp.spriteFrame = frame;

        return node
    },

    // //截屏分享
    // shareResult:function(shareTo){

    //     if(cc.sys.os == cc.sys.OS_ANDROID){
    //         this.shareResultAndroid(shareTo);
    //         return;
    //     }

    //     if(this._isCapturing){
    //         return;
    //     }
    //     this._isCapturing = true;

    //     var scene = cc.director.getRunningScene();
    //     var ancPos = scene.getAnchorPoint();

    //     var size = cc.director.getVisibleSize();
    //     var fileName = "result_share.jpg";
    //     var fullPath = jsb.fileUtils.getWritablePath() + fileName;
    //     if(jsb.fileUtils.isFileExist(fullPath)){
    //         jsb.fileUtils.removeFile(fullPath);
    //     }

    //     var fileName2 = "result_share_2.jpg";
    //     var fullPath2 = jsb.fileUtils.getWritablePath() + fileName2;
    //     if(jsb.fileUtils.isFileExist(fullPath2)){
    //         jsb.fileUtils.removeFile(fullPath2);
    //     }

    //     var self = this;
    //     var tryTimes = 0;

    //     var fn = function(){

    //         if(jsb.fileUtils.isFileExist(fullPath2)){

    //             scene.setScale(1.0);
    //             scene.setAnchorPoint(ancPos);

    //             if(cc.sys.os == cc.sys.OS_ANDROID || cc.sys.os == cc.sys.OS_IOS){
    //                 if(self.share_plugin){
    //                     var info = {
    //                         mediaType:'1',// 是个枚举分享类型，0 文本，1 图片，2 新闻/网址，3 音乐，4 视频，5 应用，6 非 GIF 消息，7 GIF 消息，8 多媒体
    //                         shareTo:shareTo,// 是分享到什么位置，0 聊天 1 朋友圈 2 收藏
    //                         imagePath:fullPath,
    //                         thumbImage:fullPath2,
    //                         thumbSize:"64",
    //                         url: cc.vv.SI.appweb  
    //                     }; 

    //                     self.share_plugin.share(info);                
    //                 }                    
    //             }
    //             self._isCapturing = false;
    //         }
    //         else{
    //             tryTimes++;
    //             if(tryTimes > 10){
    //                 cc.log3.debug("time out...");
    //                 return;
    //             }
    //             setTimeout(fn,50); 
    //         }
    //     }

    //     var texture = new cc.RenderTexture(Math.floor(size.width), Math.floor(size.height));
    //     if(cc.sys.os == cc.sys.OS_IOS){
    //         texture.setPosition(cc.p(0, 0));
    //         texture.setAnchorPoint(0,0);
    //         texture.begin();
    //         scene.visit();
    //         texture.end(); 
    //         texture.saveToFile(fileName, cc.IMAGE_FORMAT_JPG);
    //     }

    //     var fn_small = function(){
    //         if(jsb.fileUtils.isFileExist(fullPath)){

    //             var texture2 = new cc.RenderTexture(Math.floor(size.width/5), Math.floor(size.height/5));
    //             texture2.setPosition(cc.p(0, 0));
    //             texture2.setAnchorPoint(0,0);
    //             texture2.begin();
    //             scene.setScale(0.2);
    //             scene.visit();
    //             texture2.end(); 
    //             texture2.saveToFile(fileName2, cc.IMAGE_FORMAT_JPG);

    //             setTimeout(fn,10);

    //         }else{
    //             tryTimes++;
    //             if(tryTimes > 10){
    //                 cc.log3.debug("fn_small time out...");
    //                 return;
    //             }
    //             setTimeout(fn_small,50); 
    //         }
    //     }

    //     setTimeout(fn_small,10);
    // },

    pay:function(info,callback){

        if(this.iap_plugin)
        {
            this.iap_plugin.payForProduct(info);    //pay
            this._payCallback = callback;
        }
    },

    login:function(){
        if(cc.sys.os == cc.sys.OS_ANDROID || cc.sys.os == cc.sys.OS_IOS){ 
            //jsb.reflection.callStaticMethod(this.ANDROID_API, "Login", "()V");
            // cc.log3.debug("onBtnWeichatClicked to login WX");
            if(this.user_plugin)
            {
                this.user_plugin.login();    
            }
        }
        else{
            cc.log3.debug("platform:" + cc.sys.os + " dosn't implement share.");
        }
    },

    logout:function(){
        if(cc.sys.os == cc.sys.OS_ANDROID || cc.sys.os == cc.sys.OS_IOS){ 
            if(!this.user_plugin || !this.user_plugin.logout) return;
            this.user_plugin.logout();
        }
        else{
            cc.log3.debug("platform:" + cc.sys.os + " dosn't implement share.");
        }
    },

    shareImg:function(shareTo,thumbImage,imagePath,callback){
        if(cc.sys.os == cc.sys.OS_ANDROID || cc.sys.os == cc.sys.OS_IOS){
            if(this.share_plugin){
                 var info = {
                        title: '', //在印象笔记、邮箱、信息、微信（包括好友、朋友圈和收藏）、易信（包括好友、朋友圈）、人人网和 QQ空 间使用
                        text: '',  // 是分享文本，所有平台都需要这个字段
                		mediaType:'1',// 是个枚举分享类型，0 文本，1 图片，2 新闻/网址，3 音乐，4 视频，5 应用，6 非 GIF 消息，7 GIF 消息，8 多媒体
                        shareTo:shareTo,// 是分享到什么位置，0 聊天 1 朋友圈 2 收藏
                        imagePath:imagePath,
                        thumbImage:thumbImage,
                        thumbSize:"64",
                        url:cc.vv.share_url  
                }; 

                this.share_plugin.share(info);                
            }

            this._shareCallback = callback;
            this._shareType = shareTo;
            
        }
        else{
            cc.log3.debug("platform:" + cc.sys.os + " dosn't implement share.");
        }
    },
    
    share:function(title,desc,shareTo,mediaType,imagePath,callback){
        if(cc.sys.os == cc.sys.OS_ANDROID || cc.sys.os == cc.sys.OS_IOS){
            if(this.share_plugin){
                 var info = {
                        title: title, //在印象笔记、邮箱、信息、微信（包括好友、朋友圈和收藏）、易信（包括好友、朋友圈）、人人网和 QQ空 间使用
                        text: desc,  // 是分享文本，所有平台都需要这个字段
                		mediaType:mediaType,// 是个枚举分享类型，0 文本，1 图片，2 新闻/网址，3 音乐，4 视频，5 应用，6 非 GIF 消息，7 GIF 消息，8 多媒体
                        shareTo:shareTo,// 是分享到什么位置，0 聊天 1 朋友圈 2 收藏
                        imagePath:imagePath,
                        thumbImage:"Icon-152.png",
                        thumbSize:"64",
                        url:cc.vv.share_url  
                }; 

                this.share_plugin.share(info);                
            }

            this._shareCallback = callback;
            this._shareType = shareTo;
            
        }
        else{
            cc.log3.debug("platform:" + cc.sys.os + " dosn't implement share.");
        }
    },
});
