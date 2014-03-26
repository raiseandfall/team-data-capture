//
//  rafAppDelegate.m
//  Team Data Capture
//
//  Created by Matthieu COLLE on 2/22/14.
//  Copyright (c) 2014 Matthieu COLLE. All rights reserved.
//

#import "rafAppDelegate.h"
#import "MacAddress.h"
#import "Notifier.h"

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

// VARIABLES
NSString *TRACKED_CHARS = @"abcdefghijklmnopqrstuvwxyz0123456789";
NSString *SEPARATORS = @" []{}|,.;:<>/?!@#$%^&*()_-+=~`'\"\\";
NSString *SEPARATORS_KEY_CODES = @"$";
NSString *currentWord = @"";
int clientID = 0;
NSDictionary *ACTION_TYPES;
BOOL ALLOW_WORDS_TRACKING = FALSE;
BOOL ALLOW_NOTIFICATIONS = TRUE;

Notifier *notifier;
SRWebSocket *_webSocket;
float thresholdX = 0;
float thresholdY = 0;
NSRect firstScreenFrame;
NSRect secondScreenFrame;

NSString *WEBSOCKET_PROTOCOL = @"ws";
NSString *WEBSOCKET_HOST = @"192.168.173.123";
NSString *WEBSOCKET_PORT = @"9000";

NSString *LABEL_SHOW_LOGS = @"Show logs";
NSString *LABEL_HIDE_LOGS = @"Hide logs";
NSString *LABEL_SERVER_UP = @"Connected to Server";
NSString *LABEL_SERVER_DOWN = @"Server Unavailable";
NSString *LABEL_RECORDING_MOUSE = @"Recording mouse";
NSString *LABEL_NOT_RECORDING_MOUSE = @"Not recording mouse";
NSString *LABEL_RECORDING_KEYBOARD = @"Recording keyboard hits";
NSString *LABEL_NOT_RECORDING_KEYBOARD = @"Not recording keyboard hits";
NSString *LABEL_START_ALL_RECORDINGS = @"Start all recordings";
NSString *LABEL_STOP_ALL_RECORDINGS = @"Stop all recordings";

/**
 * @function        applicationDidFinishLaunching
 * @description     called when app finished launching
**/
- (void)applicationDidFinishLaunching:(NSNotification *)aNotification
{
    self.isGlobalRecording = YES;
    self.logDateFormatter = [[NSDateFormatter alloc] init];
    [self.logDateFormatter setTimeStyle:NSDateFormatterMediumStyle];
    
    notifier = [[Notifier alloc] init];
    
    // Start recording id enabled
    if (self.isGlobalRecording) {
        [self initCounters];
        [self startSocket];
    }
    
    [self calculateGlobalResolution];
    
    // ACTION TYPES
    ACTION_TYPES = [NSDictionary dictionaryWithObjectsAndKeys:
                       @"mousemove", @"MOUSE_MOVE",
                       @"click", @"CLICK",
                       @"keydown", @"KEY_DOWN",
                       @"word", @"WORD",
                       @"mousewheel", @"MOUSE_WHEEL",
                        nil];
    
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
 * @function        calculateGlobalResolution
 * @description     calculate global resolution ( handles multiple screens )
**/
- (void)calculateGlobalResolution {
    NSRect screenFrame;
    NSArray *screenArray = [NSScreen screens];
    NSUInteger screenCount = [screenArray count];
    float totalWidth = 0;
    float totalHeight = 0;
    
    // Main screen
    NSScreen *screen = [screenArray objectAtIndex:0];
    screenFrame = [screen frame];
    totalWidth = screenFrame.size.width;
    totalHeight = screenFrame.size.height;
    firstScreenFrame = screenFrame;
    
    // If more than one screen
    if (screenCount > 1) {
        NSScreen *screen = [screenArray objectAtIndex:1];
        screenFrame = [screen frame];
        float screenX = screenFrame.origin.x;
        float screenY = screenFrame.origin.y;
        secondScreenFrame = screenFrame;
        
        if (screenX < 0) {
            thresholdX = fabsf(screenX);
        }
        if (screenY < 0) {
            thresholdY = fabsf(screenY);
        }
    }
}

/**
 * @function        getLocalPosition
 * @description     get local position
**/
- (NSDictionary*)getLocalPosition :(CGPoint)loc {
    // Add threshold to get global absolute position
    float adjustedX = loc.x + thresholdX;
    float adjustedY = loc.y + thresholdY;
    
    // Get current screen from absolute position
    float firstScreenMinX = firstScreenFrame.origin.x + thresholdX;
    float firstScreenMaxX = firstScreenMinX + firstScreenFrame.size.width;
    float firstScreenMinY = firstScreenFrame.origin.y + thresholdY;
    float firstScreenMaxY = firstScreenMinY + firstScreenFrame.size.height;
    
    float secondScreenMinX = secondScreenFrame.origin.x + thresholdX;
    float secondScreenMinY = secondScreenFrame.origin.y + thresholdY;
    
    NSDictionary *localPosition;
    NSDictionary *currentResolution;
    CGRect currentScreen;
    float localX = 0;
    float localY = 0;
    
    if ((adjustedX >= firstScreenMinX && adjustedX <= firstScreenMaxX) && (adjustedY >= firstScreenMinY && adjustedY <= firstScreenMaxY)) {
        NSLog(@"CURSOR ON FIRST SCREEN :: globalPos : %f, %f - localPos : %f, %f", adjustedX, adjustedY, (adjustedX - firstScreenMinX), (adjustedY - firstScreenMinY));
        currentScreen = firstScreenFrame;
        localX = adjustedX - firstScreenMinX;
        localY = adjustedY - firstScreenMinY;
    } else {
        NSLog(@"CURSOR ON SECOND SCREEN :: globalPos : %f, %f - localPos : %f, %f", adjustedX, adjustedY, (adjustedX - secondScreenMinX), (adjustedY - secondScreenMinY));
        currentScreen = secondScreenFrame;
        localX = adjustedX - secondScreenMinX;
        localY = adjustedY - secondScreenMinY;
    }
    
    currentResolution = [NSDictionary dictionaryWithObjectsAndKeys:
                         [NSNumber numberWithFloat:currentScreen.size.width], @"width",
                         [NSNumber numberWithFloat:currentScreen.size.height], @"height",
                         nil];
    localPosition = [NSDictionary dictionaryWithObjectsAndKeys:
                     [NSNumber numberWithFloat:localX], @"x",
                     [NSNumber numberWithFloat:localY], @"y",
                     nil];
    
    return [NSDictionary dictionaryWithObjectsAndKeys:
            currentResolution, @"screen",
            localPosition, @"position", nil];
}

/**
 * @function        onClosingLogger
 * @description     called when logger window is closed
**/
- (void)onClosingLogger:(NSNotification *)notification {
    [[self showLoggerItem] setTitle:LABEL_SHOW_LOGS];
}

/**
 * @function        displayPreferencesWindow
 * @description     display preferences window
**/
- (IBAction)displayPreferencesWindow:(id)sender{
    [[self preferences] makeKeyAndOrderFront:nil];
}


/*******************
 * MENU BAR ITEM
 *******************/

- (void)awakeFromNib {
    _statusItem = [[NSStatusBar systemStatusBar] statusItemWithLength:NSVariableStatusItemLength];
    
    NSImage *menuIcon = [NSImage imageNamed:@"Menu Icon"];
    NSImage *highlightIcon = [NSImage imageNamed:@"Menu Icon"];
    
    [[self statusItem] setImage:menuIcon];
    [[self statusItem] setAlternateImage:highlightIcon];
    [[self statusItem] setMenu:[self menu]];
    [[self statusItem] setHighlightMode:YES];
}

- (IBAction)fakeAction:(id)sender {
    NSLog(@"%@ %s", self, __func__);
}

/**
 * @function        toggleAllRecordings
 * @description     toggle all recordings
**/
- (IBAction)toggleAllRecordings:(id)sender {
    // If recording started already
    if (!self.isGlobalRecording && _webSocket != nil) {
        [self startRecording];
    } else {
        [self stopRecording];
    }
}

/**
 * @function        drawIndicators
 * @description     draw menu bar indicators
**/
- (void)drawIndicators {
    self.isGlobalRecording = self.isMouseRecording || self.isKeyboardRecording;
    
    [[self pauseKeyboardRecordingItem] setTitle:self.isKeyboardRecording ? LABEL_RECORDING_KEYBOARD : LABEL_NOT_RECORDING_KEYBOARD];
    [[self pauseKeyboardRecordingItem] setState:self.isKeyboardRecording];
    
    [[self pauseMouseRecordingItem] setTitle:self.isMouseRecording ? LABEL_RECORDING_MOUSE : LABEL_NOT_RECORDING_MOUSE];
    [[self pauseMouseRecordingItem] setState:self.isMouseRecording];

    [[self pauseAllRecordingsItem] setTitle:self.isGlobalRecording ? LABEL_STOP_ALL_RECORDINGS : LABEL_START_ALL_RECORDINGS];
}

/**
 * @function        toggleKeyboardRecording
 * @description     toggle keyboard recording
**/
- (IBAction)toggleKeyboardRecording:(id)sender {
    self.isKeyboardRecording = !self.isKeyboardRecording;
    [self drawIndicators];
}

/**
 * @function        toggleMouseRecording
 * @description     toggle Mouse recording
**/
- (IBAction)toggleMouseRecording:(id)sender {
    self.isMouseRecording = !self.isMouseRecording;
    [self drawIndicators];
}

/**
 * @function        showLogger
 * @description     show logger file
**/
- (IBAction)showLogger:(id)sender {
    if ([[self window] isVisible]) {
        [[self window] close];
        [[self showLoggerItem] setTitle:LABEL_SHOW_LOGS];
    } else {
        [[self window] setLevel: NSStatusWindowLevel];
        [[self window] makeKeyAndOrderFront:nil];
        [[self showLoggerItem] setTitle:LABEL_HIDE_LOGS];
    }
}


/*******************
 * WEB SOCKET 
 *******************/

/**
 * @function        reconnect
 * @description     reconnect web socket
**/
- (void)reconnect:(id)sender {
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
    
    _webSocket = [[SRWebSocket alloc] initWithURLRequest:[NSURLRequest requestWithURL:[NSURL URLWithString:[NSString stringWithFormat:@"%@://%@:%@", WEBSOCKET_PROTOCOL, WEBSOCKET_HOST, WEBSOCKET_PORT]]]];
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
    
    NSLog(@"stopRecording");
    
    self.isGlobalRecording = NO;
    self.isKeyboardRecording = NO;
    self.isMouseRecording = NO;
    [NSEvent removeMonitor:monitorUserInputs];
    
    [self initCounters];
    
    // Change indicators in menu bar
    [self drawIndicators];
    
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
    
    NSLog(@"startRecording");
    
    // Fire everytime cursor move
    NSUInteger eventMasks = NSMouseMovedMask | NSLeftMouseDownMask | NSKeyDownMask;
    
    monitorUserInputs = [NSEvent addGlobalMonitorForEventsMatchingMask:eventMasks handler:^(NSEvent *incomingEvent) {
        switch ([incomingEvent type]) {
            // Mouse move
            case 5:
            {
                if ([self isMouseRecording]) {
                    CGPoint location = [NSEvent mouseLocation];
                    
                    // Get local window position
                    NSDictionary *localPosition = [self getLocalPosition:location];
                    
                    NSDictionary *delta = [NSDictionary dictionaryWithObjectsAndKeys:
                                         [NSNumber numberWithFloat:[incomingEvent deltaX]], @"x",
                                         [NSNumber numberWithFloat:[incomingEvent deltaY]], @"y",
                                         nil];
                
                    NSMutableDictionary *keyData = [NSMutableDictionary dictionaryWithObjectsAndKeys:
                                                    [localPosition objectForKey:@"position"], @"pos",
                                                    delta, @"delta",
                                                    [localPosition objectForKey:@"screen"], @"screen",
                                                    nil];
                
                    self.cursorDeltaX = [NSNumber numberWithFloat:[incomingEvent deltaX]];
                    self.cursorDeltaY = [NSNumber numberWithFloat:[incomingEvent deltaY]];
                    self.cursorPositionX = [NSNumber numberWithFloat:location.x];
                    self.cursorPositionY = [NSNumber numberWithFloat:location.y];
                
                    [self reportToSocket:@"MOUSE_MOVE" :keyData];
                }
                break;
            }
                
            // Left click
            case 1:
            {
                if ([self isMouseRecording]) {
                    // Report to socket
                    [self reportToSocket:@"CLICK" :nil];
                
                    [self logMessageToLogView:[NSString stringWithFormat:@"Left click!"]];
                    self.leftMouseCounter = [NSNumber numberWithInt:(1 + [self.leftMouseCounter intValue])];
                }
                break;
            }
                
            // Key down
            case 10:
            {
                if ([self isKeyboardRecording]) {
                    // Character just hit
                    NSString *_char = [[incomingEvent characters] lowercaseString];
                    int keyCode = (int)[incomingEvent keyCode];
                    NSString *_keyCode = [NSString stringWithFormat:@"%d" , [incomingEvent keyCode]];
                
                    [self logMessageToLogView:[NSString stringWithFormat:@"Key pressed : %@", _char]];
                    self.keyDownCounter = [NSNumber numberWithInt:(1 + [self.keyDownCounter intValue])];
                    
                    BOOL trackChar = [self isCharacterTracked:_char];
                    
                    // Only report key if it's a character we want to track
                    NSMutableDictionary *keyData = [NSMutableDictionary dictionaryWithObjectsAndKeys:
                                                    _char, @"keyPressed",
                                                    nil];
                    [self reportToSocket:@"KEY_DOWN" :keyData];
                    
                    // If allow works tracking
                    if (ALLOW_WORDS_TRACKING) {
                        // If it's a delete key
                        if (keyCode == 51) {
                            // Remove last character
                            if ([currentWord length] > 0) {
                                currentWord = [currentWord substringToIndex:[currentWord length] - 1];
                            }
                        
                        // If it's a separator & currentWord is not empty
                        } else if ([self isSeparator:_char:_keyCode:keyCode] && [currentWord length] > 0) {
                            // Send the word just typed and we re-init currentWord
                            NSMutableDictionary *keyData = [NSMutableDictionary dictionaryWithObjectsAndKeys:
                                                            currentWord, @"word",
                                                            nil];
                            [self reportToSocket:@"WORD" :keyData];
                            currentWord = @"";
                        
                        // Stack letter to current word
                        } else if (trackChar) {
                            currentWord = [currentWord stringByAppendingString:_char];
                        }
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
    
    // Update menu bar indicators
    [self drawIndicators];
    
    [self logMessageToLogView:[NSString stringWithFormat:@"Start Recording"]];
}


/**
 * @function        isCharacterTracked
 * @description     check if a character has to be tracked
**/
- (BOOL)isCharacterTracked:(NSString*)_char {
    // Check if it's a character to track
    NSCharacterSet *charSet = [NSCharacterSet characterSetWithCharactersInString:TRACKED_CHARS];
    NSRange range = [_char rangeOfCharacterFromSet:charSet];
    
    if (range.location != NSNotFound) {
        return TRUE;
    } else {
        return FALSE;
    }
}


/**
 * @function        isSeparator
 * @description     check if a character is a separator
 **/
- (BOOL)isSeparator:(NSString*)_char :(NSString*)_sKeyCode :(int)_iKeyCode {
    // Check if it's a character / number / space / comma / period
    NSCharacterSet *charSet;
    NSRange range;
    
    charSet = [NSCharacterSet characterSetWithCharactersInString:SEPARATORS];
    range = [_char rangeOfCharacterFromSet:charSet];
    
    // If return key
    if (_iKeyCode == 36) {
        return TRUE;
    }
    
    if (range.location != NSNotFound) {
        return TRUE;
    } else {
        charSet = [NSCharacterSet characterSetWithCharactersInString:SEPARATORS_KEY_CODES];
        range = [_sKeyCode rangeOfCharacterFromSet:charSet];
        
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
- (void)reportToSocket:(NSString*)type :(NSMutableDictionary*)eventData {
    // If client not connected
    if (clientID == 0){
        return;
    }
    
    NSError *error;
    NSString *requestJson;
    NSString *callType = type;
    
    // Add date to data if type is ACTION_TYPE
    if ([ACTION_TYPES objectForKey:type] != nil) {
        NSString *timeStampValue = [NSString stringWithFormat:@"%ld", (long)[[NSDate date] timeIntervalSince1970]];
        callType = [ACTION_TYPES objectForKey:type];
        [eventData setValue:timeStampValue forKey:@"date"];
    }
    
    NSMutableDictionary *finalDataObject = [NSMutableDictionary dictionaryWithObjectsAndKeys:
                                            callType, @"type",
                                            [NSString stringWithFormat:@"%d", clientID], @"id",
                                            nil];
    
    // Add event data if not null
    if (eventData != nil) {
        [finalDataObject setValue:eventData
                           forKey:@"data"];
    }
    
    // Add client=app if auth type
    if ([type isEqualToString:@"auth"]) {
        [finalDataObject setValue:@"app"
                           forKey:@"client"];
    }
    
    NSData *jsonData = [NSJSONSerialization dataWithJSONObject:finalDataObject
                                                       options:NSJSONWritingPrettyPrinted
                                                         error:&error];
    if (jsonData) {
        requestJson = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
        [_webSocket send:requestJson];
    }
}


/**
 * @function        confirmHandshake
 * @description     confirm handhake : send MAC Address & user name
**/
- (void)confirmHandshake {
    MacAddress *macAddress = [[MacAddress alloc] init];
    
    NSMutableDictionary *connectionData = [NSMutableDictionary dictionaryWithObjectsAndKeys:
                                           [macAddress getMacAddress], @"mac",
                                            NSUserName(), @"username",
                                           nil];
    
    [self reportToSocket:@"auth" :connectionData];
}


/**
 * @function        logMessageToLogView
 * @description     log message to UI
**/
- (void)logMessageToLogView:(NSString*)message {
    [logView setString: [[logView string] stringByAppendingFormat:@"%@: %@\n", [self.logDateFormatter stringFromDate:[NSDate date]],  message]];
    
    [logView scrollRangeToVisible:NSMakeRange([[logView string] length], 0)];
}


#pragma mark - SRWebSocketDelegate

- (void)webSocketDidOpen:(SRWebSocket *)webSocket {
    NSLog(@"Websocket :: Connected");
    [socketStatus setStringValue:@"Websocket Connected!"];
    
    [[self serverStatusItem] setTitle:LABEL_SERVER_UP];
    [[self serverStatusItem] setState:NSOnState];
}

- (void)webSocket:(SRWebSocket *)webSocket didFailWithError:(NSError *)error {
    NSLog(@"WebSocket :: Failed With Error %@", error);
    
    [socketStatus setStringValue:@"WebSocket Connection Failed! (see logs)"];
    _webSocket = nil;
    
    // Push notification
    if (ALLOW_NOTIFICATIONS) {
        [notifier push:@"Connection to WebSocket failed" :@"The connection to the WebSocket failed. Please retry." :TRUE :nil];
    }
    
    [[self serverStatusItem] setTitle:LABEL_SERVER_DOWN];
    [[self serverStatusItem] setState:NSOffState];
}

- (void)webSocket:(SRWebSocket *)webSocket didReceiveMessage:(NSString *)message {
    NSError* error;
    NSDictionary* info = [NSJSONSerialization JSONObjectWithData:[message dataUsingEncoding:NSUTF8StringEncoding] options:0 error:&error];
    NSString *type = [info objectForKey:@"type"];
    
    NSLog(@"Websocket :: didReceiveMessage : %@", message);
    
    // If hello message
    if ([type isEqualToString:@"hello"]) {
        clientID = [[[info objectForKey:@"data"] objectForKey:@"id"] intValue];
        
        // confirm client connection
        [self confirmHandshake];
        
    // If welcome message
    } else if ([type isEqualToString:@"welcome"]) {
        // Start recording actions
        [self startRecording];
    }
    
    if (error) {
        NSLog(@"Error: %@",error);
    }
}

- (void)webSocket:(SRWebSocket *)webSocket didCloseWithCode:(NSInteger)code reason:(NSString *)reason wasClean:(BOOL)wasClean {
    NSLog(@"Websocket :: closed : %@", reason);
    clientID = 0;
    
    // Push notification
    if (ALLOW_NOTIFICATIONS) {
        [notifier push:@"WebSocket just closed" :@"The WebSocket just closed, the app lost connection. Please retry." :TRUE :nil];
    }
    
    [socketStatus setStringValue:@"Websocket Connection Closed! (see logs)"];
    [self logMessageToLogView:reason];
    [[self serverStatusItem] setState:NSOffState];
    _webSocket = nil;
}

@end
