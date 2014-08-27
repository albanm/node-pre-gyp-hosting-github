var path = require('path');
var fs = require('fs');
var request = require('request');
var log = require('npmlog');

var requestOpts = require('./util').requestOpts;
/**
 * Upload a tarball packaged by node-pre-gyp as an asset to a github release
 *
 * @param {Object} opts - A options object as return by node-pre-gyp's versioning.evaluate()
 * @param {Object} config - A config object as built by node-pre-gyp using the rc configuration module
 * @param {Function} callback - No particular return, just err or no err
 */
exports.publish = function(opts, config, callback) {

	// first fetch the list of releases
	var listOpts = requestOpts(opts, config);
	listOpts.url = 'https://api.github.com/repos/' + opts.repo + '/releases';

	request(listOpts, function(err, response, body) {
		if (err) return callback(err);
		if (response.statusCode !== 200) return callback(new Error('Cannot list assets from ' + listOpts.url + ':  ' + response.statusCode));

		var releases = JSON.parse(body);
		var currentRelease;
		for (var i in releases) {
			// remember the release that matches the required version
			if (releases[i].tag_name === opts.version || releases[i].tag_name === 'v' + opts.version) {
				currentRelease = releases[i];
			}
			// fail if an asset matching current upload already exists
			for (var j in releases[i].assets) {
				if (releases[i].assets[i].name === opts.package_name) {
					log.error('publish', 'Cannot publish over existing version');
					log.error('publish', "Update the 'version' field in package.json and try again");
					log.error('publish', 'If the previous version was published in error see:');
					log.error('publish', '\t node-pre-gyp unpublish');
					return callback(new Error('Failed publishing to github'));
				}
			}
		}

		if (!currentRelease) return callback(new Error('Cannot publish over non-existing github release'));

		// then actually upload the asset on the release
		var postOpts = requestOpts(opts, config);
		postOpts.url = currentRelease.upload_url.replace('{?name}', '');
		postOpts.qs = {
			name: opts.package_name
		};
		postOpts.method = 'POST';
		delete postOpts.headers.Accept;
		postOpts.headers['Content-Type'] = 'application/tar';
		fs.readFile(opts.staged_tarball, function(err, data) {
			if (err) return callback(err);
			postOpts.body = data;
			request(postOpts, function(err, response) {
				if (err) return callback(err);
				if (response.statusCode !== 201) return callback(new Error('Cannot upload to github:  ' + response.statusCode));
				console.log('[' + opts.name + '] Success: published to ' + postOpts.url);
				callback();
			});
		});


	});
};

/**
 * Remove a tarball packaged by node-pre-gyp that was previously uploaded as an asset to a github release
 *
 * @param {Object} opts - An options object as return by node-pre-gyp's versioning.evaluate()
 * @param {Function} callback - No particular return, just err or no err
 */
exports.unpublish = function(opts, callback) {
	// TODO
	callback();
};

/**
 * Download a tarball packaged by node-pre-gyp that was previously uploaded as an asset to a github release
 *
 * @param {Object} opts - An options object as return by node-pre-gyp's versioning.evaluate()
 * @param {Function} callback - called with a request object (https://github.com/mikeal/request) that will be used as a stream by node-pre-gyp
 */
exports.download = function(opts, callback) {
	// TODO
	callback();
};