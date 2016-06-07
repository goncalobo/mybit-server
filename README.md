mybit RESTful API Server
=========

Implementation of RESTful API server using Node.js to support mybit cross-platform application.

Dependencies
-----------

```json
  "dependencies": {
    "activedirectory": "^0.7.2",
    "apn": "^1.7.6",
    "body-parser": "~1.13.2",
    "cookie-parser": "~1.3.5",
    "debug": "~2.2.0",
    "ews-javascript-api": "latest",
    "express": "~4.13.1",
    "jsonwebtoken": "^6.2.0",
    "morgan": "~1.6.1",
    "node-gcm": "^0.14.2",
    "node-schedule": "^1.1.0",
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
<h5>Generate Token</h5>
<code><b>POST: </b>localhost:1337/API/Auth <br></code><br>
<h6>Body Parameters:</h6>
<code><b>STRING</b> email, <b>STRING</b> password        <i>(for Users)</i></code><br>
<code><b>STRING</b> secret                                <i>(for Windows Service)</i></code>
```json
{
  "success": true,
  "token": "secret_token"
}
```

<code><b>GET: </b>localhost:1337/API/Auth/ <br></code>
```json
{
  "username": "feupuser01",
  "displayname": "BORDALO Joao (parceiro)",
  "email": "feupuser01@parceiro.sonae.pt"
}
```
<hr>

<h4>CMX Routes</h4>
<code><b>GET:  </b>localhost:1337/API/CMX/GetLocation?username=<b>\<param\></b></code>

<hr>

<h4>Active Directory Routes</h4>
<code><b>GET:  </b>localhost:1337/API/AD/GetAllUsers</code><br>
```json
[
  {
    "ID": "RJNROCHA",
    "Name": "ROCHA Ricardo Jorge"
  },
  ...
]
```

<code><b>GET:  </b>localhost:1337/API/AD/GetTeams</code><br>
```json
[
  {
    "CN": "ESX Admins"
  },
  {
    "CN": "MCH_Santarem_ILOs"
  }
]
```

<code><b>POST: </b>localhost:1337/API/AD/GetTeamMembers?team=<b>\<param\></b></code>
```json
[
  {
    "ID": "caunint",
    "Name": "Caunint - Monitorizacao"
  },
  {
    "ID": "lneves",
    "Name": "NEVES Antonio Luis"
  },
  ...
]
```

<hr>
<h4>KPI</h4>
<h5>InFlow Stats</h5>
<code><b>GET:  </b>localhost:1337/API/KPI/GetInflowStats/:Place/:Time</b></code><br>
- Place: <b>Building</b> or <b>Floor</b><br>
- Time: <b>Now</b> or <b>History</b>
 ```json
 Building Now
 {
  "TotalVisitors": 0,
  "RepeatVisitors": 0,
  "NewVisitors": 0
}

Building History
{
    {
        "Week": 1,
        "Start": "2016-5-30",
        "End": "2016-6-5",
        "TotalVisitors": 0,
        "RepeatVisitors": 0,
        "NewVisitors": 0
    },
    {
        "Week": 2,
        "Start": "2016-5-23",
        "End": "2016-5-29",
        "TotalVisitors": 1032,
        "RepeatVisitors": 861,
        "NewVisitors": 171
    },
    {
        "Week": 3,
        "Start": "2016-5-16",
        "End": "2016-5-22",
        "TotalVisitors": 12067,
        "RepeatVisitors": 9366,
        "NewVisitors": 2701
    },
    {
        "Week": 4,
        "Start": "2016-5-9",
        "End": "2016-5-15",
        "TotalVisitors": 10615,
        "RepeatVisitors": 8314,
        "NewVisitors": 2301
    }
}

Floors Now
{
  "Piso1TotalVisitors": 0,
  "Piso2TotalVisitors": 0,
  "Piso3TotalVisitors": 0,
  "Piso4TotalVisitors": 0,
  "Piso5TotalVisitors": 0
}

Floors History
{
    "Week1": {
        "Start": "2016-5-30",
        "End": "2016-6-5",
        "Piso1TotalVisitors": 0,
        "Piso2TotalVisitors": 0,
        "Piso3TotalVisitors": 0,
        "Piso4TotalVisitors": 0,
        "Piso5TotalVisitors": 0
    },
    "Week2": {
        "Start": "2016-5-23",
        "End": "2016-5-29",
        "Piso1TotalVisitors": 572,
        "Piso2TotalVisitors": 500,
        "Piso3TotalVisitors": 500,
        "Piso4TotalVisitors": 407,
        "Piso5TotalVisitors": 63
    },
    "Week3": {
        "Start": "2016-5-16",
        "End": "2016-5-22",
        "Piso1TotalVisitors": 5587,
        "Piso2TotalVisitors": 5277,
        "Piso3TotalVisitors": 4914,
        "Piso4TotalVisitors": 4013,
        "Piso5TotalVisitors": 3228
    },
    "Week4": {
        "Start": "2016-5-9",
        "End": "2016-5-15",
        "Piso1TotalVisitors": 4972,
        "Piso2TotalVisitors": 4657,
        "Piso3TotalVisitors": 4445,
        "Piso4TotalVisitors": 3484,
        "Piso5TotalVisitors": 2941
    }
}
 ```
<h5>Application Stats</h5>
<code><b>GET:  </b>localhost:1337/API/KPI/GetAppStats/:query/:period</b></code><br>
- Query: <b>Users</b>, <b>Rooms</b> or <b>Notifications</b><br>
- Period: <b>Weekly</b> or <b>Monthly</b>
```json
Users Weekly
{
  "WeeklyUsers": 4
}

Users Monthy
{
  "MonthtlyUsers": 4
}

Rooms Weekly
{
  "WeeklyCounter": 4
}

Rooms Monthly
{
  "MonthlyCounter": 2
}

Notifications Weekly
{
  "WeeklyNotifications": 3
}

Notifications Monthly
{
  "MonthlyNotifications": 3
}
```

<h5>Room Stats</h5>
<code><b>GET:  </b>localhost:1337/API/KPI/GetRoomStats/:query</b></code><br>
- Query: <b>Booked</b>, <b>Hours</b>, <b>TotalDuration</b> or <b>FormalVSInformal</b>
```json
Booked
[
  {
    "Name": "HeartBIT Room 1E3 F04Pax",
    "TotalCounter": 11
  },
  {
    "Name": "HeartBIT Room 2E3 F04Pax",
    "TotalCounter": 1
  },
  {
    "Name": "HeartBIT Room 1W3 I10Pax",
    "TotalCounter": 0
  },
  {
    "Name": "HeartBIT Room 1W2 F05Pax",
    "TotalCounter": 0
  },
  {
    "Name": "HeartBIT Room 1W1 F05Pax",
    "TotalCounter": 0
  }
]

Hours
[
  {
    "Name": "HeartBIT Room 1E3 F04Pax",
    "TotalHours": 8
  },
  {
    "Name": "HeartBIT Room 1W3 I10Pax",
    "TotalHours": 0
  },
  {
    "Name": "HeartBIT Room 1W2 F05Pax",
    "TotalHours": 0
  },
  {
    "Name": "HeartBIT Room 1W1 F05Pax",
    "TotalHours": 0
  },
  {
    "Name": "HeartBIT Room 1E2 I15Pax",
    "TotalHours": 0
  }
]

Total Duration
{
  "TotalDuration": 8
}

Formal vs Informal
{
  "Formal": 12,
  "Informal": 0
}
```
<hr>

<h4>Booking Routes</h4>
<h5>Booking</h5>
<code><b>POST: </b>localhost:1337/API/Booking <br></code><br>
<h6>Body Parameters:</h6>
<code><b>STRING</b> room, <b>STRING</b> room alias</code><br>
<code><b>STRING</b> start, <b>STRING</b> timestamp (iso format)</code><br>
<code><b>STRING</b> attendees, <b>STRING</b> ["array"] </code><br>

```json
On success:
{
  "success": "Room booked.",
  "start": "2016-06-08T11:30:00.000Z",
  "end": "2016-06-08T12:30:00.000Z",
  "location": "HeartBIT Room 1E3 F04Pax",
  "subject": "BORDALO Joao (parceiro)",
  "duration": 1
}

On overlap:
{
  "error": "Scheduled meetings overlaps existing meetings."
}
```

<h5>Rooms Availability</h5>
<code><b>POST:  </b>localhost:1337/API/Booking/GetAvailability</code><br>
<h6>Body Parameters:</h6>
<code><b>STRING</b> room, <b>STRING</b> room alias</code><br>
<code><b>STRING</b> date, <b>STRING</b> Date YYYY-MM-DD</code><br>
```json
[
  [
    "09:00",
    "10:00"
  ],
  [
    "12:30",
    "13:30"
  ],
  [
    "13:00",
    "14:00"
  ]
]
```

<h5>Scheduled Meetings</h5>
<code><b>POST:  </b>localhost:1337/API/Booking/GetScheduledMeetings</code><br>
<h6>Body Parameters:</h6>
<code><b>STRING</b> room, <b>STRING</b> room alias</code><br>
<code><b>STRING</b> months, <b>INT</b> number of months</code><br>
```json
[
  {
    "startTime": "2016-06-01T07:00:00.000Z",
    "endTime": "2016-06-01T08:00:00.000Z",
    "subject": "MAGALHAES Daniela Sofia"
  },
  {
    "startTime": "2016-06-01T09:00:00.000Z",
    "endTime": "2016-06-01T09:30:00.000Z",
    "subject": "SANTOS Sofia Andrade (parceiro)"
  },
  ...
]
```

<h5>Get Rooms</h5>
<code><b>GET:  </b>localhost:1337/API/Booking/GetRooms</code><br>
```json
[
  {
    "ID": 1,
    "Name": "HeartBIT Room 1E1 F12Pax VC",
    "Alias": "heartbitroom1e1",
    "Email": "heartbitroom1e1@sonae.pt",
    "Floor": 1,
    "Wing": "East",
    "Formal": true,
    "Capacity": 12,
    "LCD": true,
    "Projector": false,
    "Video": true,
    "Sound": false,
    "TotalCounter": 0,
    "TotalHours": 0,
    "WeeklyCounter": 0,
    "MonthlyCounter": 0
  },
  {
    "ID": 2,
    "Name": "HeartBIT Room 1E2 I15Pax",
    "Alias": "heartbitroom1E2",
    "Email": "heartbitroom1E2@sonae.pt",
    "Floor": 1,
    "Wing": "East",
    "Formal": false,
    "Capacity": 15,
    "LCD": false,
    "Projector": false,
    "Video": false,
    "Sound": false,
    "TotalCounter": 0,
    "TotalHours": 0,
    "WeeklyCounter": 0,
    "MonthlyCounter": 0
  },
  ...
]
```
