const express = require("express");
require("dotenv").config();
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const PORT = process.env.PORT || 9000;
const seedAdmin = require("./controllers/seedAdminController");
//import routes ----
const userRoutes = require("./routes/usersRoutes");
const companiesRoutes = require("./routes/companiesRoutes");
const path = require("path");
const jobRoutes = require("./routes/jobsRoutes");



//mongoose connect
mongoose.connect("mongodb://localhost:27017/hireboundless", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(async () => {
    console.log("Database connected successfully");
    await seedAdmin();
}).catch((err) => {
    console.log("database connect error:" + err.message);
})


//middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads/avatars', express.static(path.join(__dirname, 'uploads', 'avatars')));
app.use('/uploads/resumes', express.static(path.join(__dirname, 'uploads', 'resumes')));

//routes 
app.use("/", userRoutes);
app.use("/company", companiesRoutes)
app.use("/job", jobRoutes)



//server running 
app.listen(PORT, (error) => {
    if (!error) {
        console.log(`Server is running on port ${PORT}`);
    } else {
        console.log(error.message);
    }
});