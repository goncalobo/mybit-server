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
    "morgan": "~1.6.1",
    "seriate": "^0.6.1"
  }
```

Installation
--------------

```sh
node server.js
```

API Usage
--------------

<code>
<b>GET:  </b>localhost:1337/API/
</code>

<h4>User Routes</h4>
<code><b>GET:  </b>localhost:1337/API/User</code>
<code><b>POST: </b>localhost:1337/API/User <br></code>

<h4>Dummy Routes</h4>
<code><b>GET:  </b>localhost:1337/API/Dummy/GetLocation <br></code>
