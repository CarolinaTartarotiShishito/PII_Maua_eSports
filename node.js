require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const MicrosoftStrategy = require('passport-azure-ad-oauth2').Strategy;

const app = express();

// Configure Passport with Microsoft Azure AD strategy
passport.use(new MicrosoftStrategy({
    clientID: process.env.AZURE_CLIENT_ID,
    clientSecret: process.env.AZURE_CLIENT_SECRET,
    callbackURL: process.env.AZURE_CALLBACK_URL,
    tenant: process.env.AZURE_TENANT_ID,
    resource: 'https://graph.microsoft.com',
}, async (accessToken, refreshToken, params, profile, done) => {
    try {
        const user = {
            accessToken,
            refreshToken,
            profile: params,
        };
        return done(null, user);
    } catch (err) {
        return done(err, null);
    }
}));
// Middleware to parse JSON
app.use(express.json());

// Define a simple route to test the connection
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Define a Mongoose schema and model for testing
const TestSchema = new mongoose.Schema({
    name: String,
    age: Number,
});

const TestModel = mongoose.model('Test', TestSchema);

// Route to test MongoDB connection by creating a document
app.post('/test', async (req, res) => {
    try {
        const testDocument = new TestModel(req.body);
        const savedDocument = await testDocument.save();
        res.status(201).json(savedDocument);
    } catch (error) {
        res.status(500).json({ error: 'Failed to save document', details: error.message });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// MongoDB Connection
mongoose.connect('mongodb+srv://maraanny123:y8fmSm6FUr7fXlKW@clustermaua.y9alakd.mongodb.net/?retryWrites=true&w=majority&appName=ClusterMaua', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err);
});

