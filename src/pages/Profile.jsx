
import { useEffect, useState } from "react";
import { apiFetch } from "../api/apiFetch";

function Profile() {
  const [user, setUser] = useState(null);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch user profile from Django
  useEffect(() => {
    const controller = new AbortController();

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await apiFetch("/api/profile/", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            `Failed to load profile: ${response.status}`
          );
        }

        const data = await response.json();

        if (controller.signal.aborted) return;

        setUser(data);

        setFormData({
          username: data.username || "",
          email: data.email || "",
        });
      } catch (err) {
        if (err.name !== "AbortError" && !controller.signal.aborted) {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchProfile();

    return () => controller.abort();
  }, []);

  // Handle username input
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setSuccess("");
  };

  // Update username in Django
  const handleSave = async () => {
    const username = formData.username.trim();

    if (username.length < 3) {
      setError("Username must contain at least 3 characters.");
      return;
    }

    if (saving) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await apiFetch("/api/profile/", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.username?.[0] ||
            data.detail ||
            "Failed to update profile."
        );
      }

      setUser(data);

      setFormData({
        username: data.username || "",
        email: data.email || "",
      });

      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const initials =
    formData.username
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">

      {/* PAGE HEADING */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">
          My Profile
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage your personal information and account details.
        </p>
      </div>

      {loading ? (
        <p className="text-slate-500">
          Loading profile...
        </p>
      ) : error && !user ? (
        <p className="rounded-xl bg-red-50 p-4 text-red-600">
          {error}
        </p>
      ) : (
        <>
          {/* PROFILE HEADER */}
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">

              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-2xl font-bold text-white">
                {initials}
              </div>

              <div className="min-w-0">
                <h2 className="text-xl font-bold text-slate-800">
                  {user?.username || "Member"}
                </h2>

                <p className="mt-1 break-all text-sm text-slate-500">
                  {user?.email || "No email available"}
                </p>

                <span className="mt-3 inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                  Member
                </span>
              </div>
            </div>
          </div>

          {/* PERSONAL INFORMATION */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-800">
                Personal Information
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Update your username below.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              {/* USERNAME */}
              <div>
                <label
                  htmlFor="profile-username"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Username
                </label>

                <input
                  id="profile-username"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter username"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* EMAIL */}
              <div>
                <label
                  htmlFor="profile-email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email Address
                </label>

                <input
                  id="profile-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  readOnly
                  className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500"
                />

                <p className="mt-2 text-xs text-slate-400">
                  Email cannot be changed here.
                </p>
              </div>
            </div>

            {/* MESSAGES */}
            {error && (
              <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
                {error}
              </p>
            )}

            {success && (
              <p className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-700">
                {success}
              </p>
            )}

            {/* SAVE BUTTON */}
            <div className="mt-8 flex justify-end border-t border-slate-100 pt-6">
              <button
                type="button"
                onClick={handleSave}
                disabled={
                  saving ||
                  formData.username.trim() === user?.username
                }
                className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>

          {/* ACCOUNT INFORMATION */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <h3 className="mb-5 text-lg font-bold text-slate-800">
              Account Information
            </h3>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              <div>
                <p className="text-sm text-slate-500">
                  Account Role
                </p>
                <p className="mt-1 font-semibold text-slate-800">
                  Member
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Login Status
                </p>

                <span className="mt-1 inline-block rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                  Logged In
                </span>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  My Referral Code
                </p>

                <p className="mt-1 font-semibold text-slate-800">
                  {user?.referral_code || "Not available"}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Referred By
                </p>

                <p className="mt-1 font-semibold text-slate-800">
                  {user?.referred_by || "Not available"}
                </p>
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Profile;
