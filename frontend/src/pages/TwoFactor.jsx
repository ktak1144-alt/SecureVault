import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import Navbar from "../components/Navbar";
import { FiShield, FiCheck, FiX } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const TwoFactor = () => {
  const { token } = useAuth();
  const [status, setStatus] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [secret, setSecret] = useState(null);
  const [otpToken, setOtpToken] = useState("");
  const [disableToken, setDisableToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  headers: { Authorization: `Bearer ${token}` }
});

  useEffect(() => {
    fetch2FAStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetch2FAStatus = async () => {
    try {
      const { data } = await API.get("/2fa/status");
      setStatus(data.twoFactorEnabled);
    } catch (error) {
      toast.error("Failed to fetch 2FA status!");
    }
  };

  const handleSetup = async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/2fa/setup");
      setQrCode(data.qrCode);
      setSecret(data.secret);
      setStep(2);
      toast.success("✅ Scan the QR code with Google Authenticator!");
    } catch (error) {
      toast.error("Setup failed!");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!otpToken || otpToken.length !== 6) {
      toast.error("Enter a valid 6-digit code!");
      return;
    }
    setLoading(true);
    try {
      await API.post("/2fa/verify", { token: otpToken });
      setStatus(true);
      setStep(1);
      setQrCode(null);
      toast.success("✅ 2FA Enabled Successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid code!");
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    if (!disableToken || disableToken.length !== 6) {
      toast.error("Enter a valid 6-digit code!");
      return;
    }
    setLoading(true);
    try {
      await API.post("/2fa/disable", { token: disableToken });
      setStatus(false);
      setDisableToken("");
      toast.success("✅ 2FA Disabled!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid code!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="bg-blue-600 p-4 rounded-full inline-block mb-4">
            <FiShield className="text-white text-4xl" />
          </div>
          <h2 className="text-3xl font-bold">Two Factor Authentication</h2>
          <p className="text-gray-400 mt-2">Add an extra layer of security to your account</p>
        </div>

        {/* Status Card */}
        <div className={`rounded-xl p-5 border mb-8 flex items-center justify-between
          ${status
            ? "bg-green-900/20 border-green-700"
            : "bg-red-900/20 border-red-700"
          }`}>
          <div className="flex items-center gap-3">
            {status
              ? <FiCheck className="text-green-400 text-2xl" />
              : <FiX className="text-red-400 text-2xl" />
            }
            <div>
              <p className="font-bold text-lg">
                2FA is {status ? "Enabled ✅" : "Disabled ❌"}
              </p>
              <p className="text-gray-400 text-sm">
                {status
                  ? "Your account is protected with 2FA"
                  : "Enable 2FA to secure your account"
                }
              </p>
            </div>
          </div>
        </div>

        {/* Setup 2FA */}
        {!status && (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            {step === 1 && (
              <>
                <h3 className="text-xl font-bold mb-4">Setup 2FA</h3>
                <div className="space-y-3 text-gray-400 text-sm mb-6">
                  <p>📱 Step 1 — Download <strong className="text-white">Google Authenticator</strong> app on your phone</p>
                  <p>📷 Step 2 — Scan the QR code that appears</p>
                  <p>🔢 Step 3 — Enter the 6-digit code to verify</p>
                </div>
                <button
                  onClick={handleSetup}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition duration-200 disabled:opacity-50 font-semibold"
                >
                  {loading ? "Generating QR Code..." : "Setup 2FA 🔐"}
                </button>
              </>
            )}

            {step === 2 && qrCode && (
              <>
                <h3 className="text-xl font-bold mb-4">Scan QR Code</h3>
                <div className="flex justify-center mb-6">
                  <div className="bg-white p-4 rounded-xl">
                    <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                  </div>
                </div>

                <div className="bg-gray-700 rounded-lg p-3 mb-6">
                  <p className="text-gray-400 text-xs mb-1">Manual entry key:</p>
                  <p className="text-blue-400 font-mono text-sm break-all">{secret}</p>
                </div>

                <div className="mb-4">
                  <label className="text-gray-400 text-sm mb-2 block">
                    Enter 6-digit code from Google Authenticator:
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpToken}
                    onChange={(e) => setOtpToken(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    className="w-full bg-gray-700 text-white text-center text-2xl tracking-widest px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  onClick={handleVerify}
                  disabled={loading || otpToken.length !== 6}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition duration-200 disabled:opacity-50 font-semibold"
                >
                  {loading ? "Verifying..." : "Verify & Enable 2FA ✅"}
                </button>
              </>
            )}
          </div>
        )}

        {/* Disable 2FA */}
        {status && (
          <div className="bg-gray-800 border border-red-800 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-2 text-red-400">Disable 2FA</h3>
            <p className="text-gray-400 text-sm mb-4">
              Enter your current 6-digit code to disable 2FA
            </p>
            <input
              type="text"
              maxLength={6}
              value={disableToken}
              onChange={(e) => setDisableToken(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              className="w-full bg-gray-700 text-white text-center text-2xl tracking-widest px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-red-500 mb-4"
            />
            <button
              onClick={handleDisable}
              disabled={loading || disableToken.length !== 6}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg transition duration-200 disabled:opacity-50 font-semibold"
            >
              {loading ? "Disabling..." : "Disable 2FA ❌"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TwoFactor;