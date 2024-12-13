//steps to define express
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const router = require('./routes/router')
require('./database/dbConnection')
//create app
const jobServer = express()

jobServer.use(cors())
jobServer.use(express.json())
jobServer.use(router)
jobServer.use('/uploads',express.static('./uploads'))

//create port 
const PORT = 3000 || process.env.PORT

//Testing server
jobServer.listen(PORT,()=>{
    console.log(`jobServer started running at ${PORT} and waiting for cilent request`);
    
})

//resolving GET request :http://localhost:3000
jobServer.get('/',(req,res)=>{
    res.status(200).send(`<h1 style="color:red">jobServer started at port and waiting for cilent request!-!</h1>`)
    
})
