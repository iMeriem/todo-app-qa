import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { expect } from 'chai';
import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import { Options as ChromeOptions } from 'selenium-webdriver/chrome';

// Define interfaces for API interactions based on the Rails backend models
interface Credentials {
  email: string;
  password: string;
}

interface AuthResponse {
  auth_token: string;
  user_id: number;
}

// Task list model
interface GroupItem {
  id?: number;
  list_title: string;
  created_at?: string;
  updated_at?: string;
  user_id?: number;
}

// Task item model
interface TaskItem {
  id?: number;
  title: string;
  completed?: boolean;
  group_item_id?: number;
  created_at?: string;
  updated_at?: string;
}

describe('Todo App Tests', function() {
  // API and UI tests can take some time, especially on CI environments
  this.timeout(60000);
  
  // Configuration constants
  const BASE_API_URL = 'http://localhost:3000/api/v1';
  const FRONTEND_URL = 'http://localhost:8080';
  
  // Test user credentials from the seeds.rb file
  const testUser: Credentials = {
    email: 'admin@todo.com',
    password: 'admin'
  };
  
  // State variables for test suite
  let apiClient: AxiosInstance;
  let authToken: string;
  let testGroupItem: GroupItem;
  let testTaskItem: TaskItem;
  
  // WebDriver for UI tests
  let driver: WebDriver;
  
  /**
   * Setup function runs once before all tests
   * - Creates API client
   * - Sets up WebDriver for browser automation
   */
  before(async function() {
    console.log(' Setting up test environment...');
    
    // Create API client for making HTTP requests
    apiClient = axios.create({
      baseURL: BASE_API_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Setup WebDriver for browser automation (headless for CI environments)
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(new ChromeOptions())
      .build();
    
    console.log('✅ Test environment setup complete');
  });
  
  /**
   * Cleanup function runs once after all tests
   * - Cleans up test data
   * - Closes the browser
   */
  after(async function() {
    console.log('🧹 Cleaning up test environment...');
    
    // Clean up test data if any tests failed in the middle
    try {
      if (authToken && testGroupItem && testGroupItem.id) {
        await apiClient.delete(`/group_items/${testGroupItem.id}`);
        console.log('✅ Test data cleaned up');
      }
    } catch (error) {
      console.log('⚠️ Error during data cleanup:', error);
    }
    
    // Close the browser
    if (driver) {
      await driver.quit();
      console.log('✅ Browser closed');
    }
    
    console.log('✅ Test environment cleanup complete');
  });
  
  // ======================================================================
  // Test Suite 1: Authentication Flow
  // ======================================================================
  describe('Authentication Flow', function() {
    it('should authenticate a user and return a token', async function() {
      // The API expects a nested credentials object
      const requestData = {
        credentials: testUser
      };
      
      // Send authentication request
      const response: AxiosResponse<AuthResponse> = await apiClient.post(
        '/auth_token', 
        requestData
      );
      
      // Assertions to verify response
      expect(response.status).to.equal(200, 'Status code should be 200 OK');
      expect(response.data).to.have.property('auth_token', 'Response should include auth_token');
      expect(response.data.auth_token).to.be.a('string', 'Auth token should be a string');
      expect(response.data.auth_token.length).to.be.greaterThan(10, 'Auth token should be a valid JWT');
      
      // Store token for subsequent requests
      authToken = response.data.auth_token;
      
      // Set auth token in default headers for future API requests
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    });
    
    it('should reject authentication with invalid credentials', async function() {
      // Negative test case with invalid credentials
      const invalidCredentials = {
        credentials: {
          email: 'wrong@example.com',
          password: 'wrongpassword'
        }
      };
      
      try {
        // This request should fail
        await apiClient.post('/auth_token', invalidCredentials);
        // If we reached here, the test should fail
        expect.fail('Request should have failed with invalid credentials');
      } catch (error: any) {
        // Verify expected error response
        expect(error.response.status).to.equal(401, 'Should receive 401 Unauthorized');
        expect(error.response.data).to.have.property('error', 'Response should include error message');
      }
    });
    
    it('should require authentication for protected endpoints', async function() {
      // Create a new client without auth token
      const unauthenticatedClient = axios.create({
        baseURL: BASE_API_URL,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      try {
        // This request should fail due to missing auth
        await unauthenticatedClient.get('/group_items');
        // If we reached here, the test should fail
        expect.fail('Request should have failed without authentication');
      } catch (error: any) {
        // Verify expected error response
        expect(error.response.status).to.equal(401, 'Should receive 401 Unauthorized');
      }
    });
  });
  
  // ======================================================================
  // Test Suite 2: Task List (Group Item) CRUD Operations
  // ======================================================================
  describe('Task List Management Flow', function() {
    it('should create a new task list', async function() {
      // Create a unique list title using timestamp
      const listTitle = `Test List ${Date.now()}`;
      
      // Prepare the request data
      const requestData: GroupItem = {
        list_title: listTitle
      };
      
      // Send create request
      const response: AxiosResponse<GroupItem> = await apiClient.post(
        '/group_items', 
        requestData
      );
      
      // Verify response
      expect(response.status).to.equal(201, 'Status code should be 201 Created');
      expect(response.data).to.have.property('id', 'Response should include id');
      expect(response.data).to.have.property('list_title', 'Response should include list_title');
      expect(response.data.list_title).to.equal(listTitle, 'List title should match what we sent');
      
      // Store created task list for subsequent tests
      testGroupItem = response.data;
    });
    
    it('should retrieve all task lists', async function() {
      // Send get request for all lists
      const response: AxiosResponse<GroupItem[]> = await apiClient.get('/group_items');
      
      // Verify response structure
      expect(response.status).to.equal(200, 'Status code should be 200 OK');
      expect(response.data).to.be.an('array', 'Response should be an array');
      
      // Verify our test list is in the response
      const foundList = response.data.find(item => item.id === testGroupItem.id);
      expect(foundList).to.exist, 'Should find our created list';
      expect(foundList!.list_title).to.equal(testGroupItem.list_title, 'List title should match');
    });
    
    it('should retrieve a specific task list by ID', async function() {
      // Send get request for a specific list
      const response: AxiosResponse<GroupItem> = await apiClient.get(
        `/group_items/${testGroupItem.id}`
      );
      
      // Verify response
      expect(response.status).to.equal(200, 'Status code should be 200 OK');
      expect(response.data).to.have.property('id', 'Response should include id');
      expect(response.data.id).to.equal(testGroupItem.id, 'List ID should match');
      expect(response.data.list_title).to.equal(testGroupItem.list_title, 'List title should match');
    });
    
    it('should update a task list', async function() {
      // Create an updated title
      const updatedTitle = `Updated List ${Date.now()}`;
      
      // Prepare the update data
      const requestData: GroupItem = {
        list_title: updatedTitle
      };
      
      // Send update request
      const response: AxiosResponse<GroupItem> = await apiClient.put(
        `/group_items/${testGroupItem.id}`, 
        requestData
      );
      
      // Verify response
      expect(response.status).to.equal(200, 'Status code should be 200 OK');
      expect(response.data.list_title).to.equal(updatedTitle, 'List title should be updated');
      
      // Update the stored task list
      testGroupItem = response.data;
    });
    
    it('should reject creating a task list without a title', async function() {
      // Prepare invalid data (empty title)
      const invalidData: GroupItem = {
        list_title: ''
      };
      
      try {
        // This request should fail
        await apiClient.post('/group_items', invalidData);
        // If we reached here, the test should fail
        expect.fail('Request should have failed with empty title');
      } catch (error: any) {
        // Verify expected validation error
        expect(error.response.status).to.equal(422, 'Should receive 422 Unprocessable Entity');
        expect(error.response.data).to.have.property('errors', 'Response should include validation errors');
      }
    });
  });
  
  // ======================================================================
  // Test Suite 3: Task Item CRUD Operations
  // ======================================================================
  describe('Task Item Management Flow', function() {
    it('should create a new task item', async function() {
      // Create a unique task title
      const taskTitle = `Test Task ${Date.now()}`;
      
      // Prepare the request data
      const requestData: TaskItem = {
        title: taskTitle
      };
      
      // Send create request
      const response: AxiosResponse<TaskItem> = await apiClient.post(
        `/group_items/${testGroupItem.id}/items`,
        requestData
      );
      
      // Verify response
      expect(response.status).to.equal(201, 'Status code should be 201 Created');
      expect(response.data).to.have.property('id', 'Response should include id');
      expect(response.data.title).to.equal(taskTitle, 'Task title should match what we sent');
      expect(response.data.completed).to.equal(false, 'New task should not be completed');
      expect(response.data.group_item_id).to.equal(testGroupItem.id, 'Task should belong to correct list');
      
      // Store the created task for subsequent tests
      testTaskItem = response.data;
    });
    
    it('should retrieve all tasks for a list', async function() {
      // Send get request for all tasks in a list
      const response: AxiosResponse<TaskItem[]> = await apiClient.get(
        `/group_items/${testGroupItem.id}/items`
      );
      
      // Verify response
      expect(response.status).to.equal(200, 'Status code should be 200 OK');
      expect(response.data).to.be.an('array', 'Response should be an array');
      
      // Verify our test task is in the response
      const foundTask = response.data.find(item => item.id === testTaskItem.id);
      expect(foundTask).to.exist, 'Should find our created task';
      expect(foundTask!.title).to.equal(testTaskItem.title, 'Task title should match');
    });
    
    it('should retrieve a specific task by ID', async function() {
      // Send get request for a specific task
      const response: AxiosResponse<TaskItem> = await apiClient.get(
        `/group_items/${testGroupItem.id}/items/${testTaskItem.id}`
      );
      
      // Verify response
      expect(response.status).to.equal(200, 'Status code should be 200 OK');
      expect(response.data).to.have.property('id', 'Response should include id');
      expect(response.data.id).to.equal(testTaskItem.id, 'Task ID should match');
      expect(response.data.title).to.equal(testTaskItem.title, 'Task title should match');
    });
    
    it('should mark a task as completed', async function() {
      // Prepare the update data
      const requestData: TaskItem = {
        title: testTaskItem.title,
        completed: true
      };
      
      // Send update request
      const response: AxiosResponse<TaskItem> = await apiClient.put(
        `/group_items/${testGroupItem.id}/items/${testTaskItem.id}`,
        requestData
      );
      
      // Verify response
      expect(response.status).to.equal(200, 'Status code should be 200 OK');
      expect(response.data.completed).to.equal(true, 'Task should be marked as completed');
      
      // Update the stored task
      testTaskItem = response.data;
    });
    
    it('should update a task title', async function() {
      // Create an updated title
      const updatedTitle = `Updated Task ${Date.now()}`;
      
      // Prepare the update data
      const requestData: TaskItem = {
        title: updatedTitle,
        completed: testTaskItem.completed // Keep the completed state
      };
      
      // Send update request
      const response: AxiosResponse<TaskItem> = await apiClient.put(
        `/group_items/${testGroupItem.id}/items/${testTaskItem.id}`,
        requestData
      );
      
      // Verify response
      expect(response.status).to.equal(200, 'Status code should be 200 OK');
      expect(response.data.title).to.equal(updatedTitle, 'Task title should be updated');
      expect(response.data.completed).to.equal(testTaskItem.completed, 'Completed state should not change');
      
      // Update the stored task
      testTaskItem = response.data;
    });
    
    it('should delete a task', async function() {
      // Send delete request
      const response: AxiosResponse = await apiClient.delete(
        `/group_items/${testGroupItem.id}/items/${testTaskItem.id}`
      );
      
      // Verify response - delete usually returns no content
      expect(response.status).to.equal(204, 'Status code should be 204 No Content');
      
      // Verify the task is actually deleted by trying to fetch it
      try {
        await apiClient.get(`/group_items/${testGroupItem.id}/items/${testTaskItem.id}`);
        // If we reached here, the test should fail
        expect.fail('Task should have been deleted');
      } catch (error: any) {
        // Should get a 404 error
        expect(error.response.status).to.equal(404, 'Should receive 404 Not Found');
      }
    });
  });
  
  // ======================================================================
  // Test Suite 4: UI End-to-End Tests
  // ======================================================================
  describe('UI End-to-End Tests', function() {
    it('should login through the UI', async function() {
      // Navigate to the frontend application
      await driver.get(FRONTEND_URL);
      
      // Wait for the login form to load
      await driver.wait(until.elementLocated(By.css('form')), 5000);
      
      // Fill in the login credentials (using appropriate selectors for the app)
      await driver.findElement(By.css('input[name="email"]')).sendKeys(testUser.email);
      await driver.findElement(By.css('input[name="password"]')).sendKeys(testUser.password);
      
      // Submit the form
      await driver.findElement(By.css('button[type="submit"]')).click();
      
      // Wait for the lists to load after successful login
      await driver.wait(until.elementLocated(By.css('.lists')), 10000);
      
      // Verify we're logged in by checking for the presence of elements only available to logged in users
      const logoutButton = await driver.findElement(By.css('.logout'));
      expect(await logoutButton.isDisplayed()).to.be.true, 'Logout button should be visible after login';
    });
    
    it('should create a task list through the UI', async function() {
      // Generate a unique list name for testing
      const listName = `UI Test List ${Date.now()}`;
      
      // Find and click the add list button
      await driver.findElement(By.css('.add-list')).click();
      
      // Wait for the list creation form
      await driver.wait(until.elementLocated(By.css('.list-form')), 5000);
      
      // Fill in the list name
      await driver.findElement(By.css('input[name="list_title"]')).sendKeys(listName);
      
      // Submit the form
      await driver.findElement(By.css('.list-form button[type="submit"]')).click();
      
      // Wait for the list to appear in the UI
      await driver.wait(
        until.elementLocated(By.xpath(`//div[contains(@class, 'list')][contains(., '${listName}')]`)),
        5000
      );
      
      // Verify the list is visible
      const listElement = await driver.findElement(
        By.xpath(`//div[contains(@class, 'list')][contains(., '${listName}')]`)
      );
      expect(await listElement.isDisplayed()).to.be.true, 'New list should be visible in the UI';
    });
    
    it('should add a task to a list through the UI', async function() {
      // Generate a unique task name for testing
      const taskName = `UI Test Task ${Date.now()}`;
      
      // Find all lists and click the first one to select it
      const lists = await driver.findElements(By.css('.list'));
      await lists[0].click();
      
      // Wait for the list details to load
      await driver.wait(until.elementLocated(By.css('.tasks')), 5000);
      
      // Find and click add task button
      await driver.findElement(By.css('.add-task')).click();
      
      // Wait for the task creation form
      await driver.wait(until.elementLocated(By.css('.task-form')), 5000);
      
      // Fill in the task name
      await driver.findElement(By.css('input[name="title"]')).sendKeys(taskName);
      
      // Submit the form
      await driver.findElement(By.css('.task-form button[type="submit"]')).click();
      
      // Wait for the task to appear in the UI
      await driver.wait(
        until.elementLocated(By.xpath(`//div[contains(@class, 'task')][contains(., '${taskName}')]`)),
        5000
      );
      
      // Verify the task is visible
      const taskElement = await driver.findElement(
        By.xpath(`//div[contains(@class, 'task')][contains(., '${taskName}')]`)
      );
      expect(await taskElement.isDisplayed()).to.be.true, 'New task should be visible in the UI';
    });
    
    it('should mark a task as complete through the UI', async function() {
      // Find all tasks
      const tasks = await driver.findElements(By.css('.task'));
      
      // Find the checkbox for the first task
      const checkbox = await tasks[0].findElement(By.css('input[type="checkbox"]'));
      
      // Get the task ID to identify it after the update
      const taskId = await tasks[0].getAttribute('data-id');
      
      // Click the checkbox to mark the task as complete
      await checkbox.click();
      
      // Wait for the task to be marked as completed (the app adds a 'completed' class)
      await driver.wait(
        until.elementLocated(By.css(`.task[data-id="${taskId}"].completed`)),
        5000
      );
      
      // Verify the task is marked as completed
      const completedTask = await driver.findElement(By.css(`.task[data-id="${taskId}"]`));
      const classes = await completedTask.getAttribute('class');
      expect(classes).to.include('completed', 'Task should have completed class');
    });
    
    it('should delete a task list through the UI', async function() {
      // Count the current number of lists
      const initialLists = await driver.findElements(By.css('.list'));
      const initialCount = initialLists.length;
      
      // Find the delete button for the first list
      const deleteButton = await initialLists[0].findElement(By.css('.delete-list'));
      
      // Click the delete button
      await deleteButton.click();
      
      // Wait for and handle the confirmation dialog (if one exists)
      try {
        await driver.wait(until.elementLocated(By.css('.confirmation')), 2000);
        await driver.findElement(By.css('.confirm-delete')).click();
      } catch (e) {
        // No confirmation dialog - that's okay
      }
      
      // Wait for the list count to decrease
      await driver.wait(async () => {
        const currentLists = await driver.findElements(By.css('.list'));
        return currentLists.length < initialCount;
      }, 5000, 'List was not deleted');
      
      // Verify the list was deleted
      const finalLists = await driver.findElements(By.css('.list'));
      expect(finalLists.length).to.equal(initialCount - 1, 'List count should decrease by 1');
    });
    
    it('should logout through the UI', async function() {
      // Find and click the logout button
      await driver.findElement(By.css('.logout')).click();
      
      // Wait for redirection to login page
      await driver.wait(until.elementLocated(By.css('form')), 5000);
      
      // Verify we're on the login page
      const loginForm = await driver.findElement(By.css('form'));
      expect(await loginForm.isDisplayed()).to.be.true, 'Login form should be visible after logout';
      
      // Verify the login button is present
      const loginButton = await driver.findElement(By.css('button[type="submit"]'));
      expect(await loginButton.isDisplayed()).to.be.true, 'Login button should be visible after logout';
    });
  });
});