'use strict';
const request = require('request');
class FBeamer{
	constructor(config){
		try{
			if(!config || config.PAGE_ACCESS_TOKEN === undefined || config.VERIFY_TOKEN === undefined){
				throw new Error("Unable to access tokens!");
			}
			else{
				this.PAGE_ACCESS_TOKEN = config.PAGE_ACCESS_TOKEN;
				this.VERIFY_TOKEN = config.VERIFY_TOKEN;
			}
		}
		catch(e){
			console.log(e.stack);
		}
	}

	registerHook(req, res) {
		// If req.query.hub.mode is 'subscribe'
		// and if req.query.hub.verify_token is the same as this.VERIFY_TOKEN
		// then send back an HTTP status 200 and req.query.hub.challenge
		if (req.query['hub.mode'] === 'subscribe' &&
		req.query['hub.verify_token'] === 'starter_bot_token') {
		console.log("Validating webhook");
		res.status(200).send(req.query['hub.challenge']);
	  } else {
		console.error("Failed validation. Make sure the validation tokens match.");
		res.sendStatus(403);
	  }
	}

		incoming(req,res,cb){
			let data=req.body;
			console.log("fb incoming");
			if(data.object ==='page'){
				data.entry.forEach(pageObj => {
					pageObj.messaging.forEach(msgEvent => {
						let messageObj = {
							sender: msgEvent.sender.id,
							timeOfMessage: msgEvent.timestamp,
							message: msgEvent.message
						}
						cb(messageObj);
					});
				});
			}
			res.send(200);
		}

		getUserDetails(id,cb){
			request({
				uri:'https://graph.facebook.com/v2.6/'+id+'?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token='+this.PAGE_ACCESS_TOKEN,
				method: 'GET'
			},(error,response,body)=>{
				var data = JSON.parse(body);
				cb(data);
			});
		}

		subscribe(){
			request({
				uri: 'https://graph.facebook.com/v2.6/me/subscribed_apps',
				qs:{
					access_token:this.PAGE_ACCESS_TOKEN
				},
				method: 'POST'
			},(error,response,body) => {
				if(!error && JSON.parse(body).success){
					console.log("subscribed to the page");
				}
				else{
					console.log(error);
				}
			});
		}

		sendMessage(payload,cb){
			return new Promise((resolve,reject) => {
				//Create HTTP POST request
				request({
					uri:'https://graph.facebook.com/v2.6/me/messages',
					qs:{
						access_token: this.PAGE_ACCESS_TOKEN
					},
					method: 'POST',
					json: payload
				},(error,response,body) => {
					//console.log(response.statusCode+"\t"+(!error));
					if(!error && response.statusCode == 200){
						//console.log(response.statusCode);
						resolve({
							messageId:body.message_id
						});
						
					}
					else{
						reject(error);
					}
				});
			});
		}

		sender_action(id,action,cb){
			let obj={
				recipient:{
					id
				},
				sender_action:action
			}
			this.sendMessage(obj)
				.then(function(response){
					cb(response);
				})
				.catch(error => console.log("sender_action error"+error));
		}

		txt(id,text,cb){
			let obj={
				recipient:{
					id
				},
				message:{
					text
				}
			}
			this.sendMessage(obj)
				.then(function(response){
					cb(response);
				})
				.catch(error => console.log("txt fn error"+error));
		}

		quickreply(id,str,qr_data,cb){
			//console.log(qr_data);
			let obj={
				recipient:{
					id
				},
				message:{
					text:str,
					quick_replies:qr_data
				}
			}
			//console.log(obj.message);
			this.sendMessage(obj)
				.then(function(response){
					cb(response);
				})
				.catch(error => console.log("quickreply fn error"+error));
		}
}

module.exports = FBeamer;