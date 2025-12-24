require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const bodyParser = require('body-parser')
const {readdirSync} = require('fs')

//Middleware
app.use(morgan('dev'))
app.use(bodyParser.json({limit:'20mb'}))
app.use(cors())

// Folder-upload-evident
app.use('/api/questionnaire/evidence_files', express.static('evidence_files'))


//Routing
readdirSync('./Routes').map((r)=> app.use('/api/questionnaire', require('./Routes/'+r)))

//Port
const port = process.env.PORT
//Start Server
app.listen(port,
    ()=> console.log('Server is running on port 5002')
)