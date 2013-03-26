var extd = require("../extended"),
    BaseService = require("./baseService");

BaseService.extend({

    instance : {

        __queue : "",

        __host : "sqs.us-east-1.amazonaws.com",

        _version : "2012-11-05",

        constructor : function(options) {
            this._super(arguments);
        },

        listQueues : function(queueNamePrefix) {
            var opts = {Action : "ListQueues"};
            var ret = new extd.Promise();
            queueNamePrefix && (opts.QueueNamePrefix = queueNamePrefix);
            this.doRequest(opts).then(function(result) {
                var res = result.ListQueuesResponse.ListQueuesResult[0];
                var urls = res.QueueUrl[0];
                if (!extd.isArray(urls)) {
                    urls = [urls];
                }
                ret.callback(urls, result)
            }.bind(this), ret.errback.bind(ret));
            return ret;
        },

        deleteQueue : function() {
            return this.doRequest({Action : "DeleteQueue"});
        },

        deleteMessage : function(receiptHandle) {
            if (receiptHandle) {
                var query = {Action : "DeleteMessage", ReceiptHandle : receiptHandle};
                return this.doRequest(query);
            } else {
                throw Error("Invalid query params.");
            }
        },

        receiveMessages : function(options) {
            var ret = new extd.Promise();
            var query = {Action : "ReceiveMessage"};
            if (extd.isObject(options) && !extd.isEmpty(options)) {
                extd.merge(query, this._tranformOptions(options));
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
            this.doRequest(query).then(function(res) {
                var receiveMessageResult, messages;
                if (res && (receiveMessageResult = res.ReceiveMessageResult) != null && (messages = receiveMessageResult.Message) != null) {
                    if (extd.isArray(messages)) {
                        ret.callback(messages.map(transformMessage), res);
                    } else if (extd.isObject(messages)) {
                        ret.callback([transformMessage(messages)]);
                    }
                } else {
                    ret.callback([], res);
                }
            }.bind(this), ret.errback.bind(ret));
            return ret;
        },

        addPermission : function(label, actions) {
            var query = {Action : "AddPermission",label : label};
            if (actions) {
                if (extd.isArray(actions)) {
                    actions.forEach(function(opt, i) {
                        query["AWSAccountId." + (i + 1)] = opt.accountId;
                        query["ActionName." + (i + 1)] = opt.actionName;
                    });
                } else if (extd.isObject(actions)) {
                    query["AWSAccountId.1"] = actions.accountId;
                    query["ActionName.1"] = actions.actionName;
                }
                return this.doRequest(query);
            } else {
                throw Error("Invalid query params.");
            }
        },

        removePermission : function(label) {
            if (label) {
                var query = {Action : "RemovePermission", label : label};
                return this.doRequest(query);
            } else {
                throw Error("Invalid query params.");
            }
        },

        sendMessage : function(messageBody) {
            var ret = new extd.Promise();
            if (messageBody) {
                var query = {Action:"SendMessage", MessageBody : messageBody};
                this.doRequest(query).then(function(res) {
                    var result = res.SendMessageResponse.SendMessageResult[0];
                    var r = {md5OfMessageBody : result.MD5OfMessageBody[0], result : result.MessageId[0]};
                    ret.callback(r, res);
                }.bind(this), ret.errback.bind(ret));
            } else {
                throw Error("Invalid query params.");
            }
            return ret;
        },

        changeMessageVisibility : function(receiptHandle, visibilityTimeout) {
            if (receiptHandle && !isNaN(visibilityTimeout)) {
                var query = {Action : "ChangeMessageVisibility", ReceiptHandle : receiptHandle, VisibilityTimeout : visibilityTimeout};
                return this.doRequest(query);
            } else {
                throw Error("Invalid query params.");
            }
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

}).as(module);