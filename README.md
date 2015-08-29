# sails-must

### Purpose
a more flexible, more DRY, policy/middleware pattern for `sails.js` apps. Also, works with any `express.js` app.


### Install
`npm install --save sails-must`

### Background

First, let's remember what basic policies look like in a traditional `sails` app:
```
// in config/policies.js

    //..
    {
      ProfileController: {
          // Apply the 'isLoggedIn' policy to the 'edit' action of 'ProfileController'
          edit: 'isLoggedIn'
          // Apply the 'isAdmin' AND 'isLoggedIn' policies, in that order, to the 'create' action
          create: ['isAdmin', 'isLoggedIn']
      }
    }
    //..
```

Not too bad. Let's look at another example from the sails docs:

```
// in config/policies.js

  // ...
  RabbitController: {

    // Apply the `false` policy as the default for all of RabbitController's actions
    // (`false` prevents all access, which ensures that nothing bad happens to our rabbits)
    '*': false,

    // For the action `nurture`, apply the 'isRabbitMother' policy
    // (this overrides `false` above)
    nurture : 'isRabbitMother',

    // Apply the `isNiceToAnimals` AND `hasRabbitFood` policies
    // before letting any users feed our rabbits
    feed : ['isNiceToAnimals', 'hasRabbitFood']
  }
  // ...
```

This doesn't look too bad at first, but what happens when we add a DogController? And a CatController? And then our pet lovers app grows to include fish, hamsters, and komodo dragons.. now what? We might end up with a lot of policies that do very similar things (hasRabbitFood, hasDogFood, hasCatFood, hasFishFood, etc). This is not very flexible or DRY.

The same implications could apply for a site that uses role based access control and has numerous roles, or a site for an organization with numerous departments (Accounting, Finance, HR, IT, Sales, etc). We shouldn't have to write a thousand different policies to cover every possible scenario in our access control system.

### Getting Started
What we need is a way to configure policies, a way to pass parameters to policies that determine their behavior. That's what this module provides! Take a look:

A sample policy configuration:

```
// in config/policies.js

var must = require('sails-must')();

module.exports = {
    //..
    RabbitController: {
        nurture: must().be.a('rabbit').mother.build(),
        feed: [must().be.nice.to('rabbits').build(), must().have('rabbit').food.build()]
    },
    
    DogController: {
        nurture: must().be.a('dog').mother.build(),
        feed: [must().be.nice.to('dog').build(), must().have('dog').food.build()]
    }
    //..
    
    //..
    SomeController: {
        someAction: [must().be.able.to('read', 'someModel').build()],
        someOtherAction: [must().be.able.to(['read, 'write'], 'someOtherModel').or.be.a.member.of('admins').build()]
    }
    //..
    
    //..
    ProjectController: {
        sales: must().be.a.member.of('sales').or.a.member.of('underwriting').build(),
        secret: must().not.be.a.member.of('hr')
    }
    //..
    
    //..
    MovieController: {
        adults: must().be.at.least(18, 'years').old.build(),
        kids: must().be.at.most(17, 'years').old.build(),
        teens: [must().be.at.least(13, 'years').old.build(), must().be.at.most(19, 'years').old.build()]
    }
    //..
};
```

### API
Each `must()` call creates a new policy provider, with access to all of your custom policy factories, helpers, and modifiers.

In the above example, the policy factories are:
- mother
- nice
- food
- able
- member
- old

The helpers are:
- be (this is the only helper provided by default)
- a
- to
- have
- of

The policy modifiers are:
- not (this is the only modifier provided by default)
- least
- most

#### Factories
A policy factory is simply a function that returns a valid `sails` policy (which is just an `express` middleware function). From the `express` docs:
>Middleware is a function with access to the request object (req), the response object (res), and the next middleware in the application’s request-response cycle, commonly denoted by a variable named next.
 
 Middleware can:
 
 Execute any code.
 Make changes to the request and the response objects.
 End the request-response cycle.
 Call the next middleware in the stack.
 
It receives an `options` argument as the first argument always, followed by whatever parameters you choose. The `options` argument contains a list of all of the modifiers used as well as any custom data provided by the modifiers.

Let's write our own policy factory, the `food` factory from the above example. This policy checks to see if the user has food for the provided type (`must().have('rabbit').food.build()`). It assumes that he user has been authenticated and attached to the request at some other point, maybe with an **authenticated** policy using `passport`.

```
// in api/policyFactories/food.js

module.exports = function(options, for) {
    return function(req, res, next) {
        // get all of the different types of food the user has
        var foods = req.user.foods || [];
        
        // if the user doesn't have any food of the correct type, we prevent the user
        // from accessing the endpoint
        if (foods.indexOf(for) === -1) {
            return next('Uh oh! You do not have any food for ' + for + '!');        
        }
        
        // if the user does have the correct food type, continue on
        next();
    }
};
```

Let's write another factory, this time the `old` factory from the example above.
```
// in api/policyFactories/old.js

var moment = require('moment'),
    _ = require('lodash');

module.exports = function(options, age, units) {
    return function(req, res, next) {
        var birthday = req.user.dateOfBirth,
            userAge = moment().diff(moment(birthday), units);
        
        // define a map of modifier/test pairs
        var tests = {
            'atLeast': 'gte',
            'atMost': 'lt',
            'default': 'isEqual'
        };
        
        // look through options.modifiers to see if a supported modifier was used 
        var test = options.modifiers.find(function(modifier) {
            return ['atLeast', 'atMost'].indexOf(modifier) !== -1;
        });
        
        // determine which test fn to use
        var testFn = test && tests[test] ? tests[test] : tests['default'];
        
        // if the test fails, we prevent the user from accessing the endpoint
        if (!_[testFn](userAge, age)) {
            return next('Uh oh! You do not meet the age requirements!');       
        }
        
        // otherwise, continue..
        next();
    }
};
```

#### Helpers
Helpers are simply chainable properties that return the same `must` policy provider. They exist to make your policy definitions easier to read. When called as a function, they are able to accept arguments that will be passed to your factories during the build phase. In the following example, `be` and `to` are helpers, while `able` is the factory
`must().be.able.to('approve', 'users').build()`

In this example, `love` could be a modifier or a helper, `to` is a helper, and `eat` is a factory:
`must().love.to.eat('pizza').build()`

`be` is the only helper you get by default. But you can specify more like so:
```
// in config/policies.js

var must = require('sails-must')({
    helpers: ['to', 'of', 'at', 'a', 'have', 'the']
});
```

#### Modifiers
Modifiers allow you to tweak the behavior of a factory. In the example with the `MovieController`, `least` and `most` acted as modifiers, and each modified the behavior of the `old` policy. Modifiers can be one of three types, a `method`, `property`, or `methodProperty`, depending on how you intend to use the modifier. If the modifier will never need to accept arguments, use the `property` type. If the policy will always accept arguments, use the `method` type. If the policy will sometimes except arguments, use the `methodProperty` type.

A good example of a `property` modifier is the built in `not` modifier. This modifier modifies the behavior of the corresponding factory by negating the outcome.
```
must().love.to.eat('pizza').build() // if this one passes
must().not.love.to.eat('pizza').build() // this one will fail
```

The `not` modifier looks like this:
```
module.exports = {
    type: 'property',
    fn: function() {
        this.options.modifiers.push('not');
    }
};
```

Let's write our first modifier, the `least` modifier. We will use the `method` type, meaning we will always call it as a function.
```
must().be.at.least(17, 'years').old.build();
must().be.at.least(6, 'feet').tall.build();
```

the modifier definition:
```
// in api/policyModifiers/least.js

module.exports = {
    type: 'method',
    fn: function() {
        // add the 'atLeast' modifier to the list of modifiers
        this.options.modifiers.push('atLeast');
        // pass any arguments to the 'args' array, which will be passed to the
        // factory function when the policy is built
        this.args = this.args.concat(Array.prototype.slice.call(arguments));
    }
};
```

Now, let's try writing a `methodProperty` modifier. These modifiers contain a `fn` property that defines a function to be called when the modifier is used as a function, as well as an additional `behavior` property that contains a function that will be called when the modifier is used as a function OR a property.
```
must().like.to.eat('pizza').build();
must().like('pizza').for.breakfast.build();
```

the modifier definition:
```
// in api/policyModifiers/like.js

module.exports = {
    type: 'methodProperty',
    behavior: function() {
        // add the 'like' modifier to the list of modifiers
        this.options.modifiers.push('like');
    },
    fn: function() {
        // pass any arguments to the 'args' array, which will be passed to the
        // factory function when the policy is built
        this.args = this.args.concat(Array.prototype.slice.call(arguments));
    }
};
```

### Additional Info
#### The *or* modifier
The or modifier allows you to combine multiple policies into a single policy. During the build phase, the policies will be converted into a single parent policy that executes all child policies in parallel. If any of the policies return `next()`, the parent policy will return `next()`. When `or` is called, the current policy chain (factory, helpers, modifiers) is converted into a single policy object and added to a queue. When the `build()` method is called, the remaining policy chain is converted into a single policy object and added to the queue.
```
// the first policy chain: .be.at.least(13, 'years').old
// the second policy chain: .at.least(5, 'feet').tall
must().be.at.least(13, 'years').old.or.at.least(5, 'feet').tall.build();

```

#### The *build* phase
The build methods takes all policy objects in the queue and converts them into a single middleware function / sails policy.

In the following example:
```
must().be.at.least(13, 'years').old.build()
```

a single policy would be created by calling the `old` factory function with the following arguments:
```
var policy = old({modifiers: ['atLeast']}, 13, 'years');
```

### Configuration
`sails-must` takes an optional `options` hash when it is first required
```
var must = require('sails-must')({
    helpers: [] // an array of additional helpers to create
    paths: {
        factories: '/path/to/factories' // defaults to /api/policyFactories
        modifiers: '/path/to/modifiers' // defaults to /api/policyModifiers
    }
});
```

### Testing
`npm test`

### To Do
[ ] implement has `sails-hook` replacing the default `policy` hook and remove the need to call `.build()` on every policy

### Contributing
1. [Fork it](https://github.com/cludden/sails-must/fork)
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request

### License
Copyright (c) 2015 Chris Ludden
Licensed under the [MIT license](LICENSE.md).