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

    // define default values
    _.defaults (options, {
        /**
         * An array of default helpers
         */
        chainables: ['be'],

        /**
         * A map of default paths used by this module
         */
        paths: {
            factories: '/api/policyFactories',
            modifiers: '/api/policyModifiers'
        },

        /**
         * The policy response handler. By default, if an error occurs in one of the policies in the policy chain, next
         * will be called with the error. If at least of one of the policies in the policy chain called next with a null value,
         * the policy will call next(). If the policy failed, the policy will call next('Unauthorized').
         *
         * @param {Object|String} err - unexpected error thrown by one of the policies in the policy chain
         * @param {Array} errors - the results of each executed policy
         * @param {Object} req - the request object
         * @param {Object} res - the response object
         * @param {Function} next - next middleware function
         */
        response: function(err, errors, req, res, next) {
            if (err) return next(err);

            var atLeastOneSuccessful = false;
            _.every(errors, function(error) {
                if (error === null) {
                    atLeastOneSuccessful = true;
                    return false;
                }
                return true;
            });

            if (atLeastOneSuccessful) {
                return next();
            }

            return next('Unauthorized');
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

    //Must.prototype.args = [];

    require('./lib/helpers')(Must, options);
    require('./lib/modifiers')(Must, options);
    require('./lib/factories')(Must, options);
    Must.prototype.response = options.response;
    
    return function() {
        return new Must();
    };
};