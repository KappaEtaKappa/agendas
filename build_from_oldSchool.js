var fs = require("fs");

function getAgenda(){
	var file = __dirname + '/oldSchool/agenda.json';
	var data = fs.readFileSync(file, 'utf8');

	if (!data) {
		console.log('Error: ' + err);
	}else{
		return JSON.parse(data);
	}
	return {};
}
function getPostions(){
	var fs = require("fs");
	var file = __dirname + '/oldSchool/people.json';
	var data = fs.readFileSync(file, 'utf8');

	if (!data) {
		console.log('Error: ' + err);
	}else{
		return JSON.parse(data);
	}
	return {};
}



var sqlite3 = require("sqlite3").verbose();
var file = __dirname + "/db.sqlite";
if (!fs.existsSync(file)) {
	console.log("DB not created");
}

var db = new sqlite3.Database(file);


db.run("DELETE FROM reports");
db.run("DELETE FROM news");
db.run("DELETE FROM positions");
db.run("DELETE FROM history");


var agenda = getAgenda();
console.log(agenda);
db.serialize(function() {
	for (var i = 0; i < agenda.Reports.length; i++) {
		var query = "INSERT INTO reports (reporter,order_num,topic)"
						+ "VALUES ('"+agenda.Reports[i].reporter+"', "+i+", '"+agenda.Reports[i].topic+"');";
		console.log(query);
		db.run(query, function(err){if(err) console.log(err);});
	};
	for (var i = 0; i < agenda.Old.length; i++) {
		var query = "INSERT INTO news (topic,order_num,old)"
						+ "VALUES ('"+agenda.Old[i]+"', "+i+", 'on');";
		console.log(query);
		db.run(query, function(err){if(err) console.log(err);});
	};
	for (var i = 0; i < agenda.New.length; i++) {
		var query = "INSERT INTO news (topic,order_num,old)"
						+ "VALUES ('"+agenda.New[i]+"', "+i+", 'off');";
		console.log(query);
		db.run(query, function(err){if(err) console.log(err);});
	};
});


db.serialize(function() {
	var positions = getPostions();
	var entryCount = 0;
	for (var i = 0; i < positions.length; i++) {
		var position = positions[i].Position
		for (var j = 0; j < positions[i].people.length; j++) {
			var personName = positions[i].people[j];
			var assistant = "off";
			if(personName.indexOf(")") > -1){
				personName = personName.replace(")", "").replace("(", "");
				assistant = "on";
			}

			var query = "INSERT INTO positions (position_name, member_name, order_num,assistant)"
							+ "VALUES ('"+position+"', '"+personName+"', '"+entryCount+"', '"+assistant+"');";
			
			console.log(query);
			entryCount++;
			db.run(query, function(err){if(err) console.log(err);});
		};
	};
});

