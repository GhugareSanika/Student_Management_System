import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters long"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Course description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters long"],
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    credits: {
      type: Number,
      required: [true, "Credits are required"],
      min: [1, "Credits must be at least 1"],
      max: [6, "Credits cannot exceed 6"],
    },
    courseCode: {
      type: String,
      required: [true, "Course code is required"],
      unique: true,
      uppercase: true,
      match: [
        /^[A-Z]{2,4}\d{3,4}$/,
        "Course code must be in format like CS101 or MATH1001",
      ],
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      enum: [
        "IT",
        "Computer Science",
        "Electronics",
        "Mechanical",
        "Civil",
        "Chemical",
        "Electrical",
      ],
      trim: true,
    },
    instructor: {
      name: {
        type: String,
        required: [true, "Instructor name is required"],
        trim: true,
      },
      email: {
        type: String,
        required: [true, "Instructor email is required"],
        lowercase: true,
        match: [
          /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
          "Please enter a valid email",
        ],
      },
    },
    duration: {
      type: String,
      required: [true, "Course duration is required"],
      enum: [
        "1 month",
        "2 months",
        "3 months",
        "4 months",
        "6 months",
        "1 year",
      ],
    },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    prerequisites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    maxStudents: {
      type: Number,
      default: 50,
      min: [1, "Maximum students must be at least 1"],
      max: [200, "Maximum students cannot exceed 200"],
    },
    enrolledStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    syllabus: [
      {
        week: Number,
        topic: String,
        description: String,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

courseSchema.virtual("enrolledCount").get(function () {
  return this.enrolledStudents.length;
});

// Virtual for available spots
courseSchema.virtual("availableSpots").get(function () {
  return this.maxStudents - this.enrolledStudents.length;
});

courseSchema.virtual("status").get(function () {
  const now = new Date();
  if (now < this.startDate) return "Upcoming";
  if (now > this.endDate) return "Completed";
  return "Ongoing";
});

courseSchema.index({ title: "text", description: "text" });
courseSchema.index({ department: 1 });
courseSchema.index({ courseCode: 1 });
courseSchema.index({ startDate: 1 });

courseSchema.pre("save", function (next) {
  if (this.endDate <= this.startDate) {
    throw new Error("End date must be after start date");
  }
  next();
});

courseSchema.methods.enrollStudent = function (studentId) {
  if (this.enrolledStudents.length >= this.maxStudents) {
    throw new Error("Course is full");
  }
  if (!this.enrolledStudents.includes(studentId)) {
    this.enrolledStudents.push(studentId);
  }
  return this.save();
};

// Method to unenroll a student
courseSchema.methods.unenrollStudent = function (studentId) {
  this.enrolledStudents = this.enrolledStudents.filter(
    (student) => student.toString() !== studentId.toString()
  );
  return this.save();
};

courseSchema.statics.findByDepartment = function (department) {
  return this.find({ department, isActive: true });
};

courseSchema.statics.searchCourses = function (query) {
  return this.find({
    $text: { $search: query },
    isActive: true,
  }).sort({ score: { $meta: "textScore" } });
};

export default mongoose.model("Course", courseSchema);
