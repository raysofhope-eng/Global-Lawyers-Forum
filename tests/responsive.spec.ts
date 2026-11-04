import { test, expect } from "@playwright/test";
test("navigation and content fit small phones, tablets, and desktops", async ({
  page,
}, info) => {
  test.skip(info.project.name !== "desktop", "Viewport matrix runs once.");
  for (const width of [320, 360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ["/", "/membership", "/founder"]) {
      await page.goto(route);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${route} at ${width}px overflows`,
      ).toBe(true);
      for (const selector of [".brand", ".themebtn", ".menu-toggle"]) {
        const element = page.locator("header.nav " + selector).first();
        if (await element.isVisible()) {
          const bounds = await element.boundingBox();
          expect(
            bounds!.x + bounds!.width,
            `${selector} at ${width}px clips`,
          ).toBeLessThanOrEqual(width);
        }
      }
    }
  }
});
