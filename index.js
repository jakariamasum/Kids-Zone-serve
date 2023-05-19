const express = require('express');
const cors = require('cors');
const app=express();
const port= process.env.PORT || 5000;
//middile wire
app.use(cors());
app.use(express.json())

app.get('/',(req,res)=>{
    res.send('Kinds zone available now');
}) 

app.listen(port,()=>{
    console.log('kids running')
})

