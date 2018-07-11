//
//  CCLocationManager.m
//  MMLocationManager
//
//  Created by WangZeKeJi on 14-12-10.
//  Copyright (c) 2014年 Chen Yaoqiang. All rights reserved.
//

#import "G3Plugin.h"
#import "WXApi.h"

static float latitude;
static float longitude;
static NSString* roomid = nil;


@interface G3Plugin (){
    CLLocationManager *_manager;
    
}

@end

@implementation G3Plugin



+ (G3Plugin *)sharePlugin{
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
    [WXApi registerApp:@"wx5d614d90c2b02856"];
    
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

+ (void)init{
//    [[G3Plugin sharePlugin]startLocation];
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

+ (UIImage *)thumbnailWithImageWithoutScale:(UIImage *)image size:(CGSize)asize{
    
    UIImage *newimage;
    CGRect rect;
    CGSize oldsize = image.size;
    
    if (asize.width/asize.height > oldsize.width/oldsize.height) {
        rect.size.width = asize.height*oldsize.width/oldsize.height;
        rect.size.height = asize.height;
        rect.origin.x = (asize.width - rect.size.width)/2;
        rect.origin.y = 0;
    }else{
        rect.size.width = asize.width;
        rect.size.height = asize.width*oldsize.height/oldsize.width;
        rect.origin.x = 0;
        rect.origin.y = (asize.height - rect.size.height)/2;
    }
    
    UIGraphicsBeginImageContext(asize);
    CGContextRef context = UIGraphicsGetCurrentContext();
    CGContextSetFillColorWithColor(context, [[UIColor clearColor] CGColor]);
    UIRectFill(CGRectMake(0, 0, asize.width, asize.height));//clear background
    [image drawInRect:rect];
    newimage = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext();
    
    return newimage;
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
        NSString* room = [[G3Plugin sharePlugin]getQueryItemValue:@"roomid" queryString:s];
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

+ (void) WxShareImg:(NSString*)to file:(NSString*)file{
    
    WXMediaMessage *message = [WXMediaMessage message];
    
    UIImage *img = [UIImage imageNamed:file];
    
    float height = 100;
    float scale = height/img.size.height;
    float width  = img.size.width * scale;
    UIImage *thumb = [G3Plugin thumbnailWithImageWithoutScale:img size:CGSizeMake(width,height)];
    
    
    height = 500;
    scale = height/img.size.height;
    width  = img.size.width * scale;
    UIImage *bigThumb = [G3Plugin thumbnailWithImageWithoutScale:img size:CGSizeMake(width,height)];
    
    WXImageObject *imageObject = [WXImageObject object];
    imageObject.imageData = UIImagePNGRepresentation(bigThumb);
    message.mediaObject = imageObject;
    [message setThumbImage:thumb];
    
    SendMessageToWXReq *req = [[SendMessageToWXReq alloc] init];
    req.bText = NO;
    req.message = message;
    req.scene = ([to isEqual:@"0"])?WXSceneSession:WXSceneTimeline;
    
    [WXApi sendReq:req];
}

//获取经纬度
+ (NSString *) getLocation
{
    NSString* str = [NSString stringWithFormat:@"%f|%f",latitude,longitude];
    [[G3Plugin sharePlugin]startLocation];
    return str;
}

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


@end
