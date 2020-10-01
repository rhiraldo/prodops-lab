var express   =    require("express");
var mysql     =    require('mysql');
var app       =    express();
var path = require('path');
var sqlQuery = "select * from clients;";

const PORT = process.env.PORT || 8080;
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_NAME = process.env.DB_NAME || 'prodops';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD;
const REDIS_PORT = process.env.REDIS_PORT || '6379';
const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';

const redis = require("redis");
const client = redis.createClient(REDIS_PORT,REDIS_HOST);

var pool      =    mysql.createPool({
    connectionLimit : 100, //important
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    debug    :  false
});

function query_database(req,res) {
  // connection will be acquired automatically
  pool.query(sqlQuery,function(err,rows){
  res.setHeader( 'X-Powered-By', 'ProdOps Awesomeness' );
  if(err) {
      console.log({'level': 'ERROR', 'component': 'database', 'message': 'Error occurred: '+err});
      return res.status(500).json({'level': 'ERROR', 'component': 'database', 'message': 'Error occurred: '+err});
  }
          //connection will be released as well.
          res.status(200).json(rows);
  });
}

function get_redis(req,res) {
  client.on("error", function(error) {
    console.error(error);
  });
   
  client.set('time', new Date().toUTCString(), function(err, reply) {
    console.log('How did Redis value store do? '+reply);
  });
  client.get('time', function(err, reply) {
    console.log('New time stored in Redis server ' + REDIS_HOST +' : '+reply);
    res.send('New time stored in Redis server ' + REDIS_HOST +' : '+reply)
});

}

function healthcheck(req,res) {
  res.setHeader( 'X-Powered-By', 'ProdOps Awesomeness' );
  res.setHeader('Last-Modified', (new Date()).toUTCString());
  pool.getConnection(function(err){
  if(err) {
    console.log({'level': 'ERROR', 'component': 'database', 'message': 'Error occurred: '+err});
    return res.status(500).json({'level': 'ERROR', 'component': 'database', 'message': 'Error occurred: '+err});
  }
  console.log({'level': 'INFO', 'component': 'database', 'message': 'success'})
  res.status(200).json({'level': 'INFO', 'component': 'database', 'message': 'success'});
});
}

app.get('/', (req, res) => {
  res.setHeader( 'X-Powered-By', 'ProdOps Awesomeness' );
  res.status(200).sendFile(path.join(__dirname + '/index.html'));
});

app.get("/clients",function(req,res){-
        query_database(req,res);
});

app.get("/redis",function(req,res){-
  get_redis(req,res);
});

app.get("/check/health",function(req,res){-
  healthcheck(req,res);
});

app.listen(PORT);
console.log(`Server running at http://127.0.0.1:${PORT}/`);