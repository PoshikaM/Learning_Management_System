"use client";
import React, { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Navbar from '../layout/navbar';
import InputField from '../global/input-field';
import Button from '../global/button';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.email || !form.password) {
      toast.error('Email and password are required.');
      return;
    }
    
    setIsLoading(true);
    
    const loadingToast = toast.loading('Signing you in...', {
      duration: Infinity,
    });
    
    try {
      const res = await signIn("credentials", { 
        redirect: false, 
        email: form.email,
        password: form.password
      });
      
      if (res?.error) {
        toast.dismiss(loadingToast);
        toast.error("Invalid credentials. Please check your email and password.");
        setIsLoading(false);
        return;
      }
      
      if (res?.ok) {
        toast.dismiss(loadingToast);
        toast.success('Login successful! Redirecting...');
        setTimeout(async () => {
          const sessionRes = await fetch('/api/auth/session');
          const session = await sessionRes.json();
          const role = session?.user?.role;
          
          if (role === 'admin') {
            router.push('/admin_dashboard');
          } else if (role === 'student') {
            router.push('/student_dashboard');
          } else {
            console.log(session);
          }
        }, 100);
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error("An unexpected error occurred. Please try again.");
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
          <h2 className="text-2xl text-black font-bold mb-6 text-center">Sign In</h2>
          
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
            placeholder="Enter your password"
            disabled={isLoading}
            required
          />
          
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
          
          <div className="mt-4 text-center text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <button
              type="button"
              onClick={() => router.push('/signup')}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default LoginPage;