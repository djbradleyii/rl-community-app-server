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
   method: 'GET',
   headers: {
     'content-type': 'application/json',
   }
 })
 ```
 * Sample Response
 ```javascript
{
 stats: {
  id: 15,
  gamertag: "DemoChamp001",
  rocket_id: "DemoChamp001#001",
  platform: "Xbox One",
  rank: "Grand Champion",
  division: null,
  lft: true,
  bio: "This is a Demo account. Feel free to explore the app as if you were an active user. "
 },
 inventory: [
   {
    id: 153,
    userid: 15,
    category: "Wheels",
    name: "Aero mage",
    painted: "Crimson",
    rarity: "Common",
    certified: null,
    special_edition: "Infinite",
    count: 1,
    date_created: "2020-01-23T14:00:31.000Z"
   }
  ]
 }
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
