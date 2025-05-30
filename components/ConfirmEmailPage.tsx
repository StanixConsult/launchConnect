"use client";
import { useSearchParams, useRouter } from "next/navigation"; // ✅ Import Next.js utilities
import React, { useState, useRef, ChangeEvent, KeyboardEvent, useEffect } from "react"

import { verifyEmail } from "@/actions/action"; // ✅ Import OTP verification function

import { resendOtp } from "@/actions/action"; // ✅ Import Resend OTP function
function ConfirmEmailPage() {
  const [otp, setOtp] = useState<string[]>(["", "", "", ""]);
  const [message, setMessage] = useState("");
  const [isResendDisabled, setIsResendDisabled] = useState(false); // ✅ Track Resend button state
  const [countdown, setCountdown] = useState(0); // ✅ Timer countdown
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];
  const searchParams = useSearchParams(); // ✅ Get query params
  const router = useRouter(); // ✅ Router for redirection
  const email = searchParams.get("email") || localStorage.getItem("user_email") || ""; // ✅ Retrieve email







  // Countdown timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!email) {
      router.push("/sign_up"); // ✅ Redirect back if no email
    }
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    } else {
      setIsResendDisabled(false); // Enable button after timer ends
    }
    return () => clearTimeout(timer);
  }, [countdown,email,router]);




  const handleChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (!isNaN(Number(value)) && value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 3) inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const enteredOtp = otp.join("");
    
    if (enteredOtp.length < 4) {
      setMessage("Please enter the full 4-digit code.");
      return;
    }
  
    setMessage("⏳ Verifying Email...");
    
    const response = await verifyEmail(email, enteredOtp);
  
    if (response.success) {
      setMessage("✅ Verification successful! Redirecting...");
      setTimeout(() => router.push("/sign_up/welcome"), 2000); // Redirect to dashboard
    } else {
      setMessage(`${response.message}`); // Show API error message
    }
  };


  const handleResendOtp = async () => {
    if (!email) {
      setMessage("Email is required to resend OTP.");
      return;
    }
  
    setMessage("⏳ Sending new OTP...");
    setIsResendDisabled(true);
    setCountdown(120); // Start 2-minute countdown
  
    const response = await resendOtp(email);
  
    setMessage(response.message);
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-6 bg-white">
      {/* Header */}
      <div className="w-full max-w-md mt-10 space-y-2">
        <h1 className="text-2xl font-bold text-black">Confirm Email Address</h1>
        <h3 className="text-[#606060] text-sm bg-[#1FC16B1A] p-2 rounded-md">
          We’ve just sent a code to <span className="font-semibold">{email}</span>.
          <br /> Enter the 4-digit code below.
        </h3>
      </div>

      {/* OTP Input Fields */}
      <div className="mt-4 flex gap-3">
        {otp.map((value, index) => (
          <input
            key={index}
            type="text"
            value={value}
            maxLength={1}
            onChange={(e) => handleChange(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            ref={inputRefs[index]}
            className="w-12 h-12 text-center text-xl font-semibold border-2 border-gray-300 rounded-md 
                       focus:outline-none focus:border-green-500 bg-white text-black"
          />
        ))}
      </div>
    {/* Error/Success Message */}
    {message && <p className={`mt-2 text-sm ${message.includes("successful") ? "text-green-500" : "text-red-500"}`}>{message}</p>}

      {/* Resend Code */}
      <p className="mt-2 text-sm text-gray-600">
        Didn&apos;t get a code?{" "}
        <button
          onClick={handleResendOtp}
          disabled={isResendDisabled}
          className={`font-semibold ${isResendDisabled ? "text-gray-400 cursor-not-allowed" : "text-green-600 hover:underline"}`}
        >
          {isResendDisabled ? `Resend in ${countdown}s` : "Resend"}
        </button>
      </p>


      {/* Create Account Button */}
      <button onClick={handleVerifyOtp} className="mt-4 w-full max-w-xs bg-green-500 text-white py-2 rounded-md font-medium hover:bg-green-600">
        Create Account
      </button>
    </div>
  );
}

export default ConfirmEmailPage;
