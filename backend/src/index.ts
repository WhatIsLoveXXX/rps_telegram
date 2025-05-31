import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRouter from "./route/userRoutes";
import roomRouter from "./route/roomRoutes";
import {sendTon} from "./util/TonSenderReceiver";

import {authMiddleware, defaultErrorMiddleware, showInitDataMiddleware} from "./middleware/auth.middleware";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Auth
app.use(authMiddleware);
app.get('/api', showInitDataMiddleware);
app.use(defaultErrorMiddleware);

//Routes
app.use("/api", userRouter)
app.use("/api", roomRouter)

// // Error handling middleware /
// app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
//   console.error(err.stack);
//   res.status(500).json({ message: "Something went wrong!" });
// });

// Start server a 
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// 1. Создаём новый кошелёк

(async () => {
  await tonTest();
})();


async function tonTest() {
  // const zae = await createWallet(); // копируешь адрес, пополняешь через faucet

// 2. После пополнения (например, через минуту), вызываешь:
  const weq = await sendTon('UQDu9MSvI-jLSosK_BsRUjfvIK2G2hCHOTz6ItL_CXrOY4KO', 0.02); 
} 

