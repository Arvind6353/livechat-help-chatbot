'use strict';

//create API server
const Restify = require('restify');
const natural = require('natural');
const tree = require('./n-ary.js');
const assert = require('assert');
const db = require('./db.js');
const request = require('request');
const server = Restify.createServer({
	name: 'Test'
});

var ctr=0;

//const messages
const GOODBYE_MESSAGE="You're welcome. See you later :D";
const HELP_MESSAGE="Hey its simple. These set of questions will help you to choose which product of PayPal you can use in your website. Continue by clicking the options.";
const STANDARD_MESSAGE="Oh! Sorry I didn\'t get you. Please select from the options.";
const UNDER_CONSTRUCTION_MESSAGE_1="Sorry :-(. We are not handling it right now. Please check ";
const UNDER_CONSTRUCTION_MESSAGE_2=" for further help.";
const HAPPY_MESSAGE_1 = "\nThank You. :D :D. Use your reference id ";
const HAPPY_MESSAGE_2 = " for any further communication";

server.use(Restify.jsonp());
server.use(Restify.bodyParser());

const PORT = process.env.PORT || 3001;

//Tokens
const config = require('./config');

//FBeamer
const FBeamer = require('./fbeamer');
const f = new FBeamer(config);

const WebBeamer = require('./webbeamer');
const w = new WebBeamer();

//Register the webhooks
server.get('/',(req,res,next)=>{
	f.registerHook(req,res);
	return next();
});


//Global Vars
let map=[];
var object={
	node:null,
	welcome:null,
	userdata:{
		UserName:null,
		sid:null,
		Q:null,
		text:null,
		A:null,
		back:null,
		prevA:null,
		prevtext:null
	},
	sessionid:null,
	prevQ:null,
	grandprevQ:null,
	back:null,
	prevPayload:null
};

function matcher(text,children){
	for(var i in children){
		//console.log(children[i].data.text+"\t"+natural.JaroWinklerDistance(text,children[i].data.text));
		if(natural.JaroWinklerDistance(text,children[i].data.text)>0.75)
			return i;
	}
	return null;
}
function NLPmatcher(nlptext,children){
	for(var i in children){
		console.log(nlptext+"\t"+children[i].data.name);
		if(nlptext==children[i].data.name)
			return i;
	}
	return null;
}

//Receive all incoming requests
server.post('/',(req,res,next) => {
	f.incoming(req,res,msg => {
		f.sender_action(msg.sender,"typing_on",function(data){
			return null;
		});
		console.log(ctr++);
		f.getUserDetails(msg.sender, function(dataname){
			if(map[msg.sender]==undefined){
				
				map[msg.sender]=Object.assign({},object);
				map[msg.sender].welcome=0;
				map[msg.sender].back=0;
				map[msg.sender].backflag=0;
				map[msg.sender].prevPayload=0;
			}
			//console.log(map[msg.sender].prevQ);
			//console.log(dataname.first_name+"\t"+msg.sender);
			map[msg.sender].backflag--;
			if(msg.message.quick_reply != undefined){
				if(msg.message.quick_reply.payload=="-1"){
					map[msg.sender].grandprevQ=map[msg.sender].prevQ;
					map[msg.sender].userdata.back=true;
					map[msg.sender].node = tree.searcher(map[msg.sender].prevPayload);
					map[msg.sender].userdata.prevA=map[msg.sender].node.data.text;
					map[msg.sender].userdata.prevtext=msg.message.text;
					map[msg.sender].back=1;
					map[msg.sender].backflag=2;
					var qrdata=tree.generator(map[msg.sender].prevQ);
					//console.log("First",qrdata);
					qrdata.pop();
					f.quickreply(msg.sender,map[msg.sender].prevQ.data.text,qrdata,function(data){
						//console.log("Second returning");
						return null;
					});
				}
				else{
					map[msg.sender].prevQ=map[msg.sender].node;
					map[msg.sender].prevPayload=msg.message.quick_reply.payload;
					map[msg.sender].node = tree.searcher(msg.message.quick_reply.payload);
					//console.log(map[msg.sender].node.data.text);
					map[msg.sender].userdata.text=msg.message.text;
					map[msg.sender].userdata.A=map[msg.sender].node.data.text;
					if(map[msg.sender].back==1){
						map[msg.sender].userdata.Q=map[msg.sender].grandprevQ.data.text;
						//console.log("From back button");
						//console.log(map[msg.sender].userdata);
						//db.insert(map[msg.sender].userdata);
						map[msg.sender].userdata.back=false;
						map[msg.sender].userdata.prevA="";
						map[msg.sender].userdata.prevtext="";
						//console.log("Back is set. Resetting it.");
						map[msg.sender].back=0;
					}
					else{
						//console.log(map[msg.sender].userdata);
						//db.insert(map[msg.sender].userdata);
					}
					map[msg.sender].node = tree.ptrToChild(map[msg.sender].node);
					map[msg.sender].userdata.Q=map[msg.sender].node.data.text;
					if(map[msg.sender].node.data.name=="res404"){
						map[msg.sender].welcome=0;
						f.txt(msg.sender, UNDER_CONSTRUCTION_MESSAGE_1+map[msg.sender].node.data.text+UNDER_CONSTRUCTION_MESSAGE_2,function(data){
								return null;
							});
					}
					else if(map[msg.sender].node.data.name[0]=='r'&&map[msg.sender].node.data.name[1]=='e'&&map[msg.sender].node.data.name[2]=='s'){
						map[msg.sender].userdata.A=map[msg.sender].userdata.Q;
						map[msg.sender].userdata.Q="Final Response";
						//db.insert(map[msg.sender].userdata);
						map[msg.sender].welcome=0;
						
							f.txt(msg.sender, map[msg.sender].node.data.text+HAPPY_MESSAGE_1+map[msg.sender].sessionid+HAPPY_MESSAGE_2,function(data){
								return null;
							});
					}else{
						var qrdata=tree.generator(map[msg.sender].node);
						
						if(map[msg.sender].backflag>0){
							qrdata.pop();
						}
						f.quickreply(msg.sender,map[msg.sender].node.data.text,qrdata,function(data){
							return null;
						});
					}
				}
			}
			else if(msg.message.quick_reply == undefined && map[msg.sender].welcome==0 && (msg.message.text!="help" || msg.messagetext!="bye" || msg.message.text!="thanks") ){
				map[msg.sender]=Object.assign({},object);
				map[msg.sender].welcome=1;
				map[msg.sender].sessionid=require('crypto').randomBytes(8).toString('hex');
				map[msg.sender].userdata.UserName=dataname.first_name+" "+dataname.last_name;
				map[msg.sender].userdata.sid=map[msg.sender].sessionid;
				map[msg.sender].node = tree.searcher(0);
				map[msg.sender].userdata.Q=map[msg.sender].node.data.text;
				map[msg.sender].prevQ=map[msg.sender].node;
				f.txt(msg.sender,`Hi ${dataname.first_name}! Welcome to PayPal.`, function(data){
					//consoler.log(data);
					var qrdata=tree.generator(map[msg.sender].node);
					qrdata.pop();
				    if(data.messageId != undefined) {
				    	f.quickreply(msg.sender,map[msg.sender].node.data.text,qrdata,function(data){
							return null;
						});
				    }
				});
			}
			else if(msg.message.quick_reply==undefined && msg.message.text != "help" && msg.message.text!= "bye" && msg.message.text!= "thanks"){
				if(map[msg.sender].back==1){
					map[msg.sender].node=map[msg.sender].prevQ;
					map[msg.sender].back=0;
				}
				var found = matcher(msg.message.text,map[msg.sender].node.children);
				map[msg.sender].prevQ=map[msg.sender].node;
				map[msg.sender].userdata.text=msg.message.text;
				//console.log("country found"+found);
				if(found!=null){
					map[msg.sender].prevPayload=map[msg.sender].node.children[found].data.id;
					map[msg.sender].userdata.A=map[msg.sender].node.children[found].data.text;
					//db.insert(map[msg.sender].userdata);
					map[msg.sender].node=tree.ptrToChild(map[msg.sender].node.children[found]);
					if(map[msg.sender].node.data.name=="res404"){
						map[msg.sender].welcome=0;
						f.txt(msg.sender, UNDER_CONSTRUCTION_MESSAGE_1+map[msg.sender].node.data.text+UNDER_CONSTRUCTION_MESSAGE_2,function(data){
								return null;
							});
					}else if(map[msg.sender].node.data.name.startsWith("res")){
						map[msg.sender].welcome=0;
						f.txt(msg.sender,map[msg.sender].node.data.text+HAPPY_MESSAGE_1+map[msg.sender].sessionid+HAPPY_MESSAGE_2,function(data){
								return null;
							});
					}else{
						f.quickreply(msg.sender,map[msg.sender].node.data.text,tree.generator(map[msg.sender].node),function(data){
							return null;
						});
					}
				}else{
							var found=null;
							request.post({
								url:'http://10.176.4.86:8001/testAPI',
								form: {test:msg.message.text,questionId:map[msg.sender].node.data.name}
							},function(error,httpResponse,body){
								var nlptext=body;
								found=NLPmatcher(nlptext,map[msg.sender].node.children);
									map[msg.sender].prevQ=map[msg.sender].node;
							map[msg.sender].userdata.text=msg.message.text;
							if(found!=null){
								map[msg.sender].prevPayload=map[msg.sender].node.children[found].data.id;
								map[msg.sender].userdata.A=map[msg.sender].node.children[found].data.text;
								//db.insert(map[msg.sender].userdata);
								map[msg.sender].node=tree.ptrToChild(map[msg.sender].node.children[found]);
								if(map[msg.sender].node.data.name=="res404"){
									map[msg.sender].welcome=0;
									f.txt(msg.sender, UNDER_CONSTRUCTION_MESSAGE_1+map[msg.sender].node.data.text+UNDER_CONSTRUCTION_MESSAGE_2,function(data){
											return null;
										});
								}else if(map[msg.sender].node.data.name.startsWith("res")){
									map[msg.sender].welcome=0;
									f.txt(msg.sender,map[msg.sender].node.data.text+HAPPY_MESSAGE_1+map[msg.sender].sessionid+HAPPY_MESSAGE_2,function(data){
											return null;
										});
								}else{
									//console.log(map[msg.sender].node.data.name);
									f.quickreply(msg.sender,map[msg.sender].node.data.text,tree.generator(map[msg.sender].node),function(data){
										return null;
									});
								}
							}else if(found==null){
									f.txt(msg.sender,STANDARD_MESSAGE, function(data){
								    if(data.messageId != undefined) {
								    	f.quickreply(msg.sender,map[msg.sender].node.data.text,tree.generator(map[msg.sender].node),function(data){
											return null;
										});
								    }
								});
								}
							});
					}
				}
			else if(msg.message.text == "help" && msg.message.quick_reply == undefined){
				f.txt(msg.sender,HELP_MESSAGE,function(data){
					if(data.messageId != undefined) {
				    	f.quickreply(msg.sender,map[msg.sender].node.data.text,tree.generator(map[msg.sender].node),function(data){
							return null;
						});
				    }
				});
			}
			else if((msg.message.text == "bye" || msg.message.text == "thanks") && msg.message.quick_reply == undefined){
				f.txt(msg.sender,GOODBYE_MESSAGE,function(data){
					map[msg.sender].welcome=0;
					return null;
				});
			}
		});
	});
});
//Subscribe 
f.subscribe();

server.listen(PORT,() => console.log(`Running on port ${PORT}`));
