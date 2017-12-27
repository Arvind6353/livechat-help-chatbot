'use strict';

class WrapperBot{
		constructor(config){
		// init config 	
		}

        findAndReturnInstanceType(data) {

            if(data === 'web') {
                return  "WebBeamer";
            } else {
                return  "FBeamer";
            }

        }
		
}

module.exports = WrapperBot;