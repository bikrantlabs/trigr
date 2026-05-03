import express, { Request, Response } from "express";
import { loadEnvFile } from "process";
loadEnvFile(".env");

const app = express();
app.use(express.json());

const apiRouter = express.Router();

type IParams = {
  id: string;
};

// GET /api
apiRouter.get("/", async (req: Request, res: Response) => {
  return res.json({ hello: "World" });
});

// GET /api/:id
apiRouter.get("/:id", async (req: Request<IParams>, res: Response) => {
  const query = req.params;
  return res.json({ hello: query.id || "H" });
});

// Pack the apiRouter inside /api
app.use("/api", apiRouter);
/**
 * Run the server!
 */
const start = async () => {
  try {
    const PORT = 8000;
    app.listen(PORT, () => {
      console.log(`Server started at port ${PORT}`);
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
