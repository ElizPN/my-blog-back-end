import express from "express";

const app = express();

// middlaware. We tell server wnen it reciives request that has JSON body (JSON payload)
// it is going to parce it and automatically make that available to us on request.body

app.use(express.json());

app.post("/hello", (req, res) => {
  res.send(`Hello ${req.body.name}`);
});

app.get("/hello/:name/goodbay/:otherName", (req, res) => {
  console.log(req.params);
  const { name } = req.params;
  res.send(`Hello ${name}!!`);
});

app.listen(8000, () => {
  console.log("Server is listening on port 8000");
});
