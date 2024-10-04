const bcrypt = require('bcryptjs');
const usersSchema = require('../models/usersSchema');

// Function to seed admin user initially server started
const seedAdmin = async () => {

    //set up the name,email and password for your admin --------
    const adminCredential = {
        name: "Admin", // your admin name
        email: "admin@gmail.com", // your admin email
        password: "admin@321" // your admin password

    }

    try {
        // Check if an admin user already exists
        const existingAdmin = await usersSchema.findOne({ role: 'admin' });
        if (existingAdmin) {
            console.log('Admin user already exists');
            return;
        }

        // Hash the admin password
        const hashedPassword = await bcrypt.hash(adminCredential?.password, 10);

        // Create a new admin user
        const adminUser = new usersSchema({
            name: adminCredential?.name,
            email: adminCredential?.email,
            password: hashedPassword,
            role: 'admin'  // Set the role as 'admin'
        });

        // Save the admin user to the database
        await adminUser.save();
        console.log('Admin user created successfully');
    } catch (error) {
        console.error('Error seeding admin user:', error);
    }
};

module.exports = seedAdmin;
