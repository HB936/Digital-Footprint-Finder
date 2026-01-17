const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");
const multer = require("multer");
const path = require("path");
const { spawn, exec } = require("child_process");
const puppeteer = require("puppeteer");
const fs = require("fs").promises;
const os = require("os");
const { translate } = require("google-translate-api-x");


// Load environment variables
dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Middleware
app.use(cors());
app.use(express.json());

/* -------------------- EMAIL CHECK -------------------- */
app.post("/api/email", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const response = await axios.get(
      `https://api.xposedornot.com/v1/check-email/${email}`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "DigitalFootprintFinder/1.0",
        },
        timeout: 10000,
      }
    );

    const result = {
      email: response.data.email,
      status: response.data.status,
      breaches: response.data.breaches ? response.data.breaches[0] : [],
      breachCount: response.data.breaches ? response.data.breaches[0].length : 0,
    };

    res.json(result);
  } catch (apiError) {
    console.error("Email API Error:", apiError.message);
    res.status(500).json({
      error: "Failed to check email",
      details: apiError.message,
    });
  }
});

/* -------------------- USERNAME CHECK -------------------- */
app.post("/api/username", async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    const sherlockPath = path.resolve(__dirname, '..', 'sherlock', 'sherlock.py');
    const sherlock = spawn("python3", [
      sherlockPath,
      "--timeout", "10",
      "--print-found",
      username
    ]);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    sherlock.stdout.on('data', (data) => {
      res.write(`data: ${data.toString()}\n\n`);
    });

    sherlock.stderr.on('data', (data) => {
      console.error(`Sherlock stderr: ${data}`);
    });

    sherlock.on('close', (code) => {
      console.log(`Sherlock process exited with code ${code}`);
      res.end();
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* -------------------- PHONE CHECK -------------------- */
app.post("/api/phone", async (req, res) => {
  console.log("Request received for /api/phone");
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: "Phone number is required" });

    const phoneinfogaPath = path.resolve(__dirname, "..", "phoneinfoga", "phoneinfoga_linux");
    const command = `${phoneinfogaPath} scan -n ${phone}`;

    exec(command, (error, stdout, stderr) => {
      console.log("stdout:", stdout);
      console.error("stderr:", stderr);
      if (error) {
        console.error(`Execution Error: ${stderr}`);
        return res.status(500).json({
          error: "Failed to run phone number scan.",
          details: stderr,
        });
      }

      const output = stdout.toString();
      const results = {};

      const localInfoRegex =
        /Raw local:\s*(.*?)\s*Local:\s*(.*?)\s*E164:\s*(.*?)\s*International:\s*(.*?)\s*Country:\s*(.*?)\s*2 scanner/s;
      const localMatch = output.match(localInfoRegex);

      if (localMatch) {
        results.raw_local = localMatch[1].trim();
        results.local = localMatch[2].trim();
        results.e164 = localMatch[3].trim();
        results.international = localMatch[4].trim();
        results.country = localMatch[5].trim();
      }

      const generalSearchRegex = /General:[\s\S]*?URL:\s*(https[^\s]*)/;
      const generalMatch = output.match(generalSearchRegex);
      if (generalMatch) results.google_search_url = generalMatch[1].trim();

      console.log("Parsed results:", results);
      if (Object.keys(results).length === 0)
        return res
          .status(404)
          .json({ error: "No structured information found.", details: output });

      res.json(results);
    });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({
      error: "Internal server error.",
      details: error.message,
    });
  }
});

/* -------------------- IMAGE REVERSE SEARCH -------------------- */
app.post("/api/image", upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Image file is required" });

  const tmpPath = path.join(os.tmpdir(), `upload-${Date.now()}.jpg`);
  await fs.writeFile(tmpPath, req.file.buffer);

  let browser;
  try {
    console.log("Launching browser for Yandex reverse search...");

    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-gpu",
        "--disable-dev-shm-usage",
        `--user-data-dir=${path.join(os.tmpdir(), 'puppeteer-profile')}`
      ],
      ignoreDefaultArgs: ["--enable-automation"],
    });

    const page = await browser.newPage();
    page.setDefaultTimeout(60000);

    // ✅ Use yandex.com (not /images/search)
    await page.goto("https://yandex.com", { waitUntil: "domcontentloaded" });
    console.log("Page loaded");

    // Accept cookies if prompted
    try {
      await page.evaluate(() => {
        const btn = document.querySelector('button[role="button"], button');
        if (btn && /accept|agree/i.test(btn.innerText)) btn.click();
      });
    } catch (_) { }

    // ✅ Upload via Yandex camera input
    await page.waitForSelector("input#image-search", { visible: true, timeout: 20000 });
    const fileInput = await page.$("input#image-search");
    await fileInput.uploadFile(tmpPath);
    console.log("Image uploaded...");

    // Wait for redirect and results
    await page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 60000 });
    await new Promise((resolve) => setTimeout(resolve, 3000));
    console.log("Results page loaded - Search tab");

    // ✅ STEP 1: Extract data from the Search tab FIRST
    console.log("Extracting data from Search tab...");
    const searchTabData = await page.evaluate(() => {
      const getText = (sel) => document.querySelector(sel)?.innerText || "";
      const title = getText("h1") || getText(".CbirObjectResponse-Title") || getText("title");
      const description = getText(".CbirObjectResponse-Text") || getText(".CbirObjectResponse") || getText(".cbir-block") || "";

      const sites = Array.from(document.querySelectorAll("a"))
        .map((a) => a.href)
        .filter((href) => href.startsWith("http"))
        .slice(0, 15);

      return { title, description, sites };
    });
    console.log("Search tab data extracted:", { title: searchTabData.title, siteCount: searchTabData.sites.length });

    // ✅ STEP 2: Now click on "Similar images" tab
    try {
      console.log("Looking for Similar images tab...");
      
      // Wait for the tab to be available
      await page.waitForSelector('a[data-cbir-page-type="similar"]', { timeout: 10000 });
      
      // Click the Similar images tab
      await page.click('a[data-cbir-page-type="similar"]');
      console.log("Clicked Similar images tab");
      
      // Wait for navigation to similar images page
      await page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 30000 }).catch(() => {});
      
      // Additional wait for images to fully load
      await new Promise((resolve) => setTimeout(resolve, 4000));
      console.log("Similar images tab loaded");
      
      // Log current URL to verify
      const currentUrl = page.url();
      console.log("Current page URL:", currentUrl);
      
    } catch (err) {
      console.log("Error clicking similar images tab:", err.message);
    }

    // ✅ STEP 3: Extract similar images from the Similar images tab
    console.log("Extracting similar images...");
    const similarImagesData = await page.evaluate(() => {
      const seenUrls = new Set();
      
      // Target the specific Yandex image class
      const imageElements = document.querySelectorAll("img.ImagesContentImage-Image");
      console.log("Found ImagesContentImage-Image elements:", imageElements.length);
      
      const similarImages = Array.from(imageElements)
        .map((img) => {
          // The src might be relative (//avatars.mds.yandex.net/...)
          let src = img.src;
          
          // Convert protocol-relative URLs to https
          if (src && src.startsWith("//")) {
            src = "https:" + src;
          }
          
          return src;
        })
        .filter((src) => {
          if (!src) return false;
          if (!src.startsWith("http")) return false;
          if (src.includes("data:image")) return false;
          
          // Check if we've seen this exact URL
          if (seenUrls.has(src)) return false;
          
          seenUrls.add(src);
          return true;
        })
        .slice(0, 50); // Get up to 50 unique images

      return similarImages;
    });
    console.log("Similar images extracted:", similarImagesData.length);

    // ✅ STEP 4: Combine data from both tabs
    const results = {
      title: searchTabData.title,
      description: searchTabData.description,
      sites: searchTabData.sites,
      similarImages: similarImagesData
    };

    // Use translate package (CommonJS compatible)
    if (results.title) {
      const titleRes = await translate(results.title, { to: "en", client: "gtx" });
      results.title = titleRes.text;
      
      // If title is the default Yandex title, replace it
      if (results.title === "Yandex Images: search for images") {
        results.title = "Similar Images";
      }
    }

    if (results.description) {
      const descRes = await translate(results.description, { to: "en", client: "gtx" });
      results.description = descRes.text;
    }

    await browser.close();
    await fs.unlink(tmpPath);

    res.json({ success: true, data: results });
  } catch (err) {
    console.error("Reverse image search error:", err);
    if (browser) await browser.close().catch(() => { });
    await fs.unlink(tmpPath).catch(() => { });
    res.status(500).json({
      error: "Reverse image search failed",
      details: err.message,
    });
  }
});

/* -------------------- START SERVER -------------------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
