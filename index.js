var express = require('express')
var bodyParser = require('body-parser')

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

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.get('/reports', (req, res, next) => {
	//TODO: Get all the tables
	//TODO: Relate images back to location
	//TODO: Export as some file type probably csv + folder
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


app.post('/reports', (req, res, next) => {
	// TODO: get info from body/headers (probably body)
	// TODO: Parse information into correct types
	// TODO: Save images on server and get the location
	// TODO: Create correct queries
	// var newName = req.headers.name;
	// var newReportNumber = req.headers.reportnumber;
	// var query = 'INSERT INTO reports VALUES ("' + newName + '",' + newReportNumber + ')';
	// connection.query(query, function (err, rows, fields) {
 //  	if (err)
 //  	{ 
 //  		throw err
 //  	}		 
 //   	res.send('Added '+ newName +  '  in db')
	// });
	console.log("Post Request \n" + JSON.stringify(req.body, null, '\t'));

	var uid = req.body.uid;
	var payloadType = req.body.payloadType;
	var payload = req.body.payload;
	var jsonResponseString = '{"status" : "UKNOWN"}';

	if (payloadType === "SETTINGS") {
		if (payload.hasOwnProperty("pref_screen_name")) {
			var screenName = payload.pref_screen_name;

			var UserQuery = 'Insert INTO Users (UID, screenname) VALUES (' +uid + ',' + ' "' + screenName + '") ON DUPLICATE KEY UPDATE screenname = "' + screenName + '";'

			IvyConnection.query(UserQuery, function (err, rows, fields) {
				if (err) {
					throw err;
				}
			});
			// TODO: update the screen name for the uid, null or empty should be treated the same
			jsonResponseString = '{"status" : "COMPLETE"}'
		}
		else if (paylod.hasOwnProperty("pref_email")) {
			var email = payload.pref_email;
			var UserQuery = 'Insert INTO Users (UID, email) VALUES (' + uid + ',' + ' "' + email + '") ON DUPLICATE KEY UPDATE email = "' + email + '";'
			IvyConnection.query(UserQuery, function (err, rows, fields) {
				if (err) {
					throw err;
				}
			});			jsonResponseString = '{"status" : "COMPLETE"}'

			// TODO: update the email for the uid, null or empty should be treated the same
			jsonResponseString = '{"status" : "COMPLETE"}'
		}
	}
	else if (payloadType === "REPORTS") {
		var reportsList = payload;
		
			var addUserQuery = 'INSERT INTO Users(UID) VALUES ("' + uid + '") ON DUPLICATE key update UID=UID;';
			IvyConnection.query(addUserQuery, function (err, rows, fields) {
				if (err) {
					throw err;
				}
			});
		

		for( var i = 0; i < reportsList.length; i++)
		{

			var reportQuery = 'INSERT INTO Reports VALUES ("' + uid +'", "' + reportsList[i].plant_type + '" ,' + reportsList[i].longitude +','+ reportsList[i].latitude+',"' + reportsList[i].date +'");';
			IvyConnection.query(reportQuery, function (err, rows, fields) {
				if (err) {
					throw err;
				}
			});

		}
		// TODO: add the list of reports to the database
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

// connection.query('SELECT * from reports', function (err, rows, fields) {
//   if (err) throw err

//   console.log('The solution is: ', rows)
// })

//connection.end()
