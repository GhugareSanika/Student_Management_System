import Student from "../models/Student.js";
import Course from "../models/Course.js";

// Get all students with pagination and filtering
export const getAllStudents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      department,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter object
    const filter = { isActive: true };

    if (department) {
      filter.department = department;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Get students with populated courses
    const students = await Student.find(filter)
      .populate("enrolledCourses", "title credits department")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const totalStudents = await Student.countDocuments(filter);
    const totalPages = Math.ceil(totalStudents / parseInt(limit));

    res.status(200).json({
      status: "success",
      data: {
        students,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalStudents,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch students",
      error: error.message,
    });
  }
};

// Get student by ID
export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id)
      .populate(
        "enrolledCourses",
        "title description credits instructor department duration"
      )
      .lean();

    if (!student || !student.isActive) {
      return res.status(404).json({
        status: "error",
        message: "Student not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        student,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch student",
      error: error.message,
    });
  }
};

// Create new student
export const createStudent = async (req, res) => {
  try {
    const { name, email, age, department, enrolledCourses } = req.body;

    // Check if email already exists
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({
        status: "error",
        message: "Student with this email already exists",
      });
    }

    // Validate enrolled courses if provided
    if (enrolledCourses && enrolledCourses.length > 0) {
      const validCourses = await Course.find({
        _id: { $in: enrolledCourses },
        isActive: true,
      });

      if (validCourses.length !== enrolledCourses.length) {
        return res.status(400).json({
          status: "error",
          message: "One or more courses are invalid",
        });
      }
    }

    const student = new Student({
      name,
      email,
      age,
      department,
      enrolledCourses: enrolledCourses || [],
    });

    await student.save();

    // Update course enrollment
    if (enrolledCourses && enrolledCourses.length > 0) {
      await Course.updateMany(
        { _id: { $in: enrolledCourses } },
        { $addToSet: { enrolledStudents: student._id } }
      );
    }

    // Populate courses before sending response
    await student.populate("enrolledCourses", "title credits department");

    res.status(201).json({
      status: "success",
      message: "Student created successfully",
      data: {
        student,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to create student",
      error: error.message,
    });
  }
};

// Update student
export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates.createdAt;
    delete updates.updatedAt;

    const student = await Student.findById(id);
    if (!student || !student.isActive) {
      return res.status(404).json({
        status: "error",
        message: "Student not found",
      });
    }

    // Check email uniqueness if email is being updated
    if (updates.email && updates.email !== student.email) {
      const existingStudent = await Student.findOne({ email: updates.email });
      if (existingStudent) {
        return res.status(400).json({
          status: "error",
          message: "Email already exists",
        });
      }
    }

    // Handle course enrollment updates
    if (updates.enrolledCourses) {
      const validCourses = await Course.find({
        _id: { $in: updates.enrolledCourses },
        isActive: true,
      });

      if (validCourses.length !== updates.enrolledCourses.length) {
        return res.status(400).json({
          status: "error",
          message: "One or more courses are invalid",
        });
      }

      // Remove student from old courses
      await Course.updateMany(
        { enrolledStudents: student._id },
        { $pull: { enrolledStudents: student._id } }
      );

      // Add student to new courses
      await Course.updateMany(
        { _id: { $in: updates.enrolledCourses } },
        { $addToSet: { enrolledStudents: student._id } }
      );
    }

    const updatedStudent = await Student.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).populate("enrolledCourses", "title credits department");

    res.status(200).json({
      status: "success",
      message: "Student updated successfully",
      data: {
        student: updatedStudent,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to update student",
      error: error.message,
    });
  }
};

// Delete student (soft delete)
export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id);
    if (!student || !student.isActive) {
      return res.status(404).json({
        status: "error",
        message: "Student not found",
      });
    }

    // Remove student from all enrolled courses
    await Course.updateMany(
      { enrolledStudents: student._id },
      { $pull: { enrolledStudents: student._id } }
    );

    // Soft delete the student
    await Student.findByIdAndUpdate(id, { isActive: false });

    res.status(200).json({
      status: "success",
      message: "Student deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to delete student",
      error: error.message,
    });
  }
};

// Enroll student in a course
export const enrollInCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { courseId } = req.body;

    const student = await Student.findById(id);
    const course = await Course.findById(courseId);

    if (!student || !student.isActive) {
      return res.status(404).json({
        status: "error",
        message: "Student not found",
      });
    }

    if (!course || !course.isActive) {
      return res.status(404).json({
        status: "error",
        message: "Course not found",
      });
    }

    // Check if already enrolled
    if (student.enrolledCourses.includes(courseId)) {
      return res.status(400).json({
        status: "error",
        message: "Student is already enrolled in this course",
      });
    }

    // Add course to student and student to course
    student.enrolledCourses.push(courseId);
    course.enrolledStudents.push(id);

    await Promise.all([student.save(), course.save()]);

    res.status(200).json({
      status: "success",
      message: "Student enrolled in course successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to enroll student",
      error: error.message,
    });
  }
};

// Unenroll student from a course
export const unenrollFromCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { courseId } = req.body;

    const student = await Student.findById(id);
    const course = await Course.findById(courseId);

    if (!student || !student.isActive) {
      return res.status(404).json({
        status: "error",
        message: "Student not found",
      });
    }

    if (!course) {
      return res.status(404).json({
        status: "error",
        message: "Course not found",
      });
    }

    // Remove course from student and student from course
    student.enrolledCourses.pull(courseId);
    course.enrolledStudents.pull(id);

    await Promise.all([student.save(), course.save()]);

    res.status(200).json({
      status: "success",
      message: "Student unenrolled from course successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to unenroll student",
      error: error.message,
    });
  }
};
