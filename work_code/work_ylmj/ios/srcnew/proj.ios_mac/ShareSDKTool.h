//
//  ShareSDKTool.h
//  wtqp-mobile
//
//  Created by wyl on 2018/6/4.
//

#import <Foundation/Foundation.h>
#import <ShareSDK/ShareSDK.h>
#import <ShareSDKConnector/ShareSDKConnector.h>
#import <ShareSDKUI/ShareSDKUI.h>
//腾讯开放平台（对应QQ和QQ空间）SDK头文件
#import <TencentOpenAPI/TencentOAuth.h>
#import <TencentOpenAPI/QQApiInterface.h>
//微信SDK头文件
#import "WXApi.h"
#import "WeiboSDK.h"
#import <UIKit/UIKit.h>
#import <CoreLocation/CoreLocation.h>

#define CCLastLongitude @"CCLastLonggitude"
#define CCLastLatitude @"CCLastLatitude"

typedef void(^ThirdLoginResult)(BOOL success, NSString *errorString);

@interface ShareSDKTool : NSObject<CLLocationManagerDelegate>

/**s
 *  注册ShareSDK
 */
+(void)registerShare;
/**
 *  分享图片、文本、URL等信息(微信好友、微信朋友圈、微信收藏、新浪微博、QQ好友、QQ空间、短信、邮件)
 */
+(void)shareContentWithShareContentType:(SSDKContentType)shareContentType
                           contentTitle:(NSString *)contentTitle
                     contentDescription:(NSString *)contentDescription
                           contentImage:(id)contentImage
                             contentURL:(NSString *)contentURL
                             showInView:(UIView *)showInView
                                success:(void (^)())success
                                failure:(void (^)(NSString *failureInfo))failure
                    OtherResponseStatus:(void (^)(SSDKResponseState state))otherResponseStatus;
/**
 *  分享文件(仅微信好友)
 */
+ (void)shareVideoContentParamsByText:(NSString *)text
                                title:(NSString *)title
                                  url:(NSURL *)url
                           thumbImage:(id)thumbImage
                                image:(id)image
                         musicFileURL:(NSURL *)musicFileURL
                              extInfo:(NSString *)extInfo
                             fileData:(id)fileData
                         emoticonData:(id)emoticonData
                  sourceFileExtension:(NSString *)fileExtension
                       sourceFileData:(id)sourceFileData
                                 type:(SSDKContentType)type
                   forPlatformSubType:(SSDKPlatformType)platformSubType
                           showInView:(UIView *)showInView
                              success:(void (^)())success
                              failure:(void (^)(NSString *failureInfo))failure
                  OtherResponseStatus:(void (^)(SSDKResponseState state))otherResponseStatus;
/**
 *  视频QQ空间分享
 */
+(void)ShareQQParamsByText:(NSString *)text
                     title:(NSString *)title
                       url:(NSURL *)url
             audioFlashURL:(NSURL *)audioFlashURL
             videoFlashURL:(NSURL *)videoFlashURL
                thumbImage:(id)thumbImage
                    images:(id)images
                      type:(SSDKContentType)type
        forPlatformSubType:(SSDKPlatformType)platformSubType
                showInView:(UIView *)showInView;
/**
 *  第三方登录
 */
+(void)thirdLoginWithType:(SSDKPlatformType)type result:(ThirdLoginResult)loginResult;

+(NSString *)getInfo;

+(BOOL)getwxLoginIsSuccess;

+ (ShareSDKTool *)sharePlugin;

- (NSString *) getQueryItemValue:(NSString *)key queryString:(NSString*)url;

+ (NSString *)getRoomid;
- (void)setRoomid:(NSString*)id;

#pragma mark---latitude,longitude
+(NSString*)getLocation;
+(NSString*)getLocationDes;
#pragma mark---ShareSDK分享

/*text      文字
 *type    分享类型（默认微信朋友圈）{微信好友：22   微信朋友圈：23  微信收藏：37}
 */
+(void)shareText:(NSString*)text Type:(int)type;
/*image     图片
 *type    分享类型（默认微信朋友圈）{微信好友：22   微信朋友圈：23  微信收藏：37}
 */
+(void)shareImg:(NSString*)image Type:(int)type;
/*image     图片
 *url       链接
 *urlTitle  链接标题
 *type    分享类型（默认微信朋友圈）{微信好友：22   微信朋友圈：23  微信收藏：37}
 */
+(void)shareImg:(NSString*)image Url:(NSString*)url UrlTitle:(NSString*)urlTitle Type:(int)type;

/*
 *苹果内购方法
 *productId 商品ID
 */
+(void)getAppStore:(NSString*)productId;

@end
