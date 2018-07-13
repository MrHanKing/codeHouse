package com.eaugame.wtmahjong.mob;

import android.util.Log;
import android.widget.Toast;

import com.mob.MobSDK;

import org.cocos2dx.lib.Cocos2dxJavascriptJavaBridge;
import org.json.JSONObject;

import java.util.HashMap;
import java.io.File;

import com.eaugame.wtmahjong.SdkPlugin;
import cn.sharesdk.framework.Platform;
import cn.sharesdk.framework.PlatformActionListener;
import cn.sharesdk.framework.ShareSDK;
import cn.sharesdk.dingding.friends.Dingding;
import cn.sharesdk.onekeyshare.OnekeyShare;
import cn.sharesdk.onekeyshare.ShareContentCustomizeCallback;
import cn.sharesdk.wechat.friends.Wechat;
import cn.sharesdk.wechat.moments.WechatMoments;

/**
 * 分享的操作类，各个平台的分享代码写在这里。
 */

public class MobShare{

    private static SdkPlugin mInstace = null;

    private Platform platform = null;
    private MyPlatformActionListener myPlatformActionListener = null;

    public MobShare() {
        myPlatformActionListener = new MyPlatformActionListener();
    }

    public String getPlatfromName(int platfrom){
        switch (platfrom){
            case 1:
                return Wechat.NAME;
            case 2:
                return WechatMoments.NAME;
            case 3:
                return Dingding.NAME;
        }

        return Wechat.NAME;
    }

    //文字分享
    public void shareText(int platfrom,String title,String text) {

        final OnekeyShare oks = new OnekeyShare();

        if(platfrom != 0){
            oks.setPlatform(this.getPlatfromName(platfrom));
        }

        oks.disableSSOWhenAuthorize();
        oks.setTitle(title);
        oks.setText(text);
        oks.setCallback(myPlatformActionListener);
        oks.setShareType(Platform.SHARE_TEXT);
        oks.show(SdkPlugin.getActivity());
    }

    //本地图分享
    public void shareImg(int platfrom,String title,String imgurl,String url) {
        Log.d("weixinshare","" + imgurl);
        Log.d("weixinshare","" + url);

        final OnekeyShare oks = new OnekeyShare();

         if(platfrom != 0){
             oks.setPlatform(this.getPlatfromName(platfrom));
         }

//         //指定分享的平台，如果为空，还是会调用九宫格的平台列表界面
//         //关闭sso授权
//         oks.disableSSOWhenAuthorize();
//         oks.setTitle(title);
//         oks.setImagePath(imgurl);
// //		oks.setUrl(url);
         oks.setCallback(myPlatformActionListener);
//         oks.show(SdkPlugin.getActivity());

        /**
         * 下面的这些参数必须要写，某些不写会导致某些平台分享失败
         */
        // title标题，印象笔记、邮箱、信息、微信、人人网和QQ空间使用
        oks.setTitle(title);
        // titleUrl是标题的网络链接，仅在人人网和QQ空间使用
//        oks.setTitleUrl(url);
        // text是分享文本，所有平台都需要这个字段
        oks.setText(title);
        // imagePath是图片的本地路径，Linked-In以外的平台都支持此参数,
        // 使用 imagePath 必须保证SDcard下面存在此张图片
        //imagePath,imageUrl 必须保留一个，否则微信不能分享，或者分享过去的图片都是应用的 logo
        oks.setImagePath(imgurl);
        // url仅在微信（包括好友和朋友圈）中使用
        oks.setUrl(url);
        // comment是我对这条分享的评论，仅在人人网和QQ空间使用
//        oks.setComment("我是测试评论文本");
        // site是分享此内容的网站名称，仅在QQ空间使用
//        oks.setSite("网站的名字");
        // siteUrl是分享此内容的网站地址，仅在QQ空间使用
//        oks.setSiteUrl(url);

        oks.setShareType(Platform.SHARE_IMAGE);

        //启动分享GUI
        oks.show(SdkPlugin.getActivity());
    }

    //图文分享
    public void shareWeb(int platfrom,String title,String text,String imgurl,String url) {

        final OnekeyShare oks = new OnekeyShare();

        if(platfrom != 0){
            oks.setPlatform(this.getPlatfromName(platfrom));
        }

        //指定分享的平台，如果为空，还是会调用九宫格的平台列表界面
        //关闭sso授权
        oks.disableSSOWhenAuthorize();
        oks.setTitle(title);
        oks.setText(text);
        oks.setImageUrl(imgurl);
        oks.setUrl(url);
        oks.setCallback(myPlatformActionListener);
        oks.setShareType(Platform.SHARE_WEBPAGE);
        oks.show(SdkPlugin.getActivity());
    }


    class MyPlatformActionListener implements PlatformActionListener {
        @Override
        public void onComplete(Platform platform, int i, final HashMap<String, Object> hashMap) {
            Log.d("weixinlogin","--------------onComplete----------11------");
            SdkPlugin.getActivity().runOnGLThread(new Runnable() {
                @Override
                public void run() {
                    String eval = String.format("cc.vv.g3Plugin.onShareResult(%d,\"%s\");",1,"");

                    Cocos2dxJavascriptJavaBridge.evalString(eval);
                }
            });
        }

        @Override
        public void onError(Platform platform, int i, Throwable throwable) {
            Log.d("weixinlogin","--------------onError----------11------");
            throwable.printStackTrace();
            final String error = throwable.toString();
            SdkPlugin.getActivity().runOnGLThread(new Runnable() {
                @Override
                public void run() {
                    String eval = String.format("cc.vv.g3Plugin.onShareResult(%d,\"%s\");",-1,"");
                    Cocos2dxJavascriptJavaBridge.evalString(eval);
                }
            });
        }

        @Override
        public void onCancel(Platform platform, int i) {
            Log.d("weixinlogin","--------------onCancel----------11------");
            SdkPlugin.getActivity().runOnGLThread(new Runnable() {
                @Override
                public void run() {
                    String eval = String.format("cc.vv.g3Plugin.onShareResult(%d,\"%s\");",0,"");
                    Cocos2dxJavascriptJavaBridge.evalString(eval);
                }
            });
        }
    }
}

