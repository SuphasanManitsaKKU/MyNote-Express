'use client'
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  async function Login() {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API}/api/login`, {
        email: email,
        password: password,
      }, {
        withCredentials: true, // ทำให้คุกกี้ถูกส่งไปและรับจากเซิร์ฟเวอร์
      }
    );

      Swal.fire({
        icon: 'success',
        title: 'Login Successful',
        text: 'You have successfully logged in!',
      }).then(() => {
        router.push('/note'); // ใช้ router navigation ที่ถูกต้อง
      });
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: 'Please check your email and password.',
      });
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-8">Super Note</h1>
      <div className="w-full max-w-md">
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              placeholder="กรอกอีเมล"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              placeholder="กรอกรหัสผ่าน"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Link className="inline-block underline text-sm text-blue-500 hover:text-blue-800" href="./register">
              Register
            </Link>
            <Link className="inline-block underline align-baseline text-sm text-gray-400 hover:text-blue-800" href="./forgot_password">
              Forgot Password?
            </Link>
            <button
              className="btn custom-green hover:bg-green-600 bg-green-400 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
              onClick={Login}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
