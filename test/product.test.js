var it = require("it"),
    extd = require("../lib/extended"),
    assert = require("assert"),
    qs = require("querystring"),
    MockHttp = require("./mock_http"),
    aws = require('../lib/aws');


it.describe("Make a call to the amazon product advertising",function (it) {

    var mockHttp, mockHttps,
        requiredOptions = {
            associateTag: "associateTag",
            awsAccessKeyId: "awsAccessKeyId",
            awsSecretAccessKey: "awsSecretAccessKey"
        },
        testSearchOptions = extd.merge({
            SearchIndex: "SearchIndex",
            Keyword: "Keyword"
        }, requiredOptions),
        testLookupOptions = extd.merge({
            SearchIndex: "Books",
            IdItem: "ISBN",
            ItemId: "2314rwqer3"
        }, requiredOptions);

    function createMockHttp(assertOptions, assertBody) {
        mockHttp = new MockHttp(assertOptions, assertBody);
        mockHttps = new MockHttp(assertOptions, assertBody);
        mockHttp.requestCount = 0;
        mockHttps.requestCount = 0;
    }

    var assertOptions = function (options) {
        assert.equal(options.method, "POST");
        assert.equal(options.host,  "webservices.amazon.com");
        assert.equal(options.path, "/onca/xml");
    };

    it.should("throw exception if parameters are missing", function (next) {
        assert.throws(function () {
            return new aws.ProductAdvertising({http: mockHttp, https: mockHttps})
        }, Error);
        next()
    });

    it.should("query for products", function () {

        var assertBody = function (body) {
            body = qs.parse(body);
            assert.equal(body.SearchIndex, testSearchOptions.SearchIndex);
            assert.equal(body.Operation, "ItemSearch");
            assert.equal(body.AssociateTag, testSearchOptions.associateTag);
            assert.equal(body.Keyword, testSearchOptions.Keyword);
            assert.equal(body.SearchIndex, testSearchOptions.SearchIndex);
        };
        createMockHttp(assertOptions, assertBody);

        var productService = new aws.ProductAdvertising(extd.merge(testSearchOptions, {http: mockHttp, https: mockHttps}));
        return productService.search(testSearchOptions).then(function (results) {
            assert.equal(results.test, "test");
            assert.equal(mockHttps.requestCount, 1);
        })
    });

    it.should("lookup by item id", function () {
        var assertOptions = function (options) {
            assert.equal(options.method, "POST");
        };
        var assertBody = function (body) {
            body = qs.parse(body);
            assert.equal(body.SearchIndex, testLookupOptions.SearchIndex);
            assert.equal(body.Operation, "ItemLookup");
            assert.equal(body.AssociateTag, testLookupOptions.associateTag);
            assert.equal(body.IdItem, testLookupOptions.IdItem);
            assert.equal(body.ItemId, testLookupOptions.ItemId);
        };
        createMockHttp(assertOptions, assertBody);
        var productService = new aws.ProductAdvertising(extd.merge(testLookupOptions, {http: mockHttp, https: mockHttps}));
        return productService.lookup(testLookupOptions).then(function (results) {
            assert.equal(results.test, "test");
            assert.equal(mockHttps.requestCount, 1);
        })
    });
}).as(module);

