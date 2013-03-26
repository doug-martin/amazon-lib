var it = require("it"),
    extd = require("../lib/extended"),
    assert = require("assert"),
    qs = require("querystring"),
    MockHttp = require("./mock_http"),
    aws = require('../lib/aws');

it.describe("Make a call to the amazon sqs",function (it) {

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

    function createMockHttp(assertOptions, assertBody, xmlData) {
        mockHttp = new MockHttp(assertOptions, assertBody, xmlData);
        mockHttps = new MockHttp(assertOptions, assertBody, xmlData);
        mockHttp.requestCount = 0;
        mockHttps.requestCount = 0;
    }

    it.should("throw exception if parameters are missing", function () {
        assert.throws(function () {
            return new aws.SQSClient({http: mockHttp, https: mockHttps})
        }, Error);
    });

    it.should("list queues", function () {
        var assertOptions = function (options) {
            assert.equal(options.method, "POST");
        };
        var assertBody = function (body) {
            body = qs.parse(body);
            assert.equal(body.Action, "ListQueues");
        };
        createMockHttp(assertOptions, assertBody, '<ListQueuesResponse><ListQueuesResult><QueueUrl>http://sqs.us-east-1.amazonaws.com/123456789012/testQueue</QueueUrl></ListQueuesResult><ResponseMetadata><RequestId>725275ae-0b9b-4762-b238-436d7c65a1ac</RequestId></ResponseMetadata></ListQueuesResponse>');

        var sqsClient = new aws.SQSClient(extd.merge(testSearchOptions, {http: mockHttp, https: mockHttps}));
        return sqsClient.listQueues(testSearchOptions).then(function (res) {
            assert.equal(res, 'http://sqs.us-east-1.amazonaws.com/123456789012/testQueue');
            assert.equal(mockHttps.requestCount, 1);
        })
    });

    it.should("delete queue", function () {
        var assertOptions = function (options) {
            assert.equal(options.method, "POST");
        };
        var assertBody = function (body) {
            body = qs.parse(body);
            assert.equal(body.Action, "DeleteQueue");
        };
        createMockHttp(assertOptions, assertBody, '<DeleteQueueResponse><ResponseMetadata><RequestId>6fde8d1e-52cd-4581-8cd9-c512f4c64223</RequestId></ResponseMetadata></DeleteQueueResponse>');

        var sqsClient = new aws.SQSClient(extd.merge(testSearchOptions, {http: mockHttp, https: mockHttps}));
        return sqsClient.deleteQueue(testSearchOptions).then(function () {
            assert.equal(mockHttps.requestCount, 1);
        })
    });

    it.should("deleteMessage", function () {
        var assertOptions = function (options) {
            assert.equal(options.method, "POST");
        };
        var assertBody = function (body) {
            body = qs.parse(body);
            assert.equal(body.Action, "DeleteMessage");
        };
        createMockHttp(assertOptions, assertBody, '<DeleteMessageResponse><ResponseMetadata><RequestId>b5293cb5-d306-4a17-9048-b263635abe42</RequestId></ResponseMetadata></DeleteMessageResponse>');

        var sqsClient = new aws.SQSClient(extd.merge(testSearchOptions, {http: mockHttp, https: mockHttps}));
        return sqsClient.deleteMessage(testSearchOptions).then(function () {
            assert.equal(mockHttps.requestCount, 1);
        })
    });

    it.should("receive messages", function () {
        var assertOptions = function (options) {
            assert.equal(options.method, "POST");
        };
        var assertBody = function (body) {
            body = qs.parse(body);
            assert.equal(body.Action, "ReceiveMessage");
        };
        createMockHttp(assertOptions, assertBody, '<ReceiveMessageResponse><ReceiveMessageResult><Message><MessageId>5fea7756-0ea4-451a-a703-a558b933e274</MessageId><ReceiptHandle>MbZj6wDWli+JvwwJaBV+3dcjk2YW2vA3+STFFljTM8tJJg6HRG6PYSasuWXPJB+CwLj1FjgXUv1uSj1gUPAWV66FU/WeR4mq2OKpEGYWbnLmpRCJVAyeMjeU5ZBdtcQ+QEauMZc8ZRv37sIW2iJKq3M9MFx1YvV11A2x/KSbkJ0=</ReceiptHandle><MD5OfBody>fafb00f5732ab283681e124bf8747ed1</MD5OfBody><Body>This is a test message</Body><Attribute><Name>SenderId</Name><Value>195004372649</Value></Attribute><Attribute><Name>SentTimestamp</Name><Value>1238099229000</Value></Attribute><Attribute><Name>ApproximateReceiveCount</Name><Value>5</Value></Attribute><Attribute><Name>ApproximateFirstReceiveTimestamp</Name><Value>1250700979248</Value></Attribute></Message></ReceiveMessageResult><ResponseMetadata><RequestId>b6633655-283d-45b4-aee4-4e84e0ae6afa</RequestId></ResponseMetadata></ReceiveMessageResponse>');

        var sqsClient = new aws.SQSClient(extd.merge(testSearchOptions, {http: mockHttp, https: mockHttps}));
        return sqsClient.receiveMessages(testSearchOptions).then(function () {
            assert.equal(mockHttps.requestCount, 1);
        },console.log)
    });

    it.should("add permission", function () {
        var assertOptions = function (options) {
            assert.equal(options.method, "POST");
        };
        var assertBody = function (body) {
            body = qs.parse(body);
            assert.equal(body.Action, "AddPermission");
        };
        createMockHttp(assertOptions, assertBody, '<AddPermissionResponse><ResponseMetadata><RequestId>9a285199-c8d6-47c2-bdb2-314cb47d599d</RequestId></ResponseMetadata></AddPermissionResponse>');

        var sqsClient = new aws.SQSClient(extd.merge(testSearchOptions, {http: mockHttp, https: mockHttps}));
        return sqsClient.addPermission(testSearchOptions, {accountId:"test", actionName: 'test'}).then(function () {
            assert.equal(mockHttps.requestCount, 1);
        },console.log)
    });

    it.should("remove permission", function () {
        var assertOptions = function (options) {
            assert.equal(options.method, "POST");
        };
        var assertBody = function (body) {
            body = qs.parse(body);
            assert.equal(body.Action, "RemovePermission");
        };
        createMockHttp(assertOptions, assertBody, '<RemovePermissionResponse><ResponseMetadata><RequestId>f8bdb362-6616-42c0-977a-ce9a8bcce3bb</RequestId></ResponseMetadata></RemovePermissionResponse>');

        var sqsClient = new aws.SQSClient(extd.merge(testSearchOptions, {http: mockHttp, https: mockHttps}));
        return sqsClient.removePermission(testSearchOptions).then(function () {
            assert.equal(mockHttps.requestCount, 1);
        },console.log)
    });

    it.should("send message", function () {
        var assertOptions = function (options) {
            assert.equal(options.method, "POST");
        };
        var assertBody = function (body) {
            body = qs.parse(body);
            assert.equal(body.Action, "SendMessage");
        };
        createMockHttp(assertOptions, assertBody, '<SendMessageResponse><SendMessageResult><MD5OfMessageBody>fafb00f5732ab283681e124bf8747ed1</MD5OfMessageBody><MessageId>5fea7756-0ea4-451a-a703-a558b933e274</MessageId></SendMessageResult><ResponseMetadata><RequestId>27daac76-34dd-47df-bd01-1f6e873584a0</RequestId></ResponseMetadata></SendMessageResponse>');

        var sqsClient = new aws.SQSClient(extd.merge(testSearchOptions, {http: mockHttp, https: mockHttps}));
        return sqsClient.sendMessage(testSearchOptions).then(function () {
            assert.equal(mockHttps.requestCount, 1);
        },console.log)
    });

    it.should("change message visibility", function () {
        var assertOptions = function (options) {
            assert.equal(options.method, "POST");
        };
        var assertBody = function (body) {
            body = qs.parse(body);
            assert.equal(body.Action, "ChangeMessageVisibility");
        };
        createMockHttp(assertOptions, assertBody, '<ChangeMessageVisibilityResponse><ResponseMetadata><RequestId>6a7a282a-d013-4a59-aba9-335b0fa48bed</RequestId></ResponseMetadata></ChangeMessageVisibilityResponse>');

        var sqsClient = new aws.SQSClient(extd.merge(testSearchOptions, {http: mockHttp, https: mockHttps}));
        return sqsClient.changeMessageVisibility(testSearchOptions, 1).then(function () {
            assert.equal(mockHttps.requestCount, 1);
        },console.log)
    });

}).as(module);