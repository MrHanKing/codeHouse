//
//  ShareSDKObjecct.h
//  Demo
//
//  Created by wyl on 2018/6/29.
//  Copyright © 2018年 wyl. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import <JavaScriptCore/JavaScriptCore.h>
@protocol WebViewJavascriptBridgeProtocol <JSExport>

// 通过JS调用OC方法 (采用代理的方法)
- (void)CallOCFunction;

- (void)CallOCFunctionFirstParameter:(NSString *)parameter;

@end

@interface ShareSDKObjecct : NSObject

+(ShareSDKObjecct*)share;

+(void)registerShare;
-(void)setText:(NSString*)text Image:(NSString*)img Url:(NSString*)url urlTitle:(NSString*)title Type:(NSInteger)type;
+(NSString*)getShareResult;
@end
