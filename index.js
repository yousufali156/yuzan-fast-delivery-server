const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { MongoClient, ServerApiVersion } = require('mongodb');


dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mr3w9gn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        await client.connect();

        const db = client.db('parcelDB');
        const collection = db.collection('parcels');

        // User Parcels API
        // GET: Fetch parcels (optionally filtered by user email)
        app.get('/parcels', async (req, res) => {
            try {
                const email = req.query.email;
                const query = email ? { createdBy: email } : {};
                const options = {
                    sort: { createdAt: -1 }, // Newest first
                };

                const parcels = await collection.find(query, options).toArray();
                res.send(parcels);
            } catch (error) {
                console.error('❌ Error fetching parcels:', error);
                res.status(500).send({ message: 'Failed to fetch parcels', error: error.message });
            }
        });

        // Post Parcels ok
        app.post('/parcels', async (req, res) => {
            try {
                const newParcel = req.body;

                // Add createdAt, status, and history on the server side if not provided
                newParcel.createdAt = newParcel.createdAt || new Date().toISOString();
                newParcel.status = newParcel.status || 'Pending';
                newParcel.history = newParcel.history || [
                    { status: newParcel.status, timestamp: newParcel.createdAt }
                ];

                const result = await collection.insertOne(newParcel);
                res.status(201).send({
                    message: 'Parcel inserted successfully',
                    insertedId: result.insertedId
                });
            } catch (error) {
                console.error('Error inserting parcel:', error);
                res.status(500).send({ message: 'Failed to insert parcel', error: error.message });
            }
        });

        const { ObjectId } = require('mongodb');

        // DELETE: Delete parcel by ID
        app.delete('/parcels/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const result = await collection.deleteOne({ _id: new ObjectId(id) });

                if (result.deletedCount === 1) {
                    res.send({ message: 'Parcel deleted successfully' });
                } else {
                    res.status(404).send({ message: 'Parcel not found' });
                }
            } catch (error) {
                console.error('❌ Error deleting parcel:', error);
                res.status(500).send({ message: 'Failed to delete parcel', error: error.message });
            }
        });

        // PATCH: Update parcel by ID
        app.patch('/parcels/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const updateData = req.body;

                const result = await collection.updateOne(
                    { _id: new ObjectId(id) },
                    { $set: updateData }
                );

                if (result.matchedCount === 1) {
                    res.send({ message: 'Parcel updated successfully' });
                } else {
                    res.status(404).send({ message: 'Parcel not found' });
                }

            } catch (error) {
                console.error('❌ Error updating parcel:', error);
                res.status(500).send({ message: 'Failed to update parcel', error: error.message });
            }
        });

        // for payment successful
        await axiosSecure.patch(`/parcels/${parcelId}`, {
            paid: true,
            paymentMethod: "bKash", // or "Stripe", "SSLCommerz"
            transactionId: "TXN123456", // replace with actual txn ID from gateway
            paymentDate: new Date().toISOString()
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



// Server is running 
app.get('/', (req, res) => {
    res.send('Parcel server is running 🚚');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});