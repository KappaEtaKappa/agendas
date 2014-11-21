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
		db.run("CREATE TABLE 'reports'	(report_id INTEGER PRIMARY KEY, "+
										"reporter BLOB NOT NULL, "+
										"order_num INTEGER NOT NULL, "+
										"topic BLOB NOT NULL);", function(err){console.log(err)});
		db.run("CREATE TABLE 'news'	(news_id INTEGER PRIMARY KEY, "+
									"topic BLOB NOT NULL, "+
									"order_num INTEGER NOT NULL, "+
									"old VARCHAR(3) NOT NULL);", function(err){console.log(err)});
		db.run("CREATE TABLE 'positions' (position_id INTEGER PRIMARY KEY, "+
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
var cookieParser = require('cookie-parser')

var agendas = express();
agendas.set('view engine', 'ejs');
agendas.use(express.static(__dirname + '/public'));
agendas.use(bodyParser.urlencoded({ extended: false }));
agendas.use(cookieParser());

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
	res.render('admin');
});
agendas.post('/login', function(req, res) {
	console.log(req.cookies.logged_in)
	if(req.body.password == "asdf"){
		res.cookie("logged_in", "true");
		res.redirect("/admin/reports");
	}else
		res.redirect("/admin");
});
agendas.get('/admin/reports', function(req, res) {
	console.log(req.cookies.logged_in)
	if(req.cookies.logged_in != "true"){res.redirect("/admin"); return;}
	utils.getReports(function(member, array){
		res.render('reports', {"Reports":array});
	});
});
agendas.post('/report/delete', function(req, res){
	if(req.cookies.logged_in != "true"){res.redirect("/admin"); return;}
	db.run("DELETE FROM reports WHERE report_id="+req.query.report_id);
	res.redirect("/admin/reports");
});
agendas.post('/report/update', function(req, res){ 
	if(req.cookies.logged_in != "true"){res.redirect("/admin"); return;}

	db.run("UPDATE reports SET reporter='"+req.body.reporter+"',"
		+" topic='"+req.body.topic+"',"
		+" order_num='"+req.body.order_num+"'"
		+" WHERE report_id="+req.query.report_id+";", function(err){console.log(err)});
	res.redirect("/admin/reports");
});
agendas.post('/report/add', function(req, res){
	if(req.cookies.logged_in != "true"){res.redirect("/admin"); return;}
	
	db.get("SELECT * FROM reports ORDER BY order_num DESC LIMIT 1", function(err, report){
		db.run("INSERT INTO reports (topic,reporter,order_num)"+
			"VALUES ('"+req.body.topic+"','"+req.body.reporter+"','"+(report.order_num+1)+"');");
		res.redirect("/admin/reports");
	})
});

agendas.get('/admin/news', function(req, res) {
	if(req.cookies.logged_in != "true"){res.redirect("/admin"); return;}
	
	utils.getNews(function(member, array){
		res.render('news', {"News":array});
	});
});
agendas.post('/news/delete', function(req, res){
	if(req.cookies.logged_in != "true"){res.redirect("/admin"); return;}
	
	db.run("DELETE FROM news WHERE news_id="+req.query.news_id);
	res.redirect("/admin/news");
});
agendas.post('/news/update', function(req, res){
	if(req.cookies.logged_in != "true"){res.redirect("/admin"); return;}
	
	db.run("UPDATE news SET topic='"+req.body.topic+"',"
		+" old='"+req.body.old+"',"
		+" order_num='"+req.body.order_num+"'"
		+" WHERE news_id="+req.query.news_id);
	res.redirect("/admin/news");
});
agendas.post('/news/add', function(req, res){
	if(req.cookies.logged_in != "true"){res.redirect("/admin"); return;}
	
	db.get("SELECT * FROM news ORDER BY order_num DESC LIMIT 1", function(err, news){
		db.run("INSERT INTO news (topic,old,order_num)"+
			"VALUES ('"+req.body.topic+"','"+req.body.old+"','"+(news.order_num+1)+"');");
		res.redirect("/admin/news");
	})
});

agendas.get('/admin/positions', function(req, res) {
	if(req.cookies.logged_in != "true"){res.redirect("/admin"); return;}
	
	db.all("SELECT * from positions ORDER BY order_num ASC" , function(err, _positions){
		res.render('people', {"Positions":_positions});
	});
});
agendas.post('/positions/delete', function(req, res){
	if(req.cookies.logged_in != "true"){res.redirect("/admin"); return;}
	
	db.run("DELETE FROM positions WHERE position_id="+req.query.position_id);
	res.redirect("/admin/positions");
});
agendas.post('/positions/update', function(req, res){
	if(req.cookies.logged_in != "true"){res.redirect("/admin"); return;}
	
	db.run("UPDATE positions SET position_name='"+req.body.position_name+"',"
		+" assistant='"+req.body.assistant+"',"
		+" member_name='"+req.body.member_name+"',"
		+" order_num='"+req.body.order_num+"'"
		+" WHERE position_id="+req.query.position_id);
	res.redirect("/admin/positions");
});
agendas.post('/positions/add', function(req, res){
	if(req.cookies.logged_in != "true"){res.redirect("/admin"); return;}
	
	db.get("SELECT * FROM positions ORDER BY order_num DESC LIMIT 1", function(err, positions){
		db.run("INSERT INTO positions (position_name,assistant,member_name,order_num)"+
			"VALUES ('"+req.body.position_name+"','"+req.body.assistant+"','"+req.body.member_name+"','"+(positions.order_num+1)+"');");
		res.redirect("/admin/positions");
	})
});

var save = function(err, report){
	var date = new Date();
	var filename = date.getFullYear() +"_"+ (date.getMonth()+1) +"_"+ (date.getDate()) + ".html"
	fs.writeFile(__dirname + '/static/history/'+filename, report, function(err) {
		if(err) console.log(err);
    });
}