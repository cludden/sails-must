'use strict';

var must = require('../')({
        chainables: ['a'],
        paths: {
            factories: '/api/factories',
            modifiers: '/api/modifiers'
        }
    });

module.exports.policies = {
    userController: {
        approve: must().be.able.to('approve', 'users').build(),
        create: must().be.able.to('create', 'users').or.be.able.to('*', 'users').build(),
        destroy: must().be.able.to('destroy', 'users').build(),
        admin: must().be.able.to('*', 'users').or.be.a.member.of('admins').build()
    }
};