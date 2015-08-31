'use strict';

var Sails = require('sails');
var sails;

before(function(done) {
    // Increase the Mocha timeout so that Sails has enough time to lift.
    this.timeout(10000);

    Sails.lift({
        // configuration for testing purposes
        log: {
            level: 'warn',
            noShip: true
        },
        hooks: {
            pubsub: false,
            grunt: false,
            views: false,
            policies: false
        }
    }, function(err, server) {
        sails = server;
        if (err) return done(err);
        done();
    });
});

after(function(done) {
    // here you can clear fixtures, etc.
    Sails.lower(done);
});

it('should not cause sails to crash', function() {
    return true;
});