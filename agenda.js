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
										"topic BLOB NOT NULL);", function(err){console.log(err)});
		db.run("CREATE TABLE 'news'	(news_id INTEGER PRIMARY KEY NOT NULL, "+
									"topic BLOB NOT NULL, "+
									"order_num INTEGER NOT NULL, "+
									"old VARCHAR(3) NOT NULL);", function(err){console.log(err)});
		db.run("CREATE TABLE 'positions' (position_id INTEGER PRIMARY KEY NOT NULL, "+
										 "position_name BLOB NOT NULL, "+
										 "member_name BLOB NOT NULL, "+
										 "order_num INTEGER NOT NULL, "+
										 "assistant VARCHAR(3) NOT NULL);", function(err){console.log(err)});
		db.run("CREATE TABLE 'history'	(url BLOB NOT NULL, "+
										"order_num INTEGER NOT NULL, "+
										"time timestamp default (strftime('%s', 'now')) );", function(err){console.log(err)});
	});
 }

var utils = require('utils');
var bodyParser = require('body-parser');

var agendas = express();
agendas.set('view engine', 'ejs');
agendas.use(express.static(__dirname + '/public'));
agendas.use(bodyParser.urlencoded({ extended: false }));

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
agendas.get('/admin/reports', function(req, res) {
	utils.getReports(function(member, array){
		res.render('reports', {"Reports":array});
	});
});
agendas.post('/report/delete', function(req, res){
	db.run("DELETE FROM reports WHERE report_id="+req.query.report_id);
	res.redirect("/admin/reports");
});
agendas.post('/report/update', function(req, res){ 
	db.run("UPDATE reports SET reporter='"+req.body.reporter+"', topic='"+req.body.topic+"' WHERE report_id="+req.query.report_id+";");
	res.redirect("/admin/reports");
});

agendas.get('/admin/news', function(req, res) {
	utils.getNews(function(member, array){
		res.render('news', {"News":array});
	});
});
agendas.post('/news/delete', function(req, res){
	db.run("DELETE FROM news WHERE news_id="+req.query.news_id);
	res.redirect("/admin/news");
});
agendas.post('/news/update', function(req, res){
	db.run("UPDATE news SET topic='"+req.body.topic+"', old='"+req.body.old+"' WHERE news_id="+req.query.news_id);
	res.redirect("/admin/news");
});

agendas.get('/admin/positions', function(req, res) {
	db.all("SELECT * from positions ORDER BY order_num ASC" , function(err, _positions){
		res.render('people', {"Positions":_positions});
	});
});
agendas.post('/positions/delete', function(req, res){
	var s = "DELETE FROM positions WHERE position_id="+req.query.position_id;
	console.log(s)
	db.run(s);
	res.redirect("/admin/positions");
});
agendas.post('/positions/update', function(req, res){
	console.log(req.body)
	db.run("UPDATE positions SET position_name='"+req.body.position_name+"',"
		+" assistant='"+req.body.assistant+"',"
		+" member_name='"+req.body.member_name+"',"
		+" order_num='"+req.body.order_num+"'"
		+" WHERE position_id="+req.query.position_id);
	res.redirect("/admin/positions");
});

var save = function(err, report){
	var date = new Date();
	var filename = date.getFullYear() +"_"+ (date.getMonth()+1) +"_"+ (date.getDate()) + ".html"
	fs.writeFile(__dirname + '/static/history/'+filename, report, function(err) {
		if(err) console.log(err);
    });
}