Foobot
=======

Foobot is an awesome IRC chat room logger. It not just logs messages but has a lot of nifty features that are nice

* Sends offline messages to people if they were not logged in
* Tweets to a twitter account when tweet: keyword is used
* Pasties a message to pastie.com website when pastie:  is used
* gist a message to gist.github.com  when gist: is used
* remind adds a new reminder using a simple date time format use remind: <message>
	
The idea is simple. Lot of us are on the move and we still want to catch up on what is going on in the chat room. Foobot tracks your logout and login times so that the messages you missed during the time you were logged out, are replayed back to you.	

We also use this to track what we are reading on the web. For this use use a twitter id that consolidates all the url's we post into irc
Gist and pasties follows the same pattern. 

We use it for #activesphere chat room.

Setup
------

	* Install redis locally. See [Redis Website](http://redis.io/download) for instructions
	* npm install foobot
	
	* node foobot.js

Create a .foobot.json file in the user root to setup user credential for Twitter and Github and The local Redis server
