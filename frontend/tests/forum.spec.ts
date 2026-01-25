import { test, expect } from '@playwright/test';
import { PLACEHOLDERS, BUTTONS } from '../src/constants/strings';

const TIMESTAMP = Date.now();
const RANDOM = Math.floor(Math.random() * 10000);
const USERNAME = `user_${TIMESTAMP}_${RANDOM}`;
const TOPIC_NAME = `E2E Topic ${TIMESTAMP}_${RANDOM}`;
const POST_TITLE = `E2E Post ${TIMESTAMP}_${RANDOM}`;

test.describe('CVWO Forum E2E', () => {
  
  test('Full user journey', async ({ page }) => {
    // Go to Home Page
    await page.goto('/'); 
    await expect(page).toHaveTitle(/CVWO Forum/);

    // Login (Simple Auth)
    await page.getByRole('button', { name: BUTTONS.SIGN_IN }).click();
    await page.getByPlaceholder(PLACEHOLDERS.LOGIN_USERNAME).fill(USERNAME);
    await page.getByRole('button', { name: BUTTONS.CONTINUE }).click();

    // Verify Login
    await expect(page.getByLabel('User Profile')).toBeVisible();
    await expect(page.getByTitle('Logout')).toBeVisible();

    // Create Topic
    await page.getByRole('button', { name: BUTTONS.NEW_TOPIC }).click();
    await page.getByPlaceholder(PLACEHOLDERS.CREATE_TOPIC_NAME).fill(TOPIC_NAME);
    await page.getByPlaceholder(PLACEHOLDERS.CREATE_TOPIC_DESC).fill('This is a test topic.');
    await page.getByRole('button', { name: BUTTONS.CREATE_TOPIC }).click();

    // Verify Topic Created and Modal Closed
    // Wait for modal to disappear to avoid click interception
    await expect(page.getByText('Create New Topic')).toBeHidden();
    await expect(page.getByText(TOPIC_NAME)).toBeVisible();

    // Go to Topic & Create Post
    await page.getByText(TOPIC_NAME).click();
    await expect(page.getByRole('heading', { name: TOPIC_NAME })).toBeVisible();

    await page.getByRole('button', { name: BUTTONS.NEW_POST }).click();
    await page.getByPlaceholder(PLACEHOLDERS.CREATE_POST_TITLE).fill(POST_TITLE);
    await page.getByPlaceholder(PLACEHOLDERS.CREATE_POST_BODY).fill('This is a test post.');
    await page.getByRole('button', { name: BUTTONS.POST, exact: true }).click();

    // Verify Post Created
    await expect(page.getByText(POST_TITLE)).toBeVisible();

    // Go to Post & Comment
    await page.getByText(POST_TITLE).click();
    await expect(page.getByRole('heading', { name: POST_TITLE })).toBeVisible();

    await page.getByRole('button', { name: BUTTONS.POST_COMMENT }).click();
    await page.getByPlaceholder(PLACEHOLDERS.CREATE_COMMENT_BODY).fill('This is a test comment.');
    await page.getByRole('button', { name: BUTTONS.REPLY, exact: true }).last().click();

    // Verify Comment
    await expect(page.getByText('This is a test comment.')).toBeVisible();

    // Verify Username
    // Expecting the username to appear at least twice (once in post header, once in comment). So just check count > 0
    await expect(page.getByText(USERNAME).first()).toBeVisible();

    // --- LOGOUT FLOW ---
    await page.getByTitle('Logout').click();
    
    // Verify Redirect/UI Update
    await expect(page.getByRole('button', { name: BUTTONS.SIGN_IN })).toBeVisible();
    await expect(page.getByLabel('User Profile')).toBeHidden();
  });
});
