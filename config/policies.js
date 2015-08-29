'use strict';

var must = require('../')({
        helpers: ['to', 'of', 'at', 'a']
    });

module.exports.policies = {
    userController: {
        approve: must().be.able.to('approve', 'users').build(),
        create: must().be.able.to('create', 'users').or.be.able.to('*', 'users').build(),
        destroy: must().be.able.to('destroy', 'users').build(),
        admin: must().be.able.to('*', 'users').or.be.a.member.of('admins').build(),
        adultsOnly: must().be.at.least(18, 'years').old.build(),
        kidsOnly: must().be.at.most(18, 'years').old.build(),
        teensOnly: [must().be.at.least(13, 'years').old.build(), must().be.at.most(18, 'years').old.build()]
    }
};