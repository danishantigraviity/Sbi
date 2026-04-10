const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api';
const EMAIL = 'admin@redbank.com';
const PASSWORD = 'admin123';

async function testTaskOperations() {
  try {
    // 1. Login
    console.log('Logging in...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: EMAIL,
      password: PASSWORD,
      role: 'admin'
    });
    const token = loginRes.data.token;
    console.log('Login successful.');

    const headers = { Authorization: `Bearer ${token}` };

    // 2. Fetch tasks
    console.log('Fetching tasks...');
    const tasksRes = await axios.get(`${BASE_URL}/admin/tasks`, { headers });
    const tasks = tasksRes.data;
    console.log(`Found ${tasks.length} tasks.`);

    if (tasks.length === 0) {
      console.log('No tasks found to test update/delete.');
      return;
    }

    const testTask = tasks[0];
    console.log(`Testing with task: ${testTask._id} (${testTask.title})`);

    // 3. Test Update
    console.log('Testing Update...');
    try {
      const updateRes = await axios.put(`${BASE_URL}/admin/tasks/${testTask._id}`, {
        title: testTask.title + ' (Updated)',
        description: testTask.description,
        assignedTo: testTask.assignedTo._id
      }, { headers });
      console.log('Update successful:', updateRes.status);
    } catch (err) {
      console.error('Update failed:', err.response?.status, err.response?.data || err.message);
    }

    // 4. Test Delete
    console.log('Testing Delete...');
    try {
      const deleteRes = await axios.delete(`${BASE_URL}/admin/tasks/${testTask._id}`, { headers });
      console.log('Delete successful:', deleteRes.status);
    } catch (err) {
      console.error('Delete failed:', err.response?.status, err.response?.data || err.message);
    }

  } catch (err) {
    console.error('Test failed at login/fetch:', err.response?.status, err.response?.data || err.message);
  }
}

testTaskOperations();
鼓舞
