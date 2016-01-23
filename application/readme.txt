===== Introduction to the big screen application =====

The purpose of the big screen application is to enable displaying content on a screen (big screen) connected to edge node. Users connected to the edge can display content from their smart devices, laptop, tablet or any other device  on the screen.

The big screen application is made of two components: sandboxed application and a big screen web page. The sandboxed application component runs on the edge node as a hub for screens displaying the web pages. It must be noticed that connected screens are actually screens connected to a remote computer or the local edge node computer. The screen displays the web page on a web browser running on that computer (see figure 1). Remote computers must be on the same private network as the edge node to be able to connect to it.

Displaying the content is based on an iframe inside the big screen web page. Applications connected to the big screen application request their content web page to be loaded into that iframe.

Below are examples how to connect screens to the application using the 302 redirection mechanism provided by the Spaceify core.

Web browser on the edge computer.

  http://edge.spaceify.net/?service=spaceify/bigscreen
  or
  http://10.0.0.1/?service=spaceify/bigscreen

Web browser on a remote computer (assuming edge and the remote machines are in 10.0.10.x network).

  http://10.0.10.3/?service=spaceify/bigscreen

{{ :bs1.png?nolink |}}
;#;
Fiqure 1. Connecting screens to the edge node.
;#;

===== The big screen applications principle and its API =====

In the fiqure 2 below is visualized the principle of the big screen application. The light gray boxes are the components of the big screen: the application and the web page. Big screen does not expose any methods to __clients__. Only other applications running inside the __edge__ can access the exposed methods.

Big screen owns the web page in __screen__ (X in figure 2) and calls methods exposed by it to manage the content in it  - this is a black box for developers not to be conserned with.

The big screen application and applications connected to it (the gray boxes) are separated from each other. Big screen does not intefere in any way to the inner workings of them or dictate any rules for them to follow. It only provides means for applications to get their content page to the big screen.

Big screen provides one service: spaceify.org/services/bigscreen (A in figure 2) and this service has two exposed methods.

//1. getBigScreenIds()//

Big screen application supports multiple connected screens which are separated by an id. The id is defined in the big screen web page and the default id is "default" - the id can be same in all the screens. The method does not take any parameters and returns an array of the available ids or an empty array if there are no connected screens. Applications connected to the big screen application can pass the list to their connected clients if required. Any serious application should implement a selector for clients to choose a screen (if possible/feasible). The id a screen uses can be set in the URL when connecting it.

<nowiki>http://edge.spaceify.net/?service=spaceify/bigscreen&bs_id=video</nowiki>

//2. setContentURL(content URL, big screen id, content type)//

Sets the URL to big screen iframe(s) having the big screen id.

The content type parameter is used to prevent reloding the content URL to screen if it is already loaded. Imagine an application displaying images on a carousel. To prevent the carousel from losing the displayed images the screen must not be reloaded when user browses to another page and wants to show images from there. The content type parameter is used exactly for this purpose. Make it as unique as possible, eg. spacelets unique name, to avoid name collisions with other applications using the screens. If set to empty string the content page is always reloaded.

The method Returns the status of big screens.

^ Status  ^ Description  ^
| -1  | "No big screens having the big screen id are available." - It is impossible to display the content.  |
| 0  | "Content web pages loaded and ready." - Content page(s) available and it is possible to manipulate them immediately (eg. change video id).  |
| > 0  | "Content web page is not ready and must be loaded." - Content page(s) can not be manipulated before they are loaded.  |

{{ :bs2.png?nolink |}}
;#;
Fiqure 2. Principle of the big screen application.
;#;

===== Usage example =====

In the fiqure 2 is also displayed in the dark gray boxes an example of using spacelet with the big screen application.

For examples sake lets present here an imagenary flow of events how content gets to be displayed on a screen. The spacelet has one service (B in fiqure 2) that both remote web page and the content web page use. How they use it and what methods there are exposed is not important now. The spacelet owns the content page and the injected code on the "remote web page" (Y in fiqure 2).
  * User browses to a remote web page.
  * As spacelets normally do, the remote web page gets injected the spacelets JavaScript code.
  * The code calls, after some user input, spacelets method to show content. It sends to spacelet an URL to spacelets content web page, some identifier on the remote web page (eg. video id) and the big screen id the user has selected.
  * The spacelet receives the call and in turn calls the big screen applications setContentURL, because it notices that it does not have a connections to any existing content web pages. If it had it could call its own methods instead.
  * The content page gets loaded and based on the id shows the video.
  * Now that the __client__ side is connected to the spacelet and the __screen_ side is connected to the spacelet. Both sides can start exchanging messages without the help of the big screen application using the spacelets service.

An application of showing pictures is available in the Spaceify's registry. The applications name is Picture viewer (spaceify/pictureviewer) and it demonstrates the use of big screen application in a very simple way. Study it for further instructions and ideas.

