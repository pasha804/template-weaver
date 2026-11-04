// State-synced screenshot walker for Birthday Aurora parity audit.
// Syncs on the progress-dot index (active dot is wide) so dev/prod speed
// differences don't desync the two runs.
// Usage: node .audit/shot.mjs <baseUrl> <outPrefix> <width> <height>
import puppeteer from "puppeteer-core";

const [, , BASE, PREFIX, W = "1280", H = "800"] = process.argv;
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const width = parseInt(W, 10);
const height = parseInt(H, 10);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--autoplay-policy=no-user-gesture-required"],
});
const page = await browser.newPage();
await page.setViewport({ width, height, deviceScaleFactor: 1 });
page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));
page.on("console", (m) => { if (m.type() === "error") console.log("CONSOLE.ERR:", m.text()); });

const shot = async (name) => {
  const f = `.audit/shots/${PREFIX}-${name}.png`;
  await page.screenshot({ path: f });
  console.log("shot", f);
};

// Index of the currently active (widest) progress dot = current screen index.
const activeDot = () =>
  page.evaluate(() => {
    const dots = [...document.querySelectorAll("div")].filter((d) => {
      const s = getComputedStyle(d);
      return (
        Math.round(parseFloat(s.height)) === 7 &&
        parseFloat(s.borderRadius) >= 9 &&
        d.children.length === 0
      );
    });
    if (dots.length < 3) return -1;
    let idx = -1, max = 0;
    dots.forEach((d, i) => {
      const w = parseFloat(getComputedStyle(d).width);
      if (w > max) { max = w; idx = i; }
    });
    return idx;
  });

const waitForDot = async (target, timeout = 15000) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if ((await activeDot()) === target) return true;
    await sleep(200);
  }
  console.log(`WARN waitForDot(${target}) timeout, active=${await activeDot()}`);
  return false;
};

const advance = async () =>
  page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((b) => {
      const bg = getComputedStyle(b).backgroundImage || "";
      const st = b.getAttribute("style") || "";
      return bg.includes("rgb(225, 29, 72)") || st.includes("#e11d48");
    });
    if (b) { b.scrollIntoView({ block: "center" }); b.click(); return true; }
    return false;
  });

await page.goto(BASE, { waitUntil: "domcontentloaded" });

// Loader (no dots yet)
await sleep(1500);
await shot("00-loader");

// Countdown = dot 0
await waitForDot(0);
await sleep(500);
await shot("01-countdown");

// Celebrate = dot 1 (countdown auto-advances ~5s)
await waitForDot(1);
await sleep(1200); // confetti + button settle
await shot("02-celebrate");

// dot index -> label for the click-walk
const stages = [
  [2, "03-age"], [3, "04-bday"], [4, "05-gallery"],
  [5, "06-gifvibes"], [6, "07-gifreel"], [7, "08-wishes"],
];
for (const [dot, label] of stages) {
  let ok = await advance();
  if (!ok) { await sleep(600); ok = await advance(); }
  await waitForDot(dot);
  await sleep(1600); // entrance spring + delayed CTA button
  await shot(label);
}

// Letter (dot 8 -> no dots). Advance from wishes, wait for dots to vanish.
await advance();
await sleep(3000); // typewriter starts
await shot("09-letter");

await browser.close();
console.log("DONE", PREFIX);
