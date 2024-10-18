/**
  * To learn more about Playwright Test visit:
  * https://checklyhq.com/docs/browser-checks/playwright-test/
  * https://playwright.dev/docs/writing-tests
  */

const { devices, expect, test } = require('@playwright/test');


test.describe.configure({ mode: 'parallel' });

// Configure the Playwright Test timeout to 210 seconds,
// ensuring that longer tests conclude before Checkly's browser check timeout of 240 seconds.
// The default Playwright Test timeout is set at 30 seconds.
// For additional information on timeouts, visit: https://checklyhq.com/docs/browser-checks/timeouts/
test.setTimeout(210000)

// Set the action timeout to 10 seconds to quickly identify failing actions.
// By default Playwright Test has no timeout for actions (e.g. clicking an element).
test.use({ actionTimeout: 10000 })


test("Auto Rate Form Mobile", async ({ browser }) => {
  let attempt = 1;
  let success = false;

  while (attempt <= 3 && !success) {
    try {
      // Randomly select a device from the list
      const deviceNames = ['iPhone 11 Pro', 'iPhone 12', 'Galaxy S8', 'iPhone SE', 'Pixel 5'];
      const randomIndex = getRandomIndex(deviceNames.length);
      const selectedDevice = deviceNames[randomIndex];
      const dev = devices[selectedDevice];

      // Open a new page with the selected device's viewport
      const page = await browser.newPage({
        ...dev,
      });

      // Navigate to the specified URL
      const baseUrl = process.env.BASE_URL;
      const response = await page.goto(baseUrl || 'https://smartfinancial.com/compare-rates.html?aid=60&cid=18');

      // Verify that the page has loaded
      expect(response.status()).toBe(200);
      console.log("deploy 123")
      // Call the function to select vehicle year, make, and model
      await vehicle_year_make_model(page);

      // If no errors are encountered, mark the attempt as successful
      success = true;
      console.log(`Test succeeded on attempt ${attempt}`);

    } catch (error) {
      // If there's an error, log it and retry up to 3 times
      console.error(`Attempt ${attempt} failed: ${error.message}`);
      attempt += 1;

      if (attempt > 3) {
        throw new Error('Test failed after 3 attempts');
      } else {
        console.log(`Retrying... Attempt ${attempt}`);
      }
    }
  }
});



// test('Desktop Smartfinancial Auto Lead Test', async ({ page }) => {
//   // Change checklyhq.com to your site's URL,
//   // or, even better, define a ENVIRONMENT_URL environment variable
//   // to reuse it across your browser checks
//   const response = await page.goto(process.env.ENVIRONMENT_URL || 'https://smartfinancial.com/compare-rates.html?aid=60&cid=18')

 

// });





async function vehicle_year_make_model(page) {
  let attempt = 1;

  while (attempt < 4) {
    try {
      // Select Vehicle Year
      const selectedYear = await selectRandomDropdownOption(page, '.vehicle-item-year-0');
      console.log(`Selected YEAR for vehicle 1 from the dropdown: ${selectedYear}`);

      // Select Vehicle Make
      const selectedMake = await selectRandomDropdownOption(page, '.vehicle-item-make-0');
      console.log(`Selected MAKE from the dropdown: ${selectedMake}`);

      // Select Vehicle Model
      const selectedModel = await selectRandomDropdownOption(page, '.vehicle-item-model-0');
      console.log(`Selected MODEL from the dropdown: ${selectedModel}`);

      // If all selections are successful, break the loop
      console.log(`Vehicle year, make, and model successfully selected in ${attempt} attempt`);
      break;

    } catch (error) {
      console.error(`Attempt failed due to: ${error.message}`);
      attempt += 1;

      if (attempt < 4) {
        console.log(`Retrying... Attempts left: ${3-attempt}`);
      } else {
        console.error('All attempts to select vehicle year, make, and model have failed.');
        throw new Error('Failed to select vehicle year, make, and model after 3 attempts.');
      }
    }
  }
}



 

async function selectRandomRadioButton(page, locator) {
  await expect(page.locator(`${locator}`)).toBeVisible();
  let radioButtons = await page.locator(`${locator} input[type="radio"]`);
  let options = await radioButtons.all();
  let randomIndex = getRandomIndex(options.length);
  let radioButtonId = await radioButtons.nth(randomIndex).getAttribute('id');
  let labelSelector = `label[for='${radioButtonId}']`;
  await page.click(labelSelector);
  return radioButtonId;
}

async function selectRandomDropdownOption(page, dropdownLocator) {
  const dropdown = await page.locator(dropdownLocator);
  await expect(dropdown).toBeVisible();

  try {
    // Try to click on the dropdown to open it
    await dropdown.click();
  } catch (e) {
    console.warn(`Dropdown click failed, attempting force click...`);
    await dropdown.click({ force: true });
  }

  // Ensure the dropdown panel is in view
  await dropdown.scrollIntoViewIfNeeded();

  // Option 1: Increase the timeout to give more time for the options to load
  try {
    await page.waitForSelector(`${dropdownLocator} ng-dropdown-panel .ng-option-label`, { state: 'visible', timeout: 5000 }); 
  } catch (e) {
    console.error('Dropdown options panel failed to appear:', e.message);
    throw new Error(`Failed to find options for the dropdown: ${dropdownLocator}`);
  }

  // Retrieve all available options
  let options = await dropdown.locator('ng-dropdown-panel .ng-option-label').allTextContents();
  //console.log(`options ${options}`)
  options = options.filter(option => !["Suzuki", "Yamaha"].includes(option.trim()));
  //console.log(`options after removing${options}`)
  if (options.length === 0) {
    throw new Error(`No options available in dropdown: ${dropdownLocator}`);
  }

  // Select a random option
  const randomIndex = getRandomIndex(options.length);
  await dropdown.locator('ng-dropdown-panel .ng-option-label').nth(randomIndex).click();

  // Get the selected value after selection
  const selectedValue = await dropdown.locator('.ng-value-label').textContent();
  console.log(`Selected Value: ${selectedValue.trim()}`);

  // Assert that the selected value matches the option text
  // expect(selectedValue.trim()).toBe(options[randomIndex].trim());

  return selectedValue.trim();
}

function getRandomIndex(length) {
  return Math.floor(Math.random() * length);
}
