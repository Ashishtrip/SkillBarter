
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Shield, CheckCircle, XCircle } from 'lucide-react';
import { Modal } from '@/components/Modal';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  identityVerified: boolean;
}

export default function ManageUsers() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [verificationMethod, setVerificationMethod] = useState<'manual' | 'social'>('manual');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (session) {
      fetchUsers();
    }
  }, [session, status, router]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        if (response.status === 403) {
          setError('You do not have admin access');
          router.push('/dashboard');
        } else {
          setError('Failed to load users');
        }
      }
    } catch (error) {
      setError('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const openVerificationModal = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeVerificationModal = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
  };

  const handleVerify = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch('/api/admin/verify-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser._id,
          method: verificationMethod,
        }),
      });

      if (response.ok) {
        await fetchUsers();
        closeVerificationModal();
      } else {
        setError('Failed to verify user');
      }
    } catch (error) {
      setError('Failed to verify user');
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 bg-primary-600 rounded-full animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <Shield className="w-8 h-8 text-primary-600" />
          <h1 className="text-3xl font-bold text-secondary-900">Manage Users</h1>
        </div>
        <p className="text-secondary-600">Verify user identities and manage roles.</p>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-secondary-200">
            <thead className="bg-secondary-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Verified
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-secondary-200">
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-900">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">{user.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                    {user.identityVerified ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {!user.identityVerified && (
                      <button
                        onClick={() => openVerificationModal(user)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        Verify
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedUser && (
        <Modal
          isOpen={isModalOpen}
          onClose={closeVerificationModal}
          title={`Verify ${selectedUser.name}`}
        >
          <div>
            <p className="mb-4">
              Choose a verification method for {selectedUser.email}.
            </p>
            <div className="flex flex-col space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="verificationMethod"
                  value="manual"
                  checked={verificationMethod === 'manual'}
                  onChange={() => setVerificationMethod('manual')}
                  className="form-radio h-4 w-4 text-primary-600"
                />
                <span className="ml-2 text-secondary-700">Manual Verification</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="verificationMethod"
                  value="social"
                  checked={verificationMethod === 'social'}
                  onChange={() => setVerificationMethod('social')}
                  className="form-radio h-4 w-4 text-primary-600"
                />
                <span className="ml-2 text-secondary-700">Social Media Verification</span>
              </label>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={closeVerificationModal}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleVerify}
                className="btn-primary"
              >
                Verify User
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
