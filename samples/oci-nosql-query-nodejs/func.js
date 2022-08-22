const fdk=require('@fnproject/fdk');
const process = require('process');
const NoSQLClient = require('oracle-nosqldb').NoSQLClient;
const Region = require('oracle-nosqldb').Region;
const ServiceType = require('oracle-nosqldb').ServiceType;
const url = require('url');

let client;
let lim = 15;

process.on('exit', function(code) {
  if (client) {
     console.log("\close client  on exit");
     client.close();
  }
  return code;
});

fdk.handle(async function(input, ctx){

  let tableName;

  // Reading parameters from standard input for TEST purposes
  if (input && input.tableName)
    tableName = input.tableName;

  // Reading parameters sent by the httpGateway
  let hctx = ctx.httpGateway
  if (hctx  && hctx.requestURL) {
        var adr = hctx.requestURL;
        var q = url.parse(adr, true);
        tableName = q.pathname.split('/')[2]
  }

  if ( !client ) {
    client = createClientResource();
  }
  
  rows = executeQuery(`SELECT * FROM ${tableName} LIMIT ${lim}`);

  return rows;

}, {});


async function executeQuery (statement) {
  const rows = [];
  let cnt ;
  let res;
  try {
    do {
       res = await client.query(statement, { continuationKey:cnt});
       rows.push.apply(rows, res.rows);
       cnt = res.continuationKey;
    } while(res.continuationKey != null);
  }
  catch(err) {
        return err;
  }
  return rows;
}

function createClientResource() {
  return  new NoSQLClient({
    region: process.env.NOSQL_REGION,
    compartment:process.env.NOSQL_COMPARTMENT_ID,
    auth: {
        iam: {
            useResourcePrincipal: true
        }
    }
  });
}
