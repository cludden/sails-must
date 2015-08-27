'use strict';

module.exports = {
    approve: function(req, res) {
        res.ok('approved!');
    },

    create: function(req, res) {
        res.ok('created!');
    },

    destroy: function(req, res) {
        res.ok('destroyed!');
    }
};