const express = require('express');
const app = express();
const cors = require('cors');

const coachesRouter = require('./routes/coaches');

app.use(cors());
app.use(express.json());

app.use('/api/coaches',coachesRouter);


app.get('/healthcheck', (req,res)=>{
    res.status(200).send('OK');
});



module.exports = app;