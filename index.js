console.log("Welcome");

//sequelize setup

// express

const express = require("express");
const axios = require("axios");
const app = express();
const port = 3000;
const path = require('path');
const { Sequelize } = require("sequelize");
const sequelizeConfig = require("./config/config");
const User = require("./models/usermodel");
const { log } = require("console");

//view engine 
app.set('view engine','ejs');

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

//routes
//route for the root URL
app.get("/", (req, res) => {
  var Path = path.join(__dirname,"views","index");
  console.log("path:"+Path);
  res.render(Path);
});

//route to list users on webpage 

app.get('/users', async (req, res) => {
  try {
    const users = await User.findAll({
      where: {
        fingerprint_id: null,
      },
    });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get("/enroll:rollNo", async (req, res) => {
  try {
    const { rollNo } = req.params; // Get the roll number from the URL parameter
    const url = `http://192.168.1.109/enroll?option=1&id=${rollNo}`
    console.log("url:" , url);
    // Send a request to the NodeMCU server to enroll the fingerprint
    const nodeMCUResponse = await axios.get(
      //ravi yaha pe apna nodemcu wala url daalna 
      `http://192.168.1.109/enroll?option=1&id=${rollNo}`
    );
    // console.log(nodeMCUResponse);
    console.log("Response: ",nodeMCUResponse.data);
    if (nodeMCUResponse.data.status == 1) {
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

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on "http://localhost:${port}"`);
});



//dummy entry
// Create an array of user data to insert
// const userData = [
//   {
//     name: 'Jasmit Rathod',
//     roll_no: 54,
//     year: 4,
//     branch: 'IT',
//     gender: 'M',
//     fingerprint_id: null, // Initially set to null
//   },
//   {
//     name: 'Om Jannu',
//     roll_no: 25,
//     year: 4,
//     branch: 'IT',
//     gender: 'M',
//     fingerprint_id: null, // Initially set to null
//   },
//   {
//     name: 'Tushar Padhy',
//     roll_no: 42,
//     year: 4,
//     branch: 'IT',
//     gender: 'M',
//     fingerprint_id: null, // Initially set to null
//   },
//   {
//     name: 'Ravi Pandey',
//     roll_no: 43,
//     year: 4,
//     branch: 'IT',
//     gender: 'M',
//     fingerprint_id: null, // Initially set to null
//   },
//   {
//     name: 'Vendra',
//     roll_no: 64,
//     year: 4,
//     branch: 'IT',
//     gender: 'F',
//     fingerprint_id: null, // Initially set to null
//   },
//   {
//     name: 'Simar Kaur',
//     roll_no: 15,
//     year: 4,
//     branch: 'IT',
//     gender: 'F',
//     fingerprint_id: null, // Initially set to null
//   },
//   {
//     name: 'Suhani Desale',
//     roll_no: 11,
//     year: 4,
//     branch: 'IT',
//     gender: 'F',
//     fingerprint_id: null, // Initially set to null
//   },
//   {
//     name: 'Saanvi Naik',
//     roll_no: 39,
//     year: 4,
//     branch: 'IT',
//     gender: 'F',
//     fingerprint_id: null, // Initially set to null
//   },
//   {
//     name: 'Kevin Geejo',
//     roll_no: 26,
//     year: 4,
//     branch: 'IT',
//     gender: 'M',
//     fingerprint_id: null, // Initially set to null
//   },
//   {
//     name: 'Vaibhav Patil',
//     roll_no: 50,
//     year: 2023,
//     branch: 'IT',
//     gender: 'M',
//     fingerprint_id: null, // Initially set to null
//   }
// ];

// // Use a loop to create and save each user entry
// (async () => {
//   for (const data of userData) {
//     try {
//       await User.create(data);
//       console.log(`User created: ${data.name}`);
//     } catch (error) {
//       console.error(`Error creating user: ${data.name}`, error);
//     }
//   }
// })();
