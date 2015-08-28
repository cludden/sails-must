'use strict';

module.exports = {
    type: 'methodProperty',
    fn: function() {
        this.options.atLeast = Array.prototype.slice.call(arguments);
    }
};