'use strict';

module.exports = {
    type: 'property',
    fn: function() {
        this._addToQueue();
        this._reset();
    }
};