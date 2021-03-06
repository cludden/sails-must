'use strict';

module.exports = function(options, group) {
    return function(req, res, next) {
        var userGroups = req.body.user.groups || [];

        if (userGroups.indexOf(group) === -1) {
            return next('unauthorized');
        }
        next();
    }
};
