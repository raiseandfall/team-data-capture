//
//  Notifier.m
//  Team Data Capture
//
//  Created by Matthieu COLLE on 3/25/14.
//  Copyright (c) 2014 Matthieu COLLE. All rights reserved.
//

#import "Notifier.h"

@implementation Notifier

- (void)push:(NSString *)title :(NSString *)content :(BOOL)hasActionButton :(NSString *)subtitle {
    NSUserNotification *notif = [[NSUserNotification alloc] init];
    [notif setTitle:title];
    [notif setInformativeText:content];
    [notif setSoundName:NSUserNotificationDefaultSoundName];
    
    if (subtitle != nil) {
        [notif setSubtitle:subtitle];
    }
    
    if (hasActionButton) {
        [notif setHasActionButton:YES];
        [notif setActionButtonTitle:@"Reconnect"];
    }
    
    [[NSUserNotificationCenter defaultUserNotificationCenter] deliverNotification:notif];
}

@end
