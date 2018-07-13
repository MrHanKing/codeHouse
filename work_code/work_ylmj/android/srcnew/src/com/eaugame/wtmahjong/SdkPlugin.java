package com.eaugame.wtmahjong;

import android.app.Activity;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.Log;
import android.content.ClipData;
import android.content.ClipboardManager;
import static android.content.Context.CLIPBOARD_SERVICE;
import android.content.Intent;
import android.net.Uri;

import com.baidu.location.BDAbstractLocationListener;
import com.baidu.location.BDLocation;
import com.baidu.location.BDLocationListener;
import com.baidu.location.LocationClient;
import com.baidu.location.LocationClientOption;
import com.mob.MobSDK;

import org.cocos2dx.javascript.AppActivity;

import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.util.HashMap;

import com.eaugame.wtmahjong.mob.MobAuthorize;
import com.eaugame.wtmahjong.mob.MobShare;

import cn.sharesdk.framework.Platform;
import cn.sharesdk.framework.PlatformActionListener;
import cn.sharesdk.framework.ShareSDK;
import cn.sharesdk.onekeyshare.OnekeyShare;
import cn.sharesdk.wechat.friends.Wechat;


public class SdkPlugin {
    private static SdkPlugin mInstace = null;
    private static AppActivity mActivity = null;
    private static String roomid = null;
    private static ClipboardManager myClipboard;

    private static Platform wechat = null;
    private static String wxAutoMessage = null;
    private static String myloc = "";
    private static String locationPos = "";
    private static boolean isWxLoginSuccess = false;
    public LocationClient mLocationClient = null;
    private MyLocationListener myListener = new MyLocationListener();
    /**
     * 单例化
     * @return
     */
    public static SdkPlugin getInstance() {
        if (null == mInstace){
            mInstace = new SdkPlugin();
        }
        return mInstace;
    }

    /**
     * 返回 Activity
     * @return Activity
     */
    public static AppActivity getActivity(){
        return SdkPlugin.mActivity;
    }

    //文字分享
    public static void shareText(int platfrom,String title,String text){
        MobShare share = new MobShare();
        share.shareText(platfrom,title,text);
    }

    //图文分享
    public static void shareWeb(int platfrom,String title,String text,String imgurl,String url){
        MobShare share = new MobShare();
        share.shareWeb(platfrom,title,text,imgurl,url);
    }

    //图片分享
    public static void shareImg(int platfrom,String title,String imgurl,String url){
        MobShare share = new MobShare();
        share.shareImg(platfrom,title,imgurl,url);
    }

    //授权登录
    public static void login(int platfrom){
        MobAuthorize auth = new MobAuthorize();
        auth.login(platfrom);
    }

    //取消授权
    public static void logout(int platfrom){
        MobAuthorize auth = new MobAuthorize();
        auth.logout(platfrom);
    }

    /**
     * 预先请求一次，弹出授权
     */
    public static void init(){
        SdkPlugin.mActivity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
            }
        });
    }

    /**
     * 保存截屏图片
     * @param path
     * @param img
     * @param weidth
     * @param heidth
     * @param weidth2
     * @param heidth2
     */
    public static void saveBitmap(String path,String img,int weidth,int heidth,int weidth2,int heidth2) {

        Bitmap bmp = BitmapFactory.decodeFile(path + img);
        Bitmap thumbBmp1 = Bitmap.createScaledBitmap(bmp, weidth, heidth, true);
        Bitmap thumbBmp2 = Bitmap.createScaledBitmap(bmp, weidth2, heidth2, true);

        SdkPlugin.saveBitmap(path + "result_share_1.jpg",thumbBmp1);
        SdkPlugin.saveBitmap(path + "result_share_2.jpg",thumbBmp2);

    }

    //保存图片
    private static void saveBitmap(String filepath,Bitmap bitmap) {

        File file = new File(filepath);//将要保存图片的路径
        Log.d("111111111",filepath);

        try {
            BufferedOutputStream bos = new BufferedOutputStream(new FileOutputStream(file));
            bitmap.compress(Bitmap.CompressFormat.JPEG, 100, bos);
            bos.flush();
            bos.close();
            Log.d("111111111","ok");
        } catch (Exception e) {
            e.printStackTrace();
            Log.d("111111111",e.toString());
        }
    }

    /**
     * 获取定位 经纬度
     * @return
     */
    public static String getLocation(){
        return SdkPlugin.locationPos;
    }

    //获得地址描述
    public static String getLocationDes(){
        return SdkPlugin.myloc;
    }

    /**
     * 解析请求参数
     * @param key
     * @param url
     * @return
     */
    private String getQueryItemValue(String key, String url){

        for(String param:url.split("&")){
            String[] elts = param.split("=");
            if(elts.length <2 )continue;
            if(elts[0].equals(key))return elts[1];
        }

        return "";
    }

    /**
     * 获取内存中的房间号
     * @return
     */
    public static  String getRoomid(){
        if(SdkPlugin.roomid != null){
            String roomid = SdkPlugin.roomid;
            SdkPlugin.roomid = null;
            return roomid;
        }

        ClipData abc = myClipboard.getPrimaryClip();

        if(abc == null || abc.getItemCount() == 0){
            return "";
        }

        ClipData.Item item = abc.getItemAt(0);
        String text = item.getText().toString();

        myClipboard.setPrimaryClip(ClipData.newPlainText("text", ""));

        String roomid = SdkPlugin.getInstance().getQueryItemValue("roomid",text);
        if(roomid.length() == 6)return roomid;

        return "";
    }

    /**
     * JAVA层初始化
     * @param activity
     */
    public void init(AppActivity activity) {
        SdkPlugin.mActivity = activity;

        //初
//        MobSDK.init(activity);
        //sharesdk初始化
        MobSDK.init(activity, "2475dc9592cee", "7065342b7abd3f3296abd2910810381a");

        //微信
        wechat= ShareSDK.getPlatform(Wechat.NAME);

        startLocate(activity);

        //剪贴板
        myClipboard = (ClipboardManager)activity.getSystemService(CLIPBOARD_SERVICE);

        /**
         * 获取内容
         */
        Intent getvalue = activity.getIntent();
        String action = getvalue.getAction();

        if(Intent.ACTION_VIEW.equals(action)){
            Uri uri = getvalue.getData();
            if(uri != null){
                roomid = uri.getQueryParameter("roomid");
            }
        }

    }
    /**
     * 定位
     */
    private void startLocate(AppActivity activity) {
        mLocationClient = new LocationClient(activity);     //声明LocationClient类
        mLocationClient.registerLocationListener(myListener);    //注册监听函数
        LocationClientOption option = new LocationClientOption();

        option.setIsNeedAddress(true);
//可选，是否需要地址信息，默认为不需要，即参数为false
//如果开发者需要获得当前点的地址信息，此处必须为true
        option.setLocationMode(LocationClientOption.LocationMode.Hight_Accuracy);
//可选，设置定位模式，默认高精度
//LocationMode.Hight_Accuracy：高精度；
//LocationMode. Battery_Saving：低功耗；
//LocationMode. Device_Sensors：仅使用设备；

        option.setCoorType("bd09ll");
//可选，设置返回经纬度坐标类型，默认gcj02
//gcj02：国测局坐标；
//bd09ll：百度经纬度坐标；
//bd09：百度墨卡托坐标；
//海外地区定位，无需设置坐标类型，统一返回wgs84类型坐标

        option.setScanSpan(1000);
//可选，设置发起定位请求的间隔，int类型，单位ms
//如果设置为0，则代表单次定位，即仅定位一次，默认为0
//如果设置非0，需设置1000ms以上才有效

        option.setOpenGps(true);
//可选，设置是否使用gps，默认false
//使用高精度和仅用设备两种定位模式的，参数必须设置为true

        option.setLocationNotify(true);
//可选，设置是否当GPS有效时按照1S/1次频率输出GPS结果，默认false

        option.setIgnoreKillProcess(false);
//可选，定位SDK内部是一个service，并放到了独立进程。
//设置是否在stop的时候杀死这个进程，默认（建议）不杀死，即setIgnoreKillProcess(true)

        option.SetIgnoreCacheException(false);
//可选，设置是否收集Crash信息，默认收集，即参数为false

        option.setWifiCacheTimeOut(5*60*1000);
//可选，7.2版本新增能力
//如果设置了该接口，首次启动定位时，会先判断当前WiFi是否超出有效期，若超出有效期，会先重新扫描WiFi，然后定位

        option.setEnableSimulateGps(false);
//可选，设置是否需要过滤GPS仿真结果，默认需要，即参数为false

        mLocationClient.setLocOption(option);
//mLocationClient为第二步初始化过的LocationClient对象
//需将配置好的LocationClientOption对象，通过setLocOption方法传递给LocationClient对象使用
//更多LocationClientOption的配置，请参照类参考中LocationClientOption类的详细说明
        //开启定位
        mLocationClient.start();
    }

    private class MyLocationListener implements BDLocationListener {

        @Override
        public void onReceiveLocation(BDLocation location) {
            double latitude = location.getLatitude();    //获取纬度信息
            double longitude = location.getLongitude();    //获取经度信息
            float radius = location.getRadius();    //获取定位精度，默认值为0.0f

            String coorType = location.getCoorType();
            //获取经纬度坐标类型，以LocationClientOption中设置过的坐标类型为准

            int errorCode = location.getLocType();
            //获取定位类型、定位错误返回码，具体信息可参照类参考中BDLocation类中的说明

            String addr = location.getAddrStr();    //获取详细地址信息
            String country = location.getCountry();    //获取国家
            String province = location.getProvince();    //获取省份
            String city = location.getCity();    //获取城市
            String district = location.getDistrict();    //获取区县
            String street = location.getStreet();    //获取街道信息
//            Log.e("描述：", "errorCode:"+errorCode +",详细地址:"+addr + ",经度："+longitude+ ",纬度："+latitude+ ",国家："+country+ ",province："+province+ ",city："+city+ ",district："+district+ ",street："+street);
            SdkPlugin.myloc = addr;
            SdkPlugin.locationPos = longitude + "|" + latitude;
        }
    }
    /**
     *
     * 微信登录
     *
     * */
    public static void weChatLogin(){
        Log.d("weixinlogin","________________________");
        //设置微信授权相关信息
        wechat.setPlatformActionListener(new PlatformActionListener() {
            @Override
            public void onComplete(Platform platform, int i, HashMap<String, Object> hashMap) {
                Log.d("weixinlogin","--------------onComplete----------11------");
                wxAutoMessage = platform.getDb().exportData();
                //微信登录成功
                isWxLoginSuccess = true;
//                Toast.makeText(AppActivity.app, "登录成功", Toast.LENGTH_SHORT).show();
                Log.d("weixinlogin",wxAutoMessage);
                Log.d("weixinlogin","--------------<<<<<<<<<<<<<<<<<<<----------------");
                System.out.println(hashMap);
            }
            @Override
            public void onError(Platform platform, int i, Throwable throwable) {
                System.out.println("错误 onError11");
                throwable.printStackTrace();
            }
            @Override
            public void onCancel(Platform platform, int i) {
                System.out.println("已经取消操作11");
            }
        });
        wechat.authorize();
        Platform wechatPlatform = ShareSDK.getPlatform(Wechat.NAME);
        Log.d("weixinlogin","<<<<---------------->>>>wechatPlatFrom is " + wechatPlatform);
    }
    public static boolean wxLoginIsSuccess(){
        Log.d("weixinlogin","微信是否登录成功：" + isWxLoginSuccess);
        return isWxLoginSuccess;
    }
    public static String getWxAutoMessage(){
        Log.d("weixinlogin","微信认证信息是：" + wxAutoMessage);
        return wxAutoMessage;
    }
}
