console.log("Welcome");
const mysql = require("mysql");

//sequelize setup

// express

const express = require("express");
const axios = require("axios");
const app = express();
const port = 3000;
const path = require("path");
const { Sequelize } = require("sequelize");
const sequelizeConfig = require("./config/config");
const User = require("./models/usermodel");
const Attendance = require("./models/attendancemodel");
const ActiveSession = require("./models/activesession");
const { log } = require("console");
const cors = require("cors");
app.use(
  cors({
    origin: "*",
  })
);
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(express.json());

//view engine
app.set("view engine", "ejs");

//static files
app.use(express.static(__dirname + "/views"));
const sequelize = new Sequelize(sequelizeConfig.development);
(async () => {
  try {
    await sequelize.sync({ force: false }); // Use 'true' to drop and recreate tables on each start (in development)
    console.log("Database synced successfully");
  } catch (error) {
    console.error("Error syncing database:", error);
  }
})();

//url
const nodemcuUrl = `http://192.168.137.249`;
//routes
//route for the root URL
app.get("/", (req, res) => {
  var Path = path.join(__dirname, "views", "index");
  console.log("path:" + Path);
  res.render(Path);
});

//route to list users on webpage

app.get("/users", async (req, res) => {
  try {
    const users = await User.findAll({
      where: {
        fingerprint_id: null,
      },
    });
    // console.log(users);
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//Route to enroll a student 
app.get("/enroll:rollNo", async (req, res) => {
  try {
    const { rollNo } = req.params; // Get the roll number from the URL parameter
    const url = `${nodemcuUrl}/enroll?id=${rollNo}`;
    console.log("url:", url);
    // Send a request to the NodeMCU server to enroll the fingerprint
    const nodeMCUResponse = await axios.get(
      //ravi yaha pe apna nodemcu wala url daalna
      `${nodemcuUrl}/enroll?id=${rollNo}`
    );
    // console.log(nodeMCUResponse);
    console.log("Response: ", nodeMCUResponse.data.status);
    if (nodeMCUResponse.data.status == "Enrolled") {
      // If enrollment is successful, update the user's fingerprint_id in the database
      const user = await User.findOne({ where: { roll_no: rollNo } });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Set the user's fingerprint_id to the roll number and save the record
      user.fingerprint_id = rollNo;
      await user.save();

      return res.json({ message: "Enrollment successful", user });
    } else {
      return res.status(400).json({ message: "Enrollment failed" });
    }
  } catch (error) {
    console.error("Error enrolling user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//route for teacher to create the session

app.post("/createSession", async (req, res) => {
  try {
    // Get data from the client request body
    console.log("inside create session");
    const { TeacherName, Subject, Date, TimeSlot } = req.body;

    // Insert the data into the ActiveSession model
    const newActiveSession = await ActiveSession.create({
      TeacherName,
      Subject,
      Date,
      TimeSlot,
    });

    // Send a success response with the inserted data
    res.status(201).json(newActiveSession);
  } catch (error) {
    console.error("Error inserting data into ActiveSession:", error);
    res.status(500).json({ error: "An error occurred while inserting data." });
  }
});

//Route for student to mark attendance
app.post("/markAttendance", async (req, res) => {
  try {
    // Get data from the client request (TeacherName, Subject, TimeSlot, and RollNo)
    const { TeacherName, Subject, TimeSlot, RollNo, Date } = req.body;
    console.log("req.body:", req.body);
    // Query the ActiveSessions table for an active session that matches the criteria
    const activeSession = await ActiveSession.findOne({
      where: {
        TeacherName,
        Subject,
        TimeSlot,
        Date,
        isActive: 1, // Ensure isActive is set to 1
      },
    });

    if (activeSession) {
      console.log(`------------session exists with session id = ${activeSession.SessionId}`);
      // Now, check if the RollNo exists in the User table (assuming 'RollNo' is the column name)
      // const user = await User.findOne({ where: { roll_no } });
      const user = await User.findOne({ where: { roll_no: RollNo } });

      if (user) {
        // Student details match an active session and a user with the provided RollNo exists
        // Insert data into the Attendances table
        console.log(`-------User ${user.name} found with the provided roll No.-----------`);
        const nodemcuResponse = await axios.get(
          `${nodemcuUrl}/verify?id=${RollNo}`,
          { roll_no: RollNo }
        );
        console.log("------NodeMCU req sent ----");
        if (nodemcuResponse.data.status === "Match") {
          // Insert data into the Attendances table
          const attendanceData = {
            SessionId: activeSession.SessionId,
            user_id: user.user_id,
          };
          const attendance = await Attendance.create(attendanceData);
          console.log("Session is active, student exists, attendance recorded.");
          res.json({
            message: "Session is active, student exists, attendance recorded.",
          });
        } else if (nodemcuResponse.data.status === "NoMatch") {
          res.json({ message: "Fingerprint doesn't match. Please retry." });
        } else {
          res.json({ message: "Unknown response from NodeMCU." });
        }
      } else {
        // Student details match an active session, but the provided RollNo does not exist
        res.json({
          message: "Session is active, but the student does not exist.",
        });
      }
    } else {
      // No active session matches the provided criteria
      res.json({ message: "No active session found with the given details." });
    }
  } catch (error) {
    console.error("Error checking active session:", error);
    res
      .status(500)
      .json({ error: "An error occurred while checking the active session." });
  }
});

// Define a POST route to deactivate a session
app.post('/deactivateSession', async (req, res) => {
  try {
    // Get data from the client request body (TeacherName, Subject, TimeSlot, and Date)
    const { TeacherName, Subject, TimeSlot, Date } = req.body;

    // Find the ActiveSession that matches the provided parameters
    const activeSession = await ActiveSession.findOne({
      where: {
        TeacherName,
        Subject,
        TimeSlot,
        Date,
      },
    });

    if (activeSession) {
      // Update the isActive flag to 0
      activeSession.isActive = 0;
      await activeSession.save();

      res.json({ message: 'Session deactivated successfully.' });
    } else {
      res.json({ message: 'No active session found with the given parameters.' });
    }
  } catch (error) {
    console.error('Error deactivating session:', error);
    res.status(500).json({ error: 'An error occurred while deactivating the session.' });
  }
});

//Route to retrieve the attendance data 
app.post('/attendaceDetails', async (req,res)=>{
console.log('-------------------------Inside /attendaceDetails Route ------------------------------ ');

});
// Define the /getattendance route with a POST method
app.post('/getattendance', async (req, res) => {
  try {
    const { TeacherName, Subject, TimeSlot,Date  } = req.body; // Assuming you're sending this data in the request body

    // Step 1: Get the SessionId based on TeacherName, Subject, Date, and TimeSlot
    const session = await ActiveSession.findOne({
      where: { TeacherName, Subject, Date, TimeSlot },
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Step 2: Get Attendances for the found SessionId
    const attendances = await Attendance.findAll({
      where: { SessionId: session.SessionId },
    });

    if (attendances.length === 0) {
      return res.status(404).json({ message: 'No attendance records found for this session' });
    }

    // Step 3: Get user details for the UserIds in attendances
    const userIds = attendances.map((attendance) => attendance.user_id);
    const users = await User.findAll({
      where: { user_id: userIds }, // Use the appropriate field name for your User model
      attributes: ['user_id', 'name', 'roll_no', 'branch'], // Select the fields you want to fetch
    });

    // Step 4: Return the result
    console.log("resultsssss:",users);
    res.json({ session, users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});
// Start the Express server

app.listen(port, () => {

  console.log(`Server is running on "http://localhost:${port}"`);
  console.log(`Server is running on "http://128.199.23.207:${port}"`);
});
