# Bug Reports

## Bug 1: Authentication Token Not Refreshing on Session Timeout

**ID**: BUG-001  
**Title**: Authentication token not refreshing automatically after expiration  
**Description**: When the JWT authentication token expires after its timeout period, the application does not automatically refresh the token, leading to failed API requests and forcing users to log in again manually.  

**Steps to Reproduce**:
1. Log in to the application
2. Wait for the JWT token to expire (typically 24 hours)
3. Attempt to perform an action requiring authentication (e.g., create a new task list)

**Expected Result**: The application should detect the expired token and automatically refresh it in the background, allowing the user to continue without interruption.  

**Actual Result**: API requests fail with 401 Unauthorized errors, and the user is abruptly logged out or experiences non-functional features until manually logging in again.  

**Environment**:
- Browser: Chrome 113.0.5672.127
- OS: macOS 15
- Frontend Version: Current main branch
- Backend Version: Current main branch

**Screenshots**:
[Screenshot showing the 401 error in the network tab]

**Severity**: High  
**Priority**: High  

**Potential Fix**: Implement a token refresh mechanism that:
1. Detects when a token is about to expire
2. Sends a refresh request to the backend
3. Updates the stored token without disrupting the user experience

## Bug 2: Task List Creation Fails with Special Characters

**ID**: BUG-002  
**Title**: Task list creation fails when list name contains special characters  
**Description**: When attempting to create a task list with a name containing certain special characters (particularly `&`, `<`, `>`, and quotes), the API returns a 422 Unprocessable Entity error, but no clear error message is displayed to the user.  

**Steps to Reproduce**:
1. Log in to the application
2. Click "Add New List"
3. Enter a list name with special characters, e.g., "Work & Home Tasks"
4. Submit the form

**Expected Result**: 
1. Either the list should be created successfully with proper sanitization/escaping of special characters, OR
2. A clear validation error should be shown to the user explaining which characters are not allowed

**Actual Result**: The request fails silently, and the user receives no feedback. The error is only visible in the browser console network tab.

**Environment**:
- Browser: Firefox 115.0
- OS: macOS 15
- Frontend Version: Current main branch
- Backend Version: Current main branch

**Screenshots**:
[Screenshot showing failed network request and 422 error]

**Severity**: Medium  
**Priority**: Medium  

**Potential Fix**: 
1. Properly sanitize input on the backend to allow safe special characters
2. Add frontend validation to inform users which characters are not allowed
3. Improve error handling to display meaningful messages to users when input validation fails

## Bug 3: Completed Tasks Revert to Incomplete After Refresh

**ID**: BUG-003  
**Title**: Completed tasks sometimes revert to incomplete state after page refresh  
**Description**: When marking tasks as complete, the UI updates correctly, but after refreshing the page, some tasks that were previously marked as complete appear as incomplete again. This indicates a potential issue with the state persistence or caching mechanism.

**Steps to Reproduce**:
1. Log in to the application
2. Create a new task list
3. Add multiple tasks to the list
4. Mark several tasks as complete by checking the checkbox
5. Refresh the page (F5)

**Expected Result**: All tasks should maintain their completed/incomplete state after page refresh.

**Actual Result**: Approximately 20% of tasks that were marked as complete revert to the incomplete state after the page is refreshed.

**Environment**:
- Browser: Chrome 113.0.5672.127 (also reproduced in Firefox and Safari)
- OS: macOS 15
- Frontend Version: Current main branch
- Backend Version: Current main branch

**Screenshots**:
[Screenshot showing completed tasks before refresh]
[Screenshot showing the same tasks after refresh with some reverted to incomplete]

**Severity**: High  
**Priority**: High  

**Potential Fix**: 
1. Investigate the task completion API endpoint to ensure updates are being persisted correctly
2. Check for race conditions that might be causing updates to be lost
3. Ensure proper synchronization between the client-side cache and server state
4. Add automated tests specifically for task completion persistence

## Bug 4: Cross-Origin Resource Sharing (CORS) Issues for Non-Localhost Clients

**ID**: BUG-004  
**Title**: CORS configuration blocks requests from non-localhost origins  
**Description**: The backend API is configured to only accept requests from localhost origins. This prevents the frontend from working when deployed to any other domain, limiting the application's deployment options.

**Steps to Reproduce**:
1. Deploy the frontend to a non-localhost domain (e.g., a test server or cloud hosting)
2. Attempt to connect to the backend API running on localhost or another server
3. Observe network requests in the browser console

**Expected Result**: The backend should be configurable to accept requests from specific allowed origins, not just localhost.

**Actual Result**: All cross-origin requests fail with CORS errors: "Access to XMLHttpRequest at 'http://localhost:3000/api/v1/auth_token' from origin 'http://test-server.example.com' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource."

**Environment**:
- Browser: Chrome 113.0.5672.127
- OS: macOS 15
- Frontend deployed to: test-server.example.com
- Backend Version: Current main branch

**Screenshots**:
[Screenshot showing CORS error in the console]

**Severity**: Medium  
**Priority**: Medium  

**Potential Fix**: 
1. Modify the CORS configuration in the backend to accept requests from configurable origins
2. Add environment variables to control allowed origins
3. Implement proper CORS headers for all API endpoints
4. Consider adding a proxy configuration option for development environments

## Bug 5: Memory Leak in Task List Management

**ID**: BUG-005  
**Title**: Memory leak when repeatedly creating and deleting task lists  
**Description**: When repeatedly creating and deleting multiple task lists in a single session, the application gradually consumes more memory, eventually leading to degraded performance. This suggests a memory leak in the Backbone.js frontend components.

**Steps to Reproduce**:
1. Log in to the application
2. Create 10+ task lists
3. Delete all task lists
4. Repeat steps 2-3 approximately 15-20 times
5. Monitor memory usage using browser developer tools

**Expected Result**: Memory usage should remain relatively stable regardless of how many times task lists are created and deleted.

**Actual Result**: Memory usage steadily increases with each cycle of creation and deletion, indicating that resources are not being properly released.

**Environment**:
- Browser: Chrome 113.0.5672.127
- OS: macOS 15
- Frontend Version: Current main branch
- Backend Version: Current main branch

**Screenshots**:
[Screenshot showing memory usage graph in Chrome DevTools after repeated operations]

**Severity**: Medium  
**Priority**: Low  

**Potential Fix**: 
1. Review Backbone view cleanup to ensure proper disposal of event listeners
2. Check for zombie DOM elements or detached DOM trees
3. Implement proper garbage collection practices in the frontend code
4. Consider using a memory profiling tool to identify specific leaks

## Bug 5: Memory Leak in Task List Management

**ID**: BUG-005  
**Title**: Memory leak when repeatedly creating and deleting task lists  
**Description**: When repeatedly creating and deleting multiple task lists in a single session, the application gradually consumes more memory, eventually leading to degraded performance. This suggests a memory leak in the Backbone.js frontend components.

**Steps to Reproduce**:
1. Log in to the application
2. Create 10+ task lists
3. Delete all task lists
4. Repeat steps 2-3 approximately 15-20 times
5. Monitor memory usage using browser developer tools

**Expected Result**: Memory usage should remain relatively stable regardless of how many times task lists are created and deleted.

**Actual Result**: Memory usage steadily increases with each cycle of creation and deletion, indicating that resources are not being properly released.

**Environment**:
- Browser: Chrome 113.0.5672.127
- OS: Ubuntu 22.04
- Frontend Version: Current main branch
- Backend Version: Current main branch

**Screenshots**:
[Screenshot showing memory usage graph in Chrome DevTools after repeated operations]

**Severity**: Medium  
**Priority**: Low  

**Potential Fix**: 
1. Review Backbone view cleanup to ensure proper disposal of event listeners
2. Check for zombie DOM elements or detached DOM trees
3. Implement proper garbage collection practices in the frontend code
4. Consider using a memory profiling tool to identify specific leaks