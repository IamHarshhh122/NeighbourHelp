import React, { useState, useEffect } from 'react';
import { HiPlus, HiLocationMarker, HiCheckCircle, HiClock, HiUser } from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Microtask() {
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General Help');
  const [address, setAddress] = useState('');

  // Fetch tasks from backend MongoDB on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/tasks/nearby?lat=28.6139&lng=77.2090&radiusInKm=10");
      const data = await response.json();
      if (data.success) {
        setTasks(data.tasks);
      } else {
        toast.error(data.message || "Failed to load tasks");
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
      toast.error("Failed to load tasks from server");
    }
  };

  const handlePostTask = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !address.trim()) {
      toast.error("All fields are required!");
      return;
    }

    try {
      // Check both 'Users' and 'User' in localStorage
      const storedUser = JSON.parse(localStorage.getItem("Users") || localStorage.getItem("User") || "{}");
      const posterId = storedUser._id || storedUser.id;

      if (!posterId) {
        toast.error("Please login first to post a task!");
        return;
      }

      const response = await fetch("http://localhost:5000/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          location: { address, lat: 28.6139, lng: 77.2090 },
          poster: posterId
        })
      });

      const data = await response.json();
      if (data.success) {
        setTasks([data.task, ...tasks]);
        setTitle('');
        setDescription('');
        setAddress('');
        setShowModal(false);
        toast.success("Task published successfully! 🚀");
      } else {
        toast.error(data.message || "Failed to post task");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server connection error!");
    }
  };

  const handleAcceptTask = async (taskId) => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("Users") || "{}");
      const response = await fetch(`http://localhost:5000/api/tasks/accept/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ helperId: storedUser._id || storedUser.id })
      });

      const data = await response.json();
      if (data.success) {
        setTasks(tasks.map(t => t._id === taskId ? data.task : t));
        toast.success("Task accepted successfully! Helper mode active 🤝");
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Server connection error!");
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col justify-between relative overflow-hidden">
      
      {/* BACKGROUND GLOWS */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px]" />
      </div>

      <Navbar />

      <main className="w-full max-w-5xl mx-auto px-4 py-10 relative z-10 my-auto">
        
        {/* HEADER & POST BUTTON */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black">Nearby Micro-Tasks</h1>
            <p className="text-xs text-slate-400 mt-1">Help neighbors within your 1-2 km radius or post your own task.</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-5 h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg shadow-blue-600/20 text-white"
          >
            <HiPlus className="text-base" /> Post a Task
          </button>
        </div>

        {/* TASK LIST GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.length === 0 ? (
            <p className="text-xs text-slate-400 col-span-2 text-center py-10">No active tasks found nearby.</p>
          ) : (
            tasks.map((task) => (
              <div key={task._id} className="rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-xl p-5 flex flex-col justify-between shadow-xl">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-bold uppercase tracking-wider">
                      {task.category}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${task.status === 'Open' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'}`}>
                      {task.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-1.5">{task.title}</h3>
                  <p className="text-xs text-slate-400 mb-4 line-clamp-2">{task.description}</p>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
                    <HiLocationMarker className="text-blue-400 text-sm shrink-0" />
                    <span className="truncate">{task.location?.address}</span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
                        <HiUser className="text-xs" />
                      </div>
                      <span className="text-xs font-semibold text-slate-300">{task.poster?.name || "Neighbour User"}</span>
                    </div>

                    {task.status === 'Open' ? (
                      <button
                        onClick={() => handleAcceptTask(task._id)}
                        className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-bold transition text-white shadow-md shadow-cyan-600/20"
                      >
                        Accept Task
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                        <HiClock /> In Progress
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </main>

      {/* POST TASK MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative">
            <h2 className="text-xl font-black mb-4">Post a New Task</h2>
            <form onSubmit={handlePostTask} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-slate-300 mb-1 block">Task Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Need help carrying grocery bags"
                  className="w-full h-11 px-4 rounded-xl bg-slate-950 border border-white/10 text-sm outline-none focus:border-blue-500 text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 mb-1 block">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-slate-950 border border-white/10 text-sm outline-none focus:border-blue-500 text-white"
                >
                  <option value="General Help">General Help</option>
                  <option value="Parcel Receiving">Parcel Receiving</option>
                  <option value="Quick Fix">Quick Fix</option>
                  <option value="Bank Errands">Bank Errands</option>
                  <option value="Grocery Pickup">Grocery Pickup</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 mb-1 block">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what needs to be done..."
                  rows={3}
                  className="w-full p-4 rounded-xl bg-slate-950 border border-white/10 text-sm outline-none focus:border-blue-500 text-white resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 mb-1 block">Location / Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g., Block B, Near Park (500m)"
                  className="w-full h-11 px-4 rounded-xl bg-slate-950 border border-white/10 text-sm outline-none focus:border-blue-500 text-white"
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold transition text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold transition text-white shadow-lg shadow-blue-600/20"
                >
                  Publish Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />

    </div>
  );
}