var http = require("http");
var static = require("node-static");
var Speech = require("./speech");

// Node static: public folder
var public = new(static.Server)("./public");

// The robot
var Bot = require("./bot");

// Create http server    
http.createServer(function (req, res) {

    if (req.url === "/insert" && req.method === "POST") {
        
        var message = "";

        req.on("data", function (data) {
            message += data.toString();
        });

        req.on("end", function () {
            Bot.insertMessage(message, function (err, data) {
                if (err) { return res.end(JSON.stringify(err)); }

                res.end(JSON.stringify(data, null, 4));
            });
        });

        return;
    }
    
    if (req.url === "/get") {
        
        var sentData = "";

        req.on("data", function (data) {
            sentData += data.toString();
        });

        req.on("end", function () {
            

            if (!sentData) { return res.end("Missing data."); }

            try {
                sentData = JSON.parse(sentData);
            }
            catch (e) {
                return res.end("Invalid data.");
            }

            var message = sentData.message;
            var talk = sentData.talk;

            // Get message from robot
            Bot.getMessage(message, function (err, message) {
     
                if (err) { return res.end(JSON.stringify(err)); }

                var dataToSend = {
                    message: message
                };

                console.log("$", talk);
                // If talk === true, send mp3 link. 
                if (talk) {

                    Speech.ro(message, function (err, mp3Link) {
                        
                        dataToSend.mp3Link = mp3Link;
     
                        if (err) { return res.end(JSON.stringify(dataToSend, null, 4)) }

                        res.end(JSON.stringify(dataToSend, null, 4));
                    });

                    return;
                }
                
                res.end(JSON.stringify(dataToSend, null, 4));
            });
        });

        return;
    }

    // Serve files from public directory
    public.serve(req, res, function (err) {
        if (err) { public.serveFile("/404.html", 404, {}, req, res); }
    });
}).listen(3000);