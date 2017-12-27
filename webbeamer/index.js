'use strict';
const request = require('request');
class WebBeamer{
		constructor(config){
		// init config 	
		}

		incoming(req,res,cb){
			var data = req.body.data;
			var type = req.body.type;
			var msg = {
				sender : req.body.sender,
				message : {
					quick_reply: undefined,
					text : data
				}
			}
		
			if(type =='payload'){
				msg.message.quick_reply = {
					payload : data
				}
			}
			
			if(req.body.object ==='web'){
				cb(msg);
			} else {
				res.end();
			}
		}

		sender_action(sender,type,cb){
			cb();
		}

		getUserDetails(sender,cb){
			cb({first_name:'f1',last_name:'l1'});

		}

		txt(id,text,cb, req, res, dualCb){
			if(dualCb == 'dual'){
				cb({messageId:'id',text:text});
			} else{
				res.json({
					message  :text,
					type : 'text'
				}) 
			}
		
		}

		quickreply(id,str,qr_data,cb, req, res,text){
			let txt = text || '';
			res.json({
				message  : txt,
				type : 'options',
				optionTitle : str,
				options :qr_data
			})

		}
}

module.exports = WebBeamer;