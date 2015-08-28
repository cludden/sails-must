'use strict';

var _ = require('lodash'),
    moment = require('moment');

module.exports = {
    type: 'property',
    factory: function(options) {
        return function(req, res, next) {
            var keys = _.keys(options),
                birthday = req.body.user.birthday;

            function getItems(modifier) {
                var age = moment().diff(moment(birthday), options[modifier][1]),
                    quantity = options[modifier][0];

                return {
                    age: age,
                    quantity: quantity
                }
            }

            // if the atLeast modifier was used, ensure the user is old enough
            var items;
            if (keys.indexOf('atLeast') !== -1) {
                items = getItems('atLeast');
                if (items.age < items.quantity) {
                    return next('too young!');
                }
                return next();

                // otherwise, if the atMost modifier was used, ensure the user is young enough
            } else if (keys.indexOf('atMost') !== -1) {
                items = getItems('atMost');
                if (items.age > items.quantity) {
                    return next('too old!');
                }
                return next();

                // otherwise, ensure the user is the correct age
            } else {
                next('unauthorized');
            }
        }
    }
};