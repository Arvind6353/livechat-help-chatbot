exports.insert = function(userdata){
	const mongoose = require('mongoose');
	const url = 'mongodb://localhost:27017/chatbot';
	var User = require('./models/user.js');
	const connect = mongoose.connect(url,{
		useMongoClient:true
	});

	mongoose.Promise = require('bluebird');
	//console.log("This is db");
	//console.log(userdata);
	if(userdata.back==true){
		User.findOneAndUpdate({'SessionId':userdata.sid,A:userdata.prevA},{$set:{
			Q:userdata.Q,
			A:userdata.A,
			text:userdata.text,
			back:userdata.back,
			prevA:userdata.prevA,
			prevtext:userdata.prevtext
		}},{upsert:true}).then(()=>{
			return null;
		});
	}
	else{
		User.findOneAndUpdate({'SessionId':userdata.sid,Q:userdata.Q},{$set:{
			UserName:userdata.UserName,
			text:userdata.text,
			A:userdata.A,
			back:userdata.back,
			prevA:userdata.prevA,
			prevtext:userdata.prevtext
		}},{upsert:true}).then(()=>{
			return null;
		});
	}
}