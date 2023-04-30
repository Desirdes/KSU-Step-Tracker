# Introduction 
The KSU Department of Exercise Science and Sport Management wants to have a system that allows their patients to input their general information, such as age, sex, race, etc., and their medical info, such as body composition, weight, etc., and step count so that the system can display their target weight, current step count, and target step count.

# Contributors
* Kristie Boyd - Team Lead/Project Manager
* Alexandria Fuller - Frontend Developer/Supprt Manager
* Santhiya Subramanian - Frontend Developer/Quality & Process Manager
* Armando Negron Achecar - Backend Developer/Planning Manager
* David Sanford - Backend Developer/Development Manager

# Installation Process
1. Download the IntelliJ Ultimate version: https://www.jetbrains.com/idea/download/
   2. Get the student license to get all developer tools from Jetbrains: https://www.jetbrains.com/community/education/#students
2. Download Java: https://www.java.com/en/download/manual.jsp
3. Download Node.JS version 18.15.0: https://nodejs.org/en/#download

# Software Dependencies
* [Springboot Initializer](https://spring.io/)
  * _We are using Java version 8 for our project_
  * Includes the following dependencies:
    * Spring Boot DevTools
    * Spring Web
    * H2 Database
    * Thymeleaf
  * Visual Studio (for frontend)
* [Angular](https://angular.io/cli)
  * _Already installed with our IntelliJ version_
  * Run the following code in the Terminal to Install the CLI using the npm package manager:
    * `npm install -g @angular/cli`
  * After installing, a new patch alert may be displayed to update npm to version 9.4.2. Ignore this.
  * Run the following code to :
    * `ng new KSU-Step-Tracker`
    * choose CSS
    * `cd KSU-Step-Tracker`
    * 
  * Open Visual Studio and open the KSU-Step-Tracker folder
    * ng build --build project for production 
    * npm start --start production server 
    * ng serve --run development build
