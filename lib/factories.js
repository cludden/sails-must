'use strict';

var _ = require('lodash');

module.exports = function(must, options) {
    var factories = require('include-all')({
        dirname: process.cwd() + options.paths.factories,
        filter: /(.+)\.js$/,
        optional: true
    });
    
    _.each(factories, function(factory, name) {
        must.addMethod(name, function() {
            this.factory = factory;
            this.factoryName = name;
            this.args = arguments.length ? Array.prototype.slice.call(arguments) : [];
        });
    }, this);
};