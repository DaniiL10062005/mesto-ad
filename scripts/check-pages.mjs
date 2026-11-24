import assert from "node:assert/strict";
import { chromium } from "playwright-core";

const browser = await chromium.launch({ channel: "chrome" });
try {
  const page = await browser.newPage();
  const api = "https://mesto.nomoreparties.co/v1/apf-cohort-203";
  const [profileResponse, cardsResponse] = await Promise.all([
    page.waitForResponse((response) => response.url() === api + "/users/me" && response.request().method() === "GET"),
    page.waitForResponse((response) => response.url() === api + "/cards" && response.request().method() === "GET"),
    page.goto(process.argv[2], { waitUntil: "domcontentloaded" }),
  ]);
  assert.equal(profileResponse.status(), 200);
  assert.equal(cardsResponse.status(), 200);
  const profile = await profileResponse.json();
  const cards = await cardsResponse.json();
  await page.locator(".profile__edit-button:enabled").waitFor();
  assert.equal(await page.locator(".profile__title").textContent(), profile.name);
  assert.equal(await page.locator(".profile__description").textContent(), profile.about);
  assert.equal(await page.locator(".card").count(), cards.length);
  assert.equal(await page.locator("input[type=password]").count(), 0);
  console.log(`Профиль и карточки (${cards.length}) загрузились при первом открытии.`);
} finally {
  await browser.close();
}
