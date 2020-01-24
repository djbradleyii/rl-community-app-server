# Rocket League Community App API
Rocket League Community App Server serving up the RESTful API to the Rocket League Community App Client. The API follows REST best practices with the endpoints below utilized within the Front End Client. 

## API Documentation

* **Endpoints**
  * **/api/users**
    * GET
    * POST
    * PATCH
    * DELETE
    * _/stats
      * GET
    * **/:userid**
      * GET
  * **/api/items**
    * GET
    * POST
    * DELETE
    
    * Sample Call
  ```javascript
  fetch(`${config.API_ENDPOINT}/users`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(user),
  })
  ```


## Built with
* NodeJS
* ExpressJS
* PostgreSQL

## Demo

- [Client Repo](https://github.com/djbradleyii/rl-community-app)
- [Live Demo](https://rocket-league-community-app.now.sh/)


## Screenshots

Dashboard:
![Dashboard](https://github.com/djbradleyii/rl-community-app/blob/master/src/imgs/screenshots/dashboard.png?raw=true)
