//
//  ShareSDKTool.mm
//  wtqp-mobile
//
//  Created by wyl on 2018/6/4.
//

#import "ShareSDKTool.h"
#import <ShareSDKUI/SSUIShareActionSheetStyle.h>

#import <ShareSDK/ShareSDK.h>
#import <ShareSDKConnector/ShareSDKConnector.h>

//腾讯开放平台（对应QQ和QQ空间）SDK头文件
#import <TencentOpenAPI/TencentOAuth.h>
#import <TencentOpenAPI/QQApiInterface.h>

//微信SDK头文件
#import "WXApi.h"

//新浪微博SDK头文件
#import "WeiboSDK.h"
//新浪微博SDK需要在项目Build Settings中的Other Linker Flags添加"-ObjC"

//人人SDK头文件
#import <RennSDK/RennSDK.h>
//定位
#import "MBLocationManager.h"
//ShareSDK分享
#import "ShareSDKObjecct.h"

#import "AppPurchaseTool.h"

#import <StoreKit/StoreKit.h>
#import "AppPurchaseTool.h"

#import "AppStoreManager.h"

/*****ShareSDK********/
#define K_ShareSDK_AppKey      @""
#define K_ShareSDK_AppSecret   @""
//QQAppId16进制 41e2c9d5   QQ41E2C9D5
//新浪
#define K_Sina_AppKey    @""
#define K_Sina_AppSecret @""
//QQ
#define K_QQ_AppId       @""
#define K_QQ_AppKey      @""
//微信
#define K_WX_AppID       @""
#define K_WX_AppSecret   @""
#define K_Share_Url      @""

static NSString *myrefreshtoken = @"";
static BOOL wxLoginIsSuccess = false;
static float latitude;
static float longitude;
static NSString* roomid = nil;

@interface ShareSDKTool ()<AppPurchaseToolDelegate>{
    CLLocationManager *_manager;
}

@end

@implementation ShareSDKTool

#pragma mark - ShareSDK 注册

+(void)registerShare
{   /**初始化ShareSDK应用
     
     @param activePlatforms
     
     使用的分享平台集合
     
     @param importHandler (onImport)
     
     导入回调处理，当某个平台的功能需要依赖原平台提供的SDK支持时，需要在此方法中对原平台SDK进行导入操作
     
     @param configurationHandler (onConfiguration)
     
     配置回调处理，在此方法中根据设置的platformType来填充应用配置信息
     
     */
    
    [ShareSDK registerActivePlatforms:@[
                                        @(SSDKPlatformTypeSinaWeibo),
                                        @(SSDKPlatformTypeMail),
                                        @(SSDKPlatformTypeSMS),
                                        @(SSDKPlatformTypeCopy),
                                        @(SSDKPlatformTypeWechat),
                                        @(SSDKPlatformTypeQQ),
                                        @(SSDKPlatformTypeRenren),
                                        @(SSDKPlatformTypeFacebook),
                                        @(SSDKPlatformTypeTwitter),
                                        @(SSDKPlatformTypeGooglePlus)
                                        ]
                             onImport:^(SSDKPlatformType platformType)
     {
         switch (platformType)
         {
             case SSDKPlatformTypeWechat:
                 [ShareSDKConnector connectWeChat:[WXApi class]];
                 break;
             case SSDKPlatformTypeQQ:
                 [ShareSDKConnector connectQQ:[QQApiInterface class] tencentOAuthClass:[TencentOAuth class]];
                 break;
             case SSDKPlatformTypeSinaWeibo:
                 [ShareSDKConnector connectWeibo:[WeiboSDK class]];
                 break;
             case SSDKPlatformTypeRenren:
                 [ShareSDKConnector connectRenren:[RennClient class]];
                 break;
             default:
                 break;
         }
     }
                      onConfiguration:^(SSDKPlatformType platformType, NSMutableDictionary *appInfo)
     {
         
         switch (platformType)
         {
             case SSDKPlatformTypeSinaWeibo:
                 //设置新浪微博应用信息,其中authType设置为使用SSO＋Web形式授权
                 [appInfo SSDKSetupSinaWeiboByAppKey:@"568898243"
                                           appSecret:@"38a4f8204cc784f81f9f0daaf31e02e3"
                                         redirectUri:@"http://www.sharesdk.cn"
                                            authType:SSDKAuthTypeBoth];
                 break;
             case SSDKPlatformTypeWechat:
                 [appInfo SSDKSetupWeChatByAppId:@"wx5183258397fe835e"
                                       appSecret:@"01564623f42700b273f40d2a28f1c95f"];
                 break;
             case SSDKPlatformTypeQQ:
                 [appInfo SSDKSetupQQByAppId:@"100371282"
                                      appKey:@"aed9b0303e3ed1e27bae87c33761161d"
                                    authType:SSDKAuthTypeBoth];
                 break;
             case SSDKPlatformTypeRenren:
                 [appInfo        SSDKSetupRenRenByAppId:@"226427"
                                                 appKey:@"fc5b8aed373c4c27a05b712acba0f8c3"
                                              secretKey:@"f29df781abdd4f49beca5a2194676ca4"
                                               authType:SSDKAuthTypeBoth];
                 break;
             case SSDKPlatformTypeFacebook:
                 [appInfo SSDKSetupFacebookByApiKey:@"107704292745179"
                                          appSecret:@"38053202e1a5fe26c80c753071f0b573"
                                        displayName:@"shareSDK"
                                           authType:SSDKAuthTypeBoth];
                 break;
             case SSDKPlatformTypeTwitter:
                 [appInfo SSDKSetupTwitterByConsumerKey:@"LRBM0H75rWrU9gNHvlEAA2aOy"
                                         consumerSecret:@"gbeWsZvA9ELJSdoBzJ5oLKX0TU09UOwrzdGfo9Tg7DjyGuMe8G"
                                            redirectUri:@"http://mob.com"];
                 break;
             case SSDKPlatformTypeGooglePlus:
                 [appInfo SSDKSetupGooglePlusByClientID:@"232554794995.apps.googleusercontent.com"
                                           clientSecret:@"PEdFgtrMw97aCvf0joQj7EMk"
                                            redirectUri:@"http://localhost"];
                 break;
             default:
                 break;
         }
     }];
}

#pragma mark- 分享
+(void)shareContentWithShareContentType:(SSDKContentType)shareContentType
                           contentTitle:(NSString *)contentTitle
                     contentDescription:(NSString *)contentDescription
                           contentImage:(id)contentImage
                             contentURL:(NSString *)contentURL
                             showInView:(UIView *)showInView
                                success:(void (^)())success
                                failure:(void (^)(NSString *failureInfo))failure
                    OtherResponseStatus:(void (^)(SSDKResponseState state))otherResponseStatus{
    //1. 创建分享参数
    NSMutableDictionary *shareParams = [NSMutableDictionary dictionary];
    
    [shareParams SSDKEnableUseClientShare];

    [shareParams SSDKSetupShareParamsByText:contentDescription
                                     images:contentImage
                                        url:[NSURL URLWithString:contentURL]
                                      title:contentTitle
                                       type:shareContentType];
    
//    [SSUIShareActionSheetStyle setShareActionSheetStyle:ShareActionSheetStyleSystem];
    //2. 分享,显示分享view

    [ShareSDK showShareActionSheet:showInView
                       customItems:nil
                       shareParams:shareParams
                sheetConfiguration:nil
                    onStateChanged:^(SSDKResponseState state, SSDKPlatformType platformType, NSDictionary *userData, SSDKContentEntity *contentEntity, NSError *error, BOOL end) {
                  switch (state) {
                          
                      case SSDKResponseStateSuccess:
                      {
                          
                          success();
                          break;
                          
                      }
                      case SSDKResponseStateFail:
                      {
                          if (platformType == SSDKPlatformTypeSMS && [error code] == 201)
                          {
                              failure(@"失败原因可能是:1、短信应用没有设置帐号;2、设备不支持短信应用;3、短信应用在iOS 7以上才能发送带附件的短                                                     信。");
                              break;
                              
                          }
                          else if(platformType == SSDKPlatformTypeMail && [error code] == 201)
                          {
                              
                              failure(@"失败原因可能是:1、邮件应用没有设置帐号;2、设备不支持邮件应用。");
                              break;
                              
                          }
                          else
                          {
                              failure([NSString stringWithFormat:@"%@",error]);
                              break;
                              
                          }
                          break;
                      }
                      case SSDKResponseStateCancel:
                      {
                          otherResponseStatus(SSDKResponseStateCancel);
                          
                          break;
                      }
                      default:
                          break;
                  }
                  if (state != SSDKResponseStateBegin)
                  {
                      failure([NSString stringWithFormat:@"%@",error]);
                      
                  }
              }];
}

#pragma mark QQ
+(void)ShareQQParamsByText:(NSString *)text
                     title:(NSString *)title
                       url:(NSURL *)url
             audioFlashURL:(NSURL *)audioFlashURL
             videoFlashURL:(NSURL *)videoFlashURL
                thumbImage:(id)thumbImage
                    images:(id)images
                      type:(SSDKContentType)type
        forPlatformSubType:(SSDKPlatformType)platformSubType
                showInView:(UIView *)showInView{
    //1. 创建分享参数
    NSMutableDictionary *shareParams = [NSMutableDictionary dictionary];
    
    [shareParams SSDKEnableUseClientShare];
    
    NSArray *items = @[@(SSDKPlatformSubTypeQZone)];
    
    [shareParams SSDKSetupQQParamsByText:text title:title url:url audioFlashURL:audioFlashURL videoFlashURL:audioFlashURL thumbImage:thumbImage images:images type:type forPlatformSubType:platformSubType];
    //2. 分享->显示分享view
    [ShareSDK showShareActionSheet:showInView
                             items:items
                       shareParams:shareParams
               onShareStateChanged:^(SSDKResponseState state, SSDKPlatformType platformType, NSDictionary *userData, SSDKContentEntity *contentEntity, NSError *error, BOOL end) {
                   
                   switch (state) {
                           
                       case SSDKResponseStateSuccess:
                       {
                           //分享成功
                           
                           NSLog(@"%@",userData);
                           break;
                           
                       }
                       case SSDKResponseStateFail:
                       {
                           
                           NSLog(@"%@",error);
                           
                           break;
                       }
                       case SSDKResponseStateCancel:
                       {
                           
                           break;
                       }
                       default:
                           break;
                   }
                   
               }];
    
}

#pragma mark ====第三方登录====
+(void)thirdLoginWithType:(SSDKPlatformType)type
                   result:(ThirdLoginResult)loginResult{
    wxLoginIsSuccess = false;
    
    [ShareSDK cancelAuthorize:type];
    
    [ShareSDK getUserInfo:type onStateChanged:^(SSDKResponseState state, SSDKUser *user, NSError *error) {
       
        switch (state) {
                
            case SSDKResponseStateSuccess:{
                
                NSError *error;
                NSData *jsonData = [NSJSONSerialization dataWithJSONObject:user.credential.rawData
                                                                   options:NSJSONWritingPrettyPrinted
                                    // Pass 0 if you don't care about the readability of the generated string
                                                                     error:&error];
                if (! jsonData)
                {
                    NSLog(@"Got an error: %@", error);
                }else
                {
                    myrefreshtoken = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
                }
                
                myrefreshtoken = [myrefreshtoken stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]];
                //去除掉首尾的空白字符和换行字符
                [myrefreshtoken stringByReplacingOccurrencesOfString:@"\n" withString:@""];
                wxLoginIsSuccess = true;
                
                NSLog(@"myrefreshtoken=%@",myrefreshtoken);
                NSLog(@"wxLoginIsSuccess=%i",wxLoginIsSuccess);
                break;
            }
            case SSDKResponseStateFail:{
         
                break;
            }
            default:
                NSLog(@"%@",error);
                break;
        }
     }];
}

+(NSString *)getInfo {
    
    return myrefreshtoken;
}

+(BOOL)getwxLoginIsSuccess {
    return wxLoginIsSuccess;
}

+ (ShareSDKTool *)sharePlugin{
    static dispatch_once_t pred = 0;
    __strong static id _sharedObject = nil;
    dispatch_once(&pred, ^{
        _sharedObject = [[self alloc] init];
        roomid = [[NSString alloc]init];
        roomid = @"";
    });
    return _sharedObject;
}

- (id)init {
    self = [super init];
    
    //向微信注册
    // [WXApi registerApp:@"wx5d614d90c2b02856"];
    
//    if (self) {
//        NSUserDefaults *standard = [NSUserDefaults standardUserDefaults];
//        
//        float s_longitude = [standard floatForKey:CCLastLongitude];
//        float s_latitude = [standard floatForKey:CCLastLatitude];
//        longitude = s_longitude;
//        latitude = s_latitude;
//    }
    return self;
}

- (NSString *) getQueryItemValue:(NSString *)key queryString:(NSString*)url{
    for (NSString *param in [url componentsSeparatedByString:@"&"]) {
        NSArray *elts = [param componentsSeparatedByString:@"="];
        if([elts count] < 2) continue;
        if([[elts firstObject] isEqual:key]){
            return [elts lastObject];
        }
    }
    
    return nil;
}

#pragma mark---latitude,longitude定位
+(NSString*)getLocation{
    return  [[MBLocationManager shared] getLocation];
}
+(NSString*)getLocationDes{
    return [[MBLocationManager shared] getLocationDes];
}

#pragma mark---ShareSDK分享
+(void)shareText:(NSString*)text Type:(int)type{
    [[ShareSDKObjecct share] setText:text Image:@"" Url:nil urlTitle:nil Type:type];
//    [ShareSDKObjecct setText:text Image:@"" Url:@"" urlTitle:@"" Type:type];
}
+(void)shareImg:(NSString*)image Type:(int)type{
    [[ShareSDKObjecct share] setText:@"" Image:image Url:nil urlTitle:nil Type:type];
//    [ShareSDKObjecct setText:@"" Image:image Url:@"" urlTitle:@"" Type:type];
}
//+(void)shareUrl:(NSString*)url UrlTitle:(NSString*)urlTitle Type:(int)type{
//    [[ShareSDKObjecct share] setText:@"" Image:@"" Url:url urlTitle:urlTitle Type:type];
////    [ShareSDKObjecct setText:@"" Image:@"" Url:url urlTitle:urlTitle Type:type];
//}
+(void)shareImg:(NSString*)image Url:(NSString*)url UrlTitle:(NSString*)urlTitle Type:(int)type{
    [[ShareSDKObjecct share] setText:@"" Image:image Url:url urlTitle:urlTitle Type:type];
//    [ShareSDKObjecct setText:@"" Image:image Url:url urlTitle:urlTitle Type:type];
}


+ (NSString *)getRoomid{
    
    if(roomid != nil && ![roomid isEqual:@""]){
        NSString* ret = [NSString stringWithString:roomid];
        roomid = @"";
        return ret;
    }
    
    UIPasteboard *pasteboard = [UIPasteboard generalPasteboard];
    NSString *s = pasteboard.string;
    
    if(s != nil){
        NSString* room = [[ShareSDKTool sharePlugin]getQueryItemValue:@"roomid" queryString:s];
        if(room!=nil && room.length == 6){
            pasteboard = [UIPasteboard generalPasteboard];
            pasteboard.string = @"";
            return room;
        }
    }
    
    return @"";
}

- (void)setRoomid:(NSString*)id{
    roomid = [NSString stringWithString:id];
    [roomid retain];
}

//获取经纬度
//+ (NSString *) getLocation
//{
//    NSString* str = [NSString stringWithFormat:@"%f|%f",latitude,longitude];
//    [[ShareSDKTool sharePlugin]startLocation];
//    return str;
//}

#pragma mark CLLocationManagerDelegate
- (void)locationManager:(CLLocationManager *)manager didUpdateToLocation:(CLLocation *)newLocation fromLocation:(CLLocation *)oldLocation
{
    
    latitude = newLocation.coordinate.latitude;
    longitude = newLocation.coordinate.longitude;
    
    NSUserDefaults *standard = [NSUserDefaults standardUserDefaults];
    [standard setObject:@(latitude) forKey:CCLastLatitude];
    [standard setObject:@(longitude) forKey:CCLastLongitude];
    
    [manager stopUpdatingLocation];
}


-(void)startLocation
{
    _manager=[[CLLocationManager alloc]init];
    _manager.delegate=self;
    _manager.desiredAccuracy = kCLLocationAccuracyBest;
    [_manager requestAlwaysAuthorization];
    _manager.distanceFilter=10;
    [_manager startUpdatingLocation];
    
}

- (void)locationManager:(CLLocationManager *)manager
       didFailWithError:(NSError *)error{
    [self stopLocation];
    
}
-(void)stopLocation
{
    _manager = nil;
}

#pragma mark---AppStore
+(void)getAppStore:(NSString*)productId{
     [[AppStoreManager instance] setManage:productId];
}



@end
