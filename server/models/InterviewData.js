import mongoose from "mongoose";

const interviewDataSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    dob: { type: String },
    email: { type: String, required: true },
    address: { type: String },
    experienceType: { type: String, enum: ["Fresher", "Experienced"], default: "Fresher" },
    experienceYears: { type: String },
    resumeFileName: { type: String },
    resumeData: { type: String },
    resumeSize: { type: String },
    status: {
      type: String,
      enum: ["New", "Reviewed", "Shortlisted", "Joined", "Rejected"],
      default: "New",
    },
    onboarding: {
      contactPhone: { type: String },
      address: { type: String },
      bloodGroup: { type: String },
      college: { type: String },
      bankName: { type: String },
      bankAccountNumber: { type: String },
      bankIFSC: { type: String },
      profileImageName: { type: String },
      profileImageData: { type: String },
      aadharFileName: { type: String },
      aadharFileData: { type: String },
      aadharFileSize: { type: String },
      panFileName: { type: String },
      panFileData: { type: String },
      panFileSize: { type: String },
      experienceCertFileName: { type: String },
      experienceCertFileData: { type: String },
      experienceCertFileSize: { type: String },
      otherCertFileName: { type: String },
      otherCertFileData: { type: String },
      otherCertFileSize: { type: String },
    },
  },
  { timestamps: true }
);

export const InterviewData =
  mongoose.models.InterviewData || mongoose.model("InterviewData", interviewDataSchema);