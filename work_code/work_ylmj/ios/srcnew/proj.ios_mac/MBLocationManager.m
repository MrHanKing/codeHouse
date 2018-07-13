//
//  MBLocationManager.m
//  wtqp-mobile
//
//  Created by wyl on 2018/6/28.
//

#import "MBLocationManager.h"
#import <BMKLocationkit/BMKLocationComponent.h>
#import <CoreLocation/CoreLocation.h>
#define latitudeKey @"latitude"
#define longitudeKey @"longitude"
#define PlaceKey @"palce"
@interface MBLocationManager()<BMKLocationManagerDelegate>

@property(nonatomic,strong) BMKLocationManager * locationManager;
@property(nonatomic, copy) BMKLocatingCompletionBlock completionBlock;

@property(nonatomic,copy)NSString * getPlace;

@property(nonatomic,strong) NSUserDefaults * userDefaults;

@property(nonatomic,strong) CADisplayLink * displayLink;

@property(nonatomic,strong) CLLocationManager * manager;

@end

@implementation MBLocationManager


//+(instancetype)allocWithZone:(struct _NSZone *)zone
//{
//    return [MBLocationManager shared];
//}
// 为了使实例易于外界访问 我们一般提供一个类方法
// 类方法命名规范 share类名|default类名|类名
+(instancetype)shared
{
    //return _instance;
    // 最好用self 用Tools他的子类调用时会出现错误
  
    
    static dispatch_once_t pred = 0;
    __strong static id _shared = nil;
    dispatch_once(&pred, ^{
        _shared = [[self alloc] init];
         [_shared caDislink];
    });
    return _shared;
}
// 为了严谨，也要重写copyWithZone 和 mutableCopyWithZone
//-(id)copyWithZone:(NSZone *)zone
//{
//    return [MBLocationManager shared];
//}
//-(id)mutableCopyWithZone:(NSZone *)zone
//{
//    return [MBLocationManager shared];
//}
-(void)caDislink{
    self.displayLink = [CADisplayLink displayLinkWithTarget:self
                                                   selector:@selector(dislink)];
    [self.displayLink addToRunLoop:[NSRunLoop currentRunLoop]
                           forMode:NSDefaultRunLoopMode];
}
-(void)dislink{
    if ([CLLocationManager authorizationStatus] ==kCLAuthorizationStatusDenied) {
//        [self stopDisplayLink];
        [self.manager requestWhenInUseAuthorization];//请求授权
        //定位不能用
        return;
        
    }
    
    [self LocationManager];
}
- (void)stopDisplayLink{
    [self.displayLink invalidate];
    self.displayLink = nil;
}

-(void)LocationManager{
//
//    if ([CLLocationManager authorizationStatus] ==kCLAuthorizationStatusDenied) {
//
//        //定位不能用
//        return;
//
//    }
//
  
    //初始化实例
    BMKLocationManager* _locationManager = [[BMKLocationManager alloc] init];
    //设置delegate
    //    _locationManager.delegate = self;
    //设置返回位置的坐标系类型
    _locationManager.coordinateType = BMKLocationCoordinateTypeBMK09LL;
    //设置距离过滤参数
    _locationManager.distanceFilter = kCLDistanceFilterNone;
    //设置预期精度参数
    _locationManager.desiredAccuracy = kCLLocationAccuracyBest;
    //设置应用位置类型
    _locationManager.activityType = CLActivityTypeAutomotiveNavigation;
    //设置是否自动停止位置更新
    _locationManager.pausesLocationUpdatesAutomatically = NO;
    //设置是否允许后台定位
    _locationManager.allowsBackgroundLocationUpdates = YES;
    //设置位置获取超时时间
    _locationManager.locationTimeout = 10;
    //设置获取地址信息超时时间
    _locationManager.reGeocodeTimeout = 10;
    
    
    [_locationManager requestLocationWithReGeocode:true withNetworkState:true completionBlock:^(BMKLocation *location,BMKLocationNetworkState state,NSError * error){
        
        [self stopDisplayLink];
        if (error)
        {
            NSLog(@"locError:{%ld - %@};", (long)error.code, error.localizedDescription);
            
            
        }
        
        if (location.location) {//得到定位信息，添加annotation
            //
            //            NSLog(@"LOC = %@",location.location);
            //            NSLog(@"LOC ID= %@",location.locationID);
            //                        NSLog(@"经度======%0.6f",location.location.coordinate.latitude);
            //                        NSLog(@"纬度======%0.6f",location.location.coordinate.longitude);
       
//            CLLocation * getLocation = [[CLLocation alloc] initWithLatitude:getLatitude longitude:getLongitude];
            
            CLGeocoder *geocoder = [[CLGeocoder alloc]init];
            
          
            [geocoder reverseGeocodeLocation:location.location completionHandler:^(NSArray<CLPlacemark *> *_Nullable placemarks, NSError * _Nullable error) {
                
                
                
                for (CLPlacemark *place in placemarks) {
                    
                    
                    
                    NSLog(@"name,%@",place.name);                      // 位置名
                    
                    NSLog(@"thoroughfare,%@",place.thoroughfare);      // 街道
                    
                    NSLog(@"subThoroughfare,%@",place.subThoroughfare);// 子街道
                    
                    NSLog(@"locality,%@",place.locality);              // 市
                    
                    NSLog(@"subLocality,%@",place.subLocality);        // 区
                    
                    NSLog(@"country,%@",place.country);                // 国家
                    
                    
                    NSString * palceFinal = [NSString stringWithFormat:@"%@%@%@%@%@",place.country,place.locality,place.subLocality,place.thoroughfare,place.subThoroughfare];
                    
                    NSUserDefaults *userDefaults = [[NSUserDefaults alloc] init];
                    
                    [userDefaults setObject:palceFinal forKey:PlaceKey];
                    [userDefaults synchronize];
                    
                }
                
                
            }];
            
            
            NSUserDefaults *userDefaults = [NSUserDefaults standardUserDefaults];

            [userDefaults setDouble:location.location.coordinate.latitude forKey:latitudeKey];
            [userDefaults setDouble:location.location.coordinate.longitude forKey:longitudeKey];
            [userDefaults synchronize];
        }
        
        
        if (location.rgcData) {
            NSLog(@"rgc = %@",[location.rgcData description]);
        }
    }];
    
//    NSUserDefaults *userDefaults = [NSUserDefaults standardUserDefaults];
//
//    double getLatitude = [userDefaults doubleForKey:latitudeKey];
//    double getLongitude = [userDefaults doubleForKey:longitudeKey];

//    NSLog(@"==========%f,%f",getLatitude,getLongitude);
    
}

-(void)Method{
    
}
+(void)toJS{
    
}


+(void)getLocation:(void(^)(double latitude,double longitude))locationBlock{
    
    //初始化实例
    BMKLocationManager* _locationManager = [[BMKLocationManager alloc] init];
    //设置delegate
//    _locationManager.delegate = self;
    //设置返回位置的坐标系类型
    _locationManager.coordinateType = BMKLocationCoordinateTypeBMK09LL;
    //设置距离过滤参数
    _locationManager.distanceFilter = kCLDistanceFilterNone;
    //设置预期精度参数
    _locationManager.desiredAccuracy = kCLLocationAccuracyBest;
    //设置应用位置类型
    _locationManager.activityType = CLActivityTypeAutomotiveNavigation;
    //设置是否自动停止位置更新
    _locationManager.pausesLocationUpdatesAutomatically = NO;
    //设置是否允许后台定位
    _locationManager.allowsBackgroundLocationUpdates = YES;
    //设置位置获取超时时间
    _locationManager.locationTimeout = 10;
    //设置获取地址信息超时时间
    _locationManager.reGeocodeTimeout = 10;
    
    
    [_locationManager requestLocationWithReGeocode:true withNetworkState:true completionBlock:^(BMKLocation *location,BMKLocationNetworkState state,NSError * error){
        if (error)
        {
            NSLog(@"locError:{%ld - %@};", (long)error.code, error.localizedDescription);
            
            
        }
        
        if (location.location) {//得到定位信息，添加annotation
            //
            //            NSLog(@"LOC = %@",location.location);
            //            NSLog(@"LOC ID= %@",location.locationID);
            //                        NSLog(@"经度======%0.6f",location.location.coordinate.latitude);
            //                        NSLog(@"纬度======%0.6f",location.location.coordinate.longitude);
            locationBlock(location.location.coordinate.latitude,location.location.coordinate.longitude);
            
            //            [self getLocationStreet:location.location];
        }
        
        
        if (location.rgcData) {
            NSLog(@"rgc = %@",[location.rgcData description]);
        }
    }];
    
}


+(void)getLocationPlace:(void(^)(NSString * palce))placeBlock{
  
    
    NSUserDefaults *userDefaults = [NSUserDefaults standardUserDefaults];
    
    double getLatitude = [userDefaults doubleForKey:latitudeKey];
    double getLongitude = [userDefaults doubleForKey:longitudeKey];
    
//    NSLog(@"==========%f,%f",getLatitude,getLongitude);
//    NSLog(@"==========%f,%f",getLatitude,getLongitude);
    
    CLLocation * getLocation = [[CLLocation alloc] initWithLatitude:getLatitude longitude:getLongitude];
    
    CLGeocoder *geocoder = [[CLGeocoder alloc]init];
    
    
    [geocoder reverseGeocodeLocation:getLocation completionHandler:^(NSArray<CLPlacemark *> *_Nullable placemarks, NSError * _Nullable error) {
        
        
        
        for (CLPlacemark *place in placemarks) {
            
            
            
            NSLog(@"name,%@",place.name);                      // 位置名
            
            NSLog(@"thoroughfare,%@",place.thoroughfare);      // 街道
            
            NSLog(@"subThoroughfare,%@",place.subThoroughfare);// 子街道
            
            NSLog(@"locality,%@",place.locality);              // 市
            
            NSLog(@"subLocality,%@",place.subLocality);        // 区
            
            NSLog(@"country,%@",place.country);                // 国家
            
            
            NSString * palceA = [NSString stringWithFormat:@"%@%@%@%@%@",place.country,place.locality,place.subLocality,place.thoroughfare,place.subThoroughfare];
            
            placeBlock(palceA);
            
        }
        
        
    }];
    
//    [MBLocationManager getLocation:^(double latitude,double longitude){
//
//        NSLog(@"==========%f",latitude);
//
//        
//    }];
    
    
    
}

-(NSString*)getLocation{
    NSUserDefaults *userDefaults = [NSUserDefaults standardUserDefaults];
    
    double getLatitude = [userDefaults doubleForKey:latitudeKey];
    double getLongitude = [userDefaults doubleForKey:longitudeKey];
    return [NSString stringWithFormat:@"%.6f|%.6f",getLatitude,getLongitude];
}
-(NSString*)getLocationDes{
    NSUserDefaults *userDefaults = [NSUserDefaults standardUserDefaults];
    
//    double getLatitude = [userDefaults doubleForKey:latitudeKey];
//    double getLongitude = [userDefaults doubleForKey:longitudeKey];
//    
//    CLLocation * getLocation = [[CLLocation alloc] initWithLatitude:getLatitude longitude:getLongitude];
//    
//    CLGeocoder *geocoder = [[CLGeocoder alloc]init];
//    
//    __block NSString * getPlace = [[NSString alloc] init];
//    [geocoder reverseGeocodeLocation:getLocation completionHandler:^(NSArray<CLPlacemark *> *_Nullable placemarks, NSError * _Nullable error) {
//        
//        
//        
//        for (CLPlacemark *place in placemarks) {
//            
//            
//            
//            NSLog(@"name,%@",place.name);                      // 位置名
//            
//            NSLog(@"thoroughfare,%@",place.thoroughfare);      // 街道
//            
//            NSLog(@"subThoroughfare,%@",place.subThoroughfare);// 子街道
//            
//            NSLog(@"locality,%@",place.locality);              // 市
//            
//            NSLog(@"subLocality,%@",place.subLocality);        // 区
//            
//            NSLog(@"country,%@",place.country);                // 国家
//            
//            
//            NSString * palceFinal = [NSString stringWithFormat:@"%@%@%@%@%@",place.country,place.locality,place.subLocality,place.thoroughfare,place.subThoroughfare];
//            
//            getPlace = palceFinal;
//            
//            [userDefaults setObject:palceFinal forKey:PlaceKey];
//            [userDefaults synchronize];
//            
//        }
//        
//        
//    }];
    NSLog(@"=======%@",[userDefaults objectForKey:PlaceKey]);
    return [userDefaults objectForKey:PlaceKey];
}

@end
