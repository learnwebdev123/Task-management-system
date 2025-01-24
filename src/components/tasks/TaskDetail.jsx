import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import authService from '../../services/authService';

const TaskDetail = () => {
  const { taskId } = useParams();
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTaskDetails();
  }, [taskId]);

  const loadTaskDetails = async () => {
    try {
      const response = await axios.get(`/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${authService.getToken()}` }
      });
      setTask(response.data);
      setComments(response.data.comments);
      setAttachments(response.data.attachments);
      setLoading(false);
    } catch (err) {
      setError('Failed to load task details');
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `/api/tasks/${taskId}/comments`,
        { text: newComment },
        { headers: { Authorization: `Bearer ${authService.getToken()}` }}
      );
      setComments([...comments, response.data]);
      setNewComment('');
    } catch (err) {
      setError('Failed to add comment');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(
        `/api/tasks/${taskId}/attachments`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${authService.getToken()}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      setAttachments([...attachments, response.data]);
    } catch (err) {
      setError('Failed to upload file');
    }
  };

  if (loading) {
    return <div className="text-center">Loading task details...</div>;
  }

  if (!task) {
    return <div className="text-center text-red-600">Task not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Task Details */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">{task.title}</h2>
        
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Description</h3>
            <p className="text-gray-600 mt-1">{task.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-medium">Status</h3>
              <p className="text-gray-600 mt-1">{task.status}</p>
            </div>
            <div>
              <h3 className="text-lg font-medium">Priority</h3>
              <p className="text-gray-600 mt-1">{task.priority}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium">Assigned To</h3>
            <p className="text-gray-600 mt-1">
              {task.assignedTo?.username || 'Unassigned'}
            </p>
          </div>
        </div>
      </div>

      {/* Attachments Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Attachments</h3>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <input
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
            >
              Add Attachment
            </label>
          </div>

          <ul className="divide-y divide-gray-200">
            {attachments.map(attachment => (
              <li key={attachment._id} className="py-3 flex justify-between items-center">
                <span className="text-gray-600">{attachment.filename}</span>
                <a
                  href={attachment.url}
                  download
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  Download
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Comments</h3>
        
        <form onSubmit={handleCommentSubmit} className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows="3"
          />
          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              Add Comment
            </button>
          </div>
        </form>

        <div className="space-y-4">
          {comments.map(comment => (
            <div key={comment._id} className="border-b border-gray-200 pb-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <span className="font-medium">{comment.user.username}</span>
                  <span className="text-gray-500 ml-2">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <p className="text-gray-600 mt-2">{comment.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;