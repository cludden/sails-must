'use strict';

var _ = require('lodash');

module.exports = function(options, abilities, resource) {
    return function(req, res, next) {
        req._sails.services['auth'].can(req.options.authMetaData.payload.user.id, abilites, resource, next);
    }
};