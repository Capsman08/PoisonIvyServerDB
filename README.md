# Middleware - [index.js](index.js)
Handles the routing for the application website as well as data communication

To run this file you will need to have npm installed as well as the following packages:

If you need to install npm follow the instructions here https://www.npmjs.com/get-npm

```java
   npm install express
   npm install mysql
   npm install body-parser
   npm install path
   npm install express-easy-zip
   npm install ejs
```
Once these are installed you can run

```java
node index.js
```

To configure the database connection you need to edit the following to have the proper host address, username, password and database name.

```java
var IvyConnection = mysql.createConnection({
  host     : '',
  user     : '',
  password : '',
  database : '',
  multipleStatements: true
});
```

As long as the database schema is the same the queries should not need to be edited. 

# Database schema

The file [SQLCreateStatement.txt](SQLCreateStatement.txt) contains the SQL statements needed to create the correct schema for the application. Note that any changes to table name or structure could result in the middleware not working correctly.

# Website - public directory

In the views.js in the main directory there is the base routing done for the webpage.
In the views directory there are the two view ejs files.

### [index.ejs](public/views/index.ejs) 
This page renders all of the data that the website has to offer. It pulls styles from public/css/styles.css and Bootstrap (https://getbootstrap.com/), and pulls external Javascript scripts from public/js/scripts.js, Bootstrap and jQuery (http://jquery.com/). Ajax is used to transfer data from the database using our server's middleware and render it in HTML. The site contains tables which render the database's report and user data into two seperate tables, 10 rows at a time. Buttons are provided to provide download functionality for all of the text data in the form of .csv files and images in a .zip file. Images for each report can be viewed directly from the reports table by clicking on a row's "View Image(s)" button, if that report has any corresponding images. 

### [reportMap.ejs](public/views/reportMap.ejs)
 This page is intended to show all reports on a map in the form of pins, where when a pin is clicked, it will show the correcsponding report data from the database. This page is incomplete. All reports render as pins on the map correctly in its current state, but do not function properly when clicked. The map data and interface is provided by Google Maps (https://developers.google.com/maps/). The API key is registered to Douglas Botello's Virginia Tech .edu email account and is provided in the reportMap.ejs file. The API key corresponds with Google's free tier of map services. Styles are pulled from public/views/mapStyles.css. External Javascript scripts are pulled from public/js/scripts.js and Jquery. Report data is recovered from the database using Ajax calls to our server's middleware.

