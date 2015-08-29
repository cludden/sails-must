'use strict';

module.exports = {
    type: 'property',
    fn: function() {
        this.options.modifiers.push('not');
    }
};