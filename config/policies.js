'use strict';

var must = require('../')({
        paths: {
            factories: '/api/factories',
            modifiers: '/api/modifiers'
        }
    }),
    build = must.build;

module.exports.policies = {
    userController: {
        approve: must.be.able.to('approve', 'users').build(),
        create: must.be.able.to('create', 'users').or.be.able.to('*', 'users').build(),
        destroy: must.be.able.to('destroy', 'users').build()
    }
};