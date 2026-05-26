import React, { useState, useRef, useEffect } from 'react';
import { useNavigate} from 'react-router-dom';
import { useSignup } from '../../context/SignupContext'; 
import Loader from '../common/Loader'; 
import { AlertCircle } from 'lucide-react';
const apiUrl = import.meta.env.VITE_API_URL;


const OTPVerificationPage = ({path}) => {
    const navigate = useNavigate();
    const { progress, startLoading, stopLoading, signupData,nextStep } = useSignup();
    

    const [otp, setOtp] = useState(new Array(6).fill("")); 
    const [timer, setTimer] = useState(30);
    const [isResendDisabled, setIsResendDisabled] = useState(true);
    const [error, setError] = useState(null);
    const inputRefs = useRef([]);

    const handleOtpChange = (element, index) => {
        if (isNaN(element.value)) return; 

        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);

        if (element.value !== "" && index < 5) {
            inputRefs.current[index + 1].focus();
        }
        
        if (error) setError(null);
    };

    useEffect(() => {
        let interval = null;
        if (isResendDisabled && timer > 0) {
            interval = setInterval(() => {
                setTimer(prevTime => prevTime - 1);
            }, 1000);
        } else if (timer === 0) {
            setIsResendDisabled(false);
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isResendDisabled, timer]);

    const handleResend = async () => {

        const userIdentifier = signupData.email || signupData.mobile;
        if (!userIdentifier) return; 

        setIsResendDisabled(true);
        setTimer(30); 
        startLoading();

        try {

            const response = await fetch(`${apiUrl}/api/auth/resend-otp`, {
                method: 'POST',
                body: JSON.stringify({ email: userIdentifier }),
                headers: { 'Content-type': 'application/json' },
            });

            const data = await response.json();

            if (!response.ok) {
                console.log("ERROR:", data.message);
                setError(data.message);
                return;
            }

            if (response.ok) {
                await stopLoading();
                alert("New OTP sent successfully!");
            } else {
                await stopLoading();
                alert("Failed to resend OTP.");
            }
        } catch (err) {
            await stopLoading();
            alert("Network error during resend.");
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        const fullOtp = otp.join("");
        
        if (fullOtp.length !== 6) {
            setError("Please enter the full 6-digit code.");
            return;
        }

        startLoading();

        try {
            const response = await fetch(`${apiUrl}/api/auth/verify-otp`, {
                method: 'POST',
                body: JSON.stringify({ 
                    email: signupData.email ,
                    otp: fullOtp 
                }),
                headers: { 'Content-type': 'application/json' },
            });

            if (response.ok) {
                await stopLoading();
                console.log("OTP Verified!");
                nextStep();
                navigate(path); 
            } else {
                await stopLoading();
                setError("Invalid or expired OTP. Please try again.");
            }
        } catch (err) {
            await stopLoading();
            alert("Network error during verification.");
        }
    };

    return (
        <>
            <Loader progress={progress} />
            
            <div className="min-h-screen bg-white flex justify-center items-center p-4">
                <div className="w-full max-w-md">
                    <header className="absolute top-4 left-4">
                        <h1 className="text-3xl font-jaro text-gray-800">MasterHire</h1>
                    </header>

                    <main className="mt-5 text-center">
                      <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-teal-100 mb-6">
            <svg className="h-12 w-12 text-teal-600" xmlns="http://www.w3.org" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
                        <h2 className="text-lg font-semibold mb-2 text-gray-800">Please Verify Your Account</h2>
                        <p className="text-gray-500">Enter the six digit code we've sent to your email address to verify your new <span className="font-bold">MasterHire</span> account</p>

                        <form onSubmit={handleVerify} className="space-y-6 mt-5">
                            <div className="flex justify-center gap-3">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        id={`otp-${index}`}
                                        type="tel" 
                                        maxLength="1"
                                        value={digit}
                                        onChange={(e) => handleOtpChange(e.target, index)}
                                        ref={el => inputRefs.current[index] = el}
                                        autoFocus={index === 0} 
                                        className={`w-12 h-12 text-center border-2 rounded-lg text-lg focus:ring-teal-500 focus:border-teal-500 outline-none ${
                                            error ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                        }`}
                                    />
                                ))}
                            </div>
                            
                            {error && (
                                <div className="flex items-center gap-2 justify-center text-red-500 mt-2">
                                    <AlertCircle className="w-4 h-4" /> 
                                    <p className="text-sm">{error}</p>
                                </div>
                            )}

                             <div className="mt-6 text-center text-gray-600">
                            {timer > 0 ? (
                                <p>Resend code in {timer} seconds</p>
                            ) : (
                              <p className="text-sm text-gray-500">
                                 Didn't receive Email?  
                                <button 
                                    onClick={handleResend} 
                                    disabled={isResendDisabled}
                                    className="text-teal-600 hover:text-teal-700 font-semibold disabled:text-gray-400 disabled:cursor-not-allowed"
                                >
                                     Resend OTP
                                </button>
                                </p>
                            )}
                        </div>

                            <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition">
                                Verify Account
                            </button>
                        </form>

                    </main>
                </div>
            </div>
        </>
    );
};

export default OTPVerificationPage;
