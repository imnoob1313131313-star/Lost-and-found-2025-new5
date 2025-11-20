import { useState, useEffect } from 'react';
import { Trash2, AlertTriangle, Ban, Check } from 'lucide-react';
import { api } from '../utils/api';
import { useToast } from '../context/ToastContext';

interface Item {
  id: string;
  title: string;
  type: string;
  user: {
    name: string;
    email: string;
  };
  createdAt: string;
  reports: number;
}

interface User {
  _id: string;
  name: string;
  email: string;
  isBanned: boolean;
  createdAt: string;
}

const AdminPanel = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('items');
  const [items, setItems] = useState<Item[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeTab === 'items') {
      fetchAllItems();
    } else {
      fetchAllUsers();
    }
  }, [activeTab]);

  const fetchAllItems = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/items');
      setItems(response.data.items);
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to fetch items', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      setUsers(response.data.users);
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to fetch users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      await api.delete(`/admin/items/${id}`);
      setItems(items.filter((item) => item.id !== id));
      showToast('Item deleted successfully', 'success');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to delete item', 'error');
    }
  };

  const handleBanToggle = async (userId: string, isBanned: boolean) => {
    const action = isBanned ? 'unban' : 'ban';
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      const response = await api.patch(`/admin/users/${userId}/ban`);
      setUsers(users.map((user) =>
        user._id === userId ? response.data.user : user
      ));
      showToast(response.data.message, 'success');
    } catch (error: any) {
      showToast(error.response?.data?.message || `Failed to ${action} user`, 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-600 mt-1">Manage items, users, and reported content</p>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('items')}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'items'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            Items Management
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            Users Management
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          {activeTab === 'items' ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Posted By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Reports
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{item.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          item.type === 'lost'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{item.user.name}</div>
                      <div className="text-sm text-gray-500">{item.user.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {item.reports > 0 ? (
                        <span className="flex items-center text-red-600">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          {item.reports}
                        </span>
                      ) : (
                        <span className="text-gray-400">0</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.isBanned
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {user.isBanned ? 'Banned' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleBanToggle(user._id, user.isBanned)}
                        className={`flex items-center gap-1 px-3 py-1 rounded text-sm font-medium transition-colors ${
                          user.isBanned
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        {user.isBanned ? (
                          <>
                            <Check className="h-4 w-4" />
                            Unban
                          </>
                        ) : (
                          <>
                            <Ban className="h-4 w-4" />
                            Ban
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
