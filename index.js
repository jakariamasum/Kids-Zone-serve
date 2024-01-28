const express = require('express');
const cors = require('cors');
require('dotenv').config()

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

//middile wire
app.use(cors());
app.use(express.json())

app.get('/', (req, res) => {
    res.send('Kinds zone available now');
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yzkj8ly.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const toyCollection = client.db('toyCollection').collection('toys');
        const myToysCollection = client.db('toyCollection').collection('myToys');
        const myCartsCollection = client.db('toyCollection').collection('carts');

        //handle get all toy information from db
        app.get('/toys', async (req, res) => {
            const limit = parseInt(req.query.limit) || 20; // Get the limit from the query parameters or default to 20
            const result = await toyCollection.find().limit(limit).toArray();
            res.send(result)
        })



        //handle add toys information in db
        app.post('/my-toys', async (req, res) => {
            const newToy = req.body;
            console.log(newToy)
            const result = await myToysCollection.insertOne(newToy)
            const totalToys = await toyCollection.insertOne(newToy);
        })
        app.post('/addcart', async (req, res) => {
            const newToy = req.body;
            console.log(newToy)
            const totalToys = await myCartsCollection.insertOne(newToy);
        })

        //handle sorting based on price 
        app.get('/my-toys', async (req, res) => {

            const { sort } = req.query;
            let query = {};
            if (req.query?.email) {
                query = { sellerEmail: req.query.email }
            }
            let sortOption = {};
            if (sort === 'asc')
                sortOption = { price: 1 };
            if (sort === 'desc')
                sortOption = { price: -1 };
                const result = await myToysCollection.find(query).sort(sortOption).toArray();
                res.send(result)
            
            
        })
        app.get('/carts', async (req, res) => {

            const { sort } = req.query;
            let query = {};
            if (req.query?.email) {
                query = { userEmail: req.query.email }
            }
            let sortOption = {};
            if (sort === 'asc')
                sortOption = { price: 1 };
            if (sort === 'desc')
                sortOption = { price: -1 };
                const result = await myCartsCollection.find(query).sort(sortOption).toArray();
                res.send(result)
            
            console.log(result)
        })



        //handle get all my toys information
        app.get('/myToys', async (req, res) => {
            const { category } = req.query;
            const result = await toyCollection.find({ subcategory: category }).toArray();
            res.send(result)

        })

        //handle get toy details by id
        app.get('/toy-details/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await toyCollection.findOne(query);
            res.send(result);
        })
        app.get('/my-toy/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await myToysCollection.findOne(query);
            res.send(result);
        })

        //handle delete to delete a toy information
        app.delete('/toys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await myToysCollection.deleteOne(query);
            res.send(result)
        })


        // Handle PUT request to update toy information
        app.put("/toys/:id", async(req, res) => {
            const toyId = req.params.id;
            // console.log(toyId)
            const { price, quantity, description } = req.body;
            const filter = { _id: new ObjectId(toyId) };
            const updateDoc = {
                $set: {
                    price: price,
                    quantity:quantity,
                    description:description
                },
            };
            const result = await myToysCollection.updateOne(filter, updateDoc);

        });


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.listen(port, () => {
    console.log('kids running')
})

