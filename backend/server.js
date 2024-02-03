import express from "express"
import dotenv from "dotenv"

import connect from "./db/connect.js"
import rootRouter from "./routes/index.js"

dotenv.config();
const app = express();

app.use(express.json());

// app.get('/', (req, res) => {
//     res.send('Home Page');
// });

app.use('/api', rootRouter);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    connect()
    console.log(`Listening on port ${PORT}`);
});
