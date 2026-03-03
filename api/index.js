const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Ligado ao MongoDB EcoGuard...'))
    .catch(err => console.error('Erro de ligação ao MongoDB:', err));

// Schema
const ActivitySchema = new mongoose.Schema({
    title: String,
    category: String,
    risk: String,
    description: String,
    date: { type: Date, default: Date.now },
    status: { type: String, default: 'Pendente' }
});

const Activity = mongoose.model('Activity', ActivitySchema);

// Routes
app.get('/api/activities', async (req, res) => {
    try {
        const activities = await Activity.find().sort({ date: -1 });
        res.json(activities);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/activities', async (req, res) => {
    const activity = new Activity({
        title: req.body.title,
        category: req.body.category,
        risk: req.body.risk,
        description: req.body.description
    });

    try {
        const newActivity = await activity.save();
        res.status(201).json(newActivity);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Stats Route
app.get('/api/stats', async (req, res) => {
    try {
        const count = await Activity.countDocuments();
        res.json({ activeActivities: count });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// app.listen() is not needed for Vercel Serverless Functions
module.exports = app;
