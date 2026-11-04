import { test, expect } from "@playwright/test";
const routes = [
  "/",
  "/mission",
  "/founder",
  "/chapters",
  "/leadership",
  "/events",
  "/membership",
];
test("all public pages render, have unique SEO metadata and fit the viewport", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const titles = new Set<string>();
  for (const route of routes) {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toBeVisible();
    const title = await page.title();
    expect(titles.has(title)).toBe(false);
    titles.add(title);
    const canonical = await page
      .locator('link[rel="canonical"]')
      .getAttribute("href");
    expect(new URL(canonical!).toString()).toBe(
      new URL(route, "http://localhost:3000").toString(),
    );
    expect(
      await page.locator('meta[name="description"]').getAttribute("content"),
    ).toBeTruthy();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    if (route === "/" && page.viewportSize()!.width < 500) {
      await page.screenshot({
        path: "test-results/migrated-mobile.png",
        animations: "disabled",
      });
    }
    await expect(page.locator("footer")).toBeVisible();
  }
  expect(errors).toEqual([]);
});
test("old URLs permanently redirect and retain enquiry intent", async ({
  request,
}) => {
  const response = await request.get("/membership.html?intent=registrar", {
    maxRedirects: 0,
  });
  expect(response.status()).toBe(308);
  expect(response.headers().location).toBe("/membership?intent=registrar");
  for (const route of [
    "index",
    "mission",
    "founder",
    "chapters",
    "leadership",
    "events",
  ]) {
    expect(
      (await request.get(`/${route}.html`, { maxRedirects: 0 })).status(),
    ).toBe(308);
  }
});
test("theme preference survives navigation and mobile menu works", async ({
  page,
}, info) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Toggle colour theme" }).click();
  const theme = await page.locator("html").getAttribute("data-theme");
  expect(["light", "dark"]).toContain(theme);
  if (info.project.name === "mobile") {
    await page.getByRole("button", { name: "Open menu" }).click();
    await page
      .locator("#mobileMenu")
      .getByRole("link", { name: "Mission", exact: true })
      .click();
    await expect(page).toHaveURL(/\/mission$/);
    await expect(
      page.getByRole("button", { name: "Open menu" }),
    ).toHaveAttribute("aria-expanded", "false");
  } else
    await page
      .getByRole("navigation", { name: "Primary", exact: true })
      .getByRole("link", { name: "Mission", exact: true })
      .click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", theme!);
});
test("application intent, upload, validation, successful submission and newsletter", async ({
  page,
}) => {
  await page.route("**/api/applications", (route) =>
    route.fulfill({ status: 201, json: { reference: "GLF-TEST-123" } }),
  );
  await page.route("**/api/newsletter", (route) =>
    route.fulfill({
      status: 202,
      json: { message: "Your subscription has been recorded." },
    }),
  );
  await page.goto("/membership?intent=registrar#apply-form");
  await expect(page.locator('input[value="registrar"]')).toBeChecked();
  const inputs = {
    name: "Test Applicant",
    email: "test@example.com",
    address: "Test address",
    cell: "123456",
    cnic: "test-id",
    barLicense: "Test bar",
    parentBar: "Test association",
  };
  for (const [key, value] of Object.entries(inputs))
    await page.locator(`#f-${key}`).fill(value);
  await page.locator('input[name="consent"]').check();
  await page.getByRole("button", { name: "Submit", exact: true }).click();
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: "Please add a passport-size picture" }),
  ).toBeVisible();
  await page.locator('input[type="file"]').setInputFiles({
    name: "photo.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jz1cAAAAASUVORK5CYII=",
      "base64",
    ),
  });
  await page.getByRole("button", { name: "Submit", exact: true }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "GLF-TEST-123" }),
  ).toBeVisible();
  await page.locator(".subscribe input").fill("newsletter@example.com");
  await page.getByRole("button", { name: "Subscribe", exact: true }).click();
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: "Your subscription has been recorded." }),
  ).toBeVisible();
});
test("admin login, application review, status update, and logout", async ({
  page,
}) => {
  let loggedIn = false;
  let status = "pending";
  const item = {
    id: "00000000-0000-4000-8000-000000000001",
    reference: "GLF-TEST",
    name: "Review Applicant",
    email: "review@example.com",
    intent: "membership",
    createdAt: "2026-11-04T12:00:00.000Z",
  };
  await page.route("**/api/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === "/api/auth/login") {
      loggedIn = true;
      return route.fulfill({
        json: { id: "admin", email: "admin@example.com" },
      });
    }
    if (path === "/api/auth/logout") {
      loggedIn = false;
      return route.fulfill({ json: { ok: true } });
    }
    if (path === "/api/auth/me")
      return route.fulfill({
        status: loggedIn ? 200 : 401,
        json: loggedIn
          ? { id: "admin", email: "admin@example.com" }
          : { error: "Please sign in." },
      });
    if (path === "/api/admin/applications")
      return route.fulfill({
        json: { items: [{ ...item, status }], total: 1, page: 1, pageSize: 20 },
      });
    if (path.endsWith("/photo")) return route.fulfill({ status: 204 });
    if (route.request().method() === "PATCH") {
      status = route.request().postDataJSON().status;
      return route.fulfill({ json: { ok: true } });
    }
    return route.fulfill({
      json: {
        ...item,
        status,
        address: "Test address",
        cell: "123",
        cnic: "identity",
        passport: "",
        barLicense: "Test license",
        parentBar: "Test bar",
        message: "",
      },
    });
  });
  await page.goto("/admin");
  await page.getByLabel("Email", { exact: true }).fill("admin@example.com");
  await page.getByLabel("Password", { exact: true }).fill("test-password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Applications", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Review", exact: true }).click();
  await expect(
    page.getByRole("complementary", { name: "Application details" }),
  ).toBeVisible();
  await page.getByLabel("Review status").selectOption("approved");
  await expect(page.locator(".status-badge")).toHaveText("approved");
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Admin sign in" }),
  ).toBeVisible();
});
test("crawler files exclude private data", async ({ request }) => {
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("/membership");
  expect(sitemap).not.toContain("/admin");
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Disallow: /admin");
  expect((await request.get("/llms.txt")).status()).toBe(200);
  const admin = await request.get("/admin");
  expect(admin.headers()["x-robots-tag"]).toContain("noindex");
});
