const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

//mongoDb uri
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.mzfy2kt.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const usersCollection = client.db("docAppointment").collection("users");

    
      app.get('/jwt', async (req, res) => {
        const email = req.query.email;
        console.log('in jwt email is: ', email);
        const query = { email: email };
        const user = await usersCollection.findOne(query);

        // sending token only if user found in out database
        if (user) {
            const token = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            return res.send({ accessToken: token });
        }
        res.status(403).send({ accessToken: '' })
      });

      app.post('/users', async (req, res) => {
        const user = req.body;
        console.log(user);
        const query = { email: user.email }
        const userFromDB = await usersCollection.findOne(query);

        if (!userFromDB){
            const result = await usersCollection.insertOne(user);
            console.log('user created!');
            res.send(result);
        }
        else{
            console.log('user already exists');
        }
      });



  } finally {
    console.log("----single request done---");
  }
}
run().catch(console.log);

app.get("/", async (req, res) => {
  res.send("DocAppointmentBD is running");
});

app.listen(port, () => console.log(`DocAppointmentBD is running on ${port}`));
