// define(['app-amd/constants', 'app-amd/init', 'app-amd/i18n!app-amd/nls/label'], function(constants, init, label) {
define(['app-amd/xhr', 'jquery'], function(xhr) {
    // xhr.req({
    //     // method: 'GET',
    //     method: 'POST',
    //     url: '/api/widgets',
    //     payload: { ping: 'pong' },
    //     callback: function(data) {
    //         console.dir(data);
    //     }
    // }).then(function(data) {
    //     console.log('Resolved');
    //     console.dir(data);
    // }, function(err) {
    //     console.log('Error');
    //     console.dir(err);
    // });
    // 
    // $.ajax('/api/widgets').success(function(data) {
    //     console.dir(data);
    // });
    //
    // $.ajax('/api/widgets').then(function(data) {
    //     console.log('Success');
    //     console.dir(data);
    // }, function(err) {
    //     console.log('Error');
    //     console.dir(err);
    // });

    function createPromise(willResolve, result, timeout) {
        var p = new Promise(function(res, rej) {
            setTimeout(function() {
                if(willResolve) {
                    res(result);
                }
                else {
                    rej(result);
                }
            }, timeout);
        });

        return p;
    }

    var
    p1 = createPromise(true, "a", 1000),
    p2 = createPromise(true, "b", 2000),
    p3 = createPromise(true, "c", 3000),
    p4 = createPromise(true, "d", 4000);

    var promises = [p1, p2, p3, p4];

    promises.forEach(function(v, x, a) {
        v.then((function(k, result) {
            console.log('promise ' + k + ' resolved');
        }).bind(null, x));
    })

    Promise.all(promises).then(function(result) {
        console.log('All Resolved');
        console.dir(result);
    });
});
