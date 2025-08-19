if(process.env.NODE_ENV !="production"){
  require("dotenv").config();
}


const express=require("express");
const app=express();
const mongoose = require('mongoose');
const path=require("path");
const methodOverride=require("method-override");
const ejsMAte=require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const listingRouter=require("./routes/listing.js");
const reviewsRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");
const session=require("express-session");
const MongoStore=require("connect-mongo");
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMAte);
app.use(express.static(path.join(__dirname,"public")));


// Connecting to DataBase

const dburl=process.env.ATLASDB_URL;

main()
.then((res)=>{
    console.log("database is connected");
}) 
.catch(err => console.log(err));

async function main() {
  await mongoose.connect(dburl);
}



const Store=MongoStore.create({
  mongoUrl:dburl,
  crypto:{
    secret:process.env.SECRET,
  },
  touchAfter:24*3600,
});

Store.on("error",()=>{
  console.log("error in mongo session store");
});

const sessionOPtions={
  Store,
  secret:process.env.SECRET,
  resave:false,
  saveUninitialized:true,
  cookie:{
    expires:Date.now()+7*24*60*60*1000,
    maxAge:7*24*60*60*1000,
    httpOnly:true
  },
};

// sessions
app.use(session(sessionOPtions));
app.use(flash());


// authentication and authorization
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// flash Messages
app.use((req,res,next)=>{
  res.locals.success=req.flash("success");
  res.locals.error=req.flash("error");
  res.locals.currUser=req.user;
  next();
});


// Express routes
app.use("/listing",listingRouter);
app.use("/listing/:id/reviews",reviewsRouter);
app.use("/",userRouter);

// app.all("*", (req, res, next) => {
//   next(new ExpressError(404, "Page Not Found!"));
// });

app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "page not found" } = err;
  res.status(statusCode).render("error.ejs",{message});
});

app.listen(8080,(req,res)=>{
    console.log("app is listining");
});
 