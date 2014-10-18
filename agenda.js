var express = require('express');
var fs = require('fs');

var sqlite3 = require("sqlite3").verbose();
var file = __dirname + "/db.sqlite";
global.path = require('path');
var exists = fs.existsSync(file);
if (!exists) {
	console.log("Creating DB file.");
	fs.openSync(file, "w");
}
global.db = new sqlite3.Database(file);
if (!exists) {
	console.log("creating new db");
	db.serialize(function () {
		db.run("CREATE TABLE 'reports'	(report_id INTEGER PRIMARY KEY NOT NULL, "+
										"reporter BLOB NOT NULL, "+
										"order_num INTEGER NOT NULL, "+
										"topic BLOB NOT NULL);");
		db.run("CREATE TABLE 'news'	(news_id INTEGER PRIMARY KEY NOT NULL, "+
									"topic BLOB NOT NULL, "+
									"order_num INTEGER NOT NULL, "+
									"old NOT NULL);");
		db.run("CREATE TABLE 'positions' (position_name BLOB NOT NULL, "+
										 "member_name BLOB NOT NULL, "+
										 "order_num INTEGER NOT NULL, "+
										 "assistant BOOL NOT NULL);");
		db.run("CREATE TABLE 'history'	(url BLOB NOT NULL, "+
										"order_num INTEGER NOT NULL, "+
										"time timestamp default (strftime('%s', 'now')) );");
	});
 }

var utils = require('utils');

var agendas = express();
agendas.set('view engine', 'ejs');
agendas.use("/static", express.static(__dirname + '/static'));

var ejs = require("ejs");

agendas.listen(8080);
agendas.get('/', function(req, res) {
	var agendaContent = {};
	var lock = -4;

	var lockReturn = function(member, array){
		agendaContent[member] = array;
		lock++;
		if(lock >= 0){
			if(new Date().getDay() == 5)
				res.render('agenda', agendaContent, save);

			res.render('agenda', agendaContent);
		}
	}
	agendaContent.date = (new Date()).toDateString().replace(" 201", ", 201").replace(" 0", " ");
	utils.getReports(lockReturn);
	utils.getNews(lockReturn);
	utils.getHistory(lockReturn);
	utils.getPositions(lockReturn);
});
agendas.get('/admin', function(req, res) {
	var agendaContent = {};
	var lock = -4
	var lockReturn = function(member, array){
		agendaContent[member] = array;
		lock++;
		if(lock >= 0){
			res.render('admin', agendaContent);
		}
	}
	agendaContent.date = (new Date()).toString();
	utils.getReports(lockReturn);
	utils.getNews(lockReturn);
	utils.getHistory(lockReturn);
	utils.getPositions(lockReturn);
});


agendas.post('/report/delete', function(req, res){
	res.redirect("admin");
});

var save = function(err, report){
	var date = new Date();
	var filename = date.getFullYear() +"_"+ (date.getMonth()+1) +"_"+ (date.getDate()) + ".html"
	fs.writeFile(__dirname + '/static/history/'+filename, report, function(err) {
		if(err) console.log(err);
    });
}