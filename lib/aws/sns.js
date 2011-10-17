var comb = require("comb"),
    BaseService = require("./baseService");

comb.define(BaseService, {

    instance : {

        _version : "2010-03-31",

        __host : "sns.us-east-1.amazonaws.com",

        __topicArn : null,

        addPermission : function(label, actions) {
            var ret = new comb.Promise();
            if (this.topicArn) {
                var query = {Action : "AddPermission", TopicArn : this.topicArn, label : label};
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
            } else {
                ret.errback("TopicArc required");
            }
            return ret;
        },

        removePermission : function(label) {
            var ret = new comb.Promise();
            if (this.topicArn) {
                if (label) {
                    var query = {Action : "RemovePermission", TopicArn : this.topicArn, label : label};
                    this.doRequest(query).then(comb.hitch(ret, "callback"), comb.hitch(ret, "errback"));
                } else {
                    ret.errback("Invalid query params.");
                }
            } else {
                ret.errback("TopicArc required");
            }
            return ret;
        },

        createTopic : function(name) {
            var ret = new comb.Promise();
            if (name) {
                var query = {Action : "CreateTopic", Name : name};
                this.doRequest(query).then(comb.hitch(this, function(res) {
                    var createTopicResult;
                    if ((createTopicResult = createTopicResponse.CreateTopicResult) != null) {
                        ret.callback(res.TopicArn, res);
                    } else {
                        ret.errback("Error", res);
                    }
                }), comb.hitch(ret, "errback"));
            } else {
                ret.errback("Invalid query params. name required");
            }
            return ret;
        },

        deleteTopic : function() {
            var ret = new comb.Promise();
            if (this.topicArn) {
                ret = this.doRequest({Action : "DeleteTopic", TopicArn: this.topicArn});
            } else {
                ret.errback("TopicArc required");
            }
            return ret;
        },

        getTopicAttributes : function() {
            var ret = new comb.Promise();
            if (this.topicArn) {
                this.doRequest({Action : "GetTopicAttributes", TopicArn: this.topicArn}).then(com.hitch(this, function(res) {
                    var getTopicResult, attributes, entry;
                    if ((getTopicResult = getTopicResponse.GetTopicAttributesResult) != null && (attributes = getTopicResult.Attributes) && (entry = attributes.entry) != null && comb.isArray(entry)) {
                        var ret = {};
                        entry.forEach(function(e) {
                            ret[e.key] = e.value;
                        });
                        ret.callback(ret, res);
                    } else {
                        ret.errback("Error", res);
                    }
                }), comb.hitch(ret, "errback"));
            } else {
                ret.errback("TopicArc required");
            }
            return ret;
        },

        publish : function(options) {
            var ret = new comb.Promise();
            if (this.topicArn) {
                if (comb.isObject(options) && !comb.isEmpty(options) && options.message) {
                    var query = comb.merge({Action : "Publish", TopicArn: this.topicArn}, this._tranformOptions(options));
                    this.doRequest(query).then(comb.hitch(this, function(res) {
                        var publishResult;
                        if ((publishResult = res.PublishResult) != null) {
                            ret.callback(publishResult.MessageId, res);
                        } else {
                            ret.errback("Error", res);
                        }
                    }), comb.hitch(ret, "errback"));
                } else {
                    ret.errback("Invalid query params, message required");
                }
            } else {
                ret.errback("TopicArc required");
            }
            return ret;
        },

        subscribe : function(options) {
            var ret = new comb.Promise();
            if (this.topicArn) {
                if (comb.isObject(options) && !comb.isEmpty(options) && options.endpoint && options.protocol) {
                    var query = comb.merge({Action : "Subscribe", TopicArn: this.topicArn}, this._tranformOptions(options));
                    this.doRequest(query).then(comb.hitch(this, function(res) {
                        var subscribeResult;
                        if ((subscribeResult = res.SubscribeResult) != null) {
                            ret.callback(subscribeResult.SubscriptionArn, res);
                        } else {
                            ret.errback("Error", res);
                        }
                    }), comb.hitch(ret, "errback"));
                } else {
                    ret.errback("Invalid query params, message required");
                }
            } else {
                ret.errback("TopicArc required");
            }
            return ret;
        },

        unSubscribe : function() {
            var ret = new comb.Promise();
            if (this.topicArn) {
                this.doRequest({Action : "Unsubscribe", SubscriptionArn: this.topicArn}).then(comb.hitch(ret, "callback"), comb.hitch(ret, "errback"));
            } else {
                ret.errback("TopicArc required");
            }
            return ret;
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
}).export(module);