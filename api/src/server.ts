import express from 'express';
import { UserRoutes } from './routes/routes';

const app = express();
app.use(express.json())

app.use("/api/v1/user",UserRoutes)

app.listen(3000,() => {
    console.log("Server is running on port 3000");
});
