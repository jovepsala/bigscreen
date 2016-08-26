#!/usr/bin/env node
/**
 * BigScreen, 18.10.2013 Spaceify Oy
 *
 * @class BigScreen
 */

var spaceify = require("/api/spaceifyapplication.js");

function BigScreen()
{
var self = this;

var bigscreenIds = {};
var bigscreenService = null;

	// CONNECTIONS  -- -- -- -- -- -- -- -- -- -- //
var onClientDisconnected = function(connectionId)
	{
	if(connectionId in bigscreenIds)
		delete bigscreenIds[connectionId];
	}

	// EXPOSED JSON-RPC METHODS -- -- -- -- -- -- -- -- -- -- //
var bigScreenConnect = function(bigscreenId)
	{ // Each connected bigscreen web page has an bigscreenId (e.g. "default")
	bigscreenIds[arguments[arguments.length-1].connectionId] = {bigscreenId: bigscreenId};	// Add big screen to the connected big screens
	}

var loadContent = function(url, bigscreenId, contentType)
	{ // Clients show their content on the big screen web pages having the bigscreenId
	for(var connectionId in bigscreenIds)																// Send content URL/type to big screens having the bigscreenId or all the big screens
		{
		if(bigscreenIds[connectionId].bigscreenId == bigscreenId || !bigscreenId)
			bigscreenService.callRpc("loadContent", [url, contentType], self, null, connectionId);
		}
	}

var getBigScreenIds = function()
	{ // Return a list of unique Bigscreen ids.
	var ids = [];
	for(var connectionId in bigscreenIds)
		{
		if(!ids.indexOf(bigscreenIds[connectionId].bigscreenId))
			ids.push(bigscreenIds[connectionId].bigscreenId);
		}

	return ids;
	}

	// IMPLEMENT start AND fail IN YOUR APPLICATION!!! -- -- -- -- -- -- -- -- -- -- //
self.start = function()
	{
	bigscreenService = spaceify.getProvidedService("spaceify.org/services/bigscreen");

	bigscreenService.exposeRpcMethod("loadContent", self, loadContent);
	bigscreenService.exposeRpcMethod("getBigScreenIds", self, getBigScreenIds);
	bigscreenService.exposeRpcMethod("bigScreenConnect", self, bigScreenConnect);

	bigscreenService.setDisconnectionListener(onClientDisconnected);
	}

self.fail = function(err)
	{	
	}

var stop = function()
	{
	spaceify.stop();
	}

}

var bigScreen = new BigScreen();
spaceify.start(bigScreen, {webservers: {http: true, https: true}});