import "dotenv/config";
import { runSeed, disconnectAfterSeed } from "../src/seed/seed";

runSeed()
  .then(async () => {
    await disconnectAfterSeed();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error("Seed failed:", err);
    await disconnectAfterSeed().catch(() => {});
    process.exit(1);
  });
