/*
import { ProjectService } from '../../services/project.service';

describe('ProjectService', () => {
  let projectService: ProjectService;

  beforeEach(() => {
    projectService = new ProjectService();
  });

  describe('createProject', () => {
    it('should create a new project', async () => {
      const projectData = {
        clientName: 'Test Client',
        clientEmail: 'test@example.com',
        building: {
          type: 'commercial' as const,
          size: 1000,
        },
      };

      const project = await projectService.createProject(projectData);

      expect(project).toBeDefined();
      expect(project.clientName).toBe(projectData.clientName);
      expect(project.clientEmail).toBe(projectData.clientEmail);
      expect(project.building).toEqual(projectData.building);
      expect(project.status).toBe('draft');
    });
  });

  describe('getProject', () => {
    it('should return undefined for non-existent project', async () => {
      const project = await projectService.getProject('non-existent-id');
      expect(project).toBeUndefined();
    });

    it('should retrieve stored project', async () => {
      const projectData = {
        clientName: 'Test Client',
        clientEmail: 'test@example.com',
        building: {
          type: 'commercial' as const,
          size: 1000,
        },
      };

      const createdProject = await projectService.createProject(projectData);
      const retrievedProject = await projectService.getProject(createdProject.id);

      expect(retrievedProject).toBeDefined();
      expect(retrievedProject?.id).toBe(createdProject.id);
    });
  });

  describe('getAllProjects', () => {
    it('should return empty array when no projects exist', async () => {
      const projects = await projectService.getAllProjects();
      expect(projects).toEqual([]);
    });

    it('should retrieve all projects', async () => {
      const projectData1 = {
        clientName: 'Client 1',
        clientEmail: 'client1@example.com',
        building: {
          type: 'commercial' as const,
          size: 1000,
        },
      };
      const projectData2 = {
        clientName: 'Client 2',
        clientEmail: 'client2@example.com',
        building: {
          type: 'residential' as const,
          size: 500,
        },
      };

      const project1 = await projectService.createProject(projectData1);
      const project2 = await projectService.createProject(projectData2);

      const projects = await projectService.getAllProjects();
      expect(projects).toHaveLength(2);
    });
  });

  describe('updateProject', () => {
    it('should update project details', async () => {
      const projectData = {
        clientName: 'Test Client',
        clientEmail: 'test@example.com',
        building: {
          type: 'commercial' as const,
          size: 1000,
        },
      };

      const project = await projectService.createProject(projectData);
      const updatedData = {
        clientName: 'Updated Client',
        building: {
          type: 'residential' as const,
          size: 500,
        },
      };

      const updatedProject = await projectService.updateProject(project.id, updatedData);

      expect(updatedProject).toBeDefined();
      expect(updatedProject?.clientName).toBe(updatedData.clientName);
      expect(updatedProject?.building).toEqual(updatedData.building);
      expect(updatedProject?.clientEmail).toBe(projectData.clientEmail); // Unchanged
    });

    it('should return undefined for non-existent project', async () => {
      const updatedProject = await projectService.updateProject('non-existent-id', {
        clientName: 'Updated Client',
      });
      expect(updatedProject).toBeUndefined();
    });
  });

  describe('deleteProject', () => {
    it('should delete project', async () => {
      const projectData = {
        clientName: 'Test Client',
        clientEmail: 'test@example.com',
        building: {
          type: 'commercial' as const,
          size: 1000,
        },
      };

      const project = await projectService.createProject(projectData);
      await projectService.deleteProject(project.id);

      const deletedProject = await projectService.getProject(project.id);
      expect(deletedProject).toBeUndefined();
    });

    it('should not throw error for non-existent project', async () => {
      await expect(projectService.deleteProject('non-existent-id')).resolves.not.toThrow();
    });
  });
}); 
*/ 