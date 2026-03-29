import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../assets/auth.css";

export default function LoginPage() {
    const { user, login } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    useEffect(() => {
        if (user) {
            navigate("/feed");
        }
    }, [user, navigate]);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await login(form);

        if (result.success) {
            navigate("/feed");
        } else {
            alert(result.message);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1>Welcome back</h1>
                <p className="auth-subtitle">Login to your KOMU account</p>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        onChange={handleChange}
                        value={form.email}
                    />
                    <input
                        name="password"
                        type="password"
                        placeholder="Password"
                        onChange={handleChange}
                        value={form.password}
                    />
                    <button type="submit">Login</button>
                </form>

                <p className="auth-footer">
                    No account yet? <Link to="/register">Create one</Link>
                </p>
            </div>
        </div>
    );
}