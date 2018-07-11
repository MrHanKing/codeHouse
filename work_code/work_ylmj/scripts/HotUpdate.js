cc.log3 = require("Log");
var UpdatePanel = require('./components/UpdatePanel');

cc.Class({
    extends: cc.Component,

    properties: {
        lblVersion:cc.Label,
        panel: UpdatePanel,
        manifestUrl: cc.RawAsset,
        updateUI: cc.Node,
        _updating: false,
        _canRetry: false,
        _num:0,
    },

    updateCb: function (event) {
        var needRestart = false;
        var failed = false;
        switch (event.getEventCode())
        {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                this.panel.info.string = '本地配置文件不存在.';
                failed = true;
                break;
            case jsb.EventAssetsManager.UPDATE_PROGRESSION:

                this.panel.byteProgress.progress = event.getPercent();
                this.panel.fileProgress.progress = event.getPercentByFile();
                cc.log("byteProgress:" + event.getPercent());
                cc.log("fileProgress:" + event.getPercentByFile());

                // var num = 0;
                // if (isNaN(event.getPercent())) {
                //     cc.log("haha NaN")
                // }else{
                //     num = event.getPercent().toFixed(2) * 100
                // }
                this._num = this._num + 1;
                var index = this._num % 3;
                if (index == 0) {
                    this.panel.info.string = "更新资源下载中.";
                }else if (index == 1) {
                    this.panel.info.string = "更新资源下载中..";
                }else if (index == 2) {
                    this.panel.info.string = "更新资源下载中...";
                }else{
                    this.panel.info.string = "更新资源下载中.";
                }
               
                var msg = event.getMessage();
                if (msg) {
                    cc.log("EventAssetsManager msg:" + event.getPercent().toFixed(2) + '% : ' + msg);
                }
                break;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                this.panel.info.string = '网络连接失败，请重试.';
                this.panel.retryBtn.active = true;
                failed = true;
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                this.panel.info.string = '已经是最新版本.';
                cc.director.loadScene("loading");
                failed = true;
                break;
            case jsb.EventAssetsManager.UPDATE_FINISHED:
                this.panel.info.string = '更新完成. ';
                needRestart = true;
                break;
            case jsb.EventAssetsManager.UPDATE_FAILED:
                this.panel.info.string = '更新失败. ';
                this.panel.retryBtn.active = true;
                this._updating = false;
                this._canRetry = true;
                break;
            case jsb.EventAssetsManager.ERROR_UPDATING:
                this.panel.info.string = '资源更新失败';
                break;
            case jsb.EventAssetsManager.ERROR_DECOMPRESS:
                this.panel.info.string = '未知错误';
                break;
            default:
                break;
        }

        if (failed) {
            cc.eventManager.removeListener(this._updateListener);
            this._updateListener = null;
            this._updating = false;
        }

        if (needRestart) {
            cc.eventManager.removeListener(this._updateListener);
            this._updateListener = null;
            // Prepend the manifest's search path
            var searchPaths = jsb.fileUtils.getSearchPaths();
            var newPaths = this._am.getLocalManifest().getSearchPaths();
            cc.log3.debug(JSON.stringify(newPaths));
            Array.prototype.unshift(searchPaths, newPaths);
            // This value will be retrieved and appended to the default search path during game startup,
            // please refer to samples/js-tests/main.js for detailed usage.
            // !!! Re-add the search paths in main.js is very important, otherwise, new scripts won't take effect.
            cc.sys.localStorage.setItem('HotUpdateSearchPaths', JSON.stringify(searchPaths));

            jsb.fileUtils.setSearchPaths(searchPaths);
            cc.game.restart();
        }
    },
    
    retry: function () {
        // if (!this._updating && this._canRetry) {
        //     this.panel.retryBtn.active = false;
        //     this._canRetry = false;
            
        //     this.panel.info.string = '正在重试...';
        //     this._am.downloadFailedAssets();
        // }

        // //开始更新
        // if (this._am && !this._updating) {
        //     this._updateListener = new jsb.EventListenerAssetsManager(this._am, this.updateCb.bind(this));
        //     cc.eventManager.addListener(this._updateListener, 1);

        //     this._failCount = 0;
        //     this._am.update();
        //     this._updating = true;
        // }
        cc.game.restart();
    },
    
    show: function () {
        if (this.updateUI.active === false) {
            this.updateUI.active = true;
        }
    },

    // use this for initialization
    onLoad: function () {

        this.lblVersion.string = cc.VERSION;
        // Hot update is only available in Native build
        if (!cc.sys.isNative) {
            return;
        }
        var storagePath = ((jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + 'wtqp-remote-asset');
        cc.log('Storage path for remote asset : ' + storagePath);

        // cc.log('Local manifest URL : ' + this.manifestUrl);
        this._am = new jsb.AssetsManager(this.manifestUrl, storagePath);
        if (!cc.sys.ENABLE_GC_FOR_NATIVE_OBJECTS) {
            this._am.retain();
        }

        // Setup your own version compare handler, versionA and B is versions in string
        // if the return value greater than 0, versionA is greater than B,
        // if the return value equals 0, versionA equals to B,
        // if the return value smaller than 0, versionA is smaller than B.
        this._am.setVersionCompareHandle(function (versionA, versionB) {
            cc.log("JS Custom Version Compare: version A is " + versionA + ', version B is ' + versionB);
            var vA = versionA.split('.');
            var vB = versionB.split('.');
            for (var i = 0; i < vA.length; ++i) {
                var a = parseInt(vA[i]);
                var b = parseInt(vB[i] || 0);
                if (a === b) {
                    continue;
                }
                else {
                    return a - b;
                }
            }
            if (vB.length > vA.length) {
                return -1;
            }
            else {
                return 0;
            }
        });

        var panel = this.panel;
        // Setup the verification callback, but we don't have md5 check function yet, so only print some message
        // Return true if the verification passed, otherwise return false
        this._am.setVerifyCallback(function (path, asset) {
            // When asset is compressed, we don't need to check its md5, because zip file have been deleted.
            var compressed = asset.compressed;
            // Retrieve the correct md5 value.
            var expectedMD5 = asset.md5;
            // asset.path is relative path and path is absolute.
            var relativePath = asset.path;
            // The size of asset file, but this value could be absent.
            var size = asset.size;
            if (compressed) {
                //panel.info.string = "游戏内容验证中..";
                return true;
            }
            else {
                //panel.info.string = "游戏内容验证中..";
                return true;
            }
        });

        if (cc.sys.os === cc.sys.OS_ANDROID) {
            this._am.setMaxConcurrentTask(2);
        }

        //开始更新
        if (this._am && !this._updating) {
            this._updateListener = new jsb.EventListenerAssetsManager(this._am, this.updateCb.bind(this));
            cc.eventManager.addListener(this._updateListener, 1);

            this._failCount = 0;
            this._am.update();
            this._updating = true;
        }

        this.panel.byteProgress.progress = 0;
        this.panel.fileProgress.progress = 0;
        
    },

    onDestroy: function () {
        if (this._updateListener) {
            cc.eventManager.removeListener(this._updateListener);
            this._updateListener = null;
        }
        if (this._am && !cc.sys.ENABLE_GC_FOR_NATIVE_OBJECTS) {
            this._am.release();
        }
    }
});
