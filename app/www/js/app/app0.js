"use strict";

window.RunConfig = (function() {
    return {
        employee: false,
        account: false,
        props: false,
        uithread: true,
    };
})();

window.Intuit = (function() {
    var intuit = {};

    function inherits(parent, child) {
        child.prototype = Object.create(parent.prototype);
        child.prototype.constructor = child;
        child.prototype._super = parent;
    }

    function extend(superEntity, options) {
        var
            defaults = {},
            initialize = null;

        if(options) {
            if(options.defaults) {
                defaults = options.defaults;
                delete options.defaults;
            }

            if(options.initialize) {
                initialize = options.initialize;
                delete options.initialize;
            }
        }

        function Entity(options) {
            if(!options) {
                options = {};
            }

            for(var prop in defaults) {
                if(!options.hasOwnProperty(prop)) {
                    options[prop] = defaults[prop];
                }
            }

            Entity.prototype._super.call(this, options);

            initialize && initialize.call(this);
        }

        inherits(superEntity, Entity);

        for(var prop in options) {
            Entity.prototype[prop] = options[prop];
        }

        Entity.extend = function(options) {
            return extend(Entity, options);
        };

        return Entity;
    };

    // model
    function Model(options) {
        this.attributes = options || {};
    }

    inherits(Events, Model);

    Model.prototype.get = function(propName) {
        return this.attributes[propName];
    };

    Model.prototype.set = function(propName, propValue) {
        var eventData = {};

        eventData[propName] = {
            oldValue: this.attributes[propName],
            newValue: propValue
        };

        this.attributes[propName] = propValue;

        this.trigger("change", eventData);
    };

    Model.extend = function(options) {
        return extend(Model, options);
    };

    // collection
    function Collection(options) {
        this.models = (options && options.models) || [];
        options && (delete options.models);
    }

    inherits(Events, Collection);

    Collection.prototype.add = function(model) {
        this.models.push(model);
    };

    Collection.prototype.forEach = function(fn) {
        this.models.forEach(fn);
    }

    Collection.extend = function(options) {
        return extend(Collection, options);
    }

    // events
    function Events() {
    }

    Events.prototype.trigger = function(eventName, eventData) {
        if(this.events  && this.events[eventName]) {
            this.events[eventName].forEach(function(eventHandler) {
                eventHandler(eventData);
            });
        }
    };

    Events.prototype.on = function(eventName, eventHandler) {
        if(!this.events) {
            this.events = {};
        }

        if(!this.events[eventName]) {
            this.events[eventName] = [];
        }

        this.events[eventName].push(eventHandler);
    };

    // facade
    intuit.Model = Model;
    intuit.Collection = Collection;
    intuit.Events = Events;

    return intuit;
})();

// inline runner, employee demo
window.RunConfig.employee &&
(function() {
    var Person = Intuit.Model.extend({
        initialize: function() {
            this.set("addresses", []);
        },
        addAddress: function(street, city, state, zipCode) {
            this.get("addresses").push({
                street: street,
                city: city,
                state: state,
                zipCode: zipCode
            });
        },
        getFullName: function() {
            return this.get("firstName") + ", " + this.get("lastName");
        }
    });

    var p1 = new Person({
        firstName: "First",
        lastName: "Last"
    });

    var IntuitEmployee = Person.extend({
        defaults: {
            firstName: "John",
            lastName: "Doe",
            empId: "000",
            age: 0
        },
        getEmpInfo: function() {
            return this.get("empId") + ", " + this.get("firstName") + ", " + this.get("lastName");
        }
    })

    var ip1 = new IntuitEmployee({
        empId: "123",
        firstName: "Michael",
        lastName: "Jordan",
        age: 54
    });

    ip1.addAddress("1600 Pennsylvania Ave.", "Washington", "DC", "10000");

    console.dir(p1);
    console.dir(ip1);

    var ip2 = new IntuitEmployee({
        empId: "234",
        firstName: "Kenny",
        lastName: "Smith",
        age: 48
    });

    ip2.addAddress("123 Oak Lane", "Martha's Vineyard", "MA", "20000");

    // collection
    var IntuitEmployees = Intuit.Collection.extend({
        getMailingList: function() {
            this.forEach(function(emp) {
                var address = emp.get("addresses")[0];
                console.log(address.street + " " + address.city + " " + address.state + ", " + address.zipCode);
                console.log(emp.getEmpInfo());
            });
        }
    });

    var emps = new IntuitEmployees({ models: [ip1, ip2] });

    console.dir(emps);

    emps.getMailingList();

    // events
    ip1.on("change", function(data) {
        console.log("employee changed");
        console.dir(data);
    });

    ip1.set("age", 55);
})();

// inline runner, account demo
window.RunConfig.account &&
(function() {
    // base account type
    var Account = Intuit.Model.extend({
        defaults: {
            balance: 0,
            transactions: new Intuit.Collection()
        },

        // add transaction of type, amount
        addTransaction: function(data) {
            if(data.transaction_type == Account.TRANSACTION_TYPE_WITHDRAW) {
                var state = this.withdraw(data);

                if(state) {
                    this.get("transactions").add({
                        type: Account.TRANSACTION_TYPE_WITHDRAW,
                        balance: state.new_balance
                    });
                }

                return state;
            }
            else if (data.transaction_type == Account.TRANSACTION_TYPE_DEPOSIT) {
                var state = this.deposit(data);

                this.get("transactions").add({
                    type: Account.TRANSACTION_TYPE_DEPOSIT,
                    balance: state.new_balance
                });

                return state;
            }
            else {
                // poop
                throw new Error("unsupported transaction: " + data.transaction_type);
            }
        },

        // just add
        deposit: function(data) {
            this.set("balance", this.get("balance") + data.amount);

            return { new_balance: this.get("balance") };
        },

        // just subtract
        withdraw: function(data) {
            this.set("balance", this.get("balance") - data.amount);

            return { new_balance: this.get("balance") };
        },

        // current balance
        getBalance: function() {
            return this.get("balance");
        }
    });

    // statics
    Account.TRANSACTION_TYPE_WITHDRAW = 'withdraw';
    Account.TRANSACTION_TYPE_DEPOSIT = 'deposit';

    // checking acct type
    var CheckingAccount = Account.extend();

    // savings acct type
    var SavingsAccount = Account.extend({
        defaults: {
            withdrawals: 0
        },
        // savings specific withdrawals
        withdraw: function(data) {
            if(this.get("withdrawals") < SavingsAccount.TRANSACTION_WITHDRAWAL_LIMIT) {
                this.set("balance", this.get("balance") - data.amount);
                this.set("withdrawals", this.get("withdrawals") + 1);

                return { new_balance: this.get("balance"), total_withdrawals: this.get("withdrawals"), max_withdrawals: SavingsAccount.TRANSACTION_WITHDRAWAL_LIMIT };
            }
            else {
                // poop
                // throw new Error("too many withdrawals");
                this.trigger(SavingsAccount.EVT_MAX_WITHDRAWALS_EXCEEDED, {
                    balance: this.get("balance"),
                    withdrawals: this.get("withdrawals"),
                    max_withdrawals: SavingsAccount.TRANSACTION_WITHDRAWAL_LIMIT
                });
            }
        }
    });

    // arbitrary savings specific limit
    SavingsAccount.TRANSACTION_WITHDRAWAL_LIMIT = 6;

    SavingsAccount.EVT_MAX_WITHDRAWALS_EXCEEDED = 'err_mwe';

    // set up some objects
    var starting_balance = 100;
    var starting_withdrawals = 0;

    var chk_acct = new CheckingAccount({
        balance: starting_balance
    });

    var sav_acct = new SavingsAccount({
        withdrawals: starting_withdrawals,
        balance: starting_balance
    });

    console.dir(chk_acct);
    console.dir(sav_acct);

    sav_acct.on(SavingsAccount.EVT_MAX_WITHDRAWALS_EXCEEDED, function(evt_data) {
        console.log('Max Withdrawal Exceeded Event');
        console.dir(evt_data);
    });

    // run some methods
    var num_chk_transactions = 5;
    var num_sav_transactions = 5;

    for(var i=0; i<num_chk_transactions; i++) {
        chk_acct.addTransaction({transaction_type: Account.TRANSACTION_TYPE_DEPOSIT, amount: 1});
        chk_acct.addTransaction({transaction_type: Account.TRANSACTION_TYPE_WITHDRAW, amount: 1});
    }

    for(var i=0; i<num_sav_transactions; i++) {
        // sav_acct.addTransaction({transaction_type: Account.TRANSACTION_TYPE_DEPOSIT, amount: 1});
        sav_acct.addTransaction({transaction_type: Account.TRANSACTION_TYPE_WITHDRAW, amount: 1});
    }
})();

// property descriptors
window.RunConfig.props &&
(function() {
    var o = {};

    o.name = "John La";

    Object.defineProperty(o, "firstName", {
        __proto__: null,
        enumerable: false, // [false], allows for var in
        configurable: true, // [false], type can be changed for prop deleted
        // value: "John", // [undefined]
        // writable: true, // [false], changable with assignment operator
        set: function(value) {
            console.log('set:', value);

            this._firstName = value;
        },
        get: function() {
            console.log('get:', this._firstName);
            return this._firstName;
        }
    });

    o.firstName = 'John';

    console.dir(o);
})();

// uithread, digest loop, 2-ways data binding is an antipattern (its cpu intensive)
window.RunConfig.uithread &&
(function() {
    var fn1 = function() {
        setTimeout(function() {
            fn2();
        }, 0);
        console.log(1);
    };
    var fn2 = function() {
        console.log(2);
    };
    var fn3 = function() {
        console.log(3);
    };

    fn1();
    fn3();
})();
