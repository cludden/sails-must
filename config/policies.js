'use strict';

var _ = require('lodash'),
    must = require('../')({
        helpers: ['to', 'of', 'at', 'a'],
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

            if (atLeastOneSuccessful) return next();
            res.forbidden('Unauthorized');
        }
    });

module.exports.policies = {
    userController: {
        approve: must().be.able.to('approve', 'users'),

        create: must().be.able.to('create', 'users').or.be.able.to('*', 'users'),

        destroy: must().be.able.to('destroy', 'users'),

        admin: must().be.able.to('*', 'users').or.be.a.member.of('admins'),

        adultsOnly: must().be.at.least(18, 'years').old,

        kidsOnly: must().be.at.most(18, 'years').old,

        teensOnly: [must().be.at.least(13, 'years').old, must().be.at.most(18, 'years').old]
    }
};