#!/usr/bin/env node
/**
 * BigScreen, 18.10.2013 Spaceify Inc.
 *
 * rpcObj = { is_secure: Boolean, id: Number, server_type: String, remotePort: Number, remoteAddress: Number, origin: String }
 * serviceObj = { id: Number, is_secure: Boolean, service_name: String, server_type: String, remotePort: Number, remoteAddress: Number, origin: String }
 *
 * @class BigScreen
 */

var spaceify = require("/api/spaceifyapplication.js");

function BigScreen()
{
var self = this;

var bigscreens = {};
var bigscreenService = null;

	// CONNECTIONS  -- -- -- -- -- -- -- -- -- -- //
var onClientDisconnected = function(serviceObj)
	{
	if(bigscreens[serviceObj.id])
		delete bigscreens[serviceObj.id];
	}

	// EXPOSED JSON-RPC METHODS -- -- -- -- -- -- -- -- -- -- //
var bigScreenConnect = function(bigscreenId, rpcObj)
	{
	bigscreens[rpcObj.id] = {bigscreenId: bigscreenId};						// Add big screen to the connected big screens
	}

var loadContent = function(url, bigscreenId, contentType)
	{ // Clients call this to show their content on the big screen IFRAME(s).
	for(var id in bigscreens)												// Send content URL/type to big screens having the bigscreenId or all the big screens
		{
		if(bigscreens[id].bigscreenId == bigscreenId || !bigscreenId)
			bigscreenService.callRpc("loadContent", [url, contentType], self, null, id);
		}
	}

var getBigScreenIds = function()
	{ // Return a list of unique big screen ids.
	var ids = [];
	for(var id in bigscreens)
		{
		if(!ids.indexOf(bigscreens[id].bigscreenId))
			ids.push(bigscreens[id].bigscreenId);
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