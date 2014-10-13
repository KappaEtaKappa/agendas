var express = require('express');
var fs = require('fs');

var app = express();
app.set('view engine', 'ejs');
app.use("/static", express.static(__dirname + '/static'));

var ejs = require("ejs");

var positions;
updatePostions(null);

app.listen(80);
app.get('/', function(req, res) {
    var file = __dirname + '/agenda.json';
     
    fs.readFile(file, 'utf8', function (err, data) {
        if (err) {
            console.log('Error: ' + err);
            res.send("Sorry, No agenda at this time");
        }else{
            var date = new Date();
            var time = {
                "date":date.toDateString().replace(" 201", ", 201").replace(" 0", " ")
            }
            topics = JSON.parse(data);
            var obj = merge(merge(topics, positions), time);
            console.log(obj);
            res.render('home', obj);

	    if(new Date().getDay() == 1){
	    	res.render('report', obj, function(err, report){
			var date = new Date();
			var filename = date.getFullYear() +"_"+ (date.getMonth()+1) +"_"+ (date.getDate()) + ".html"
			fs.writeFile(__dirname + '/history/'+filename, report, function(err) {
			if(err) console.log(err);
		    });
		});
            }
        }
    });
});
app.get('/update', function(req, res) {
    updatePostions(function(){
        res.redirect("/");
    });

});

function updatePostions(func){
    var file = __dirname + '/people.json';
     
    fs.readFile(file, 'utf8', function (err, data) {
        positions = JSON.parse(data);
        if(func) func();
    });
}
function merge(obj1, obj2){
    for (var attrname in obj2) { obj1[attrname] = obj2[attrname]; }
    return obj1;
}
function getDayString(day) {
    switch (day) {
        case 0:
            return "Sunday";
        case 1:
            return "Monday";
        case 2:
            return "Tuesday";
        case 3:
            return "Wednesday";
        case 4:
            return "Thursday";
        case 5:
            return "Friday";
        case 6:
            return "Saturday";
    }
    return " ";
}
