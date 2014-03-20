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
@synthesize isGlobalRecording;
@synthesize isKeyboardRecording;
@synthesize isMouseRecording;

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
    self.isGlobalRecording = YES;
    self.logDateFormatter = [[NSDateFormatter alloc] init];
    [self.logDateFormatter setTimeStyle:NSDateFormatterMediumStyle];
    
    // Start recording id enabled
    if (self.isGlobalRecording) {
        [self initCounters];
        [self startRecording];
        [self startSocket];
    }
    
    // Check if we are closing the logger window
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(onClosingLogger:) name:NSWindowWillCloseNotification
                                               object:[self window]];
}

- (BOOL)applicationShouldTerminateAfterLastWindowClosed:(NSApplication *)theApplication {
    return NO;
}

- (BOOL)validateToolbarItem:(NSToolbarItem *)theItem {
    return YES;
}

/**
 * @function        onClosingLogger
 * @description     called when logger window is closed
**/
- (void)onClosingLogger:(NSNotification *)notification
{
    [[self showLoggerItem] setTitle:@"Show logger"];
}



/*******************
 * MENU BAR ITEM
 *******************/

- (void)awakeFromNib {
    _statusItem = [[NSStatusBar systemStatusBar] statusItemWithLength:NSVariableStatusItemLength];
    
    NSImage *menuIcon = [NSImage imageNamed:@"Menu Icon"];
    NSImage *highlightIcon = [NSImage imageNamed:@"Menu Icon"];
    //[highlightIcon setTemplate:YES];
    
    [[self statusItem] setImage:menuIcon];
    [[self statusItem] setAlternateImage:highlightIcon];
    [[self statusItem] setMenu:[self menu]];
    [[self statusItem] setHighlightMode:YES];
}

/**
 * @function        toggleAllRecordings
 * @description     toggle all recordings
**/
- (IBAction)toggleAllRecordings:(id)sender {
    // If recording started already
    if (!self.isGlobalRecording) {
        [self startRecording];
        [[self pauseAllRecordingsItem] setTitle:@"Stop all recordings"];
        [[self pauseKeyboardRecordingItem] setTitle:@"Stop keyboard recording"];
        [[self pauseMouseRecordingItem] setTitle:@"Stop mouse recording"];
    } else {
        [self stopRecording];
        [[self pauseAllRecordingsItem] setTitle:@"Start all recordings"];
        [[self pauseKeyboardRecordingItem] setTitle:@"Start keyboard recording"];
        [[self pauseMouseRecordingItem] setTitle:@"Start mouse recording"];
    }
}

/**
 * @function        toggleKeyboardRecording
 * @description     toggle keyboard recording
**/
- (IBAction)toggleKeyboardRecording:(id)sender {
    self.isKeyboardRecording = !self.isKeyboardRecording;
    
    if (self.isKeyboardRecording) {
        [[self pauseKeyboardRecordingItem] setTitle:@"Stop keyboard recording"];
    } else {
        [[self pauseKeyboardRecordingItem] setTitle:@"Start keyboard recording"];
    }
}

/**
 * @function        toggleMouseRecording
 * @description     toggle Mouse recording
**/
- (IBAction)toggleMouseRecording:(id)sender {
    self.isMouseRecording = !self.isMouseRecording;
    
    if (self.isMouseRecording) {
        [[self pauseMouseRecordingItem] setTitle:@"Stop mouse recording"];
    } else {
        [[self pauseMouseRecordingItem] setTitle:@"Start mouse recording"];
    }
}

/**
 * @function        showLogger
 * @description     show logger file
**/
- (IBAction)showLogger:(id)sender {
    if ([[self window] isVisible]) {
        [[self window] close];
        [[self showLoggerItem] setTitle:@"Show logger"];
    } else {
        [[self window] setLevel: NSStatusWindowLevel];
        [[self window] makeKeyAndOrderFront:nil];
        [[self showLoggerItem] setTitle:@"Hide logger"];
    }
}




/*******************
 * WEB SOCKET 
 *******************/

/**
 * @function        reconnect
 * @description     reconnect web socket
**/
- (void)reconnect:(id)sender;
{
    [self _reconnectSocket];
}


/**
 * @function        init
 * @description
**/
- (void)initCounters {
    self.cursorDeltaX = [NSNumber numberWithFloat:0];
    self.cursorDeltaY = [NSNumber numberWithFloat:0];
    self.cursorPositionX = [NSNumber numberWithFloat:0];
    self.cursorPositionY = [NSNumber numberWithFloat:0];
    self.keyDownCounter = [NSNumber numberWithInt:0];
    self.leftMouseCounter = [NSNumber numberWithInt:0];
}


/**
 * @function        startSocket
 * @description     start web socket
**/
- (void)startSocket {
    [self _reconnectSocket];
}


/**
 * @function        _reconnectSocket
 * @description     reconnect to web socket
**/
- (void)_reconnectSocket {
    _webSocket.delegate = nil;
    [_webSocket close];
    
    _webSocket = [[SRWebSocket alloc] initWithURLRequest:[NSURLRequest requestWithURL:[NSURL URLWithString:@"ws://localhost:9000/"]]];
    _webSocket.delegate = self;
    
    [socketStatus setStringValue:@"Opening connection!"];
    [_webSocket open];
}


/**
 * @function        stopRecording
 * @description     stop global recording
 **/
- (void)stopRecording {
    if (!self.isGlobalRecording) {
        return;
    }
    self.isGlobalRecording = NO;
    self.isKeyboardRecording = NO;
    self.isMouseRecording = NO;
    [NSEvent removeMonitor:monitorUserInputs];
    
    [self initCounters];
    [self logMessageToLogView:[NSString stringWithFormat:@"Stop Recording"]];
}


/**
 * @function        startRecording
 * @description     start global recording
**/
- (void)startRecording {
    
    self.isGlobalRecording = YES;
    self.isKeyboardRecording = YES;
    self.isMouseRecording = YES;
    
    // Fire everytime cursor move
    NSUInteger eventMasks = NSMouseMovedMask | NSLeftMouseDownMask | NSKeyDownMask;
    
    monitorUserInputs = [NSEvent addGlobalMonitorForEventsMatchingMask:eventMasks handler:^(NSEvent *incomingEvent) {
        switch ([incomingEvent type]) {
            // Mouse move
            case 5:
            {
                if ([self isMouseRecording]) {
                    NSLog(@"mouse move :: mouse recording allowed !!!");
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
                }
                    
                break;
            }
                
            // Left click
            case 1:
            {
                if ([self isMouseRecording]) {
                    NSLog(@"click :: mouse recording allowed !!!");
                    // Report to socket
                    [self reportToSocket:@"click":nil];
                
                    [self logMessageToLogView:[NSString stringWithFormat:@"Left click!"]];
                    self.leftMouseCounter = [NSNumber numberWithInt:(1 + [self.leftMouseCounter intValue])];
                }
                break;
            }
                
            // Key down
            case 10:
            {
                if ([self isKeyboardRecording]) {
                    NSLog(@"keyboard :: mouse recording allowed !!!");
                    // Character just hit
                    NSString *_char = [[incomingEvent characters] lowercaseString];
                    //char key = [incomingEvent keyCode];
                    NSString *_keyCode = [NSString stringWithFormat:@"%d" , [incomingEvent keyCode]];
                    //NSLog(@"key : '%@'", _char);
                
                    //unichar character = [_char characterAtIndex:0];
                    //NSLog(@"keyCode :: %@", _keyCode);
                    //NSLog(@"special character :: %c", character);
                
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
 * @function        isCharacterTracked
 * @description     check if a character has to be tracked
**/
-(BOOL)isCharacterTracked:(NSString*)_char {
    // Check if it's a character / number / space / comma / period
    NSCharacterSet *charSet = [NSCharacterSet characterSetWithCharactersInString:TRACKED_CHARS];
    NSRange range = [_char rangeOfCharacterFromSet:charSet];
    
    if (range.location != NSNotFound) {
        //NSLog(@"Allowed character : %@", _char);
        return TRUE;
    } else {
        //NSLog(@"NOT Allowed character : %@", _char);
        return FALSE;
    }
}


/**
 * @function        isSeparator
 * @description     check if a character is a separator
 **/
-(BOOL)isSeparator:(NSString*)_char :(NSString*)keyCode {
    // Check if it's a character / number / space / comma / period
    NSCharacterSet *charSet;
    NSRange range;
    
    charSet = [NSCharacterSet characterSetWithCharactersInString:SEPARATORS];
    range = [_char rangeOfCharacterFromSet:charSet];
    
    if (range.location != NSNotFound) {
        //NSLog(@"Separator ! : %@", _char);
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


/**
 * @function        clearButtonPressed
 * @description     called when clear button is pressed
**/
- (IBAction)clearButtonPressed:(id)sender {
    self.keyDownCounter = [NSNumber numberWithInt:0];
    self.leftMouseCounter = [NSNumber numberWithInt:0];
    [self.logView setString:@""];
}

/**
 * @function        recordButtonPressed
 * @description     called when record button is pressed
**/
- (IBAction)recordButtonPressed:(id)sender {
    if (self.isGlobalRecording) {
        return;
    }
    [self toggleAllRecordings:nil];
}

/**
 * @function        stopButtonPressed
 * @description     called when stop button is pressed
**/
- (IBAction)stopButtonPressed:(id)sender {
    if (!self.isGlobalRecording) {
        return;
    }
    [self toggleAllRecordings:nil];
}

/**
 * @function        reportToSocket
 * @description     report event to web socket
**/
-(void)reportToSocket:(NSString*)type :(NSDictionary*)eventData {
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

    } else {
        requestJson = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
    }
    
    [_webSocket send:requestJson];
}

/**
 * @function        logMessageToLogView
 * @description     log message to UI
**/
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
