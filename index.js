'use strict';

var includeAll = require('include-all');


/**
 * Creates and returns a new policyFactory provider
 *
 * @param {Object} [options] - provider options
 * @param {String} [options.path='/api/policyFactories'] - the path to the root directory containing all policy factories, relative to the process.cwd
 * @param {String[]} [options.chainables=['be']] - a list of chainable methods to define on the provider
 * @returns {Function}
 */
module.exports = function(options) {
    options = options ? options : {};

    var must = function() {
        this.version = '0.1.0';
    };

    // define defaults
    var defaults = {
        path: '/api/policyFactories',
        chainables: ['be']
    };

    // set default path
    options.path = options.path || defaults.path;

    // set default chainable methods
    options.chainables = options.chainables || [];
    defaults.chainables.forEach(function(method) {
        if (options.chainables.indexOf(method) === -1) {
            options.chainables.push(method);
        }
    });

    var utils = {
        addProperty: function(ctx, name, getter) {
            Object.defineProperty(ctx, name, {
                get: function() {
                    var result = getter.call(this);
                    return result === undefined ? this : result;
                },
                configurable: true
            });
        }
    };

    must._addProperty = function(name, fn) {
        utils.addProperty(this, name, fn);
    };

    // configure chainable methods
    options.chainables.forEach(function(method) {
        must._addProperty(method, function() {
            return this;
        });
    });

    // build factories dictionary
    var factories = includeAll({
        dirname: process.cwd() + options.path,
        filter: /(.+)\.js$/,
        optional: true
    });

    // extend the provider with the factories
    for (var factory in factories) {
        if (factories.hasOwnProperty(factory)) {
            must[factory] = factories[factory];
        }
    }

    return must;
};