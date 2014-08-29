node-pre-gyp-hosting-github
===========================

**Work in progress, not yet published on NPM**

[![Build status](https://travis-ci.org/albanm/node-pre-gyp-hosting-github.svg)](https://travis-ci.org/albanm/node-pre-gyp-hosting-github)
[![Code Climate](https://codeclimate.com/github/albanm/node-pre-gyp-hosting-github/badges/gpa.svg)](https://codeclimate.com/github/albanm/node-pre-gyp-hosting-github)
[![Coverage Status](https://coveralls.io/repos/albanm/node-pre-gyp-hosting-github/badge.png)](https://coveralls.io/r/albanm/node-pre-gyp-hosting-github)
[![NPM version](https://badge.fury.io/js/node-pre-gyp-hosting-github.svg)](http://badge.fury.io/js/node-pre-gyp-hosting-github)

*Github hosting for binaries managed by [node-pre-gyp](https://github.com/mapbox/node-pre-gyp).*

This project acts as a plugin to [node-pre-gyp](https://github.com/mapbox/node-pre-gyp). It changes 'publish', 'unpublish' and 'install' commands behaviors so that packaged binaries are uploaded and downloaded from github using the [releases API](https://developer.github.com/v3/repos/releases/).

Install
-------

    npm install node-pre-gyp-hosting-github

Configure
---------

Complete node-pre-gyp options in your package.json with a 'hosting' object.

```json
{
    "name": "node-addon-example",
    ...
    "binary": {
        "module_name": "node_addon_example",
        "module_path": "./lib/binding/{configuration}/{node_abi}-{platform}-{arch}/",
        "remote_path": "./{module_name}/v{version}/{configuration}/",
        "package_name": "{module_name}-v{version}-{node_abi}-{platform}-{arch}.tar.gz",
        "hosting": {
            "provider": "github",
            "repo": "albanm/node-addon-example"
        }
    },
    "dependencies": {
        "node-pre-gyp": "albanm/node-pre-gyp",
        "node-pre-gyp-hosting-github": "albanm/node-pre-gyp-hosting-github"
    },
    "scripts": {
        "install": "node-pre-gyp install --fallback-to-build"
    }
}
```

Authenticate
------------

To publish and unpublish binaries you will need to [create a github token](https://github.com/settings/applications) with 'public_repo' and 'repo_deployment' scopes. Then pass it to node-pre-gyp configuration using a environment variable for example:

    export node_pre_gyp_githubToken=...
    
    
Use
---

    node-pre-gyp clean build package publish

Travis-ci
---------

To allow you travis-ci build to publish binaries run this:

    gem install travis
    travis encrypt node_pre_gyp_githubToken=...
    
Then complete your .travis.yml file with something like this:

    env:
      global:
        secure: RuuJ49H...

Manual publishing
-----------------

This is particularly useful to publish binaries submitted by users that don't have write access to your repository.

To add packaged binaries to your github releases you can run:

    node-pre-gyp clean build package
   
Then upload the tarball file created in your build/staged directory directly to github, in your repository's page click on 'releases' then 'Edit'.
