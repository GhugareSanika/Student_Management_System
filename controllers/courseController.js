import Course from "../models/Course.js";
import Student from "../models/Student.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const getCourses = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Build filter object
  const filter = { isActive: true };

  if (req.query.department) {
    filter.department = req.query.department;
  }

  let query = Course.find(filter);

  if (req.query.title) {
    query = Course.find({
      ...filter,
      $text: { $search: req.query.title },
    }).sort({ score: { $meta: "textScore" } });
  }

  const courses = await query
    .populate("enrolledStudents", "name email department")
    .populate("prerequisites", "title courseCode")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Course.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    success: true,
    data: {
      courses,
      pagination: {
        currentPage: page,
        totalPages,
        totalCourses: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    },
  });
});

export const getCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)
    .populate("enrolledStudents", "name email department age")
    .populate("prerequisites", "title courseCode credits");

  if (!course || !course.isActive) {
    return res.status(404).json({
      success: false,
      message: "Course not found",
    });
  }

  res.status(200).json({
    success: true,
    data: {
      course,
    },
  });
});

export const createCourse = asyncHandler(async (req, res) => {
  // Check if course code already exists
  const existingCourse = await Course.findOne({
    courseCode: req.body.courseCode.toUpperCase(),
  });

  if (existingCourse) {
    return res.status(400).json({
      success: false,
      message: "Course with this code already exists",
    });
  }

  const course = await Course.create(req.body);

  // Populate the created course
  await course.populate("prerequisites", "title courseCode credits");

  res.status(201).json({
    success: true,
    message: "Course created successfully",
    data: {
      course,
    },
  });
});

export const updateCourse = asyncHandler(async (req, res) => {
  let course = await Course.findById(req.params.id);

  if (!course || !course.isActive) {
    return res.status(404).json({
      success: false,
      message: "Course not found",
    });
  }

  // Check if course code is being updated and if it already exists
  if (req.body.courseCode && req.body.courseCode !== course.courseCode) {
    const existingCourse = await Course.findOne({
      courseCode: req.body.courseCode.toUpperCase(),
      _id: { $ne: req.params.id },
    });

    if (existingCourse) {
      return res.status(400).json({
        success: false,
        message: "Course with this code already exists",
      });
    }
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
    .populate("enrolledStudents", "name email department")
    .populate("prerequisites", "title courseCode credits");

  res.status(200).json({
    success: true,
    message: "Course updated successfully",
    data: {
      course,
    },
  });
});

export const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course || !course.isActive) {
    return res.status(404).json({
      success: false,
      message: "Course not found",
    });
  }

  // Soft delete - set isActive to false
  course.isActive = false;
  await course.save();

  // Remove course from all enrolled students
  await Student.updateMany(
    { enrolledCourses: course._id },
    { $pull: { enrolledCourses: course._id } }
  );

  res.status(200).json({
    success: true,
    message: "Course deleted successfully",
  });
});

export const getCoursesByDepartment = asyncHandler(async (req, res) => {
  const { department } = req.params;

  const courses = await Course.findByDepartment(department).populate(
    "enrolledStudents",
    "name email"
  );

  res.status(200).json({
    success: true,
    data: {
      courses,
      count: courses.length,
    },
  });
});

export const searchCourses = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({
      success: false,
      message: "Search query is required",
    });
  }

  const courses = await Course.searchCourses(q).populate(
    "enrolledStudents",
    "name email department"
  );

  res.status(200).json({
    success: true,
    data: {
      courses,
      count: courses.length,
    },
  });
});

export const getCourseStats = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id).populate(
    "enrolledStudents",
    "department"
  );

  if (!course || !course.isActive) {
    return res.status(404).json({
      success: false,
      message: "Course not found",
    });
  }

  // Calculate department-wise enrollment
  const departmentStats = course.enrolledStudents.reduce((acc, student) => {
    acc[student.department] = (acc[student.department] || 0) + 1;
    return acc;
  }, {});

  const stats = {
    totalEnrolled: course.enrolledStudents.length,
    availableSpots: course.maxStudents - course.enrolledStudents.length,
    enrollmentPercentage: (
      (course.enrolledStudents.length / course.maxStudents) *
      100
    ).toFixed(2),
    departmentWiseEnrollment: departmentStats,
    courseStatus: course.status,
  };

  res.status(200).json({
    success: true,
    data: {
      course: {
        id: course._id,
        title: course.title,
        courseCode: course.courseCode,
      },
      stats,
    },
  });
});
