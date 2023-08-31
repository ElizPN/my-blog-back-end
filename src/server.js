import express from "express";

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

app.put("/api/articles/:name/upvote", (req, res) => {
  const { name } = req.params;
  const articele = articlesInfo.find(a => a.name === name);

  if (articele) {
    articele.upvotes += 1;
    res.send(`The ${name} article has now ${articele.upvotes} upvotes!!!`);
  } else {
    res.send("This article doesn't exist");
  }
});

// create new post

app.post("/api/articles/:name/comments", (req, res) => {
  // get article name from url parametr
  const { name } = req.params;

  // get info from body requst
  const { postedBy, text } = req.body;

  // beforee we insert our data (postedBy and text) to comments, we have to find corresponding article in our "database"
  const article = articlesInfo.find(a => a.name === name);

  // push new object with same properties
  if (article) {
    article.comments.push({ postedBy, text });
    res.send(article.comments);
  } else {
    res.send("This article doesn't exist!");
  }
});

app.listen(8000, () => {
  console.log("Server is listening on port 8000");
});
