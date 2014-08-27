// initialize options for a HTTP request
exports.requestOpts = function(opts, config) {
	var requestOpts = {
		headers: {
			'User-Agent': 'node-pre-gyp-github-hosting',
			Accept: 'application/vnd.github.manifold-preview'
		}
	};
	if (config.githubToken) requestOpts.headers.Authorization = 'token ' + config.githubToken;
	var proxyUrl = opts.proxy || process.env.http_proxy || process.env.HTTP_PROXY || process.env.npm_config_proxy;
	if (proxyUrl) requestOpts.proxy = proxyUrl;

	return requestOpts;
};