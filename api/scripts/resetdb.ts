import '../src/util/loadDotEnv';

import misterResetti from '../src/util/misterResetti';

async function main() {
  try {
    await misterResetti({
      disconnectAfterComplete: true,
      runSeeds: true,
    });
  } catch (err) {
    console.log(err.stack);
    process.exit(1);
  }
  process.exit(0);
}

main();
