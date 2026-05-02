import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getMyFiles } from "../utils/api";
// eslint-disable-next-line
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import FileCard from "../components/FileCard";
import UploadModal from "../components/UploadModal";
import { FiUpload, FiFolder, FiShield, FiHardDrive } from "react-icons/fi";

const Dashboard = () => {
  // auth context used via API
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [search, setSearch] = useState("");

  // Fetch files on load
  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const { data } = await getMyFiles();
      setFiles(data.files);
    } catch (error) {
      toast.error("Failed to fetch files!");
    } finally {
      setLoading(false);
    }
  };

  // Handle new upload
  const handleUpload = (newFile) => {
    setFiles((prev) => [newFile, ...prev]);
    fetchFiles();
  };

  // Handle delete
  const handleDelete = (fileId) => {
    setFiles((prev) => prev.filter((f) => f._id !== fileId));
  };

  // Filter files by search
  const [categoryFilter, setCategoryFilter] = useState("All");

  const categories = [
    "All",
    "Document",
    "Image",
    "Report",
    "Sensitive",
    "Notes",
    "Spreadsheet",
    "Presentation",
    "Other",
  ];

  const filteredFiles = files.filter((f) => {
    const matchesSearch =
      f.originalName?.toLowerCase().includes(search.toLowerCase()) ?? true;
    const matchesCategory =
      categoryFilter === "All" || f.aiCategory === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Calculate storage used
  const totalStorage = files.reduce((acc, f) => acc + f.size, 0);
  const formatStorage = (bytes) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-lg">
              <FiFolder className="text-white text-2xl" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Files</p>
              <p className="text-white text-2xl font-bold">{files.length}</p>
            </div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 flex items-center gap-4">
            <div className="bg-green-600 p-3 rounded-lg">
              <FiShield className="text-white text-2xl" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Encrypted Files</p>
              <p className="text-white text-2xl font-bold">{files.length}</p>
            </div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 flex items-center gap-4">
            <div className="bg-purple-600 p-3 rounded-lg">
              <FiHardDrive className="text-white text-2xl" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Storage Used</p>
              <p className="text-white text-2xl font-bold">
                {formatStorage(totalStorage)}
              </p>
            </div>
          </div>
        </div>

        {/* Header Row */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">My Secure Files 🔐</h2>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search files..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-gray-800 text-white px-4 py-2.5 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500 w-56"
            />
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition duration-200 whitespace-nowrap font-medium"
            >
              <FiUpload /> Upload File
            </button>
          </div>
        </div>

        {/* Category Filter — Single Row */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`text-xs px-4 py-2 rounded-full transition duration-200 whitespace-nowrap flex-shrink-0 font-medium ${
                categoryFilter === cat
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Files Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading your secure files...</p>
            </div>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <FiFolder className="text-6xl text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              {search ? "No files found!" : "No files yet!"}
            </h3>
            <p className="text-gray-500 mb-6">
              {search
                ? "Try a different search term"
                : "Upload your first encrypted file"}
            </p>
            {!search && (
              <button
                onClick={() => setShowUpload(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition duration-200"
              >
                <FiUpload /> Upload Your First File
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredFiles.map((file) => (
              <FileCard key={file._id} file={file} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onUpload={handleUpload}
        />
      )}
    </div>
  );
};

export default Dashboard;
