'use strict';

var async = require('async');

function Must() {
    this.name = 'Must';

    /**
     * The error message to send
     * 
     * @type {string}
     */
    this.message = 'Unauthorized';


    /**
     * The name of the current policy factory
     * 
     * @type {String}
     */
    this.factoryName;


    /**
     * The factory function
     * 
     * @type {Function}
     */
    this.factory;


    /**
     * The arguments to apply to the factory when it is built
     * 
     * @type {Array}
     */
    this.args = [];
    
    
    /**
     * The current options hash for the assertion being built
     * 
     * @type {{modifiers: Array}}
     */
    this.options = {
        modifiers: []
    };


    /**
     * The current queue of policy factories
     * 
     * @type {Array}
     */
    this.queue = [];


    /**
     * Reset the provider
     * 
     * @param {Boolean} [queue=false] - whether or not to flush the queue
     * @private
     */
    this._reset = function(queue) {
        queue = arguments.length ? queue : false;
        this.message = 'Unauthorized';
        this.options = {
            modifiers: []
        };
        if (queue) {
            this.queue = [];
        }
        this.args = [];
    };


    /**
     * Build a policy out of the current factory and factory settings and add it to the queue
     * 
     * @private
     */
    this._addToQueue = function() {
        if (this.factory) {
            var assertion = {
                name: this.factoryName,
                factory: this.factory,
                options: this.options,
                args: this.args
            };
            this.queue.push(assertion);
        }
    };


    /**
     * Convert the queue of policy factories into a single factory
     * 
     * @type {Function}
     */
    this.build = function() {
        var self = this;

        self._addToQueue();

        var policies = self.queue.map(function(assertion) {
            var args = [assertion.options].concat(assertion.args);
            return {
                fn: assertion.factory.apply(self, args),
                options: assertion.options
            };
        });

        self._reset(true);
        console.log();
        
        return function(req, res, next) {
            async.map(policies, function(policy, fn) {
                var callback = function(err) {
                    if (policy.options.modifiers.indexOf('not') !== -1) {
                        err = !err;
                    }
                    
                    if (err) {
                        return fn(null, false);
                    }
                    
                    fn(null, true);
                };
                
                policy.fn(req, res, callback);
            }, function(err, results) {
                if (err) return next(err);
                
                var atLeastOneSuccessful = false;
                _.every(results, function(result) {
                    if (result) {
                        atLeastOneSuccessful = true;
                        return false;
                    }
                    return true;
                });

                if (atLeastOneSuccessful) {
                    return next();
                }
                
                return res.forbidden(self.message || 'Unauthorized');
            });
        }
    };
}

module.exports = Must;