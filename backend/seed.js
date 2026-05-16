const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5001/api';

async function seed() {
  console.log(`Seeding database at ${API_URL}...`);
  
  try {
    // 1. Create Admin
    console.log('Creating Admin user...');
    let adminToken = '';
    try {
      const res = await axios.post(`${API_URL}/auth/signup`, {
        name: 'Admin Boss',
        email: 'adminboss@example.com',
        password: 'password123',
        role: 'admin'
      });
      adminToken = res.data.token;
      console.log('Admin created successfully.');
    } catch (e) {
      if (e.response && e.response.status === 400) {
        console.log('Admin already exists, logging in...');
        const res = await axios.post(`${API_URL}/auth/login`, {
          email: 'adminboss@example.com',
          password: 'password123'
        });
        adminToken = res.data.token;
      } else {
        throw e;
      }
    }

    const authConfig = { headers: { Authorization: `Bearer ${adminToken}` } };

    // 2. Create Members
    const members = [
      { name: 'Alice Developer', email: 'alice@example.com', password: 'password123', role: 'member' },
      { name: 'Bob Designer', email: 'bob@example.com', password: 'password123', role: 'member' },
      { name: 'Charlie PM', email: 'charlie@example.com', password: 'password123', role: 'member' }
    ];

    const memberIds = [];
    console.log('Creating Members...');
    for (const member of members) {
      try {
        const res = await axios.post(`${API_URL}/auth/signup`, member);
        memberIds.push(res.data._id);
        console.log(`Created member: ${member.name}`);
      } catch (e) {
        if (e.response && e.response.status === 400) {
          console.log(`Member ${member.name} already exists. Skipping...`);
          // Fetch users to get the ID
        } else {
          throw e;
        }
      }
    }

    // Fetch all users to ensure we have member IDs
    const usersRes = await axios.get(`${API_URL}/auth/users`, authConfig);
    const allMembers = usersRes.data.filter(u => u.role === 'member');
    
    if (allMembers.length === 0) {
      console.log("No members found to assign tasks to!");
      return;
    }

    // 3. Create a Project
    console.log('Creating Project...');
    const projectRes = await axios.post(`${API_URL}/projects`, {
      title: 'Website Redesign',
      description: 'Overhauling the entire frontend using Shadcn and Tailwind CSS.'
    }, authConfig);
    const projectId = projectRes.data._id;
    console.log(`Created Project: Website Redesign`);

    // Add members to project
    console.log('Adding members to project...');
    const memberIdsToAdd = allMembers.map(m => m._id);
    await axios.post(`${API_URL}/projects/${projectId}/members`, {
      members: memberIdsToAdd
    }, authConfig);

    // 4. Create Tasks
    console.log('Creating Tasks...');
    const tasks = [
      {
        title: 'Design Mockups',
        description: 'Create high-fidelity mockups for the new dashboard in Figma.',
        status: 'completed',
        priority: 'High',
        dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
        projectId: projectId,
        assignedTo: allMembers[0]._id
      },
      {
        title: 'Setup Tailwind CSS',
        description: 'Install and configure Tailwind and PostCSS plugins.',
        status: 'in-progress',
        priority: 'High',
        dueDate: new Date(Date.now() + 86400000 * 1).toISOString(),
        projectId: projectId,
        assignedTo: allMembers[1]?._id || allMembers[0]._id
      },
      {
        title: 'Build Navbar Component',
        description: 'Create a responsive navbar with user dropdown.',
        status: 'pending',
        priority: 'Medium',
        dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
        projectId: projectId,
        assignedTo: allMembers[2]?._id || allMembers[0]._id
      },
      {
        title: 'Integrate Drag and Drop',
        description: 'Use @hello-pangea/dnd to build the kanban board.',
        status: 'pending',
        priority: 'High',
        dueDate: new Date(Date.now() + 86400000 * 4).toISOString(),
        projectId: projectId,
        assignedTo: allMembers[0]._id
      }
    ];

    for (const task of tasks) {
      const res = await axios.post(`${API_URL}/tasks`, task, authConfig);
      console.log(`Created Task: ${task.title}`);
      
      // Add a dummy comment to the first task
      if (task.title === 'Design Mockups') {
        await axios.post(`${API_URL}/tasks/${res.data._id}/comments`, {
          text: 'Figma link has been shared in the main Slack channel! Looking great.'
        }, authConfig);
      }
    }

    console.log('✅ Seeding completed successfully!');
    console.log('---');
    console.log('You can now log in with:');
    console.log('Email: adminboss@example.com');
    console.log('Password: password123');
    console.log('---');
    
  } catch (error) {
    console.error('❌ Error during seeding:');
    console.error(error.response ? error.response.data : error.message);
  }
}

seed();
