'use strict';

if(process.env.NODE_ENV === 'production'){
	module.exports ={
		PAGE_ACCESS_TOKEN: 'EAAN3s3DTH3sBAEC45SP3wawfAXqnONXww9my16c5zDZAEZAANQlhRErceN4QDc99m8xi9rlSSrn0n5ppymqZBHfN0tZC9m7jA7RiEE7LvLGaZARSN1qgscTfinUuEXdQPdfARRK6sRyZCxlfY90WIbjK6eY0Htm9x54IHpegA4cAZDZD',
		VERIFY_TOKEN : 'starter_bot_token'
	}
}
else{
	module.exports = require('./dev.json');
}