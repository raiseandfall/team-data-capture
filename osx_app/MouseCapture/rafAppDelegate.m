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
@synthesize toolbarConnectButton;
@synthesize toolbarDisconnectButton;
@synthesize socketStatus;
@synthesize cursorPosXLabel;
@synthesize cursorPosYLabel;
@synthesize cursorDeltaXLabel;
@synthesize cursorDeltaYLabel;
@synthesize leftMouseCounterLabel;
@synthesize isGlobalRecording;
@synthesize isScrollRecording;
@synthesize isMouseRecording;

@synthesize cursorPositionX;
@synthesize cursorPositionY;
@synthesize leftMouseCounter;

// VARIABLES
NSString *TRACKED_CHARS = @"abcdefghijklmnopqrstuvwxyz0123456789";
NSString *SEPARATORS = @" []{}|,.;:<>/?!@#$%^&*()_-+=~`'\"\\";
NSString *SEPARATORS_KEY_CODES = @"$";
NSString *currentWord = @"";
int clientID = 0;
NSDictionary *ACTION_TYPES;
BOOL ALLOW_NOTIFICATIONS = YES;

Notifier *notifier;
SRWebSocket *_webSocket;
float thresholdX = 0;
float thresholdY = 0;
NSRect firstScreenFrame;
NSRect secondScreenFrame;

NSString *LABEL_SHOW_LOGS = @"Show logs";
NSString *LABEL_HIDE_LOGS = @"Hide logs";
NSString *LABEL_SERVER_UP = @"Connected to Server";
NSString *LABEL_SERVER_DOWN = @"Server Unavailable";
NSString *LABEL_RECORDING_MOUSE = @"Recording mouse";
NSString *LABEL_NOT_RECORDING_MOUSE = @"Not recording mouse";
NSString *LABEL_RECORDING_SCROLL = @"Recording scroll";
NSString *LABEL_NOT_RECORDING_SCROLL = @"Not recording scroll";
NSString *LABEL_START_ALL_RECORDINGS = @"Start all recordings";
NSString *LABEL_STOP_ALL_RECORDINGS = @"Stop all recordings";

NSString *COPYRIGHT_TXT = @"With ❤ from JVST";


/**
 * @function        applicationDidFinishLaunching
 * @description     called when app finished launching
**/
- (void)applicationDidFinishLaunching:(NSNotification *)aNotification
{
    self.isGlobalRecording = YES;
    self.logDateFormatter = [[NSDateFormatter alloc] init];
    [self.logDateFormatter setTimeStyle:NSDateFormatterMediumStyle];
    
    // Version number
    NSDictionary *info = [[NSBundle mainBundle] infoDictionary];
    NSString *versioning = [NSString stringWithFormat:@"v%@ b%@",
                            [info objectForKey:@"CFBundleShortVersionString"],
                            [info objectForKey:@"CFBundleVersion"]];
    [[self versionNumber] setStringValue:versioning];
    [[self versionNumberItem] setTitle:[NSString stringWithFormat:@"%@ - %@", COPYRIGHT_TXT, versioning]];
    
    // Notifier
    notifier = [[Notifier alloc] init];
    
    // Start recording id enabled
    if (self.isGlobalRecording) {
        [self initCounters];
        [self _connectSocket];
    }
    
    // Calculate global resolution
    [self calculateGlobalResolution];
    
    // Get User settings
    [self.userSettingHost setStringValue:[self getUserSettings:@"host"]];
    [self.userSettingPort setStringValue:[self getUserSettings:@"port"]];
    [self.userSettingDisplayNotifications setState:[[self getUserSettings:@"displaySystemNotifications"] intValue]];
    
    // ACTION TYPES
    ACTION_TYPES = [NSDictionary dictionaryWithObjectsAndKeys:
                       @"mousemove", @"MOUSE_MOVE",
                       @"click", @"CLICK",
                       @"messenger", @"MESSENGER",
                       @"scroll", @"SCROLL",
                        nil];
    
    // Check if we are closing the logger window
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(onClosingLogger:) name:NSWindowWillCloseNotification
                                               object:self.logWindow];
    
    // Check if we are closing the preferences window
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(onClosingPreferences:) name:NSWindowWillCloseNotification
                                               object:self.preferencesWindow];
    
    // Check if we are closing the preferences window
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(onClosingMessenger:) name:NSWindowWillCloseNotification
                                               object:self.messengerWindow];
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
        currentScreen = firstScreenFrame;
        localX = adjustedX - firstScreenMinX;
        localY = adjustedY - firstScreenMinY;
    } else {
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
 * @function        getUserSettings
 * @description     get user settings
**/
- (NSString*)getUserSettings :(NSString*)settingName {
    NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
    NSString *userSetting = [defaults objectForKey:settingName];
    
    if (userSetting == nil || [userSetting length] == 0) {
        return @"";
    }
    return userSetting;
}

/**
 * @function        saveUserSettings
 * @description     save user settings
**/
- (void)saveUserSettings {
    [[NSUserDefaults standardUserDefaults] setObject:self.userSettingHost.stringValue forKey:@"host"];
    [[NSUserDefaults standardUserDefaults] setObject:self.userSettingPort.stringValue forKey:@"port"];
    [[NSUserDefaults standardUserDefaults] setObject:self.userSettingDisplayNotifications.stringValue
                                              forKey:@"displaySystemNotifications"];
}

/**
 * @function        onClosingPreferences
 * @description     called when preferences window is closed
**/
- (void)onClosingPreferences:(NSNotification *)notification {
    [self saveUserSettings];
}

/**
 * @function        showMessenger
 * @description     show messenger window
 **/
- (IBAction)showMessenger:(id)sender {
    [[self messengerWindow] setLevel: NSStatusWindowLevel];
    [NSApp activateIgnoringOtherApps:YES];
    [[self messengerWindow] makeKeyAndOrderFront:nil];
}

/**
 * @function        onClosingMessenger
 * @description     called when messenger window is closed
**/
- (void)onClosingMessenger:(NSNotification *)notification {
    [self.messengerTextarea setStringValue:@""];
}

/**
 * @function        clickPostMessage
 * @description     click post message
**/
- (IBAction)clickPostMessage:(id)sender {
    NSLog(@"MESSAGE : %@", self.messengerTextarea.stringValue);
    
    // send message to server
    NSMutableDictionary *msgData = [NSMutableDictionary dictionaryWithObjectsAndKeys:@"msg", self.messengerTextarea.stringValue, nil];
    [self reportToSocket:@"WORD" :msgData];
    
    // Empty message
    [self.messengerTextarea setStringValue:@""];
}

/**
 * @function        showPreferences
 * @description     show preferences window
**/
- (IBAction)showPreferences:(id)sender{
    [[self preferencesWindow] setLevel: NSStatusWindowLevel];
    [NSApp activateIgnoringOtherApps:YES];
    [[self preferencesWindow] makeKeyAndOrderFront:nil];
}

/**
 * @function        showLogger
 * @description     show logger window
**/
- (IBAction)showLogger:(id)sender {
    if ([[self logWindow] isVisible]) {
        [[self logWindow] close];
        [[self showLoggerItem] setTitle:LABEL_SHOW_LOGS];
    } else {
        [[self logWindow] setLevel: NSStatusWindowLevel];
        [NSApp activateIgnoringOtherApps:YES];
        [[self logWindow] makeKeyAndOrderFront:nil];
        [[self showLoggerItem] setTitle:LABEL_HIDE_LOGS];
    }
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
    self.isGlobalRecording = self.isMouseRecording || self.isScrollRecording;
    
    [[self pauseScrollRecordingItem] setTitle:self.isScrollRecording ? LABEL_RECORDING_SCROLL : LABEL_NOT_RECORDING_SCROLL];
    [[self pauseScrollRecordingItem] setState:self.isScrollRecording];
    
    [[self pauseMouseRecordingItem] setTitle:self.isMouseRecording ? LABEL_RECORDING_MOUSE : LABEL_NOT_RECORDING_MOUSE];
    [[self pauseMouseRecordingItem] setState:self.isMouseRecording];

    [[self pauseAllRecordingsItem] setTitle:self.isGlobalRecording ? LABEL_STOP_ALL_RECORDINGS : LABEL_START_ALL_RECORDINGS];
}

/**
 * @function        toggleScrollRecording
 * @description     toggle scroll recording
**/
- (IBAction)toggleScrollRecording:(id)sender {
    self.isScrollRecording = !self.isScrollRecording;
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


/*******************
 * WEB SOCKET 
 *******************/

/**
 * @function        connectSocket
 * @description     connect to web socket
**/
- (void)connectSocket:(id)sender {
    [self _connectSocket];
    
    [toolbarConnectButton setEnabled:NO];
    [toolbarDisconnectButton setEnabled:YES];
}

/**
 * @function        disconnectSocket
 * @description     disconnect web socket
**/
- (void)disconnectSocket:(id)sender {
    _webSocket.delegate = nil;
    [_webSocket close];
    _webSocket = nil;

    [toolbarConnectButton setEnabled:YES];
    [toolbarDisconnectButton setEnabled:NO];
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
    self.leftMouseCounter = [NSNumber numberWithInt:0];
}

/**
 * @function        _connectSocket
 * @description     connect to web socket
**/
- (void)_connectSocket {
    _webSocket.delegate = nil;
    [_webSocket close];
    
    // If no host & port in the configuration
    if ([[self getUserSettings:@"host"] isEqualToString:@""] || [[self getUserSettings:@"port"] isEqualToString:@""]) {
        [notifier push:@"Missing server parameters" :@"Please specifiy the server host & port in the preferences" :YES :nil];
    } else {
        _webSocket = [[SRWebSocket alloc] initWithURLRequest:[NSURLRequest requestWithURL:[NSURL URLWithString:[NSString
                                                                                                                stringWithFormat:@"ws://%@:%@",
                                                                                                                [self getUserSettings:@"host"],
                                                                                                                [self getUserSettings:@"port"]]]]];
        _webSocket.delegate = self;
    
        [socketStatus setStringValue:@"Opening connection!"];
        [_webSocket open];
    }
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
    self.isMouseRecording = NO;
    self.isScrollRecording = NO;
    [NSEvent removeMonitor:monitorUserInputs];
    monitorUserInputs = nil;
    
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
    self.isMouseRecording = YES;
    self.isScrollRecording = YES;
    
    NSLog(@"startRecording");
    
    // Fire everytime cursor move
    NSUInteger eventMasks = NSMouseMovedMask | NSLeftMouseDownMask | NSScrollWheelMask;
    
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
                
                    NSMutableDictionary *moveData = [NSMutableDictionary dictionaryWithObjectsAndKeys:
                                                    [localPosition objectForKey:@"position"], @"pos",
                                                    delta, @"delta",
                                                    [localPosition objectForKey:@"screen"], @"screen",
                                                    nil];
                
                    self.cursorDeltaX = [NSNumber numberWithFloat:[incomingEvent deltaX]];
                    self.cursorDeltaY = [NSNumber numberWithFloat:[incomingEvent deltaY]];
                    self.cursorPositionX = [NSNumber numberWithFloat:location.x];
                    self.cursorPositionY = [NSNumber numberWithFloat:location.y];
                
                    [self reportToSocket:@"MOUSE_MOVE" :moveData];
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
                
            // Scroll wheel ( X & Y )
            case 22:
            {
                if ([self isScrollRecording]) {
                    float deltaX = [incomingEvent deltaX];
                    float deltaY = [incomingEvent deltaY];
                    
                    // Let's not send scroll if null
                    if (deltaX != 0 || deltaY != 0) {
                        NSDictionary *delta = [NSDictionary dictionaryWithObjectsAndKeys:
                                               [NSNumber numberWithFloat:[incomingEvent deltaX]], @"x",
                                               [NSNumber numberWithFloat:[incomingEvent deltaY]], @"y",
                                               nil];
                    
                        NSMutableDictionary *scrollData = [NSMutableDictionary dictionaryWithObjectsAndKeys:
                                                           delta, @"delta",
                                                           nil];
                    
                        [self reportToSocket:@"SCROLL" :scrollData];
                    }
                }
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
 * @function        clearButtonPressed
 * @description     called when clear button is pressed
**/
- (IBAction)clearButtonPressed:(id)sender {
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
    //NSLog(@"Websocket :: Connected");
    [socketStatus setStringValue:@"Websocket Connected!"];
    
    [[self serverStatusItem] setTitle:LABEL_SERVER_UP];
    [[self serverStatusItem] setState:NSOnState];
}

- (void)webSocket:(SRWebSocket *)webSocket didFailWithError:(NSError *)error {
    //NSLog(@"WebSocket :: Failed With Error %@", error);
    
    [socketStatus setStringValue:@"WebSocket Connection Failed! (see logs)"];
    _webSocket = nil;
    
    // Push notification
    if ([[self getUserSettings:@"displaySystemNotifications"] intValue] == 1) {
        [notifier push:@"Connection to WebSocket failed" :@"The connection to the WebSocket failed. Please retry." :YES :nil];
    }
    
    [[self serverStatusItem] setTitle:LABEL_SERVER_DOWN];
    [[self serverStatusItem] setState:NSOffState];
}

- (void)webSocket:(SRWebSocket *)webSocket didReceiveMessage:(NSString *)message {
    NSError* error;
    NSDictionary* info = [NSJSONSerialization JSONObjectWithData:[message dataUsingEncoding:NSUTF8StringEncoding] options:0 error:&error];
    NSString *type = [info objectForKey:@"type"];
    
    //NSLog(@"Websocket :: didReceiveMessage : %@", message);
    
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
    clientID = 0;
    
    // Push notification
    if ([[self getUserSettings:@"displaySystemNotifications"] intValue] == 1) {
        [notifier push:@"WebSocket just closed" :@"The WebSocket just closed, the app lost connection. Please retry." :YES :nil];
    }
    
    [socketStatus setStringValue:@"Websocket Connection Closed! (see logs)"];
    [self logMessageToLogView:reason];
    [[self serverStatusItem] setState:NSOffState];
    _webSocket = nil;
}

@end
