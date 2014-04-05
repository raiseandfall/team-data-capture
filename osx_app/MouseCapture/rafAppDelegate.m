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
@synthesize toolbarConnectButton;
@synthesize toolbarDisconnectButton;
@synthesize socketStatus;
@synthesize cursorPosXLabel;
@synthesize cursorPosYLabel;
@synthesize cursorDeltaXLabel;
@synthesize cursorDeltaYLabel;
@synthesize leftMouseCounterLabel;
@synthesize isAuthenticated;

@synthesize cursorPositionX;
@synthesize cursorPositionY;
@synthesize leftMouseCounter;

// VARIABLES
NSString *TRACKED_CHARS = @"abcdefghijklmnopqrstuvwxyz0123456789";
NSString *SEPARATORS = @" []{}|,.;:<>/?!@#$%^&*()_-+=~`'\"\\";
NSString *SEPARATORS_KEY_CODES = @"$";
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
NSString *LABEL_SERVER_UP = @"You are connected to the server";
NSString *LABEL_SERVER_DOWN = @"You are not connected to the server";
NSString *COPYRIGHT_TXT = @"With ❤ from JVST";


/**
 * @function        applicationDidFinishLaunching
 * @description     called when app finished launching
**/
- (void)applicationDidFinishLaunching:(NSNotification *)aNotification
{
    isAuthenticated = NO;
    
    self.logDateFormatter = [[NSDateFormatter alloc] init];
    [self.logDateFormatter setTimeStyle:NSDateFormatterMediumStyle];
    
    // Year
    NSDateFormatter *formatter = [[NSDateFormatter alloc] init];
    [formatter setDateFormat:@"yyyy"];
    NSString *yearString = [formatter stringFromDate:[NSDate date]];
    
    // Version number
    NSDictionary *info = [[NSBundle mainBundle] infoDictionary];
    NSString *versioning = [NSString stringWithFormat:@"v%@ b%@",
                            [info objectForKey:@"CFBundleShortVersionString"],
                            [info objectForKey:@"CFBundleVersion"]];
    [[self versionNumber] setStringValue:versioning];
    [[self versionNumberItem] setTitle:[NSString stringWithFormat:@"%@ - %@ - %@", COPYRIGHT_TXT, yearString, versioning]];
    
    // Notifier
    notifier = [[Notifier alloc] init];
    
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
    
    // Connect to socket
    [self initCounters];
    [self _connectSocket];
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
    if (isAuthenticated) {
        [[self messengerWindow] setLevel: NSStatusWindowLevel];
        [NSApp activateIgnoringOtherApps:YES];
        [[self messengerWindow] makeKeyAndOrderFront:nil];
    }
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
    // If message not null
    if ([self.messengerTextarea.stringValue length] == 0) {
        return;
    }
    
    // send message to server
    NSMutableDictionary *msgData = [NSMutableDictionary dictionaryWithObjectsAndKeys:self.messengerTextarea.stringValue, @"msg", nil];
    [self reportToSocket:@"MESSENGER" :msgData];
    
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

/**
 * @function        displayNotifications
 * @description     returns a boolean wether or not to display notifications
**/
- (BOOL)displayNotifications {
    return ([[self getUserSettings:@"displaySystemNotifications"] intValue] == 1);
}

/**
 * @function        toggleFeature
 * @description     toggle feature
 **/
- (void)toggleFeature:(NSString*)featureName :(BOOL)toEnable {
    BOOL toggleAllFeatures = [featureName isEqualToString:@"ALL"];
    
    // MESSENGER
    if ([featureName isEqualToString:@"MESSENGER"] || toggleAllFeatures) {
        [self.showMessengerItem setEnabled:toEnable];
    }
    
    if ([featureName isEqualToString:@"CONNECTION"]) {
        [[self toggleConnectionItem] setTitle:toEnable ? @"Disconnect" : @"Connect"];
        
        [[self serverStatusItem] setTitle:toEnable ? LABEL_SERVER_UP : LABEL_SERVER_DOWN];
        [[self serverStatusItem] setState:toEnable];
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

/**
 * @function        toggleConnection
 * @description     toggle connection
**/
- (IBAction)toggleConnection:(id)sender {
    // If recording started already
    if (isAuthenticated) {
        [self disconnectSocket:nil];
    } else {
        [self connectSocket:nil];
    }
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
    [_webSocket close];
    _webSocket.delegate = nil;
    _webSocket = nil;
    
    // Change menu bar item
    [self toggleFeature:@"CONNECTION" :FALSE];

    [toolbarConnectButton setEnabled:YES];
    [toolbarDisconnectButton setEnabled:NO];
    
    
    
    [self killSession];
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
    // If web socket is not already running
    if (_webSocket == nil) {
        _webSocket.delegate = nil;
        [_webSocket close];
    
        // If no host & port in the configuration
        if ([[self getUserSettings:@"host"] isEqualToString:@""] || [[self getUserSettings:@"port"] isEqualToString:@""]) {
            [notifier push:@"Missing server parameters" :@"Please specifiy the server host & port in the preferences" :YES :nil];
        } else {
            _webSocket = [[SRWebSocket alloc] initWithURLRequest:[NSURLRequest requestWithURL:[NSURL URLWithString:[NSString stringWithFormat:@"ws://%@:%@", [self getUserSettings:@"host"], [self getUserSettings:@"port"]]]]];
            _webSocket.delegate = self;
    
            [socketStatus setStringValue:@"Opening connection!"];
            [_webSocket open];
        }
    }
}

/**
 * @function        stopRecording
 * @description     stop global recording
**/
- (void)stopRecording {
    if (!isAuthenticated) {
        return;
    }
    
    NSLog(@"stopRecording");
    
    [NSEvent removeMonitor:monitorUserInputs];
    monitorUserInputs = nil;
    
    [self initCounters];
    
    // Turn off all features
    [self toggleFeature:@"ALL" :FALSE];
    
    [self logMessageToLogView:[NSString stringWithFormat:@"Stop Recording"]];
}

/**
 * @function        startRecording
 * @description     start global recording
**/
- (void)startRecording {
    NSLog(@"startRecording");
    
    // Fire everytime cursor move
    NSUInteger eventMasks = NSMouseMovedMask | NSLeftMouseDownMask | NSScrollWheelMask;
    
    monitorUserInputs = [NSEvent addGlobalMonitorForEventsMatchingMask:eventMasks handler:^(NSEvent *incomingEvent) {
        switch ([incomingEvent type]) {
            // Mouse move
            case 5:
            {
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
                
            // Left click
            case 1:
            {
                [self reportToSocket:@"CLICK" :nil];
            
                [self logMessageToLogView:[NSString stringWithFormat:@"Left click!"]];
                self.leftMouseCounter = [NSNumber numberWithInt:(1 + [self.leftMouseCounter intValue])];
            }
            break;
                
            // Scroll wheel ( X & Y )
            case 22:
            {
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
                
            default:
            {
                break;
            }
        }
    }];
    
    // Turn on all features
    [self toggleFeature:@"ALL" :TRUE];
    
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
}

- (void)webSocket:(SRWebSocket *)webSocket didFailWithError:(NSError *)error {
    NSLog(@"WebSocket :: Failed With Error %@", error);
    
    [socketStatus setStringValue:@"WebSocket Connection Failed! (see logs)"];
    
    _webSocket = nil;
    
    // Push notification
    if (self.displayNotifications) {
        [notifier push:@"Connection to WebSocket failed" :@"The connection to the WebSocket failed. Please retry." :YES :nil];
    }
    
    [self toggleFeature:@"CONNECTION" :FALSE];
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
        // Display server status
        [self toggleFeature:@"CONNECTION" :TRUE];
        
        // User now authentified
        isAuthenticated = YES;
        
        // Start recording actions
        [self startRecording];
        
        // Change connection item in menu bar
        [self toggleFeature:@"CONNECTION" :TRUE];
        
        // Enable messenger feature
        [self toggleFeature:@"MESSENGER" :TRUE];
    }
    
    if (error) {
        NSLog(@"Error: %@",error);
    }
}

- (void)webSocket:(SRWebSocket *)webSocket didCloseWithCode:(NSInteger)code reason:(NSString *)reason wasClean:(BOOL)wasClean {
    // Push notification
    if (self.displayNotifications) {
        [notifier push:@"Connection lost" :@"The connection to the websocket or the server just closed. Please try to reconnect." :YES :nil];
    }
    
    // Log
    [socketStatus setStringValue:@"Websocket Connection Closed! (see logs)"];
    [self logMessageToLogView:reason];
    
    // Menu bar item
    [self toggleFeature:@"CONNECTION" :FALSE];
    
    // Stop recording
    [self stopRecording];
    
    [self killSession];
}

/**
 * @function        killSession
 * @description     kill current session
**/
- (void)killSession {
    clientID = 0;
    isAuthenticated = NO;
}

@end
