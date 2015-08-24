'use strict';

var _ = require ('lodash');

/*
 *  TODO
 *  Consider implementing as an installable hook. Would require users to set the 'policies' hook to false.
 *  But then we could implement our own policies hook that would look for 'Object's with a build method,
 *  and go ahead and build them for us.
 *  
 *  Also, clean this module up. It looks terrible!
 */

module.exports = function(options) {
    var options = options ? options : {};
    
    _.defaults (options, {
        chainables: ['be'],
        paths: {
            factories: '/api/policyFactories',
            modifiers: '/api/policyModifiers'
        }
    });

    var Must = require('./lib/must');
    
    var util = require('include-all')({
        dirname: __dirname + '/lib/utils',
        filter: /(.+)\.js/,
        optional: true
    });

    Must.addProperty = function(name, fn) {
        util.addProperty(this.prototype, name, fn);
    };

    Must.addMethod = function(name, fn) {
        util.addMethod(this.prototype, name, fn);
    };

    Must.addChainableMethod = function(name, fn, chainingBehavior) {
        util.addChainableMethod(this.prototype, name, fn, chainingBehavior);
    };
    
    require('./lib/chainables')(Must, options);
    require('./lib/modifiers')(Must, options);
    require('./lib/factories')(Must, options);
    
    return new Must();
};