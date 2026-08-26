"use client";

import { useState, useEffect } from "react";

type PromoCardType = {
  _id?: string;
  imageSrc: string;
  category: string;
  title: string;
  buttonText: string;
  isLarge: boolean;
};

export default function AdminPromoDashboard() {
  const [cards, setCards] = useState<PromoCardType[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<PromoCardType>({
    imageSrc: "",
    category: "",
    title: "",
    buttonText: "Discover More",
    isLarge: false,
  });

  const fetchCards = async () => {
    try {
      const res = await fetch("/api/admin/promo-cards", { cache: "no-store" });
      if (!res.ok) return;
      const json = await res.json();
      if (json.success) setCards(json.data);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "bylxfdh4";
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "dazzling_preset";

    setUploading(true);
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", uploadPreset);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: data,
        }
      );
      const fileData = await res.json();

      if (fileData.secure_url) {
        setFormData((prev) => ({ ...prev, imageSrc: fileData.secure_url }));
      } else {
        alert(fileData.error?.message || "Image upload failed!");
      }
    } catch (err) {
      console.error("Upload Error:", err);
      alert("Error uploading image to Cloudinary");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageSrc) {
      alert("Please upload an image first!");
      return;
    }

    setLoading(true);

    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `/api/admin/promo-cards?id=${editingId}`
        : "/api/admin/promo-cards";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setIsOpen(false);
        resetForm();
        fetchCards();
      } else {
        alert(json.message || "Failed to save banner");
      }
    } catch (err) {
      console.error("Save Error:", err);
      alert("An error occurred while saving.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (card: PromoCardType) => {
    setEditingId(card._id || null);
    setFormData(card);
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this banner?")) {
      try {
        const res = await fetch(`/api/admin/promo-cards?id=${id}`, {
          method: "DELETE",
        });
        if (res.ok) fetchCards();
      } catch (err) {
        console.error("Delete Error:", err);
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      imageSrc: "",
      category: "",
      title: "",
      buttonText: "Discover More",
      isLarge: false,
    });
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Promo Banner Manager</h1>
          <p className="text-sm text-slate-500">
            Total Banners Active:{" "}
            <span className="font-bold text-slate-900">{cards.length}</span>
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsOpen(true);
          }}
          className="bg-[#5A0C3D] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#4a0a32] transition"
        >
          + Add New Banner
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b bg-slate-100 text-slate-600 text-xs uppercase">
              <th className="p-4">Image</th>
              <th className="p-4">Category</th>
              <th className="p-4">Title</th>
              <th className="p-4">Type</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cards.map((c) => (
              <tr key={c._id} className="border-b hover:bg-slate-50 text-sm">
                <td className="p-4">
                  <img
                    src={c.imageSrc}
                    className="w-12 h-12 object-cover rounded"
                    alt=""
                  />
                </td>
                <td className="p-4 font-semibold">{c.category}</td>
                <td className="p-4 truncate max-w-xs">{c.title}</td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      c.isLarge
                        ? "bg-purple-100 text-purple-700"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {c.isLarge ? "Hero (Large)" : "Grid Card"}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  <button
                    onClick={() => handleEdit(c)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(c._id!)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 grid grid-cols-1 md:grid-cols-2 gap-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-black"
            >
              ✕
            </button>

            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-xl font-bold">
                {editingId ? "Edit Promo Banner" : "Add Promo Banner"}
              </h2>

              <div>
                <label className="text-xs font-bold block mb-1">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="text-xs w-full border p-2 rounded"
                />
                {uploading && (
                  <p className="text-xs text-amber-600 mt-1">
                    Uploading Image to Cloudinary...
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  required
                  className="w-full border p-2 rounded text-sm"
                  placeholder="e.g. Festive Exclusive"
                />
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  className="w-full border p-2 rounded text-sm"
                  placeholder="Enter main headline"
                />
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">
                  Button Text
                </label>
                <input
                  type="text"
                  value={formData.buttonText}
                  onChange={(e) =>
                    setFormData({ ...formData, buttonText: e.target.value })
                  }
                  required
                  className="w-full border p-2 rounded text-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isLarge"
                  checked={formData.isLarge}
                  onChange={(e) =>
                    setFormData({ ...formData, isLarge: e.target.checked })
                  }
                />
                <label htmlFor="isLarge" className="text-sm font-semibold">
                  Is Large Hero Card (Left Side)?
                </label>
              </div>

              <button
                disabled={loading || uploading}
                type="submit"
                className="w-full bg-[#5A0C3D] text-white py-2.5 rounded-lg font-bold disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Banner"}
              </button>
            </form>

            <div className="flex flex-col">
              <span className="text-xs font-bold mb-2 text-slate-400">
                LIVE PREVIEW
              </span>
              <div className="relative group overflow-hidden w-full h-[350px] bg-slate-900 rounded-xl">
                {formData.imageSrc ? (
                  <img
                    src={formData.imageSrc}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-slate-500">
                    No Image Uploaded
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-6 text-white z-10">
                  <span className="text-xs font-semibold tracking-widest uppercase opacity-75 mb-1">
                    {formData.category || "CATEGORY"}
                  </span>
                  <h2 className="text-xl font-serif font-bold leading-tight mb-3">
                    {formData.title || "Your Banner Title"}
                  </h2>
                  <div>
                    <button
                      type="button"
                      className="bg-white text-black font-semibold text-xs px-4 py-2 rounded-full"
                    >
                      {formData.buttonText || "Button"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}