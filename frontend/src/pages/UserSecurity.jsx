import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getMyStats, getMyLogs } from "../utils/api";
import Navbar from "../components/Navbar";
import {
  FiFolder, FiShield, FiUpload, FiDownload,
  FiLogIn, FiActivity, FiAlertTriangle
} from "react-icons/fi";

const UserSecurity = () => {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchMyStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchMyLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, page]);

  const fetchMyStats = async () => {
    try {
      const { data } = await getMyStats();
      setStats(data.stats);
    } catch (error) {
      toast.error("Failed to fetch stats!");
    }
  };

  const fetchMyLogs = async () => {
    setLoading(true);
    try {
      const { data } = await getMyLogs(page, filter);
      setLogs(data.logs);
      setPagination(data.pagination);
    } catch (error) {
      toast.error("Failed to fetch logs!");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === "SUCCESS") return "text-green-400 bg-green-900/30";
    if (status === "FAILED") return "text-red-400 bg-red-900/30";
    if (status === "WARNING") return "text-yellow-400 bg-yellow-900/30";
    return "text-gray-400";
  };

  const getActionColor = (action) => {
    if (action?.includes("LOGIN_FAILED")) return "text-red-400";
    if (action?.includes("SUSPICIOUS")) return "text-yellow-400";
    if (action?.includes("LOGIN")) return "text-green-400";
    if (action?.includes("UPLOAD")) return "text-blue-400";
    if (action?.includes("DOWNLOAD")) return "text-purple-400";
    if (action?.includes("DELETE")) return "text-red-300";
    return "text-gray-400";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-IN", {
      day: "numeric", month: "short",
      hour: "2-digit", minute: "2-digit"
    });
  };

  const filters = ["ALL", "LOGIN", "LOGIN_FAILED", "FILE_UPLOAD", "FILE_DOWNLOAD", "FILE_DELETE"];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <FiShield className="text-blue-400" />
            My Security Center
          </h2>
          <p className="text-gray-400 mt-1">
            Your personal activity logs and security overview
          </p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <FiFolder className="text-blue-400 text-xl" />
                <span className="text-gray-400 text-sm">My Files</span>
              </div>
              <p className="text-3xl font-bold">{stats.myFiles}</p>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <FiActivity className="text-purple-400 text-xl" />
                <span className="text-gray-400 text-sm">Total Activities</span>
              </div>
              <p className="text-3xl font-bold">{stats.myTotalLogs}</p>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <FiUpload className="text-blue-400 text-xl" />
                <span className="text-gray-400 text-sm">Today's Uploads</span>
              </div>
              <p className="text-3xl font-bold">{stats.todayUploads}</p>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <FiDownload className="text-green-400 text-xl" />
                <span className="text-gray-400 text-sm">Today's Downloads</span>
              </div>
              <p className="text-3xl font-bold">{stats.todayDownloads}</p>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <FiLogIn className="text-yellow-400 text-xl" />
                <span className="text-gray-400 text-sm">Today's Logins</span>
              </div>
              <p className="text-3xl font-bold">{stats.todayLogins}</p>
            </div>

            <div className={`bg-gray-800 border rounded-xl p-4 ${stats.failedLogins > 0 ? "border-red-800" : "border-gray-700"}`}>
              <div className="flex items-center gap-3 mb-2">
                <FiAlertTriangle className={stats.failedLogins > 0 ? "text-red-400 text-xl" : "text-gray-400 text-xl"} />
                <span className="text-gray-400 text-sm">Failed Logins</span>
              </div>
              <p className={`text-3xl font-bold ${stats.failedLogins > 0 ? "text-red-400" : ""}`}>
                {stats.failedLogins}
              </p>
            </div>
          </div>
        )}

        {/* Failed Login Warning */}
        {stats?.failedLogins > 0 && (
          <div className="bg-red-900/20 border border-red-700 rounded-xl p-4 mb-8 flex items-center gap-3">
            <FiAlertTriangle className="text-red-400 text-2xl flex-shrink-0" />
            <div>
              <p className="text-red-400 font-semibold">Security Warning!</p>
              <p className="text-gray-400 text-sm">
                There were {stats.failedLogins} failed login attempts on your account today.
                If this wasn't you, consider changing your password immediately!
              </p>
            </div>
          </div>
        )}

        {/* My Activity Logs */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl">
          <div className="p-5 border-b border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <FiActivity className="text-blue-400" /> My Activity Logs
            </h3>
            <div className="flex flex-wrap gap-2">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => { setFilter(f); setPage(1); }}
                  className={`text-xs px-3 py-1.5 rounded-lg transition duration-200 ${
                    filter === f
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                  }`}
                >
                  {f.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FiActivity className="text-4xl mx-auto mb-3" />
              <p>No activity logs found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700 text-gray-400 text-sm">
                    <th className="text-left px-5 py-3">Action</th>
                    <th className="text-left px-5 py-3">Description</th>
                    <th className="text-left px-5 py-3">IP Address</th>
                    <th className="text-left px-5 py-3">Status</th>
                    <th className="text-left px-5 py-3">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log._id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition duration-150">
                      <td className="px-5 py-3">
                        <span className={`text-xs font-mono font-bold ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-gray-300 text-sm max-w-xs truncate">{log.description}</p>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-gray-400 font-mono text-xs">{log.ipAddress}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(log.status)}`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-gray-400 text-xs">{formatDate(log.createdAt)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-3 p-5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-gray-400 text-sm">
                Page {page} of {pagination.pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSecurity;