const express = require('express');
const app = express();

app.get('/healthcheck', (req,res)=>{
    res.status(200).send('OK');
});

module.exports = app;