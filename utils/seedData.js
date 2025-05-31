import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import Student from "../models/Student.js";
import Course from "../models/Course.js";

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Student.deleteMany({});
    await Course.deleteMany({});

    console.log("Cleared existing data");

    // Create admin user
    const adminUser = await User.create({
      username: "admin",
      email: "admin@example.com",
      password: "admin123",
      role: "admin",
    });

    console.log("Created admin user");

    // Create sample courses
    const courses = await Course.create([
      {
        title: "Introduction to Computer Science",
        description:
          "Fundamental concepts of computer science including programming, algorithms, and data structures.",
        credits: 4,
        courseCode: "CS101",
        department: "Computer Science",
        instructor: {
          name: "Dr. John Smith",
          email: "john.smith@university.edu",
        },
        duration: "4 months",
        difficulty: "Beginner",
        maxStudents: 50,
        startDate: new Date("2024-01-15"),
        endDate: new Date("2024-05-15"),
      },
      {
        title: "Data Structures and Algorithms",
        description:
          "Advanced study of data structures, algorithms, and their applications in software development.",
        credits: 4,
        courseCode: "CS201",
        department: "Computer Science",
        instructor: {
          name: "Dr. Sarah Johnson",
          email: "sarah.johnson@university.edu",
        },
        duration: "4 months",
        difficulty: "Intermediate",
        maxStudents: 40,
        startDate: new Date("2024-02-01"),
        endDate: new Date("2024-06-01"),
      },
      {
        title: "Database Management Systems",
        description:
          "Comprehensive study of database design, implementation, and management.",
        credits: 3,
        courseCode: "CS301",
        department: "Computer Science",
        instructor: {
          name: "Dr. Michael Brown",
          email: "michael.brown@university.edu",
        },
        duration: "3 months",
        difficulty: "Advanced",
        maxStudents: 35,
        startDate: new Date("2024-03-01"),
        endDate: new Date("2024-06-01"),
      },
      {
        title: "Digital Electronics",
        description:
          "Study of digital circuits, logic gates, and electronic systems.",
        credits: 4,
        courseCode: "ECE101",
        department: "Electronics",
        instructor: {
          name: "Dr. Lisa Wilson",
          email: "lisa.wilson@university.edu",
        },
        duration: "4 months",
        difficulty: "Beginner",
        maxStudents: 45,
        startDate: new Date("2024-01-20"),
        endDate: new Date("2024-05-20"),
      },
      {
        title: "Thermodynamics",
        description:
          "Principles of thermodynamics and their applications in mechanical systems.",
        credits: 3,
        courseCode: "ME201",
        department: "Mechanical",
        instructor: {
          name: "Dr. Robert Davis",
          email: "robert.davis@university.edu",
        },
        duration: "3 months",
        difficulty: "Intermediate",
        maxStudents: 40,
        startDate: new Date("2024-02-15"),
        endDate: new Date("2024-05-15"),
      },
    ]);

    console.log("Created sample courses");

    // Create sample students
    const students = await Student.create([
      {
        name: "Alice Johnson",
        email: "alice.johnson@student.edu",
        age: 20,
        department: "Computer Science",
        phone: "1234567890",
        address: {
          street: "123 Main St",
          city: "Mumbai",
          state: "Maharashtra",
          zipCode: "400001",
          country: "India",
        },
        enrolledCourses: [courses[0]._id, courses[1]._id],
      },
      {
        name: "Bob Smith",
        email: "bob.smith@student.edu",
        age: 21,
        department: "Computer Science",
        phone: "2345678901",
        address: {
          street: "456 Oak Ave",
          city: "Delhi",
          state: "Delhi",
          zipCode: "110001",
          country: "India",
        },
        enrolledCourses: [courses[0]._id, courses[2]._id],
      },
      {
        name: "Carol Williams",
        email: "carol.williams@student.edu",
        age: 19,
        department: "Electronics",
        phone: "3456789012",
        address: {
          street: "789 Pine Rd",
          city: "Bangalore",
          state: "Karnataka",
          zipCode: "560001",
          country: "India",
        },
        enrolledCourses: [courses[3]._id],
      },
      {
        name: "David Brown",
        email: "david.brown@student.edu",
        age: 22,
        department: "Mechanical",
        phone: "4567890123",
        address: {
          street: "321 Elm St",
          city: "Chennai",
          state: "Tamil Nadu",
          zipCode: "600001",
          country: "India",
        },
        enrolledCourses: [courses[4]._id],
      },
      {
        name: "Eva Davis",
        email: "eva.davis@student.edu",
        age: 20,
        department: "IT",
        phone: "5678901234",
        address: {
          street: "654 Maple Dr",
          city: "Pune",
          state: "Maharashtra",
          zipCode: "411001",
          country: "India",
        },
        enrolledCourses: [courses[0]._id],
      },
    ]);

    console.log("Created sample students");

    // Update courses with enrolled students
    await Course.findByIdAndUpdate(courses[0]._id, {
      $push: {
        enrolledStudents: [students[0]._id, students[1]._id, students[4]._id],
      },
    });

    await Course.findByIdAndUpdate(courses[1]._id, {
      $push: { enrolledStudents: students[0]._id },
    });

    await Course.findByIdAndUpdate(courses[2]._id, {
      $push: { enrolledStudents: students[1]._id },
    });

    await Course.findByIdAndUpdate(courses[3]._id, {
      $push: { enrolledStudents: students[2]._id },
    });

    await Course.findByIdAndUpdate(courses[4]._id, {
      $push: { enrolledStudents: students[3]._id },
    });

    console.log("Updated course enrollments");

    console.log("\n=== SEED DATA CREATED SUCCESSFULLY ===");
    console.log("\nAdmin Credentials:");
    console.log("Email: admin@example.com");
    console.log("Password: admin123");
    console.log("\nSample Data:");
    console.log(`- ${courses.length} courses created`);
    console.log(`- ${students.length} students created`);
    console.log("- Course enrollments established");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};

seedData();
