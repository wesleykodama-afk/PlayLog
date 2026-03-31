import express from "express";
import cors from "cors";
import { env } from "./config.js";
import routes from "./routes/index.js";

const app = express();

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true
  })
);
app.use(express.json());

app.use("/api", routes);

app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  res.status(500).json({ message: error.message || "Internal server error." });
});

app.listen(env.PORT, () => {
  console.log(`Playlog API running on port ${env.PORT}`);
});
