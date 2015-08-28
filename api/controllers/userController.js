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
    },

    admin: function(req, res) {
        res.ok('success!');
    },

    adultsOnly: function(req, res) {
        res.ok('success!');
    },

    kidsOnly: function(req, res) {
        res.ok('success!');
    },

    teensOnly: function(req, res) {
        res.ok('success!');
    }
};