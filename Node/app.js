const fs = require('fs');
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const userRoutes = require('./routes/UserRoutes');
const postRoutes = require('./routes/PostRoutes');
const HttpError = require('./models/Http-Error');

const app = express();

app.use(bodyParser.json());

app.use('/uploads/images', express.static(path.join('uploads', 'images')));

app.use((req, res, next) => 
{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader
    (
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  
    next();
});

/* Users Route */
app.use('/api/users', userRoutes);

/* Posts Route */
//app.use('/api/users', postRoutes);

/* The Route Doesn't Exist */
app.use((req, res, next) => 
{
    const error = new HttpError('Could Not Find This Route.', 404);
    throw error;
});

/* Remove The File If The Request Doesn't Completed */
app.use((error, req, res, next) => 
{
    if (req.file) 
    {
        fs.unlink(req.file.path, err => 
        {
            console.log(err);
        });
    }
    if (res.headerSent) 
    {
        return next(error);
    }
    res.status(error.code || 500);
    res.json({ message: error.message || 'An unknown error occurred!' });
});

/* Connect To The Database */
mongoose.connect
(
    `mongodb://127.0.0.1:27017/fashion`, { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true }
)
.then(() => 
{
    app.listen(5000);
})
.catch(err => 
{
    console.log(err);
});