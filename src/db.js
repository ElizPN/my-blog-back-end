// we can use MongoClient to connect with data base
import { MongoClient } from "mongodb";
// connect with data base

let db;

async function connectToMongoDB(cb) {
  const client = new MongoClient("mongodb://127.0.0.1:27017");
  await client.connect();

  db = client.db("react-blog-db");
  cb();
}

export { db, connectToMongoDB };
