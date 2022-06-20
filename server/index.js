const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const session = require("express-session");
require("dotenv").config();
const socketio = require("socket.io");

// ROUTES:

const {
  logInTeacherRoute,
  registerTeacherRoute,
} = require("./routes/AuthTeacher");
const {
  loginStudentRoute,
  registerStudentRoute,
} = require("./routes/AuthStudent");
const addNewClassRouter = require("./routes/NewClassTeacher");
const enrollInClassRouter = require("./routes/NewClassStudent");
const getAllClassesTeacherRoute = require("./routes/GetClassesTeacher");
const getAllClassesStudentRoute = require("./routes/GetClassesStudent");
const addAssignment = require("./routes/AddAssignment");
const { Class } = require("./models/models");

const app = express();

app.use(express.json());
app.use(morgan("dev"));
app.use(cors({ origin: "*" }));
app.use(express.static(path.resolve(__dirname, "../client/build")));
app.use(
  session({
    secret: `${process.env.SECRET_STRING}`,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60000 },
  })
);

mongoose.connect(`${process.env.DB_URI}`, (err) =>
  err ? console.log(err) : console.log("Connected to DB")
);

app.use("/", logInTeacherRoute);
app.use("/", registerTeacherRoute);
app.use("/", loginStudentRoute);
app.use("/", registerStudentRoute);
app.use("/", addNewClassRouter);
app.use("/", enrollInClassRouter);
app.use("/", getAllClassesTeacherRoute);
app.use("/", getAllClassesStudentRoute);
app.use("/", addAssignment);

app.get("*", (req, res) => {
  res.sendFile(
    express.static(path.resolve(__dirname, "../client/build", "index.html"))
  );
});

const server = app.listen(process.env.PORT || 3009, () =>
  console.log("Server Spinning")
);

// SOCKET SERVER:

const io = socketio(server);

io.on("connection", (socket) => {
  // CONNECTION
  console.log("user connected:", socket.id);

  // JOINING
  socket.on("join_room", (secretKey) => {
    socket.join(secretKey);
    console.log(
      "user:",
      socket.id,
      " has entenred chat for class: ",
      secretKey
    );
  });

  // MESSAGING
  socket.on("send_message", (data) => {
    console.log(data);

    // SENDING TO OTHER USERS IN SAME CHAT
    socket.to(data.secretKey).emit("receiving_msg", data);

    // SAVE IN DB

    Class.find({ secretKey: data.secretKey }, async (err, doc) => {
      err ? console.log(err) : await doc[0].messages.push(data);
      let upDoc = doc[0];
      Class.findOneAndUpdate(
        { secretKey: data.secretKey },
        upDoc,
        { new: true, returnOriginal: false },
        (error, success) => {
          error ? console.log(error) : console.log("Updated");
        }
      );
    });
  });

  // LEAVING ROOM

  socket.on("leave_chat", async (data) => {
    await socket.leave(data.secretKey);
    console.log("User has left room: ", data.secretKey);
  });

  // disconnecting
  socket.on("disconnect", () => {
    console.log("User disconnected from socket server", socket.id);
  });
});
