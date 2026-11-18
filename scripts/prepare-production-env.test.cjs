const { test } = require("node:test");
const assert = require("node:assert/strict");
const { productionEnvironment } = require("./prepare-production-env.cjs");
test("production frontend selects live mode with its existing live publishable key", () => {
  const source =
    "SITE_URL=https://globallawyersforum.org\nNEXT_PUBLIC_STRIPE_MODE=test\nNEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE=pk_live_fixture\nNEXT_PUBLIC_STRIPE_MODE=test\n";
  const output = productionEnvironment(source);
  assert.match(output, /NEXT_PUBLIC_STRIPE_MODE=live/);
  assert.doesNotMatch(output, /NEXT_PUBLIC_STRIPE_MODE=test/);
  assert.match(output, /SITE_URL=https:\/\/globallawyersforum.org/);
  assert.throws(() =>
    productionEnvironment(
      "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE=pk_test_fixture",
    ),
  );
  assert.throws(() =>
    productionEnvironment(
      "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE=pk_live_replace_me",
    ),
  );
});
