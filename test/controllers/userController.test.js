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
        it('should succeed if the user has the "create" ability', function(done) {
            request.post(url('create'))
                .send({
                    user: {
                        abilities: {
                            users: ['create']
                        }
                    }
                })
                .expect(200, done);
        });

        it('should succeed if the user has the "*" ability', function(done) {
            request.post(url('create'))
                .send({
                    user: {
                        abilities: {
                            users: ['*']
                        }
                    }
                })
                .expect(200, done);
        });

        it('should succeed if the user has both the "create" and the "*" ability', function(done) {
            request.post(url('create'))
                .send({
                    user: {
                        abilities: {
                            users: ['create', '*']
                        }
                    }
                })
                .expect(200, done);
        });

        it('should fail if the user does not have either the "create" or the "*" ability', function(done) {
            request.post(url('create'))
                .send({
                    user: {
                        abilities: {
                            users: ['approve']
                        }
                    }
                })
                .expect(403, done);
        });
    });

    describe('#admin()', function() {
        it('should succeed if the user has the "*" ability', function(done) {
            request.post(url('admin'))
                .send({
                    user: {
                        abilities: {
                            users: ['approve', '*']
                        },
                        groups: ['something group']
                    }
                })
                .expect(200, done);
        });

        it('should succeed if the user is a member of the "admins" group', function(done) {
            request.post(url('admin'))
                .send({
                    user: {
                        abilities: {
                            users: ['approve']
                        },
                        groups: ['admins']
                    }
                })
                .expect(200, done);
        });

        it('should succeed if the user has the "*" ability and is a member of the "admins" group', function(done) {
            request.post(url('admin'))
                .send({
                    user: {
                        abilities: {
                            users: ['*']
                        },
                        groups: ['admins']
                    }
                })
                .expect(200, done);
        });

        it('should fail if the user does not have the "*" ability and is not a member of the "admins" group', function(done) {
            request.post(url('admin'))
                .send({
                    user: {
                        abilities: {
                            users: ['approve']
                        },
                        groups: ['regular users']
                    }
                })
                .expect(403, done);
        });
    });

    describe('#adultsOnly()', function() {
        it('should fail if the user is not at least 18 years old', function(done) {
            request.post(url('adults'))
                .send({
                    user: {
                        birthday: '2000-01-01'
                    }
                })
                .expect(403, done);
        });

        it('should succeed if the user is at least 18 years old', function(done) {
            request.post(url('adults'))
                .send({
                    user: {
                        birthday: '1990-01-01'
                    }
                })
                .expect(200, done);
        });
    });

    describe('#kidsOnly()', function() {
        it('should succeed if the user is less than 18 years old', function(done) {
            request.post(url('kids'))
                .send({
                    user: {
                        birthday: '2000-01-01'
                    }
                })
                .expect(200, done);
        });

        it('should fail if the user is more than 18 years old', function(done) {
            request.post(url('kids'))
                .send({
                    user: {
                        birthday: '1990-01-01'
                    }
                })
                .expect(403, done);
        });
    });

    describe('#teensOnly()', function() {
        it('should fail if the user is less than 13 years old', function(done) {
            request.post(url('teens'))
                .send({
                    user: {
                        birthday: '2010-01-01'
                    }
                })
                .expect(403, done);
        });

        it('should fail if the user is more than 18 years old', function(done) {
            request.post(url('teens'))
                .send({
                    user: {
                        birthday: '1990-01-01'
                    }
                })
                .expect(403, done);
        });

        it('should succeed if the user is 15 years old', function(done) {
            request.post(url('teens'))
                .send({
                    user: {
                        birthday: '2000-01-01'
                    }
                })
                .expect(200, done);
        });
    });
});