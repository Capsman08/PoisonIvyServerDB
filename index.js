var express = require('express')
var bodyParser = require('body-parser')
var shortid = require('shortid')
var app = express();
var sleep = require('sleep');
var fs = require('fs')
var path = require('path')

//Open db Connection
var mysql = require('mysql')

var IvyConnection = mysql.createConnection({
  host     : 'ivyreportstest.ck7nca1ocijz.us-east-2.rds.amazonaws.com',
  user     : 'Admin',
  password : 'password',
  database : 'IvyTest',
  multipleStatements: true
});

IvyConnection.connect()

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
	console.log("Get /reports")
	IvyConnection.query('SELECT * from Reports', function (err, rows, fields) {
  		res.send(rows);
	});
});

//Gets up to 10 report records at the given offset
app.get('/reports/:idrange', (req, res, next) => {
	console.log("Get /reports/:idrange")
	var range = req.params.idrange * 10;
	IvyConnection.query('SELECT * from Reports LIMIT ' + range + ',10', function (err, rows, fields) {
  		res.send(rows);
	});
});

app.get('/report/:id', (req, res, next) => {
	console.log("Get /report/:id");
	var id = req.params.id;
	IvyConnection.query('SELECT * FROM Reports WHERE reportID = ' + id + ' LIMIT 1', function (err, record, fields) {
		res.send(record);
	});
});

//gets the number of reports in the reports table
app.get('/reportscount', (req, res, next) => {
	console.log("Get /reportscount");
	IvyConnection.query('SELECT COUNT(*) FROM Reports', function (err, num, fields) {
		res.send(num);
	});
});


app.get('/users', (req, res, next) => {
	console.log("Get /users");
	IvyConnection.query('SELECT * from Users', function (err, rows, fields) {
		res.send(rows);
	})
})

//Gets up to 10 user records at the given offset
app.get('/users/:idrange', (req, res, next) => {
	console.log("Get /users/:idrange");
	var range = req.params.idrange * 10;
	IvyConnection.query('SELECT * from Users LIMIT ' + range + ',10', function (err, rows, fields) {
		res.send(rows);
	});
});

//gets the number of users in the reports table
app.get('/userscount', (req, res, next) => {
	console.log("Get /userscount");
	IvyConnection.query('SELECT COUNT(*) FROM Users', function (err, num, fields) {
		res.send(num);
	});
});

app.get('/hasphotos/:id', (req, res, next) => {
	var id = req.params.id;
	var dir = '../images/' + id;
	if (fs.existsSync(dir))
	{
	    res.send('true')
	}
	else{
		res.send('false');
	}
});



app.post('/update', (req, res, next) => {
	console.log("Post Request to /update \n"); //+  JSON.stringify(req.body, null, '\t'));
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
		else if (payload.hasOwnProperty("pref_email")) {
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
			doInsert(reportsList[k], uid)
		// for( var k = 0; k < reportsList.length; k++)
		// {

		// 	// IvyConnection.query(reportQuery,[uid, reportsList[k].plant_type, reportsList[k].latitude,reportsList[k].longitude,reportsList[k].date ] ,function (err, row, fields) {
		// 	// 	var i = k; 
		// 	// 	if (err) {
		// 	// 		throw err;
		// 	// 	}
		// 	// 	var repId = row.insertId;

		// 	// 	// Loop through each image if there are images and give it a unique path to save


		// 	// 	console.log("Image Count: at i " + i );
		// 	// 	if(reportsList[i].images.length != 0 )
		// 	// 	{
		// 	// 		var dir = '../images/' + repId;

		// 	// 		if (!fs.existsSync(dir))
		// 	// 		{
		// 	// 	   		fs.mkdirSync(dir);
		// 	// 		}
		// 	// 		for(var j = 0; j < reportsList[i].images.length;j++)
		// 	// 		{
		// 	// 			var imagePath = "../images/" + repId + "/" +shortid.generate()+ ".png"
		// 	// 			require("fs").writeFile(imagePath, reportsList[i].images[j], 'base64', function(err) 
		// 	// 			{
		// 	// 				if(err)
		// 	// 				{
		// 	// 						console.log(err);
		// 	// 					}
		// 	// 			});
		// 	// 			//Insert image locations in database
		// 	// 			var imageQuery = 'INSERT INTO Image_Locations VALUES(?,?)';

		// 	// 			IvyConnection.query(imageQuery,[repId,imagePath], function (err, rows, fields)
		// 	// 			{
		// 	// 				if (err) 
		// 	// 				{
		// 	// 					throw err;
		// 	// 				}
		// 	// 			});
		// 	// 		}
		// 	// 	}
				
		// 	// });
				
		// }

		jsonResponseString = '{"status" : "COMPLETE"}'
	}
	else {
		var errorMessage = "Unrecognized payloadType: " + payloadType + ". Ignoring this request.";
		console.log(errorMessage);
		jsonResponseString = '{"status" : "ERROR", "message" : "' + errorMessage + '" }'
	}

	res.send(JSON.parse(jsonResponseString));
});

function doInsert(report, uid) {
	var reportQuery = 'INSERT INTO Reports VALUES (null, ?, ?, ?, ?, ?);';
	IvyConnection.query(reportQuery,[uid, report.plant_type, report.latitude,report.longitude,report.date ] ,function (err, row, fields) {
		if (err) 
		{
			throw err;
		}
		var repId = row.insertId;

		// Loop through each image if there are images and give it a unique path to save


		if(report.images.length != 0 )
		{
			var dir = '../images/' + repId;

			if (!fs.existsSync(dir))
			{
		   		fs.mkdirSync(dir);
			}
			var imageQuery = "";
			for(var j = 0; j < report.images.length;j++)
			{
				var imagePath = "../images/" + repId + "/" +shortid.generate()+ ".png"
				console.log("Adding Image " + j + " of: " + report.images.length);
				require("fs").writeFile(imagePath, report.images[j], 'base64', function(err) 
				{
					if(err)
					{
						console.log(err);
					}
				});
				imageQuery += 'INSERT INTO Image_Locations VALUES(' + repId +','  +  IvyConnection.escape(imagePath) + ');';
			}

			console.log(imageQuery)
			//Insert image locations in database
			IvyConnection.query(imageQuery, function (err, rows, fields)
			{
				if (err) 
				{
					throw err;
				}
			});
		}
			
	});
				
};


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
  		console.log(response)
  		var date = new Date().toString();
  		date = date.substr(0, date.length - 15 )
  		date = date.replaceAll(" ", "-")
  		var filename = "/home/ubuntu/server/reports/Reports-" + date + ".csv"
  		fs.writeFile(filename, response,  function(err)  {
			if(err) { console.log(err); }
		res.download(filename,"Reports-" + date + ".csv")

		});
	});
	//res.end();
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
  		fs.writeFile(filename, response,  function(err)  {
			if(err) { console.log(err); }
					res.download(filename,"Users-"+date+".csv")

		});

	});
	//res.end();
});


var zip = require('express-easy-zip');
app.use(zip());

app.get('/sendphotos', (req, res, next) => {
	console.log("Sending Zip. no id");
	var date = new Date().toString();
  	date = date.substr(0, date.length - 15 )
  	date = date.replaceAll(" ", "-")
  	var filename = "Photos-" + date;
  		res.zip({
        files: [
            { 
              comment: 'comment-for-the-file',
                 date: new Date(),
                 type: 'file' },
            { path: '/home/ubuntu/server/images/', name: 'Images' }    //or a folder 
        ],
        filename: filename+'.zip'
    }, function(err)
    {
    	console.log(err);
    });

  	console.log("sent")


})

app.get('/sendphotos/:id', (req, res, next) => {
	var id = req.params.id;
	console.log("Sending Zip of " + id);
	var date = new Date().toString();
  	date = date.substr(0, date.length - 15 )
  	date = date.replaceAll(" ", "-")
  	var filename = "Photos-ID-"+ id+ "-"+ date;
  		res.zip({
        files: [
            { 
              comment: 'comment-for-the-file',
                 date: new Date(),
                 type: 'file' },
            { path: '/home/ubuntu/server/images/'+ id + '/', name: 'Images' }    //or a folder 
        ],
        filename: filename+'.zip'
    });
  	console.log("sent " + id)


});

app.get('/photocount/:id', (req, res, next) => {
	var id = req.params.id;
	console.log("Counting photos");
	var imageDir = path.join(__dirname, '../images/' + id);
	if (fs.existsSync(imageDir))
	{
	    fs.readdir(path.join(__dirname, '../images/' + id), (err, files) => {
			res.send(String(files.length));
		});
	}
	else {
		res.send('0');
	}

	
});

app.get('/sendphotodirect/:id/:photoid', (req, res, next) => {
	var id = req.params.id;
	var photoId = req.params.photoid;
	console.log("Sending a photo from " + id);

  	var dir = path.join(__dirname, '../images/' + id);
  	fs.readdir(dir, (err, files) => {
  		res.sendFile(path.join(__dirname, '../images/' + id + '/' + files[photoId]));
  	});


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
