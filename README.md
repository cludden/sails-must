# sails-must
a more flexible, more DRY, policy/middleware pattern for `sails.js` apps. Also, works with any `express.js` app.

## Purpose
A module that provides a way build complex and configurable middleware functions out of simple factories and modifiers. These middleware functions are perfect for `sails` apps, but they work just as good for traditional `express` apps.

## Install
```
npm install --save sails-must
```

If using with a `sails` app, install the hook as well:
```
npm install --save sails-hook-must
```

Then, disable the default `policy` hook:
```javascript
// in config/hooks.js

module.exports.hooks = {
    policies: false
};
```

## Background
First, let's remember what basic policies look like in a traditional `sails` app:
```javascript
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

```javascript
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

## Getting Started
What we need is a way to configure policies, a way to pass parameters to policies that determine their behavior. That's what this module provides! Take a look:

A sample policy configuration:

```javascript
// in config/policies.js

var must = require('sails-must')();

module.exports = {
    //..
    RabbitController: {
        nurture: must().be.a('rabbit').mother,
        feed: [must().be.nice.to('rabbits'), must().have('rabbit').food]
    },
    
    DogController: {
        nurture: must().be.a('dog').mother,
        feed: [must().be.nice.to('dogs'), must().have('dog').food]
    }
    //..
    
    //..
    SomeController: {
        someAction: must().be.able.to('read', 'someModel'),
        someOtherAction: must().be.able.to('write', 'someOtherModel').or.be.a.member.of('admins'),
        someComplexAction: must().be.able.to(['write', 'publish'], 'someDifferentModel')
    }
    //..
    
    //..
    ProjectController: {
        sales: must().be.a.member.of('sales').or.a.member.of('underwriting'),
        secret: must().not.be.a.member.of('hr')
    }
    //..
    
    //..
    MovieController: {
        adults: must().be.at.least(18, 'years').old,
        kids: must().be.at.most(17, 'years').old,
        teens: [must().be.at.least(13, 'years').old, must().be.at.most(19, 'years').old]
    }
    //..
};
```

In the above example, we've assumed you have installed the corresponding `sails-hook-must` module and disabled the default `policies` hook in your `config/hooks.js` file. This hook takes care of auto-building your policies for you. If not, you will need to manually build your policies via the `build` method like so:

```javascript
//..
MovieController: {
    adults: must().be.at.least(18, 'years').old.build(),
    kids: must().be.at.most(17, 'years').old.build(),
    teens: [must().be.at.least(13, 'years').old.build(), must().be.at.most(19, 'years').old.build()]
}
//..
```

## API
Each `must()` call creates a new policy provider, with access to all of your custom policy factories, helpers, and modifiers.

In the above example, the policy factories are:
- `mother`
- `nice`
- `food`
- `able`
- `member`
- `old`

The helpers are:
- `be` (this is the only helper provided by default)
- `a`
- `to`
- `have`
- `of`

The policy modifiers are:
- `or` (reserved modifier provided by default, see below for more info)
- `not` (also provided by default, see below for more info)
- `least`
- `most`

### Factories
A policy factory is simply a function that returns a valid `sails` policy (which is just an `express` middleware function). From the `express` docs:
>Middleware is a function with access to the request object (req), the response object (res), and the next middleware in the application’s request-response cycle, commonly denoted by a variable named next.
>
>Middleware can:
 Execute any code.
 Make changes to the request and the response objects.
 End the request-response cycle.
 Call the next middleware in the stack.
 
It receives an `options` argument as the first argument always, followed by whatever parameters you choose. The `options` argument contains a list of all of the modifiers used as well as any custom data provided by the modifiers.

Let's write our own policy factory, the `food` factory from the above example. This policy checks to see if the user has food for the provided type (`must().have('rabbit').food`). It assumes that the user has been authenticated and attached to the request at some other point, maybe with an **authenticated** policy using `passport`.

```javascript
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

Let's write another factory, this time the `old` factory from the example above. This factory will provide policies that check if the user is an appropriate age. We'll be able to use our factory like this:
```javascript
must().be(32, 'years').old
must().be(1000, 'months').old
must().be.at.least(18, 'years').old // using the 'least' modifier
must().be.at.most(65, 'years').old // using the 'most' modifier
```

Ok, the factory definition:
```javascript
// in api/policyFactories/old.js

var moment = require('moment'),
    _ = require('lodash');

module.exports = function(options, age, units) {
    return function(req, res, next) {
        var birthday = req.user.dateOfBirth, // lookup the user on the request and locate their date of birth
            userAge = moment().diff(moment(birthday), units); // convert their date of birth into an 'age' quantity in the appropriate units
        
        // define a map of modifier/test pairs
        var tests = {
            'atLeast': 'gte', // if the 'least' modifier was used, use the 'gte' comparison
            'atMost': 'lt', // if the 'most' modifier was used, use the 'lt' comparison
            'default': 'isEqual' // otherwise, we'll expect the user to the exact age
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

### Helpers
Helpers are simply chainable properties that return the same `must` policy provider. They exist to make your policy definitions easier to read. When called as a function, they are able to accept arguments that will be passed to your factories during the build phase. In the following example, `be` and `to` are helpers, while `able` is the factory:
`must().be.able.to('approve', 'users')`

In this example, `love` could be a modifier or a helper, `to` is a helper, and `eat` is a factory:
`must().love.to.eat('pizza')`

`be` is the only helper you get by default. But you can specify more like so:
```javascript
// in config/policies.js

var must = require('sails-must')({
    helpers: ['to', 'of', 'at', 'a', 'have', 'the']
});
```

### Modifiers
Modifiers allow you to tweak the behavior of a factory. In the example with the `MovieController`, `least` and `most` acted as modifiers, and each modified the behavior of the `old` policy. Modifiers can be one of three types, a `method`, `property`, or `methodProperty`, depending on how you intend to use the modifier. If the modifier will never need to accept arguments, use the `property` type. If the policy will always accept arguments, use the `method` type. If the policy will sometimes except arguments, use the `methodProperty` type.

A good example of a `property` modifier is the built-in `not` modifier. This modifier modifies the behavior of the corresponding factory by negating the outcome.
```javascript
must().love.to.eat('pizza').build() // if this one passes
must().not.love.to.eat('pizza').build() // this one will fail
```

The `not` modifier is shown below. It works by adding the 'not' modifier to the list of modifiers for the policy it was called with. `sails-must` looks for this modifier when executing policies, and if found, negates the outcome of that particular policy.
```javascript
module.exports = {
    type: 'property',
    fn: function() {
        this.options.modifiers.push('not');
    }
};
```

Let's write our first modifier, the `least` modifier. We will use the `method` type, meaning we will always call it as a function.
```javascript
must().be.at.least(17, 'years').old
must().be.at.least(6, 'feet').tall
```

The modifier will be responsible for performing two tasks:
- adding the 'atLeast' modifier to the list of modifiers
- passing any arguments it was called with to the factory function via the `this.args` array

the modifier definition:
```javascript
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
```javascript
must().like.to.eat('pizza')
must().like('pizza').for.breakfast
```

Anytime this modifier is used, we will add the 'like' modifier to the list. If it is used as a function, we will pass any arguments to the factory function.
```javascript
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

## Additional Info
### The *or* modifier
The `or` modifier, which is available by default, allows you to combine multiple policies into a single policy. During the build phase, the policies will be converted into a single parent policy that executes all child policies in parallel. If any of the policies return `next()`, the parent policy will return `next()`. When `or` is called, the current policy chain (factory, helpers, modifiers) is converted into a single policy object and added to a queue. When the `build()` method is called, the remaining policy chain is converted into a single policy object and added to the queue.
```javascript
// the first policy chain: .be.at.least(13, 'years').old
// the second policy chain: .at.least(5, 'feet').tall
must().be.at.least(13, 'years').old.or.at.least(5, 'feet').tall

```

### The *build* phase
The build method takes all policy objects in the queue and converts them into a single middleware function / sails policy. If you are using the `sails-hook-must` sibling module, you do **not** need to call `.build()` inside your policy config file, as the hook will take care of this for you. 

In the following example:
```javascript
must().be.at.least(13, 'years').old.build()
```

a single policy would be created by calling the `old` factory function with the following arguments:
```javascript
var policy = old({modifiers: ['atLeast']}, 13, 'years');
```

## Configuration
`sails-must` takes an optional `options` hash when it is first required
```javascript
var must = require('sails-must')({
    helpers: [] // an array of additional helpers to create
    paths: {
        factories: '/path/to/factories' // defaults to /api/policyFactories
        modifiers: '/path/to/modifiers' // defaults to /api/policyModifiers
    }
});
```

## Testing
`npm test`

## To Do
- [x] update docs
- [x] implement as `sails-hook` replacing the default `policy` hook and remove the need to call `.build()` on every policy

## Contributing
1. [Fork it](https://github.com/cludden/sails-must/fork)
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request

## License
Copyright (c) 2015 Chris Ludden.
Licensed under the [MIT license](LICENSE.md).