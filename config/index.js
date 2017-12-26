'use strict';

if(process.env.NODE_ENV === 'production'){
	module.exports ={
		PAGE_ACCESS_TOKEN: process.env.PAGE_ACCESS_TOKEN,
		VERIFY_TOKEN : process.env.VERIFY_TOKEN
	}
}
else{
	module.exports = require('./dev.json');
}