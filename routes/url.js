import express from "express";
import Url from "../models/Url.js";
import { nanoid } from "nanoid";
const router = express.Router();

// POST /shorten - Create a short URL
router.post("/shorten", async (req, res) => {
  const { originalUrl } = req.body;

  if (!originalUrl) {
    return res.status(400).json({ error: "Original URL is required" });
  }

  try {
    const shortId = nanoid(6); // generate 6-character ID

    // Check if the URL already exists
    let existing = await Url.findOne({ originalUrl });
    if (existing) {
      return res.json({
        message: "URL already shortened",
        shortUrl: `${req.protocol}://${req.get("host")}/app/${
          existing.shortId
        }`,
      });
    }

    const newUrl = new Url({ originalUrl, shortId });
    await newUrl.save();

    res.json({
      message: "Short URL created",
      shortUrl: `${req.protocol}://${req.get("host")}/app/${shortId}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /:shortId - Redirect to original URL
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const urlEntry = await Url.findOne({ shortId: id });

    if (!urlEntry) {
      return res.status(404).json({ error: "Short URL not found" });
    }

    // Increment click count
    urlEntry.clicks += 1;
    await urlEntry.save();

    return res.redirect(urlEntry.originalUrl);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
