var comb = require("comb"),
    format = comb.string.format,
    Logger = comb.logging.Logger,
    qs = require("querystring");
xml2js = require('xml2js'),
    crypto = require("crypto"),
    http = require("http"),
    https = require("https");

var hmacSha256 = function(key, toSign) {
    var hash = crypto.createHmac("sha256", key);
    return hash.update(toSign).digest("base64");
};


var LOGGER = Logger.getLogger("amazon-lib");
comb.define(null, {

    instance : {

        X_AMZN_AUTHORIZATION_FORMAT : "AWS3-HTTPS AWSAccessKeyId=%s, Algorithm=HmacSHA256, Signature=%s",

        awsAccessKeyId : null,

        awsSecretAccessKey : null,

        useSSL : true,

        signHeader : false,

        parse : null,

        __host : "",

        __path : "/",

        _version : "",

        constructor : function(args) {
            comb.merge(this, args || {});
            if (!this.awsAccessKeyId || !this.awsSecretAccessKey) {
                LOGGER.error("AWSAccessKeyId and AWSSecretAccessKey required");
                throw "AWSAccessKeyId and AWSSecretAccessKey required";
            } else {
                if (!this._version) {
                    LOGGER.error("Internal error");
                    throw "Internal error";
                }
            }
        },

        _tranformOptions : function(options) {
            var ret = {};
            for (var i in options) {
                var action = i.charAt(0).toUpperCase() + i.substr(1);
                ret[action] = options[i];
            }
            return ret;
        },

        doAction : function(options) {
            var ret = new comb.Promise();
            if (comb.isObject(options) && !comb.isEmpty(options) && options.action) {
                this.doRequest(this._tranformOptions(options)).then(comb.hitch(ret, "callback"), comb.hitch(ret, "errback"));
            } else {
                ret.errback("Inalid query params");
            }
            return ret;
        },


        _makeQuery : function(options) {
            var query = {};
            if (!this.signHeader) {
                query = comb.merge({
                    SignatureMethod : "HmacSHA256",
                    Version : this._version,
                    SignatureVersion : "2",
                    Timestamp : new Date().toISOString(),
                    AWSAccessKeyId : this.awsAccessKeyId
                }, options);
                query.Signature = this.__sign(query);
            }
            return query;
        },


        _makeHeaders : function(body, options) {
            var now = new Date().toUTCString();
            var ret = {
                Host: this.host,
                "content-type": "application/x-www-form-urlencoded; charset=utf-8",
                "content-length": body.length
            };
            if (this.signHeader) {
                comb.merge(ret, {
                    Date : now,
                    "x-amzn-authorization" : format(this.X_AMZN_AUTHORIZATION_FORMAT, this.awsAccessKeyId, hmacSha256(this.awsSecretAccessKey, now))
                });
            }
            return ret;

        },

        /*
         * Calculate HMAC signature of the query
         */
        __sign : function (query) {
            var sorted = {};
            Object.keys(query).sort().forEach(function(key) {
                sorted[key] = query[key]
            });
            var sign = ["POST", this.host, this.path, qs.stringify(sorted)].join("\n")
                .replace(/!/g, "%21")
                .replace(/'/g, "%27")
                .replace(/\*/g, "%2A")
                .replace(/\(/g, "%28")
                .replace(/\)/g, "%29");

            return hmacSha256(this.awsSecretAccessKey, sign);
        },

        __handleResponse : function(res) {
            var ret = new comb.Promise();
            var data = '';
            //the listener that handles the response chunks
            res.on('data', function (chunk) {
                data += chunk.toString()
            });
            res.on('end', comb.hitch(this, function() {
                try {
                    var parser = new xml2js.Parser();
                    parser.parseString(data, comb.hitch(this, function(err, data) {
                        if (err) {
                            ret.errback(err);
                        } else {
                            ret.callback(data);
                        }
                    }));
                } catch(e) {
                    ret.errback(e);
                }
            }));
            res.on("error", comb.hitch(ret, "errback"));
            return ret;
        },



        doRequest : function(options) {
            var ret = new comb.Promise();
            try {
                var query = this._makeQuery(options);
                var body = qs.stringify(query);
                var headers = this._makeHeaders(body, options);
                var reqOptions = {host: this.host,path: this.path, method: 'POST',headers: headers};
                var req = (this.useSSL ? https : http).request(reqOptions, comb.hitch(this, function (res) {
                    try {
                        if (res.statusCode == 200) {
                            this.__handleResponse(res).then(comb.hitch(ret, "callback"), comb.hitch(ret, "errback", "error"));
                        } else {
                            this.__handleResponse(res).then(comb.hitch(ret, "errback", "error"), comb.hitch(ret, "errback", "error"));
                        }
                    } catch(e) {
                        ret.errback(e);
                    }
                }));
                req.on("error", comb.hitch(this, function(e) {
                    LOGGER.error(e);
                    ret.errback("error", e);
                }));
                req.write(body);
                req.end();
            } catch(e) {
                ret.errback(e);
            }
            return ret;
        },

        getters : {
            host : function() {
                return this.__host;
            },

            path : function() {
                return this.__path;
            },
            version : function() {
                return this._version;
            }
        },

        setters : {
            host : function(host) {
                if ("" != host && host != null) {
                    this.__host = host;
                }
            },

            path : function(path) {
                if ("" != path && path != null) {
                    //just as a check to make use easier
                    path = path.charAt(0) == "/" ? path : "/" + path;
                    this.__path = path;
                }
            }
        }
    }
}).export(module);