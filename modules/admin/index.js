var dev = true;

//setup
var fs = require('fs');
var path = require('path');
var sqlite3 = require("sqlite3").verbose();


var dbFile = path.join(__dirname, "db.sqlite");
if(dev) console.log(dbFile);

//if the db doesnt exist create it (regular file)
var exists = fs.existsSync(dbFile);
if (!exists) {
	console.log("Missing DB: Creating...");
	fs.openSync(dbFile, "w");
}
//open it as a db in the sqlite library
//->make a db if its not
var DB = new sqlite3.Database(dbFile);

//if it didnt exist before^ then we need to create the tables. 
if (!exists) {
	console.log("New DB: Creating tables...");
	db.serialize(function(){
		//create reports table
		var createReports = "CREATE TABLE 'reports' "
								"(report_id INTEGER PRIMARY KEY,"+
								" reporter TEXT NOT NULL,"+
								" order_num INTEGER NOT NULL,"+
								" topic TEXT NOT NULL);", 
		console.log("Reports", createReports);
		db.run(createReports,
			function(err){
				console.log(err)
			}
		);
		
		//create news table
		var createNews = "CREATE TABLE 'news'"+
							"(news_id INTEGER PRIMARY KEY,"+
							" topic TEXT NOT NULL,"+
							" order_num INTEGER NOT NULL,"+
							" old BOOLEAN NOT NULL);";
		console.log("News", createNews);
		db.run(createNews,
			function(err){
				console.log(err)
			}
		);

		//create the posistions table
		var createPositions = "CREATE TABLE 'positions'"+
								"(position_id INTEGER PRIMARY KEY,"+
								" position_name TEXT NOT NULL,"+
								" member_name TEXT NOT NULL,"+
								" order_num INTEGER NOT NULL,"+
								" assistant BOOLEAN NOT NULL);";
		console.log("Positions", createPositions);
		db.run(createPositions,
			function(err){
				console.log(err)
			}
		);
	});
 }

var SDK = {
	reports:{
		get:function(id, callback){
			throw "Not implemented"
		},
		all:function(id, callback){
			throw "Not implemented"
		},
		last:function(id, callback){
			throw "Not implemented"
		},
		delete:function(id, callback){
			throw "Not implemented"
		},
		update:function(id, callback){
			throw "Not implemented"
		},
		refreshOrdering:function(id, callback){
			throw "Not implemented"
		}
	},
	news:{},
	posistions:{}
}

module.exports = SDK;