const express = require('express');
const path = require('path');
const port = 3000;
const app = express();

app.use(express.static(path.join(__dirname,'public')))

app.get('/',(res,req)=>{
    req.sendFile(path.join(__dirname,'index.html'))
})

app.listen(port,'0.0.0.0',()=>{
    console.log('Server is running in port',port)
})