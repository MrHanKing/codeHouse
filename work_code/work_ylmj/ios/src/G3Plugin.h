//
//  CCLocationManager.h
//  MMLocationManager
//
//  Created by WangZeKeJi on 14-12-10.
//  Copyright (c) 2014年 Chen Yaoqiang. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <MapKit/MapKit.h>
#import <CoreLocation/CoreLocation.h>

#define  CCLastLongitude @"CCLastLongitude"
#define  CCLastLatitude  @"CCLastLatitude"

@interface G3Plugin : NSObject<CLLocationManagerDelegate>

+ (G3Plugin *)sharePlugin;

+ (void)init;

- (NSString *) getQueryItemValue:(NSString *)key queryString:(NSString*)url;
+ (NSString *) getLocation;
+ (NSString *)getRoomid;
- (void)setRoomid:(NSString*)id;
+ (void) WxShareImg:(NSString*)to file:(NSString*) file;
+ (UIImage *)thumbnailWithImageWithoutScale:(UIImage *)image size:(CGSize)asize;

@end
