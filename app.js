const mongoose   = require("mongoose");
const express    = require("express");
const bodyParser = require("body-parser");

let app       = express();
let http      = require("http").Server(app);
let dbConnect =  "mongodb+srv://toDoAppUser:IlAHINl123!@cluster0-q3ugb.mongodb.net/test?retryWrites=true";

mongoose.connect(dbConnect, { useNewUrlParser: true }, (error) => {
	if (error) {
	    console.log("There was an error connecting to MongoDB");
	} else {
	    console.log("Successfully connected to MongoDB");
	}
});

mongoose.Promise = global.Promise;

let db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error: "));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))
app.use("/", express.static("client/"));

const port = 3000;
http.listen(port);

console.log("Express is now running on port " + port);

// END OF STATIC CODE

let Schema = mongoose.Schema;

let toDoSchema = new Schema({
	username: String,
	title   : String,
	todoBody: String,
	priority: Number, // CHANGE BACK TO NUMBER WHEN PROPERLY CONVERTED
	dueDate : Number, // USE JAVASCRIPT DATE OBJECT
	deleted : Boolean,
	list: String
}); 

let todoModel = new mongoose.model("notes", toDoSchema);

app.post("/createNote", (request, response) => {
	console.log("Request sends the following: ", request.body);
	
    let newNote = new todoModel({
	username: request.body.username,
	title: request.body.title,
	decription: request.body.description,
	priority: request.body.priority,
	dueDate: request.body.dueDate,
	status: request.body.status,
	list: null
    });

	// SAVE NOTE TO MONGODB
	newNote.save((error) => {
		if(error) {
			console.log("Something happened with mongoosee.", error);
			// RESPOND TO FRONT END IF FAILED
			response.sendStatus(500);
			} else {
				console.log("Saved mongoose document successfully");
				// RESPOND TO FRONT END IF SUCCEDED
				response.sendStatus(200);
			}
	});
});

// A POST HANDLER FOR READING NOTES FROM THE DB AND SENDING THEM TO THE FRONT END
app.post("/readNotes", (request, response) => {

	// SEARCHES THE MONGODB DATABASE AND GETS ALL THE NOTES
 	todoModel.find({}, (error, results) => {
		responseState(error, response, {notes: results});
	});
});

//  A POST HANDLER FOR DELETING A NOTE FROM THE DATABASE
app.post("/deleteNote", (request, response) => {

	//MAKE SURE THE REQUET WAS SENT BYT THE VALID USER
	
	//SEARCHES THE MONGODB BY AN ID, AND DELETES THIS DOCUMENT
	todoModel.findByIdAndDelete(request.body._id, (error, results) => {
		responseState(error, response, {notes: results});
	});

});

app.post("/updateNote", (request, response) => {

	let propertiesToUpdate = {
		username  : request.body.username,
        	title     : request.body.title,
	        decription: request.body.description,
        	priority  : request.body.priority,
	        dueDate   : request.body.dueDate,
	        status    : request.body.status,
        	list      : null
	};

	todoModel.findByIdAndUpdate(request.body._id, {}, (error, results) => {
		responseState(error, response, {updated: results});
	
	});
});


function responseState(error, response, send) {

	if (error) {
		console.log("Something happened with mongoose.", error);
		response.sendStatus(500);
	} else {
		console.log(typeof send);
		if (typeof send == "Number") {
			response.sendStatus(send);
		} else if (typeof send == "object") {
			response.send(send);
		}

	}

};

