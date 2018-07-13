//
//  ShareSDKObjecct.m
//  Demo
//
//  Created by wyl on 2018/6/29.
//  Copyright © 2018年 wyl. All rights reserved.
//

#import "ShareSDKObjecct.h"
#import <ShareSDK/ShareSDK.h>
#import <ShareSDKConnector/ShareSDKConnector.h>

#import <WebKit/WKScriptMessageHandler.h>
#import <WebKit/WebKit.h>

//微信SDK头文件
#import "WXApi.h"
#import "RegularExpression.h"
#import "ScriptingCore.h"
#import "cocos2d.h"
#import "platform/ios/CCEAGLView-ios.h"

#import "cocos-analytics/CAAgent.h"
#include "cocos/scripting/js-bindings/jswrapper/SeApi.h"
#import "AlertController.h"
using namespace cocos2d;
@interface ShareSDKObjecct()
//使用class声明一个类属性
@property(class,nonatomic,strong) __block NSString*shareResult;

@property(class,nonatomic,strong) JSContext * jsContext;

@end

@implementation ShareSDKObjecct

static  NSString*_shareResult = nil;
+(NSString*)shareResult{
    if (_shareResult == nil) {
        _shareResult = [[NSString alloc] init];
    }
    return _shareResult;
}
+(void)setShareResult:(NSString *)shareResult{
    if (shareResult != _shareResult) {
        _shareResult = shareResult;
    }
}
//
static  JSContext*_jsContest = nil;
+(JSContext*)jsContext{
    if (_jsContest == nil) {
        _jsContest = [[JSContext alloc] init];
    }
    return _jsContest;
}
+(void)setJsContext:(JSContext *)jsContext{
    if (jsContext != _jsContest) {
        _jsContest = jsContext;
    }
}



+(instancetype)allocWithZone:(struct _NSZone *)zone
{
    return [ShareSDKObjecct share];
}
+(ShareSDKObjecct*)share{
    static dispatch_once_t once = 0;
    static ShareSDKObjecct * _shared = nil;
    dispatch_once(&once, ^{
        _shared = [[super allocWithZone:nil] init];
        [ShareSDKObjecct registerShare];
    });
    return _shared;
}
// 为了严谨，也要重写copyWithZone 和 mutableCopyWithZone
-(id)copyWithZone:(NSZone *)zone
{
    return [ShareSDKObjecct share];
}
-(id)mutableCopyWithZone:(NSZone *)zone
{
    return [ShareSDKObjecct share];
}
#pragma mark-注册
+ (void)registerShare{
    /**初始化ShareSDK应用
     
     @param activePlatforms
     
     使用的分享平台集合
     
     @param importHandler (onImport)
     
     导入回调处理，当某个平台的功能需要依赖原平台提供的SDK支持时，需要在此方法中对原平台SDK进行导入操作
     
     @param configurationHandler (onConfiguration)
     
     配置回调处理，在此方法中根据设置的platformType来填充应用配置信息
     
     */
    
    [ShareSDK registerActivePlatforms:@[@(SSDKPlatformTypeWechat)
                                        ]
                             onImport:^(SSDKPlatformType platformType)
     {
         switch (platformType)
         {
             case SSDKPlatformTypeWechat:
                 [ShareSDKConnector connectWeChat:[WXApi class]];
                 break;
                 
             default:
                 break;
         }
     }
                      onConfiguration:^(SSDKPlatformType platformType, NSMutableDictionary *appInfo)
     {
         
         switch (platformType)
         {
                 
             case SSDKPlatformTypeWechat:
                 [appInfo SSDKSetupWeChatByAppId:@"wx5183258397fe835e"
                                       appSecret:@"01564623f42700b273f40d2a28f1c95f"];
                 break;
                 
             default:
                 break;
         }
     }];
    
}

-(void)setText:(NSString*)text Image:(NSString*)img Url:(NSString*)url urlTitle:(NSString*)title Type:(NSInteger)type{
    
    if (text.length ==0 && img.length==0&& url.length==0&& title.length==0) {
        return;
    }
    
    NSMutableDictionary *shareParams = [NSMutableDictionary dictionary];
    [shareParams SSDKSetupShareParamsByText:text
                                     images:[ShareSDKObjecct getImageArr:img]
                                        url:[NSURL URLWithString:url]
                                      title:title
                                       type:SSDKContentTypeAuto];
    
    
    [ShareSDKObjecct ShareSDKshare:type parameters:shareParams];
//    NSLog(@"===share===%@",ShareSDKObjecct.shareResult);
}
-(void)me{
    
}
+(void)ShareSDKshare:(NSUInteger)type parameters:(NSMutableDictionary *)shareParams{
    //有的平台要客户端分享需要加此方法，例如微博
    [shareParams SSDKEnableUseClientShare];
    //2、分享（可以弹出我们的分享菜单和编辑界面）

    //不调用界面
    [ShareSDK share:[ShareSDKObjecct getPlatformType:type] parameters:shareParams onStateChanged:^(SSDKResponseState state, NSDictionary *userData, SSDKContentEntity *contentEntity, NSError *error) {
        

        //
       NSString*contentStr = @"";
       
        if (state == SSDKResponseStateSuccess) {
            contentStr = @"分享成功";
//            NSLog(@"===分享成功");
//            [AlertController alertMsg:@"分享成功"];
        } else if (state == SSDKResponseStateFail) {
//            NSLog(@"===分享失败");
            NSString * msg = [NSString stringWithFormat:@"分享失败:%@",[error description]];
            contentStr = msg;
//            [AlertController alertMsg:msg];
//            ShareSDKObjecct.shareResult = @"2";
            
        }else if (state == SSDKResponseStateCancel){
            contentStr = @"分享取消";
//            NSLog(@"===分享取消");
//            [AlertController alertMsg:@"分享取消"];
            
//            ShareSDKObjecct.shareResult = @"3";
            
        }
        
        NSString*funcNameStr = @"cc.vv.g3Plugin.onShareResult";
        
        std::string funcName = [funcNameStr UTF8String];
        std::int32_t code = state;
        std::string content = [contentStr UTF8String];
        std::string jsCallStr = cocos2d::StringUtils::format("%s(\"%d\",\"%s\")",funcName.c_str(), code,content.c_str());
        se::ScriptEngine::getInstance()->evalString(jsCallStr.c_str());
        NSLog(@"==========%s",jsCallStr.c_str());
    }];
}

+(NSString*)getShareResult{
    
    return ShareSDKObjecct.shareResult;
}
+(NSString *)URLEncodedString:(NSString*)str
{
    NSString *encodedString = (NSString *)
    CFBridgingRelease(CFURLCreateStringByAddingPercentEscapes(kCFAllocatorDefault,
                                                              (CFStringRef)str,
                                                              (CFStringRef)@"!$&'()*+,-./:;=?@_~%#[]",
                                                              NULL,
                                                              kCFStringEncodingUTF8));
    return encodedString;
}
+(NSMutableArray*)getImageArr:(NSString*)img{
    NSMutableArray * imageArr = [[NSMutableArray alloc] init];
    if ([RegularExpression detectionIsUrl:img]) {
        [imageArr addObject:img];
    }else if(img.length>0){
        UIImage * image = [UIImage imageNamed:img];
        if (!image) {
            imageArr = nil;
        }else{
            [imageArr addObject:[UIImage imageNamed:img]];
        }
        
    }else{
        imageArr = nil;
    }
    return imageArr;
}
+(SSDKPlatformType)getPlatformType:(NSUInteger)type{
    SSDKPlatformType getType;
    switch (type) {
        case SSDKPlatformSubTypeWechatSession:
            getType = SSDKPlatformSubTypeWechatSession;
            break;
        case SSDKPlatformSubTypeWechatTimeline:
            getType = SSDKPlatformSubTypeWechatTimeline;
            break;
        case SSDKPlatformSubTypeWechatFav:
            getType = SSDKPlatformSubTypeWechatFav;
        default:
            getType = SSDKPlatformSubTypeWechatTimeline;
            break;
    }
    return getType;
}




+(BOOL)isExist:(NSString*)str{
    NSString  *filename=[NSString stringWithFormat:@"%@.jpg",str];
    NSString *documentsDirectory = [NSHomeDirectory() stringByAppendingPathComponent:@"Documents"];
    NSFileManager *fileManager = [NSFileManager defaultManager];
    NSString *filePath = [documentsDirectory stringByAppendingPathComponent:filename];
    
    if(![fileManager fileExistsAtPath:filePath])
    {
        NSString  *filename=[NSString stringWithFormat:@"%@.png",str];
        NSString *documentsDirectory = [NSHomeDirectory() stringByAppendingPathComponent:@"Documents"];
        NSFileManager *fileManager = [NSFileManager defaultManager];
        NSString *filePath = [documentsDirectory stringByAppendingPathComponent:filename];
        if([fileManager fileExistsAtPath:filePath]){
            return YES;
        }
        
        return NO;
    }else{
        return YES;
    }
    
    
}
@end
