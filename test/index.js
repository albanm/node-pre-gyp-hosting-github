var should = require('should');

describe('Github hosting for node-pre-gyp', function(){
	var githubHosting = require('../index.js');
	it('should define 3 functions', function(){
		githubHosting.publish.should.be.type('function');
		githubHosting.unpublish.should.be.type('function');
		githubHosting.download.should.be.type('function');
		githubHosting.publish({}, function(err){
			should.not.exist(err);
		});
	});
});