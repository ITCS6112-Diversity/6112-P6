/**
 * This builds on the webServer of previous projects in that it exports the
 * current directory via webserver listing on a hard code (see portno below)
 * port. It also establishes a connection to the MongoDB named 'project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch
 * any file accessible to the current user in the current directory or any of
 * its children.
 *
 * This webServer exports the following URLs:
 * /            - Returns a text status message. Good for testing web server
 *                running.
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns the population counts of the cs collections in the
 *                database. Format is a JSON object with properties being the
 *                collection name and the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the
 * database:
 * /user/list         - Returns an array containing all the User objects from
 *                      the database (JSON format).
 * /user/:id          - Returns the User object with the _id of id (JSON
 *                      format).
 * /photosOfUser/:id  - Returns an array with all the photos of the User (id).
 *                      Each photo should have all the Comments on the Photo
 *                      (JSON format).
 */

const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");

const async = require("async");

const express = require("express");
const app = express();

// Load the Mongoose schema for User, Photo, and SchemaInfo
const User = require("./schema/user.js");
const Photo = require("./schema/photo.js");
const SchemaInfo = require("./schema/schemaInfo.js");

// XXX - Your submission should work without this line. Comment out or delete
// this line for tests and before submission!
const models = require("./modelData/photoApp.js").models;
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1/project6", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// We have the express static module
// (http://expressjs.com/en/starter/static-files.html) do all the work for us.
app.use(express.static(__dirname));

app.get("/", function (request, response) {
  response.send("Simple web server of files from " + __dirname);
});

/**
 * Use express to handle argument passing in the URL. This .get will cause
 * express to accept URLs with /test/<something> and return the something in
 * request.params.p1.
 * 
 * If implement the get as follows:
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns an object with the counts of the different collections
 *                in JSON format.
 */
app.get("/test/:p1", function (request, response) {
  // Express parses the ":p1" from the URL and returns it in the request.params
  // objects.
  console.log("/test called with param1 = ", request.params.p1);

  const param = request.params.p1 || "info";

  if (param === "info") {
    // Fetch the SchemaInfo. There should only one of them. The query of {} will
    // match it.
    SchemaInfo.find({}, function (err, info) {
      if (err) {
        // Query returned an error. We pass it back to the browser with an
        // Internal Service Error (500) error code.
        console.error("Error in /user/info:", err);
        response.status(500).send(JSON.stringify(err));
        return;
      }
      if (info.length === 0) {
        // Query didn't return an error but didn't find the SchemaInfo object -
        // This is also an internal error return.
        response.status(500).send("Missing SchemaInfo");
        return;
      }

      // We got the object - return it in JSON format.
      console.log("SchemaInfo", info[0]);
      response.end(JSON.stringify(info[0]));
    });
  } else if (param === "counts") {
    // In order to return the counts of all the collections we need to do an
    // async call to each collections. That is tricky to do so we use the async
    // package do the work. We put the collections into array and use async.each
    // to do each .count() query.
    const collections = [
      { name: "user", collection: User },
      { name: "photo", collection: Photo },
      { name: "schemaInfo", collection: SchemaInfo },
    ];
    async.each(
      collections,
      function (col, done_callback) {
        col.collection.countDocuments({}, function (err, count) {
          col.count = count;
          done_callback(err);
        });
      },
      function (err) {
        if (err) {
          response.status(500).send(JSON.stringify(err));
        } else {
          const obj = {};
          for (let i = 0; i < collections.length; i++) {
            obj[collections[i].name] = collections[i].count;
          }
          response.end(JSON.stringify(obj));
        }
      }
    );
  } else {
    // If we know understand the parameter we return a (Bad Parameter) (400)
    // status.
    response.status(400).send("Bad param " + param);
  }
});

/**
 * URL /user/list - Returns all the User objects.
 */
app.get("/user/list", function (request, response) {
  // response.status(200).send(models.userListModel());
  User.find({}, function (err, users) {
    if (err) {
      console.error("Error in /user/list:", err);
      response.status(500).send(JSON.stringify(err));
      return;
    }
    if (users.length === 0) {
      response.status(500).send("Missing Users Info");
      return;
    }

    // Convert user objects to objects with only id, first_name, and last_name
    const userList = [];
    users.forEach((user) => {
      var userListItem = {
        _id: user._id.toString(),
        first_name: user.first_name,
        last_name: user.last_name,
      };
      userList.push(userListItem);
    });
    // console.log("UsersList", userList);
    response.end(JSON.stringify(userList));
  });
});

/**
 * URL /user/:id - Returns the information for User (id).
 */
app.get("/user/:id", function (request, response) {
  const id = request.params.id;
  // const user = models.userModel(id);
  // if (user === null) {
  //   console.log("User with _id:" + id + " not found.");
  //   response.status(400).send("Not found");
  //   return;
  // }
  // response.status(200).send(user);
  User.findById(id, function (err, user) {
    if (err) {
      console.error("Error in /user/:id", err);
      response.status(500).send(JSON.stringify(err));
      return;
    }
    if (user === null) {
      response.status(400).send("User not found");
      return;
    }

    // Convert mongoose object to JSON object and return
    user = JSON.parse(JSON.stringify(user));
    // console.log("User Id", user);
    response.end(JSON.stringify(user));
  });
});

async function getUser(id) {
  // let user = null;
  // User.findById(id, function (err, userItem) {
  //   if (err) {
  //     console.error("Error in /user/:id", err);
  //     return;
  //   }
  //   if (userItem === null) {
  //     return;
  //   }

  //   // Convert mongoose object to JSON object and return
    
  //   user = JSON.parse(JSON.stringify(userItem));
    
    
  //   // console.log("User Id", user);
  // });
  // console.log(user);
  // return user;
  const user = User.findById(id).exec();
  console.log(JSON.parse(JSON.stringify(user)));
  return JSON.parse(JSON.stringify(user));
}

function convertComments(comments) {
  const commentList = [];
  comments.forEach((comment) => {
    var commentListItem = {
      _id: comment._id.toString(),
      comment: comment.comment,
      date_time: comment.date_time,
      user: getUser(comment.user_id.toString()),
    };
    commentList.push((commentListItem));
  });
  return commentList;
}

/**
 * URL /photosOfUser/:id - Returns the Photos for User (id).
 */
app.get("/photosOfUser/:id", function (request, response) {
  const id = request.params.id;
  // const photos = models.photoOfUserModel(id);
  // if (photos.length === 0) {
  //   console.log("Photos for user with _id:" + id + " not found.");
  //   response.status(400).send("Not found");
  //   return;
  // }
  // response.status(200).send(photos);

  Photo.find({
    user_id: new mongoose.Types.ObjectId(id),
  }, function (err, photos) {
    if (err) {
      console.error("Error in /photosOfUser/:id", err);
      response.status(500).send(JSON.stringify(err));
      return;
    }
    if (photos.length === 0) {
      response.status(400).send("Photos not found");
      return;
    }

   
    const photoList = [];
    photos.forEach((photo) => {
      var photoListItem = {
        _id: photo._id.toString(),
        file_name: photo.file_name,
        date_time: photo.date_time,
        user_id: photo.user_id.toString(),
        comments: convertComments(photo.comments),
      };
      photoList.push(photoListItem);
    });
    console.log("Photos", JSON.stringify(photoList));
    response.end(JSON.stringify(photoList));

    
    // async.each(
    //   collections,
    //   function (col, done_callback) {
    //     col.collection.countDocuments({}, function (err, count) {
    //       col.count = count;
    //       done_callback(err);
    //     });
    //   },
    //   function (err) {
    //     if (err) {
    //       response.status(500).send(JSON.stringify(err));
    //     } else {
    //       const obj = {};
    //       for (let i = 0; i < collections.length; i++) {
    //         obj[collections[i].name] = collections[i].count;
    //       }
    //       response.end(JSON.stringify(obj));
    //     }
    //   }
    // );

  });
});



const server = app.listen(3000, function () {
  const port = server.address().port;
  console.log(
    "Listening at http://localhost:" +
      port +
      " exporting the directory " +
      __dirname
  );
});
