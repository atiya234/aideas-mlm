
import React, { useMemo, useState } from "react";
import { GitBranch, Users } from "lucide-react";

const ReferralTree = ({ users = [] }) => {
  const [selectedUserId, setSelectedUserId] = useState("");

  const selectedUser = users.find(
    (user) => String(user.id) === String(selectedUserId)
  );

  const referralTree = useMemo(() => {
    if (!selectedUser) return [];

    const visited = new Set([selectedUser.id]);
    // buildtree is used make the referal data in nested sturcture format
    const buildTree = (parentId, level) => {
      if (level > 7) return [];

      return users
        .filter(
          (user) => String(user.parent_id) === String(parentId)
        )
        .filter((user) => !visited.has(user.id))
        .map((user) => {
          visited.add(user.id);

          return {
            ...user,
            level,
            children: buildTree(user.id, level + 1),
          };
        });
    };

    return buildTree(selectedUser.id, 1);
  }, [users, selectedUser]);
  //  renderTree is used to display the data on screen
  const renderTree = (members) => {
    return members.map((member) => (
      <div key={member.id} className="mt-4">
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
          <div className="flex items-center gap-2">
            <Users size={17} className="text-indigo-600" />

            <h3 className="font-semibold text-slate-900">
              {member.name}
            </h3>
          </div>

          <p className="mt-2 text-sm text-slate-600">
            Referral Code: {member.code}
          </p>

          <p className="mt-1 text-xs font-semibold text-indigo-600">
            Level {member.level}
          </p>
        </div>

        {member.children.length > 0 && (
          <div className="ml-4 border-l-2 border-indigo-200 pl-4 sm:ml-6">
            {renderTree(member.children)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex items-center gap-2">
        <GitBranch size={22} className="text-indigo-600" />

        <h2 className="text-xl font-bold text-slate-900">
          Referral Tree
        </h2>
      </div>

      <p className="mt-2 text-sm text-slate-500">
        Select a member to explore their referral network up to 7 levels.
      </p>

      <div className="mt-5">
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Select Member
        </label>

        <select
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 sm:max-w-md"
        >
          <option value="">Choose a member</option>

          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.code})
            </option>
          ))}
        </select>
      </div>

      {selectedUser && (
        <div className="mt-6">
          <div className="rounded-xl bg-slate-900 p-4 text-white">
            <p className="text-xs text-slate-300">
              Selected Member
            </p>

            <h3 className="mt-1 text-lg font-bold">
              {selectedUser.name}
            </h3>

            <p className="text-sm text-slate-300">
              {selectedUser.code}
            </p>
          </div>

          {referralTree.length > 0 ? (
            <div className="mt-4">
              {renderTree(referralTree)}
            </div>
          ) : (
            <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
              No referrals found for this member.
            </p>
          )}
        </div>
      )}

      {!selectedUser && (
        <div className="mt-6 rounded-xl bg-slate-50 p-6 text-center">
          <GitBranch
            size={30}
            className="mx-auto text-slate-400"
          />

          <p className="mt-3 text-sm text-slate-500">
            Choose a member to view their referral tree.
          </p>
        </div>
      )}
    </div>
  );
};

export default ReferralTree;
