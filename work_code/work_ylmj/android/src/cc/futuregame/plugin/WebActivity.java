package cc.futuregame.plugin;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import cc.futuregame.majiang.jinan.R;


public class WebActivity extends Activity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.plugin_web);

        //新页面接收数据
        Bundle bundle = this.getIntent().getExtras();
        String url = bundle.getString("url");

        //WebView
        WebView webView=(WebView)findViewById(R.id.Toweb);

        webView.getSettings().setAllowFileAccess(true);
        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setAllowFileAccess(true);
        webView.getSettings().setAppCacheEnabled(true);
        webView.getSettings().setDomStorageEnabled(true);
        webView.getSettings().setDatabaseEnabled(true);
        webView.loadUrl(url);

        webView.setWebViewClient(new WebViewClient() {

        @Override
        public boolean shouldOverrideUrlLoading(WebView view, String url) {

            // 如下方案可在非微信内部WebView的H5页面中调出微信支付
            if (url.startsWith("weixin://wap/pay?")) {
                Intent intent = new Intent();
                intent.setAction(Intent.ACTION_VIEW);
                intent.setData(Uri.parse(url));
                startActivity(intent);
                WebActivity.this.finish();
            } else {
                view.loadUrl(url);
            }
            return true;
        }
        });
    }
}
