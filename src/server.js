import express from "express";
import { db, connectToMongoDB } from "./db.js";
import fs from "fs";
import admin from "firebase-admin";

//fs - path relatively directory we are in ( in our case, it is my-blog-back-end)
const credentials = JSON.parse(fs.readFileSync("./credentials.json"));

// add firebase admin to a back-end
// connect firebase to server ( similar waht we did on front-end)
// we say firebase what credential use in order to connetc to our project
admin.initializeApp({
  credential: admin.credential.cert(credentials),
});

const app = express();
// middlaware. We tell server wnen it reciives request that has JSON body (JSON payload)
// it is going to parce it and automatically make that available to us on request.body
app.use(express.json());

// middleware for firebase
// load the user automatically from the authtoken tht they have included with their headers
// ?
app.use(async (req, res, next) => {
  const { authtoken } = req.headers;

  if (authtoken) {
    try {
      req.user = await admin.auth().verifyIdToken(authtoken);
    } catch (error) {
      res.sendStatus(400);
    }
  }
  next();
});

app.get("/api/articles/:name", async (req, res) => {
  // get article name from url parametr
  const { name } = req.params;

  // get firebase id
  const { uid } = req.user;

  // make query to db
  const article = await db.collection("articles").findOne({ name });

  if (article) {
    const upvoteIds = article.upvoteIds || [];
    // check does user have id and does't it include this id to upvoteIds arrray (has user upvoted it already or not?)
    article.canUpvote = uid && !upvoteIds.include(uid);
    res.json(article);
  } else {
    res.sendStatus(404);
  }
});

app.use((req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.sendStatus(401);
  }
});

app.put("/api/articles/:name/upvote", async (req, res) => {
  const { name } = req.params;
  const { uid } = req.user;

  const article = await db.collection("articles").findOne({ name });

  if (article) {
    const upvoteIds = article.upvoteIds || [];
    const canUpvote = uid && !upvoteIds.include(uid);

    if (canUpvote) {
      await db.collection("articles").updateOne(
        { name },
        {
          $inc: { upvotes: 1 },
          $push: { upvoteIds: uid },
        },
      );
    }
    const updatedaArticle = await db.collection("articles").findOne({ name });

    res.json(updatedaArticle);
  } else {
    res.send("This article doesn't exist");
  }
});

// create new post
app.post("/api/articles/:name/comments", async (req, res) => {
  // get article name from url parametr
  const { name } = req.params;
  // get info from body requst
  const { text } = req.body;
  const { email } = req.email;

  // find article with corresponding name in db and change property comments
  await db.collection("articles").updateOne(
    { name },
    {
      $push: { comments: { postedBy: email, text } },
    },
  );
  // we need to load updated article
  const article = await db.collection("articles").findOne({ name });
  // push new object with same properties
  if (article) {
    res.json(article);
  } else {
    res.send("This article doesn't exist!");
  }
});

connectToMongoDB(() => {
  console.log("Successefully connected to database");
  app.listen(8000, () => {
    console.log("Server is listening on port 8000");
  });
});
