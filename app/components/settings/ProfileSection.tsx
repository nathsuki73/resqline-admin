"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  Eye,
  EyeOff,
  ImagePlus,
  Lock,
  LogOut,
  PencilLine,
  Shield,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import SettingsToggleSwitch from "./ui/SettingsToggleSwitch";
import useModalDissolve from "./ui/useModalDissolve";

const MODAL_EXIT_MS = 260;
const PROFILE_STORAGE_KEY = "resqline.dispatcher.profile";

const getInitials = (firstName: string, lastName: string) => {
  const first = firstName.trim().charAt(0).toUpperCase();
  const last = lastName.trim().charAt(0).toUpperCase();
  return `${first}${last}`.trim() || "RD";
};

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface DispatcherProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  badgeNumber: string;
  roleTitle: string;
  department: string;
  location: string;
  badge: string;
}

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  badgeNumber: string;
}

interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeoutMinutes: number;
  lastPasswordChanged: string;
}

// ============================================================================
// MODAL SUB-COMPONENT: Confirmation Dialog
// ============================================================================

const ConfirmationModal: React.FC<{
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  isDangerous?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  isDangerous = false,
  onConfirm,
  onCancel,
}) => {
  const { shouldRender, isVisible } = useModalDissolve(isOpen, MODAL_EXIT_MS);

  if (!shouldRender) return null;

  return (
    <div
      className={`modal-overlay-dissolve fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm ${
        isVisible ? "is-open" : "is-closed"
      }`}
    >
      <div
        className={`modal-card-dissolve flex w-full max-w-sm flex-col rounded-2xl border border-(--color-border-1) bg-[#1e1c1a] p-6 shadow-2xl ${
          isVisible ? "is-open" : "is-closed"
        }`}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          {isDangerous ? (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[rgba(229,57,53,0.35)] bg-[rgba(229,57,53,0.12)] text-[#ef9a9a]">
              <AlertTriangle size={20} />
            </div>
          ) : null}
          <button
            type="button"
            onClick={onCancel}
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-[#7a7268] transition-colors hover:bg-[#252220] hover:text-[#f0ede8]"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <h3
          className={`mb-2 text-xl font-bold leading-tight ${
            isDangerous ? "text-[#ef9a9a]" : "text-[#f0ede8]"
          }`}
        >
          {title}
        </h3>
        <p className="mb-6 text-sm text-[#7a7268]">{message}</p>

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-[#3a3632] bg-[#252220] px-4 py-2 text-xs font-semibold text-[#b8b0a6] transition-colors hover:border-[#4a4540] hover:bg-[#2c2925] hover:text-[#f0ede8]"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
              isDangerous
                ? "border border-[rgba(229,57,53,0.35)] bg-[rgba(229,57,53,0.12)] text-[#ef9a9a] hover:bg-[#e53935] hover:text-white"
                : "border border-[rgba(245,124,0,0.3)] bg-[#f57c00] text-white hover:bg-[#c46200]"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MODAL SUB-COMPONENT: Change Password Dialog
// ============================================================================

const ChangePasswordModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PasswordChangeData) => void;
}> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<PasswordChangeData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState<
    Record<string, boolean>
  >({
    current: false,
    new: false,
    confirm: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handlePasswordChange = (field: keyof PasswordChangeData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleToggleVisibility = (field: string) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }
    if (!formData.newPassword || formData.newPassword.length < 8) {
      newErrors.newPassword = "New password must be at least 8 characters";
    }
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (formData.newPassword === formData.currentPassword) {
      newErrors.newPassword =
        "New password must be different from current password";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setErrors({});
      onClose();
    }
  };

  const { shouldRender, isVisible } = useModalDissolve(isOpen, MODAL_EXIT_MS);

  if (!shouldRender) return null;

  return (
    <div
      className={`modal-overlay-dissolve fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm ${
        isVisible ? "is-open" : "is-closed"
      }`}
    >
      <div
        className={`modal-card-dissolve flex w-full max-w-sm flex-col rounded-2xl border border-(--color-border-1) bg-[#1e1c1a] p-6 shadow-2xl ${
          isVisible ? "is-open" : "is-closed"
        }`}
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[rgba(245,124,0,0.30)] bg-[rgba(245,124,0,0.13)] text-[#f57c00]">
            <Lock size={20} />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-[#7a7268] transition-colors hover:bg-[#252220] hover:text-[#f0ede8]"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <h3 className="mb-1 text-xl font-bold text-[#f0ede8]">
          Change Password
        </h3>
        <p className="mb-6 text-sm text-[#7a7268]">
          Update your password to keep your account secure.
        </p>

        {/* Current Password Field */}
        <div className="mb-4">
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-[#7a7268]">
            Current Password
          </label>
          <div className="relative">
            <input
              type={showPasswords.current ? "text" : "password"}
              value={formData.currentPassword}
              onChange={(e) =>
                handlePasswordChange("currentPassword", e.target.value)
              }
              placeholder="Enter your current password"
              className="h-10 w-full rounded-lg border border-[#3a3632] bg-[#252220] px-3 text-sm text-[#f0ede8] placeholder-[#4a4540] transition-all focus:border-[rgba(245,124,0,0.35)] focus:outline-none focus:ring-2 focus:ring-[rgba(245,124,0,0.14)]"
            />
            <button
              type="button"
              onClick={() => handleToggleVisibility("current")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7a7268] hover:text-[#f0ede8]"
              aria-label="Toggle current password visibility"
            >
              {showPasswords.current ? (
                <EyeOff size={16} />
              ) : (
                <Eye size={16} />
              )}
            </button>
          </div>
          {errors.currentPassword && (
            <p className="mt-1 text-xs text-[#ef9a9a]">{errors.currentPassword}</p>
          )}
        </div>

        {/* New Password Field */}
        <div className="mb-4">
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-[#7a7268]">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPasswords.new ? "text" : "password"}
              value={formData.newPassword}
              onChange={(e) =>
                handlePasswordChange("newPassword", e.target.value)
              }
              placeholder="Enter your new password"
              className="h-10 w-full rounded-lg border border-[#3a3632] bg-[#252220] px-3 text-sm text-[#f0ede8] placeholder-[#4a4540] transition-all focus:border-[rgba(245,124,0,0.35)] focus:outline-none focus:ring-2 focus:ring-[rgba(245,124,0,0.14)]"
            />
            <button
              type="button"
              onClick={() => handleToggleVisibility("new")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7a7268] hover:text-[#f0ede8]"
              aria-label="Toggle new password visibility"
            >
              {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.newPassword && (
            <p className="mt-1 text-xs text-[#ef9a9a]">{errors.newPassword}</p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="mb-6">
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-[#7a7268]">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showPasswords.confirm ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) =>
                handlePasswordChange("confirmPassword", e.target.value)
              }
              placeholder="Confirm your new password"
              className="h-10 w-full rounded-lg border border-[#3a3632] bg-[#252220] px-3 text-sm text-[#f0ede8] placeholder-[#4a4540] transition-all focus:border-[rgba(245,124,0,0.35)] focus:outline-none focus:ring-2 focus:ring-[rgba(245,124,0,0.14)]"
            />
            <button
              type="button"
              onClick={() => handleToggleVisibility("confirm")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7a7268] hover:text-[#f0ede8]"
              aria-label="Toggle confirm password visibility"
            >
              {showPasswords.confirm ? (
                <EyeOff size={16} />
              ) : (
                <Eye size={16} />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-[#ef9a9a]">{errors.confirmPassword}</p>
          )}
        </div>

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#3a3632] bg-[#252220] px-4 py-2 text-xs font-semibold text-[#b8b0a6] transition-colors hover:border-[#4a4540] hover:bg-[#2c2925] hover:text-[#f0ede8]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-2 rounded-lg border border-[rgba(245,124,0,0.3)] bg-[#f57c00] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#c46200]"
          >
            <Lock size={14} />
            Update Password
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// FORM FIELD SUB-COMPONENT
// ============================================================================

const FormField: React.FC<{
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email";
  autoComplete?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  helper?: string;
}> = ({
  id,
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  placeholder,
  disabled,
  error,
  helper,
}) => (
  <div className="flex flex-col">
    <label
      htmlFor={id}
      className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#7a7268]"
    >
      {label}
    </label>
    <input
      id={id}
      name={id}
      type={type}
      autoComplete={autoComplete}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={`h-10 rounded-lg border px-3 text-sm transition-all ${
        disabled
          ? "border-(--color-border-1) bg-[#201d1a] text-[#7a7268] cursor-not-allowed"
          : error
            ? "border-[rgba(229,57,53,0.35)] bg-[#252220] text-[#f0ede8] placeholder-[#4a4540] focus:border-[#e53935] focus:outline-none focus:ring-2 focus:ring-[rgba(229,57,53,0.16)]"
            : "border-[#3a3632] bg-[#252220] text-[#f0ede8] placeholder-[#4a4540] focus:border-[rgba(245,124,0,0.35)] focus:outline-none focus:ring-2 focus:ring-[rgba(245,124,0,0.14)]"
      }`}
    />
    {error && <p className="mt-1 text-xs text-[#ef9a9a]">{error}</p>}
    {helper && <p className="mt-1 text-xs text-[#7a7268]">{helper}</p>}
  </div>
);

// ============================================================================
// MAIN COMPONENT: Profile Section
// ============================================================================

const defaultProfileData: DispatcherProfile = {
  id: "dispatcher-001",
  firstName: "Rodrigo",
  lastName: "Dela Cruz",
  email: "r.delacruz@bfp.gov.ph",
  badgeNumber: "BFP-QC-0142",
  roleTitle: "Senior Dispatcher",
  department: "BFP",
  location: "Quezon City",
  badge: "Senior",
};

const defaultSecuritySettings: SecuritySettings = {
  twoFactorEnabled: true,
  sessionTimeoutMinutes: 30,
  lastPasswordChanged: "14 days ago",
};

export default function ProfileSection() {
  const profile = defaultProfileData;
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email,
    badgeNumber: profile.badgeNumber,
  });
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string>("");
  const [security, setSecurity] = useState<SecuritySettings>(
    defaultSecuritySettings
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isIdentityEditing, setIsIdentityEditing] = useState(false);
  const [identityBackup, setIdentityBackup] = useState<{
    formData: ProfileFormData;
    avatarImage: string | null;
  } | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  // Modal states
  const [showConfirmSignOut, setShowConfirmSignOut] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  // =========================================================================
  // EVENT HANDLERS
  // =========================================================================

  useEffect(() => {
    const storedValue = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!storedValue) {
      return;
    }

    try {
      const parsed = JSON.parse(storedValue) as Partial<ProfileFormData> & {
        avatarImage?: string | null;
      };

      setFormData((prev) => ({
        ...prev,
        firstName: parsed.firstName ?? prev.firstName,
        lastName: parsed.lastName ?? prev.lastName,
        email: parsed.email ?? prev.email,
        badgeNumber: parsed.badgeNumber ?? prev.badgeNumber,
      }));
      setAvatarImage(parsed.avatarImage ?? null);
    } catch {
      window.localStorage.removeItem(PROFILE_STORAGE_KEY);
    }
  }, []);

  const handleProfileFieldChange = (field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSaveSuccess(false);
  };

  const handleSecuritySettingChange = (
    field: keyof SecuritySettings,
    value: boolean | number
  ) => {
    setSecurity((prev) => ({ ...prev, [field]: value }));
    setSaveSuccess(false);
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      // TODO: Connect to API endpoint
      // const response = await updateDispatcherProfile(profile.id, {
      //   firstName: formData.firstName,
      //   lastName: formData.lastName,
      //   email: formData.email,
      //   badgeNumber: formData.badgeNumber,
      //   twoFactorEnabled: security.twoFactorEnabled,
      //   sessionTimeoutMinutes: security.sessionTimeoutMinutes,
      // });

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      window.localStorage.setItem(
        PROFILE_STORAGE_KEY,
        JSON.stringify({
          ...formData,
          avatarImage,
        })
      );

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartCustomizeIdentity = () => {
    setIdentityBackup({
      formData: { ...formData },
      avatarImage,
    });
    setAvatarError("");
    setIsIdentityEditing(true);
  };

  const handleCancelCustomizeIdentity = () => {
    if (identityBackup) {
      setFormData(identityBackup.formData);
      setAvatarImage(identityBackup.avatarImage);
    }
    setAvatarError("");
    setIdentityBackup(null);
    setIsIdentityEditing(false);
  };

  const handleSaveAndLockIdentity = async () => {
    await handleSaveChanges();
    setIdentityBackup(null);
    setAvatarError("");
    setIsIdentityEditing(false);
  };

  const handleSignOutAllSessions = async () => {
    try {
      // TODO: Connect to API endpoint
      // await signOutAllSessions(profile.id);
      console.log("Sign out all sessions for:", profile.id);
      setShowConfirmSignOut(false);
    } catch (error) {
      console.error("Failed to sign out all sessions:", error);
    }
  };

  const handleChangePassword = async (data: PasswordChangeData) => {
    try {
      // TODO: Connect to API endpoint
      // const response = await changePassword(profile.id, {
      //   currentPassword: data.currentPassword,
      //   newPassword: data.newPassword,
      // });
      console.log("Password change requested for:", profile.id);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to change password:", error);
    }
  };

  const handleAvatarPick = () => {
    if (!isIdentityEditing) {
      return;
    }
    avatarInputRef.current?.click();
  };

  const handleAvatarFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isIdentityEditing) {
      return;
    }

    const selectedFile = event.target.files?.[0];
    event.target.value = "";

    if (!selectedFile) {
      return;
    }

    if (!selectedFile.type.startsWith("image/")) {
      setAvatarError("Please upload an image file (PNG, JPG, SVG, or WebP).");
      return;
    }

    const maxFileSize = 5 * 1024 * 1024;
    if (selectedFile.size > maxFileSize) {
      setAvatarError("Image must be 5MB or smaller.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null;
      setAvatarImage(result);
      setAvatarError("");
      setSaveSuccess(false);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleRemoveAvatar = () => {
    if (!isIdentityEditing) {
      return;
    }

    setAvatarImage(null);
    setAvatarError("");
    setSaveSuccess(false);
  };

  const avatarInitials = getInitials(formData.firstName, formData.lastName);

  // =========================================================================
  // JSX RENDER
  // =========================================================================

  return (
    <main className="flex-1 overflow-y-auto bg-[#191716] custom-scrollbar">
      <div className="bg-[#191716] p-8">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold leading-tight text-[#f0ede8] md:text-4xl">
              Profile &amp; Account
            </h1>
            <p className="mt-1 text-[13px] text-[#7a7268]">
              Manage your dispatcher profile and credentials
            </p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="space-y-6">
          {/* ================================================================
              DISPATCHER IDENTITY SECTION
              ================================================================ */}
          <section className="overflow-hidden rounded-2xl border border-(--color-border-1) bg-[#1e1c1a]">
            <div className="flex items-center justify-between border-b border-(--color-border-1) px-6 py-3.5">
              <h2 className="flex items-center gap-2 text-base font-semibold text-[#f0ede8]">
                <UserRound size={20} className="text-[#f57c00]" />
                Dispatcher Identity
              </h2>
              {isIdentityEditing ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCancelCustomizeIdentity}
                    className="flex items-center gap-1.5 rounded-lg border border-[#3a3632] bg-[#252220] px-3 py-1.5 text-[11px] font-semibold text-[#b8b0a6] transition-colors hover:border-[#4a4540] hover:bg-[#2c2925] hover:text-[#f0ede8]"
                  >
                    <X size={14} />
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveAndLockIdentity}
                    disabled={isSaving}
                    className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                      saveSuccess
                        ? "border-[rgba(67,160,71,0.35)] bg-[rgba(67,160,71,0.15)] text-[#a5d6a7]"
                        : "border-[rgba(245,124,0,0.3)] bg-[#f57c00] text-white hover:bg-[#c46200]"
                    } ${isSaving ? "opacity-70" : ""}`}
                  >
                    <Check size={14} />
                    {isSaving ? "Saving..." : "Save & Lock"}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleStartCustomizeIdentity}
                  className="flex items-center gap-1.5 rounded-lg border border-[rgba(245,124,0,0.3)] bg-[rgba(245,124,0,0.13)] px-3 py-1.5 text-[11px] font-semibold text-[#f57c00] transition-colors hover:bg-[rgba(245,124,0,0.20)]"
                >
                  <PencilLine size={14} />
                  Customize
                </button>
              )}
            </div>

            <div className="p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-4">
              {/* Avatar */}
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[rgba(245,124,0,0.30)] bg-[rgba(245,124,0,0.13)] text-2xl font-bold text-[#f57c00]">
                {avatarImage ? (
                  <img
                    src={avatarImage}
                    alt={`${formData.firstName} ${formData.lastName} avatar`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  avatarInitials
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <h3 className="text-2xl font-bold leading-tight text-[#f0ede8]">
                  {formData.firstName} {formData.lastName}
                </h3>
                <p className="mt-1 text-sm text-[#7a7268]">
                  {profile.roleTitle} • {profile.department} {profile.location}
                </p>
                {isIdentityEditing ? (
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAvatarPick}
                      className="flex items-center gap-1.5 rounded-lg border border-[#3a3632] bg-[#252220] px-3 py-1.5 text-[11px] font-semibold text-[#b8b0a6] transition-colors hover:border-[#4a4540] hover:bg-[#2c2925] hover:text-[#f0ede8]"
                    >
                      <ImagePlus size={14} />
                      Upload Picture
                    </button>
                    {avatarImage ? (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="flex items-center gap-1.5 rounded-lg border border-[rgba(229,57,53,0.35)] bg-[rgba(229,57,53,0.08)] px-3 py-1.5 text-[11px] font-semibold text-[#ef9a9a] transition-colors hover:bg-[rgba(229,57,53,0.16)]"
                      >
                        <Trash2 size={14} />
                        Remove
                      </button>
                    ) : null}
                  </div>
                ) : null}
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileChange}
                  className="hidden"
                />
                {avatarError ? (
                  <p className="mt-2 text-xs text-[#ef9a9a]">{avatarError}</p>
                ) : isIdentityEditing ? (
                  <p className="mt-2 text-xs text-[#7a7268]">PNG, JPG, SVG, or WebP up to 5MB.</p>
                ) : null}
                <div className="mt-3 flex gap-2">
                  <span className="rounded-full border border-[rgba(245,124,0,0.3)] bg-[rgba(245,124,0,0.13)] px-3 py-1 text-[10px] font-bold text-[#f57c00]">
                    {profile.department}
                  </span>
                  <span className="rounded-full border border-[rgba(67,160,71,0.35)] bg-[rgba(67,160,71,0.15)] px-3 py-1 text-[10px] font-bold text-[#a5d6a7]">
                    {profile.badge}
                  </span>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <FormField
                id="firstName"
                label="First Name"
                value={formData.firstName}
                onChange={(value) =>
                  handleProfileFieldChange("firstName", value)
                }
                disabled={!isIdentityEditing}
                autoComplete="given-name"
                placeholder="Enter first name"
              />
              <FormField
                id="lastName"
                label="Last Name"
                value={formData.lastName}
                onChange={(value) =>
                  handleProfileFieldChange("lastName", value)
                }
                disabled={!isIdentityEditing}
                autoComplete="family-name"
                placeholder="Enter last name"
              />
              <FormField
                id="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={(value) => handleProfileFieldChange("email", value)}
                disabled={!isIdentityEditing}
                autoComplete="email"
                placeholder="Enter email address"
              />
              <FormField
                id="badgeNumber"
                label="Badge / Employee ID"
                value={formData.badgeNumber}
                onChange={(value) =>
                  handleProfileFieldChange("badgeNumber", value)
                }
                disabled={!isIdentityEditing}
                autoComplete="off"
                placeholder="e.g., BFP-QC-0142"
              />
            </div>
            </div>
          </section>

          {/* ================================================================
              SECURITY SECTION
              ================================================================ */}
          <section className="rounded-2xl border border-(--color-border-1) bg-[#1e1c1a] p-6">
            <h2 className="mb-6 flex items-center gap-2 text-base font-semibold text-[#f0ede8]">
              <Lock size={18} className="text-[#f57c00]" />
              Security
            </h2>

            {/* Divider */}
            <div className="my-6 h-px bg-(--color-border-1)" />
            
            {/* Password */}
            <div className="flex items-center justify-between border-b border-(--color-border-1) py-4 first:pt-0">
              <div>
                <p className="text-sm font-medium text-[#f0ede8]">Password</p>
                <p className="mt-0.5 text-xs text-[#7a7268]">
                  Last changed {security.lastPasswordChanged}
                </p>
              </div>
              <button
                onClick={() => setShowChangePassword(true)}
                className="rounded-lg border border-[#3a3632] bg-[#2c2925] px-4 py-2 text-xs font-semibold text-[#b8b0a6] transition-colors hover:border-[#4a4540] hover:bg-[#333028] hover:text-[#f0ede8] focus:outline-none focus:ring-2 focus:ring-[rgba(245,124,0,0.2)]"
              >
                Change Password
              </button>
            </div>

            {/* Two-Factor Authentication */}
            <div className="border-b border-(--color-border-1) py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#f0ede8]">
                    Two-Factor Authentication
                  </p>
                  <p className="mt-0.5 text-xs text-[#7a7268]">SMS OTP on login</p>
                </div>
                <SettingsToggleSwitch
                  enabled={security.twoFactorEnabled}
                  onToggle={() =>
                    handleSecuritySettingChange("twoFactorEnabled", !security.twoFactorEnabled)
                  }
                  label="Toggle Two-Factor Authentication"
                />
              </div>
            </div>

            {/* Session Timeout */}
            <div className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#f0ede8]">
                    Session Timeout
                  </p>
                  <p className="mt-0.5 text-xs text-[#7a7268]">
                    Auto-lock after inactivity
                  </p>
                </div>
                <select
                  value={security.sessionTimeoutMinutes}
                  onChange={(e) =>
                    handleSecuritySettingChange(
                      "sessionTimeoutMinutes",
                      parseInt(e.target.value, 10)
                    )
                  }
                  className="rounded-lg border border-[#3a3632] bg-[#252220] px-3 py-2 text-sm font-semibold text-[#f0ede8] transition-colors focus:border-[rgba(245,124,0,0.35)] focus:outline-none focus:ring-2 focus:ring-[rgba(245,124,0,0.14)]"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={120}>2 hours</option>
                  <option value={240}>4 hours</option>
                </select>
              </div>
            </div>
          </section>

          {/* ================================================================
              DANGER ZONE SECTION
              ================================================================ */}
          <section className="rounded-2xl border border-[rgba(229,57,53,0.35)] bg-[rgba(229,57,53,0.06)] p-6">
            <h2 className="mb-6 flex items-center gap-2 text-base font-semibold text-[#ef9a9a]">
              <AlertTriangle size={18} />
              Danger Zone
            </h2>

            <button
              onClick={() => setShowConfirmSignOut(true)}
              className="flex items-center gap-2 rounded-lg border border-red-600/50 bg-red-950/30 px-4 py-2.5 font-medium text-red-400 hover:border-red-500 hover:bg-red-950/50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/20"
            >
              <LogOut size={16} />
              Sign Out All Sessions
            </button>
          </section>
        </div>
      </div>

      {/* ====================================================================
          MODALS
          ==================================================================== */}
      <ConfirmationModal
        isOpen={showConfirmSignOut}
        title="Sign Out All Sessions"
        message="This will sign you out from all active sessions on other devices. You will need to log in again."
        confirmLabel="Sign Out All"
        cancelLabel="Cancel"
        isDangerous
        onConfirm={handleSignOutAllSessions}
        onCancel={() => setShowConfirmSignOut(false)}
      />

      <ChangePasswordModal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        onSubmit={handleChangePassword}
      />
    </main>
  );
}
