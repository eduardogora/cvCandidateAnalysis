// Mock de prisma (debe ir antes de los imports)
jest.mock('@/lib/prisma', () => ({
  prisma: {
    job: {
      findMany: jest.fn(),
      findUnique: jest.fn()
    },
    $disconnect: jest.fn()
  }
}))

import { getPublicJobs } from '../public-job-actions'
import { prisma } from '@/lib/prisma'

describe('getPublicJobs', () => {
  const mockJobs = [
    {
      id: 1,
      title: 'Software Engineer',
      company: 'Pisa',
      department: 'IT',
      location: 'Mexico City',
      type: 'Full-time',
      level: 'Mid',
      salary: '10000',
      description: 'Test description',
      requirements: 'Test requirements',
      responsibilities: 'Test responsibilities',
      postedDate: new Date('2025-05-21T00:30:42.926Z'),
      applicants: 0,
      createdAt: new Date('2025-05-21T00:30:42.926Z'),
      updatedAt: new Date('2025-05-21T00:30:42.926Z'),
      applications: []
    }
  ]

  beforeEach(() => {
    // Limpiar todos los mocks antes de cada prueba
    jest.clearAllMocks()
    // Silenciar console.error para todas las pruebas
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    // Restaurar console.error después de cada prueba
    jest.restoreAllMocks()
  })

  it('should return jobs successfully', async () => {
    // Arrange
    const findManyMock = prisma.job.findMany as jest.Mock
    const disconnectMock = prisma.$disconnect as jest.Mock
    
    findManyMock.mockResolvedValue(mockJobs)
    disconnectMock.mockResolvedValue(undefined)

    // Act
    const result = await getPublicJobs()

    // Assert
    expect(result.success).toBe(true)
    expect(result.jobs).toEqual(mockJobs)
    expect(result.error).toBeUndefined()
    expect(findManyMock).toHaveBeenCalledTimes(1)
    expect(disconnectMock).toHaveBeenCalledTimes(1)
  })

  it('should handle database errors', async () => {
    // Arrange
    const findManyMock = prisma.job.findMany as jest.Mock
    const disconnectMock = prisma.$disconnect as jest.Mock
    
    findManyMock.mockRejectedValue(new Error('Database error'))
    disconnectMock.mockResolvedValue(undefined)

    // Act
    const result = await getPublicJobs()

    // Assert
    expect(result.success).toBe(false)
    expect(result.jobs).toEqual([])
    expect(result.error).toBe('Failed to fetch jobs. Please try again later.')
    expect(findManyMock).toHaveBeenCalledTimes(1)
    expect(disconnectMock).toHaveBeenCalledTimes(1)
  })

  it('should return empty array when no jobs found', async () => {
    // Arrange
    const findManyMock = prisma.job.findMany as jest.Mock
    const disconnectMock = prisma.$disconnect as jest.Mock
    
    findManyMock.mockResolvedValue([])
    disconnectMock.mockResolvedValue(undefined)

    // Act
    const result = await getPublicJobs()

    // Assert
    expect(result.success).toBe(true)
    expect(result.jobs).toEqual([])
    expect(result.error).toBeUndefined()
    expect(findManyMock).toHaveBeenCalledTimes(1)
    expect(disconnectMock).toHaveBeenCalledTimes(1)
  })
}) 