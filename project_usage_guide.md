# Smartify Project - Setup Guide

Welcome to the Smartify project! This guide will help you get started by cloning the project, setting up your environment, and running it successfully.

## Prerequisites

Before you begin, ensure you have the following software installed on your machine:

- [Node.js](https://nodejs.org/): Smartify is built with Node.js, so make sure you have it installed. You can download it [here](https://nodejs.org/).

- [Visual Studio Code](https://code.visualstudio.com/): We recommend using VS Code as your code editor. You can download it [here](https://code.visualstudio.com/).

- [MySQL](https://www.mysql.com/): The project uses a MySQL database. You can either set up a MySQL database on your localhost or use a cloud-hosted MySQL database.

## Getting Started

Follow these steps to clone the project and get it up and running on your local machine:

1. Clone the Smartify project from the GitHub repository:

`git clone https://github.com/jasmit21/smartify.git`

2. Open the project directory in Visual Studio Code:

`cd smartify`

`code .`

3. In your terminal, navigate to the project folder
   
4. Install project dependencies using npm


## Database Setup

You have two options for the database setup:

### Cloud Database

If you want to use the cloud-hosted database, you don't need to make any changes to the database configuration.

  ```javascript
  module.exports = {
    development: {
    username: 'your_cloud_username',
    password: 'your_cloud_password',
    database: 'your_cloud_database',
    host: 'your_cloud_host',
    dialect: 'mysql',
  },
  };
  ```

### Local Database

If you prefer to set up a local MySQL database, follow these steps:

1. Install MySQL on your machine and create a new database.

2. Update the database configuration in the project.

- By adding a folder named `config/config.js` file.

- Replace the database host, username, and password with your local MySQL settings:

  ```javascript
  module.exports = {
    development: {
    username: 'your_local_username',
    password: 'your_local_password',
    database: 'your_local_database',
    host: 'localhost', // Change the host to 'localhost'
    dialect: 'mysql',
  },
  };
  ```

3. Once you've updated the database configuration, save the file.

## Starting the Application

With your environment set up and the database configured, you can start the Smartify application:

1. In the project folder, run the following command to start the application using [Nodemon](https://nodemon.io/):

`nodemon index.js`

2. The application should now be running. You can access it in your web browser at `http://localhost:3000`.

## Conclusion

You have successfully set up and launched the Smartify project on your local machine. You can now explore and use the application. If you encounter any issues or have questions, feel free to reach out for assistance. Happy coding!





