import { test, expect } from '@playwright/test';

test.describe('Asset Class & Fund Management', () => {
  test('Create New Asset Class with Valid Data', async ({ page }) => {
    // 1. Navigate to http://localhost:5173
    await page.goto('http://localhost:5173');

    // 2. Click Settings in the navigation menu
    await page.getByRole('link', { name: 'Settings' }).click();

    // 3. Click "+ Add Asset Class" button
    await page.getByRole('button', { name: '+ Add Asset Class' }).click();

    // 4. In the Name field, enter "Emerging Markets"
    // After adding, the new asset class will be at index 3
    // Note: .last() selects the visible desktop version (responsive design creates duplicates)
    const nameField = page.getByTestId('asset-class-name-3').last();
    await nameField.fill('Emerging Markets');

    // 5. In the Target % field, enter "5"
    const targetField = page.getByTestId('asset-class-allocation-3').last();
    await targetField.fill('5');

    // 6. In the fund ticker field, enter "VWO"
    const tickerField = page.getByTestId('fund-ticker-3-0').last();
    await tickerField.fill('VWO');

    // 7. Verify the asset class is created
    await expect(nameField).toHaveValue('Emerging Markets');

    // 8. Verify Total Allocation updates (should show validation message if not 100%)
    await expect(page.getByText('(Must equal 100%)')).toBeVisible();

    // Note: No save - allocation is 105% (invalid), so Save Changes button would be disabled
  });

  test('Edit Asset Class Allocation', async ({ page }) => {
    // 1. Navigate to Settings page
    await page.goto('http://localhost:5173');
    await page.getByRole('link', { name: 'Settings' }).click();

    // 2. Find "US Total Stock Market" asset class (should have 60% allocation)
    // This is the first asset class (index 0)
    // Note: .last() selects the visible desktop version
    const usStockTargetField = page.getByTestId('asset-class-allocation-0').last();
    await expect(usStockTargetField).toHaveValue('60%');

    // 3. Change allocation from 60% to 55%
    await usStockTargetField.fill('55');

    // 4. Verify Total Allocation updates to 95%
    await expect(page.getByRole('heading', { name: 'Total Allocation: 95% (Must equal 100%)' })).toBeVisible();

    // 5. Verify validation message "(Must equal 100%)" appears
    await expect(page.getByText('(Must equal 100%)')).toBeVisible();
  });

  test('Delete Asset Class', async ({ page }) => {
    // 1. Navigate to Settings page with default 3 asset classes
    await page.goto('http://localhost:5173');
    await page.getByRole('link', { name: 'Settings' }).click();

    // 2. Click delete button for "US Total Bond Market" (10% allocation)
    await page.getByRole('button', { name: 'Delete entire US Total Bond' }).click();

    // 3. Verify asset class is removed immediately (no confirmation dialog)
    // 4. Verify Total Allocation updates to 90%
    await expect(page.getByRole('heading', { name: 'Total Allocation: 90% (Must equal 100%)' })).toBeVisible();

    // 5. Verify validation message appears
    await expect(page.getByText('(Must equal 100%)')).toBeVisible();
  });

  test('Add Fund to Asset Class', async ({ page }) => {
    // 1. Navigate to Settings page
    await page.goto('http://localhost:5173');
    await page.getByRole('link', { name: 'Settings' }).click();

    // 2. Find "US Total Stock Market" asset class (index 0)
    // 3. Click "Add Fund" button
    await page.getByRole('button', { name: 'Add Fund' }).first().click();

    // 4. Enter ticker "VTSAX" in new fund field
    // The new fund will be at fund index 1 in asset class 0
    // Note: .last() selects the visible desktop version
    await page.getByTestId('fund-ticker-0-1').last().fill('VTSAX');

    // 5. Verify fund is added and appears in the list
    await expect(page.getByRole('button', { name: 'Delete fund VTSAX' })).toBeVisible();

    // 6. Verify both funds (VTI and VTSAX) are shown
    await expect(page.getByRole('button', { name: 'Delete fund VTI' })).toBeVisible();

    // 7. Save changes (allocation is still 100%, so save button should be enabled)
    const saveButton = page.getByRole('button', { name: 'Save Changes' }).last();
    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    // 8. Verify save button is disabled after save (form no longer dirty)
    await expect(saveButton).toBeDisabled();

    // Note: localStorage persistence is not currently implemented in the app
    // The Save Changes button only updates in-memory state
  });

  test('Delete Fund from Asset Class', async ({ page }) => {
    // 1. Navigate to Settings page
    await page.goto('http://localhost:5173');
    await page.getByRole('link', { name: 'Settings' }).click();

    // 2. Add a second fund to first asset class (index 0)
    await page.getByRole('button', { name: 'Add Fund' }).first().click();
    // Note: .last() selects the visible desktop version
    await page.getByTestId('fund-ticker-0-1').last().fill('VTSAX');

    // 3. Click delete button on one of the funds
    await page.getByRole('button', { name: 'Delete fund VTSAX' }).click();

    // 4. Verify fund is removed
    // VTSAX should not be visible
    await expect(page.getByRole('button', { name: 'Delete fund VTSAX' })).not.toBeVisible();

    // 5. Verify asset class still exists
    await expect(page.getByRole('button', { name: 'Delete fund VTI' })).toBeVisible();

    // Note: No save needed - we added then deleted, returning to original state (form not dirty)
  });

  test('Allocation Validation - Equals 100%', async ({ page }) => {
    // 1. Navigate to Settings page with default configuration
    await page.goto('http://localhost:5173');
    await page.getByRole('link', { name: 'Settings' }).click();

    // 2. Verify allocations sum to 100%: US Total Stock Market (60%), International (30%), Bonds (10%)
    // 3. Verify Total Allocation displays "100%"
    await expect(page.getByRole('heading', { name: 'Total Allocation: 100%' })).toBeVisible();

    // 4. Verify no validation error message appears
    await expect(page.getByText('(Must equal 100%)')).not.toBeVisible();
  });

  test('Allocation Validation - Less Than 100%', async ({ page }) => {
    // 1. Navigate to Settings page
    await page.goto('http://localhost:5173');
    await page.getByRole('link', { name: 'Settings' }).click();

    // 2. Change US Total Stock Market from 60% to 50%
    // Note: .last() selects the visible desktop version
    const usStockTargetField = page.getByTestId('asset-class-allocation-0').last();
    await usStockTargetField.fill('50');

    // 3. Verify Total Allocation shows "90%"
    await expect(page.getByRole('heading', { name: 'Total Allocation: 90% (Must equal 100%)' })).toBeVisible();

    // 4. Verify warning text "(Must equal 100%)" appears
    await expect(page.getByText('(Must equal 100%)')).toBeVisible();
  });

  test('Allocation Validation - Greater Than 100%', async ({ page }) => {
    // 1. Navigate to Settings page
    await page.goto('http://localhost:5173');
    await page.getByRole('link', { name: 'Settings' }).click();

    // 2. Change US Total Stock Market from 60% to 70%
    // Note: .last() selects the visible desktop version
    const usStockTargetField = page.getByTestId('asset-class-allocation-0').last();
    await usStockTargetField.fill('70');

    // 3. Verify Total Allocation shows "110%"
    await expect(page.getByRole('heading', { name: 'Total Allocation: 110% (Must equal 100%)' })).toBeVisible();

    // 4. Verify warning text "(Must equal 100%)" appears
    await expect(page.getByText('(Must equal 100%)')).toBeVisible();
  });

  test('Save Valid Changes with Save Button', async ({ page }) => {
    // 1. Navigate to Settings page
    await page.goto('http://localhost:5173');
    await page.getByRole('link', { name: 'Settings' }).click();

    // 2. Make valid changes that keep total allocation at 100%
    // Change US Total Stock Market from 60% to 65%
    const usStockField = page.getByTestId('asset-class-allocation-0').last();
    await usStockField.fill('65');

    // Change International from 30% to 25%
    const intlField = page.getByTestId('asset-class-allocation-1').last();
    await intlField.fill('25');

    // 3. Verify Total Allocation is 100% (65 + 25 + 10 = 100)
    await expect(page.getByRole('heading', { name: 'Total Allocation: 100%' })).toBeVisible();
    await expect(page.getByText('(Must equal 100%)')).not.toBeVisible();

    // 4. Verify Save Changes button is enabled
    const saveButton = page.getByRole('button', { name: 'Save Changes' }).last();
    await expect(saveButton).toBeEnabled();

    // 5. Click Save Changes
    await saveButton.click();

    // 6. Verify save button is disabled after save (form no longer dirty)
    await expect(saveButton).toBeDisabled();

    // Note: localStorage persistence is not currently implemented in the app
    // The Save Changes button only updates in-memory state
  });
});
