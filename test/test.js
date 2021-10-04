const { expectLoaded, expectPage, test } = require("@excaliburjs/testing");

test("A breakout sample", async (page) => {
  await expectPage("Shows bricks", "./test/images/actual-loaded.png").toBe(
    "./test/images/expected-loaded.png"
  );
});
