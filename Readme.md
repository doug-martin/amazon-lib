#Amazon lib

##Overview

Plug-able AWS client with support for

  * SQS(Simple Queue Service)
  * SNS (Simple Notificaton Service)
Can easily be extended and extensions are welcome.

##Why this library?

This library leverages Promises to allow for flow control as well as full error catching, and propogation(Now you have to handle them :) ). Its extensible.

## Installation

    npm install amazon-lib

##Usage

###SQS

Available operations, SEE API for options and description of params

   * listQueues
      * Lists all queues.
   * deleteQueue
       * After this has been called and the promise is called back this client should not be used for any queue specific operations, NOTE: this method requires a queue path.
   * deleteMessage(receiptHandle)
   * receiveMessages(/*Object*/options)
       * see the SQS api for options, you can lowercase the first letter of each option.
   * addPermission(/\*String\*/label, /\*Array|Object\*//\*{accountId : <accountId>, actionName : <actionName>}\*/actions)
      * See the SQS API for action names.
   * removePermission(label)
   * sendMessage(messageBody)
   * changeMessageVisibility(receiptHandle, visibilityTimeout)
   * doAction(/*Object*/options)
      * Performes the action specified by options.Action, and params required should also be included in the object. This method should be used for any missing API operations.

WIthout queue

```js

var aws = require('amazon-lib'),
      url = require('url'),

var sqsClient = new aws.SQSClient({
     awsAccessKeyId: '<Your key>',
     awsSecretAccessKey: '<Your Secret>'
});

//just list the queues
sqsClient.listQueues().then(function(queues){
     queues.forEach(function(q){
             console.log(q);
     });
});


//with a prefix
sqsClient.listQueues("test-queue").then(function(queues){
     queues.forEach(function(q){
             console.log(q);
     });
});

//Find a queue by name and use it
sqsClient.listQueues("test-queue").then(function(queues){
     var queuePath;
     for (var i = 0, l = urls.length; i < l; i++) {
          var urlObj = url.parse(urls[i]);
          var pathName = urlObj.pathname;
         if (pathName && pathName.match(/test\-name$/)) {
             queuePath = pathName;
             break;
         }
     }
     if (queuePath) {
         sqsClient.path = queuePath;
     }
});

sqsClient.receiveMessages({maxNumberOfMessages : 3, visibilityTimeout:(1000*60)*2}).then(function(messages){//do something ....}

```
###SNS

Avaiable operations. See SNS API for description of parameters

   * addPermission(label, actions)
   * removePermission(label)
   * createTopic(name)
   * deleteTopic()
   * getTopicAttributes()
   * publish(options)
   * subscribe(options)
   * unSubscribe()

```js
var snsClient = new aws.SNSClient({
     awsAccessKeyId: '<Your key>',
     awsSecretAccessKey: '<Your Secret>'
     topicArn : '<Topic Arn>'
});

snsClient.publish({
                subject : "HELLO",
                message : "WORLD!"
});

```

##License

(The MIT License)

Copyright (c) 2011 Doug Martin &lt;doug@dougamartin.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


##Meta

* Code: `git clone git://github.com/doug-martin/amazon-lib.git`
