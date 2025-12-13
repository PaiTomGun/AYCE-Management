'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  category_name: string;
  is_available: boolean;
  image_base64?: string;
}

interface Category {
  id: string;
  name: string;
  position: number;
}

export default function MenuManagementPage() {
  const [menu, setMenu] = useState<any>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemCategory, setItemCategory] = useState('');
  const [itemImage, setItemImage] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchMenu();
    fetchCategories();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();
      if (!data.user) {
        router.push('/staff/login');
      } else {
        setUser(data.user);
      }
    } catch (error) {
      router.push('/staff/login');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchMenu = async () => {
    try {
      const response = await fetch('/api/menu');
      const data = await response.json();
      setMenu(data);
    } catch (error) {
      console.error('Error fetching menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setEditingItem(null);
    setItemName('');
    setItemDescription('');
    setItemCategory('');
    setItemImage('');
    setIsAvailable(true);
    setShowModal(true);
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemDescription(item.description);
    setItemCategory(item.category_name);
    setItemImage(item.image_base64 || '');
    setIsAvailable(item.is_available);
    setShowModal(true);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const response = await fetch('/api/menu', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      });
      
      if (response.ok) {
        fetchMenu();
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = Math.min(img.width, img.height);
        canvas.width = 400;
        canvas.height = 400;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const x = (img.width - size) / 2;
          const y = (img.height - size) / 2;
          ctx.drawImage(img, x, y, size, size, 0, 0, 400, 400);
          setItemImage(canvas.toDataURL('image/jpeg', 0.8));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveItem = async () => {
    try {
      const response = await fetch('/api/menu', {
        method: editingItem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: editingItem?.id,
          name: itemName,
          description: itemDescription,
          category: itemCategory,
          imageBase64: itemImage,
          isAvailable,
        }),
      });
      
      if (response.ok) {
        setShowModal(false);
        fetchMenu();
      }
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar role={user?.role} />

        {/* Main Content */}
        <div className="flex-1">
          {/* Top Bar */}
          <div className="bg-white border-b px-8 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Menu Management</h1>
            <div className="flex items-center gap-4">
              <button 
                onClick={handleAddItem}
                className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600"
              >
                + Add Item
              </button>
            </div>
          </div>

          {/* Menu List */}
          <div className="p-8">
            {Object.entries(menu).map(([category, items]: [string, any]) => (
              <div key={category} className="mb-8">
                <h2 className="text-xl font-bold mb-4">{category}</h2>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {(items as MenuItem[]).map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">{item.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {item.description || '-'}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                item.is_available
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {item.is_available ? 'Available' : 'Unavailable'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleEditItem(item)}
                                className="text-blue-500 hover:text-blue-700 text-sm"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteItem(item.id)}
                                className="text-red-500 hover:text-red-700 text-sm"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

            {Object.keys(menu).length === 0 && (
              <div className="text-center text-gray-500 py-12">
                No menu items found
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingItem ? 'Edit Item' : 'Add New Item'}
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={itemDescription}
                onChange={(e) => setItemDescription(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                rows={3}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={itemCategory}
                onChange={(e) => setItemCategory(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Image (1:1 ratio)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full px-4 py-2 border rounded-lg"
              />
              {itemImage && (
                <img
                  src={itemImage}
                  alt="Preview"
                  className="mt-2 w-32 h-32 object-cover rounded-lg"
                />
              )}
            </div>

            <div className="mb-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">Available</span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveItem}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
