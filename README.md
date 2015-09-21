# asti.js


JavaScript lib for ASTI (Asterisk Integration) project [https://github.com/antirek/asti]


## Usage



## API


#### new ASTI(params)

constructor

params:

url - asti url

return: ASTI object

`````javascript

var asti = new ASTI({url:'http://localhost:10000'});


`````



#### asti.setIdentity(params)

set identity for all request to asti

params: 

identity - identity string

return: this

`````javascript

asti.setIdentity({identity: 'vasya'}).connect()
.then(function () {
    //do on connect
})
.catch(function () {
    //do on error
});

`````



#### asti.connect()

Connect to ASTI server

no params

return: promise with then and catch functions

`````javascript

asti.setIdentity({identity: 'vasya'}).connect()
.then(function () {
    //do on connect
})
.catch(function () {
    //do on error
});

`````


### asti.agent


#### asti.agent.subscribe(params, handlers)

Subscribe on events by agent will be catched and pass to listeners

params: 

agent - agent of asterisk queues

handlers:

onAgentCalled - callback on AgentCalled

onAgentConnect - callback on AgentConnect

onAgentComplete - callback on AgentComplete

onAgentRingNoAnswer - callback on AgentRingNoAnswer

return: nothing


`````javascript

var handler = function (evt) {
    console.log(evt);
};

asti.agent.subscribe({
    agent: 'SIP/1000'
}, {
    onAgentCalled: handler,
    onAgentCalled: handler,
    onAgentComplete: handler,
    onAgentRingNoAnswer: handler
});

`````

#### asti.agent.unsubscribe(params)

params:

agent - agent of asterisk queues

return: nothing

`````javascript

asti.agent.unsubscribe({agent: 'SIP/1000'});

`````



### asti.queue


#### asti.queue.list()

get all queues from asterisk

no params

return: promise

`````javascript

asti.queue.list()
.then(function (queueList) {
    queueList.forEach(function (queue) {
        console.log('queue:', queue.queue);
    });
});

`````

attention: queue properties may be different by Asterisk version



#### asti.queue.members(params)

get members all (on empty params) or by queue

params:

queue - queue name  

return: promise

`````javascript

asti.queue.members(queue: '1234')
.then(function (memberList) {
    if (membersList.length > 0) {
        membersList.forEach(function (member) {
            console.log('member:', member.location);
        });
    }
});

`````

attention: member properties may be different by Asterisk version




#### asti.call(params, handlers)

originate call via asti

params: 

channel

exten

context

variable

tracking - tracking id for catch this call by http

handlers: 

onAnswer1Side

onAnswer2Side


return: promise


`````javascript

asti.call({
    channel: 'Local/6050@outbound1',
    context: 'outbound2',
    exten: '6000',
    tracking: 'y8375687346587'      
}, {
    onAnswer1Side: function (res) {
        alert('1 answer');
    },
    onAnswer2Side: function (res) {
        alert('2 answer');
    }
})
.then(function (response) {
    console.log(JSON.stringify(response));
});

`````
