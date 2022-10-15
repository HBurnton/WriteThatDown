//importing required packages
const express = require('express');
const path = require('path');
const fs = require('fs');
const util = require('util');
const readFromFile = util.promisify(fs.readFile);
const uuid = require('uuid');

//Set up port for Heroku and for local
const PORT = process.env.PORT || 3001;

//assign express to app, allow for parsing of JSON and URL parameters
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Allow access to public dir
app.use(express.static('public'));

// /notes sends the notes html
app.get('/notes', (req, res) =>{
    res.sendFile(path.join(__dirname, '/public/notes.html'));
});

//get request for api notes, reads and sends as response the data from db.json
app.get('/api/notes', (req, res)=>{
    console.info(`${req.method} request received for apinotes`);
    readFromFile('./db/db.json').then((data) => res.json(JSON.parse(data)));
});

//takes destination parameter, stingifies JSON, throws error or logs data successfully written
const writeToFile = (destination, content) =>
  fs.writeFile(destination, JSON.stringify(content, null, 4), (err) =>
    err ? console.error(err) : console.info(`\nData written to ${destination}`)
  );

//filesystem reads file as utf, throws error if error or parses data and pushes new array and writes
const readAndAppend = (content, file) => {
    //fs reads file as utf
    fs.readFile(file, 'utf8', (err, data) => {
      if (err) {
        //throws error if error
        console.error(err);
      } else {
        const parsedData = JSON.parse(data);
        parsedData.push(content)
        writeToFile(file, parsedData);
      }
    });
};

//Posting API 
app.post('/api/notes', (req, res) => {
    //logs request has been received goo for testing API
    console.info(`${req.method} request received to add a note ${req.body}`);
    
    //deconstruct the body into variables title and text
    const { title, text } = req.body;
    
    //if the request body exists
    if (req.body) {
      //create a new note with title, text and id assigned using uuid v4
      const newNote = {
        title,
        text,
        id: uuid.v4(),
      };
      //uses read and append function which reads db in passed path and appends passed object
      readAndAppend(newNote, './db/db.json');
      //response is JSON newNote Object
      res.json(newNote);
    } else {
      res.error('Error in adding note');
    }
});

//Set up delete by id. Function takes ID from URL, reads DB, filters read DB by id and filters out if ID matches. Writes the array minus the matched ID.
app.delete("/api/notes/:id", function(req, res) {
  //log the parameters to help troubleshoot
  console.log("req params", req.params.id)
  fs.readFile('./db/db.json', 'utf-8',(err,data)=>{
    if(err){
      console.error(err)
    }else{
      let parsedData = JSON.parse(data)
      parsedData = parsedData.filter(({ id }) => id !== req.params.id);
      fs.writeFile('./db/db.json', JSON.stringify(parsedData, null, 4), (err) =>
      err ? console.error(err) : res.json('fileWritten'))
    }
  })
});

//wildcard get to serve index.html
app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/index.html'))
);

//app listens at specified port above
app.listen(PORT, () =>
  console.log(`Listening at http://localhost:${PORT}`)
);
