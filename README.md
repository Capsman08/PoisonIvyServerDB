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
This is the main page where the tables to view that data are displayed

### [reportMap.ejs](public/views/reportMap.ejs)
This is a work in progress page to view all the reports on a map 
