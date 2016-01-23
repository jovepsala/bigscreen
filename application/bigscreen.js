#!/usr/bin/env node
/**
 * BigScreen, 18.10.2013 Spaceify Inc.
 * 
 * @class BigScreen
 */

var fs = require("fs");
var fibrous = require("fibrous");
var logger = require("/api/logger");
var Config = require("/api/config")();
var Utility = require("/api/utility");
var Language = require("/api/language");
var WebServer = require("/api/webserver");
var WebSocketRPCClient = require("/api/websocketrpcclient");
var WebSocketRPCServer = require("/api/websocketrpcserver");

function BigScreen()
{
	var self = this;

	var bigscreens = {};
	var httpServer = new WebServer();
	var httpsServer = new WebServer();
	var rpcCore = new WebSocketRPCClient();
	var RPCS = new WebSocketRPCServer();
	var RPCSS = new WebSocketRPCServer();
	var www_path = Config.APPLICATION_WWW_PATH;
	var ca_crt = Config.API_WWW_PATH + Config.SPACEIFY_CRT;
	var key = Config.APPLICATION_TLS_PATH + Config.SERVER_KEY;
	var crt = Config.APPLICATION_TLS_PATH + Config.SERVER_CRT;

	self.start = fibrous( function()
	{
		try
		{
			// Establish a RPC connection to the Spaceify Core
			rpcCore.sync.connect({hostname: Config.EDGE_HOSTNAME, port: Config.CORE_PORT_WEBSOCKET, persistent: true, owner: "bigscreen"});
			//rpcCore.sync.connect({hostname: Config.EDGE_HOSTNAME, port: Config.CORE_PORT_WEBSOCKET_SECURE, is_secure: true, ca_crt: ca_crt, persistent: true, owner: "bigscreen"});

			// Start applications JSON-RPC ws and wss servers
			RPCS.exposeMethod("loadContent", self, self.loadContent);
			RPCS.exposeMethod("getBigScreenIds", self, self.getBigScreenIds);
			RPCS.exposeMethod("bigScreenConnect", self, self.bigScreenConnect);
			RPCS.setDisconnectionListener(disconnectionListener);
			RPCS.connect.sync({hostname: null, port: Config.FIRST_SERVICE_PORT, owner: "bigscreen"});

			RPCSS.exposeMethod("loadContent", self, self.loadContent);
			RPCSS.exposeMethod("getBigScreenIds", self, self.getBigScreenIds);
			RPCSS.exposeMethod("bigScreenConnect", self, self.bigScreenConnect);
			RPCSS.setDisconnectionListener(disconnectionListener);
			RPCSS.connect.sync({hostname: null, port: Config.FIRST_SERVICE_PORT_SECURE, is_secure: true, key: key, crt: crt, ca_crt: ca_crt, owner: "bigscreen"});
			
			// Start applications http and https web servers
			httpServer.connect.sync({hostname: null, port: 80, www_path: www_path, owner: "bigscreen"});
			httpsServer.connect.sync({hostname: null, port: 443, is_secure: true, key: key, crt: crt, ca_crt: ca_crt, www_path: www_path, owner: "bigscreen"});

			// Register provided services
			rpcCore.sync.callRPC("registerService", ["spaceify.org/services/bigscreen"], self);

			// Application initialialized itself successfully.
			console.log(Config.CLIENT_APPLICATION_INITIALIZED);
		}
		catch(err)
		{
			// Application failed to initialialize itself. Pass the error message to the core.
			logger.error("{{" + (err.message ? err.message : "") + "}}");
			console.log(Config.CLIENT_APPLICATION_UNINITIALIZED);

			stop.sync();
		}
		finally
		{
			rpcCore.sync.close();
		}
	});

	var stop = fibrous( function()
	{
		RPCS.sync.close();
		RPCSS.sync.close();

		httpServer.sync.close();
		httpsServer.sync.close();
	});

	/************************
	* MANAGE CONNECTIONS!!! *
	************************/
	var disconnectionListener = function(connection)
	{
		if(bigscreens[connection.id])
			delete bigscreens[connection.id];
	}

	/***************************
	* EXPOSED JSON-RPC METHODS *
	***************************/

	// Add a big screen to the connected big screens
	self.bigScreenConnect = fibrous( function(bs_id)
	{
		var connection = arguments[arguments.length - 1];
		bigscreens[connection.id] = {bs_id: bs_id, connection: connection, is_secure: connection.is_secure};
	});

	// Clients call this to show their content on big screen IFRAME(s).
	self.loadContent = fibrous( function(url, bs_id, content_type)
	{
		var count = -1;

		for(var id in bigscreens)												// Send content URL/type to big screens having the bs_id or all the big screens
		{
			if(bigscreens[id].bs_id == bs_id || !bs_id)
				count += (!bigscreens[id].is_secure ? RPCS : RPCSS).sync.callRPC("loadContent", [url, content_type], self, null, id);
		}

		return count;	// * -1 "No big screens having the big screen id are available. ** >= 0 "Content web page is ready or loading."
	});

	// Return a list of unique big screen ids.
	self.getBigScreenIds = fibrous( function()
	{
		var ids = [];
		for(var id in bigscreens)
		{
			if(!ids.indexOf(bigscreens[id].bs_id))
				ids.push(bigscreens[id].bs_id);
		}

		return ids;
	});
}

fibrous.run(function()
	{
	logger.setOptions({labels: logger.ERROR});

	bigscreen = new BigScreen();
	bigscreen.sync.start();
	});
