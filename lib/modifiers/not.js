'use strict';

module.exports = {
    fn: function() {
        this.options.modifiers.push('not');
    },
    type: 'property'
};