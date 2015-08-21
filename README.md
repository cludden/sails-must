# sails-must

### Purpose
to provide a `provider` object on the `sails` global object that contains all of your predefined policy factories. What is a policy factory? A policy factory is a configurable function that returns a valid sails policy.



### Install
`npm install --save sails-hook-policy-provider`

### Getting Started
Ok, before we get too far ahead, let's see why policyFactories are so great! Let's pretend we want to have certain routes available to different food lovers. Maybe a section for bacon lovers, pizza lovers, etc. We could make a separate policy for each of these, which might look something like the following:

/api/policies/baconLover.js
```
module.exports = function(req, res, next) {
    // pretend we've attached the current user onto the request in an earlier policy
    req.user.populate('favoriteFoods').exec(function(err, user) {
        // restrict this endpoint to bacon lovers only
        if (user.favoriteFoods.indexOf('bacon') === -1) {
            return next('Only bacon lovers can view this section');            
        }
        // otherwise, all good
        next()
    });
}
```

/api/policies/pizzaLover.js
```
module.exports = function(req, res, next) {
    req.user.populate('favoriteFoods').exec(function(err, user) {
        // restrict this endpoint to pizza lovers only
        if (user.favoriteFoods.indexOf('pizza') === -1) {
            return next('Only pizza lovers can view this section');            
        }
        // otherwise, all good
        next()
    });
}
```

Not very flexible, or DRY for that matter. The same scenario could apply to an app that uses role-based access control and has numerous roles. Or our organization has many departments (accounting, finance, hr, it, procurement, etc) and we want to be able to apply policies based on our users' departments.

Policy factories to the rescue! Let's begin by making our first policyFactory, a `loveToEat` policyFactory!

/api/policyFactories/loveToEat.js
```
module.exports = function(food) {
    return function(req, res, next) {
        req.user.populate('favoriteFoods').exec(function(err, user) {
            // if the user doesn't like the given food, we prevent them from continuing
            if (user.favoriteFoods.indexOf(food) === -1) {
                return next('Only ' + food + ' lovers can view this endpoint');
            }
            // otherwise, all good!
            next();
        });
    }
}
```

we could apply this policy factory in our `/config/policies.js` file like so:
```
var must = require('sails-policy-provider')();
module.exports.policies = {
    baconController: {
        '*': ['authenticated', must.loveToEat('bacon')]
    },
    
    pizzaController: {
        '*': ['authenticated', must.loveToEat('pizza')]
    }
}
```

### API
The provider is configurable using an optional `options` argument passed to the constructor
```
var Must = require('sails-must'),
    must = Must({path: '/path/to/policy/factories/dir'});
```

The options hash currently accepts the following attributes:

`options.path` - the path to the root directory containing all of the policy factories relative to the current working directory (process.cwd()). Defaults to `/api/policyFactories`
`options.chainables` - an array of chainable method names. By default, you only get `be`

To see chainables in use, see below:
/api/policyFactories/eat.js (same as before, with simpler name)
```
module.exports = function(food) {
    return function(req, res, next) {
        req.user.populate('favoriteFoods').exec(function(err, user) {
            // if the user doesn't like the given food, we prevent them from continuing
            if (user.favoriteFoods.indexOf(food) === -1) {
                return next('Only ' + food + ' lovers can view this endpoint');
            }
            // otherwise, all good!
            next();
        });
    }
}
```

/config/policies.js
```
var Must = require('sails-must'),
    must = Must({chainables: ['love', 'to']});
    
module.exports.policies = {
    baconController: {
        '*': ['authenticated', must.love.to.eat('bacon')]
    },
    
    pizzaController: {
        '*': ['authenticated', must.love.to.eat('pizza')]
    }
}
``` 

### Testing
`npm test`