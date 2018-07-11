//var URL = "http://120.26.127.9:8000";
//var URL = "http://106.15.103.135:8000";
var URL = "http://wtgm.legaogame.com:8000";
// var URL = "http://192.168.2.191:8000";
//商城等其他请求url
var OTHERURL = "http://wtmjhot.legaogame.com/api/proxy";
var HTTP = cc.Class({
    extends: cc.Component,

    statics:{
        sessionId : 0,
        userId : 0,
        master_url:URL,
        url:URL,
        sendRequest : function(path,data,handler,extraUrl){
            var xhr = cc.loader.getXMLHttpRequest();
            xhr.timeout = 5000;
            var str = "?";
            for(var k in data){
                if(str != "?"){
                    str += "&";
                }
                str += k + "=" + data[k];
            }
            if(extraUrl == null){
                extraUrl = HTTP.url;
            }
            var requestURL = extraUrl + path + encodeURI(str);
            cc.log("RequestURL:" + requestURL);
            xhr.open("GET",requestURL, true);
            if (cc.sys.isNative){
                xhr.setRequestHeader("Accept-Encoding","gzip,deflate","text/html;charset=UTF-8");
            }
            
            xhr.onreadystatechange = function() {
                if(xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 300)){
                    cc.log("http res("+ xhr.responseText.length + "):" + xhr.responseText);
                    try {
                        var ret = JSON.parse(xhr.responseText);
                        if(handler !== null){
                            handler(ret);
                        }                        /* code */
                    } catch (e) {
                        cc.log("callback err:" + e);
                        //handler(null);
                    }
                    finally{
                        if(cc.vv && cc.vv.wc){
                        //       cc.vv.wc.hide();    
                        }
                    }
                }
            };
            
            if(cc.vv && cc.vv.wc){
                //cc.vv.wc.show();
            }
            xhr.send();
            return xhr;
        },

        sendOtherRequest : function(path,data,handler){
            var xhr = cc.loader.getXMLHttpRequest();
            xhr.timeout = 5000;

            var str = "";
            for(var k in data){
                if(str == ""){
                    str = "?"
                }
                if(str != "?"){
                    str += "&";
                }
                str += k + "=" + data[k];
            }
            var requestURL = OTHERURL + path + encodeURI(str);
            cc.log("RequestURL:" + requestURL);
            xhr.open("GET",requestURL, true);
            if (cc.sys.isNative){
                xhr.setRequestHeader("Accept-Encoding","gzip,deflate","text/html;charset=UTF-8");
            }
            
            xhr.onreadystatechange = function() {
                if(xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 300)){
                    cc.log("http res("+ xhr.responseText.length + "):" + xhr.responseText);
                    try {
                        var ret = JSON.parse(xhr.responseText);
                        if(handler !== null){
                            handler(ret);
                        }
                    } catch (e) {
                        cc.log3.debug("err:" + e);
                        //handler(null);
                    }
                    finally{
                        if(cc.vv && cc.vv.wc){
                        //       cc.vv.wc.hide();    
                        }
                    }
                }
            };
            
            if(cc.vv && cc.vv.wc){
                //cc.vv.wc.show();
            }
            xhr.send();
            return xhr;
        },

        //获取access_token和openid等信息并将这些信息传给服务端  
        getCode : function(refreshToken, callback){  
            var self = this;  
            var url = 'https://api.weixin.qq.com/sns/oauth2/refresh_token?appid=wx5183258397fe835e&grant_type=refresh_token&refresh_token='+refreshToken;
            console.log("RequestURL:" + url);
            var xhr = new XMLHttpRequest();  
            xhr.onreadystatechange = function(){  
                if(xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 400)){  
                    self.weixinResponse = xhr.responseText;
                    console.log("in getCode response is " + self.weixinResponse);  
                    //将数据放回出去  
                    callback(self.weixinResponse);  
                }  
            }  
            xhr.open("POST",url);  
            xhr.send();  
        },
    },
});