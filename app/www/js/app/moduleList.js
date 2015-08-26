define(function(require) {
    var modA = require("moduleA");
    var modB = require("moduleB");
    var modC = require("moduleC");

    var names = modA.getModuleName() + ', ' + modB.getModuleName() + ', ' + modC.getModuleName();

    return {
        getModuleNames: function() {
            return names;
        }
    };
})
