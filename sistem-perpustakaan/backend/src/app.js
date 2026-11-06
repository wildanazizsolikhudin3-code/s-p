const express = require('express');
const cors = require('cors');
const path = require('path');
const errorMiddleware = require('./middlewares/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const memberRoutes = require('./routes/memberRoutes');
const loanRoutes = require('./routes/loanRoutes');
const returnRoutes = require('./routes/returnRoutes');
const userRoutes = require('./routes/userRoutes');
const reportRoutes = require('./routes/reportRoutes');
const settingRoutes = require('./routes/settingRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads/book-covers', express.static(path.join(__dirname, 'uploads/book-covers')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API is running' });
});

// Error handler
app.use(errorMiddleware);

module.exports = app;
