import express from "express";
import { db, connectToMongoDB } from "./db.js";

const app = express();

// middlaware. We tell server wnen it reciives request that has JSON body (JSON payload)
// it is going to parce it and automatically make that available to us on request.body
app.use(express.json());

app.get("/api/articles/:name", async (req, res) => {
  // get article name from url parametr
  const { name } = req.params;

  // make query to db
  const article = await db.collection("articles").findOne({ name });

  if (article) {
    res.json(article);
  } else {
    res.sendStatus(404);
  }
});

app.put("/api/articles/:name/upvote", async (req, res) => {
  const { name } = req.params;

  await db.collection("articles").updateOne(
    { name },
    {
      $inc: { upvotes: 1 }
    }
  );

  const article = await db.collection("articles").findOne({ name });

  if (article) {
    res.send(`The ${name} article has now ${article.upvotes} upvotes!!!`);
  } else {
    res.send("This article doesn't exist");
  }
});

// create new post
app.post("/api/articles/:name/comments", async (req, res) => {
  // get article name from url parametr
  const { name } = req.params;

  // get info from body requst
  const { postedBy, text } = req.body;

  // find article with corresponding name in db and change property comments
  await db.collection("articles").updateOne(
    { name },
    {
      $push: { comments: { postedBy, text } }
    }
  );

  // we need to load updated article
  const article = await db.collection("articles").findOne({ name });

  // push new object with same properties
  if (article) {
    res.send(article.comments);
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
