const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
const app = express();

//middlewares
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bdorb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const fruitsCollection = client.db('fruitFest').collection('fruitsCollection');

        //loading all data
        app.get('/fruit', async (req, res) => {
            const query = {};
            const cursor = fruitsCollection.find(query);
            const fruits = await cursor.toArray();
            res.send(fruits)
        })

        //loading single data
        app.get('/fruit/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const fruit = await fruitsCollection.findOne(query);
            res.send(fruit);
        })

        //post data
        app.post('/fruit', async (req, res) => {
            const newItems = req.body;
            const result = await fruitsCollection.insertOne(newItems);
            res.send(result);
        })

        //delete data
        app.delete('/fruit/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await fruitsCollection.deleteOne(query);
            res.send(result);
        })

        //update a fruits info

        app.put('/fruit/:id', async (req, res) => {
            const id = req.params.id;
            const updatedInfo = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true }
            const updatedDoc = {
                $set: {
                    quantity: updatedInfo.newQuantity || updatedInfo.removedQuantity
                }
            }
            const result = await fruitsCollection.updateOne(filter,  updatedDoc, options);
            res.send(result);
        })

    }
    finally {

    }
}

run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Running server')
})

app.listen(port, () => {
    console.log('Listening to port', port);
})