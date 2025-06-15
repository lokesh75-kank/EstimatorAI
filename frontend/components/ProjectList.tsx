'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Project } from '@/types/api';
import { apiService } from '@/services/api';
import { FaPlus, FaBuilding, FaEnvelope, FaUser, FaThList, FaRulerCombined, FaTimes } from 'react-icons/fa';

const initialProject: Project = {
  id: '',
  projectName: '',
  clientName: '',
  clientEmail: '',
  clientPhone: '',
  building: {
    type: '',
    size: '0',
    floors: 1,
    zones: 1,
  },
  location: {
    address: '',
    city: '',
    state: '',
    country: '',
    zipCode: ''
  },
  requirements: {
    description: ''
  },
  status: 'draft',
  messages: [],
  history: [],
  metadata: {},
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export function ProjectList() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newProject, setNewProject] = useState<Project>(initialProject);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const fetchedProjects = await apiService.getProjects();
      setProjects(fetchedProjects);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.createProject(newProject);
      setIsCreating(false);
      setNewProject(initialProject);
      fetchProjects();
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'estimation_in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'analyzed':
        return 'bg-green-100 text-green-800';
      case 'proposal_sent':
        return 'bg-yellow-100 text-yellow-800';
      case 'negotiation':
        return 'bg-purple-100 text-purple-800';
      case 'won':
        return 'bg-green-100 text-green-800';
      case 'lost':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (projects.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-lg">
        <FaThList className="mx-auto text-5xl text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Projects Yet</h3>
        <p className="text-gray-500 mb-6">Get started by creating your first project.</p>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center mx-auto px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-lg shadow-lg hover:from-blue-700 hover:to-indigo-700 transition transform hover:scale-105"
        >
          <FaPlus className="mr-2" /> Create First Project
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-lg shadow-lg hover:from-blue-700 hover:to-indigo-700 transition transform hover:scale-105"
        >
          <FaPlus className="mr-2" /> New Project
        </button>
      </div>

      {isCreating && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg transform transition-all">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-blue-700">Create New Project</h2>
              <button onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-gray-600">
                <FaTimes size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateProject} className="space-y-6">
              <div>
                <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaBuilding className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="projectName"
                    value={newProject.projectName}
                    onChange={(e) => setNewProject((prev) => ({ ...prev, projectName: e.target.value }))}
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2.5"
                    placeholder="My New Project"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="clientName"
                    value={newProject.clientName}
                    onChange={(e) => setNewProject((prev) => ({ ...prev, clientName: e.target.value }))}
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2.5"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="clientEmail" className="block text-sm font-medium text-gray-700 mb-1">Client Email</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="clientEmail"
                    value={newProject.clientEmail}
                    onChange={(e) => setNewProject((prev) => ({ ...prev, clientEmail: e.target.value }))}
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2.5"
                    placeholder="john.doe@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="buildingType" className="block text-sm font-medium text-gray-700 mb-1">Building Type</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaBuilding className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="buildingType"
                    value={newProject.building.type}
                    onChange={(e) => setNewProject((prev) => ({ ...prev, building: { ...prev.building, type: e.target.value } }))}
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2.5"
                    placeholder="Commercial Office"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="buildingSize" className="block text-sm font-medium text-gray-700 mb-1">Building Size (sq ft)</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaRulerCombined className="text-gray-400" />
                  </div>
                  <input
                    type="number"
                    id="buildingSize"
                    value={parseInt(newProject.building.size)}
                    onChange={(e) => setNewProject((prev) => ({ ...prev, building: { ...prev.building, size: e.target.value } }))}
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2.5"
                    placeholder="50000"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md hover:from-blue-700 hover:to-indigo-700 transition"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project) => (
          <div
            key={project.id}
            onClick={() => router.push(`/projects/${project.id}`)}
            className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 cursor-pointer overflow-hidden transform hover:scale-105"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-bold text-blue-700 truncate">{project.projectName}</h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(
                    project.status
                  )}`}
                >
                  {project.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-1 flex items-center"><FaEnvelope className="mr-2 text-gray-400" /> {project.clientEmail}</p>
              <p className="text-gray-600 text-sm mb-4 flex items-center"><FaBuilding className="mr-2 text-gray-400" /> {project.building.type} - {project.building.size.toLocaleString()} sq ft</p>
              
              <div className="border-t border-gray-200 pt-4">
                <p className="text-xs text-gray-400">Created: {new Date(project.createdAt).toLocaleDateString()}</p>
                <p className="text-xs text-gray-400">Floors: {project.building.floors}, Zones: {project.building.zones}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 