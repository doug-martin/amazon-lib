var comb = require("comb"),
    BaseService = require("./baseService");

comb.define(BaseService, {

    instance : {

        __queue : "",

        __host : "sqs.us-east-1.amazonaws.com",

        _version : "2009-02-01",

        constructor : function(options) {
            this.super(arguments);
        },

        listQueues : function(queueNamePrefix) {
            var opts = {Action : "ListQueues"};
            var ret = new comb.Promise();
            queueNamePrefix && (opts.QueueNamePrefix = queueNamePrefix);
            this.doRequest(opts).then(comb.hitch(this, function(result) {
                var res = result.ListQueuesResult;
                var urls = res.QueueUrl;
                if (!comb.isArray(urls)) {
                    urls = [urls];
                }
                ret.callback(urls, result)
            }), comb.hitch(ret, "errback"));
            return ret;
        },

        deleteQueue : function() {
            return this.doRequest({Action : "DeleteQueue"});
        },

        deleteMessage : function(receiptHandle) {
            var ret = new comb.Promise();
            if (receiptHandle) {
                var query = {Action : "DeleteMessage", ReceiptHandle : receiptHandle};
                this.doRequest(query).then(comb.hitch(ret, "callback"), comb.hitch(ret, "errback"));
            } else {
                ret.errback("Invalid query params.");
            }
            return ret;
        },

        receiveMessages : function(options) {
            var ret = new comb.Promise();
            var query = {Action : "ReceiveMessage"};
            if (comb.isObject(options) && !comb.isEmpty(options)) {
                comb.merge(query, this._tranformOptions(options));
            }
            var transformMessage = function(m) {
                return {
                    messageId : m.MessageId,
                    receiptHandle : m.ReceiptHandle,
                    md5OfBody : m.MD5OfBody, body : m.Body,
                    attributes : (m.Attribute || []).map(function(a) {
                        return {name : a.Name, value : a.value };
                    })
                };
            };
            this.doRequest(query).then(comb.hitch(this, function(res) {
                var receiveMessageResult, messages;
                if (res && (receiveMessageResult = res.ReceiveMessageResult) != null && (messages = receiveMessageResult.Message) != null) {
                    if (comb.isArray(messages)) {
                        ret.callback(messages.map(transformMessage), res);
                    } else if (comb.isObject(messages)) {
                        ret.callback([transformMessage(messages)]);
                    }
                } else {
                    ret.callback([], res);
                }
            }), comb.hitch(ret, "errback"));
            return ret;
        },

        addPermission : function(label, actions) {
            var ret = new comb.Promise();
            var query = {Action : "AddPermission",label : label};
            if (actions) {
                if (comb.isArray(actions)) {
                    actions.forEach(function(opt, i) {
                        query["AWSAccountId." + (i + 1)] = opt.accountId;
                        query["ActionName." + (i + 1)] = opt.actionName;
                    });
                } else if (comb.isObject(actions)) {
                    query["AWSAccountId.1"] = actions.accountId;
                    query["ActionName.1"] = actions.actionName;
                }
                this.doRequest(query).then(comb.hitch(ret, "callback"), comb.hitch(ret, "errback"));
            } else {
                ret.errback("Invalid query params.");
            }
            return ret;
        },

        removePermission : function(label) {
            var ret = new comb.Promise();
            if (label) {
                var query = {Action : "RemovePermission", label : label};
                this.doRequest(query).then(comb.hitch(ret, "callback"), comb.hitch(ret, "errback"));
            } else {
                ret.errback("Invalid query params.");
            }
            return ret;
        },

        sendMessage : function(messageBody) {
            var ret = new comb.Promise();
            if (messageBody) {
                var query = {Action:"SendMessage", MessageBody : messageBody};
                this.doRequest(query).then(comb.hitch(this, function(res) {
                    var result = res.SendMessageResult;
                    var r = {md5OfMessageBody : result.MD5OfMessageBody, result : result.MessageId};
                    ret.callback(r, res);
                }), comb.hitch(ret, "errback"));
            } else {
                ret.errback("Invalid query params.");
            }
            return ret;
        },

        changeMessageVisibility : function(receiptHandle, visibilityTimeout) {
            var ret = new comb.Promise();
            if (receiptHandle && !isNaN(visibilityTimeout)) {
                var query = {Action : "ChangeMessageVisibility", ReceiptHandle : receiptHandle, VisibilityTimeout : visibilityTimeout};
                this.doRequest(query).then(comb.hitch(ret, "callback"), comb.hitch(ret, "errback"));
            } else {
                ret.errback("Invalid query params.");
            }
            return ret;
        },

        getters : {
            version : function() {
                return this.__version;
            }
        },

        setters : {
            version : function() {
                return this.__version;
            }
        }
    }

}).export(module);