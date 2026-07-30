const express = require('express');
require('dotenv').config();

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger-output.json');

const mainRouter = require('./src/routes');
const connectDB = require('./src/config/db');

const app = express();

const cors = require('cors');


app.use(cors());
connectDB();

app.use(express.json());

app.get('/', (req, res) =>{
    res.json({
        "message" : "welcome to homepage"
    })
})

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Mount central router
app.use('/api', mainRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

const errorHandler = require('./src/middleware/errorHandler');

// ... your middleware and app.use('/api', mainRouter) ...

// 404 Route Catch-All
app.use((req, res, next) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Global Error Handler
app.use(errorHandler);