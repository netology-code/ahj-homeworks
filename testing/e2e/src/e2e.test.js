const puppetteer = require("puppeteer");

jest.setTimeout(30000); // default puppeteer timeout

describe("Credit Card Validator form", () => {
  let browser = null;
  let page = null;
  const baseUrl = "http://localhost:9000";

  beforeAll(async () => {
    browser = await puppetteer.launch({
      // headless: false, // show gui
      // slowMo: 250,
      // devtools: true, // show devTools
    });
    page = await browser.newPage();
  });

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  });

  test("should have label element for card input", async () => {
    await page.goto(baseUrl);

    // Проверяем наличие label
    const label = await page.$('label[for="card-input"]');
    expect(label).not.toBeNull();

    // Проверяем текст label
    const labelText = await page.$eval(
      'label[for="card-input"]',
      (el) => el.textContent,
    );
    expect(labelText).toBe("Номер карты");
  });

  test("should have all form labels", async () => {
    await page.goto(baseUrl);

    // Проверяем наличие всех labels
    const labels = await page.$$("label");
    expect(labels.length).toBeGreaterThan(0);

    // Проверяем, что у label есть атрибут for
    const labelFor = await page.$eval("label", (el) => el.getAttribute("for"));
    expect(labelFor).toBe("card-input");
  });

  test("should display label text correctly", async () => {
    await page.goto(baseUrl);

    // Проверяем видимость label
    const isLabelVisible = await page.$eval('label[for="card-input"]', (el) => {
      const style = window.getComputedStyle(el);
      return style.display !== "none" && style.visibility !== "hidden";
    });
    expect(isLabelVisible).toBe(true);
  });
});
