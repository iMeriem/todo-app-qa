# Test Plan for Todo App

## Project Description and Selection Rationale

The selected GitHub project is [todo-app](https://github.com/delbetu/todo-app), a single page application with both frontend and backend components that allows users to create, manage, and organize tasks in lists. 

**Why this project was selected:**
- Has both frontend and backend components (Backbone.js frontend and Rails API backend)
- Features user interaction including authentication and CRUD operations
- Manageable complexity for local testing setup
- Clear documentation and API endpoints
- Realistic application with common web app features
- Includes authentication which adds security testing opportunities

## 1. Test Scope and Objectives

### Scope
This test plan covers the testing of the Todo App's core functionalities:
- User registration and authentication
- Task list (group item) creation, reading, updating, and deletion
- Task (item) creation, reading, updating, and deletion
- Marking tasks as completed
- User interface functionality and responsiveness
- API endpoints and their responses
- Cross-browser compatibility

### Objectives
- Verify that all core functionalities work correctly
- Ensure the application is secure, particularly regarding authentication
- Validate that the API endpoints return correct responses
- Confirm that the UI components display and function as expected
- Identify and document any bugs or issues
- Verify data persistence across sessions

## 2. Test Approach

### Manual Testing (40%)
- Exploratory testing to understand application behavior
- UI/UX testing to verify interface elements
- Usability testing to ensure efficient user workflows
- Cross-browser testing on Chrome, Firefox, and Edge
- Verification of error messages and validation

### Automated Testing (60%)
- API testing using TypeScript and Axios
- Frontend component testing using Cypress
- End-to-end testing for critical user flows
- Authentication flow testing
- Performance testing for response times

## 3. Test Environment Requirements

### Hardware Requirements
- Computer with minimum 8GB RAM, i5 processor or equivalent
- Stable internet connection

### Software Requirements
- Node.js v12+ and npm v6+
- Ruby v2.5.7+ and Bundler
- Git for version control
- Chrome, Firefox, and Edge browsers
- Visual Studio Code or similar IDE
- Postman for manual API testing (optional)

### Project Setup
```
# Backend setup
cd backend
bundle install
bundle exec rake db:create
bundle exec rake db:migrate
bundle exec rake db:seed
rails server

# Frontend setup (in a separate terminal)
cd frontend
npm install
npm run build
npm run dev
```

## 4. Test Cases for Critical User Flows

### TC-01: User Registration
**Description:** Verify that a new user can register an account  
**Prerequisites:** Application running, no existing account with test email  
**Steps:**
1. Navigate to registration page
2. Enter valid email, password, and password confirmation
3. Submit the form

**Expected Result:** User account is created, user is logged in and redirected to main app page  
**Priority:** High  

### TC-02: User Login
**Description:** Verify that a registered user can successfully log in  
**Prerequisites:** Existing user account  
**Steps:**
1. Navigate to login page
2. Enter valid credentials
3. Click login button

**Expected Result:** User is logged in and redirected to main app page with their data  
**Priority:** High  

### TC-03: Create Task List
**Description:** Verify that a logged-in user can create a new task list  
**Prerequisites:** User is logged in  
**Steps:**
1. Click "Add New List" button
2. Enter list name "Work Tasks"
3. Submit form

**Expected Result:** New list is created and displayed on the page  
**Priority:** High  

### TC-04: Create Task Item
**Description:** Verify that a logged-in user can create a new task in a list  
**Prerequisites:** User is logged in, at least one task list exists  
**Steps:**
1. Select a task list
2. Click "Add New Task" button
3. Enter task name "Complete QA assignment"
4. Submit form

**Expected Result:** New task is added to the selected list and displayed  
**Priority:** High  

### TC-05: Mark Task as Complete
**Description:** Verify that a task can be marked as complete  
**Prerequisites:** User is logged in, a task list with at least one uncompleted task exists  
**Steps:**
1. Click the checkbox next to a task

**Expected Result:** Task is marked as complete with visual indication (strikethrough and checkbox selected)  
**Priority:** High  

### TC-06: Edit Task
**Description:** Verify that a task can be edited  
**Prerequisites:** User is logged in, a task list with at least one task exists  
**Steps:**
1. Double-click on a task
2. Edit the task text
3. Press Enter or click outside the text field

**Expected Result:** Task text is updated with the new value  
**Priority:** Medium  

### TC-07: Delete Task
**Description:** Verify that a task can be deleted  
**Prerequisites:** User is logged in, a task list with at least one task exists  
**Steps:**
1. Click delete icon for a task

**Expected Result:** Task is removed from the list  
**Priority:** Medium  

### TC-08: Edit Task List Name
**Description:** Verify that a task list name can be edited  
**Prerequisites:** User is logged in, at least one task list exists  
**Steps:**
1. Click on list name edit icon
2. Edit the list name
3. Submit form

**Expected Result:** List name is updated with new value  
**Priority:** Medium  

### TC-09: Delete Task List
**Description:** Verify that a task list can be deleted  
**Prerequisites:** User is logged in, at least one task list exists  
**Steps:**
1. Click delete icon for a list

**Expected Result:** List and all its tasks are removed  
**Priority:** Medium  

### TC-10: User Logout
**Description:** Verify that a logged-in user can log out  
**Prerequisites:** User is logged in  
**Steps:**
1. Click logout button

**Expected Result:** User is logged out and redirected to login page  
**Priority:** High  

### TC-11: API Authentication Validation
**Description:** Verify that API endpoints require valid authentication  
**Prerequisites:** Backend server running  
**Steps:**
1. Send requests to protected endpoints without authentication token

**Expected Result:** API returns appropriate 401 Unauthorized error  
**Priority:** High  

### TC-12: API Data Validation
**Description:** Verify that API validates input data  
**Prerequisites:** Backend server running, valid authentication token available  
**Steps:**
1. Send request to create task with missing required fields

**Expected Result:** API returns appropriate 422 Unprocessable Entity error with validation messages  
**Priority:** Medium  

## 5. Risk Assessment and Prioritization

### High-Risk Areas
1. **Authentication** - Security vulnerabilities could lead to unauthorized access
   - Prioritize testing of login, registration, session management
   - Verify token-based authentication is working correctly

2. **Data Persistence** - Data loss would severely impact user experience
   - Verify all created data is properly saved and retrieved
   - Test database transactions and rollbacks

3. **API Security** - Unsecured endpoints could expose sensitive data
   - Test authentication requirements for all endpoints
   - Verify proper error handling and data validation

### Medium-Risk Areas
1. **UI/UX Issues** - Poor interface could frustrate users but wouldn't break functionality
   - Test responsive design on different screen sizes
   - Verify all UI elements are properly aligned and styled

2. **Performance** - Slow performance would impact user experience
   - Test application under normal load conditions
   - Verify response times are acceptable

### Low-Risk Areas
1. **Browser Compatibility** - Minor visual differences between browsers
   - Test on major browsers but prioritize functionality over visual perfection

2. **Edge Cases** - Unusual usage patterns or inputs
   - Test basic validation but don't exhaustively test all edge cases

### Test Prioritization Strategy
1. **Critical Path Tests** - Focus on user flows that impact core functionality
2. **High-Risk Tests** - Prioritize tests in high-risk areas
3. **Regression Tests** - Ensure no new issues are introduced
4. **Edge Case Tests** - Address unusual scenarios if time permits

## 6. Defect Reporting Procedure

### Defect Lifecycle
1. **Identification** - Tester identifies potential defect
2. **Logging** - Defect is logged with all necessary information
3. **Triage** - Defect is evaluated for severity and priority
4. **Assignment** - Defect is assigned to a developer
5. **Resolution** - Developer fixes the defect
6. **Verification** - Tester verifies the fix
7. **Closure** - Defect is closed

### Defect Report Template
Each defect report should include:
- **ID**: Unique identifier (e.g., BUG-001)
- **Title**: Brief description of the issue
- **Description**: Detailed explanation of the issue
- **Steps to Reproduce**: Numbered steps to replicate the issue
- **Expected Result**: What should happen
- **Actual Result**: What actually happens
- **Environment**: Browser, OS, screen size, etc.
- **Screenshots/Videos**: Visual evidence of the issue
- **Severity**: Critical, High, Medium, Low
- **Priority**: High, Medium, Low
- **Status**: New, Assigned, Fixed, Verified, Closed
- **Reporter**: Name of the person who reported the issue
- **Assigned To**: Name of the person assigned to fix the issue
- **Date Reported**: Date and time when the issue was reported

### Severity Definitions
- **Critical**: Application crash, data loss, security breach
- **High**: Major functionality broken, no workaround
- **Medium**: Functionality issue with workaround available
- **Low**: Minor issue, cosmetic problem

### Priority Definitions
- **High**: Must be fixed immediately
- **Medium**: Should be fixed in the next release
- **Low**: Can be fixed when time permits
