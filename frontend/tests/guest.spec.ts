import { test, expect } from '@playwright/test';
import { BUTTONS, TOOLTIPS } from '../src/constants/strings';

const TIMESTAMP = Date.now();
const USERNAME = `guest_setup_user_${TIMESTAMP}`;
const TOPIC_NAME = `Guest Test Topic ${TIMESTAMP}`;
const POST_TITLE = `Guest Test Post ${TIMESTAMP}`;

test.describe('Guest User Restrictions', () => {
  
  test('Guest cannot create topics, posts, or comments', async ({ page, request }) => {
    // --- SETUP VIA API ---
    // 1. Login to get token
    const loginRes = await request.post('http://localhost:8080/login', {
        data: { username: USERNAME }
    });
    expect(loginRes.ok()).toBeTruthy();
    const loginData = await loginRes.json();
    const token = loginData.token;

    // 2. Create Topic
    const topicRes = await request.post('http://localhost:8080/topics', {
        headers: { 'Authorization': `Bearer ${token}` },
        data: { name: TOPIC_NAME, description: 'Setup for guest test' }
    });
    expect(topicRes.ok()).toBeTruthy();
    const topicData = await topicRes.json();
    const topicId = topicData.topic_id;

    // 3. Create Post (so we can test comment restriction)
    const postRes = await request.post(`http://localhost:8080/topics/${topicId}/posts`, {
        headers: { 'Authorization': `Bearer ${token}` },
        data: { title: POST_TITLE, body: 'Content for guest test' }
    });
    expect(postRes.ok()).toBeTruthy();


    // --- TEST AS GUEST ---
    // 1. Go to Home Page
    await page.goto('/');
    
    // Check New Topic button
    const newTopicBtn = page.getByRole('button', { name: BUTTONS.NEW_TOPIC });
    await expect(newTopicBtn).toBeDisabled();
    await newTopicBtn.hover();
    await expect(page.getByText(TOOLTIPS.GUEST_TOPIC)).toBeVisible();

    // 2. Go to Topic Page
    await page.getByText(TOPIC_NAME).click();
    
    // Check New Post button
    const newPostBtn = page.getByRole('button', { name: BUTTONS.NEW_POST });
    await expect(newPostBtn).toBeDisabled();
    await newPostBtn.hover();
    await expect(page.getByText(TOOLTIPS.GUEST_POST)).toBeVisible();

    // 3. Go to Post Page
    await page.getByText(POST_TITLE).click();

    // Check Post Comment button
    const commentBtn = page.getByRole('button', { name: BUTTONS.POST_COMMENT });
    await expect(commentBtn).toBeDisabled();
    await commentBtn.hover();
    await expect(page.getByText(TOOLTIPS.GUEST_COMMENT)).toBeVisible();
  });
});
