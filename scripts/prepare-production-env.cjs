const fs = require("node:fs");
function productionEnvironment(source) {
  if (!source?.trim()) throw new Error("PRODUCTION_ENV is required.");
  const raw =
    source
      .match(
        /^(?:export\s+)?NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE\s*=\s*(.*)$/m,
      )?.[1]
      ?.trim() || "";
  const key = raw.replace(/^(['"])(.*)\1$/, "$2");
  if (!/^pk_live_/.test(key) || /replace_me/.test(key))
    throw new Error(
      "Configure NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE in the frontend production PRODUCTION_ENV secret.",
    );
  return (
    source
      .replace(/^(?:export\s+)?NEXT_PUBLIC_STRIPE_MODE\s*=.*(?:\r?\n|$)/gm, "")
      .trimEnd() + "\nNEXT_PUBLIC_STRIPE_MODE=live\n"
  );
}
module.exports = { productionEnvironment };
if (require.main === module) {
  try {
    fs.writeFileSync(
      ".env.production",
      productionEnvironment(process.env.PRODUCTION_ENV),
      { mode: 0o600 },
    );
    console.log(
      "Production frontend environment prepared with Stripe live mode.",
    );
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
