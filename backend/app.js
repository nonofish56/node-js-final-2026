const express = require('express');
const app = express();
const cors = require('cors');

const coachesRouter = require('./routes/coaches');
const creditRouter = require('./routes/credit');
const usersRouter = require('./routes/users');
const adminRouter = require('./routes/admin');

app.use(cors());
app.use(express.json());

app.use('/api/coaches',coachesRouter);
app.use('/api/credit-package', creditRouter);
app.use('/api/users', usersRouter);
app.use('/api/admin', adminRouter);

app.get('/healthcheck', (req,res)=>{
    res.status(200).send('OK');
});



module.exports = app;