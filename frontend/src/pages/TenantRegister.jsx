import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { User, MapPin, FileText, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';

export default function TenantRegister() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: '',
        phone: '',
        address: '',
        aadhaarId: '',
        agreed: false
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleNext = () => {
        if (step === 1) {
            if (!formData.email || !formData.password) {
                setError('Please fill in all fields');
                return;
            }
        } else if (step === 2) {
            if (!formData.fullName || !formData.phone || !formData.address || !formData.aadhaarId) {
                setError('Please fill in all fields');
                return;
            }
        }
        setError('');
        setStep(prev => prev + 1);
    };

    const handleBack = () => {
        setStep(prev => prev - 1);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.agreed) {
            setError('You must agree to the terms and conditions');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // 1. Sign up user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        role: 'tenant',
                        full_name: formData.fullName,
                        phone_number: formData.phone,
                        address: formData.address, // These will be handled by trigger or manual update
                        aadhaar_id: formData.aadhaarId
                    },
                },
            });

            if (authError) throw authError;

            // 2. Update profile with extra details (if trigger doesn't handle them all)
            // The trigger 'on_auth_user_created' usually handles basic fields. 
            // We might need to update the profile explicitly for address/aadhaar if the trigger is simple.
            // Let's assume the trigger creates the row, and we update it.

            if (authData.user) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .update({
                        full_name: formData.fullName,
                        phone_number: formData.phone,
                        address: formData.address,
                        aadhaar_id: formData.aadhaarId
                    })
                    .eq('id', authData.user.id);

                if (profileError) {
                    console.error("Profile update error:", profileError);
                    // Continue anyway as the user is created
                }
            }

            navigate('/dashboard');
        } catch (error) {
            console.error('Registration error:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Tenant Registration
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Step {step} of 3
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {error && (
                        <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
                            <div className="flex">
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {step === 1 && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-4 text-indigo-600">
                                    <User className="w-5 h-5" />
                                    <h3 className="text-lg font-medium">Account Details</h3>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Next <ArrowRight className="ml-2 w-4 h-4" />
                                </button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-4 text-indigo-600">
                                    <MapPin className="w-5 h-5" />
                                    <h3 className="text-lg font-medium">Personal Details</h3>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        required
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        required
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Permanent Address</label>
                                    <textarea
                                        name="address"
                                        required
                                        rows={3}
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Aadhaar ID</label>
                                    <input
                                        type="text"
                                        name="aadhaarId"
                                        required
                                        value={formData.aadhaarId}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={handleBack}
                                        className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        <ArrowLeft className="mr-2 w-4 h-4" /> Back
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Next <ArrowRight className="ml-2 w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-4 text-indigo-600">
                                    <FileText className="w-5 h-5" />
                                    <h3 className="text-lg font-medium">Agreement</h3>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-md text-sm text-gray-600 h-48 overflow-y-auto border border-gray-200">
                                    <p className="font-bold mb-2">Terms and Conditions</p>
                                    <p>1. The tenant agrees to pay rent on or before the 5th of every month.</p>
                                    <p>2. The tenant shall not cause any nuisance to other residents.</p>
                                    <p>3. Maintenance of the room is the responsibility of the tenant.</p>
                                    <p>4. Any damage to property will be charged accordingly.</p>
                                    <p>5. One month notice period is required before vacating.</p>
                                    <p>6. No illegal activities are permitted on the premises.</p>
                                    <p>7. The management reserves the right to inspect the room with prior notice.</p>
                                </div>
                                <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <input
                                            id="agreed"
                                            name="agreed"
                                            type="checkbox"
                                            required
                                            checked={formData.agreed}
                                            onChange={handleChange}
                                            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="agreed" className="font-medium text-gray-700">
                                            I have read and agree to the terms and conditions
                                        </label>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={handleBack}
                                        className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        <ArrowLeft className="mr-2 w-4 h-4" /> Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                    >
                                        {loading ? 'Registering...' : 'Complete Registration'} <CheckCircle className="ml-2 w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
