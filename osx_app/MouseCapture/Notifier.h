//
//  Notifier.h
//  Team Data Capture
//
//  Created by Matthieu COLLE on 3/25/14.
//  Copyright (c) 2014 Matthieu COLLE. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface Notifier : NSObject

- (void)push      :(NSString *)title :(NSString *)content :(BOOL)hasActionButton :(NSString *)subtitle;

@end
