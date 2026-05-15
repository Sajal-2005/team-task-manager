const mongoose = require('mongoose');

const BASE_URL = 'http://localhost:5001/api';

async function runTests() {
  console.log('--- Starting E2E API Tests ---\n');
  let passed = 0;
  let failed = 0;

  // Clear Database completely
  try {
    await mongoose.connect('mongodb://localhost:27017/team-task-manager');
    await mongoose.connection.dropDatabase();
    console.log('Database cleared for testing.');
    await mongoose.connection.close();
  } catch (err) {
    console.error('Failed to clear database:', err.message);
    process.exit(1);
  }

  const logTest = (name, result, errorMsg = '') => {
    if (result) {
      console.log(`✅ PASS: ${name}`);
      passed++;
    } else {
      console.log(`❌ FAIL: ${name} - ${errorMsg}`);
      failed++;
    }
  };

  const fetchApi = async (url, options = {}) => {
    const res = await fetch(`${BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    let data;
    try {
      data = await res.json();
    } catch(e) {
      data = await res.text();
    }

    if (!res.ok) {
      const err = new Error(data.message || res.statusText);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  };

  const adminUser = { name: 'Admin Test', email: 'admin@test.com', password: 'password123', role: 'admin' };
  const memberUser = { name: 'Member Test', email: 'member@test.com', password: 'password123', role: 'member' };
  let adminToken = '';
  let memberToken = '';
  let memberId = '';
  let adminId = '';

  // 1. Authentication Tests
  try {
    const signupAdminRes = await fetchApi('/auth/signup', { method: 'POST', body: JSON.stringify(adminUser) });
    adminToken = signupAdminRes.token;
    adminId = signupAdminRes._id;
    logTest('Admin signup', !!adminToken);
  } catch (err) {
    logTest('Admin signup', false, err.message);
  }

  try {
    const signupMemberRes = await fetchApi('/auth/signup', { method: 'POST', body: JSON.stringify(memberUser) });
    memberToken = signupMemberRes.token;
    memberId = signupMemberRes._id;
    logTest('Member signup', !!memberToken);
  } catch (err) {
    logTest('Member signup', false, err.message);
  }

  try {
    const loginRes = await fetchApi('/auth/login', { method: 'POST', body: JSON.stringify({ email: 'admin@test.com', password: 'password123' }) });
    logTest('Admin login', loginRes.token === adminToken);
  } catch (err) {
    logTest('Admin login', false, err.message);
  }

  try {
    await fetchApi('/auth/login', { method: 'POST', body: JSON.stringify({ email: 'admin@test.com', password: 'wrongpassword' }) });
    logTest('Invalid login', false, 'Should have failed');
  } catch (err) {
    logTest('Invalid login', err.status === 401);
  }

  const adminHeaders = { Authorization: `Bearer ${adminToken}` };
  const memberHeaders = { Authorization: `Bearer ${memberToken}` };

  // 2. Admin Actions
  let projectId = '';
  try {
    const projRes = await fetchApi('/projects', { method: 'POST', body: JSON.stringify({ title: 'Test Project', description: 'Test Desc' }), headers: adminHeaders });
    projectId = projRes._id;
    logTest('Admin create project', !!projectId);
  } catch (err) {
    logTest('Admin create project', false, err.message);
  }

  try {
    await fetchApi(`/projects/${projectId}`, { method: 'PUT', body: JSON.stringify({ title: 'Updated Project' }), headers: adminHeaders });
    logTest('Admin edit project', true);
  } catch (err) {
    logTest('Admin edit project', false, err.message);
  }

  try {
    await fetchApi(`/projects/${projectId}/members`, { method: 'POST', body: JSON.stringify({ members: [memberId] }), headers: adminHeaders });
    logTest('Admin add member to project', true);
  } catch (err) {
    logTest('Admin add member to project', false, err.message);
  }

  let taskId = '';
  let tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  try {
    const taskRes = await fetchApi('/tasks', { 
      method: 'POST', 
      body: JSON.stringify({ 
        title: 'Test Task', 
        projectId, 
        assignedTo: memberId,
        dueDate: tomorrow.toISOString(),
        status: 'pending'
      }), 
      headers: adminHeaders 
    });
    taskId = taskRes._id;
    logTest('Admin create task', !!taskId);
  } catch (err) {
    logTest('Admin create task', false, err.message);
  }

  // 3. Member Actions (Success scenarios)
  try {
    const memberProjects = await fetchApi('/projects', { headers: memberHeaders });
    logTest('Member view assigned projects', memberProjects.length === 1);
  } catch (err) {
    logTest('Member view assigned projects', false, err.message);
  }

  try {
    const memberTasks = await fetchApi('/tasks', { headers: memberHeaders });
    logTest('Member view assigned tasks', memberTasks.length === 1);
  } catch (err) {
    logTest('Member view assigned tasks', false, err.message);
  }

  try {
    await fetchApi(`/tasks/${taskId}`, { method: 'PUT', body: JSON.stringify({ status: 'in-progress' }), headers: memberHeaders });
    logTest('Member update own task status', true);
  } catch (err) {
    logTest('Member update own task status', false, err.message);
  }

  // 4. Member Security / Failure scenarios
  try {
    await fetchApi('/projects', { method: 'POST', body: JSON.stringify({ title: 'Hacked Project' }), headers: memberHeaders });
    logTest('Member try to create project (forbidden)', false, 'Should have failed');
  } catch (err) {
    logTest('Member try to create project (forbidden)', err.status === 403);
  }

  try {
    await fetchApi(`/tasks/${taskId}`, { method: 'DELETE', headers: memberHeaders });
    logTest('Member try to delete task (forbidden)', false, 'Should have failed');
  } catch (err) {
    logTest('Member try to delete task (forbidden)', err.status === 403);
  }

  // Admin Dashboard Check
  try {
    const dashboard = await fetchApi('/dashboard/stats', { headers: adminHeaders });
    const ok = dashboard.totalProjects === 1 && dashboard.totalTasks === 1 && dashboard.inProgressTasksCount === 1;
    logTest('Admin Dashboard Calculations', ok);
  } catch (err) {
    logTest('Admin Dashboard Calculations', false, err.message);
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
