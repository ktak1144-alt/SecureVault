import { useState } from "react";
import { toast } from "react-toastify";
import { uploadFile } from "../utils/api";
import { FiUpload, FiX, FiFile } from "react-icons/fi";

const UploadModal = ({ onClose, onUpload }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (e) => {
    const selected = e.target.files[0];
    if (selected) setFile(selected);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file!");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await uploadFile(formData);
      toast.success("✅ File uploaded & encrypted!");
      onUpload(data.file);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Upload failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 px-4">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md border border-gray-700">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white text-xl font-bold">Upload File 🔐</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          className={`border-2 border-dashed rounded-xl p-8 text-center mb-4 transition duration-200 cursor-pointer
            ${dragOver ? "border-blue-500 bg-blue-900/20" : "border-gray-600 hover:border-blue-500"}`}
          onClick={() => document.getElementById("fileInput").click()}
        >
          <FiUpload className="text-4xl text-gray-400 mx-auto mb-3" />
          <p className="text-gray-300 font-medium">Drag & drop or click to select</p>
          <p className="text-gray-500 text-sm mt-1">PDF, Images, Word docs up to 10MB</p>
          <input
            id="fileInput"
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.txt"
          />
        </div>

        {/* Selected File */}
        {file && (
          <div className="flex items-center gap-3 bg-gray-700 rounded-lg p-3 mb-4">
            <FiFile className="text-blue-400 text-2xl" />
            <div className="flex-1">
              <p className="text-white text-sm font-medium truncate">{file.name}</p>
              <p className="text-gray-400 text-xs">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button onClick={() => setFile(null)} className="text-gray-400 hover:text-white">
              <FiX />
            </button>
          </div>
        )}

        {/* Encryption Notice */}
        <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-3 mb-4">
          <p className="text-blue-400 text-xs text-center">
            🔐 Your file will be encrypted with AES-256 before being stored
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg transition duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={loading || !file}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition duration-200 disabled:opacity-50"
          >
            {loading ? "Encrypting & Uploading..." : "Upload Securely 🔐"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;