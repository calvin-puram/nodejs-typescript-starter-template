# Nodejs/Typescript Starter Template

This is a Nodejs biolerplate template for easy building up of backend web app. It has authentication out of the box with features such as

### Auth Route

- register user,
- login user,
- forgot password,
- reset password,
- get loggedIn user,
- update user password,
- update user details such as email, name
- logout

### User Rooute (Protected)

- get all users,
- get single user,
- delete users

### Home Route

- direct user to home

### Project Architecture

I have chosen to use a Model View Controller Architecture that organises the codebase models, view and controllers.

### Utilities Developed

- auth middleware: This verifies users token whenever they want to visit protected routes.
- user role: This defines user role by default registered users have a role of user.
- error middleware : This intercepts and handles all the errors that occur throughout the flow of the application.

### Security

The API is protected with JWT (JSON WEB TOKEN).This allows the application to identify authorized users and restrict access to data for unauthorised users.

Passwords have also been hashed with strong a crypto-algorithm.

**A structure has been established for the implementation of rate-limiting**, to circumvent DOS security vulnerabilities with the system.

- express-mongo-sanitize: which sanitizes user-supplied data to prevent MongoDB Operator Injection.
- helmet: secure the application by setting various HTTP headers.
- hpp: this protect the app against HTTP Parameter Pollution Attack
