'use strict';

module.exports = {
    type: 'methodProperty',
    fn: function() {
        this.args = this.args.concat(Array.prototype.slice.call(arguments));
    },
    behavior: function() {
        this.options.modifiers.push('atMost');
    }
};