"use client";

export default function Header() {
  return (
    <div className="flex justify-between items-center p-4 border-b">
      <h1 className="text-2xl font-semibold">Patient Dashboard</h1>
      <div className="flex gap-4">
        <button className="px-4 py-2 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200">
          Accounts
        </button>
        <button className="px-4 py-2 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200">
          Purchases
        </button>
        <button className="px-4 py-2 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200">
          Sessions
        </button>
      </div>
    </div>
  );
} 