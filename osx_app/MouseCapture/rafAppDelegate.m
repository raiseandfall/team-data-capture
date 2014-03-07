//
//  rafAppDelegate.m
//  MouseCapture
//
//  Created by Matthieu COLLE on 2/22/14.
//  Copyright (c) 2014 Matthieu COLLE. All rights reserved.
//

#import "rafAppDelegate.h"

// SocketRocket
#import <SocketRocket/SRWebSocket.h>

@implementation rafAppDelegate
@synthesize logView;
@synthesize toolbarClearButton;
@synthesize toolbarRecordButton;
@synthesize toolbarStopButton;
@synthesize socketStatus;
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

SRWebSocket *_webSocket;
NSString *TRACKED_CHARS = @"abcdefghijklmnopqrstuvwxyz0123456789";
NSString *SEPARATORS = @" []{}|,.<>/?!@#$%^&*()_-+=~`\\";
NSString *SEPARATORS_KEY_CODES = @"$";

- (void)applicationDidFinishLaunching:(NSNotification *)aNotification
{
    self.recordingEnabled = YES;
    self.logDateFormatter = [[NSDateFormatter alloc] init];
    [self.logDateFormatter setTimeStyle:NSDateFormatterMediumStyle];
    
    // Start recording id enabled
    if (self.recordingEnabled) {
        [self initCounters];
        [self startRecording];
        [self startSocket];
    }
}

- (BOOL)applicationShouldTerminateAfterLastWindowClosed:(NSApplication *)theApplication {
    return NO;
}

- (BOOL)validateToolbarItem:(NSToolbarItem *)theItem {
    return YES;
}


- (void)reconnect:(id)sender;
{
    [self _reconnectSocket];
}

- (void)initCounters {
    self.cursorDeltaX = [NSNumber numberWithFloat:0];
    self.cursorDeltaY = [NSNumber numberWithFloat:0];
    self.cursorPositionX = [NSNumber numberWithFloat:0];
    self.cursorPositionY = [NSNumber numberWithFloat:0];
    self.keyDownCounter = [NSNumber numberWithInt:0];
    self.leftMouseCounter = [NSNumber numberWithInt:0];
}

- (void)startSocket {
    [self _reconnectSocket];
}

-(void) _reconnectSocket {
    _webSocket.delegate = nil;
    [_webSocket close];
    
    _webSocket = [[SRWebSocket alloc] initWithURLRequest:[NSURLRequest requestWithURL:[NSURL URLWithString:@"ws://localhost:9000/"]]];
    _webSocket.delegate = self;
    
    [socketStatus setStringValue:@"Opening connection!"];
    [_webSocket open];
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
                
                NSDictionary *keyData = [NSDictionary dictionaryWithObjectsAndKeys:
                                         [NSNumber numberWithFloat:posX], @"posX",
                                         [NSNumber numberWithFloat:posY], @"posY",
                                         [NSNumber numberWithFloat:deltaX], @"deltaX",
                                         [NSNumber numberWithFloat:deltaY], @"deltaY",
                                         nil];
                
                self.cursorDeltaX = [NSNumber numberWithFloat:deltaX];
                self.cursorDeltaY = [NSNumber numberWithFloat:deltaY];
                self.cursorPositionX = [NSNumber numberWithFloat:posX];
                self.cursorPositionY = [NSNumber numberWithFloat:posY];
                
                [self reportToSocket:@"mousemove" :keyData];
                
                break;
            }
                
            // Left click
            case 1:
            {
                // Report to socket
                [self reportToSocket:@"click":nil];
                
                [self logMessageToLogView:[NSString stringWithFormat:@"Left click!"]];
                self.leftMouseCounter = [NSNumber numberWithInt:(1 + [self.leftMouseCounter intValue])];
                break;
            }
                
            // Key down
            case 10:
            {
                // Character just hit
                NSString *_char = [[incomingEvent characters] lowercaseString];
                //char key = [incomingEvent keyCode];
                NSString *_keyCode = [NSString stringWithFormat:@"%d" , [incomingEvent keyCode]];
                NSLog(@"key : '%@'", _char);
                
                unichar character = [_char characterAtIndex:0];
                NSLog(@"keyCode :: %@", _keyCode);
                NSLog(@"special character :: %c", character);
                
                [self logMessageToLogView:[NSString stringWithFormat:@"Key pressed : %@", _char]];
                self.keyDownCounter = [NSNumber numberWithInt:(1 + [self.keyDownCounter intValue])];
                
                // Only report key if it's a character we want to track
                if ([self isCharacterTracked:_char]) {
                    NSDictionary *keyData = [NSDictionary dictionaryWithObjectsAndKeys:
                                             _char, @"keyPressed",
                                             nil];
                    
                    [self reportToSocket:@"keydown" :keyData];
                }
                
                if ([self isSeparator:_char:_keyCode]) {
                    
                }
                
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


/**
 * @function    isCharacterTracked
 **/
-(BOOL)isCharacterTracked:(NSString*)_char {
    // Check if it's a character / number / space / comma / period
    NSCharacterSet *charSet = [NSCharacterSet characterSetWithCharactersInString:TRACKED_CHARS];
    NSRange range = [_char rangeOfCharacterFromSet:charSet];
    
    if (range.location != NSNotFound) {
        NSLog(@"Allowed character : %@", _char);
        return TRUE;
    } else {
        NSLog(@"NOT Allowed character : %@", _char);
        return FALSE;
    }
}


/**
 * @function    isSeparator
 **/
-(BOOL)isSeparator:(NSString*)_char :(NSString*)keyCode {
    // Check if it's a character / number / space / comma / period
    NSCharacterSet *charSet;
    NSRange range;
    
    charSet = [NSCharacterSet characterSetWithCharactersInString:SEPARATORS];
    range = [_char rangeOfCharacterFromSet:charSet];
    
    if (range.location != NSNotFound) {
        NSLog(@"Separator ! : %@", _char);
        return TRUE;
    } else {
        // Check if it's a RETURN ( keyCode $ )
        charSet = [NSCharacterSet characterSetWithCharactersInString:SEPARATORS_KEY_CODES];
        range = [keyCode rangeOfCharacterFromSet:charSet];
        
        if (range.location != NSNotFound) {
            return TRUE;
        } else {
            return FALSE;
        }
    }
}


-(void)reportToSocket:(NSString*)type :(NSDictionary*)eventData {
    
    //NSLog(@"reportToSocket :: %@", type);
    
    NSError *error;
    NSDictionary *finalDataObject;
    NSString *requestJson;
    
    finalDataObject = [NSDictionary dictionaryWithObjectsAndKeys:
                       type, @"type",
                       eventData, @"data",
                       nil];
    
    NSData *jsonData = [NSJSONSerialization dataWithJSONObject:finalDataObject
                                                       options:NSJSONWritingPrettyPrinted
                                                         error:&error];
    
    if (!jsonData) {
        //Deal with error
    } else {
        requestJson = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
    }
    
    [_webSocket send:requestJson];
}


-(void)logMessageToLogView:(NSString*)message {
    [logView setString: [[logView string] stringByAppendingFormat:@"%@: %@\n", [self.logDateFormatter stringFromDate:[NSDate date]],  message]];
    
    [logView scrollRangeToVisible:NSMakeRange([[logView string] length], 0)];
}


#pragma mark - SRWebSocketDelegate

- (void)webSocketDidOpen:(SRWebSocket *)webSocket;
{
    NSLog(@"Websocket Connected");
    [socketStatus setStringValue:@"Connected!"];
}

- (void)webSocket:(SRWebSocket *)webSocket didFailWithError:(NSError *)error;
{
    NSLog(@":( Websocket Failed With Error %@", error);
    
    [socketStatus setStringValue:@"Connection Failed! (see logs)"];
    _webSocket = nil;
}

- (void)webSocket:(SRWebSocket *)webSocket didReceiveMessage:(id)message;
{
    NSLog(@"Received \"%@\"", message);
}

- (void)webSocket:(SRWebSocket *)webSocket didCloseWithCode:(NSInteger)code reason:(NSString *)reason wasClean:(BOOL)wasClean;
{
    NSLog(@"WebSocket closed");
    [socketStatus setStringValue:@"Connection Closed! (see logs)"];
    _webSocket = nil;
}

@end
