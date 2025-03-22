const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('../dbs/db');

const signupRoute = require('../routes/signup');
const loginRoute = require('../routes/login');
const verifyEmailRoute = require('../routes/emailver'); 


const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.use('/api/signup', signupRoute);
app.use('/api/login', loginRoute);
app.use('/api', verifyEmailRoute); 

app.get('/', (req, res) => {
  res.send('Backend API is running!');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
