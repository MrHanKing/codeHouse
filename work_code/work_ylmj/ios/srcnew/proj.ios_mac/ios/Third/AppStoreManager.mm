//
//  AppStoreManager.m
//  wtqp-mobile
//
//  Created by wyl on 2018/7/3.
//

#import "AppStoreManager.h"
#import <StoreKit/StoreKit.h>
#import "AppPurchaseTool.h"
#import "cocos2d.h"
#include "cocos/scripting/js-bindings/jswrapper/SeApi.h"
@interface AppStoreManager ()<AppPurchaseToolDelegate>


@end
@implementation AppStoreManager
static AppStoreManager * manager;
+(AppStoreManager*)instance{
  
    if(!manager){
        manager = [AppStoreManager new];
    }
    return manager;
}

-(void)setManage:(NSString*)ident{
    //获取单例
    AppPurchaseTool *IAPTool = [AppPurchaseTool defaultTool];
    //    [[YQInAppPurchaseTool defaultTool]buyProduct:@"pay10712"];
    //设置代理
    IAPTool.delegate = self;
    NSLog(@"canceld:%@====",ident);
    //购买后，向苹果服务器验证一下购买结果。默认为YES。不建议关闭
    //IAPTool.CheckAfterPay = NO;
    NSArray * arr = [NSArray arrayWithObject:ident];
    //向苹果询问哪些商品能够购买
    [IAPTool requestProductsWithProductArray:arr];
}
//IAP工具已获得可购买的商品
- (void)IAPToolGotProducts:(NSMutableArray *)products {
    if (products.count > 0) {
        SKProduct *product = products[0];
        [[AppPurchaseTool defaultTool]buyProduct:product.productIdentifier];
    }
    
}
//支付失败/取消
-(void)IAPToolCanceldWithProductID:(NSString *)productID {
    NSLog(@"canceld:%@====%ld",productID,(long)SKPaymentTransactionStateFailed);
    [self getJsState:SKPaymentTransactionStateFailed Msg:@"支付失败"];
}
//支付成功了，并开始向苹果服务器进行验证（若CheckAfterPay为NO，则不会经过此步骤）
-(void)IAPToolBeginCheckingdWithProductID:(NSString *)productID {
    NSLog(@"BeginChecking:%@",productID);
    [self getJsState:SKPaymentTransactionStatePurchased Msg:@"支付成功"];
//    [SVProgressHUD showWithStatus:@"购买成功，正在验证购买"];
}
//商品被重复验证了
-(void)IAPToolCheckRedundantWithProductID:(NSString *)productID {
    NSLog(@"CheckRedundant:%@",productID);
    [self getJsState:7 Msg:@"重复验证"];
//    [SVProgressHUD showInfoWithStatus:@"重复验证了"];
}
//商品完全购买成功且验证成功了。（若CheckAfterPay为NO，则会在购买成功后直接触发此方法）
-(void)IAPToolBoughtProductSuccessedWithProductID:(NSString *)productID
                                          andInfo:(NSDictionary *)infoDic {
    NSLog(@"BoughtSuccessed:%@",productID);
    NSLog(@"successedInfo:%@",infoDic);
    [self getJsState:SKPaymentTransactionStatePurchased Msg:@"购买成功"];
//    [SVProgressHUD showSuccessWithStatus:@"购买成功！(相关信息已打印)"];
}
//商品购买成功了，但向苹果服务器验证失败了
//2种可能：
//1，设备越狱了，使用了插件，在虚假购买。
//2，验证的时候网络突然中断了。（一般极少出现，因为购买的时候是需要网络的）
-(void)IAPToolCheckFailedWithProductID:(NSString *)productID
                               andInfo:(NSData *)infoData {
    NSLog(@"CheckFailed:%@",productID);
    [self getJsState:8 Msg:@"购买成功，但验证失败"];
//    [SVProgressHUD showErrorWithStatus:@"验证失败了"];
}
//恢复了已购买的商品（仅限永久有效商品）
-(void)IAPToolRestoredProductID:(NSString *)productID {
    NSLog(@"Restored:%@",productID);
    
    [self getJsState:SKPaymentTransactionStateRestored Msg:@"恢复已购买商品"];
//    [SVProgressHUD showSuccessWithStatus:@"成功恢复了商品（已打印）"];
}
//内购系统错误了
-(void)IAPToolSysWrong {
    NSLog(@"SysWrong");
    [self getJsState:9 Msg:@"内购系统出错"];
//    [SVProgressHUD showErrorWithStatus:@"内购系统出错"];
}


-(void)getJsState:(int)state Msg:(NSString*)msg{
    NSString*funcNameStr = @"cc.vv.g3Plugin.onPayResult";
    std::string funcName = [funcNameStr UTF8String];
    std::int32_t code = state;
    std::string content = [msg UTF8String];
    std::string jsCallStr = cocos2d::StringUtils::format("%s(\"%d\",\"%s\")",funcName.c_str(), code,content.c_str());
    se::ScriptEngine::getInstance()->evalString(jsCallStr.c_str());
}



@end
