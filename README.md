mybit RESTful API Server
=========

Implementation of RESTful API server using Node.js to support mybit cross-platform application.

Dependencies
-----------

```json
  "dependencies": {
    "activedirectory": "^0.7.2",
    "body-parser": "~1.13.2",
    "cookie-parser": "~1.3.5",
    "debug": "~2.2.0",
    "express": "~4.13.1",
    "jsonwebtoken": "^6.2.0",
    "morgan": "~1.6.1",
    "seriate": "^0.6.1"
  }
```

Installation
--------------

```sh
node ./bin/www
```

API Usage
--------------

<code>
<b>GET:  </b>localhost:1337/API/
</code>

<hr>

<h4>Auth Routes</h4>
<code><b>POST: </b>localhost:1337/API/Auth <br></code><br>
<h5>Body Parameters:</h5>
<code><b>STRING</b> email, <b>STRING</b> password        <i>(for Users)</i></code><br>
<code><b>STRING</b> secret                                <i>(for Windows Service)</i></code>

<hr>

<h4>CMX Routes</h4>
<code><b>GET:  </b>localhost:1337/API/CMX/GetLocation?username=<b>\<param\></b></code>

<hr>

<h4>Active Directory Routes</h4>
<code><b>GET:  </b>localhost:1337/API/AD/GetAllUsers</code><br>
<code><b>GET:  </b>localhost:1337/API/AD/GetTeams</code><br>
<code><b>POST: </b>localhost:1337/API/AD/GetTeamMembers?team=<b>\<param\></b></code>

<hr>

<h4>Booking Routes</h4>
<code><b>GET:  </b>localhost:1337/API/GetRooms</code>
