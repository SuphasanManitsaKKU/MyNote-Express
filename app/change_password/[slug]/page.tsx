'use client';

import axios from "axios";
import Swal from "sweetalert2";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Page({ params }: { params: { slug: string } }) {
  const token = params.slug;
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();

  async function Send() {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API}/changepassword`, {
        token: token,
        password: password,
        confirmPassword: confirmPassword,
      });
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Please check your email to reset your password.',
      }).then(() => {
        router.push('/'); // ใช้ router navigation ที่ถูกต้อง
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Failed',
        text: 'Please check your email.',
      });
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
          <div className="flex items-center justify-center">
            <h1 className="text-3xl font-bold mb-8">Change Password</h1>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              placeholder="กรอกรหัสผ่านใหม่"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="confirmPassword"
              type="password"
              placeholder="ยืนยันรหัสผ่าน"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-center">
            <button
              className="btn custom-green hover:bg-green-700 bg-green-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
              onClick={Send}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
