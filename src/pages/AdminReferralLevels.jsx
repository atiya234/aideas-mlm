import React, { useEffect, useState } from "react";

const AdminReferralLevels = () => {

  const [editId, setEditId] = useState(null)
  const [editPercentage, setEditPercentage] = useState("")
  const [levels, setLevels] = useState(() => {
  const savedLevels = localStorage.getItem("referralLevels");

  return savedLevels
    ? JSON.parse(savedLevels)
    : [
        { id: 1, level: 1, percentage: 5 },
        { id: 2, level: 2, percentage: 3 },
        { id: 3, level: 3, percentage: 2 },
        { id: 4, level: 4, percentage: 1 },
        { id: 5, level: 5, percentage: 1 },
        { id: 6, level: 6, percentage: 0.5 },
        { id: 7, level: 7, percentage: 0.5 },
      ];
});

  const handleEdit = (item) => {
    setEditId(item.id);
    setEditPercentage(item.percentage)

  }
  const handleSave = () => {
    const updateLevels = levels.map((item) => {
      if (item.id === editId) {
        return {
          ...item, percentage: Number(editPercentage)
        }
      }
      return item;
    })
    setLevels(updateLevels);
    setEditId(null);
  }
  useEffect(()=>{
    localStorage.setItem("referrallevels", JSON.stringify(levels));
  }, [levels])

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-bold text-slate-900">
          Referral Level Management
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          View and manage referral level percentages.
        </p>

        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="px-5 py-4">Level</th>
                  <th className="px-5 py-4">Percentage</th>
                  <th className="px-5 py-4">Action</th>
                </tr>
              </thead>

              <tbody>
                {levels.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t border-slate-100"
                  >
                    <td className="px-5 py-4 font-semibold">
                      Level {item.level}
                    </td>

                    <td className="px-5 py-4">
                      {editId === item.id ? (
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={editPercentage}
                          onChange={(e) => setEditPercentage(e.target.value)}
                          className="w-24 rounded-lg border border-indigo-300 px-3 py-2 outline-none focus:border-indigo-500"
                        />
                      ) : (
                        <span>{item.percentage}%</span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() =>
                          editId === item.id ? handleSave() : handleEdit(item)
                        }
                        className="rounded-lg bg-indigo-50 px-4 py-2 font-medium text-indigo-600 hover:bg-indigo-100"
                      >
                        {editId === item.id ? "Save" : "Edit"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReferralLevels;