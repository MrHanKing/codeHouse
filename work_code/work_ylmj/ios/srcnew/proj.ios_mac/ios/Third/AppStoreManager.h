//
//  AppStoreManager.h
//  wtqp-mobile
//
//  Created by wyl on 2018/7/3.
//

#import <Foundation/Foundation.h>

@interface AppStoreManager : NSObject
+(AppStoreManager*)instance;
-(void)setManage:(NSString*)ident;
@end
