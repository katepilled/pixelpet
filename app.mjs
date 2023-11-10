import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// configure templating to hbs
app.set("view engine", "hbs");

// will update later to landing page
// initial form for milestone 2
app.get("/", (req, res) => {
    res.render("naming");
})

app.get("/name", (req, res) => {
    res.render("naming");
})

app.post("/name", (req, res) => {
    res.render("naming")

})

app.listen(process.env.PORT || 3000);