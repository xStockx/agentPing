'use strict'
const ping = require('ping');
const _ = require('lodash');
const net = require('net');
setInterval(checkServer,10000);
const servers = [
    {nameServer : 'www.rains.cl', ipServer: '8.8.8.8', errorPing : 0, paramsTelnet : {host: 'www.rains.cl', ports : [25,80,443], timeout : 1500}, errorPort : 0},
    //{nameServer : 'Gateway', ipServer: '192.168.1.1', errorPing : 0, paramsTelnet : {host: 'Gateway', ports : [80,443], timeout : 1500}, errorPort : 0 }
]
function checkServer() {  
    servers.forEach(server => {
        ping.sys.probe(server.nameServer, function(isAlive){
            if(!isAlive)
                {
                    servers.find(_server => _server.nameServer === server.nameServer).errorPing = server.errorPing+1
                }   
            else{
                servers.find(_server => _server.nameServer === server.nameServer).errorPing = 0
                checkServicePort(servers.find(_server => server.nameServer === _server.nameServer).paramsTelnet)
            }            
            });        
    }); 
    checkErrorCount(servers); 
}
function checkServicePort(params){
    params.ports.forEach(port => {       
        const client = net.createConnection({ host: params.host, port: port, }, () => {
            
          console.log("conectado : " + params.host + " port : " + port);
          client.destroy()
        });
        client.setTimeout(10000, function() {
            console.log("Cayo por timeout");
            client.destroy()
        }) 
    });
}
function checkErrorCount(servers){
    _.find(servers,function(obj){
        if (obj.errorPing > 5)
        {
            //Here! we will do the call to API Push
            console.log("ahora Post : "+ obj.nameServer +"->" + obj.errorPing)
        }
    })
}