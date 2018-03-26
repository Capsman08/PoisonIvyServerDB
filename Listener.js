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
app.set('port',3000)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.get('/reports', (req, res, next) => {
	//TODO: Get all the tables
	//TODO: Relate images back to location
	//TODO: Export as some file type probably csv + folder
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


app.post('/reports', (req, res, next) => {
	// TODO: get info from body/headers (probably body)
	// TODO: Parse information into correct types
	// TODO: Save images on server and get the location
	// TODO: Create correct queries
	var newName = req.headers.name;
	var newReportNumber = req.headers.reportnumber;
	var query = 'INSERT INTO reports VALUES ("' + newName + '",' + newReportNumber + ')';
	connection.query(query, function (err, rows, fields) {
  	if (err)
  	{ 
  		throw err
  	}		 
   	res.send('Added '+ newName +  '  in db')
	});

});



app.listen(app.get('port'), () => {
	console.log('Listening on: ', app.get('port'))
});

// connection.query('SELECT * from reports', function (err, rows, fields) {
//   if (err) throw err

//   console.log('The solution is: ', rows)
// })

//connection.end()