'use strict';

module.exports = {
    type: 'methodProperty',
    fn: function() {
        this.options.atMost = Array.prototype.slice.call(arguments);
    }
};