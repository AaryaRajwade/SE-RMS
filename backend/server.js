const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));

// Test route
app.get('/', (req, res) => {
    res.send('Backend is running');
});

app.get('/api/test', (req, res) => {
    res.json({ message: "Hello from backend!" });
});

app.use("/auth", require("./routes/auth"));
app.use("/admin", require("./routes/admin"));
app.use("/property", require("./routes/property"));

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch((err) => console.log(err));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
