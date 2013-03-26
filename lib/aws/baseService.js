var extd = require("../extended"),
    format = extd.format,
    qs = require("querystring"),
    xml2js = require('xml2js'),
    crypto = require("crypto"),
    http = require("http"),
    https = require("https");

var hmacSha256 = function (key, toSign) {
    var hash = crypto.createHmac("sha256", key);
    return hash.update(toSign).digest("base64");
};

extd.declare({

    instance: {

        X_AMZN_AUTHORIZATION_FORMAT: "AWS3-HTTPS AWSAccessKeyId=%s, Algorithm=HmacSHA256, Signature=%s",

        awsAccessKeyId: null,

        awsSecretAccessKey: null,

        useSSL: true,

        signHeader: false,

        parse: null,

        __host: "",

        __path: "/",

        _version: "",

        constructor: function (args) {
            extd.merge(this, args || {});
            if (!this.http) {
                this.http = http;
            }
            if (!this.https) {
                this.https = https;
            }
            if (!this.awsAccessKeyId || !this.awsSecretAccessKey) {
                throw new Error("AWSAccessKeyId and AWSSecretAccessKey required");
            } else {
                if (!this._version) {
                    throw new Error("Missing version");
                }
            }
        },

        _tranformOptions: function (options) {
            var ret = {};
            for (var i in options) {
                var action = i.charAt(0).toUpperCase() + i.substr(1);
                ret[action] = options[i];
            }
            return ret;
        },

        doAction: function (options) {
            if (extd.isObject(options) && !extd.isEmpty(options) && options.action) {
                return  this.doRequest(this._tranformOptions(options));
            } else {
                return extd.reject(new Error("Inalid query params"));
            }
        },


        _makeQuery: function (options) {
            var query = {};
            if (!this.signHeader) {
                query = extd.merge({
                    SignatureMethod: "HmacSHA256",
                    Version: this._version,
                    SignatureVersion: "2",
                    Timestamp: new Date().toISOString(),
                    AWSAccessKeyId: this.awsAccessKeyId
                }, options);
                query.Signature = this.__sign(query);
            }
            return query;
        },


        _makeHeaders: function (body) {
            var now = new Date().toUTCString();
            var ret = {
                Host: this.host,
                "content-type": "application/x-www-form-urlencoded; charset=utf-8",
                "content-length": body.length
            };
            if (this.signHeader) {
                extd.merge(ret, {
                    Date: now,
                    "x-amzn-authorization": format(this.X_AMZN_AUTHORIZATION_FORMAT, this.awsAccessKeyId, hmacSha256(this.awsSecretAccessKey, now))
                });
            }
            return ret;

        },

        /*
         * Calculate HMAC signature of the query
         */
        __sign: function (query) {
            var sorted = {};
            Object.keys(query).sort().forEach(function (key) {
                sorted[key] = query[key];
            });
            var sign = ["POST", this.host, this.path, qs.stringify(sorted)].join("\n")
                .replace(/!/g, "%21")
                .replace(/'/g, "%27")
                .replace(/\*/g, "%2A")
                .replace(/\(/g, "%28")
                .replace(/\)/g, "%29");

            return hmacSha256(this.awsSecretAccessKey, sign);
        },

        __handleResponse: function (res) {
            var ret = new extd.Promise();
            var data = '';
            //the listener that handles the response chunks
            res.on('data', function (chunk) {
                data += chunk.toString();
            });
            res.on('end', function () {
                var parser = new xml2js.Parser();
                parser.parseString(data, function (err, data) {
                    if (err) {
                        ret.errback(err);
                    } else {
                        ret.callback(data);
                    }
                }.bind(this));
            }.bind(this));
            res.on("error", ret.errback);
            return ret;
        },


        doRequest: function (options) {
            var ret = new extd.Promise();
            try {
                var query = this._makeQuery(options);
                var body = qs.stringify(query);
                var headers = this._makeHeaders(body, options);
                var reqOptions = {host: this.__host, path: this.__path, method: 'POST', headers: headers};
                var req = (this.useSSL ? this.https : this.http).request(reqOptions, function (res) {
                    if (res.statusCode === 200) {
                        this.__handleResponse(res).then(ret.callback, ret.errback);
                    } else {
                        this.__handleResponse(res).both(ret.errback);
                    }
                }.bind(this));
                req.on("error", function (e) {
                    ret.errback(e);
                }.bind(this));
                req.write(body);
                req.end();
            } catch (e) {
                ret.errback(e);
            }
            return ret;
        },

        getters: {
            host: function () {
                return this.__host;
            },

            path: function () {
                return this.__path;
            },
            version: function () {
                return this._version;
            }
        },

        setters: {
            host: function (host) {
                if ("" !== host && host != null) {
                    this.__host = host;
                }
            },

            path: function (path) {
                if ("" !== path && path != null) {
                    //just as a check to make use easier
                    path = path.charAt(0) === "/" ? path : "/" + path;
                    this.__path = path;
                }
            }
        }
    }
}).as(module);
