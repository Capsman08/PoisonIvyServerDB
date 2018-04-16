var express = require('express')
var bodyParser = require('body-parser')
var shortid = require('shortid')
var app = express();

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

//Gets the html view to look at the data
app.get('/itchy/poisonivy', (req, res, next) => {

	res.format({
		html: () => {
			res.render('index.ejs')
		}
	})
});


app.post('/update', (req, res, next) => {
	// TODO: Download data
	console.log("Post Request \n")// + JSON.stringify(req.body, null, '\t'));
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
	

		for( var i = 0; i < reportsList.length; i++)
		{

			var reportQuery = 'INSERT INTO Reports VALUES (?, ?, ?, ?, ?);';
			IvyConnection.query(reportQuery,[uid, reportsList[i].plant_type, reportsList[i].longitude,reportsList[i].latitude,reportsList[i].date ] ,function (err, rows, fields) {
				if (err) {
					throw err;
				}
			});

			//Testing code to write the base64 to file
			var fs = require('fs');
			fs.writeFile("test.txt", reportsList[i].images[0], function(err) {
				if (err)
					throw err; 

			})
			// Loop through each image if there are images and give it a unique path to save
			if(reportsList[i].images != undefined)
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
					//Insert image locations in database
					var imageQuery = 'INSERT INTO Image_Locations VALUES(?,?)';
					IvyConnection.query(imageQuery,[uid,imagePath], function (err, rows, fields)
					{
						if (err) 
						{
							throw err;
						}
					});
				}
			}
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



app.listen(app.get('port'), () => {
	console.log('Listening on: ', app.get('port'))
});



//connection.end()
