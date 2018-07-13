if(window.io == null){
    window.io = require("socket-io");
}
 
var Global = cc.Class({
    extends: cc.Component,
    statics: {
        ip:"",
        sio:null,
        isPinging:false,
        fnDisconnect:null,
        handlers:{},
        addHandler:function(event,fn){
            if(this.handlers[event]){
                cc.log3.debug("event:" + event + "' handler has been registered.");
                return;
            }

            var handler = function(data){
                cc.log(event + "(" + typeof(data) + "):" + (data? data.toString():"null"));
                if(event != "disconnect" && typeof(data) == "string"){
                    data = JSON.parse(data);
                }
                cc.log(event + ":");
                cc.log(data);
                fn(data);
            };
            
            this.handlers[event] = handler; 
            if(this.sio){
                cc.log3.debug("register:function " + event);
                this.sio.on(event,handler);
            }
        },
        connect:function(fnConnect,fnError) {
            var self = this;
            
            var opts = {
                'reconnection':false,
                'force new connection': true,
                'transports':['websocket', 'polling']
            }
            this.sio = window.io.connect(this.ip,opts);
            this.sio.on('reconnect',function(){
                cc.log3.debug('reconnection');
            });
            this.sio.on('connect',function(data){
                self.sio.connected = true;
                fnConnect(data);
            });
            
            this.sio.on('disconnect',function(data){
                cc.log3.debug("disconnect");
                self.sio.connected = false;
                self.close();
            });
            
            this.sio.on('connect_failed',function (){
                cc.log3.debug('connect_failed');
            });
            
            for(var key in this.handlers){
                var value = this.handlers[key];
                if(typeof(value) == "function"){
                    if(key == 'disconnect'){
                        this.fnDisconnect = value;
                    }
                    else{
                        cc.log3.debug("register:function " + key);
                        this.sio.on(key,value);                        
                    }
                }
            }
            
            this.startHearbeat();
        },
        
        startHearbeat:function(){
            this.sio.on('game_pong',function(){
                cc.log3.debug('game_pong');
                self.lastRecieveTime = Date.now(); 
            });
            this.lastRecieveTime = Date.now();
            var self = this;
            cc.log3.debug(1);
            if(!self.isPinging){
                cc.log3.debug(1);
                self.isPinging = true;
                setInterval(function(){
                    cc.log3.debug(3);
                    if(self.sio){
                        cc.log3.debug(4);
                        if(Date.now() - self.lastRecieveTime > 20000){
                            self.close();
                        }
                        else{
                            self.ping();
                        }                        
                    }
                },2000);
            }   
        },
        send:function(event,data){
            cc.log("send:" + event);
            if(this.sio.connected){
                if(data != null && (typeof(data) == "object")){
                    data = JSON.stringify(data);
                    //cc.log3.debug(data);              
                }
                this.sio.emit(event,data);                
            }
        },
        
        ping:function(){
            this.send('game_ping');
        },
        
        close:function(){
            cc.log3.debug('close');
            if(this.sio && this.sio.connected){
                this.sio.connected = false;
                this.sio.disconnect();
                this.sio = null;
            }
            if(this.fnDisconnect){
                this.fnDisconnect();
                this.fnDisconnect = null;
            }
        },
        
        test:function(fnResult){
            var xhr = null;
            var fn = function(ret){
                fnResult(ret.isonline);
                xhr = null;
            }
            
            var arr = this.ip.split(':');
            var data = {
                account:cc.vv.userMgr.account,
                sign:cc.vv.userMgr.sign,
                ip:arr[0],
                port:arr[1],
            }
            xhr = cc.vv.http.sendRequest("/is_server_online",data,fn);
            setTimeout(function(){
                if(xhr){
                    xhr.abort();
                    fnResult(false);                    
                }
            },3000);
            /*
            var opts = {
                'reconnection':false,
                'force new connection': true,
                'transports':['websocket', 'polling']
            }
            var self = this;
            this.testsio = window.io.connect(this.ip,opts);
            this.testsio.on('connect',function(){
                cc.log3.debug('connect');
                self.testsio.close();
                self.testsio = null;
                fnResult(true);
            });
            this.testsio.on('connect_error',function(){
                cc.log3.debug('connect_failed');
                self.testsio = null;
                fnResult(false);
            });
            */
        }
    },
});