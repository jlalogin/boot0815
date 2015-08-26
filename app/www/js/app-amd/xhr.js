define(function() {
    return {
        req: function(conf) {
            var p = new Promise(function(resolve, reject) {
                var xhr = new XMLHttpRequest();

                xhr.onreadystatechange = function() {
                    if(xhr.readyState === 4 && xhr.status === 200) {
                        // conf.callback(JSON.parse(xhr.responseText));
                        var rt = JSON.parse(xhr.responseText);

                        if(rt.action == 'resolve') {
                            resolve(rt);
                        }
                        else if (rt.action == 'reject') {
                            reject(rt);
                        }
                        else {
                            resolve(rt);
                        }
                    }
                };

                var method = conf.method || 'GET';

                xhr.open(method, conf.url);

                switch(method) {
                    case 'GET':
                        xhr.send();

                        break;

                    case 'POST':
                        xhr.setRequestHeader("Content-type", "application/json");
                        xhr.send(JSON.stringify(conf.payload));

                        break;
                }
            });

            return p;
        }
    };
});
