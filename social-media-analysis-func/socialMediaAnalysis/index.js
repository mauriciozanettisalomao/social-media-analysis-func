var Connection = require('tedious').Connection;
var Request = require('tedious').Request
var TYPES = require('tedious').TYPES;

module.exports = function (context, req)  {

    const defaultCount = 5
    const defaultScore = 0.5

    let twitters = new Array();

    let mentions = {
        twitter: twitters
    }

    let response = {
        parameter: "dxc",
        socialMedia: mentions
    }

    var config = {
        userName: process.env["APP_USERNAME"],
         password:  process.env["APP_PASSWORD"],
        server: process.env["APP_SERVER"],
        options: {encrypt: true, database: process.env["APP_DATABASE"]}
    };

    var connection = new Connection(config);
    connection.on('connect', function(err) {
        context.log("Connected");
        getMentions();
    });

    let count = defaultCount
    if (req.query.count) {
        count=req.query.count
    }

    let score = defaultScore
    if (req.query.score) {
        score=req.query.score
    }

    function getMentions() {

        request = new Request("SELECT top "+count+" author, tweettext, createdDate, sentiment FROM AzureTweets where sentiment >= "+score+" order by createdDate desc;", function(err) {
        if (err) {
            context.log(err);}
        });

        request.on('row', function(columns) {
            let _currentData = {};
            _currentData.id = columns[0].value;
            _currentData.user = columns[0].value;
            _currentData.name = "twitter"
            _currentData.text = columns[1].value;
            _currentData.createdAt = columns[2].value;
            _currentData.sentiment = columns[3].value;
            twitters.push(_currentData)
        });

        request.on('requestCompleted', function () {
            
            context.res = {
                status: 200,
                body: response
            }
            context.log(response)
            context.done();
        });
        
        connection.execSql(request);
    }
    
};