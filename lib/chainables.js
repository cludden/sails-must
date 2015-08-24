'use strict';

var _ = require('lodash');

module.exports = function(must, options) {
    options.chainables = options.chainables ? options.chainables : [];
    options.chainables = _.union(options.chainables, ['be']);
    
    options.chainables.forEach(function(chain) {
        must.addProperty(chain, function() {
            return this;
        });
    });
};