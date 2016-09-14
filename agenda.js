process.chdir(__dirname);

var express = require('express');
var fs = require('fs');

var db = require('./modules/admin');

var utils = require('./modules/utils');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser')

var agendas = express();
agendas.set('view engine', 'ejs');
agendas.use(express.static(__dirname + '/public'));
agendas.use(bodyParser.urlencoded({ extended: false }));
agendas.use(cookieParser());

var ejs = require("ejs");

agendas.listen(3000);

//main page, gets data, sends page
agendas.get('/', function(req, res) {
	var agendaContent = {};
	var lock = -4;

	//this is a quick-lock set to only return once 
	//all util calls have succeeded or failed
	var lockReturn = function(member, array){
		agendaContent[member] = array;
		lock++;
		if(lock >= 0){
			if(new Date().getDay() == 1)
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
/////////////////////////////////////////////
////////////     ADMIN       ////////////////
/////////////////////////////////////////////
//access to the admin pannel
agendas.get('/admin', function(req, res) {
	if(req.cookies.logged_in == "true"){
		res.redirect("/admin/reports");
	}else
		res.render('admin');
});
//form login POST handle
agendas.post('/login', function(req, res) {
	if(req.body.password == "asdf"){
		res.cookie("logged_in", "true");
		res.redirect("/admin/reports");
	}else
		res.redirect("/admin");
});

////////////     reports       //////////////
//PAGE: edit reports
agendas.get('/admin/reports', function(req, res) {
	if(req.cookies.logged_in != "true"){res.redirect("/admin"); return;}
	db.reports.all(function(error, array){
		res.render('reports', {"Reports":array});
	});
});
//AJAX: create a report
agendas.post('/report/add', function(req, res){
	if(req.cookies.logged_in != "true"){res.redirect("/admin"); return;}
	
	db.get("SELECT * FROM reports ORDER BY order_num DESC LIMIT 1", function(err, report){
		db.run("INSERT INTO reports (topic,reporter,order_num)"+
			"VALUES ('"+req.body.topic+"','"+req.body.reporter+"','"+(report.order_num+1)+"');", 
			function(err){
				if(err)console.log(err)
				global.reports_valid = false;
				res.redirect("/admin/reports");
			});
	})
});
//AJAX update a report
agendas.post('/report/update', function(req, res){ 
	if(req.cookies.logged_in != "true"){res.redirect("/admin"); return;}

	db.run("UPDATE reports SET reporter='"+req.body.reporter+"',"
		+" topic='"+req.body.topic+"',"
		+" order_num='"+req.body.order_num+"'"
		+" WHERE report_id="+req.query.report_id+";", function(err){
		if(err)console.log(err)
		global.reports_valid = false;
		res.redirect("/admin/reports");
	});
});
//AJAX: delete a report
agendas.post('/report/delete', function(req, res){
	if(req.cookies.logged_in != "true"){res.redirect("/admin"); return;}
	db.run("DELETE FROM reports WHERE report_id="+req.query.report_id, function(err){
		if(err)console.log(err)
		global.reports_valid = false;
		res.redirect("/admin/reports");
	});
});

////////////       news         //////////////
//PAGE: edit news
agendas.get('/admin/news', function(req, res) {
	if(req.cookies.logged_in != "true"){res.redirect("/admin"); return;}
	utils.getNews(function(member, array){
		res.render('news', {"News":array});
	});
});
//AJAX: create a news topic
agendas.post('/news/add', function(req, res){
	if(req.cookies.logged_in != "true"){res.redirect("/admin"); return;}
	
	db.get("SELECT * FROM news ORDER BY order_num DESC LIMIT 1", function(err, news){
		db.run("INSERT INTO news (topic,old,order_num)"
              +" VALUES ('"+req.body.topic+"','"+req.body.old+"','"+(news.order_num+1)+"');", function(err){
			if(err) console.log(err);
			global.news_valid = false;
			res.redirect("/admin/news");
		});
	})
});
//AJAX: update a news topic
agendas.post('/news/update', function(req, res){
	if(req.cookies.logged_in != "true"){res.redirect("/admin"); return;}
	
	db.run("UPDATE news SET topic='"+req.body.topic+"',"
		+" old='"+req.body.old+"',"
		+" order_num='"+req.body.order_num+"'"
		+" WHERE news_id="+req.query.news_id, function(err){
			if(err) console.log(err);
			global.news_valid = false;
			res.redirect("/admin/news");
		});
});
//AJAX: delete a news topic
agendas.post('/news/delete', function(req, res){
	console.log("wtf");
	if(req.cookies.logged_in != "true"){res.redirect("/admin"); return;}
	
	db.run("DELETE FROM news WHERE news_id="+req.query.news_id, function(err){
		if(err) console.log(err);
		global.news_valid = false;
		res.redirect("/admin/news");
	});
});

////////////     positions     //////////////
//PAGE: edit positions
agendas.get('/admin/positions', function(req, res) {
	if(req.cookies.logged_in != "true"){res.redirect("/admin"); return;}
	
	db.all("SELECT * from positions ORDER BY order_num ASC" , function(err, _positions){
		if(err) console.log(err);
		global.positions_valid = false;
		res.render('people', {"Positions":_positions});
	});
});
//AJAX: add a position
agendas.post('/positions/add', function(req, res){
	if(req.cookies.logged_in != "true"){res.redirect("/admin"); return;}
	
	db.get("SELECT * FROM positions ORDER BY order_num DESC LIMIT 1", function(err, positions){
		db.run("INSERT INTO positions (position_name,assistant,member_name,order_num)"+
			"VALUES ('"+req.body.position_name+"','"+req.body.assistant+"','"+req.body.member_name+"','"+(positions.order_num+1)+"');", function(err){
			if(err) console.log(err);
			global.positions_valid = false;
			res.redirect("/admin/positions");
		});
	});
});
//AJAX: update a position
agendas.post('/positions/update', function(req, res){
	if(req.cookies.logged_in != "true"){res.redirect("/admin"); return;}
	
	db.run("UPDATE positions SET position_name='"+req.body.position_name+"',"
		+" assistant='"+req.body.assistant+"',"
		+" member_name='"+req.body.member_name+"',"
		+" order_num='"+req.body.order_num+"'"
		+" WHERE position_id="+req.query.position_id, function(err){
			if(err) console.log(err);
			global.positions_valid = false;
			res.redirect("/admin/positions");
		});
});
//AJAX: delete a position
agendas.post('/positions/delete', function(req, res){
	if(req.cookies.logged_in != "true"){res.redirect("/admin"); return;}
	
	db.run("DELETE FROM positions WHERE position_id="+req.query.position_id, function(err){
		if(err) console.log(err);
		global.positions_valid = false;
		res.redirect("/admin/positions");
	});
});

//function used to save today's agenda as a complete HTML file.
var save = function(err, report){
	var date = new Date();
	var filename = date.getFullYear() +"_"+ (date.getMonth()+1) +"_"+ (date.getDate()) + ".html"
	fs.writeFile(__dirname + '/public/history/'+filename, report, function(err) {
		if(err) console.log(err);
    });
}
