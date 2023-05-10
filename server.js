"use strict";

const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/front/homepage.html");
});

app.get("/front/:filename", (req, res) => {
  const file = req.params.filename;
  res.sendFile(__dirname + "/front/" + file);
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
app.use(express.static("front"));

app.use(bodyParser.json());
app.set("view engine", "ejs");

const { MongoClient, ObjectId } = require("mongodb");
const uri = require("./atlas_uri");
console.log(uri);

const client = new MongoClient(uri);
const db = client.db("Tender");

//
class Base {
  constructor(_id) {
    this._id = _id;
  }
  static async findItemInCollection(item, collectionName, one = true) {
    try {
      const collection = db.collection(collectionName);
      const docs = await collection.find(item).toArray();
      if (one) {
        return docs[0];
      } else {
        return docs;
      }
    } catch (err) {
      console.error("Error finding documents:", err);
      throw err;
    }
  }

  static async addNewItemInCollection(item, collectionName, res) {
    try {
      const collection = db.collection(collectionName);

      const result = await collection.insertOne(item);
      if (result.acknowledged) {
        res.json({ response: true });
      } else throw new Error("Result was not acknowledged");
    } catch (err) {
      console.log(`Error inserting document: ${err.message}`);
    }
  }
}

class User extends Base {
  constructor(_id, name, username, password) {
    super(_id);
    this.account_name = name;
    this.account_username = username;
    this.account_password = password;
  }

  IsLogged() {
    return this.account_username != undefined;
  }

  async addToDB(res) {
    try {
      const collection = db.collection("users");

      const result = await collection.insertOne(this);
      if (result.acknowledged) {
        res.json({ response: true });
        currentUser = this;
      } else throw new Error("Result was not acknowledged");
    } catch (err) {
      console.log(`Error inserting document: ${err.message}`);
    }
  }

  async tryLogIn(res) {
    try {
      const collection = db.collection("users");

      await collection
        .find({
          account_username: this.account_username,
          account_password: this.account_password,
        })
        .toArray()
        .then((docs) => {
          if (docs[0] === undefined) throw new Error("Not found");
          currentUser = docs[0];
          res.json({ response: true, currentUserId: currentUser._id });
        })
        .catch((err) => {
          if (err.message === "Not found") {
            res.json({ response: false, cause: "notFound" });
          } else res.json({ response: false, cause: "serverError" });
          console.error("Error finding documents:", err);
        });
    } catch (err) {
      console.log(`Didn't find ${this}: ${err.message}`);
    }
  }
}
class Tender extends Base {
  constructor(
    _id,
    title,
    description,
    expPrice,
    ownerCompany,
    keywords,
    ownerId,
    acceptedBid,
    active
  ) {
    super(_id);
    this.title = title;
    this.description = description;
    this.expPrice = expPrice;
    this.ownerCompany = ownerCompany;
    this.keywords = keywords;
    this.ownerId = ownerId;
    this.acceptedBid = acceptedBid;
    this.active = active;
  }

  async delete() {
    await collectionTenders.deleteOne({ _id: this._id });
    const bidQuery = { tenderId: this._id };
    await collectionBids.deleteMany(bidQuery);
  }
  async toggleActive() {
    this.active = !this.active;
    const update = { $set: { active: this.active } };
    const options = { upsert: false };

    await collection.updateOne(filter, update, options);
  }
}
class Bid extends Base {
  constructor(
    _id,
    tenderId,
    ownerCompany,
    price,
    description,
    ownerId,
    active
  ) {
    super(_id);
    this.tenderId = tenderId;
    this.ownerCompany = ownerCompany;
    this.price = price;
    this.description = description;
    this.ownerId = ownerId;
    this.active = active;
  }
}
//
//

//
let currentUser = new User();
app.get("/logged", (_, res) => {
  const loggedIn = currentUser.IsLogged();
  console.log(`Logged: ${loggedIn}`);
  const data = { logged: loggedIn, currentUserId: currentUser._id || "" };
  res.send(data);
});

//
// Register
app.post("/reg", async (req, res) => {
  try {
    await client.connect();

    const user = req.body;
    const newUser = new User(new ObjectId(), ...Object.values(user));
    const foundUser = await User.findItemInCollection(
      { account_username: newUser.account_username },
      "users"
    );
    if (foundUser === undefined) {
      await newUser.addToDB(res);
    } else {
      res.json({ response: false, cause: "exists" });
    }
  } catch (err) {
    res.json({ response: false, cause: "serverErr" });
    console.error(`Error: ${err}`);
  } finally {
    await client.close();
  }
});
//
//Log

app.post("/log", async (req, res) => {
  try {
    await client.connect();

    const request = req.body;
    const user = new User(
      new ObjectId(),
      "-",
      Object.values(request)[1],
      Object.values(request)[2]
    );
    console.log(Object.values(user));
    if (request.log === "out") {
      currentUser = {};
    } else if (request.log === "in") {
      await user.tryLogIn(res);
    }
  } catch (err) {
    console.error(`Error: ${err}`);
  } finally {
    await client.close();
  }
});

app.post("/newTender", async (req, res) => {
  try {
    await client.connect();

    const tender = new Tender(
      new ObjectId(),
      ...Object.values(req.body),
      currentUser._id,
      false,
      true
    );
    await Base.addNewItemInCollection(tender, "tenders", res);
  } catch (err) {
    res.json({ response: false, cause: "serverErr" });
    console.error(`Error: ${err}`);
  } finally {
    await client.close();
  }
});

app.get("/myTenders", async (req, res) => {
  await client.connect();
  const my = await Base.findItemInCollection(
    { ownerId: currentUser._id },
    "tenders",
    false
  );
  const data = { myTenders: my };
  res.send(data);
});

app.post("/findTenders", async (req, res) => {
  try {
    await client.connect();

    const collection = db.collection("tenders");

    const keywords = req.body.keywords;
    const query = { keywords: { $in: keywords }, active: true };
    const docs = await collection.find(query).toArray();

    res.json({ foundTenders: docs });
  } catch (err) {
    console.log(`Error finding tenders: ${err.message}`);
  } finally {
    client.close();
  }
});

app.post("/deleteTender", async (req, res) => {
  try {
    await client.connect();

    const collectionTenders = db.collection("tenders");
    const collectionBids = db.collection("bids");

    const id = req.body.tenderId;
    const tender = await Base.findItemInCollection(
      { _id: new ObjectId(id) },
      "tenders"
    );

    await tender.delete();

    res.json({ response: true });
  } catch (err) {
    console.log(`Error deleting tender: ${err.message}`);
    res.json({ response: false });
  } finally {
    await client.close();
  }
});

app.post("/toggleActive", async (req, res) => {
  try {
    await client.connect();

    const collection = db.collection("tenders");
    const id = req.body.tenderId;
    const filter = { _id: new ObjectId(id) };
    const tender = await collection.findOne(filter);
    const updatedTender = new Tender(...Object.values(tender));

    await updatedTender.toggleActive();

    res.json({ response: true, tender: updatedTender });
  } catch (err) {
    console.log(`Error: ${err.message}`);
    res.json({ response: false });
  } finally {
    await client.close();
  }
});

app.post("/newbid", (req, res) => {
  (async function () {
    try {
      await client.connect();

      const bid = new Bid(
        new ObjectId(),
        ...Object.values(req.body),
        currentUser._id,
        true
      );
      await Base.addNewItemInCollection(bid, "bids", res);
    } catch (err) {
      res.json({ response: false, cause: "serverErr" });
      console.error(`Error: ${err}`);
    } finally {
      await client.close();
    }
  })();
});

app.post("/showBids", (req, res) => {
  (async function () {
    try {
      await client.connect();

      const tenderId = req.body.tenderId;
      const query = { tenderId: tenderId, active: true };
      const docs = await Base.findItemInCollection(query, "bids", false);
      const tender = await Base.findItemInCollection(
        { _id: new ObjectId(tenderId) },
        "tenders"
      );

      res.json({ bids: docs, tender: tender });
    } catch (err) {
      console.log(`Error finding bids: ${err.message}`);
    } finally {
      client.close();
    }
  })();
});

app.post("/acceptBid", async (req, res) => {
  try {
    await client.connect();

    const bidId = req.body.id;

    const query = { _id: new ObjectId(bidId) };
    const bid = await Base.findItemInCollection(query, "bids");

    const collection = db.collection("tenders");

    const tender = { _id: new ObjectId(bid.tenderId) };
    const update = { $set: { acceptedBid: bid } };
    const options = { upsert: false };

    await collection.updateOne(tender, update, options);

    res.json({ response: true });
  } catch (err) {
    res.json({ response: false });
    console.log(`Error accepting: ${err.message}`);
  } finally {
    client.close();
  }
});

app.get("/tender/:id", async (req, res) => {
  try {
    await client.connect();
    const collection = db.collection("tenders");
    const id = req.params.id;
    const tender = await collection.findOne({ _id: new ObjectId(id) });
    res.render("tender-view", { tender });
  } catch (err) {
    console.log(`Error urlgen: ${err.message}`);
  } finally {
    await client.close();
  }
});
