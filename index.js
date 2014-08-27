/**
 * Upload a tarball packaged by node-pre-gyp as an asset to a github release
 *
 * @param {Object} opts - An options object as return by node-pre-gyp's versioning.evaluate()
 * @param {Function} callback - No particular return, just err or no err
 */
exports.publish = function(opts, callback){
	// TODO
	callback();
};

/**
 * Remove a tarball packaged by node-pre-gyp that was previously uploaded as an asset to a github release
 *
 * @param {Object} opts - An options object as return by node-pre-gyp's versioning.evaluate()
 * @param {Function} callback - No particular return, just err or no err
 */
exports.unpublish = function(opts, callback){
	// TODO
	callback();
};

/**
 * Download a tarball packaged by node-pre-gyp that was previously uploaded as an asset to a github release
 *
 * @param {Object} opts - An options object as return by node-pre-gyp's versioning.evaluate()
 * @param {Function} callback - called with a request object (https://github.com/mikeal/request) that will be used as a stream by node-pre-gyp
 */
exports.download = function(opts, callback){
	// TODO
	callback();
};