import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import {
    getProvinces,
    getMunicipalities,
    getBarangays,
} from "../services/locationService";
import "../assets/auth.css";

export default function RegisterPage() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        username: "",
        email: "",
        password: "",
        contact_number: "",
        province_id: "",
        municipality_id: "",
        barangay_id: "",
        valid_id: null,
    });

    const [provinces, setProvinces] = useState([]);
    const [municipalities, setMunicipalities] = useState([]);
    const [barangays, setBarangays] = useState([]);

    const [loadingProvinces, setLoadingProvinces] = useState(true);
    const [loadingMunicipalities, setLoadingMunicipalities] = useState(false);
    const [loadingBarangays, setLoadingBarangays] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadProvinces();
    }, []);

    const loadProvinces = async () => {
        setLoadingProvinces(true);
        try {
            const result = await getProvinces();
            if (result.success) {
                setProvinces(result.data || []);
            } else {
                alert(result.message || "Failed to load provinces");
            }
        } catch (error) {
            alert("Failed to load provinces");
        } finally {
            setLoadingProvinces(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;

        if (name === "valid_id") {
            setForm((prev) => ({
                ...prev,
                valid_id: files?.[0] || null,
            }));
            return;
        }

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleProvinceChange = async (e) => {
        const provinceId = e.target.value;

        setForm((prev) => ({
            ...prev,
            province_id: provinceId,
            municipality_id: "",
            barangay_id: "",
        }));

        setMunicipalities([]);
        setBarangays([]);

        if (!provinceId) return;

        setLoadingMunicipalities(true);
        try {
            const result = await getMunicipalities(provinceId);
            if (result.success) {
                setMunicipalities(result.data || []);
            } else {
                alert(result.message || "Failed to load municipalities");
            }
        } catch (error) {
            alert("Failed to load municipalities");
        } finally {
            setLoadingMunicipalities(false);
        }
    };

    const handleMunicipalityChange = async (e) => {
        const municipalityId = e.target.value;

        setForm((prev) => ({
            ...prev,
            municipality_id: municipalityId,
            barangay_id: "",
        }));

        setBarangays([]);

        if (!municipalityId) return;

        setLoadingBarangays(true);
        try {
            const result = await getBarangays(municipalityId);
            if (result.success) {
                setBarangays(result.data || []);
            } else {
                alert(result.message || "Failed to load barangays");
            }
        } catch (error) {
            alert("Failed to load barangays");
        } finally {
            setLoadingBarangays(false);
        }
    };

    const validateForm = () => {
        if (!form.first_name.trim()) return "First name is required";
        if (!form.last_name.trim()) return "Last name is required";
        if (!form.username.trim()) return "Username is required";
        if (!form.email.trim()) return "Email is required";
        if (!form.password.trim()) return "Password is required";
        if (!form.contact_number.trim()) return "Contact number is required";
        if (!form.province_id) return "Please select a province";
        if (!form.municipality_id) return "Please select a municipality";
        if (!form.barangay_id) return "Please select a barangay";
        if (!form.valid_id) return "Please upload a valid ID";

        if (form.password.length < 6) return "Password must be at least 6 characters";

        const phoneClean = form.contact_number.replace(/\s+/g, "");
        if (!/^(09\d{9}|\+639\d{9})$/.test(phoneClean)) {
            return "Enter a valid PH contact number";
        }

        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "application/pdf",
        ];

        if (!allowedTypes.includes(form.valid_id.type)) {
            return "Valid ID must be JPG, PNG, or PDF";
        }

        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const error = validateForm();
        if (error) {
            alert(error);
            return;
        }

        const formData = new FormData();
        formData.append("first_name", form.first_name);
        formData.append("last_name", form.last_name);
        formData.append("username", form.username);
        formData.append("email", form.email);
        formData.append("password", form.password);
        formData.append("contact_number", form.contact_number);
        formData.append("province_id", form.province_id);
        formData.append("municipality_id", form.municipality_id);
        formData.append("barangay_id", form.barangay_id);
        formData.append("valid_id", form.valid_id);

        setSubmitting(true);
        try {
            const result = await registerUser(formData);

            if (result.success) {
                alert(
                    result.message ||
                    "Registration submitted successfully. Your account is pending verification."
                );
                navigate("/login");
            } else {
                alert(result.message || "Registration failed");
            }
        } catch (error) {
            alert("Registration failed");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="auth-page social-auth-page">
            <div className="social-auth-shell">
                <section className="social-auth-side">
                    <div className="brand-panel">
                        <div className="brand-badge">KOMU</div>
                        <h1>Join your local community.</h1>
                        <p>
                            Connect with people in your barangay, see local announcements, and
                            participate in community discussions.
                        </p>

                        <div className="brand-points">
                            <div className="brand-point">
                                <span>📍</span>
                                <p>Location-based access for province, municipality, and barangay.</p>
                            </div>
                            <div className="brand-point">
                                <span>🛡️</span>
                                <p>Registrations can be reviewed by barangay officials or admins.</p>
                            </div>
                            <div className="brand-point">
                                <span>🪪</span>
                                <p>Valid ID and contact number help confirm real residents.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="social-auth-main">
                    <div className="auth-card auth-card--wide social-auth-card">
                        <div className="auth-card__top">
                            <h1>Create account</h1>
                            <p className="auth-subtitle">
                                Sign up to access your verified KOMU community.
                            </p>
                        </div>

                        <div className="warning-box">
                            <strong>Important:</strong> Your selected province, municipality,
                            and barangay determine your KOMU access. Once submitted, this
                            location cannot be changed directly from your account. Make sure
                            your details are correct before registering.
                        </div>

                        <form className="auth-form auth-form--grid" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="first_name">First Name</label>
                                <input
                                    id="first_name"
                                    name="first_name"
                                    placeholder="Enter first name"
                                    value={form.first_name}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="last_name">Last Name</label>
                                <input
                                    id="last_name"
                                    name="last_name"
                                    placeholder="Enter last name"
                                    value={form.last_name}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="username">Username</label>
                                <input
                                    id="username"
                                    name="username"
                                    placeholder="Choose a username"
                                    value={form.username}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="contact_number">Contact Number</label>
                                <input
                                    id="contact_number"
                                    name="contact_number"
                                    placeholder="09XXXXXXXXX"
                                    value={form.contact_number}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group form-group--full">
                                <label htmlFor="email">Email</label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="Enter email address"
                                    value={form.email}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group form-group--full">
                                <label htmlFor="password">Password</label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="Create a password"
                                    value={form.password}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group form-group--full">
                                <label htmlFor="province_id">Province</label>
                                <select
                                    id="province_id"
                                    name="province_id"
                                    value={form.province_id}
                                    onChange={handleProvinceChange}
                                    disabled={loadingProvinces}
                                >
                                    <option value="">
                                        {loadingProvinces ? "Loading provinces..." : "Select Province"}
                                    </option>
                                    {provinces.map((province) => (
                                        <option key={province.id} value={province.id}>
                                            {province.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group form-group--full">
                                <label htmlFor="municipality_id">Municipality / City</label>
                                <select
                                    id="municipality_id"
                                    name="municipality_id"
                                    value={form.municipality_id}
                                    onChange={handleMunicipalityChange}
                                    disabled={!form.province_id || loadingMunicipalities}
                                >
                                    <option value="">
                                        {loadingMunicipalities
                                            ? "Loading municipalities..."
                                            : "Select Municipality / City"}
                                    </option>
                                    {municipalities.map((municipality) => (
                                        <option key={municipality.id} value={municipality.id}>
                                            {municipality.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group form-group--full">
                                <label htmlFor="barangay_id">Barangay</label>
                                <select
                                    id="barangay_id"
                                    name="barangay_id"
                                    value={form.barangay_id}
                                    onChange={handleChange}
                                    disabled={!form.municipality_id || loadingBarangays}
                                >
                                    <option value="">
                                        {loadingBarangays ? "Loading barangays..." : "Select Barangay"}
                                    </option>
                                    {barangays.map((barangay) => (
                                        <option key={barangay.id} value={barangay.id}>
                                            {barangay.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group form-group--full">
                                <label htmlFor="valid_id">Valid ID Upload</label>
                                <label className="file-upload-box" htmlFor="valid_id">
                                    <span className="file-upload-box__icon">🪪</span>
                                    <div>
                                        <strong>
                                            {form.valid_id ? form.valid_id.name : "Choose a valid ID file"}
                                        </strong>
                                        <p>Accepted: JPG, PNG, PDF</p>
                                    </div>
                                </label>
                                <input
                                    id="valid_id"
                                    name="valid_id"
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.pdf"
                                    onChange={handleChange}
                                    className="hidden-file-input"
                                />
                            </div>

                            <button type="submit" disabled={submitting} className="auth-submit-btn">
                                {submitting ? "Submitting..." : "Create Account"}
                            </button>
                        </form>

                        <p className="auth-footer">
                            Already have an account? <Link to="/login">Login</Link>
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}