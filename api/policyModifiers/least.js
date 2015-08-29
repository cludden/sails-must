'use strict';

module.exports = {
    type: 'methodProperty',
    fn: function() {
        this.options.modifiers.push('atLeast');
        this.args = this.args.concat(Array.prototype.slice.call(arguments));
    }
};