var fs = require("fs");
global.positions_valid = false;
global.history_valid = false;
global.news_valid = false;
global.reports_valid = false;

global.cache_positions = [];
global.cache_history = [];
global.cache_news = [];
global.cache_reports = [];
// this module exists to proved access to the db
// while also managing caching

// this application can expect to recieve heavy load
// for a breif period of time at long intervals. Because
// of this we cache the agenda information on miss or 
// when the cache entry has been set dirty by the admin panel
module.exports = {
	getPositions : function(funk){
		var readyToReturn = false;
		if( !global.positions_valid ){//check for miss
			//miss, get from db
			global.db.all("SELECT * from positions ORDER BY order_num" , function(err, _positions){
				if(!err){
					var postions_ajusted = {};
					for (var i = 0; i < _positions.length; i++) {
						//positions in the db are simply listed but our output will be
						//displayed as shallow tree 
						//Positions
						//|-Position0
						//  |-person
						//  |-assistant
						//|-Position1
						//  |-person
						//  |-assistant
						//simply put, they need to organized before they are cached
						if(postions_ajusted[_positions[i].position_name] == undefined)
							//if the position has not been added to the return list,
							//create it
							postions_ajusted[_positions[i].position_name] = {
								leader:[],
								assistant:[]
							};

						//add the position's member to EITHER leader list OR assistants list
						if(_positions[i].assistant == "FALSE")
							postions_ajusted[_positions[i].position_name].leader.push(_positions[i].member_name);
						else{
							postions_ajusted[_positions[i].position_name].assistant.push(_positions[i].member_name);
						}
					};
					//set object in cache
					//set clean
					//callback
					global.cache_positions = postions_ajusted;
					global.positions_valid = true;
					funk("Positions", postions_ajusted);
				}else
					funk("Positions", []);
					//fuckkk...

				readyToReturn = true;
			});
		}else{
			// return on cache hit
			funk("Positions", global.cache_positions);
		}
	},

	getNews : function(funk){
		var readyToReturn = false;

		//this one's easy, works like a regular cache
		if( !global.news_valid ){
			global.db.all("SELECT * from news ORDER BY order_num" , function(err, _news){
				if(!err){
					global.cache_news = _news;
					global.news_valid = true;
					funk("News", _news);
				}
				else
					funk("News", []);

				readyToReturn = true;
			});
		}else{
			funk("News", global.cache_news);
		}
	},

	getReports : function(funk){
		var readyToReturn = false;

		//same as previous
		if( !global.reports_valid ){
			global.db.all("SELECT * from reports ORDER BY order_num" , function(err, _reports){
				if(!err){
					global.cache_reports = _reports;
					global.reports_valid = true;
					funk("Reports", _reports);
				}
				else
					funk("Reports", []);

				readyToReturn = true;
			});
		}else{
			funk("Reports", global.cache_reports);
		}
	},


	getHistory : function(funk){
		var readyToReturn = false;
		
		//this call actually doesnt do caching, it is just fitting the paradigm 
		//theres no good way to control when this is actually dirty or clean. 
		fs.readdir("public/history" , function(err, _history){
			if(!err){
				_history.sort(function(a,b){
					  if (a < b)
					     return 1;
					  if (a > b)
					    return -1;
					  return 0;
				});

				// _history = _history.slice(0,15);

				for (var i = 0; i < _history.length; i++) {
					var filename = _history[i];
					var name = filename.split(".")[0].split("_");
					_history[i] = {
						href:"/history/"+filename,
						name:name[1]+"/"+name[2]+"/"+name[0],
						date:new Date(name[1]+"/"+name[2]+"/"+name[0]).getTime()
					};
				};


				global.cache_history = _history;
				global.history_valid = true;
				funk("History", _history);
			}
			else
				funk("History", []);

			readyToReturn = true;
		});
	}

}