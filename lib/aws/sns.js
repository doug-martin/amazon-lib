"use strict";
var extd = require("../extended"),
    BaseService = require("./baseService");

BaseService.extend({

    instance: {

        _version: "2010-03-31",

        __host: "sns.us-east-1.amazonaws.com",

        __topicArn: null,

        addPermission: function (label, actions) {
            if (this.topicArn) {
                var query = {Action: "AddPermission", TopicArn: this.topicArn, label: label};
                if (actions) {
                    if (extd.isArray(actions)) {
                        actions.forEach(function (opt, i) {
                            query["AWSAccountId." + (i + 1)] = opt.accountId;
                            query["ActionName." + (i + 1)] = opt.actionName;
                        });
                    } else if (extd.isObject(actions)) {
                        query["AWSAccountId.1"] = actions.accountId;
                        query["ActionName.1"] = actions.actionName;
                    }
                    return this.doRequest(query);
                } else {
                    return extd.reject(new Error("Invalid query params."));
                }
            } else {
                return extd.reject(new Error("TopicArc required"));
            }
        },

        removePermission: function (label) {
            if (this.topicArn) {
                if (label) {
                    var query = {Action: "RemovePermission", TopicArn: this.topicArn, label: label};
                    return this.doRequest(query);
                } else {
                    extd.reject(new Error("Invalid query params."));
                }
            } else {
                extd.reject(new Error("TopicArc required"));
            }
        },

        createTopic: function (name) {
            if (name) {
                var query = {Action: "CreateTopic", Name: name};
                return this.doRequest(query).then(function (res) {
                    var createTopicResult;
                    if ((createTopicResult = res.CreateTopicResult) != null) {
                        return res.CreateTopicResult.TopicArn[0];
                    } else {
                        throw new Error(res);
                    }
                });
            } else {
                return extd.reject(new Error("Invalid query params. name required"));
            }
        },

        deleteTopic: function () {
            if (this.topicArn) {
                return this.doRequest({Action: "DeleteTopic", TopicArn: this.topicArn});
            } else {
                return extd.reject(new Error("TopicArc required"));
            }
        },

        getTopicAttributes: function () {
            if (this.topicArn) {
                return this.doRequest({Action: "GetTopicAttributes", TopicArn: this.topicArn}).then(function (res) {
                    var getTopicResult, attributes, entry;
                    if ((getTopicResult = res.GetTopicAttributesResponse.GetTopicAttributesResult[0]) != null &&
                        (attributes = getTopicResult.Attributes[0]) && (entry = attributes.entry) != null &&
                        extd.isArray(entry)) {
                        var retValue = {};
                        entry.forEach(function (e) {
                            retValue[e.key[0]] = e.value[0];
                        });
                        return retValue;
                    } else {
                        throw new Error(res);
                    }
                });
            } else {
                return extd.reject(new Error("TopicArc required"));
            }
        },

        publish: function (options) {
            if (this.topicArn) {
                if (extd.isObject(options) && !extd.isEmpty(options) && options.message) {
                    var query = extd.merge({Action: "Publish", TopicArn: this.topicArn}, this._tranformOptions(options));
                    return this.doRequest(query).then(function (res) {
                        var publishResponse = res.PublishResponse, publishResult;
                        if (publishResponse != null && ((publishResult = publishResponse.PublishResult[0]) != null)) {
                            return publishResult.MessageId[0];
                        } else {
                            throw new Error(res);
                        }
                    });
                } else {
                    return extd.reject(new Error("Invalid query params, message required"));
                }
            } else {
                return extd.reject(new Error("TopicArc required"));
            }
        },

        subscribe: function (options) {
            if (this.topicArn) {
                if (extd.isObject(options) && !extd.isEmpty(options) && options.endpoint && options.protocol) {
                    var query = extd.merge({Action: "Subscribe", TopicArn: this.topicArn}, this._tranformOptions(options));
                    return this.doRequest(query).then(function (res) {
                        var subscribeResponse = res.SubscribeResponse;
                        if ((subscribeResponse = subscribeResponse.SubscribeResult[0]) != null) {
                            return subscribeResponse.SubscriptionArn[0];
                        } else {
                            throw new Error(res);
                        }
                    });
                } else {
                    return extd.reject(new Error("Invalid query params, protocol and endpoint required"));
                }
            } else {
                return extd.reject(new Error("TopicArc required"));
            }
        },

        unSubscribe: function () {
            if (this.topicArn) {
                return this.doRequest({Action: "Unsubscribe", SubscriptionArn: this.topicArn});
            } else {
                return extd.reject(new Error("TopicArc required"));
            }
        },


        getters: {
            topicArn: function () {
                return this.__topicArn;
            }
        },

        setters: {
            topicArn: function (topicArn) {
                if (topicArn !== "" && topicArn != null) {
                    this.__topicArn = topicArn;
                }
            }
        }
    }
}).as(module);