var extd = require("../lib/extended"),
    EventEmitter = require('events').EventEmitter;

var MockResponse = extd.declare(EventEmitter, {
    instance: {

        constructor: function (config) {
            this._super(arguments);
            extd.merge(this, config);
        },

        setEncoding: function () {

        },
        write: function () {

        },
        end: function () {
            // Request module checks against the connection object event emitter
            this.connection = this;
            this.pause = this.resume = {apply: function () {
            }};
            this.setEncoding = function () {
            };
            this.pipe = function (outputStream) {
                outputStream.write(this.data);
                outputStream.end();
            };
            this.statusCode = this.statusCode;
            this.headers = {};
            if (this.contentType) {
                this.headers['content-type'] = this.contentType;
            }
            this.emit('response', this);
            this.emit('data', this.data);
            this.emit('end');
            this.emit('close');
        }
    }

});

var MockHttp = extd.declare({
    instance: {
        constructor: function (assertOptions, assertBody, xmlData) {
            var testxml = "<?xml version=\"1.0\" ?><test>test</test>";
            this.assertOptions = assertOptions;
            this.assertBody = assertBody;
            this.xmlData = (xmlData ? xmlData : testxml);
        },
        requestCount: 0,
        request: function (options, cb) {
            this.requestCount++;
            var mockResponse = new MockResponse({statusCode: 200, data : this.xmlData, contentType: "xml", write: this.assertBody });
            cb(mockResponse);
            mockResponse.end();
            this.assertOptions(options);
            return mockResponse;
        }
    }
});

module.exports = MockHttp;