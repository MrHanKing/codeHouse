//
//  AlertController.m
//  wtqp-mobile
//
//  Created by wyl on 2018/6/29.
//

#import "AlertController.h"

@implementation AlertController
+(void)alertMsg:(NSString*)msg{
    UIAlertController * alertController = [UIAlertController alertControllerWithTitle:@"友情提示" message:msg preferredStyle:UIAlertControllerStyleAlert];
    UIAlertAction * sure = [UIAlertAction actionWithTitle:@"确定" style:UIAlertActionStyleDefault handler:^(UIAlertAction * _Nonnull action){}];
    [alertController addAction:sure];
    [[UIApplication sharedApplication].keyWindow.rootViewController presentViewController:alertController animated:YES completion:nil];
}

@end
