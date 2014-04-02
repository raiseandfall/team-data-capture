//
//  rafAppDelegate.h
//  Team Data Capture
//
//  Created by Matthieu COLLE on 2/22/14.
//  Copyright (c) 2014 Matthieu COLLE. All rights reserved.
//

#import <Cocoa/Cocoa.h>

static id monitorUserInputs;

@interface rafAppDelegate : NSObject <NSApplicationDelegate>

@property (assign) IBOutlet NSWindow *logWindow;
@property (assign) IBOutlet NSWindow *preferencesWindow;
@property (assign) IBOutlet NSWindow *messengerWindow;
@property (strong) IBOutlet NSTextView *logView;

@property (weak) IBOutlet NSToolbarItem *toolbarClearButton;
@property (weak) IBOutlet NSToolbarItem *toolbarRecordButton;
@property (weak) IBOutlet NSToolbarItem *toolbarStopButton;
@property (weak) IBOutlet NSToolbarItem *toolbarConnectButton;
@property (weak) IBOutlet NSToolbarItem *toolbarDisconnectButton;

@property (weak) IBOutlet NSTextField *versionNumber;
@property (weak) IBOutlet NSTextField *socketStatus;
@property (weak) IBOutlet NSTextField *cursorDeltaXLabel;
@property (weak) IBOutlet NSTextField *cursorDeltaYLabel;
@property (weak) IBOutlet NSTextField *cursorPosXLabel;
@property (weak) IBOutlet NSTextField *cursorPosYLabel;
@property (weak) IBOutlet NSTextField *leftMouseCounterLabel;

// User Settings
@property (weak) IBOutlet NSTextField *userSettingHost;
@property (weak) IBOutlet NSTextField *userSettingPort;
@property (weak) IBOutlet NSButton *userSettingAutoStartTracking;
@property (weak) IBOutlet NSButton *userSettingDisplayNotifications;

// Messenger
@property (weak) IBOutlet NSTextField *messengerTextarea;
@property (weak) IBOutlet NSButton *postMessageBtn;

@property (readwrite) NSDateFormatter *logDateFormatter;

@property (readwrite) NSNumber *cursorDeltaX;
@property (readwrite) NSNumber *cursorDeltaY;
@property (readwrite) NSNumber *cursorPositionX;
@property (readwrite) NSNumber *cursorPositionY;
@property (readwrite) NSNumber *leftMouseCounter;

@property (readwrite) BOOL isGlobalRecording;
@property (readwrite) BOOL isMouseRecording;
@property (readwrite) BOOL isScrollRecording;
@property (readwrite) BOOL isMessengerEnabled;
@property (readwrite) BOOL isAuthenticated;

@property (readwrite) IBOutlet NSMenu *menu;
@property (readwrite) IBOutlet NSMenuItem *versionNumberItem;
@property (readwrite) IBOutlet NSMenuItem *pauseAllRecordingsItem;
@property (readwrite) IBOutlet NSMenuItem *pauseScrollRecordingItem;
@property (readwrite) IBOutlet NSMenuItem *pauseMouseRecordingItem;
@property (readwrite) IBOutlet NSMenuItem *showMessengerItem;
@property (readwrite) IBOutlet NSMenuItem *serverStatusItem;
@property (readwrite) IBOutlet NSMenuItem *showLoggerItem;
@property (readwrite) IBOutlet NSMenuItem *showPreferencesItem;
@property (readwrite) IBOutlet NSStatusItem *statusItem;

- (NSString*)getUserSettings            :(NSString*)settingName;
- (void)saveUserSettings;
- (void)calculateGlobalResolution;
- (void)toggleFeature                   :(NSString*)featureName :(BOOL)toEnable;
- (NSDictionary*)getLocalPosition       :(CGPoint)loc;
- (IBAction)fakeAction                  :(id)sender;
- (IBAction)toggleAllRecordings         :(id)sender;
- (IBAction)toggleMouseRecording        :(id)sender;
- (IBAction)toggleScrollRecording       :(id)sender;

- (IBAction)connectSocket               :(id)sender;
- (IBAction)disconnectSocket            :(id)sender;
- (IBAction)clearButtonPressed          :(id)sender;
- (IBAction)recordButtonPressed         :(id)sender;
- (IBAction)stopButtonPressed           :(id)sender;
- (void)logMessageToLogView             :(NSString*)message;

- (IBAction)clickPostMessage            :(id)sender;

@end
