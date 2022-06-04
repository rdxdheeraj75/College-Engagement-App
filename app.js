const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
let loggedInUser ;
const saltRounds = 10;
const app = express();

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended: true}));


app.use(session({
  secret: "Our Secret message",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/collegeApp", {useNewUrlParser : true});

const userSchema = new mongoose.Schema({
    username: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("user",userSchema);

// use static authenticate method of model in LocalStrategy
passport.use(User.createStrategy());

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const postSchema = new mongoose.Schema({
  title: String,
  description: String,
  author: String,
  type: String,
  date: Date
});

const Post = mongoose.model("post", postSchema);

app.get("/", function(req, res){
  if(req.isAuthenticated())
  {
    res.redirect("homepage");
  }else
  {
    res.render("home");
  }
});

app.get("/register", function(req, res){
    res.render("register");
});

app.get("/login", function(req, res){
    res.render("login");
});

app.get("/create-post", function(req,res){
  if(req.isAuthenticated())
  {
    res.render("create-post");
  }else
  {
    res.redirect("/");
  }
});

app.get("/blogs/:title",function(req,res){
  const requestedTitle = req.params.title;

 
  Post.findOne({title: requestedTitle}, null,(err,post)=>{
    if(err){
      console.log(err);
    }else{
      res.render("detail",{post: post});
    }
  });
  
});

app.get("/notice", function(req, res){
  res.render("notice");
});

app.get("/about",function(req,res){
  res.render("about",{aboutContent: aboutContent});
});

app.post("/create-post", function(req, res){

  console.log(req);

    const post = new Post({
      title: req.body.postTitle,
      description: req.body.postBody,
      author: loggedInUser.username,
      type: req.body.postType,
      date: new Date()
    });
    

    post.save(function(err){
      if(err){
        console.log(err);
      }else{
        res.render("create-post");
      }
    });
});

app.post("/register", function(req, res){

  User.register({username: req.body.username}, req.body.password, function(err, user){
    if(err)
    {
      console.log(err);
      res.redirect("/register");
    }
    else
    {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/homepage");
      });
    }
  });

});

app.post("/login", function(req, res){
  
    const user = new User({
      username: req.body.username,
      password: req.body.password
    });

    req.logIn(user, function(err){
      if(err){
        console.log(err);
      }else {
        passport.authenticate("local")(req, res ,function(){
          loggedInUser = user;
          res.redirect("/homepage");
        });
      }
    });

  });

app.get("/homepage", function(req, res){

  if(req.isAuthenticated())
  {
    Post.find(function(err,posts){
      if(!err)
      res.render("homepage",{posts :  posts});
    });
    
  }else
  {
    res.redirect("/");
  }
});

app.get("/blog", function(req, res){
  Post.find(function(err,blogs){
    if(!err)
    res.render("blog",{blogs :  blogs});
  });
});

app.get("/logout",function(req, res){
  req.logout(req.user, function(err){
    if(err)
    {
      console.log(err);
    }
    else
    {
      res.redirect("/");
    }
  });
});

app.listen(3000, function(){
    console.log("Server started on port 3000");
});