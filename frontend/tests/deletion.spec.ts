import { test, expect } from '@playwright/test';
import { PLACEHOLDERS, BUTTONS } from '../src/constants/strings';

const TIMESTAMP = Date.now();
const RANDOM = Math.floor(Math.random() * 10000);
const USERNAME = `del_user_${TIMESTAMP}_${RANDOM}`;
const TOPIC_NAME = `Delete Topic ${TIMESTAMP}_${RANDOM}`;
const POST_TITLE = `Delete Post ${TIMESTAMP}_${RANDOM}`;

test.describe('CVWO Forum Deletion Flow', () => {
  
  test('User can delete their own content', async ({ page }) => {
    // Go to Home Page
    await page.goto('/'); 

    // Login
    await page.getByRole('button', { name: BUTTONS.SIGN_IN }).click();
    await page.getByPlaceholder(PLACEHOLDERS.LOGIN_USERNAME).fill(USERNAME);
    await page.getByRole('button', { name: BUTTONS.CONTINUE }).click();

    // Create Topic
    await page.getByRole('button', { name: BUTTONS.NEW_TOPIC }).click();
    await page.getByPlaceholder(PLACEHOLDERS.CREATE_TOPIC_NAME).fill(TOPIC_NAME);
    await page.getByPlaceholder(PLACEHOLDERS.CREATE_TOPIC_DESC).fill('Topic to be deleted.');
    await page.getByRole('button', { name: BUTTONS.CREATE_TOPIC }).click();
    await expect(page.getByText('Create New Topic')).toBeHidden();

    // Go to Topic & Create Post
    await page.getByText(TOPIC_NAME).click();
    await page.getByRole('button', { name: BUTTONS.NEW_POST }).click();
    await page.getByPlaceholder(PLACEHOLDERS.CREATE_POST_TITLE).fill(POST_TITLE);
    await page.getByPlaceholder(PLACEHOLDERS.CREATE_POST_BODY).fill('Post to be deleted.');
    await page.getByRole('button', { name: BUTTONS.POST, exact: true }).click();

    // Go to Post & Comment
    await page.getByText(POST_TITLE).click();
    await page.getByRole('button', { name: BUTTONS.POST_COMMENT }).click();
    await page.getByPlaceholder(PLACEHOLDERS.CREATE_COMMENT_BODY).fill('Comment to be deleted.');
    await page.getByRole('button', { name: BUTTONS.REPLY, exact: true }).last().click();
    
    // Verify Comment Exists
    await expect(page.getByText('Comment to be deleted.')).toBeVisible();

    // DELETION FLOW
    
    // Delete Comment
    await page.getByTitle(BUTTONS.DELETE).first().click();
    await page.getByRole('button', { name: BUTTONS.DELETE }).filter({ hasText: BUTTONS.DELETE }).last().click();
    await expect(page.getByText('Comment to be deleted.')).toBeHidden();

    // Delete Post
    await page.getByRole('button', { name: 'Back to Topic' }).click();
    await expect(page.getByRole('heading', { name: TOPIC_NAME })).toBeVisible();
    
    await page.getByTitle(BUTTONS.DELETE).first().click();
    await page.getByRole('button', { name: BUTTONS.DELETE }).filter({ hasText: BUTTONS.DELETE }).last().click();
    await expect(page.getByText(POST_TITLE)).toBeHidden();

    // Delete Topic
    await page.getByRole('button', { name: 'Back to Home' }).first().click();
    await expect(page.getByText('Explore Topics')).toBeVisible();
    
    const topicCard = page.locator('div').filter({ hasText: TOPIC_NAME }).first();
    await topicCard.getByTitle(BUTTONS.DELETE).click();
    await page.getByRole('button', { name: BUTTONS.DELETE }).filter({ hasText: BUTTONS.DELETE }).last().click();
    await expect(page.getByText(TOPIC_NAME)).toBeHidden();
  });
});
