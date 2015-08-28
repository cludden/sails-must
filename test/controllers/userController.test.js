'use strict';

var chai = require('chai');

describe('[controller] user', function() {
    var request, url;

    before(function() {
        url = function(endpoint) {
            return '/api/users/' + endpoint;
        };
        request = require('supertest').agent(sails.hooks.http.app);
    });

    describe('#approve()', function() {

        it('should fail if the user does not have the "approve" ability for the "users" resource', function(done) {
            request.post(url('approve'))
                .send({
                    user: {
                        abilities: {
                            users: ['create', 'destroy'],
                            groups: ['create', 'approve']
                        }
                    }
                })
                .expect(403, done);
        });

        it('should succeed if the user does have the "approve" ability for the "users" resource', function(done) {
            request.post(url('approve'))
                .send({
                    user: {
                        abilities: {
                            users: ['create', 'approve'],
                            groups: ['create', 'approve']
                        }
                    }
                })
                .expect(200, done);
        });
    });

    describe('#create()', function() {
        it('should succeed if the user has the "create" ability');
        it('should succeed if the user has the "*" ability');
        it('should succeed if the user has both the "create" and the "*" ability');
        it('should fail if the user does not have either the "create" or the "*" ability');
    });
});