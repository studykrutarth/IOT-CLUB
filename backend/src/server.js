import express, { response } from "express";
import path from "path";
import { ENV } from "./lib/env.js";
import { connectDB } from "./lib/db.js";

const app = express();
const port = ENV.PORT;
const __dirname = path.resolve();

if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("/{*any}", (request, response) => {
    response.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  })
}

app.get("/", (request, response) => {
  response.status(200).json({ msg: "Home endpoint", port: { port } });
})

app.get("/events", (request, response) => {
  response.status(200).json({ msg: "Events EndPoint", port: { port } });
})

const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`server listening at ${port}`);
    });
  } catch (error) {
    console.error("Error Starting the server: ", error);
  }
}

startServer();