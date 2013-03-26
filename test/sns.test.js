var it = require("it"),
    extd = require("../lib/extended"),
    assert = require("assert"),
    qs = require("querystring"),
    MockHttp = require("./mock_http"),
    aws = require('../lib/aws');

it.describe("Make a call to the amazon sns",function (it) {

    var mockHttp, mockHttps,
        requiredOptions = {
            associateTag: "associateTag",
            awsAccessKeyId: "awsAccessKeyId",
            awsSecretAccessKey: "awsSecretAccessKey",
            topicArn: "topicArn"
        },
        testSearchOptions = extd.merge({
            SearchIndex: "SearchIndex",
            Keyword: "Keyword"
        }, requiredOptions),
        testPublishOptions = extd.merge({
            message: "message"
        }, requiredOptions),
        testSubscribeOptions = extd.merge({
            protocol: "protocol",
            endpoint: "endpoint"
        }, requiredOptions);
    ;

    function createMockHttp(assertOptions, assertBody, xmlData) {
        mockHttp = new MockHttp(assertOptions, assertBody, xmlData);
        mockHttps = new MockHttp(assertOptions, assertBody, xmlData);
        mockHttp.requestCount = 0;
        mockHttps.requestCount = 0;
    }

    it.should("throw exception if parameters are missing", function () {
        assert.throws(function () {
            return new aws.SNSClient({http: mockHttp, https: mockHttps})
        }, Error);
    });

    it.should("add permission", function () {
        var assertOptions = function (options) {
            assert.equal(options.method, "POST");
        };
        var assertBody = function (body) {
            body = qs.parse(body);
            assert.equal(body.TopicArn, testSearchOptions.topicArn);
            assert.equal(body.Action, "AddPermission");
        };
        createMockHttp(assertOptions, assertBody);

        var snsClient = new aws.SNSClient(extd.merge(testSearchOptions, {http: mockHttp, https: mockHttps}));
        return snsClient.addPermission(testSearchOptions, {}).then(function (results) {
            assert.equal(results.test, "test");
            assert.equal(mockHttps.requestCount, 1);
        })
    });

    it.should("remove permission", function () {
        var assertOptions = function (options) {
            assert.equal(options.method, "POST");
        };
        var assertBody = function (body) {
            body = qs.parse(body);
            assert.equal(body.TopicArn, testSearchOptions.topicArn);
            assert.equal(body.Action, "RemovePermission");
        };
        createMockHttp(assertOptions, assertBody);

        var snsClient = new aws.SNSClient(extd.merge(testSearchOptions, {http: mockHttp, https: mockHttps}));
        return snsClient.removePermission(testSearchOptions).then(function (results) {
            assert.equal(results.test, "test");
            assert.equal(mockHttps.requestCount, 1);
        })
    }, console.log);

    it.should("create topic", function () {
        var assertOptions = function (options) {
            assert.equal(options.method, "POST");
        };
        var assertBody = function (body) {
            body = qs.parse(body);
            assert.equal(body.Action, "CreateTopic");
        };
        createMockHttp(assertOptions, assertBody, "<CreateTopicResult><TopicArn>test</TopicArn></CreateTopicResult><ResponseMetadata><RequestId>test</RequestId></ResponseMetadata>");

        var snsClient = new aws.SNSClient(extd.merge(testSearchOptions, {http: mockHttp, https: mockHttps}));
        return snsClient.createTopic(testSearchOptions).then(function (results) {
            assert.equal(results, "test");
            assert.equal(mockHttps.requestCount, 1);
        }, console.log)
    });

    it.should("delete topic", function () {
        var assertOptions = function (options) {
            assert.equal(options.method, "POST");
        };
        var assertBody = function (body) {
            body = qs.parse(body);
            assert.equal(body.Action, "DeleteTopic");
        };
        createMockHttp(assertOptions, assertBody, "<DeleteTopicResult><ResponseMetadata><RequestId>test</RequestId></ResponseMetadata></DeleteTopicResult>");

        var snsClient = new aws.SNSClient(extd.merge(testSearchOptions, {http: mockHttp, https: mockHttps}));
        return snsClient.deleteTopic(testSearchOptions).then(function () {
            assert.equal(mockHttps.requestCount, 1);
        }, console.log)
    });


    it.should("get topic attributes", function () {
        var assertOptions = function (options) {
            assert.equal(options.method, "POST");
        };
        var assertBody = function (body) {
            body = qs.parse(body);
            assert.equal(body.Action, "GetTopicAttributes");
        };
        createMockHttp(assertOptions, assertBody, '<GetTopicAttributesResponse xmlns=\"http://sns.amazonaws.com/doc/2010-03-31/\"><GetTopicAttributesResult><Attributes><entry><key>Owner</key><value>123456789012</value></entry><entry><key>Policy</key><value>{"Version":"2008-10-17","Id":"us-east-1/698519295917/test__default_policy_ID","Statement" : [{"Effect":"Allow","Sid":"us-east-1/698519295917/test__default_statement_ID","Principal" : {"AWS": "*"},"Action":["SNS:GetTopicAttributes","SNS:SetTopicAttributes","SNS:AddPermission","SNS:RemovePermission","SNS:DeleteTopic","SNS:Subscribe","SNS:ListSubscriptionsByTopic","SNS:Publish","SNS:Receive"],"Resource":"arn:aws:sns:us-east-1:698519295917:test","Condition" : {"StringLike" : {"AWS:SourceArn": "arn:aws:*:*:698519295917:*"}}}]}</value></entry><entry><key>TopicArn</key><value>arn:aws:sns:us-east-1:123456789012:My-Topic</value></entry></Attributes></GetTopicAttributesResult><ResponseMetadata><RequestId>057f074c-33a7-11df-9540-99d0768312d3</RequestId></ResponseMetadata></GetTopicAttributesResponse>');

        var snsClient = new aws.SNSClient(extd.merge(testSearchOptions, {http: mockHttp, https: mockHttps}));
        return snsClient.getTopicAttributes(testSearchOptions).then(function () {
            assert.equal(mockHttps.requestCount, 1);
        })
    });

    it.should("publish", function () {
        var assertOptions = function (options) {
            assert.equal(options.method, "POST");
        };
        var assertBody = function (body) {
            body = qs.parse(body);
            assert.equal(body.Action, "Publish");
        };
        createMockHttp(assertOptions, assertBody, '<PublishResponse xmlns=\"http://sns.amazonaws.com/doc/2010-03-31/\"><PublishResult><MessageId>94f20ce6-13c5-43a0-9a9e-ca52d816e90b</MessageId></PublishResult><ResponseMetadata><RequestId>f187a3c1-376f-11df-8963-01868b7c937a</RequestId></ResponseMetadata></PublishResponse>');

        var snsClient = new aws.SNSClient(extd.merge(testPublishOptions, {http: mockHttp, https: mockHttps}));
        return snsClient.publish(testPublishOptions).then(function (res) {
            assert.equal(res, '94f20ce6-13c5-43a0-9a9e-ca52d816e90b');
            assert.equal(mockHttps.requestCount, 1);
        })
    });

    it.should("subscribe", function () {
        var assertOptions = function (options) {
            assert.equal(options.method, "POST");
        };
        var assertBody = function (body) {
            body = qs.parse(body);
            assert.equal(body.Action, "Subscribe");
        };
        createMockHttp(assertOptions, assertBody, '<SubscribeResponse xmlns=\"http://sns.amazonaws.com/doc/2010-03-31/\"><SubscribeResult><SubscriptionArn>pending confirmation</SubscriptionArn></SubscribeResult><ResponseMetadata><RequestId>a169c740-3766-11df-8963-01868b7c937a</RequestId></ResponseMetadata></SubscribeResponse>');

        var snsClient = new aws.SNSClient(extd.merge(testSubscribeOptions, {http: mockHttp, https: mockHttps}));
        return snsClient.subscribe(testSubscribeOptions).then(function (res) {
            assert.equal(res, 'pending confirmation');
            assert.equal(mockHttps.requestCount, 1);
        })
    });

    it.should("unSubscribe", function () {
        var assertOptions = function (options) {
            assert.equal(options.method, "POST");
        };
        var assertBody = function (body) {
            body = qs.parse(body);
            assert.equal(body.Action, "Unsubscribe");
        };
        createMockHttp(assertOptions, assertBody, '<UnsubscribeResponse xmlns=\"http://sns.amazonaws.com/doc/2010-03-31/\"><ResponseMetadata><RequestId>18e0ac39-3776-11df-84c0-b93cc1666b84</RequestId></ResponseMetadata></UnsubscribeResponse>');

        var snsClient = new aws.SNSClient(extd.merge(testSearchOptions, {http: mockHttp, https: mockHttps}));
        return snsClient.unSubscribe(testSearchOptions).then(function () {
            assert.equal(mockHttps.requestCount, 1);
        })
    });
}).as(module);