'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();
var  pg = require('pg');

var config = {
	user: 'gxtazabgagnnhg', //env var: PGUSER
	database: 'dct2b6f7sgpbd6', //env var: PGDATABASE
	password: 'cbbd1bee740b2ea329657af09b2e2545c1bfb34a99132b650d7701337dfedde2', //env var: PGPASSWORD
	host: 'ec2-54-235-177-45.compute-1.amazonaws.com', // Server hosting the postgres database
	port: 5432, //env var: PGPORT
	max: 10, // max number of clients in the pool
	ssl: true
//	idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
};
var pool = new pg.Pool(config);

pool.on('error', function (err, client) {
	console.error('idle client error', err.message, err.stack)
});



app.set('port', (process.env.PORT || 5000));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));

// parse application/json
app.use(bodyParser.json());

// index
app.get('/', function (req, res) {
	res.send('hello world i am a secret bot')
});

// for facebook verification
app.get('/webhook/', function (req, res) {
	console.log(res);
	if (req.query['hub.verify_token'] === process.env.RIDECHAT_TOKEN) {
		res.send(req.query['hub.challenge'])
	} else {
		res.send('Error, wrong token')
	}
});


//AT THE END, MAKE A SASSY BOT WHERE IT DOES A FOR LOOP AT THE SAME STATE UNTIL THEY ANSWER IT CORRECTLY
app.post('/webhook/', function (req, res) {
	var state = 0 ;
	let messaging_events = req.body.entry[0].messaging;
	for (let i = 0; i < messaging_events.length; i++) {
		let event = req.body.entry[0].messaging[i];
		let sender = event.sender.id;
		pool.query('SELECT state FROM users WHERE message_id = $1', [sender],  function (err, result) {
			state = result.rows[0].state;
			if (event.message && event.message.text) {
				let text = event.message.text;
				if (text === 'hey' || text === 'hi' || text === 'whats up' || text === 'yo') {
					sendTextMessage(sender, "Hey! Ridechat’s here to help you. Click below to login and tell me if you're a driver or a rider? (driver/rider)");
					sendLogin(sender);
					var user = false;
					pool.query('select count(1) from users where message_id = $1', [sender], function(err, result){
						if(result == 0){
							// Replace Victor and fb url with proper string replacement.
							pool.query("INSERT INTO users (first_name, facebook_url) VALUES ('Victor', 'https://www.facebook.com/photo.php?fbid=1166438443378253&set=a.150785108276930.26062.100000363247997&type=3&theater';");
						}
					});
					pool.query('UPDATE users SET state = 1 WHERE message_id=$1;', [sender], function(err, result){
					});
					//sendTextMessage(sender, "Hey! Provide an address of where you're trying to go? And at what time? e.g. 324 Avalon Drive, CA, 01/28/2017");
				}
				else if (state === 3){

					//return possible recommendations for
				}
				else if(state === 2){
					var facebook_urls = []; // set
					var array = text.split(','); // send array[0] -- return coordinates, add array[1] IS DATE
					pool.query('UPDATE users SET state = 2 WHERE message_id=$1;',[sender],function(err, result){
					});
					pool.query('SELECT facebook_url, route FROM users WHERE date >= $1', [array[1]], function(err, result){
						console.log(result);
						//finalize facebook_urls with relevant algorithm
					});
					// filter routes with results THEN return all facebook_urls in array
					//search the database where  every entry in the database and write route algorithm
					sendTextMessage(sender, "Below is a list of all people you could reach out to!: ")
					facebook_urls.forEach(function(element) {
						sendTextMessage(sender, element);
					});
				}
				else if(state === 1) {
					var check = true;
					while (check == true) {
						if (text.toLowerCase() === 'rider') {
							pool.query(sender, 'UPDATE users SET driver = true WHERE message_id = $1;', [sender], function (err, result) {
							});
							break;
						}
						else if (text.toLowerCase() === 'driver') {
							pool.query(sender, 'UPDATE users SET driver = false WHERE message_id = $1', [sender], function (err, result) {
							})
							break;
						}
						else {
							sendTextMessage(sender, "Sorry that was not a valid response. Please type 'driver' or 'rider'")
						}
					}
				}
				else {
					sendTextMessage(sender, "Say 'hey' to activate me! ")
				}
			}
		});
		if (event.postback) {
			let text = JSON.stringify(event.postback)
			sendTextMessage(sender, "Postback received: " + text.substring(0, 200), token)
		}
	}
	res.sendStatus(200)
});


// recommended to inject access tokens as environmental variables, e.g.
const token = process.env.RIDECHAT_TOKEN
//const token = "<FB_PAGE_ACCESS_TOKEN>"

function sendTextMessage(sender, text) {
	let messageData = { text:text }
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:token},
		method: 'POST',
		json: {
			recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})
}


/*

 if (text === 'Generic') {
 console.log("welcome to chatbot")
 sendGenericMessage(sender)
 continue
 }
 */
/*

function sendLogin(sender){
	let messageData = {
		"buttons":[
			{
				"type": "account_link",
				"url": "https://ridechat.herokuapp.com/webhook"
			}
		]

	}
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:token},
		method: 'POST',
		json: {
			recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})
}
*/

function sendGenericMessage(sender) {
	let messageData = {
		"attachment": {
			"type": "template",
			"payload": {
				"template_type": "generic",
				"elements": [{
					"title": "First card",
					"subtitle": "Element #1 of an hscroll",
					"image_url": "http://messengerdemo.parseapp.com/img/rift.png",
					"buttons": [{
						"type": "web_url",
						"url": "https://www.messenger.com",
						"title": "web url"
					}, {
						"type": "postback",
						"title": "Postback",
						"payload": "Payload for first element in a generic bubble",
					}],
				}, {
					"title": "Second card",
					"subtitle": "Element #2 of an hscroll",
					"image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
					"buttons": [{
						"type": "postback",
						"title": "Postback",
						"payload": "Payload for second element in a generic bubble",
					}],
				}]
			}
		}
	}
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:token},
		method: 'POST',
		json: {
			recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})
}

// spin spin sugar
app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'))
})
