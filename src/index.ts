import express, { Request, Response } from "express";
import { randomUUID } from "crypto";
import storage from "node-persist";
import cors from "cors";

interface Contact {
  id: string;
  name: string;
  lastName: string;
  phoneNumber: string;
}

storage.init();

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(cors());

const setStoreItem = (data: Contact[], res: Response) => {
  storage.setItem("data", data).then(({ content: { value } }) => {
    res.json(value);
  });
};

app.get("/", async (_, res: Response) => {
  const data = (await storage.getItem("data")) || [];
  res.json(data);
});

app.post("/", async (req: Request<Contact>, res: Response) => {
  const newData = req.body;
  const data: Contact[] = (await storage.getItem("data")) || [];
  const id = randomUUID();
  data.push({ ...newData, id });
  setStoreItem(data, res);
});

app.put("/:id", async (req: Request<Contact>, res: Response) => {
  const { id } = req.params;
  const updatedData: Contact = req.body;
  const data: Contact[] = await storage.getItem("data");

  if (!data.find(({ id: findId }) => findId === id)) {
    res.sendStatus(404);
  }

  const newStore = data.map((item: Contact) => {
    if (item.id === id) {
      return {
        ...item,
        ...updatedData,
      };
    }
    return item;
  });
  setStoreItem(newStore, res);
});

app.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  let data: Contact[] = await storage.getItem("data");

  if (!data.find(({ id: findId }) => findId === id)) {
    res.sendStatus(404);
  }

  data = data.filter((item: Contact) => item.id !== id);
  setStoreItem(data, res);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
