var assert = require('assert');
var tree = require('../n-ary.js');

describe('Tree tester',function(){
	it('searchById fn. tester',function(done){
		for(var i=0;i<2440;i++){
			node=tree.searcher(i);
			assert.notEqual(node.data.id,null);
			assert.notEqual(node.data.name,null);
			assert.notEqual(node.data.text,null);
		}
		done();
	});
});