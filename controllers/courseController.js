import Course from "../models/Course.js";
import Student from "../models/Student.js";

// Get all courses with search and pagination
export const getAllCourses = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      title,
      department,
      credits,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter object
    const filter = { isActive: true };

    if (title) {
      filter.title = { $regex: title, $options: "i" };
    }

    if (department) {
      filter.department = department;
    }

    if (credits) {
      filter.credits = parseInt(credits);
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { instructor: { $regex: search, $options: "i" } },
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Get courses with populated students
    const courses = await Course.find(filter)
      .populate("enrolledStudents", "name email department")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const totalCourses = await Course.countDocuments(filter);
    const totalPages = Math.ceil(totalCourses / parseInt(limit));

    res.status(200).json({
      status: "success",
      data: {
        courses,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCourses,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch courses",
      error: error.message,
    });
  }
};

// Get course by ID
export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id)
      .populate("enrolledStudents", "name email department age admissionDate")
      .lean();

    if (!course || !course.isActive) {
      return res.status(404).json({
        status: "error",
        message: "Course not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        course,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch course",
      error: error.message,
    });
  }
};

// Create new course
export const createCourse = async (req, res) => {
  try {
    const { title, description, credits, instructor, department, duration } =
      req.body;

    // Check if course with same title already exists
    const existingCourse = await Course.findOne({
      title: { $regex: `^${title}$`, $options: "i" },
      isActive: true,
    });

    if (existingCourse) {
      return res.status(400).json({
        status: "error",
        message: "Course with this title already exists",
      });
    }

    const course = new Course({
      title,
      description,
      credits,
      instructor,
      department,
      duration,
    });

    await course.save();

    res.status(201).json({
      status: "success",
      message: "Course created successfully",
      data: {
        course,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to create course",
      error: error.message,
    });
  }
};

// Update course
export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates.createdAt;
    delete updates.updatedAt;
    delete updates.enrolledStudents;

    const course = await Course.findById(id);
    if (!course || !course.isActive) {
      return res.status(404).json({
        status: "error",
        message: "Course not found",
      });
    }

    // Check title uniqueness if title is being updated
    if (updates.title && updates.title !== course.title) {
      const existingCourse = await Course.findOne({
        title: { $regex: `^${updates.title}$`, $options: "i" },
        isActive: true,
        _id: { $ne: id },
      });

      if (existingCourse) {
        return res.status(400).json({
          status: "error",
          message: "Course with this title already exists",
        });
      }
    }

    const updatedCourse = await Course.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).populate("enrolledStudents", "name email department");

    res.status(200).json({
      status: "success",
      message: "Course updated successfully",
      data: {
        course: updatedCourse,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to update course",
      error: error.message,
    });
  }
};

// Delete course (soft delete)
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);
    if (!course || !course.isActive) {
      return res.status(404).json({
        status: "error",
        message: "Course not found",
      });
    }

    // Remove course from all enrolled students
    await Student.updateMany(
      { enrolledCourses: course._id },
      { $pull: { enrolledCourses: course._id } }
    );

    // Soft delete the course
    await Course.findByIdAndUpdate(id, { isActive: false });

    res.status(200).json({
      status: "success",
      message: "Course deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to delete course",
      error: error.message,
    });
  }
};

// Get course statistics
export const getCourseStats = async (req, res) => {
  try {
    const stats = await Course.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: "$department",
          totalCourses: { $sum: 1 },
          totalCredits: { $sum: "$credits" },
          avgCredits: { $avg: "$credits" },
          enrollmentCount: { $sum: { $size: "$enrolledStudents" } },
        },
      },
      { $sort: { totalCourses: -1 } },
    ]);

    const totalCourses = await Course.countDocuments({ isActive: true });
    const totalEnrollments = await Course.aggregate([
      { $match: { isActive: true } },
      {
        $group: { _id: null, total: { $sum: { $size: "$enrolledStudents" } } },
      },
    ]);

    res.status(200).json({
      status: "success",
      data: {
        departmentStats: stats,
        totalCourses,
        totalEnrollments: totalEnrollments[0]?.total || 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch course statistics",
      error: error.message,
    });
  }
};
