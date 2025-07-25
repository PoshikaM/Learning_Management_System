"use client"
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/layout/navbar';
import InputField from '../../components/global/input-field';
import Button from '../../components/global/button';
import { getSession, signIn } from 'next-auth/react';

const SignupPage = () => {
  const [form, setForm] = useState({ 
    email: '', 
    password: '', 
    name: '', 
    role: 'student' 
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!form.email || !form.password || !form.name || !form.role) {
      setError('All fields are required.');
      return;
    }
    
    setIsLoading(true);
    
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
        setError(data.error || 'Registration failed');
        return;
      }

      setSuccess('Registration successful! Redirecting to login...');
      
      // ✅ WAIT for DB to sync (optional, helps avoid race condition)
      await new Promise((r) => setTimeout(r, 500));

      // ✅ AUTO-LOGIN user after successful registration
      const signInRes = await signIn('credentials', {
        redirect: false,
        email: form.email,
        password: form.password,
      });

      // ✅ GET SESSION and REDIRECT based on role
      if (signInRes?.ok) {
        const session = await getSession();
        const role = session?.user?.role;

        if (role === 'admin') {
          router.push('/admin_dashboard');
        } else {
          router.push('/student-dashboard');
        }
      } else {
        setError('User registered, but auto-login failed.');
      }

    } catch (err) {
      setError('An unexpected error occurred.');
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
          
          {error && (
            <div className="mb-4 text-red-600 text-center text-sm" role="alert">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 text-green-600 text-center text-sm" role="alert">
              {success}
            </div>
          )}
          
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