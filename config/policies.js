'use strict';

var must = require('../');

module.exports.policies = {
    userController: [must.be.ableTo('approve', 'users').or.be]
};