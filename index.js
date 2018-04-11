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

//Set http connection
//app.set('port',3000)

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
  			response += ("Name: " + rows[i].name +", ReportNumber: " + rows[i].reportNumber + "\n")
  		}
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
			// TODO: update the screen name for the uid, null or empty should be treated the same
			jsonResponseString = '{"status" : "COMPLETE"}'
		}
		else if (paylod.hasOwnProperty("pref_email")) {
			var email = payload.pref_email;
			// TODO: update the email for the uid, null or empty should be treated the same
			jsonResponseString = '{"status" : "COMPLETE"}'
		}
	}
	else if (payloadType === "REPORTS") {
		var reportsList = payload;
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