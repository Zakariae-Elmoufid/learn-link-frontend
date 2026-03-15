"use client";

import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { useState, useRef, useEffect } from "react";
import { Button, Card, Input, Textarea, Avatar } from "../../../components/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMyProfile, useUpdateProfile, useSubjects } from "../../../hookes";
import { Camera, X, Plus, Save, Loader2 } from "lucide-react";

const ACADEMIC_LEVELS = ["HIGH_SCHOOL", "BACHELOR", "BACHELOR", "PHD", "OTHER"];

const schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  bio: z.string().max(160, "Bio must be 160 characters or less").optional(),
  academicLevel: z.string().min(1, "Please select your academic level"),
});

type FormValues = z.infer<typeof schema>;

export default function ProfilePage() {
  const router = useRouter();
  const { data: profile, isLoading: profileLoading } = useMyProfile();
  const { data: subjects = [], isLoading: subjectsLoading } = useSubjects();
  const updateProfile = useUpdateProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);
  const [subjectSearch, setSubjectSearch] = useState("");
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const bioValue = watch("bio") || "";

  // Load profile data into form
  useEffect(() => {
    if (profile) {
      reset({
        firstName: profile.firstName,
        lastName: profile.lastName,
        bio: profile.bio || "",
        academicLevel: profile.academicLevel,
      });
      const subjectIds =
        profile.studentSubjects?.map((s) => s.id) || profile.subjectIds || [];

      setSelectedSubjects(subjectIds);
      if (profile.profilePictureUrl) {
        setImagePreview(profile.profilePictureUrl);
      }
    }
  }, [profile, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(profile?.profilePictureUrl || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const addSubject = (subjectId: number) => {
    if (!selectedSubjects.includes(subjectId)) {
      setSelectedSubjects([...selectedSubjects, subjectId]);
    }
    setSubjectSearch("");
    setShowSubjectDropdown(false);
  };

  const removeSubject = (subjectId: number) => {
    setSelectedSubjects(selectedSubjects.filter((id) => id !== subjectId));
  };

  const filteredSubjects = subjects.filter(
    (subject) =>
      !selectedSubjects.includes(subject.id) &&
      subject.name.toLowerCase().includes(subjectSearch.toLowerCase()),
  );

  async function onSubmit(data: FormValues) {
    if (selectedSubjects.length === 0) {
      return;
    }

    await updateProfile.mutateAsync({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        bio: data.bio,
        academicLevel: data.academicLevel,
        studentSubjectIds: selectedSubjects,
      },
      imageFile: imageFile || undefined,
    });
  }

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            My Profile
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Manage your personal information and preferences
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Profile Photo & Basic Info */}
        <Card padding="lg">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
            Basic Information
          </h2>
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Profile Photo */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="h-32 w-32 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-4 border-white dark:border-slate-700 shadow-lg">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Avatar
                      name={`${profile?.firstName} ${profile?.lastName}`}
                      size="xl"
                    />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-md hover:bg-primary-700 transition-colors"
                >
                  <Camera className="h-5 w-5" />
                </button>
                {imageFile && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-0 right-0 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                Profile Photo
              </p>
              <p className="text-xs text-slate-400">Click to change</p>
            </div>

            {/* Name & Bio */}
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  placeholder="John"
                  error={errors.firstName?.message}
                  {...register("firstName")}
                />
                <Input
                  label="Last Name"
                  placeholder="Doe"
                  error={errors.lastName?.message}
                  {...register("lastName")}
                />
              </div>
              <div>
                <Textarea
                  label="Bio"
                  placeholder="Tell us about yourself..."
                  rows={3}
                  error={errors.bio?.message}
                  {...register("bio")}
                />
                <p className="text-right text-xs text-slate-400 mt-1">
                  {bioValue.length}/160 characters
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Academic Info */}
        <Card padding="lg">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
            Academic Information
          </h2>

          {/* Academic Level */}
          <div className="mb-6">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
              Academic Level
            </label>
            <select
              className="input"
              defaultValue={profile?.academicLevel}
              {...register("academicLevel")}
            >
              <option value="">Select your level</option>

              {ACADEMIC_LEVELS.map((level,index) => (
                <option key={index} value={level}>
                  {level}
                </option>
              ))}
            </select>
            {errors.academicLevel && (
              <p className="text-xs text-red-500 mt-1">
                {errors.academicLevel.message}
              </p>
            )}
          </div>

          {/* Subjects & Skills */}
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
              Subjects & Skills
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search and add subjects..."
                value={subjectSearch}
                onChange={(e) => {
                  setSubjectSearch(e.target.value);
                  setShowSubjectDropdown(true);
                }}
                onFocus={() => setShowSubjectDropdown(true)}
                className="input pr-10"
              />
              <Plus className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />

              {showSubjectDropdown && filteredSubjects.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredSubjects.slice(0, 8).map((subject) => (
                    <button
                      key={subject.id}
                      type="button"
                      onClick={() => addSubject(subject.id)}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                    >
                      {subject.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected subjects */}
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedSubjects.map((subjectId) => {
                // First check profile.subjects (from db), then fall back to fetched subjects
                const subject =
                  profile?.studentSubjects?.find((s) => s.id === subjectId) ||
                  subjects.find((s) => s.id === subjectId);
                return subject ? (
                  <span
                    key={subject.id}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-sm text-primary-700 dark:text-primary-400"
                  >
                    {subject.name}
                    <button
                      type="button"
                      onClick={() => removeSubject(subject.id)}
                      className="hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ) : null;
              })}
            </div>
            {selectedSubjects.length === 0 && (
              <p className="text-xs text-amber-600 mt-2">
                Please select at least one subject
              </p>
            )}
          </div>
        </Card>

        {/* Account Info (Read-only) */}
        <Card padding="lg">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
            Account Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                Username
              </label>
              <input
                type="text"
                value={profile?.username || ""}
                disabled
                className="input bg-slate-50 dark:bg-slate-800 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                Email
              </label>
              <input
                type="email"
                value={profile?.email || ""}
                disabled
                className="input bg-slate-50 dark:bg-slate-800 cursor-not-allowed"
              />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4">
            Contact support to change your username or email address.
          </p>
        </Card>



        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={updateProfile.isPending}
            disabled={selectedSubjects.length === 0}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
