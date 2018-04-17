var express = require('express')
var bodyParser = require('body-parser')
var shortid = require('shortid')
var app = express();
var sleep = require('sleep');
var fs = require('fs')

//Open db Connection
var mysql = require('mysql')

var connection = mysql.createConnection({
  host     : 'ivyreportstest.ck7nca1ocijz.us-east-2.rds.amazonaws.com',
  user     : 'Admin',
  password : 'password',
  database : 'mydb'
});

connection.connect()

var IvyConnection = mysql.createConnection({
  host     : 'ivyreportstest.ck7nca1ocijz.us-east-2.rds.amazonaws.com',
  user     : 'Admin',
  password : 'password',
  database : 'IvyTest'
});

IvyConnection.connect()

//~~~~~~~~~~~v~~~v~~~~~~~~~~EDITED~~~~~~~~~~v~~~~~~~~~~~~~~~~~~
var routes = require('./views')(app);


//Set http connection
app.set('port',3000)

//sets up path definitions for serving views
//need to have ejs installed
app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/public/views');
app.engine('.html', require('ejs').__express); 
app.set('view engine', 'ejs'); //setup to use ejs files instead of html

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb'}));

app.get('/reports', (req, res, next) => {
	console.log("Get Request")
	connection.query('SELECT * from reports', function (err, rows, fields) {
  		if (err) 
  		{
  			throw err
  		}
		var response = "";
		for (i = 0; i < rows.length; i++)
  		{
  			response +=  "Name: " + rows[i].name + ", ReportNumber: " + rows[i].reportNumber + "\n";
  		}

  		// for (i = 0; i < rows.length; i++)
  		// {
  		// 	response += ("UID: " + rows[i]. +", Type: " + rows[i].plant_type +", Lat: " + rows[i].latitude + ", Long: " + rows[i].longitude + "\n")
  		// }
  		//console.log(JSON.stringify(response))
  		res.send(response)
	});
});


app.post('/update', (req, res, next) => {
	// TODO: Save images on server and get the location
	
	console.log("Post Request to /update \n")// + JSON.stringify(req.body, null, '\t'));

	var uid = req.body.uid;
	var payloadType = req.body.payloadType;
	var payload = req.body.payload;
	var jsonResponseString = '{"status" : "UKNOWN"}';

	if (payloadType === "SETTINGS") {
		if (payload.hasOwnProperty("pref_screen_name")) {
			var screenName = payload.pref_screen_name;
			var UserQuery = 'Insert INTO Users (UID, screenname) VALUES (?,?) ON DUPLICATE KEY UPDATE screenname = ?;'

			IvyConnection.query(UserQuery,[uid,screenName,screenName], function (err, rows, fields) {
				if (err) {
					throw err;
				}
			});
			jsonResponseString = '{"status" : "COMPLETE"}'
		}
		else if (paylod.hasOwnProperty("pref_email")) {
			var email = payload.pref_email;
			var UserQuery = 'Insert INTO Users (UID, email) VALUES (?,?) ON DUPLICATE KEY UPDATE email = ?;'
			IvyConnection.query(UserQuery,[uid,email,email], function (err, rows, fields) {
				if (err) {
					throw err;
				}
			});			
			jsonResponseString = '{"status" : "COMPLETE"}'

		}
	}
	else if (payloadType === "REPORTS") {
		var reportsList = payload;
		
			var addUserQuery = 'INSERT INTO Users(UID) VALUES (?) ON DUPLICATE key update UID=UID;';
			IvyConnection.query(addUserQuery, [uid],function (err, rows, fields) {
				if (err) {
					throw err;
				}
			});
	

		for( var k = 0; k < reportsList.length; k++)
		{

			var i = k; 
			var reportQuery = 'INSERT INTO Reports VALUES (null, ?, ?, ?, ?, ?);';
			IvyConnection.query(reportQuery,[uid, reportsList[i].plant_type, reportsList[i].longitude,reportsList[i].latitude,reportsList[i].date ] ,function (err, row, fields) {
				if (err) {
					throw err;
				}
				var repId = row.insertId;

				// Loop through each image if there are images and give it a unique path to save
				if(reportsList[i].images.length != 0 )
				{
					console.log("Inserting images")
					for(var j = 0; j < reportsList[i].images.length;j++)
					{
						var imagePath = "../images/" + shortid.generate()+ ".png"
						console.log(imagePath);
						require("fs").writeFile(imagePath, reportsList[i].images[j], 'base64', function(err) 
						{
							if(err)
							{
  								console.log(err);
  							}
						});
						console.log(repId)
						//Insert image locations in database
						var imageQuery = 'INSERT INTO Image_Locations VALUES(?,?)';

						IvyConnection.query(imageQuery,[repId,imagePath], function (err, rows, fields)
						{
							if (err) 
							{
								throw err;
							}
						});
					}
				}
				
			});

		

			//Testing code to write the base64 to file
			// var fs = require('fs');
			// fs.writeFile("test.txt", reportsList[i].images[0], function(err) {
			// 	if (err)
			// 		throw err; 

			// })
						
		}

		jsonResponseString = '{"status" : "COMPLETE"}'
	}
	else {
		var errorMessage = "Unrecognized payloadType: " + payloadType + ". Ignoring this request.";
		console.log(errorMessage);
		jsonResponseString = '{"status" : "ERROR", "message" : "' + errorMessage + '" }'
	}

	res.send(JSON.parse(jsonResponseString));
});

app.get('/viewreports', (req, res, next) => {
	var selectReportsQuery = 'Select * from Reports';
	IvyConnection.query(selectReportsQuery, function (err, rows, fields)
	{
		if (err) 
		{
			throw err;
		}
		var response = "Report ID, UID, Plant Type, Latitude, Longitude, Time Stamp \n"

  		for (i = 0; i < rows.length; i++)
  		{
  			response += (rows[i].reportID +"," + rows[i].UID+ "," +  rows[i].plant_type +"," + rows[i].latitude + "," + rows[i].longitude + "," + rows[i].date_time + "\n")
  		}
  		
  		var date = new Date().toString();
  		date = date.substr(0, date.length - 15 )
  		date = date.replaceAll(" ", "-")
  		var filename = "/home/ubuntu/server/reports/Reports" + date + ".csv"
  		 console.log(filename)
  		fs.writeFile(filename, response,  function(err)  {
			if(err) { console.log(err); }
					res.sendFile(filename)

		});

	});
});


app.get('/viewusers', (req, res, next) => {
	var selectReportsQuery = 'Select * from Users';
	IvyConnection.query(selectReportsQuery, function (err, rows, fields)
	{
		if (err) 
		{
			throw err;
		}
		var response = "UID, Email, Screen Name\n"

  		for (i = 0; i < rows.length; i++)
  		{
  			response += (rows[i].UID +"," + rows[i].email+ "," +  rows[i].screenname + "\n")
  		}
  		
  		var date = new Date().toString();
  		date = date.substr(0, date.length - 15 )
  		date = date.replaceAll(" ", "-")
  		var filename = "/home/ubuntu/server/users/Users" + date + ".csv"
  		 console.log(filename)
  		fs.writeFile(filename, response,  function(err)  {
			if(err) { console.log(err); }
					res.sendFile(filename)

		});

	});
});

app.get('/sendphotos', (req, res, next) => {
	console.log("Creating Zip");
	var date = new Date().toString();
  	date = date.substr(0, date.length - 15 )
  	date = date.replaceAll(" ", "-")
  	var filename = "/home/ubuntu/server/images/Backup-" + date + ".zip"

  	var archiver = require('archiver');
  	// create a file to stream archive data to.
	var output = fs.createWriteStream(__dirname + '/example.zip');
	var archive = archiver('zip', {
	  zlib: { level: 9 } // Sets the compression level.
	});

	// listen for all archive data to be written
	// 'close' event is fired only when a file descriptor is involved
	output.on('close', function() {
	  console.log('archiver has closed.');
	});

	// This event is fired when the data source is drained no matter what was the data source.
	// It is not part of this library but rather from the NodeJS Stream API.
	// @see: https://nodejs.org/api/stream.html#stream_event_end
	output.on('end', function() {
	  console.log('Data has been drained');
	});
	 
	// good practice to catch warnings (ie stat failures and other non-blocking errors)
	archive.on('warning', function(err) {
	  if (err.code === 'ENOENT') {
	    console.log("File not found")
	  } else {
	    // throw error
	    throw err;
	  }
	});

	// good practice to catch this error explicitly
	archive.on('error', function(err) {
	  throw err;
	});

	// pipe archive data to the file
	archive.pipe(output);


	// append files from a sub-directory, putting its contents at the root of archive
	archive.glob('/home/ubuntu/server/images/*.png', false);

	//archive.pipe(response)
	archive.finalize();


	res.pipe('/home/ubuntu/server/PoisonIvyServerDB/example.zip')









	
});


String.prototype.replaceAll = function(search, replace)
{
    //if replace is not sent, return original string otherwise it will
    //replace search string with 'undefined'.
    if (replace === undefined) {
        return this.toString();
    }

    return this.replace(new RegExp('[' + search + ']', 'g'), replace);
};

app.listen(app.get('port'), () => {
	console.log('Listening on: ', app.get('port'))
});



//connection.end()
