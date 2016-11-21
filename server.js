var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var bodyParser = require('body-parser');
var mysql = require('mysql');

// Mysql yhteyden data
var pool = mysql.createPool({
	connectionLimit: 100,
	host: "localhost",
	user: "admin",
	password: "1234",
	database: "GadgetDatabase",
	debug: false
});

// Muutama parserifunktio myöhempään käyttöön
var jsonParser = bodyParser.json({verify: rawBodySaver});

var urlencodedParser = bodyParser.urlencoded({extended: false});
// Tämä tarvitaan että tarvittavat apukirjastot voidaan ladata

app.use('/scripts', express.static(__dirname));

//Linkit
//Tänne tulee laittaa sessiosta riippuen joko login tai listaus, ei toteutettu
app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

app.get('/gadgets/edit/:gadgetnumber', function(req, res){
	var gadgetnumber = req.params.gadgetnumber;
	res.sendFile(__dirname + '/editpage.html');
});

//Toiminnallisuudet

//Listaa kaikki tuotteet
app.get('/gadgets', jsonParser, function(req, res){

	var query = 'SELECT * FROM gadgets';

	pool.getConnection(function (err, connection) {
	    if (err) {
	        console.log("Error: ", err);
	    }
	    else if (connection) {
	        connection.query(query, function (err, rows, fields) {
	            connection.release();
	            console.log(rows);
	            if (err) {
	                console.log("Error: ", err);
	            }
	            else{
	            	res.send(JSON.stringify(rows));
	            }
	        })
	    }
	    else {
	        console.log("No connection");
	    }
	});
});

//Listaa tietty tuote
app.get('/gadgets/:gadgetnumber', function(req, res){
	var gadgetnumber = req.params.gadgetnumber;

	var query = 'SELECT * FROM gadgets WHERE ID = ?';
	console.log(query);

	pool.getConnection(function (err, connection) {
	    if (err) {
	        console.log("Error: ", err);
	    }
	    else if (connection) {
	        connection.query(query, gadgetnumber, function (err, rows, fields) {
	            connection.release();
	            console.log(rows);
	            if (err) {
	                console.log("Error: ", err);
	            }
	            else{
	            	res.send(JSON.stringify(rows));
	            }
	        })
	    }
	    else {
	        console.log("No connection");
	    }
	});
});

//Delete funktio
app.delete('/gadgets/:gadgetnumber', function(req,res){
	var gadgetnumber = req.params.gadgetnumber;

	var query = 'DELETE FROM gadgets WHERE ID = ?';
	console.log(query);

	pool.getConnection(function (err, connection) {
	    if (err) {
	        console.log("Error: ", err);
	    }
	    else if (connection) {
	        connection.query(query, gadgetnumber, function (err, rows, fields) {
	            console.log(rows);
	            if (err) {
	                console.log("Error: ", err);
	            }
	            else{
	            	var newQuery = 'SELECT * FROM gadgets';
        			connection.query(newQuery, function(err, rows, fields){
        				connection.release();
        				console.log("Data deleted");
        				res.send(JSON.stringify(rows));
        			});
	            }
	        })
	    }
	    else {
	        console.log("No connection");
	    }
	});

});

//POST-komento gadgettien lisäämiselle

app.post('/gadgets', jsonParser, function(req, res){
	var dataMissing = false;
	//Koodi lähettää jokatapauksessa bodyn, mutta tämä on kaikenvaralta
	if(!req.body) res.json({"message": "no data"});

	//Koska koodi lähettää aina bodyn, tämä tarvitaan oikeasti tarkastamaan tiedot
	var gadgetname = req.body.Name;
	if(req.body.Name === undefined || req.body.Description === undefined || req.body.Latidute === undefined || req.body.Longidute === undefined){
		console.log("Something was missing, not running POST");
		dataMissing = true;
		//res.json({"message": "Something is missing!"});
	}

	if(!dataMissing){
		var json_object = {
			Name: req.body.Name,
			Description: req.body.Description,
			Latidute: req.body.Latidute,
			Longidute: req.body.Longidute
		}

		//Tarkastetaan onko nimellä jo jotain dataa
		var checkQuery = 'SELECT * FROM gadgets WHERE Name=?';
		console.log(checkQuery);

		pool.getConnection(function (err, connection) {
		    if (err) {
		        console.log("Error: ", err);
		    }
		    else if (connection) {
		    	//Tarkastetaan onko nimellä jo jotain dataa
		        connection.query(checkQuery, json_object.Name, function (err, rows, fields) {
		        	//console.log(json_object.Name);
		        	//console.log(rows.length);
		            if (err) {
		                console.log("Error: ", err);
		                connection.release();
		            }
		            else{
		            	//Jos jotain löytyy, lähetetään vanha lista
		            	if(rows.length > 0){
		            		var newQuery = 'SELECT * FROM gadgets';
							connection.query(newQuery, function(err, rows, fields){
								if(err){
									connection.release();
									console.log("Error: ", err);
								}
								else{
									connection.release();
									console.log("data already exists");
									res.send(JSON.stringify(rows));
								}
							});
		            	}
		            	//Lisätään uusi gadget
		            	else{
		            		var addingQuery = 'INSERT INTO gadgets SET ?';

		            		connection.query(addingQuery, json_object, function(err, rows, fields){
		            			if(err){
		            				console.log("Error: ", err);
		            			}
		            			else{
		            				var newQuery = 'SELECT * FROM gadgets';
		            				connection.query(newQuery, function(err, rows, fields){
		            					if(err){
		            						connection.release();
		            						console.log("Error: ", err);
		            					}
		            					else{
			            					connection.release();
			            					console.log("Added data to database");
			            					res.send(JSON.stringify(rows));
			            				}
		            				});
		            			}
		            		});
		            	}
		            }
		    	});
		    }
		});
	}
	//Jos jotain dataa puuttuu post komennosta, lähetetään vanha lista 
	else{
		pool.getConnection(function (err, connection) {
		    if (err) {
		        console.log("Error: ", err);
		    }
		    else if (connection) {
				var newQuery = 'SELECT * FROM gadgets';
				connection.query(newQuery, function(err, rows, fields){
					if(err){
						connection.release();
						console.log("Error: ", err);
					}
					else{
						connection.release();
						console.log("No data was given");
						res.send(JSON.stringify(rows));
					}
				});
			}
		});
	}
});

//PUT-funktio editille

app.put('/gadgets', jsonParser, function(req, res){
	var dataMissing = false;
	//Koodi lähettää jokatapauksessa bodyn, mutta tämä on kaikenvaralta
	if(!req.body) res.json({"message": "no data"});

	//Koska koodi lähettää aina bodyn, tämä tarvitaan oikeasti tarkastamaan tiedot
	var gadgetname = req.body.Name;
	if(req.body.ID === undefined){
		console.log("No ID, not running GET");
		dataMissing = true;
		//res.json({"message": "Something is missing!"});
	}
	if(!dataMissing){
		var json_object = {
			ID: req.body.ID
		};

		//Tarkista jokainen kenttä, tyhjiä kenttiä ei oteta huomioon vaan säilytetään vanha data
		if(req.body.Name != ''){
			json_object["Name"] = req.body.Name;
		}
		if(req.body.Description != ''){
			json_object["Description"] = req.body.Description;
		}
		if(req.body.Latidute != ''){
			json_object["Latidute"] = req.body.Latidute;
		}
		if(req.body.Longidute != ''){
			json_object["Longidute"] = req.body.Longidute;
		}

		console.log(json_object);
		/*/ Vanha tapa, tämä lisää tyhjiä kenttiä, virhe on app.js tiedostossa
		var json_object = {
			ID: req.body.ID,
			Name: req.body.Name,
			Description: req.body.Description,
			Latidute: req.body.Latidute,
			Longidute: req.body.Longidute
		}/*/

		//Tarkastetaan löytyykö kyseisellä ID:llä gadgettia
		var checkQuery = 'SELECT * FROM gadgets WHERE ID=?';
		console.log(checkQuery);

		pool.getConnection(function (err, connection) {
		    if (err) {
		        console.log("Error: ", err);
		    }
		    else if (connection) {
		    	//Tarkastus
		        connection.query(checkQuery, json_object.ID, function (err, rows, fields) {
		        	console.log(json_object.ID);
		        	console.log(rows.length);
		            if (err) {
		                console.log("Error: ", err);
		                connection.release();
		            }
		            else{
		            	//Jos jotain löytyy, päivitetään data
		            	if(rows.length > 0){
		            		var updateQuery = 'UPDATE gadgets SET ? WHERE ID=?';

		            		connection.query(updateQuery, [json_object, json_object.ID], function(err, rows, fields){
		            			console.log("Updated data");
		            			var newQuery = 'SELECT * FROM gadgets';
		            			connection.query(newQuery, function(err, rows, fields){
		            				connection.release();
		            				res.send(JSON.stringify(rows));
		            			});
		            		});
		            	}
		            	//Muussa tapauksessa lähetetään takaisin vanha lista gadgeteista
		            	else{  
	        				var newQuery = 'SELECT * FROM gadgets';
	        				connection.query(newQuery, function(err, rows, fields){
	        					connection.release();
	        					console.log("Name already exists");
	        					res.send(JSON.stringify(rows));
	        				});
		            	}
		            }
		    	});
		    }
		});
	}
	//Jos ID:tä ei löydy edit käskystä, lähetetään vanha gadgetlista
	else{
		pool.getConnection(function (err, connection) {
		    if (err) {
		        console.log("Error: ", err);
		    }
		    else if (connection) {
				var newQuery = 'SELECT * FROM gadgets';
				connection.query(newQuery, function(err, rows, fields){
					if(err){
						connection.release();
						console.log("Error: ", err);
					}
					else{
						connection.release();
						console.log("No data was given");
						res.send(JSON.stringify(rows));
					}
				});
			}
		});
	}
});

//
var rawBodySaver = function(req, res, buf, encoding){
	if(buf && buf.length){
		req.rawBody = buf.toString(encoding || 'utf8');
	}

};

app.listen(8080);
console.log("Server is running on 8080");
