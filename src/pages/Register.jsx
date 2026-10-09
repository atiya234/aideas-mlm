
import { useState } from "react";
import { Link } from "react-router-dom";

function Register() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        referralCode: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleRegister = (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        console.log("Registration data:", formData);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4 py-8">
            <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-lg">
                <h1 className="mb-2 text-center text-3xl font-bold text-slate-900">
                    Create Account
                </h1>

                <p className="mb-8 text-center text-slate-500">
                    Join AIdeas using a referral code.
                </p>

                <form onSubmit={handleRegister} className="space-y-4">
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Full Name"
                        required
                        className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
                    />

                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Email Address"
                        required
                        className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
                    />

                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Password"
                        required
                        className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
                    />

                    <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm Password"
                        required
                        className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
                    />

                    <input
                        type="text"
                        name="referralCode"
                        value={formData.referralCode}
                        onChange={handleChange}
                        placeholder="Referral Code (required)"
                        required
                        className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
                    />


                    <button
                        type="submit"
                        className="w-full rounded-lg bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-700"
                    >
                        Register
                    </button>
                </form>
                <p className="mt-6 text-center text-sm text-slate-500">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                        Login
                    </Link>
                </p>
            </div>


        </div>
    );
}

export default Register;
