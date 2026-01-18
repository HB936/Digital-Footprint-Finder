// Vercel Serverless Function Handler
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

// Serve frontend static files
const frontendDistPath = path.join(__dirname, '../frontend/dist');
const fs_sync = require('fs');
if (fs_sync.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
}

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

    const sherlockPath = '/app/sherlock/sherlock_project/sherlock.py';
    const pythonExecutable = 'python3';
    const sherlock = spawn(pythonExecutable, [
      sherlockPath,
      '--timeout', '30',
      '--print-found',
      username
    ], {
      cwd: '/app/sherlock',
      stdio: ['pipe', 'pipe', 'pipe']
    });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    sherlock.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`Sherlock output: ${output}`);
      const lines = output.split('\n');
      for (const line of lines) {
        if (line.startsWith('[+]')) {
          const parts = line.split(': ');
          if (parts.length > 1) {
            const platform = parts[0].replace('[+] ', '').trim();
            const url = parts.slice(1).join(': ').trim();
            const result = {
              platform,
              exists: true,
              url,
            };
            res.write(`data: ${JSON.stringify(result)}\n\n`);
          }
        }
      }
    });

    sherlock.stderr.on('data', (data) => {
      console.error(`Sherlock stderr: ${data}`);
    });

    sherlock.on('close', (code) => {
      console.log(`Sherlock process exited with code ${code}`);
      res.end();
    });

    sherlock.on('error', (error) => {
      console.error(`Sherlock spawn error: ${error}`);
      res.status(500).json({ error: `Failed to spawn Sherlock: ${error.message}` });
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* -------------------- PHONE CHECK -------------------- */
app.post("/api/phone", async (req, res) => {
  if (!process.env.VERCEL) {
    return res.status(501).json({
        error: "Phone number scanning is not supported in the local environment.",
        details: "This feature requires a specific binary that is built for the deployment environment. It will be available in the deployed application."
    });
  }

  console.log("Request received for /api/phone");
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: "Phone number is required" });

    const phoneinfogaPath = path.resolve(__dirname, "..", "phoneinfoga", "phoneinfoga_linux");
    const command = `"${phoneinfogaPath}" scan -n ${phone}`;

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
        "--disable-dev-shm-usage",
      ],
      dumpio: true,
    });

    const page = await browser.newPage();
    page.setDefaultTimeout(60000);

    await page.goto("https://yandex.com", { waitUntil: "domcontentloaded" });
    console.log("Page loaded");

    try {
      await page.evaluate(() => {
        const btn = document.querySelector('button[role="button"], button');
        if (btn && /accept|agree/i.test(btn.innerText)) btn.click();
      });
    } catch (_) { }

    await page.waitForSelector("input#image-search", { visible: true, timeout: 20000 });
    const fileInput = await page.$("input#image-search");
    await fileInput.uploadFile(tmpPath);
    console.log("Image uploaded...");

    await page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 60000 });
    await new Promise((resolve) => setTimeout(resolve, 3000));
    console.log("Results page loaded - Search tab");

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

    try {
      console.log("Looking for Similar images tab...");
      await page.waitForSelector('a[data-cbir-page-type="similar"]', { timeout: 10000 });
      await page.click('a[data-cbir-page-type="similar"]');
      console.log("Clicked Similar images tab");
      await page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 30000 }).catch(() => {});
      await new Promise((resolve) => setTimeout(resolve, 4000));
      console.log("Similar images tab loaded");
      const currentUrl = page.url();
      console.log("Current page URL:", currentUrl);
    } catch (err) {
      console.log("Error clicking similar images tab:", err.message);
    }

    console.log("Extracting similar images...");
    const similarImagesData = await page.evaluate(() => {
      const seenUrls = new Set();
      const imageElements = document.querySelectorAll("img.ImagesContentImage-Image");
      console.log("Found ImagesContentImage-Image elements:", imageElements.length);

      const similarImages = Array.from(imageElements)
        .map((img) => {
          let src = img.src;
          if (src && src.startsWith("//")) {
            src = "https:" + src;
          }
          return src;
        })
        .filter((src) => {
          if (!src) return false;
          if (!src.startsWith("http")) return false;
          if (src.includes("data:image")) return false;
          if (seenUrls.has(src)) return false;
          seenUrls.add(src);
          return true;
        })
        .slice(0, 50);

      return similarImages;
    });
    console.log("Similar images extracted:", similarImagesData.length);

    const results = {
      title: searchTabData.title,
      description: searchTabData.description,
      sites: searchTabData.sites,
      similarImages: similarImagesData
    };

    if (results.title) {
      const titleRes = await translate(results.title, { to: "en", client: "gtx" });
      results.title = titleRes.text;
      if (results.title === "Yandex Images: search for images") {
        results.title = "Similar Images";
      }
    }

    if (results.description) {
      const descRes = await translate(results.description, { to: "en", client: "gtx" });
      results.description = descRes.text;
    }

    console.log("Final results:", { title: results.title, sites: results.sites.length, images: results.similarImages.length });
    res.json(results);

  } catch (error) {
    console.error("Image search error:", error);
    res.status(500).json({ error: error.message });
  } finally {
    if (browser) {
      await browser.close().catch(console.error);
    }
    try {
      await fs.unlink(tmpPath);
    } catch { }
  }
});

// Catch-all route for SPA - serve index.html for all non-API routes
app.use((req, res) => {
  const indexPath = path.join(__dirname, '../frontend/dist/index.html');
  if (fs_sync.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ error: 'Frontend not found' });
  }
});

// Export for Vercel
module.exports = app;

// Start server locally (not needed for Vercel, which calls the handler)
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
