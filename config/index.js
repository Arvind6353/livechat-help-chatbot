'use strict';

if(process.env.NODE_ENV === 'production'){
	module.exports ={
		PAGE_ACCESS_TOKEN: 'EAAN3s3DTH3sBABJ8Jf9mJpyMX0ZABzbPtZCeHODxUQP0Tg2Ms16DBwX621NiyHXCqhX1K6ZBgSNgUw0ktrcBrwKHCmcufiW1pSvGJmEoOnZA4RwJq5SuVDJ162XSZC6YR2CRdVwUJa6gDrdGGr37jZCOAiTm4EGCQhP4ZC0SrawHwZDZD',
		VERIFY_TOKEN : 'starter_bot_token'
	}
}
else{
	module.exports = require('./dev.json');
}