'use strict';

var moment = require('moment'),
    _ = require('lodash');

module.exports = function(options, age, units) {
    return function(req, res, next) {
        var birthday = req.body.user.dateOfBirth,
            userAge = moment().diff(moment(birthday), units);

        // define a map of modifier/test pairs
        var tests = {
            'atLeast': 'gte',
            'atMost': 'lt',
            'default': 'isEqual'
        };

        // look through options.modifiers to see if a supported modifier was used
        var test = _.find(options.modifiers, function(modifier) {
            return ['atLeast', 'atMost'].indexOf(modifier) !== -1;
        });

        // determine which test fn to use
        var testFn = test && tests[test] ? tests[test] : tests['default'];

        // if the test fails, we prevent the user from accessing the endpoint
        if (!_[testFn](userAge, age)) {
            return next('Uh oh! You do not meet the age requirements!');
        }

        // otherwise, continue..
        next();
    }
};