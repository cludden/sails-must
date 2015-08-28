'use strict';

module.exports.routes = {
    'POST /api/users/create': 'userController.create',
    'POST /api/users/approve': 'userController.approve',
    'POST /api/users/destroy': 'userController.destroy',
    'POST /api/users/admin': 'userController.admin',
    'POST /api/users/adults': 'userController.adultsOnly',
    'POST /api/users/kids': 'userController.kidsOnly',
    'POST /api/users/teens': 'userController.teensOnly'
};