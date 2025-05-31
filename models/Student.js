import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    age: {
      type: Number,
      required: [true, "Age is required"],
      min: [16, "Age must be at least 16"],
      max: [100, "Age cannot exceed 100"],
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
    admissionDate: {
      type: Date,
      default: Date.now,
    },
    enrolledCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    profilePicture: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      match: [/^\d{10}$/, "Please enter a valid 10-digit phone number"],
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: {
        type: String,
        default: "India",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for student's full profile URL
studentSchema.virtual("profileUrl").get(function () {
  return this.profilePicture
    ? `/uploads/students/${this.profilePicture}`
    : null;
});

// Index for better query performance
studentSchema.index({ email: 1 });
studentSchema.index({ department: 1 });
studentSchema.index({ admissionDate: -1 });

// Pre-save middleware to ensure email uniqueness
studentSchema.pre("save", async function (next) {
  if (this.isModified("email")) {
    const existingStudent = await this.constructor.findOne({
      email: this.email,
      _id: { $ne: this._id },
    });
    if (existingStudent) {
      throw new Error("Email already exists");
    }
  }
  next();
});

// Method to enroll in a course
studentSchema.methods.enrollInCourse = function (courseId) {
  if (!this.enrolledCourses.includes(courseId)) {
    this.enrolledCourses.push(courseId);
  }
  return this.save();
};

// Method to unenroll from a course
studentSchema.methods.unenrollFromCourse = function (courseId) {
  this.enrolledCourses = this.enrolledCourses.filter(
    (course) => course.toString() !== courseId.toString()
  );
  return this.save();
};

// Static method to find students by department
studentSchema.statics.findByDepartment = function (department) {
  return this.find({ department, isActive: true }).populate("enrolledCourses");
};

export default mongoose.model("Student", studentSchema);
