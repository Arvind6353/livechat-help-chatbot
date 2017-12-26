function Node(data){
	this.data = data;
	this.children = [] ;
	this.show = show;
}

function show(){
	return this.data;
}

var prim_key=0;
var curr_id;

function Nary(){
	this.root=null;
	this.insert=insert;
	this.printTree=printTree;
	//this.search=search;
	//this.searchById=searchById;
}
var parent_id;
function insert(prev,curr){
	//console.log("prim_key: "+prim_key+" :curr_id: "+curr_id);
	data={
		id:prim_key,
		name: curr,
		text:insertTextData(curr)
	};
	var n = new Node(data);
	if(prev==null&&this.root!=null){
		curr_id=this.root.data.id;
		return;
	}
	if(this.root==null){
		this.root=n;
		curr_id=prim_key;
		prim_key++;
	}
	else{
		var parent = searchById(curr_id);
		for(var i=0;i<parent.children.length;i++){
			if(data.name==parent.children[i].data.name){
				curr_id=parent.children[i].data.id;
				return;
			}
		}
		curr_id=n.data.id;
		parent.children.push(n);
		prim_key++;
	}
}

function printTree(){
	var queue=[];
	queue.push(this.root);
	while(queue.length>0){
		var n=queue.shift();
		for(var i=0;i<n.children.length;i++){
			queue.push(n.children[i]);
		}
		console.log(n.show());
	}
}

/*function search(key){
	var queue=[];
	queue.push(nums.root);
	while(queue.length>0){
		var n=queue.shift();
		if(n.data.name==key){
			return n;
		}
		else{
			for(var i=0;i<n.children.length;i++){
				queue.push(n.children[i]);
			}
		}
	}
	console.log("Element not found");
	return null;
}*/

function searchById(key){
	var q=[];
	q.push(nums.root);
	while(q.length>0){
		var n=q.shift();
		if(n.data.id==key){
			return n;
		}
		else{
			for(var i=0;i<n.children.length;i++){
				q.push(n.children[i]);
			}
		}
	}
	console.log("Element not found");
	return null;
}

var nums=new Nary();


var fs = require('fs');
try{
	var flowData = fs.readFileSync('newflow.txt','utf-8');
	var i=0;
	while(flowData[i]!='#'&&flowData[i+1]!='#'&&flowData[i+2]!='#'&&flowData[i+3]!='#'){
		var str="";
		while(flowData[i]!='\n'){
			str+=flowData[i];
			i++;
		}
		var j,k=-1;
		for(j=0;j<str.length;j++){
			var child="",parent="";
			if(str[j]=='q'){
				while(str[j]!=' '){
					child+=str[j];
					j++;
				}
				if(k==-1){
					k=0;
					nums.insert(null,child);
					continue;
				}
				else{
					k=j;
					while(str[k]!='a')
						k--;
					while(str[k]!=' '){
						parent+=str[k];
						k++;
					}
				}
				nums.insert(parent,child);
			}
			else if(str[j]=='a'){
				while(str[j]!=' '){
					child+=str[j];
					j++;
				}
				k=j;
				while(str[k]!='q')
					k--;
				while(str[k]!=' '){
					parent+=str[k];
					k++;
				}
				nums.insert(parent,child);
			}
			else if(str[j]=='r'){
				while(j<str.length){
					child+=str[j];
					j++;
				}
				k=j;
				while(str[k]!='a')
					k--;
				while(str[k]!=' '){
					parent+=str[k];
					k++;
				}
				nums.insert(parent,child);
			}
		}
		i++;
	}
}
catch(e){
	console.log("This is flowData error: "+e.stack);
}

function insertTextData(key){
	var fs = require('fs');
	try{
		var qadata = fs.readFileSync('newQ.txt','utf-8'); //make global
		var i=0;
		while(qadata[i]!='#'&&qadata[i+1]!='#'&&qadata[i+2]!='#'&&qadata[i+3]!='#'){
			var str="";
			while(qadata[i]!='\n'){
				str+=qadata[i];
				i++;
			}
			var j=0,check="";
			while(str[j]!=' '){
				check+=str[j];
				j++;
			}
			var text="";
			if(check==key){
				j+=4;
				while(j<str.length){
					text+=str[j];
					j++;
				}
				return text;
			}
			i++;
		}
	}
	catch(e){
		console.log("This is qadata error: "+e.stack);
	}
}

//nums.printTree();

//Quick Reply Generator
function qr_generator(node){
	var qr_arr=[];
	for(var i=0;i<node.children.length;i++){
		qr_data = {
			content_type:"text",
			title: node.children[i].data.text,
			payload: node.children[i].data.id
		}
		qr_arr.push(qr_data);
	}
	var goback = {
		content_type:"text",
		title: "Go Back",
		payload: "-1"
	};
	qr_arr.push(goback);
	return qr_arr;
}

exports.searcher = function(q1){
	return searchById(q1);
}

exports.generator = function(node){
	return qr_generator(node);
}

exports.ptrToChild = function(node){
	return node.children[0];
}