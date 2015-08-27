module.exports = {
    type: 'methodProperty',
    fn: function() {
        this.args = this.args.concat(Array.prototype.slice.call(arguments));
        console.log(this.factoryName, this.args, this.build);
    },
    chainableFn: function() {}
};