const express = require('express');
const cors = require('cors');
var jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
const app = express();

//Middlewares
app.use(cors());
app.use(express.json());


function verifyJWTToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).send({message: 'Unauthorized user'})
    }
    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.USER_TOKEN, (err, decoded)=>{
        if(err){
            return res.status(403).send({message: 'Forbidden'})
        }
        req.decoded = decoded;
    })
    next()
}
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bdorb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const fruitsCollection = client.db('fruitFest').collection('fruitsCollection');

        //getting all data
        app.get('/fruit', async (req, res) => {
            const query = {};
            const cursor = fruitsCollection.find(query);
            const fruits = await cursor.toArray();
            res.send(fruits)
        })

        //getting single data
        app.get('/fruit/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const fruit = await fruitsCollection.findOne(query);
            res.send(fruit);
        })

        //post data from ui
        app.post('/fruit', async (req, res) => {
            const newItems = req.body;
            const result = await fruitsCollection.insertOne(newItems);
            res.send(result);
        })

        //delete data from ui and database
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
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    quantity: updatedInfo.newQuantity || updatedInfo.removedQuantity
                }
            }
            const result = await fruitsCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })

        //token api
        app.post('/token', async (req, res) => {
            const user = req.body;
            const userToken = jwt.sign(user, process.env.USER_TOKEN, {
                expiresIn: '2d'
            })
            res.send({ userToken })
        })

        //user item
        app.get('/fruits', verifyJWTToken, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            if(email === decodedEmail){
                const query = {email: email};
                const cursor = fruitsCollection.find(query);
                const items = await cursor.toArray();
                res.send(items);
            }

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