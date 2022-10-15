const express = require('express');
const path = require('path');
const fs = require('fs');
const util = require('util');
const readFromFile = util.promisify(fs.readFile);
const uuid = require('uuid');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

app.listen(PORT, () =>
  console.log(`Listening at http://localhost:${PORT}`)
);

app.get('/notes', (req, res) =>{
    res.sendFile(path.join(__dirname, '/public/notes.html'));
});

app.get('/api/notes', (req, res)=>{
    console.info(`${req.method} request received for apinotes`);
    readFromFile('./db/db.json').then((data) => res.json(JSON.parse(data)));
});

const writeToFile = (destination, content) =>
  fs.writeFile(destination, JSON.stringify(content, null, 4), (err) =>
    err ? console.error(err) : console.info(`\nData written to ${destination}`)
  );


const readAndAppend = (content, file) => {
    fs.readFile(file, 'utf8', (err, data) => {
      if (err) {
        console.error(err);
      } else {
        const parsedData = JSON.parse(data);
        parsedData.push(content);
        writeToFile(file, parsedData);
      }
    });
};

app.post('/api/notes', (req, res) => {
    console.info(`${req.method} request received to add a tip ${req.body}`);


    const { title, text } = req.body;

    if (req.body) {
      const newNote = {
        title,
        text,
        id: uuid.v4(),
      };
  
      readAndAppend(newNote, './db/db.json');
      res.json(newNote);
    } else {
      res.error('Error in adding tip');
    }
});

app.delete("/api/notes/:id", function(req, res) {
  console.log("req params", req.params.id)
  fs.readFile('./db/db.json', 'utf-8',(err,data)=>{
    if(err){
      console.error(err)
    }else{
      let parsedData = JSON.parse(data)
      console.log(parsedData)
      console.log(req.params.id)
      parsedData = parsedData.filter(({ id }) => id !== req.params.id);
      console.log(parsedData)
      fs.writeFile('./db/db.json', JSON.stringify(parsedData, null, 4), (err) =>
    err ? console.error(err) : console.info(`\nData written`))

    }
  })



  res.json('hi')
  
});

app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/index.html'))
);

