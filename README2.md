# sails-must

### Purpose
a more flexible, more DRY, policy/middleware pattern for `sails.js` apps. Also, works with any `express.js` app


### Install
`npm install --save sails-must`

### Getting Started

First, let's remember what basic policies look like in a traditional `sails` app:

*/config/policies*
```
module.exports.policies = {
    SomeController: {
        '*': ['isLoggedIn'],
        'someAction': ['isLoggedIn', 'isAdmin']
    }
};
```

Not too bad. But what happens when we need to implement authorization based on a large number of roles, not just regular users and admins? We might end up with a ton of very similar policies:

*/config/policies*
```
module.exports.policies = {
    UserController: {
        '*': ['authenticated', 'isAdmin']    
    },
    
    ArticleController: {
        find: true,
        create: ['authenticated', 'isAuthor'],
        publish: ['authenticated', 'isEditor']
        remove: ['authenticated', 'isEditor']
    }
};
```


First we need to define some policy factories (for example, the 

*/config/policies*
```
module.exports.policies = {
    UserController: {
        '*': must().be.able.to('*', 'users').build(),
        'add': must().be.able.to('add', 'users').or.be.a.member.of('admins').build(),
        'destroy': must().be.able.to('destroy', 'users').or.be.a.member.of('admins').build()
    },
    
    GroupController: {
        '*': must().be.able.to('*', 'groups').or.be.a.member.of('admins').build(),
        'add': must().be.able.to('add', 'groups').or.be.a.member.of('admins').build()
    },
    
    MoviesController: {
        'adults': must().be.atLeast(18, 'years').old.build(),
        'kids': must().be.atMost(18, 'years').old.build(),
        'teens': [must().be.atLeast(13, 'years').old.build(), must().be.atMost(18, 'years').old.build()]
    },
    
    FoodController: {
        'pizza': must().love.to.eat('pizza').build()
        'bacon': must().love.to.eat('bacon').build()
    }
}
```

