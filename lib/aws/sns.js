var extd = require("../extended"),
    BaseService = require("./baseService");

BaseService.extend( {

    instance : {

        _version : "2010-03-31",

        __host : "sns.us-east-1.amazonaws.com",

        __topicArn : null,

        addPermission : function(label, actions) {
            if (this.topicArn) {
                var query = {Action : "AddPermission", TopicArn : this.topicArn, label : label};
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
            } else {
                throw Error("TopicArc required");
            }
        },

        removePermission : function(label) {
            if (this.topicArn) {
                if (label) {
                    var query = {Action : "RemovePermission", TopicArn : this.topicArn, label : label};
                    return this.doRequest(query);
                } else {
                    throw Error("Invalid query params.");
                }
            } else {
                throw Error("TopicArc required");
            }
        },

        createTopic : function(name) {
            var ret = new extd.Promise();
            if (name) {
                var query = {Action : "CreateTopic", Name : name};
                this.doRequest(query).then(function(res) {
                    var createTopicResult;
                    if ((createTopicResult = res.CreateTopicResult) != null) {
                        ret.callback(res.CreateTopicResult.TopicArn[0], res);
                    } else {
                        ret.errback("Error", res);
                    }
                }.bind(this), ret.errback.bind(this));
            } else {
                throw Error("Invalid query params. name required");
            }
            return ret;
        },

        deleteTopic : function() {
            if (this.topicArn) {
                return this.doRequest({Action : "DeleteTopic", TopicArn: this.topicArn});
            } else {
                throw Error("TopicArc required");
            }
        },

        getTopicAttributes : function() {
            var ret = new extd.Promise();
            if (this.topicArn) {
                this.doRequest({Action : "GetTopicAttributes", TopicArn: this.topicArn}).then(function(res) {
                    var getTopicResult, attributes, entry;
                    if ((getTopicResult = res.GetTopicAttributesResponse.GetTopicAttributesResult[0]) != null && (attributes = getTopicResult.Attributes[0]) && (entry = attributes.entry) != null && extd.isArray(entry)) {
                        var retValue = {};
                        entry.forEach(function(e) {
                            retValue[e.key[0]] = e.value[0];
                        });
                        ret.callback(retValue, res);
                    } else {
                        ret.errback("Error", res);
                    }
                }.bind(this), ret.errback.bind(this));
            } else {
                throw Error("TopicArc required");
            }
            return ret;
        },

        publish : function(options) {
            var ret = new extd.Promise();
            if (this.topicArn) {
                if (extd.isObject(options) && !extd.isEmpty(options) && options.message) {
                    var query = extd.merge({Action : "Publish", TopicArn: this.topicArn}, this._tranformOptions(options));
                    this.doRequest(query).then(function(res) {
                        var publishResponse = res.PublishResponse, publishResult;
                        if (publishResponse != null && ((publishResult = publishResponse.PublishResult[0]) != null)) {
                            ret.callback(publishResult.MessageId[0], res);
                        } else {
                            ret.errback("Error", res);
                        }
                    }.bind(this), ret.errback.bind(this));
                } else {
                    throw Error("Invalid query params, message required");
                }
            } else {
                throw Error("TopicArc required");
            }
            return ret;
        },

        subscribe : function(options) {
            var ret = new extd.Promise();
            if (this.topicArn) {
                if (extd.isObject(options) && !extd.isEmpty(options) && options.endpoint && options.protocol) {
                    var query = extd.merge({Action : "Subscribe", TopicArn: this.topicArn}, this._tranformOptions(options));
                    this.doRequest(query).then(function(res) {
                        var subscribeResponse = res.SubscribeResponse;
                        if ((subscribeResult = subscribeResponse.SubscribeResult[0]) != null) {
                            ret.callback(subscribeResult.SubscriptionArn[0], res);
                        } else {
                            ret.errback("Error", res);
                        }
                    }.bind(this), ret.errback.bind(this));
                } else {
                    throw Error("Invalid query params, protocol and endpoint required");
                }
            } else {
                throw Error("TopicArc required");
            }
            return ret;
        },

        unSubscribe : function() {
            if (this.topicArn) {
                return this.doRequest({Action : "Unsubscribe", SubscriptionArn: this.topicArn});
            } else {
                throw Error("TopicArc required");
            }
        },



        getters : {
            topicArn : function() {
                return this.__topicArn;
            }
        },

        setters : {
            topicArn : function(topicArn) {
                if (topicArn !== "" && topicArn != null) {
                    this.__topicArn = topicArn;
                }
            }
        }
    }
}).as(module);