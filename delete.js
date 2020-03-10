require('dotenv').config({path: __dirname + '/.env'}) ; 
'use strict';
var https = require('https');
var PAGE_TOKEN = process.env['PAGE_TOKEN'] ;
var VERIFY_TOKEN = process.env['VERIFY_TOKEN'] ;



// var twilio = require('twilio');
// var qs = require('qs');
var AWS = require('aws-sdk');

exports.handler = (event, context, callback) => {
	try {

		 if(event.params && event.params.querystring){
				var queryParams = event.params.querystring;
			
				var rVerifyToken = queryParams['hub.verify_token']
			
				if (rVerifyToken === VERIFY_TOKEN) {
				var challenge = queryParams['hub.challenge']
				callback(null, parseInt(challenge))
				}else{
				callback(null, 'Error, wrong validation token');
				}
		}else{
			console.log(event) ; 
			var messagingEvents = event.entry[0].messaging;
			for (var i = 0; i < messagingEvents.length; i++) {
			var messagingEvent = messagingEvents[i];
		
			var sender = messagingEvent.sender.id;
			if (messagingEvent.message ) {
				
				if(messagingEvent.message.text || messagingEvent.message.attachments){

						var text ;
						if(messagingEvent.message.text)
						 	text = messagingEvent.message.text;
						else
							text = "Expenditure rs12 with ReceiptReceived" ; 
				console.log("Receive a message: " + text);

				AWS.config.region = 'ap-southeast-2';
				var lexruntime = new AWS.LexRuntime();
				//var userNumber = twilioSMS.From.replace('+', '');
				var params = {
				  botAlias: process.env.BOT_ALIAS,
				  botName: process.env.BOT_NAME,
				  inputText: text , //twilioSMS.Body,
				  userId: sender, //userNumber,
				  sessionAttributes: {
				  }
				};
				makePostRequest(params,sender) ; 
				callback(null, "Done")
			}
			
				
			}
			}
		
			callback(null, event);
		
		}
		// var twilioSMS = qs.parse(event["body-json"]);
		// //	************************
		// //	validate and filter bad/empty messages
		// //	************************
		// if(!twilioSMS.hasOwnProperty('Body')){
		// 	var error = new Error("Cannot process message without a Body.");
		// 	callback(error);
		// }
		/******COMMENTED OUT FOR TESTING; UNCOMMENT FOR PROD **********
		else if (!event.params.header.hasOwnProperty('X-Twilio-Signature')) {
			var error = new Error("Twilio signature not found.");
			callback(error);
		//	************************
		//	Below we verify that the call is coming in from Twilio.
		//	Any other source will be rejected.
		//	************************
		} else if (!twilio.validateRequest(process.env.TWILIO_AUTH_TOKEN,
					event.params.header['X-Twilio-Signature'],
					process.env.API_GATEWAY_URL,
					twilioSMS)) {
			var error = new Error("Twilio signature could not be validated.");
			callback(error);
		}
		****************************************************************/

	} catch(e) {
		console.log(e);
		callback(e);
	}
};

function makePostRequest(params,sender){
	var lexruntime = new AWS.LexRuntime();
	lexruntime.postText(params, function(err, data) {
				//var twimlResponse = new twilio.TwimlResponse();
				if (err) {
					console.log(err, err.stack); // an error occurred
			//  twimlResponse.message('Sorry, we ran into a problem at our end.');
				sendTextMessage(sender,  "Some Error Occured tft");
				callback(err,"Error occured Shit" ) ; //twimlResponse.toString();
				} else {
					console.log(data);           // got something back from Amazon Lex
					
					// var old_data = {Amount :"500" , Category:"N/A",Date:"22/10/2020"} ;
					// var check = false ;
					// var updatedMessage = "" ;
					// for (var slot in data.slots){	
					// 	if(  data.slots[slot] === null && old_data[slot] !== null  ){
					// 		check = true ;
					// 		updatedMessage += slot+" " + old_data[slot] + " " ;
					// 	}
					// 	else if(data.slots[slot] !==null){
					// 		updatedMessage += slot + " " + data.slots[slot]+" " ;
					// 		old_data[slot] = data.slots[slot] ; 
					// 	}		
					// }
					// if(check) {  params.inputText = updatedMessage ;
					//    makePostRequest(params,sender) ;  }
					// else {sendTextMessage(sender,  data.message); } 
					var date = 	data.message.match(/([0-9]{4}-[0-9]{2}-[0-9]{2})/ ) ;
					if( date !== null ){
						date = date[0] ; 
						console.log(date + "SHitssssss") ;
						var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
						var d = new Date(date) ;
						console.log(d) ; 
						var month = months[d.getMonth()] , day = d.getDate(),year = d.getFullYear() ;
						var finalDate = day + " " + month.substring(0,3) + " " + year ;
						data.message = data.message.replace( date,finalDate ) ; 	
					}
					processData(sender,  data.message);
					//twimlResponse.message(data.message);
			// callback(null, twimlResponse.toString());
				}
	});

}

function processData(sender,message){
	 	
	if(message[0]=='{'){ 
		var info = JSON.parse(message) 
		if(info.messages){
			console.log("Came inside you "+ info.messages) ;
			// for( var i =0;i< info.messages.length ;i++){
			// 	var message = info.messages[i].value ;
			// //	sleep(500) ; 
			// //	console.log(message+" "+ Date.now() ) ;
			// 	sendTextMessage(sender,message) ;
				
			// }
		}
	}
	else{
		sendTextMessage(sender,message)
	}

}

function sendTextMessage(senderFbId, text) {
var json = {
    recipient: {id: senderFbId},
    message: {text: text},
  };
var body = JSON.stringify(json);
var path = '/v2.6/me/messages?access_token=' + PAGE_TOKEN;
var options = {
    host: "graph.facebook.com",
    path: path,
    method: 'POST',
    headers: {'Content-Type': 'application/json'}
  };
var callback = function(response) {	
var str = ''
    response.on('data', function (chunk) {
      str += chunk;
    });
response.on('end', function () {
 
    });
  }
var req = https.request(options, callback);
  req.on('error', function(e) {
    console.log('problem with request: '+ e);
  });
 
  req.write(body);
  req.end();
}



// var old_data = {Amount :"500" , Category:"sex",Date:"22/10/2020"} ;
					// for (var slot in data.slots){
					// 	var check = false ;
					// 	var updatedMessage = "" ;
					// 	if(  data.slots[slot] === null && old_data[slot] !== null  ){
					// 		check = true ;
					// 		updatedMessage += slot+" " + old_data[slot] + " " ;
					// 	}
					// 	else if(data.slots[slot] !==null){
					// 		updatedMessage += slot + " " + data.slots[slot] ;
					// 	}		
					// }
					// if(check) {  params.inputText = updatedMessage ;
					//    makePostRequest(params) ;  }
					// else {sendTextMessage(sender,  data.message); } 