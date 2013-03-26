var extd = require("../extended"),
    BaseService = require("./baseService");

BaseService.extend({

    instance: {
        _providers: null,

        _version: "2011-08-01",

        __host: "webservices.amazon.com",

        __path: "/onca/xml",

        _query: null,

        constructor: function (config) {
            this._super(arguments);
            if (config.associateTag) {
                this._query = {};
                extd.merge(this._query, {"Operation": null,
                    "Service": "AWSECommerceService",
                    AssociateTag: config.associateTag,
                    "Region": "US"});
            } else {
                throw new Error("Must give an associateTag.");
            }
        },

        search: function (query) {
            this._query.Operation = "ItemSearch";
            this._query = extd.merge(this._query, query);
            return this.doRequest(this._query);
        },

        lookup: function (query) {
            this._query.Operation = "ItemLookup";
            this._query = extd.merge(this._query, query);
            return this.doRequest(this._query);
        }
    }
}).as(module);