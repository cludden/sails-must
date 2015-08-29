'use strict';

var _ = require('lodash');

module.exports = function(must, options) {
    options.helpers = options.helpers ? options.helpers : [];
    options.helpers = _.union(options.helpers, ['be']);
    
    //options.chainables.forEach(function(chain) {
    //    must.addProperty(chain, function() {
    //        return this;
    //    });
    //});

    options.helpers.forEach(function(name) {
        must.addChainableMethod(name, function() {
            var args = Array.prototype.slice.call(arguments);
            if (args.length) {
                this.args = this.args ? this.args.concat(args) : args;
            }
        });
    });
};