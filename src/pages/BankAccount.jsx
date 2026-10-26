
import React, { useState } from "react";
import {
  Building2,
  UserRound,
  CreditCard,
  Landmark,
  ShieldCheck,
  LockKeyhole,
} from "lucide-react";

function BankAccount() {
  const [bankDetails, setBankDetails] = useState({
    accountHolder: "",
    accountNumber: "",
    ifscCode: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setBankDetails((prev) => ({
      ...prev,
      [name]:
        name === "ifscCode"
          ? value.toUpperCase()
          : name === "accountNumber"
          ? value.replace(/\D/g, "")
          : value,
    }));
  };

  const isNameValid =
    bankDetails.accountHolder.trim().length >= 3;

  const isAccountNumberValid =
    /^[0-9]{9,18}$/.test(bankDetails.accountNumber);

  const isIfscValid =
    /^[A-Z]{4}0[A-Z0-9]{6}$/.test(bankDetails.ifscCode);

  const isFormValid =
    isNameValid && isAccountNumberValid && isIfscValid;

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <section className="mt-6 overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm">

      {/* HEADER */}
      <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-white px-6 py-6 md:px-8">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-indigo-600 p-3 text-white shadow-md shadow-indigo-100">
            <Landmark size={24} />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Bank Account Details
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Bank account setup for future withdrawals.
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8">

        {/* INTEGRATION NOTICE */}
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <LockKeyhole
            size={22}
            className="mt-0.5 shrink-0 text-amber-600"
          />

          <div>
            <h3 className="font-semibold text-amber-900">
              Bank Linking Coming Soon
            </h3>

            <p className="mt-1 text-sm text-amber-800">
              Secure bank account linking is not yet
              available. Please do not enter real bank
              account details. You can preview the form
              using dummy information.
            </p>
          </div>
        </div>

        <div className="space-y-6">

          {/* ACCOUNT HOLDER */}
          <div>
            <label
              htmlFor="accountHolder"
              className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"
            >
              <UserRound
                size={17}
                className="text-indigo-500"
              />
              Account Holder Name
            </label>

            <input
              id="accountHolder"
              type="text"
              name="accountHolder"
              value={bankDetails.accountHolder}
              onChange={handleChange}
              placeholder="Enter dummy account holder name"
              autoComplete="off"
              className={inputClass}
            />

            {bankDetails.accountHolder !== "" && (
              <p
                className={`mt-2 text-xs font-medium ${
                  isNameValid
                    ? "text-green-600"
                    : "text-red-500"
                }`}
              >
                {isNameValid
                  ? "Name format is valid"
                  : "Name must contain at least 3 characters"}
              </p>
            )}
          </div>

          {/* ACCOUNT NUMBER */}
          <div>
            <label
              htmlFor="accountNumber"
              className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"
            >
              <CreditCard
                size={17}
                className="text-indigo-500"
              />
              Account Number
            </label>

            <input
              id="accountNumber"
              type="text"
              inputMode="numeric"
              name="accountNumber"
              value={bankDetails.accountNumber}
              onChange={handleChange}
              maxLength={18}
              placeholder="Enter dummy account number"
              autoComplete="off"
              className={inputClass}
            />

            {bankDetails.accountNumber !== "" && (
              <p
                className={`mt-2 text-xs font-medium ${
                  isAccountNumberValid
                    ? "text-green-600"
                    : "text-red-500"
                }`}
              >
                {isAccountNumberValid
                  ? "Account number format is valid"
                  : "Account number must contain 9 to 18 digits"}
              </p>
            )}
          </div>

          {/* IFSC CODE */}
          <div>
            <label
              htmlFor="ifscCode"
              className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"
            >
              <Building2
                size={17}
                className="text-indigo-500"
              />
              IFSC Code
            </label>

            <input
              id="ifscCode"
              type="text"
              name="ifscCode"
              value={bankDetails.ifscCode}
              onChange={handleChange}
              maxLength={11}
              placeholder="Example: SBIN0001234"
              autoComplete="off"
              className={`${inputClass} uppercase`}
            />

            {bankDetails.ifscCode !== "" && (
              <p
                className={`mt-2 text-xs font-medium ${
                  isIfscValid
                    ? "text-green-600"
                    : "text-red-500"
                }`}
              >
                {isIfscValid
                  ? "IFSC format is valid"
                  : "Enter a valid 11-character IFSC code"}
              </p>
            )}
          </div>

          {/* INFORMATION */}
          <div className="flex items-start gap-3 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
            <ShieldCheck
              size={20}
              className="mt-0.5 shrink-0 text-indigo-600"
            />

            <p className="text-xs leading-5 text-indigo-800">
              This form currently demonstrates frontend
              validation only. No bank information is sent
              to Django or RazorpayX, and no bank account
              is linked or verified.
            </p>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="button"
            disabled
            className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-gray-400 px-5 py-3.5 text-sm font-bold text-white"
          >
            <LockKeyhole size={19} />
            Bank Account Linking Coming Soon
          </button>

          {isFormValid && (
            <p className="text-center text-sm text-amber-600">
              Demo validation passed. Secure submission
              is not available yet.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export default BankAccount;
