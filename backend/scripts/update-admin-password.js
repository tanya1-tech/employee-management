const fs = require('fs');
const path = require('path');

// Set your new password here
const NEW_PASSWORD = 'your_new_password_here'; // CHANGE THIS!

// Files to update
const files = [
  {
    path: 'backend/controllers/auth.controller.js',
    old: "if (username === 'admin' && password === 'admin123')",
    new: `if (username === 'admin' && password === '${NEW_PASSWORD}')`,
  },
  {
    path: 'frontend/src/views/Login.vue',
    old: 'admin / admin123',
    new: `admin / ${NEW_PASSWORD}`,
  },
  {
    path: 'frontend/src/views/Profile.vue',
    old: 'Admin Password: admin123',
    new: `Admin Password: ${NEW_PASSWORD}`,
  },
];

// Update each file
files.forEach(file => {
  const fullPath = path.join(__dirname, file.path);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    content = content.replace(file.old, file.new);
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Updated: ${file.path}`);
  } else {
    console.log(`⚠️ File not found: ${file.path}`);
  }
});

console.log(`\n✅ Admin password changed to: ${NEW_PASSWORD}`);