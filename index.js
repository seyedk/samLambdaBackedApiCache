'use strict';



var Ecad = require('ecad');
var AWS = require('aws-sdk');
var Memcached = require('memcached');

const cacheName = process.env.CACHE_ENDPOINT;

const createResponse = (statusCode, body) => {
    
    return {
        statusCode: statusCode,
        body: body
    }
};

exports.get = (event,context,callback) => {
    
    var endpoints = [cacheName];
    var client = new Ecad({endpoints: endpoints, timeout: 10000});
    client.fetch(function (err, hosts) {
        console.log(err);
        console.log(hosts);
        var connectTo = hosts[parseInt(Math.random() * hosts.length)];

        var memcached = new Memcached(connectTo);
        memcached.set(event.key1, event.value1, 100, function (err) {
            memcached.get(event.key1, function (err, data) {
                console.log(data);
            });
            callback(null);
        });
    });
};
exports.nothing = (event, context, callback) => {
    
    let params = {
        TableName: cacheName,
        Key: {
            id: event.pathParameters.resourceId
        }
    };
    
    let dbGet = (params) => { return dynamo.get(params).promise() };
    
    dbGet(params).then( (data) => {
        if (!data.Item) {
            callback(null, createResponse(404, "ITEM NOT FOUND"));
            return;
        }
        console.log(`RETRIEVED ITEM SUCCESSFULLY WITH doc = ${data.Item.doc}`);
        callback(null, createResponse(200, data.Item.doc));
    }).catch( (err) => { 
        console.log(`GET ITEM FAILED FOR doc = ${data.Item.doc}, WITH ERROR: ${err}`);
        callback(null, createResponse(500, err));
    });
};
