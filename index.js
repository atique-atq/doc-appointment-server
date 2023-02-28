const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

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

function verifyJWT(req, res, next) {

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('unauthorized access');
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
    })

}

async function run() {
  try {
    const users = client.db("docAppointment").collection("users");

    
    app.post('/jwt', (req, res) => {
        const user = req.body;
        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
        res.send({ token })
    })

    //add a service
    app.post("/users", async (req, res) => {
      const service = req.body;
      const result = await serviceCollection.insertOne(service);
      res.send(result);
    });

    //book a service
    app.post("/bookservice", async (req, res) => {
      const service = req.body;
      const result = await bookingCollection.insertOne(service);
      res.send(result);
    });

    //get booking information
    app.get("/bookservice", async (req, res) => {
      const query = { clientEmail: req.query?.email };
      const bookings = await bookingCollection.find(query).toArray();
      res.send(bookings);
    });

    //get all booking information
    app.get("/admindashboard", async (req, res) => {
      const email = req.query?.email
      const query = { email: email, role:"admin" };
      const isAdmin = await usersCollection.findOne(query);
  
      if(!isAdmin){
        const message = `${userInfo.email} is not admin`
        return res.send({ acknowledged: false, message })
      }

      const allBookingInfo = await bookingCollection.find({}).toArray();

      console.log('---All booked items are:', allBookingInfo);
      res.send(allBookingInfo);
    });

    //get services
    app.get("/services", async (req, res) => {
      const query = {};
      const services = await serviceCollection.find(query).toArray();
      res.send(services);
    });

    //service details
    app.get("/servicedetails/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const servicedetails = await serviceCollection.findOne(filter);
      res.send(servicedetails);
    });

    //save a user
    app.post("/users", async (req, res) => {
      const userInfo = req.body;

      //checking if user with same email address already inserted
      const query = { email: userInfo.email };
      const alreadyBooked = await usersCollection.find(query).toArray();
      if (alreadyBooked.length) {
        const message = `Already registered with email ${userInfo.email}`;
        return res.send({ acknowledged: false, message });
      }

      const result = await usersCollection.insertOne(userInfo);
      res.send(result);
    });

    //is a admin user
    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isAdmin: user?.role === "admin" });
    });

    //is a normal user
    app.get("/users/user/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isUser: user?.role === "user" });
    });



    //
  } finally {
    console.log("----single request done---");
  }
}
run().catch(console.log);

app.get("/", async (req, res) => {
  res.send("DocAppointmentBD is running");
});

app.listen(port, () => console.log(`DocAppointmentBD is running on ${port}`));
