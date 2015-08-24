'use strict';

var includeAll = require('include-all'),
    _ = require('lodash');

module.exports = function(Must, options) {
    var modifiers = includeAll({
        dirname: process.cwd() + options.paths.modifiers,
        filter: /(.+)\.js$/,
        optional: true
    });
    
    var defaults = includeAll({
        dirname: __dirname + '/modifiers',
        filter: /(.+)\.js$/,
        optional: true
    });
    
    _.defaults(modifiers, defaults);
    
    _.each(modifiers, function(obj, name) {
        if (obj.type === 'method') {
            Must.addMethod(name, obj.fn);
        } else {
            Must.addProperty(name, obj.fn);
        }
    });
};