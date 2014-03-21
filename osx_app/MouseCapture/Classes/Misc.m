/*
 ------------------------------------------------------------------------
 Thinstuff iRdesktop
 A RDP client for the iPhone and iPod Touch, based off WinAdmin
 (an iPhone RDP client by Carter Harrison) which is based off CoRD 
 (a Mac OS X RDP client by Craig Dooley and Dorian Johnson) which is in 
 turn based off of the Unix program rdesktop by Matthew Chapman.
 ------------------------------------------------------------------------
 
 Misc.m
 Copyright (C) Thinstuff s.r.o.  2009
 
 ------------------------------------------------------------------------
 This program is free software; you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation; either version 2 of the License, or
 (at your option) any later version.
 
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 
 You should have received a copy of the GNU General Public License along
 with this program; if not, write to the Free Software Foundation, Inc.,
 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 ------------------------------------------------------------------------
 */


#import "Misc.h";

#include <sys/types.h>
#include <sys/socket.h>
#include <ifaddrs.h>
#include <net/if_dl.h>


@implementation Misc

#define EKSIZE 16


+ (NSString*)getPromotionCode
{	
	NSString *mac = [ Misc getPrimaryMACAddress:nil];
	if ([mac length] != 12) {
		NSLog(@"Invalid MAC Address.");
		return (@"0000-0000-0000-0000-0000");
	}
	
	RC4_KEY ck;
	char iv = random()%93+33;
	char *ek = strdup([[[[UIDevice currentDevice] uniqueIdentifier] substringToIndex:EKSIZE] cStringUsingEncoding:NSASCIIStringEncoding]);
	ek[0]=iv;
	
	NSString *nsdata = [mac substringToIndex:9];
	
	const char *indata = [nsdata cStringUsingEncoding:NSASCIIStringEncoding];
	unsigned char *outdata = (unsigned char*)calloc(1, strlen(indata)+1);
	
	RC4_set_key(&ck, EKSIZE, (unsigned char*)ek);
	RC4(&ck, strlen(indata), (unsigned char*) indata, outdata);
	outdata[strlen(indata)]=iv;
	
	NSString *nsh = [NSString hexStringFromData:outdata ofSize:strlen(indata)+1 withSeparator:@"-" afterNthChar:2];
	
	free(outdata);
	free(ek);
	
	NSLog(nsh);
	return nsh;
}


+ (NSString*)getPrimaryMACAddress:(NSString *)sep
{
	NSString* macaddress = @"";

	struct ifaddrs *addrs;
	
	if (getifaddrs(&addrs) < 0)
	{
		NSLog(@"getPrimaryMACAddress: getifaddrs failed.");
		return macaddress;
	}
	
	for (struct ifaddrs *cursor = addrs; cursor!=NULL; cursor = cursor->ifa_next) 
	{
		if(strcmp(cursor->ifa_name, "en0"))
			continue;
		if( (cursor->ifa_addr->sa_family == AF_LINK) 
			&& (((struct sockaddr_dl *) cursor->ifa_addr)->sdl_type == 0x6 /*IFT_ETHER*/))  
		{
			struct sockaddr_dl *dlAddr = (struct sockaddr_dl *) cursor->ifa_addr;
			if(dlAddr->sdl_alen != 6)
				continue;
			unsigned char* base = (unsigned char *) &dlAddr->sdl_data[dlAddr->sdl_nlen];
			macaddress = [NSString hexStringFromData:base ofSize:6 withSeparator:sep afterNthChar:1];
			break;
		}
	}

	freeifaddrs(addrs);
	
	return macaddress;
}

+ (BOOL)deviceHasJailBreak 
{
	if ([[NSFileManager defaultManager] fileExistsAtPath:@"/Applications/Cydia.app/"])
		return YES;
	
	if ([[NSFileManager defaultManager] fileExistsAtPath:@"/etc/apt/"])
		return YES;
	
	return NO;	
}

   
+ (NSString*)getPlatform
{
	size_t size;
	sysctlbyname("hw.machine", NULL, &size, NULL, 0);
	char *machine = malloc(size);
	sysctlbyname("hw.machine", machine, &size, NULL, 0);
	NSString *platform = [NSString stringWithCString:machine];
	free(machine);
	return platform;
}

@end


@implementation NSString (NSString_Hex)   
+ (id)hexStringFromData:(const unsigned char *)data ofSize:(unsigned int)size withSeparator:(NSString *)sep afterNthChar:(int)sepnth
{
	int i;
	NSMutableString *result;
	NSString *immutableResult;
	
	result = [[NSMutableString alloc] init];
	for (i = 0; i < size; i++) {
		if(i && sep && sepnth && i%sepnth==0)
			[result appendString:sep];
		[result appendFormat:@"%02X", data[i]];
	}
	
	immutableResult = [NSString stringWithString:result];
	[result release];
	return immutableResult;
}


@end