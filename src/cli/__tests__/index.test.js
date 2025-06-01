const { init, parseCommandLineArgs, validateAppId, validateSubscriberId, validateProjectStructure } = require('../index');
const fileUtils = require('../../utils/file');
const logger = require('../../utils/logger');
const { program } = require('commander');

// Mock dependencies
jest.mock('../../utils/file');
jest.mock('../../utils/logger');
jest.mock('commander', () => ({
  program: {
    option: jest.fn().mockReturnThis(),
    parse: jest.fn(),
    opts: jest.fn()
  }
}));

describe('CLI Functions', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    fileUtils.joinPaths.mockImplementation((...args) => args.join('/'));
  });

  describe('parseCommandLineArgs', () => {
    it('should parse appId and subscriberId from command line arguments', () => {
      program.opts.mockReturnValue({
        appId: 'test-app-id',
        subscriberId: 'test-subscriber-id'
      });

      const result = parseCommandLineArgs();

      expect(result).toEqual({
        appId: 'test-app-id',
        subscriberId: 'test-subscriber-id'
      });
      expect(program.option).toHaveBeenCalledWith('--appId <id>', 'Novu Application Identifier');
      expect(program.option).toHaveBeenCalledWith('--subscriberId <id>', 'Novu Subscriber Identifier');
      expect(program.parse).toHaveBeenCalledWith(process.argv);
    });

    it('should return undefined values when no arguments are provided', () => {
      program.opts.mockReturnValue({
        appId: undefined,
        subscriberId: undefined
      });

      const result = parseCommandLineArgs();

      expect(result).toEqual({
        appId: undefined,
        subscriberId: undefined
      });
    });
  });

  describe('validateAppId', () => {
    it('should return true for valid appId', () => {
      expect(validateAppId('valid-app-id')).toBe(true);
    });

    it('should return true for undefined appId', () => {
      expect(validateAppId(undefined)).toBe(true);
    });

    it('should return false for empty string appId', () => {
      expect(validateAppId('')).toBe(false);
    });

    it('should return false for non-string appId', () => {
      expect(validateAppId(123)).toBe(false);
    });
  });

  describe('validateSubscriberId', () => {
    it('should return true for valid subscriberId', () => {
      expect(validateSubscriberId('valid-subscriber-id')).toBe(true);
    });

    it('should return true for undefined subscriberId', () => {
      expect(validateSubscriberId(undefined)).toBe(true);
    });

    it('should return false for empty string subscriberId', () => {
      expect(validateSubscriberId('')).toBe(false);
    });

    it('should return false for non-string subscriberId', () => {
      expect(validateSubscriberId(123)).toBe(false);
    });
  });

  describe('validateProjectStructure', () => {
    it('should return true when package.json exists', () => {
      fileUtils.exists.mockReturnValue(true);
      expect(validateProjectStructure()).toBe(true);
      expect(fileUtils.exists).toHaveBeenCalledWith(expect.stringContaining('package.json'));
    });

    it('should return false when package.json does not exist', () => {
      fileUtils.exists.mockReturnValue(false);
      expect(validateProjectStructure()).toBe(false);
      expect(logger.error).toHaveBeenCalled();
    });
  });
}); 