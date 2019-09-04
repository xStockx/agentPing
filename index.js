'use strict'
const ping = require('ping');
const _ = require('lodash');
const net = require('net');
setInterval(checkServer,10000);
const servers = [
    {nameServer : 'www.rains.cl', ipServer: '8.8.8.8', errorPing : 0 , ports : [30,80,443], responseOfPort : 0, intentFailed : 0, status : ''},
    {nameServer : 'www.google.cl', ipServer: '8.8.8.8', errorPing : 0 , ports : [80,443], responseOfPort : 0, intentFailed : 0, status : ''},
    {nameServer : 'localhost', ipServer: '127.0.0.1', errorPing : 0 , ports : [8081] , responseOfPort : 0, intentFailed : 0, status : ''},
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
                checkServicePort(servers.find(_server => server.nameServer === _server.nameServer))
            }            
            });        
    }); 
    checkErrorCount(servers); 
}
function checkServicePort(params){
    servers.find(_server => _server.nameServer === params.nameServer).responseOfPort = 0
    params.ports.forEach(port => {       
        const client = net.createConnection({ host: params.nameServer, port: port, }, () => {
          servers.find(_server => _server.nameServer === params.nameServer).responseOfPort = params.responseOfPort+1  
          console.log(`Connected : ${params.nameServer}  port ${port}`);
          client.destroy()
        });
         client.setTimeout(5000, function() {
            console.log(`Host ${params.nameServer} no contesta el puerto ${port}, por timeout`);
            client.destroy()
        })   
        client.on('error',() => {
            console.log(`Host ${params.nameServer} no contesta el puerto ${port} , conexión rechazada`);
            client.destroy()
            
        });
    });
}
function checkErrorCount(servers){
    servers.forEach(server => {
        if(server.ports.length == server.responseOfPort)
            {
                servers.find(_server => _server.nameServer === server.nameServer).status = 'OK'
                servers.find(_server => _server.nameServer === server.nameServer).intentFailed = 0
            }
        else{
                servers.find(_server => _server.nameServer === server.nameServer).status = 'NOK'
                servers.find(_server => _server.nameServer === server.nameServer).intentFailed = server.intentFailed + 1
            }
    });
    console.log(servers)
    _.find(servers,function(obj){   
        if (obj.errorPing > 5)
        {
            //Here! we will do the call to API Push
            console.log(`Send request API problem with PING ${obj.nameServer} errorCount : ${obj.errorPing}`)
        }
        if (obj.intentFailed > 5 )
        {
            console.log(`Send request API problem with PORTS ${obj.nameServer} errorCount : ${obj.intentFailed}`)
        }
    })
}