'use client';

import React, { useState } from 'react';
import { Users, Shield, UserPlus, Search, Edit2, ShieldAlert, CheckCircle } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([
    { id: '1', firstName: 'Admin', lastName: 'Staff', email: 'admin@ecom.dev', role: 'ADMIN', status: 'ACTIVE' },
    { id: '2', firstName: 'Customer', lastName: 'Care', email: 'care@ecom.dev', role: 'STAFF', status: 'ACTIVE' },
    { id: '3', firstName: 'Reviewer', lastName: 'Agent', email: 'reviewer@ecom.dev', role: 'AGENT', status: 'ACTIVE' },
    { id: '4', firstName: 'Support', lastName: 'Supervisor', email: 'support@ecom.dev', role: 'STAFF', status: 'SUSPENDED' },
  ]);

  const toggleUserStatus = (id: string) => {
    setUsers(users.map(u => {
      if (u.id === id) {
        return { ...u, status: u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' };
      }
      return u;
    }));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 select-none bg-[#F9F9FA] min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight uppercase flex items-center gap-2">
            <Shield className="text-[#F68B1E]" /> USER & STAFF MANAGEMENT
          </h1>
          <p className="text-gray-500 text-xs font-medium tracking-wide mt-1">
            Manage administrative roles, support agents, staff permissions, and system access.
          </p>
        </div>
        <button className="bg-[#F68B1E] hover:bg-[#e07a1a] text-white px-5 py-3 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 flex items-center gap-2 cursor-pointer border border-transparent select-none w-full sm:w-auto justify-center">
          <UserPlus size={16} /> ADD STAFF MEMBER
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100/80 flex flex-col sm:flex-row gap-4 items-center bg-gray-50/40">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by name, role, or email..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#F68B1E] text-xs font-bold text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200"
            />
          </div>
          <select className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-[#F68B1E] text-gray-600 shadow-sm w-full sm:w-auto">
            <option>All Roles</option>
            <option>ADMIN</option>
            <option>STAFF</option>
            <option>AGENT</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Full Name / Email</th>
                <th className="px-6 py-4">System Role</th>
                <th className="px-6 py-4">Account Status</th>
                <th className="px-6 py-4 text-right">Update User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/60">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/40 duration-200 transition-all select-none">
                  <td className="px-6 py-4">
                    <div className="font-extrabold text-xs md:text-sm text-gray-900 leading-tight tracking-tight">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wide">
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] px-2.5 py-1 rounded-xl font-extrabold border uppercase tracking-wider ${
                      user.role === 'ADMIN' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                      user.role === 'STAFF' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                      'bg-teal-50 text-teal-600 border-teal-100'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] px-2.5 py-1 rounded-xl font-extrabold border uppercase tracking-wider ${
                      user.status === 'ACTIVE' 
                        ? 'bg-green-50 text-green-700 border-green-100' 
                        : 'bg-red-50 text-red-700 border-red-100'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => toggleUserStatus(user.id)}
                        className={`p-2 rounded-xl border duration-200 transition-all cursor-pointer ${
                          user.status === 'ACTIVE' 
                            ? 'text-red-600 bg-red-50 hover:bg-red-100/60 border-red-100/60' 
                            : 'text-green-600 bg-green-50 hover:bg-green-100/60 border-green-100/60'
                        }`}
                        title={user.status === 'ACTIVE' ? 'Suspend Access' : 'Activate Access'}
                      >
                        {user.status === 'ACTIVE' ? <ShieldAlert size={16} /> : <CheckCircle size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
