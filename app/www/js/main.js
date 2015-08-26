requirejs.config({
    paths: {
        jquery: "../libs/jquery/dist/jquery"
    },

    config: {
        "app-amd/i18n": {
            locale: 'fr-fr'
        }
    },

    shim: {
        jquery: {
            exports: '$'
        }
    },
});

requirejs([
    'jquery',
    'app-amd/app'
]);
