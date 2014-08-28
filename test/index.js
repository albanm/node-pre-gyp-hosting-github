var fs = require('fs');
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
	before(function(callback) {
		githubHosting.unpublish(opts, config, callback);
	});

	it('should publish a package', function(callback) {
		githubHosting.publish(opts, config, callback);
	});

	it('should download a package', function(callback) {
		githubHosting.download(opts, config, function(err, req) {
			should.not.exist(err);
			req.on('data', function(data){
				should.equal(data.toString('utf8'), 'package example');
				callback();
			});
			req.on('error', callback);
		});
	});

	it('should unpublish a package', function(callback) {
		githubHosting.unpublish(opts, config, callback);
	});
});