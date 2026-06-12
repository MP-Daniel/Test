const { Builder, By, until } = require("selenium-webdriver");
const safari = require("selenium-webdriver/safari");
const { expect } = require("chai");

const FRONTEND_URL = "http://localhost:5173";

describe("Home (Catálogo) E2E - Safari", function () {
  this.timeout(40000);

  let driver;

  before(async function () {
    const options = new safari.Options();
    driver = await new Builder()
      .forBrowser("safari")
      .setSafariOptions(options)
      .build();

    await driver.manage().setTimeouts({
      implicit: 5000,
      pageLoad: 15000,
      script: 5000,
    });
  });

  after(async function () {
    if (driver) await driver.quit();
  });

  // ------------------------------------------------------------
  // TC-11: La página principal carga el catálogo de productos
  // ------------------------------------------------------------
  it("TC-11: debe cargar y mostrar el catálogo de productos", async function () {
    await driver.get(`${FRONTEND_URL}/`);

    // Esperar que desaparezca el texto de carga
    await driver.wait(
      until.elementIsNotVisible(
        await driver.wait(
          until.elementLocated(By.xpath("//*[contains(., 'Cargando catálogo')]")),
          5000
        ).catch(() => ({ isDisplayed: async () => false }))
      ),
      8000
    ).catch(() => {}); // Si no existía el loading, continuar

    // La grilla de productos debe existir
    const grilla = await driver.wait(
      until.elementLocated(By.css(".products-grid")),
      10000
    );
    expect(await grilla.isDisplayed()).to.be.true;
  });

  // ------------------------------------------------------------
  // TC-12: El navbar muestra el nombre de la tienda
  // ------------------------------------------------------------
  it("TC-12: el navbar debe mostrar el nombre MiniShop", async function () {
    await driver.get(`${FRONTEND_URL}/`);

    const brand = await driver.wait(
      until.elementLocated(By.css(".navbar-brand")),
      10000
    );
    const brandTexto = await brand.getText();
    expect(brandTexto).to.contain("MiniShop");
  });

  // ------------------------------------------------------------
  // TC-13: El botón "Entrar" lleva al login si no hay sesión
  // ------------------------------------------------------------
  it("TC-13: clic en Entrar debe navegar a /login cuando no hay sesión", async function () {
    await driver.get(`${FRONTEND_URL}/`);

    // Asegurarnos que no hay sesión activa
    await driver.executeScript("window.localStorage.clear()");
    await driver.navigate().refresh();

    const btnEntrar = await driver.wait(
      until.elementLocated(By.xpath("//a[contains(., 'Entrar')]")),
      10000
    );
    await btnEntrar.click();

    await driver.wait(until.urlContains("/login"), 10000);
    const urlActual = await driver.getCurrentUrl();
    expect(urlActual).to.include("/login");
  });

  // ------------------------------------------------------------
  // TC-14: Las tarjetas de producto tienen precio y botón Comprar
  // ------------------------------------------------------------
  it("TC-14: cada tarjeta de producto debe tener precio y botón Comprar", async function () {
    await driver.get(`${FRONTEND_URL}/`);

    // Esperar que haya al menos una card
    await driver.wait(
      until.elementLocated(By.css(".card")),
      10000
    );

    const cards = await driver.findElements(By.css(".card"));

    if (cards.length > 0) {
      const primeraCard = cards[0];

      // Debe tener precio (formato $XX.XX)
      const precio = await primeraCard.findElement(By.css(".product-price"));
      const precioTexto = await precio.getText();
      expect(precioTexto).to.match(/^\$\d+\.\d{2}$/);

      // Debe tener botón Comprar
      const btnComprar = await primeraCard.findElement(
        By.xpath(".//button[contains(., 'Comprar')]")
      );
      expect(await btnComprar.isDisplayed()).to.be.true;
    }
  });
});
