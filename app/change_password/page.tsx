export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="flex items-center justify-center">
            <h1 className="text-3xl font-bold mb-8">Forgot Password</h1>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              placeholder="กรอกอีเมล"

            />
          </div>
          <div className="flex items-center justify-center">
            <button className="btn custom-green hover:bg-green-600 bg-green-400  font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}