requirejs.config({
    paths: {
        jquery: "../libs/jquery/dist/jquery"
    },

    shim: {
        jquery: {
            exports: '$'
        }
    },
});

requirejs([
    'jquery',
    'app-amd/uploader'
], function($, uploader) {
    console.log('Uploader Loaded...');

    uploader.init('uploader1');
    uploader.init('uploader2');
    uploader.init('uploader3');
    uploader.init('uploader4');
});
