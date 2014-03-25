//
//  rafAppDelegate.h
//  MouseCapture
//
//  Created by Matthieu COLLE on 2/22/14.
//  Copyright (c) 2014 Matthieu COLLE. All rights reserved.
//

#import <Cocoa/Cocoa.h>

static id monitorUserInputs;

@interface rafAppDelegate : NSObject <NSApplicationDelegate>

@property (assign) IBOutlet NSWindow *window;
@property (assign) IBOutlet NSWindow *preferences;
@property (strong) IBOutlet NSTextView *logView;

@property (weak) IBOutlet NSToolbarItem *toolbarClearButton;
@property (weak) IBOutlet NSToolbarItem *toolbarRecordButton;
@property (weak) IBOutlet NSToolbarItem *toolbarStopButton;

@property (weak) IBOutlet NSTextField *socketStatus;
@property (weak) IBOutlet NSTextField *cursorDeltaXLabel;
@property (weak) IBOutlet NSTextField *cursorDeltaYLabel;
@property (weak) IBOutlet NSTextField *cursorPosXLabel;
@property (weak) IBOutlet NSTextField *cursorPosYLabel;
@property (weak) IBOutlet NSTextField *keyDownCounterLabel;
@property (weak) IBOutlet NSTextField *leftMouseCounterLabel;

@property (readwrite) NSDateFormatter *logDateFormatter;

@property (readwrite) NSNumber *cursorDeltaX;
@property (readwrite) NSNumber *cursorDeltaY;
@property (readwrite) NSNumber *cursorPositionX;
@property (readwrite) NSNumber *cursorPositionY;
@property (readwrite) NSNumber *keyDownCounter;
@property (readwrite) NSNumber *leftMouseCounter;

@property (readwrite) BOOL isGlobalRecording;
@property (readwrite) BOOL isKeyboardRecording;
@property (readwrite) BOOL isMouseRecording;

@property (readwrite) IBOutlet NSMenu *menu;
@property (readwrite) IBOutlet NSMenuItem *pauseAllRecordingsItem;
@property (readwrite) IBOutlet NSMenuItem *pauseMouseRecordingItem;
@property (readwrite) IBOutlet NSMenuItem *pauseKeyboardRecordingItem;
@property (readwrite) IBOutlet NSMenuItem *serverStatusItem;
@property (readwrite) IBOutlet NSMenuItem *showLoggerItem;
@property (readwrite) IBOutlet NSMenuItem *showPreferencesItem;
@property (readwrite) IBOutlet NSStatusItem *statusItem;

- (void)drawIndicators;

- (IBAction)toggleAllRecordings         :(id)sender;
- (IBAction)toggleKeyboardRecording     :(id)sender;
- (IBAction)toggleMouseRecording        :(id)sender;

- (IBAction)reconnect               :(id)sender;
- (IBAction)clearButtonPressed      :(id)sender;
- (IBAction)recordButtonPressed     :(id)sender;
- (IBAction)stopButtonPressed       :(id)sender;
- (BOOL)isCharacterTracked          :(NSString*)_char;
- (BOOL)isSeparator                 :(NSString*)_char   :(NSString*)keyCode;
- (void)logMessageToLogView         :(NSString*)message;

@end
