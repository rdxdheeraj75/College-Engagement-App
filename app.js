const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

const app = express();

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser : true});

const userSchema = new mongoose.Schema({
    username: String,
    password: String
});

const User = mongoose.model("user",userSchema);


app.get("/", function(req, res){
    res.render("home");
});

app.get("/register", function(req, res){
    res.render("register");
});

app.get("/login", function(req, res){
    res.render("login");
});

app.post("/register", function(req, res){

    const username = req.body.username;
    const password = req.body.password;

    const newUser = new User({
        username: username,
        password: password
    });

    newUser.save(function(err){
        if(err){
            console.log(err);
        }else{
            res.redirect("/homepage");
        }
    });

});

app.post("/login", function(req, res){
    const username = req.body.username;
    const password = req.body.password;
  
    User.findOne({username: username}, function(err, foundUser){
      if(err)
      {
        console.log(err);
      }
      else
      {
        if(foundUser)
        {
          if(foundUser.password === password)
          {
            res.redirect("/homepage");
          }
        }
      }
  
    });
  });

app.get("/homepage", function(req, res){
    res.render("homepage");
});

app.listen(3000, function(){
    console.log("Server started on port 3000");
});