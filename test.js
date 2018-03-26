var mysql      = require('mysql');

var connection = mysql.createConnection({
  host     : 'ivyreportstest.ck7nca1ocijz.us-east-2.rds.amazonaws.com',
  user     : 'Admin',
  password : 'password',
  database : 'mydb'
});
 
// Just sql
// // Create the connection and test for error
// connection.connect(function(err)
// {
// 	if (err)
// 	{
//     	console.error('Error connecting: ');
//     	return;
//   	}
 
// 	console.log('Connected');

//   	// Query for inserting test data
//  //  	connection.query('INSERT INTO reports VALUES("Peter",5)', function (error, results, fields) 
//  //  	{
// 	// 	if (error)
// 	// 	{
//  //  			console.error('Error querying insert: ' + err.stack);
// 	// 	}

// 	// });

//   	// Query to select all data and show results
// 	connection.query('SELECT * From reports', function (error, results, fields)
//   	{
// 		if (error)
// 		{
//   			console.error('Error querying select: ' + err.stack);
// 		}
//   		console.log('The solution is: ', results);
// 	});
 
// 	connection.end();

// });


// Testing server things
var http = require('http');
var server = http.createServer ( function(request,response)
{
	response.writeHead(200,{"Content-Type":"text\plain"});
    if(request.method == "GET")
    {
    	connection.connect(function(err)
    	{
    		if(err)
    		{
    			console.error('Cannot connect')
    			response.end("received GET request. Could not connect to db")
    			return;
    		}
    		connection.query('SELECT * From reports', function (error, results, fields)
  			{
				if (error)
				{
  					console.error('Error querying select: ' + err.stack)
				}
  				console.log('The solution is: ', results)
  				for (i = 0; i < results.length; i++)
  				{
  					response.write("Name: " + results[i].name +", ReportNumber: " + results[i].reportNumber + "\n")
  				}

  				response.end("Finished")

			});
 
			connection.end();
    	});
        //response.end("end of GET")
    }
    else if(request.method == "POST")
    {
    	response.write(response + "");
        response.end("received POST request.");
    }
    else
    {
        response.end("Undefined request .");
    }
});
port = 3000;
host = '127.0.0.1';
server.listen(port, host);
console.log('Listening at http://' + host + ':' + port);
