# HKPlace-ServerApp

HKPlace-ServerApp is a Node.js web application for submitting and viewing comments about locations in Hong Kong. It supports user authentication via OAuth (Google), user profile management, and CRUD (Create, Read, Update, Delete) operations for comments. The app uses MongoDB for data storage and EJS for its templating engine, providing both RESTful API endpoints and user-friendly web pages.

## Project URLs
- Main Site: https://hkplace-serverapp.onrender.com/
- Add Comment (requires login): https://hkplace-serverapp.onrender.com/add/comment/Aberdeen

## API Endpoints (CRUD Commands)
- **GET**  
  `curl "https://hkplace-serverapp.onrender.com/api/comment/Aberdeen"`
- **POST**  
  `curl -X POST -d 'location=Stanley&content=Test657346' "https://hkplace-serverapp.onrender.com/api/add/comment/"`
- **PUT**  
  `curl -X PUT -d 'content=Modified' "https://hkplace-serverapp.onrender.com/api/comment/Guest"`
- **DELETE**  
  `curl -X DELETE "https://hkplace-serverapp.onrender.com/api/delete/comment/Guest"`

## File & Directory Structure

### server.js
- [server.js](https://github.com/yfc0307/HKPlace-ServerApp/blob/main/server.js)  
  The main entry point for the server. Sets up Express, session management, authentication via Passport and Google OAuth, connects to MongoDB, and defines all routes (for user authentication, comment CRUD, user profile, game/study pages, etc.).

### oauth.js
- [oauth.js](https://github.com/yfc0307/HKPlace-ServerApp/blob/main/oauth.js)  
  Implements OAuth authentication using Passport's Google strategy. Handles serialization and deserialization of user sessions.

### package.json
- [package.json](https://github.com/yfc0307/HKPlace-ServerApp/blob/main/package.json)  
  Lists project dependencies (Express, Mongoose, EJS, Passport, Google OAuth, etc.), metadata, scripts, and engine details.

### models/
- [models/comment.js](https://github.com/yfc0307/HKPlace-ServerApp/blob/main/models/comment.js)  
  Mongoose schema for comments (location, content, author `gid`, timestamp).
- [models/user.js](https://github.com/yfc0307/HKPlace-ServerApp/blob/main/models/user.js)  
  Mongoose schema for users (Google ID, display name, email, level, etc.).

### public/
- [public/styles.css](https://github.com/yfc0307/HKPlace-ServerApp/blob/main/public/styles.css)  
  Main CSS stylesheet for frontend styling.

### views/
- [views/addcomment.ejs](https://github.com/yfc0307/HKPlace-ServerApp/blob/main/views/addcomment.ejs)  
  EJS template for submitting a new comment about a location.
- [views/game.ejs](https://github.com/yfc0307/HKPlace-ServerApp/blob/main/views/game.ejs)  
  Page for a location-based game (requires login).
- [views/home.ejs](https://github.com/yfc0307/HKPlace-ServerApp/blob/main/views/home.ejs)  
  Homepage showing the latest comment, personalized data if signed in.
- [views/study.ejs](https://github.com/yfc0307/HKPlace-ServerApp/blob/main/views/study.ejs)  
  Study page (requires login).
- [views/user.ejs](https://github.com/yfc0307/HKPlace-ServerApp/blob/main/views/user.ejs)  
  User’s profile page.
- [views/useredit.ejs](https://github.com/yfc0307/HKPlace-ServerApp/blob/main/views/useredit.ejs)  
  User profile edit page.

## Languages Used
- JavaScript (46.7%)
- EJS (36.3%)
- CSS (17%)
