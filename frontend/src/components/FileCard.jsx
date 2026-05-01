import { useState } from "react";
import { toast } from "react-toastify";
import {
  deleteFile,
  downloadFile,
  generateShareLink,
  revokeShareLink,
} from "../utils/api";
import {
  FiFile,
  FiDownload,
  FiTrash2,
  FiShare2,
  FiX,
  FiClock,
  FiEye,
} from "react-icons/fi";

const FileCard = ({ file, onDelete }) => {
  const [sharing, setSharing] = useState(false);
  const [shareData, setShareData] = useState(null);
  const [shareForm, setShareForm] = useState({
    expiryHours: 24,
    accessLimit: "",
  });
  const [loading, setLoading] = useState(false);

  // Format file size
  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Get AI category color
  const getCategoryColor = (category) => {
    const colors = {
      Document: "bg-blue-900/40 text-blue-400 border-blue-700",
      Image: "bg-green-900/40 text-green-400 border-green-700",
      Report: "bg-purple-900/40 text-purple-400 border-purple-700",
      Sensitive: "bg-red-900/40 text-red-400 border-red-700",
      Notes: "bg-yellow-900/40 text-yellow-400 border-yellow-700",
      Spreadsheet: "bg-emerald-900/40 text-emerald-400 border-emerald-700",
      Presentation: "bg-orange-900/40 text-orange-400 border-orange-700",
      Other: "bg-gray-900/40 text-gray-400 border-gray-700",
    };
    return colors[category] || colors["Other"];
  };

  // Get AI category emoji
  const getCategoryEmoji = (category) => {
    const emojis = {
      Document: "📄",
      Image: "🖼️",
      Report: "📊",
      Sensitive: "🔒",
      Notes: "📝",
      Spreadsheet: "📈",
      Presentation: "📺",
      Other: "📁",
    };
    return emojis[category] || "📁";
  };

  // Get file icon color by type
  const getFileColor = (mimetype) => {
    if (mimetype?.includes("image")) return "text-green-400";
    if (mimetype?.includes("pdf")) return "text-red-400";
    if (mimetype?.includes("word")) return "text-blue-400";
    return "text-yellow-400";
  };

  // Handle download
  const handleDownload = async () => {
    try {
      const response = await downloadFile(file._id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", file.originalName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("✅ File downloaded!");
    } catch (error) {
      toast.error("Download failed!");
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;
    try {
      await deleteFile(file._id);
      toast.success("✅ File deleted!");
      onDelete(file._id);
    } catch (error) {
      toast.error("Delete failed!");
    }
  };

  // Handle share
  const handleShare = async () => {
    setLoading(true);
    try {
      const { data } = await generateShareLink({
        fileId: file._id,
        expiryHours: parseInt(shareForm.expiryHours),
        accessLimit: shareForm.accessLimit
          ? parseInt(shareForm.accessLimit)
          : null,
      });
      setShareData(data);
      toast.success("✅ Share link generated!");
    } catch (error) {
      toast.error("Failed to generate link!");
    } finally {
      setLoading(false);
    }
  };

  // Handle revoke
  const handleRevoke = async () => {
    try {
      await revokeShareLink(file._id);
      setShareData(null);
      setSharing(false);
      toast.success("✅ Share link revoked!");
    } catch (error) {
      toast.error("Failed to revoke link!");
    }
  };

  // Copy link
  const copyLink = () => {
    navigator.clipboard.writeText(shareData.shareLink);
    toast.success("✅ Link copied to clipboard!");
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 hover:border-blue-500 transition duration-200">
      {/* File Info */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <FiFile className={`text-3xl ${getFileColor(file.mimetype)}`} />
          <div>
            <p className="text-white font-medium text-sm truncate max-w-[150px]">
              {file.originalName}
            </p>
            <p className="text-gray-400 text-xs">{formatSize(file.size)}</p>

            {/* AI Category Badge */}
            {file.aiCategory && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full border mt-1 inline-block ${getCategoryColor(file.aiCategory)}`}
              >
                {getCategoryEmoji(file.aiCategory)} {file.aiCategory}
              </span>
            )}
          </div>
        </div>
        <span className="text-gray-500 text-xs">
          {formatDate(file.createdAt)}
        </span>
      </div>

      {/* AI Description */}
      {file.aiDescription && (
        <p className="text-gray-500 text-xs mt-2 mb-3 italic">
          🤖 {file.aiDescription}
        </p>
      )}

      {/* AI Tags */}
      {file.aiTags && file.aiTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {file.aiTags.map((tag, i) => (
            <span key={i} className="text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded-full">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 rounded-lg transition duration-200"
        >
          <FiDownload /> Download
        </button>
        <button
          onClick={() => setSharing(!sharing)}
          className="flex-1 flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white text-xs py-2 rounded-lg transition duration-200"
        >
          <FiShare2 /> Share
        </button>
        <button
          onClick={handleDelete}
          className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white text-xs p-2 rounded-lg transition duration-200"
        >
          <FiTrash2 />
        </button>
      </div>

      {/* Share Panel */}
      {sharing && (
        <div className="mt-4 p-4 bg-gray-700 rounded-lg border border-gray-600">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-white text-sm font-medium">Share Settings</h4>
            <button
              onClick={() => setSharing(false)}
              className="text-gray-400 hover:text-white"
            >
              <FiX />
            </button>
          </div>

          {!shareData ? (
            <>
              <div className="space-y-3 mb-3">
                <div>
                  <label className="text-gray-400 text-xs flex items-center gap-1 mb-1">
                    <FiClock /> Expiry (hours)
                  </label>
                  <input
                    type="number"
                    value={shareForm.expiryHours}
                    onChange={(e) =>
                      setShareForm({
                        ...shareForm,
                        expiryHours: e.target.value,
                      })
                    }
                    className="w-full bg-gray-600 text-white px-3 py-2 rounded-lg text-sm border border-gray-500 focus:outline-none focus:border-blue-500"
                    min="1"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-xs flex items-center gap-1 mb-1">
                    <FiEye /> Access Limit (optional)
                  </label>
                  <input
                    type="number"
                    value={shareForm.accessLimit}
                    onChange={(e) =>
                      setShareForm({
                        ...shareForm,
                        accessLimit: e.target.value,
                      })
                    }
                    placeholder="Unlimited"
                    className="w-full bg-gray-600 text-white px-3 py-2 rounded-lg text-sm border border-gray-500 focus:outline-none focus:border-blue-500"
                    min="1"
                  />
                </div>
              </div>
              <button
                onClick={handleShare}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white text-sm py-2 rounded-lg transition duration-200 disabled:opacity-50"
              >
                {loading ? "Generating..." : "Generate Link 🔗"}
              </button>
            </>
          ) : (
            <>
              <div className="bg-gray-600 rounded-lg p-3 mb-3">
                <p className="text-blue-400 text-xs break-all">
                  {shareData.shareLink}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={copyLink}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 rounded-lg transition duration-200"
                >
                  Copy Link 📋
                </button>
                <button
                  onClick={handleRevoke}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs py-2 rounded-lg transition duration-200"
                >
                  Revoke ❌
                </button>
              </div>
              <p className="text-gray-400 text-xs mt-2 text-center">
                Expires: {new Date(shareData.expiresAt).toLocaleString()}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default FileCard;
