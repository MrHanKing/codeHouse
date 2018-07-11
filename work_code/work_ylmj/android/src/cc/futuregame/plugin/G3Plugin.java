package cc.futuregame.plugin;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.net.Uri;
import android.os.Bundle;

import com.tencent.mm.sdk.openapi.IWXAPI;
import com.tencent.mm.sdk.openapi.SendMessageToWX;
import com.tencent.mm.sdk.openapi.WXAPIFactory;
import com.tencent.mm.sdk.openapi.WXImageObject;
import com.tencent.mm.sdk.openapi.WXMediaMessage;

import static android.content.Context.CLIPBOARD_SERVICE;

/**
 * Created by Magicin on 2017/6/18.
 */

public class G3Plugin {

    private static G3Plugin mInstace = null;
    private static Activity mActivity = null;
    private static Location location = null;
    private static String roomid = null;

    public static Activity instance;

    public static IWXAPI wxapi;
    private static String APP_ID = "wx5d614d90c2b02856";

    private static ClipboardManager myClipboard;


    //位置监听
    private LocationListener locationListener = new LocationListener() {
        /**
         * 位置信息变化时触发:当坐标改变时触发此函数，如果Provider传进相同的坐标，它就不会被触发
         * @param location
         */
        @Override
        public void onLocationChanged(Location location) {
            G3Plugin.location = location;
        }

        /**
         * GPS状态变化时触发:Provider被disable时触发此函数，比如GPS被关闭
         * @param provider
         * @param status
         * @param extras
         */
        @Override
        public void onStatusChanged(String provider, int status, Bundle extras) {
        }

        /**
         * 方法描述：GPS开启时触发
         * @param provider
         */
        @Override
        public void onProviderEnabled(String provider) {
        }

        /**
         * 方法描述： GPS禁用时触发
         * @param provider
         */
        @Override
        public void onProviderDisabled(String provider) {
        }
    };

    public static G3Plugin getInstance() {
        if (null == mInstace){
            mInstace = new G3Plugin();
        }
        return mInstace;
    }

    public void init(Activity activity) {
        G3Plugin.mActivity = activity;

        //注册微信
        wxapi = WXAPIFactory.createWXAPI(activity, APP_ID, true);
        wxapi.registerApp(APP_ID);

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
     * 预先请求一次，弹出授权
     */
    public static void init(){
        G3Plugin.mActivity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                G3Plugin.getInstance().startLocation();
            }
        });
    }

    private static String buildTransaction(final String type) {
        return (type == null) ? String.valueOf(System.currentTimeMillis()) : type + System.currentTimeMillis();
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
     * 微信分享图片
     * @param to
     * @param imgurl
     */
    public static void WxShareImg(String to,String imgurl){

        try{

            Bitmap bmp = BitmapFactory.decodeFile(imgurl);
            WXImageObject imgObj = new WXImageObject(bmp);

            int heidth = 100;
            float scale = heidth / bmp.getHeight();
            int weidth = (int)(bmp.getWidth() * scale);

            WXMediaMessage msg = new WXMediaMessage();
            msg.mediaObject = imgObj;

            Bitmap thumbBmp = Bitmap.createScaledBitmap(bmp, weidth, heidth, true);
            msg.setThumbImage(thumbBmp);
            bmp.recycle();
            SendMessageToWX.Req req = new SendMessageToWX.Req();
            req.transaction = String.valueOf(System.currentTimeMillis());
            req.message = msg;
            req.scene = "0".equals(to)?SendMessageToWX.Req.WXSceneSession:SendMessageToWX.Req.WXSceneTimeline;

            wxapi.sendReq(req);
        }
        catch(Exception e){
            e.printStackTrace();
        }
    }

    /**
     * 获得短链分享的房间号
     * @return
     */
    @SuppressLint("NewApi")
    public static  String getRoomid(){

        if(G3Plugin.roomid != null){
            String roomid = G3Plugin.roomid;
            G3Plugin.roomid = null;
            return roomid;
        }

        ClipData abc = myClipboard.getPrimaryClip();

        if(abc == null || abc.getItemCount() == 0){
            return "";
        }

        ClipData.Item item = abc.getItemAt(0);
        String text = item.getText().toString();

        myClipboard.setPrimaryClip(ClipData.newPlainText("text", ""));

        String roomid = G3Plugin.getInstance().getQueryItemValue("roomid",text);
        if(roomid.length() == 6)return roomid;

        return "";
    }

    /**
     * 开启位置监听
     */
    private void startLocation(){

        //获取定位服务
        LocationManager locationManager = (LocationManager) mActivity.getSystemService(Context.LOCATION_SERVICE);
        String provider;

//        //获取当前可用的位置控制器
//        List<String> list = locationManager.getProviders(true);
//
//        if (list.contains(LocationManager.GPS_PROVIDER)) {
//            //是否为GPS位置控制器
//            provider = LocationManager.GPS_PROVIDER;
//        }
//        else if (list.contains(LocationManager.NETWORK_PROVIDER)) {
            //是否为网络位置控制器
            provider = LocationManager.NETWORK_PROVIDER;
//        }else if (list.contains(LocationManager.PASSIVE_PROVIDER)) {
//            //是否为网络位置控制器
//            provider = LocationManager.PASSIVE_PROVIDER;
//        }
//        else {
//            return;
//        }

        G3Plugin.location = locationManager.getLastKnownLocation(provider);

//        if(G3Plugin.location ==null){
//            G3Plugin.location = locationManager.getLastKnownLocation(LocationManager.NETWORK_PROVIDER);
//        }

        // 设置监听*器，自动更新的最小时间为间隔N秒(1秒为1*1000，这样写主要为了方便)或最小位移变化超过N米
        locationManager.requestLocationUpdates(provider, 100000,10, locationListener);
    }

    /**
     * 内部浏览器调微信支付
     * @param url
     */
    public static void wxpay(String url){

        Intent intent = new Intent(mActivity, WebActivity.class);

        //用Bundle携带数据
        Bundle bundle=new Bundle();
        bundle.putString("url",url);
        intent.putExtras(bundle);

        mActivity.startActivity(intent);
    }

    /**
     * 获取定位
     * @return
     */
    public static String getLocation(){

        if(G3Plugin.location == null){
            return "";
        }

        return G3Plugin.location.getLongitude() + "|" + G3Plugin.location.getLatitude();
    }
}
