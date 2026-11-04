import { test, expect } from "@playwright/test";
const routes = [
  "/",
  "/mission",
  "/chapters",
  "/leadership",
  "/events",
  "/founder",
  "/membership",
];
test("light and dark surfaces, membership text and controls follow the chosen theme", async ({
  page,
}, info) => {
  test.setTimeout(60_000);
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.goto("/");
  for (const theme of ["light", "dark"]) {
    await page.evaluate(
      (value) => localStorage.setItem("gla-theme", value),
      theme,
    );
    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      const issues = await page.evaluate(
        ({ theme }) => {
          const issues: string[] = [];
          const rgb = (value: string) =>
            (value.match(/[\d.]+/g) || [])
              .slice(0, 3)
              .map(Number)
              .map((v) => (value.startsWith("color(") ? v * 255 : v));
          const lum = (value: number[]) =>
            value
              .map((v) => v / 255)
              .map((v) =>
                v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4,
              )
              .reduce(
                (total, v, i) => total + v * [0.2126, 0.7152, 0.0722][i],
                0,
              );
          const background = (el: Element): number[] => {
            const value = getComputedStyle(el).backgroundColor;
            if (value !== "rgba(0, 0, 0, 0)") return rgb(value);
            return el.parentElement
              ? background(el.parentElement)
              : [255, 255, 255];
          };
          for (const el of document.querySelectorAll(
            ".hero,.page-banner,.work,.benefit,.stats,.join,.membership-tier",
          )) {
            const style = getComputedStyle(el);
            if (theme === "light" && lum(background(el)) < 0.65)
              issues.push(`${el.className}: dark surface in light mode`);
            if (
              theme === "light" &&
              (style.backgroundImage.match(/rgba?\([^)]+\)/g) || []).some(
                (stop) =>
                  Number((stop.match(/[\d.]+/g) || [])[3] ?? 1) > 0 &&
                  lum(rgb(stop)) < 0.3,
              )
            )
              issues.push(`${el.className}: dark banner gradient`);
          }
          for (const el of document.querySelectorAll(
            ".membership-tier .tn,.membership-tier .tp,.membership-tier li,.gov-card .tier,.chap .flag,.form-note,.brand-sub",
          )) {
            const style = getComputedStyle(el);
            const foreground = lum(rgb(style.color));
            const bg = lum(background(el));
            const ratio =
              (Math.max(foreground, bg) + 0.05) /
              (Math.min(foreground, bg) + 0.05);
            if (ratio < 4.5)
              issues.push(`${el.className}: contrast ${ratio.toFixed(2)}`);
          }
          for (const el of document.querySelectorAll(".gov-card .tier"))
            if (parseFloat(getComputedStyle(el).paddingTop) > 0)
              issues.push("Governance label inherits membership card padding");
          if (getComputedStyle(document.documentElement).colorScheme !== theme)
            issues.push("Native control theme differs from selection");
          return issues;
        },
        { theme },
      );
      expect(issues, `${route} ${theme}`).toEqual([]);
      if (route === "/" || route === "/membership" || route === "/leadership")
        await page.screenshot({
          path: `test-results/${theme}-${info.project.name}-${route.slice(1) || "home"}.png`,
          fullPage: true,
        });
    }
  }
});
test("automatic light theme uses readable success and error messages", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.addInitScript(() => localStorage.removeItem("gla-theme"));
  await page.goto("/membership");
  expect(await page.locator("html").getAttribute("data-theme")).toBeNull();
  const colors = await page.evaluate(() => {
    const style = getComputedStyle(document.documentElement);
    return {
      success: style.getPropertyValue("--success").trim(),
      danger: style.getPropertyValue("--danger").trim(),
      scheme: style.colorScheme,
    };
  });
  expect(colors).toEqual({
    success: "#326442",
    danger: "#a13d3d",
    scheme: "light",
  });
});
