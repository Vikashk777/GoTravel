const express = require("express");
const app = express();
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const path = require("path");
const Travels = require("./models/travel.js");
const Ticket = require("./models/booking.js");
const session = require("express-session");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const flash = require("connect-flash");
const { ticketSchema } = require("./schema.js");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");




let sessionOption = {
    secret: "mysecretkey",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expire: Date.now() * 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));
app.engine("ejs", ejsMate);

app.use(session(sessionOption));
app.use(flash());



app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

main()
    .then(res => console.log("Connection Success"))
    .catch(err => console.log(err));

async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/GoTravel");
}


app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})


app.listen(3030, (req, res) => {
    console.log("listing port is 3030");
})

app.get("/", (req, res) => {
    res.send("Root Path please enter home route");
})


// validate ticketbooking
const validateTicket = (req, res, next) => {
    let { error } = ticketSchema.validate(req.body);
    if (error) {
        throw new ExpressError(400, error);
    } else {
        next();
    }
}

//
const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash("error", "You must be login!");
        return res.redirect("/login");
    }
    next();
}



// Home route
app.get("/home", async (req, res) => {
    let allTravels = await Travels.find();
    res.render("Travel/home.ejs", { allTravels });
})

app.post("/home", isLoggedIn, wrapAsync(async (req, res) => {
    let { fullname, email, message } = req.body;
    req.flash("success", "You message send!");
    res.redirect("/home");
}))


// All Place route
app.get("/place", async (req, res) => {
    let allTravels = await Travels.find();
    res.render("Travel/places.ejs", { allTravels });
})


// Booking get route
app.get("/booking", isLoggedIn, async (req, res) => {
    res.render("Travel/booking.ejs");
})


// Booking post route
app.post("/booking", isLoggedIn, validateTicket, wrapAsync(async (req, res) => {
    let newTicket = new Ticket(req.body.booking);
    newTicket.owner = req.user._id;
    await newTicket.save();
    req.flash("success", "Ticket Booking is confirm!");
    res.redirect("/booking");

}))


// Booking details
app.get("/tickets", isLoggedIn, async(req,res)=>{
    let  {id}  = req.user;
    let allTickets = await Ticket.find().populate({path : "owner"});
    // console.log(allTickets , id);
    res.render("Travel/tickets.ejs", {allTickets});    
})


// Show route
app.get("/show/:id", isLoggedIn, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let findPlace = await Travels.findById(id);
    res.render("Travel/show.ejs", { findPlace });
}))


// User LOGIN route
app.get("/login", (req, res) => {
    res.render("users/login.ejs");
})

app.post("/login",  passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),  async (req, res) => {
        req.flash("success", "you logged In");
        res.redirect("/home");
})


// User SignUp route
app.post("/signup", wrapAsync(async (req, res) => {
    try {
        let { username, password, email } = req.body;
        let newUser = new User({ username, email });
        let registerUser = await User.register(newUser, password);

        req.login(registerUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Signup Successfully!");
            res.redirect("/home");
        })
    }

    catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}))

app.get("/signup", (req, res) => {
    res.render("users/sign.ejs");
})


// logout route
app.get("/logout", (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "You are Logged Out!");
        res.redirect("/home");
    })
})


app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not found"));
})

// Error handling
app.use((err, req, res, next) => {
    let { statusCode = 404, message = "something went wrong" } = err;
    res.status(statusCode).render("Travel/error.ejs", { err });
})