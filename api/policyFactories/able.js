'use strict';

var _ = require('lodash');


module.exports = function(options, abilities, resource) {
    return function(req, res, next) {
        abilities = _.isArray(abilities) ? abilities : [abilities];

        var userAbilities = req.body.user && req.body.user.abilities ? req.body.user.abilities : {};
        userAbilities = userAbilities[resource] || [];

        if (_.intersection(abilities, userAbilities).length < abilities.length) {
            return next('unauthorized');
        }
        next();
    }
};