### Bigscreen application

The Bigscreen application is used to display a web page on a screen or screens (bigscreen) connected to the edge node. 

The bigscreen application is made of two components: application and a bigscreen web page. The application runs on 
the edge node and acts as a hub for screens displaying the bigscreen web page. The web page is loaded by the connected
bigscreens by requesting a URL from the edge node to the bigscreen webserver. Below are examples how to open bigscreens
web page to browser.

When bigscreen is on the same network as the edge node computer (on the same computer).

    http://edge.spaceify.net/service/spaceify/bigscreen
    http://edge.spaceify.net/service/spaceify/bigscreen

When bigscreen is on a remote computer that has access to the 10.0.0.x network (e.g., 10.0.10.x has been configured to be on the
same private network as the edge node computer).

    http://10.0.10.3/service/spaceify/bigscreen

Displaying the content on the bigscreen web page is based on an IFRAME inside it. Applications or spacelets connected to 
the Bigscreen application can request their web page to be loaded into that IFRAME by providing their URL. 

When connecting a bigscreen to the Bigscreen application a special identification can be given in the URL. E.g.

    http://edge.spaceify.net/service/spaceify/bigscreen?bigscreenId=game

With the identification a bigscreen can declare that it is used for some purpose, e.g. gaming. Applications or spacelets could then request 
that they want to show their web-page on the "game" bigscreen. By default the identification is literally "default", if the identification
is omitted.

The Bigscreen application can be connected to using the service

    spaceify.org/services/bigscreen.

This service exposes two RPC-methods:

* loadContent(url, bigscreenId, contentType)
* getBigScreenIds()

#### The loadContent method

The **url** paremeter is the URL to the applications or spacelets web page.
The web page can show pictures, movies or games. It is up to the applications or spacelets what the content is and how it is 
controlled by its web page.
The **bigscreenId** parameter is used to define which of the connected bigscreens should be used to display the web page. Usually it is *default*.

When Bigscreen application loads the web page given in the **url** it first checks the **contentType** parameter.
If it stays the same it will not load the web page to the IFRAME again.
Applications or spacelets can use this feature for their own purposes.

#### The getBigScreenIds method

Applications and spacelets can use this method to query the identifications of bigscreen web pages connected to the Bigscreen application.
The return value is an array of bigscreenIds.
