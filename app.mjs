import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// configure templating to hbs
app.set("view engine", "hbs");

// middleware that logs request method, route, query, and body
app.use(express.urlencoded({ extended: false }));


// will update later to landing page
// initial form for milestone 2
app.get("/", (req, res) => {
  res.render("landing");
});


app.get("/name", (req, res) => {
  res.render("naming");
});

app.get("/login", (req, res) => {
    res.render("login")
})

app.post("/name", (req, res) => {
  res.send("You named your pet " + req.body["name"] + "!");
});

app.listen(process.env.PORT || 3000);
