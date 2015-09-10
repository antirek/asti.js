# asti.js


JavaScript lib for asti project [https://github.com/antirek/asti]

Asterisk Integration


## Usage




## API


### new ASTI(params)

params:

url - asti url

return ASTI object

`````javascript

var asti = new ASTI({url:'http://localhost:10000'});


`````


### asti.connect()

no params

return promise with then and catch functions

`````javascript

asti.connect()
.then(function () {
    //do on connect
})
.catch(function () {
    //do on error
});

`````


### asti.agent


#### asti.agent.subscribe(params)

params: 

agent - agent of asterisk queues. Events by agent will be catched and pass to listeners

onAgentCalled - callback on AgentCalled

onAgentConnect - callback on AgentConnect

onAgentComplete - callback on AgentComplete

onAgentRingNoAnswer - callback on AgentRingNoAnswer


`````javascript

var handler = function (evt) {
    console.log(evt);
};

asti.agent.subscribe({
    agent: 'SIP/1000',
    onAgentCalled: handler,
    onAgentCalled: handler,
    onAgentComplete: handler,
    onAgentRingNoAnswer: handler
});

`````

#### asti.agent.unsubscribe(params)

params:

agent - agent of asterisk queues


`````javascript

asti.agent.unsubscribe({agent: 'SIP/1000'});

`````
