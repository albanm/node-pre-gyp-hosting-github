var should = require('should');

var githubHosting = require('../index.js');
var requestOpts = require('../util').requestOpts;

// extract from the result of a versioning.evaluate
var opts = {
	name: 'node-addon-example',
	version: '0.1.4',
	hosting: 'github',
	repo: 'albanm/node-addon-example',
	package_name: 'package_example.txt',
	staged_tarball: 'test/resources/package_example.txt'
};

var config = {
	githubToken: process.env.node_pre_gyp_githubToken
};

describe('Github hosting for node-pre-gyp', function() {
	it('should define the 3 expected functions', function() {
		githubHosting.publish.should.be.type('function');
		githubHosting.unpublish.should.be.type('function');
		githubHosting.download.should.be.type('function');
	});

	it('should upload a package on a matching release', function(callback) {
		githubHosting.publish(opts, config, function(err){
			should.not.exist(err);
			callback();
		});
	});
});