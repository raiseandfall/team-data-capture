//
//  rafAppDelegate.m
//  MouseCapture
//
//  Created by Matthieu COLLE on 2/22/14.
//  Copyright (c) 2014 Matthieu COLLE. All rights reserved.
//

#import "rafAppDelegate.h"

@implementation rafAppDelegate
@synthesize logView;
@synthesize toolbarClearButton;
@synthesize toolbarRecordButton;
@synthesize toolbarStopButton;
@synthesize cursorPosXLabel;
@synthesize cursorPosYLabel;
@synthesize cursorDeltaXLabel;
@synthesize cursorDeltaYLabel;
@synthesize keyDownCounterLabel;
@synthesize leftMouseCounterLabel;
@synthesize recordingEnabled;

@synthesize cursorPositionX;
@synthesize cursorPositionY;
@synthesize keyDownCounter;
@synthesize leftMouseCounter;

- (void)applicationDidFinishLaunching:(NSNotification *)aNotification
{
    self.recordingEnabled = YES;
    self.logDateFormatter = [[NSDateFormatter alloc] init];
    [self.logDateFormatter setTimeStyle:NSDateFormatterMediumStyle];
    
    // Start recording id enabled
    if (self.recordingEnabled) {
        [self initCounters];
        [self startRecording];
    }
}

- (void)initCounters {
    self.cursorDeltaX = [NSNumber numberWithFloat:0];
    self.cursorDeltaY = [NSNumber numberWithFloat:0];
    self.cursorPositionX = [NSNumber numberWithFloat:0];
    self.cursorPositionY = [NSNumber numberWithFloat:0];
    self.keyDownCounter = [NSNumber numberWithInt:0];
    self.leftMouseCounter = [NSNumber numberWithInt:0];
}

- (IBAction)clearButtonPressed:(id)sender {
    self.keyDownCounter = [NSNumber numberWithInt:0];
    self.leftMouseCounter = [NSNumber numberWithInt:0];
    [self.logView setString:@""];
}

- (IBAction)recordButtonPressed:(id)sender {
    if (self.recordingEnabled) {
        return;
    }
    [self startRecording];
}

- (IBAction)stopButtonPressed:(id)sender {
    if (!self.recordingEnabled) {
        return;
    }
    self.recordingEnabled = NO;
    [NSEvent removeMonitor:monitorUserInputs];
    
    [self initCounters];
    [self logMessageToLogView:[NSString stringWithFormat:@"Stop Recording"]];
}

- (void)startRecording {
    
    self.recordingEnabled = YES;
    
    // Fire everytime cursor move
    NSUInteger eventMasks = NSMouseMovedMask | NSLeftMouseDownMask | NSKeyDownMask;
    
    monitorUserInputs = [NSEvent addGlobalMonitorForEventsMatchingMask:eventMasks handler:^(NSEvent *incomingEvent) {
        switch ([incomingEvent type]) {
            // Mouse move
            case 5:
            {
                CGPoint location = [NSEvent mouseLocation];
                CGFloat deltaX = [incomingEvent deltaX];
                CGFloat deltaY = [incomingEvent deltaY];
                CGFloat posX = location.x;
                CGFloat posY = location.y;
                
                self.cursorDeltaX = [NSNumber numberWithFloat:deltaX];
                self.cursorDeltaY = [NSNumber numberWithFloat:deltaY];
                self.cursorPositionX = [NSNumber numberWithFloat:posX];
                self.cursorPositionY = [NSNumber numberWithFloat:posY];
                
                break;
            }
                
            // Left click
            case 1:
            {
                [self logMessageToLogView:[NSString stringWithFormat:@"Left click!"]];
                self.leftMouseCounter = [NSNumber numberWithInt:(1 + [self.leftMouseCounter intValue])];
                break;
            }
                
            // Key down
            case 10:
            {
                [self logMessageToLogView:[NSString stringWithFormat:@"Keyboard key down!"]];
                self.keyDownCounter = [NSNumber numberWithInt:(1 + [self.keyDownCounter intValue])];
                break;
            }
                
            default:
            {
                break;
            }
        }
    }];
    
    [self logMessageToLogView:[NSString stringWithFormat:@"Start Recording"]];
}

- (BOOL)applicationShouldTerminateAfterLastWindowClosed:(NSApplication *)theApplication {
    return NO;
}

- (BOOL)validateToolbarItem:(NSToolbarItem *)theItem {
    return YES;
}

-(void)logMessageToLogView:(NSString*)message {
    [logView setString: [[logView string] stringByAppendingFormat:@"%@: %@\n", [self.logDateFormatter stringFromDate:[NSDate date]],  message]];
    
    [logView scrollRangeToVisible:NSMakeRange([[logView string] length], 0)];
}

@end
