import express from "express";

const app = express();

// middlaware. We tell server wnen it reciives request that has JSON body (JSON payload)
// it is going to parce it and automatically make that available to us on request.body

app.use(express.json());

app.post("/hello", (req, res) => {
  console.log(req.body);
  res.send("Helllllo");
});

app.listen(8000, () => {
  console.log("Server is listening on port 8000");
});
