Local Setup Instructions
1. File Preparation
Open the project folder in an environment like Visual Studio Code that includes a built-in terminal.
Install all required npm packages by running the command: npm install.
Ensure that the package.json file lists all necessary dependencies.
2. SQL Configuration (Assuming MySQL is installed)
Create the database using the root directory. Open the terminal and run the MySQL command. For macOS, an example command is:
/usr/local/mysql/bin/mysql -u root -p.
Enter your password when prompted.

After logging in, execute:
source create_db.sql.
This will initialize the database along with its tables.

Alternatively, if you have MySQL Workbench installed:

Open the application and connect to an existing instance, or create a new one if needed.
Copy and paste the SQL code into a new query tab and execute it.
3. Run the Application
Locate the index.js file in the project directory and execute it using your chosen environment.
The setup should now be operational.
