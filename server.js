require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const bodyParser = require('body-parser')
const { readdirSync } = require('fs')
const http = require('http')
const jwt = require('jsonwebtoken')
const { Server } = require('socket.io')
const { chatSocket } = require('./socket/ChatSocket')

//Middleware
app.use(morgan('dev'))
app.use(bodyParser.json({ limit: '20mb' }))
app.use(cors())

// Folder-upload-evident
app.use('/api/questionnaire/evidence_files', express.static('evidence_files'))
app.use('/api/questionnaire/evidence_subid', express.static('evidence_subid'))
app.use('/api/questionnaire/user_manual', express.static('user_manual'))


//Routing
readdirSync('./Routes').map((r) => app.use('/api/questionnaire', require('./Routes/' + r)))

// ================= HTTP SERVER =================
const server = http.createServer(app)

// ================= SOCKET.IO =================

//Port
const port = process.env.PORT
//Start Server
server.listen(port, () => {
    console.log('Server + Socket.io running on port', port)
})