//
//  MBLocationManager.h
//  wtqp-mobile
//
//  Created by wyl on 2018/6/28.
//

#import <Foundation/Foundation.h>

@interface MBLocationManager : NSObject
+(MBLocationManager*)shared;
//+(void)LocationManager;
//+(void)getLocation:(void(^)(double latitude,double longitude))locationBlock;
//+(void)getLocationPlace:(void(^)(NSString * palce))placeBlock;

#pragma mark---latitude,longitude
-(NSString*)getLocation;
-(NSString*)getLocationDes;

@end
