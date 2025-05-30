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
      min: [16, "Age must be at least 16"],
      max: [100, "Age cannot exceed 100"],
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      enum: [
        "IT",
        "Computer Science",
        "Engineering",
        "Business",
        "Arts",
        "Science",
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

// Virtual for student's full info
studentSchema.virtual("studentInfo").get(function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    department: this.department,
    coursesCount: this.enrolledCourses.length,
  };
});

// Index for better query performance
studentSchema.index({ email: 1 });
studentSchema.index({ department: 1 });
studentSchema.index({ name: "text", email: "text" });

// Pre-save middleware
studentSchema.pre("save", function (next) {
  if (this.isModified("email")) {
    this.email = this.email.toLowerCase();
  }
  next();
});

const Student = mongoose.model("Student", studentSchema);

export default Student;
