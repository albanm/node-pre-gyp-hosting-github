var path = require('path');
var fs = require('fs');
var request = require('request');
var log = require('npmlog');

// initialize options for a HTTP request
var requestOpts = function(opts, config) {
	var requestOpts = {
		headers: {
			'User-Agent': 'node-pre-gyp-github-hosting'
		}
	};
	if (config.githubToken) requestOpts.headers.Authorization = 'token ' + config.githubToken;
	var proxyUrl = opts.proxy || process.env.http_proxy || process.env.HTTP_PROXY || process.env.npm_config_proxy;
	if (proxyUrl) requestOpts.proxy = proxyUrl;

	return requestOpts;
};

var getReleaseFromVersion = function(opts, config, callback) {
	var listOpts = requestOpts(opts, config);
	listOpts.headers.Accept = 'application/vnd.github.manifold-preview';
	listOpts.url = 'https://api.github.com/repos/' + opts.repo + '/releases';

	request(listOpts, function(err, response, body) {
		if (err) return callback(err);
		log.http(response.statusCode, listOpts.url);
		if (response.statusCode !== 200) return callback(new Error('Cannot list assets from ' + listOpts.url + ':  ' + response.statusCode));
		var releases = JSON.parse(body);
		var release;
		for (var i in releases) {
			if (releases[i].tag_name === opts.version || releases[i].tag_name === 'v' + opts.version) {
				release = releases[i];
			}
		}
		callback(null, release);
	});
};

/**
 * Upload a tarball packaged by node-pre-gyp as an asset to a github release
 *
 * @param {Object} opts - A options object as return by node-pre-gyp's versioning.evaluate()
 * @param {Function} callback - No particular return, just err or no err
 */
exports.publish = function(opts, config, callback) {

	if (!config.githubToken) return callback(new Error('Authentication token required to publish an asset to github'));

	getReleaseFromVersion(opts, config, function(err, release) {
		if (!release) return callback(new Error('Cannot publish over non-existing github release'));

		for (var i in release.assets) {
			if (release.assets[i].name === opts.package_name) {
				log.error('publish', 'Cannot publish over existing version');
				log.error('publish', "Update the 'version' field in package.json and try again");
				log.error('publish', 'If the previous version was published in error see:');
				log.error('publish', '\t node-pre-gyp unpublish');
				return callback(new Error('Failed publishing to github'));
			}
		}

		var postOpts = requestOpts(opts, config);
		postOpts.url = release.upload_url.replace('{?name}', '');
		postOpts.qs = {
			name: opts.package_name
		};
		postOpts.method = 'POST';
		postOpts.headers['Content-Type'] = 'application/tar';
		fs.readFile(opts.staged_tarball, function(err, data) {
			if (err) return callback(err);
			postOpts.body = data;
			request(postOpts, function(err, response) {
				if (err) return callback(err);
				log.http(response.statusCode, postOpts.url);
				if (response.statusCode !== 201) return callback(new Error('Cannot upload to ' + postOpts.url + ': ' + response.statusCode));
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
exports.unpublish = function(opts, config, callback) {
	if (!config.githubToken) return callback(new Error('Authentication token required to unpublish an asset to github'));

	getReleaseFromVersion(opts, config, function(err, release) {
		if (!release) return callback(new Error('Cannot unpublish over non-existing github release'));

		var asset;
		for (var i in release.assets) {
			if (release.assets[i].name === opts.package_name) {
				asset = release.assets[i];
			}
		}
		
		if (!asset) {
			console.log('[' + opts.name + '] Not found: ' + opts.package_name);
			return callback();
		}

		var delOpts = requestOpts(opts, config);
		delOpts.url = asset.url;
		delOpts.method = 'DELETE';
		request(delOpts, function(err, response) {
			if (err) return callback(err);
			log.http(response.statusCode, delOpts.url);
			if (response.statusCode !== 204) return callback(new Error('Cannot delete ' + delOpts.url + ': ' + response.statusCode));
			console.log('[' + opts.name + '] Success: unpublished ' + delOpts.url);
			callback();
		});
	});
};

/**
 * Download a tarball packaged by node-pre-gyp that was previously uploaded as an asset to a github release
 *
 * @param {Object} opts - An options object as return by node-pre-gyp's versioning.evaluate()
 * @param {Function} callback - called with a request object (https://github.com/mikeal/request) that will be used as a stream by node-pre-gyp
 */
exports.download = function(opts, callback) {
	getReleaseFromVersion(opts, {}, function(err, release) {
		if (!release) return callback(new Error('Cannot unpublish over non-existing github release'));
		var asset;
		for (var i in release.assets) {
			if (release.assets[i].name === opts.package_name) {
				asset = release.assets[i];
			}
		}

		if (!asset) return callback(new Error('Pre-built binary not available for your system'));

		var getOpts = requestOpts(opts, {});
		getOpts.url = asset.url;
		getOpts.headers.Accept = 'application/octet-stream';
		delete getOpts.headers.Authorization;
		callback(null, request(getOpts));
	});
};