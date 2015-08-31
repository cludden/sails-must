'use strict';

var must = require('../')({
        helpers: ['to', 'of', 'at', 'a']
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