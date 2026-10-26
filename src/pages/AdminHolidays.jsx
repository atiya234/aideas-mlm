
import React, { useState, useEffect } from "react";

const API_URL = "http://127.0.0.1:8001/api/admin/holidays/";

const AdminHolidays = () => {
  const [holidays, setHolidays] = useState([]);
  const [holidayDate, setHolidayDate] = useState("");
  const [holidayName, setHolidayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  const getHeaders = () => ({
    Authorization: `Bearer ${sessionStorage.getItem("access")}`,
  });

  // GET: Fetch holidays from Django
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(API_URL, {
          headers: getHeaders(),
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch holidays (${response.status})`);
        }

        const data = await response.json();
        setHolidays(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHolidays();
  }, []);

  // POST: Add new holiday
  const handleHoliday = async () => {
    if (!holidayName.trim() || !holidayDate) {
      alert("Please enter holiday name and date");
      return;
    }

    const alreadyExists = holidays.some(
      (holiday) => holiday.date === holidayDate
    );

    if (alreadyExists) {
      alert("Holiday already exists for this date");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          ...getHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: holidayName.trim(),
          date: holidayDate,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add holiday (${response.status})`);
      }

      const newHoliday = await response.json();

      setHolidays((prev) =>
        [...prev, newHoliday].sort((a, b) =>
          a.date.localeCompare(b.date)
        )
      );

      setHolidayName("");
      setHolidayDate("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // DELETE: Remove holiday from Django
  const handleDeleteHoliday = async (id) => {
    try {
      setDeletingId(id);
      setError("");

      const response = await fetch(`${API_URL}${id}/`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to delete holiday (${response.status})`);
      }

      setHolidays((prev) =>
        prev.filter((holiday) => holiday.id !== id)
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-slate-900">
        Holiday Management
      </h1>

      <p className="mt-2 text-slate-500">
        Manage holidays for ROI calculations.
      </p>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">
          Add New Holiday
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <input
            type="text"
            placeholder="Holiday Name"
            value={holidayName}
            onChange={(e) => setHolidayName(e.target.value)}
            className="rounded-lg border border-slate-300 p-3"
          />

          <input
            type="date"
            value={holidayDate}
            onChange={(e) => setHolidayDate(e.target.value)}
            className="rounded-lg border border-slate-300 p-3"
          />
        </div>

        <button
          type="button"
          onClick={handleHoliday}
          disabled={saving}
          className="mt-4 rounded-lg bg-indigo-600 px-5 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? "Adding..." : "Add Holiday"}
        </button>
      </div>

      <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">
          Holiday List
        </h2>

        {loading ? (
          <p className="text-slate-500">Loading holidays...</p>
        ) : holidays.length === 0 ? (
          <p className="text-slate-500">
            No holidays added yet.
          </p>
        ) : (
          <div className="space-y-3">
            {holidays.map((holiday) => (
              <div
                key={holiday.id}
                className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h3 className="font-semibold text-slate-800">
                    {holiday.name}
                  </h3>

                  <p className="text-sm text-slate-500">
                    {holiday.date}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteHoliday(holiday.id)}
                  disabled={deletingId === holiday.id}
                  className="rounded-lg bg-red-50 px-4 py-2 text-red-600 hover:bg-red-100 disabled:opacity-50"
                >
                  {deletingId === holiday.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminHolidays;
