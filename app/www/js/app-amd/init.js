define(['./constants'], function(constants) {
    console.log('init...');
    console.log('init...' + constants.url);

    return {
        doSomething: function() {
            console.log('do something');
        }
    };
});
