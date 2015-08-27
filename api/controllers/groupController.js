'use strict';

module.exports = {
    add: function(req, res) {
        res.ok('added!');
    },

    create: function(req, res) {
        res.ok('created!');
    },

    destroy: function(req, res) {
        res.ok('destroyed!');
    }
};