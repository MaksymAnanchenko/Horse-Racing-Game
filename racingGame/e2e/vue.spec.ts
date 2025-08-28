import { test, expect } from "@playwright/test";
import { ROUND_DISTANCES } from "../src/constants.ts";

test("manual round flow: generate then 6 starts to finish", async ({
  page
}) => {
  await page.goto("/");

  // Header present
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    /Horse Racing Game/i
  );

  // Buttons under status
  const generate = page.getByRole("button", { name: /Generate/i });
  const start = page.getByRole("button", { name: /Start/i });

  // Initially: Start disabled, Generate enabled
  await expect(generate).toBeEnabled();
  await expect(start).toBeDisabled();

  // Generate
  await generate.click();
  await expect(page.getByText(/Status:\s*generated/i)).toBeVisible();
  await expect(start).toBeEnabled();

  // Run first round and expect first result to appear
  await start.click();
  await expect(page.getByText(/Results/i)).toBeVisible();
  await expect(
    page.getByText(new RegExp(`Round\\s*1\\s*—\\s*${ROUND_DISTANCES[0]}m`))
  ).toBeVisible({
    timeout: 15000
  });

  // Run remaining rounds
  for (let i = 2; i <= ROUND_DISTANCES.length; i++) {
    await start.click();
    const distance = ROUND_DISTANCES[i - 1];
    await expect(
      page.getByText(new RegExp(`Round\\s*${i}\\s*—\\s*${distance}m`))
    ).toBeVisible({ timeout: 15000 });
  }

  // Status becomes finished
  await expect(page.getByText(/Status:\s*finished/i)).toBeVisible();
});
