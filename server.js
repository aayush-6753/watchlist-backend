const express = require('express');
require('dotenv').config();

const mainRouter = require('./src/routes');
const connectDB = require('./src/config/db');

const app = express();

connectDB();

app.use(express.json());

// Mount central router
app.use('/api', mainRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});