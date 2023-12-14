# SmartRoad:

SmartRoad is a project whose purpose is to keep the driver informed of everything that happens around him, constantly saving data on the elements of the road (passive, such as traffic signs, changing, such as traffic lights, and active, such as the vehicles themselves. ).

Apart from incorporating a cyclist alert which notifies the car driver when his path coincides with that of a cyclist, notifying him of the approximate time of the encounter with the cyclist.

**The company of the project is ITC (Instituto Técnológico de Canarias)**

## Database, its entities and relationships:

These are the database entities that we are using to store all the information for this application to work.

**Vehicles** : This entity has an Unique ID **(UID)**, and the type of vehicle that it is **(Vehicle)**

**Tracks** : This entity has an ID of the track **(ID)**, the location of the track **(Location)**, the status of the vehicle that it tracked **(Status)**, the speed of the vehicle **(Speed)**, a JSON of extra information like an encounter with a bike **(Extra)** and also the Vehicle UID **(Vehicle_UID)**

**Admin** : This entity has and ID of the admin **(ID)**, an username **(Username)**, a password **(Password)** and a filename which is the profile picture **(Filename)**

**Logs** : This entity has and ID of the log **(Log_ID)**, an id of the admin that made an action on a track **(Admin_UID)**
In our database, we assume that an admin (in this case the is an administrator since a common user does not require to login and is anonymous) can manage many tracks and a track can be managed by several administrators. Also, a vehicle can send many tracks and a track only belongs to one vehicle.

## Use Case Diagram

I made this Use Case Diagram to have an idea of all the things that our app can do:

![Use Case Diagram](frontend/public/images/Use1.jpg)

## E/R, UML, Class and Relational Diagrams

According to the previous Entities and Relationships that I explained before, here are the E/R, UML, Class and Relational Diagrams:

**E/R**
![E/R Diagram](frontend/public/images/Er.jpeg)

**UML**
![UML Diagram](frontend/public/images/Uml.jpeg)

**Class**
![Class Diagram](frontend/public/images/class.jpg)

**Relational**
![Relaional Diagram](frontend/public/images/Relational.jpeg)


## Describe the operation of the system and technical specifications for the server application and the mobile and web APPs

## Interface

The interface of the app it's really simple, for the user, two buttons where you decide who you are, and the it send you notifications in case that you are a car driver user, also you have an admin view with some tables where you can manage the data. Below, you have some screenshots of the interface of the app:

### User interface:
This is the home page:
![image](https://github.com/nareesuarezz/SmartRoad/assets/131177598/b0ed9750-0d60-4cc6-a954-07e72c7acf04)

If you log as a car it appears this interface:
![image](https://github.com/nareesuarezz/SmartRoad/assets/131177598/931ec42f-f85d-4903-8cb6-01339b27a259)

And if you log as a bike it appears this interface:
![image](https://github.com/nareesuarezz/SmartRoad/assets/131177598/c27904d9-aef0-4aa3-b377-d4cb369f4914)

### Admin interface:
When you try to enter as an admin, it will apear a login page as the following:
![image](https://github.com/nareesuarezz/SmartRoad/assets/131177598/e941ab32-a5cc-4986-9030-3b57b2cd987b)

Then if you enter succesfully, you will have access to every table of the database (only the track table as an example is shown)
![image](https://github.com/nareesuarezz/SmartRoad/assets/131177598/6856b48a-823b-49d2-9c86-eb845d9ea061)

## Initial Design

My initial design of the application was thinking of a menu with 2 simple buttons, one with a bicycle where you register as a cyclist, and another with a car where you register as a car driver, apart from another more hidden button than the car and bike buttons where you can log in as administrator and access all the data in the database, and I used this idea to the end. My idea is reflected in the following link:

https://www.figma.com/file/rFNs70rKThQkLl0Nqc9rYP/Untitled?type=design&node-id=0%3A1&mode=design&t=jRCTMx0RnjMFJu7F-1

## Manuals of installation
The steps for installing this app are the following:

### Step one: Cloning the repository
```sh
git clone https://github.com/nareesuarezz/SmartRoad/
```
### Step two: Installing the dependencies of both backend and frontend
```sh
cd SmartRoad/backend
npm install

cd SmartRoad/frontend
npm install
```

### Step three: Running both backend and frontend
```sh
cd SmartRoad/backend
npm start

cd SmartRoad/frontend
npm start
```

## User Manual
Here in the pdf you have the user manual of the app
![PDF](frontend/public/images/SmartRoad.pdf)

## Technology Stack:
### Backend (Server):
-Node.js: JavaScript runtime for server-side execution.
-Express.js: Node.js framework for building web applications and APIs.
-Sequelize: ORM (Object-Relational Mapping) for managing SQL databases, specifically for MySQL.
-MySQL: Relational database for storing system information.
-JSON Web Tokens (JWT): For authentication and token generation.

### Frontend (Web Client):
-React: JavaScript library for building user interfaces.
-Axios: HTTP client for making requests to the server.

### Development and Version Control Tools:
-Git: Version control system.
-GitHub: Collaboration platform using Git.
-npm: Package management system for Node.js.

### Technology Comparison:
## Backend (Server):
-Node.js vs. Django (Python): Node.js is suitable for real-time and event-driven applications, while Django is a robust framework for rapid web application development.
-Express.js vs. Flask (Python): Both are minimalistic and flexible frameworks. Express.js is commonly used with Node.js, while Flask is popular in the Python ecosystem.
-Sequelize vs. TypeORM: Both are ORMs for SQL databases in Node.js. Sequelize is more mature and widely used, while TypeORM is known for its TypeScript integration and object-oriented approach.
-MySQL vs. MongoDB: MySQL is a relational database, while MongoDB is a NoSQL database. The choice between them depends on the specific needs of your application.

### Frontend (Web Client):
-React vs. Angular vs. Vue: React is a library, while Angular and Vue are full-fledged frameworks. React is known for its flexibility and simplicity.
-Axios vs. Fetch: Both are used for making HTTP requests in the browser. Axios is easier to use and has more features than Fetch.

## Planification

For the planification, I started doing a repository on GitHub, and I made a develop branch, and I made local branches for specifical issues that I was finding and putting them into my project 
## Conclusion, opinions, reflections





