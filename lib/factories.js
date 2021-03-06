'use strict';

var _ = require('lodash');

module.exports = function(must, options) {
    var factories = require('include-all')({
        dirname: process.cwd() + options.paths.factories,
        filter: /(.+)\.js$/,
        optional: true
    });
    
    _.each(factories, function(factory, name) {
        must.addChainableMethod(name, function() {
            var _args = Array.prototype.slice.call(arguments);
            if (_args.length) this.args = this.args.concat(_args);
        }, function() {
            this.factory = factory;
            this.factoryName = name;
        });
    });
};