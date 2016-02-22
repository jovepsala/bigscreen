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
var bs_service = bs_service_secure = null;
var bs_service_name = "spaceify.org/services/bigscreen";

	// CONNECTION LISTENERS -- -- -- -- -- -- -- -- -- -- //
var onClientConnected = function(serviceObj)
	{
	}

var onClientDisconnected = function(serviceObj)
	{
	if(bigscreens[serviceObj.id])
		delete bigscreens[serviceObj.id];
	}

	// EXPOSED JSON-RPC METHODS -- -- -- -- -- -- -- -- -- -- //
var bigScreenConnect = function(bs_id, rpcObj)
	{
	bigscreens[rpcObj.id] = {bs_id: bs_id, is_secure: rpcObj.is_secure};	// Add big screen to the connected big screens
	}

var loadContent = function(url, bs_id, content_type)
	{ // Clients call this to show their content on the big screen IFRAME(s).
	for(var id in bigscreens)												// Send content URL/type to big screens having the bs_id or all the big screens
		{
		if(bigscreens[id].bs_id == bs_id || !bs_id)
			(!bigscreens[id].is_secure ? bs_service : bs_service_secure).callRpc("loadContent", [url, content_type], self, null, id);
		}
	}

var getBigScreenIds = function()
	{ // Return a list of unique big screen ids.
	var ids = [];
	for(var id in bigscreens)
		{
		if(!ids.indexOf(bigscreens[id].bs_id))
			ids.push(bigscreens[id].bs_id);
		}

	return ids;
	}

	// IMPLEMENT start AND fail IN YOUR APPLICATION!!! -- -- -- -- -- -- -- -- -- -- //
self.start = function()
	{
	bs_service = spaceify.getProvidedService(bs_service_name);
	bs_service_secure = spaceify.getProvidedServiceSecure(bs_service_name);

	spaceify.exposeRpcMethodProvided("loadContent", self, loadContent, bs_service_name);
	spaceify.exposeRpcMethodProvided("getBigScreenIds", self, getBigScreenIds, bs_service_name);
	spaceify.exposeRpcMethodProvided("bigScreenConnect", self, bigScreenConnect, bs_service_name);

	spaceify.setConnectionListenersProvided(onClientConnected, bs_service_name);
	spaceify.setDisconnectionListenersProvided(onClientDisconnected, bs_service_name);
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