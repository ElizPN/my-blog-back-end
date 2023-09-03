import express from "express";
// we can use MongoClient to connect with data base
import { MongoClient } from "mongodb";

const app = express();

// middlaware. We tell server wnen it reciives request that has JSON body (JSON payload)
// it is going to parce it and automatically make that available to us on request.body

app.use(express.json());

let articlesInfo = [
  {
    name: "learn-react",
    upvotes: 0,
    comments: []
  },
  {
    name: "learn-node",
    upvotes: 0,
    comments: []
  },
  {
    name: "learn-mongodb",
    upvotes: 0,
    comments: []
  }
];

app.get("/api/articles/:name", async (req, res)=> {
  // get article name from url parametr 
  const {name} = req.params
  // connect with data base
  const client = new MongoClient("mongodb://127.0.0.1:27017");
  await client.connect()

  const db = client.db('react-blog-db')

  // make query to db
  const article = await db.collection("articles").findOne({ name });

  if (article) {
      res.json(article);
  } else {
      res.sendStatus(404)
  }
})

app.put("/api/articles/:name/upvote", async (req, res) => {
  const { name } = req.params;
 
  const client = new MongoClient("mongodb://127.0.0.1:27017");
  await client.connect()

  const db = client.db('react-blog-db')

  await db.collection("articles").updateOne({name}, {
    $inc : {upvotes: 1}
  })

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

  // connect to db
  const client = new MongoClient("mongodb://127.0.0.1:27017");
  await client.connect()

  const db = client.db('react-blog-db')

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

app.listen(8000, () => {
  console.log("Server is listening on port 8000");
});
