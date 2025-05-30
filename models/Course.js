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
    instructor: {
      type: String,
      required: [true, "Instructor name is required"],
      trim: true,
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
    },
    duration: {
      type: String,
      required: [true, "Course duration is required"],
      enum: ["1 month", "2 months", "3 months", "6 months", "1 year"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    enrolledStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for enrolled students count
courseSchema.virtual("enrollmentCount").get(function () {
  return this.enrolledStudents.length;
});

// Index for better search performance
courseSchema.index({ title: "text", description: "text" });
courseSchema.index({ department: 1 });
courseSchema.index({ credits: 1 });

const Course = mongoose.model("Course", courseSchema);

export default Course;
