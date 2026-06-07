const { Builder, By, until } = require("selenium-webdriver");
const safari = require("selenium-webdriver/safari");
const { expect } = require("chai");

const FRONTEND_URL = "http://localhost:5174";

describe("Login E2E - Safari", function () {
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

  it("TC-01: debe iniciar sesión con credenciales válidas de admin", async function () {
    await driver.get(`${FRONTEND_URL}/login`);

    const usernameInput = await driver.wait(
      until.elementLocated(By.css('input[placeholder="Ej. admin"]')),
      10000
    );
    const passwordInput = await driver.wait(
      until.elementLocated(By.css('input[type="password"]')),
      10000
    );

    await usernameInput.clear();
    await usernameInput.sendKeys("admin");
    await passwordInput.clear();
    await passwordInput.sendKeys("admin123");

    await driver.findElement(By.css('button[type="submit"]')).click();

    await driver.wait(until.urlIs(`${FRONTEND_URL}/`), 10000);

    const saludo = await driver.wait(
      until.elementLocated(By.xpath("//span[contains(., 'Hola,')]")),
      10000
    );
    const saludoTexto = await saludo.getText();
    expect(saludoTexto).to.contain("admin");

    const linkAdmin = await driver.findElement(
      By.xpath("//a[contains(., 'Admin')]")
    );
    expect(await linkAdmin.isDisplayed()).to.be.true;

    const token = await driver.executeScript(
      'return window.localStorage.getItem("token")'
    );
    const role = await driver.executeScript(
      'return window.localStorage.getItem("role")'
    );
    const username = await driver.executeScript(
      'return window.localStorage.getItem("username")'
    );

    expect(token).to.be.a("string").and.not.empty;
    expect(role).to.equal("admin");
    expect(username).to.equal("admin");
  });

  it("TC-02: debe cerrar sesión correctamente al hacer logout", async function () {
    await driver.get(`${FRONTEND_URL}/`);

    const botonSalir = await driver.wait(
      until.elementLocated(By.xpath("//button[contains(., 'Salir')]")),
      10000
    );
    await botonSalir.click();

    await driver.wait(until.urlIs(`${FRONTEND_URL}/`), 10000);

    const botonEntrar = await driver.wait(
      until.elementLocated(By.xpath("//a[contains(., 'Entrar')]")),
      10000
    );
    expect(await botonEntrar.isDisplayed()).to.be.true;

    const token = await driver.executeScript(
      'return window.localStorage.getItem("token")'
    );
    expect(token).to.be.null;
  });

  it("TC-03: debe mostrar error con contraseña incorrecta", async function () {
    await driver.get(`${FRONTEND_URL}/login`);

    const usernameInput = await driver.wait(
      until.elementLocated(By.css('input[placeholder="Ej. admin"]')),
      10000
    );
    const passwordInput = await driver.wait(
      until.elementLocated(By.css('input[type="password"]')),
      10000
    );

    await usernameInput.clear();
    await usernameInput.sendKeys("admin");
    await passwordInput.clear();
    await passwordInput.sendKeys("claveincorrecta");

    await driver.findElement(By.css('button[type="submit"]')).click();

    const errorMsg = await driver.wait(
      until.elementLocated(By.css(".error-msg")),
      10000
    );
    const errorTexto = await errorMsg.getText();
    expect(errorTexto).to.equal("Contraseña incorrecta");

    const urlActual = await driver.getCurrentUrl();
    expect(urlActual).to.include("/login");
  });

  it("TC-04: debe mostrar error con usuario inexistente", async function () {
    await driver.get(`${FRONTEND_URL}/login`);

    const usernameInput = await driver.wait(
      until.elementLocated(By.css('input[placeholder="Ej. admin"]')),
      10000
    );
    const passwordInput = await driver.wait(
      until.elementLocated(By.css('input[type="password"]')),
      10000
    );

    await usernameInput.clear();
    await usernameInput.sendKeys("usuariofalso");
    await passwordInput.clear();
    await passwordInput.sendKeys("cualquierclave");

    await driver.findElement(By.css('button[type="submit"]')).click();

    const errorMsg = await driver.wait(
      until.elementLocated(By.css(".error-msg")),
      10000
    );
    const errorTexto = await errorMsg.getText();
    expect(errorTexto).to.equal("Usuario no encontrado");
  });

  it("TC-05: usuario autenticado debe ser redirigido al intentar ir a /login", async function () {
    await driver.get(`${FRONTEND_URL}/login`);

    const usernameInput = await driver.wait(
      until.elementLocated(By.css('input[placeholder="Ej. admin"]')),
      10000
    );
    const passwordInput = await driver.wait(
      until.elementLocated(By.css('input[type="password"]')),
      10000
    );

    await usernameInput.sendKeys("admin");
    await passwordInput.sendKeys("admin123");
    await driver.findElement(By.css('button[type="submit"]')).click();
    await driver.wait(until.urlIs(`${FRONTEND_URL}/`), 10000);

    await driver.get(`${FRONTEND_URL}/login`);

    await driver.wait(until.urlIs(`${FRONTEND_URL}/`), 10000);
    const urlFinal = await driver.getCurrentUrl();
    expect(urlFinal).to.equal(`${FRONTEND_URL}/`);
  });
});