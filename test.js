require('dotenv').config({path: __dirname + '/.env'}) ; 
'use strict';
var https = require('https');
var PAGE_TOKEN = process.env['PAGE_TOKEN'] ;
var VERIFY_TOKEN = process.env['VERIFY_TOKEN'] ;
var AWS = require('aws-sdk');

function handler(event){
	try {

		 if(event.params && event.params.querystring){
				var queryParams = event.params.querystring;
			
				var rVerifyToken = queryParams['hub.verify_token']
			
				if (rVerifyToken === VERIFY_TOKEN) {
				var challenge = queryParams['hub.challenge']
			//	callback(null, parseInt(challenge))
				}else{
			//	callback(null, 'Error, wrong validation token');
				}
		}else{
            console.log(JSON.stringify(event)) ;
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
				//var lexruntime = new AWS.LexRuntime();
				//var userNumber = twilioSMS.From.replace('+', '');
				var params = {
				  botAlias: "dev" ,//process.env.BOT_ALIAS,
				  botName:  "demoBot", //process.env.BOT_NAME,
				  inputText: text , //twilioSMS.Body,
				  userId: sender, //userNumber,
				  sessionAttributes: {
				  }
				};
				makePostRequest(params,sender) ; 
			//	callback(null, "Done")
			}
			
				
			}
			}
		
			//callback(null, event);
		
		}
	
	} catch(e) {
		console.log(e);
		//callback(e);
	}
};

function makePostRequest(params,sender){
	var lexruntime = new AWS.LexRuntime();
	lexruntime.postText(params, function(err, data) {
				if (err) {
					console.log(err, err.stack); 
                    console.log(  "Some Error Occured Fuckkkkkkkk") ; 
				} else {
					console.log(data);   
					var date = 	data.message.match(/([0-9]{4}-[0-9]{2}-[0-9]{2})/ ) ;
					if( date !== null ){
						date = date[0] ; 
						console.log(date + "Life Is A Bitch !!") ;
						var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
						var d = new Date(date) ;
						console.log(d) ; 
						var month = months[d.getMonth()] , day = d.getDate(),year = d.getFullYear() ;
						var finalDate = day + " " + month.substring(0,3) + " " + year ;
						data.message = data.message.replace( date,finalDate ) ; 	
					}
					processData(sender,  data.message);
				}
	});

}

function processData(sender,message){
	var temp = { allow:true  } ;    	
	if(message[0]=='{'){ 
		var info = JSON.parse(message) 
		if(info.messages){
			sendTextMessage(sender,0,info.messages) ; 	
		}
	}
	else{
		var messageArray = [{  value : message  }] ; 
        sendTextMessage(sender,0,messageArray) ; 
	}

}

function sendTextMessage(senderFbId, index, messageArray) {
if( index == messageArray.length ) return ;
text = messageArray[index].value ;  
//console.log(text + "dfdfbdbsdbs"); 
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
var str = '' ; 
    response.on('data', function (chunk) {
      str += chunk;
    });
response.on('end', function () {
        console.log(str);
    });
  } ; 
var req = https.request(options, callback);
  req.on('error', function(e) {
    console.log('problem with request: '+ e);
  });

  req.on('finish',function(){
    //console.log("ended") ; 
    console.log(text + "finished");
	sendTextMessage(senderFbId,index+1,messageArray) ; 
  });  
  req.write(body) ;
  req.end();
}

var event = {
  "object": "page",
  "entry": [
    {
      "id": "lknwekjnkjnk",
      "time": 1458692752478,
      "messaging": [
        {
          "sender": {
            "id": "dlkndlskjkkkc"
          },
          "recipient": {
            "id": "sklvmldsfkvml"
          },
          "message": {
            "text": "View"
          }
        }
      ]
    }
  ]
} ; 

//sendTextMessage("106215100985285","Hi");

handler(event) ; 