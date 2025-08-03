"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import toast from 'react-hot-toast';
import Navbar from '../../components/layout/navbar';
import InputField from '../../components/global/input-field';
import Button from '../../components/global/button';

const SignupPage = () => {
  const [form, setForm] = useState({ 
    email: '', 
    password: '', 
    name: '', 
    role: 'student' 
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.email || !form.password || !form.name || !form.role) {
      toast.error('All fields are required.');
      return;
    }
    
    setIsLoading(true);
  
    const loadingToast = toast.loading('Creating your account...', {
      duration: Infinity,
    });
    
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.dismiss(loadingToast);
        toast.error(data.error || 'Registration failed. Please try again.');
        return;
      }

      toast.dismiss(loadingToast);
      const loginToast = toast.loading('Registration successful! Logging you in...', {
        duration: Infinity,
      });

      const signInResponse = await signIn('credentials', {
        redirect: false,
        email: form.email,
        password: form.password,
      });

      if (signInResponse?.ok) {
        toast.dismiss(loginToast);
        toast.success(`Welcome ${form.name}! Redirecting to your dashboard...`);
        if (form.role === 'admin') {
          router.push('/admin_dashboard');
        } else {
          router.push('/student_dashboard');
        }
      } else {
        toast.dismiss(loginToast);
        toast.error('Registration succeeded, but automatic login failed. Please sign in manually.');
      }

    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-md mx-auto mt-16 bg-white">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md">
          <h2 className="text-2xl text-black font-bold mb-6 text-center">Sign Up</h2>
          
          <InputField
            label="Full Name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            disabled={isLoading}
            required
          />
          
          <InputField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter your email"
            disabled={isLoading}
            required
          />
          
          <InputField
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter your password (min 6 characters)"
            disabled={isLoading}
            required
          />
          
          <div className="mb-6">
            <label htmlFor="role" className="block text-gray-700 mb-2">
              Role
            </label>
            <select
              id="role"
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full px-3 py-2 text-black border rounded focus:outline-none focus:ring focus:border-blue-300 disabled:opacity-50"
              disabled={isLoading}
              required
            >
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </Button>
          
          <div className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => router.push('/signin')}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default SignupPage;