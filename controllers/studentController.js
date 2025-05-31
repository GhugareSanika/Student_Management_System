import Student from "../models/Student.js";
import Course from "../models/Course.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import fs from "fs";
import path from "path";

export const getStudents = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = { isActive: true };

  if (req.query.department) {
    filter.department = req.query.department;
  }

  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: "i" } },
      { email: { $regex: req.query.search, $options: "i" } },
    ];
  }

  // Get students with pagination
  const students = await Student.find(filter)
    .populate("enrolledCourses", "title courseCode credits department")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Get total count for pagination
  const total = await Student.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    success: true,
    data: {
      students,
      pagination: {
        currentPage: page,
        totalPages,
        totalStudents: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    },
  });
});

export const getStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id).populate(
    "enrolledCourses",
    "title courseCode credits department instructor startDate endDate"
  );

  if (!student || !student.isActive) {
    return res.status(404).json({
      success: false,
      message: "Student not found",
    });
  }

  res.status(200).json({
    success: true,
    data: {
      student,
    },
  });
});

export const createStudent = asyncHandler(async (req, res) => {
  const studentData = { ...req.body };

  // Add profile picture if uploaded
  if (req.file) {
    studentData.profilePicture = req.file.filename;
  }

  const student = await Student.create(studentData);

  // Populate the created student
  await student.populate(
    "enrolledCourses",
    "title courseCode credits department"
  );

  res.status(201).json({
    success: true,
    message: "Student created successfully",
    data: {
      student,
    },
  });
});

export const updateStudent = asyncHandler(async (req, res) => {
  let student = await Student.findById(req.params.id);

  if (!student || !student.isActive) {
    return res.status(404).json({
      success: false,
      message: "Student not found",
    });
  }

  const updateData = { ...req.body };

  // Handle profile picture update
  if (req.file) {
    // Delete old profile picture if exists
    if (student.profilePicture) {
      const oldImagePath = path.join(
        process.cwd(),
        "uploads",
        "students",
        student.profilePicture
      );
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }
    updateData.profilePicture = req.file.filename;
  }

  student = await Student.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  }).populate("enrolledCourses", "title courseCode credits department");

  res.status(200).json({
    success: true,
    message: "Student updated successfully",
    data: {
      student,
    },
  });
});

export const deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);

  if (!student || !student.isActive) {
    return res.status(404).json({
      success: false,
      message: "Student not found",
    });
  }

  student.isActive = false;
  await student.save();

  // Remove student from all enrolled courses
  await Course.updateMany(
    { enrolledStudents: student._id },
    { $pull: { enrolledStudents: student._id } }
  );

  res.status(200).json({
    success: true,
    message: "Student deleted successfully",
  });
});

export const enrollStudentInCourse = asyncHandler(async (req, res) => {
  const { id: studentId, courseId } = req.params;

  const student = await Student.findById(studentId);
  const course = await Course.findById(courseId);

  if (!student || !student.isActive) {
    return res.status(404).json({
      success: false,
      message: "Student not found",
    });
  }

  if (!course || !course.isActive) {
    return res.status(404).json({
      success: false,
      message: "Course not found",
    });
  }

  // Check if student is already enrolled
  if (student.enrolledCourses.includes(courseId)) {
    return res.status(400).json({
      success: false,
      message: "Student is already enrolled in this course",
    });
  }

  // Check if course is full
  if (course.enrolledStudents.length >= course.maxStudents) {
    return res.status(400).json({
      success: false,
      message: "Course is full",
    });
  }

  // Enroll student
  await student.enrollInCourse(courseId);
  await course.enrollStudent(studentId);

  // Get updated student data
  const updatedStudent = await Student.findById(studentId).populate(
    "enrolledCourses",
    "title courseCode credits department"
  );

  res.status(200).json({
    success: true,
    message: "Student enrolled in course successfully",
    data: {
      student: updatedStudent,
    },
  });
});

export const unenrollStudentFromCourse = asyncHandler(async (req, res) => {
  const { id: studentId, courseId } = req.params;

  const student = await Student.findById(studentId);
  const course = await Course.findById(courseId);

  if (!student || !student.isActive) {
    return res.status(404).json({
      success: false,
      message: "Student not found",
    });
  }

  if (!course) {
    return res.status(404).json({
      success: false,
      message: "Course not found",
    });
  }

  // Check if student is enrolled
  if (!student.enrolledCourses.includes(courseId)) {
    return res.status(400).json({
      success: false,
      message: "Student is not enrolled in this course",
    });
  }

  // Unenroll student
  await student.unenrollFromCourse(courseId);
  await course.unenrollStudent(studentId);

  // Get updated student data
  const updatedStudent = await Student.findById(studentId).populate(
    "enrolledCourses",
    "title courseCode credits department"
  );

  res.status(200).json({
    success: true,
    message: "Student unenrolled from course successfully",
    data: {
      student: updatedStudent,
    },
  });
});

export const getStudentsByDepartment = asyncHandler(async (req, res) => {
  const { department } = req.params;

  const students = await Student.findByDepartment(department);

  res.status(200).json({
    success: true,
    data: {
      students,
      count: students.length,
    },
  });
});
