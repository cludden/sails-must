'use strict';

module.exports = {
    type: 'property',
    fn: function() {
        this._addToQueue.call(this);
        this._reset.call(this);
    }
};