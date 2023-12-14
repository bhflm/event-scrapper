import { vi, describe, expect, it } from 'vitest'
import * as feeCollectorService from './feeCollector.service';

vi.mock('@typegoose/typegoose', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@typegoose/typegoose')>()
  return {
    ...mod,
    prop: vi.fn(),
    getModelForClass: vi.fn(() => ({
      findOne: vi.fn(() => ({ chainId: 1, lastIndexedBlock: 42 })),
      findOneAndUpdate: vi.fn(() => ({
        _id: 'foo',
        lastIndexedBlock: 43,
        chainId: 1,
      })),
      insertMany: vi.fn(() => ([
        {
          _id: 'foobar',
          integrator: '0xB',
          token: '0xA',
          integratorFee: '700',
          lifiFee: '70',
          chainId: 1,
        },
        {
          _id: 'bar',
          integrator: '0xAA',
          token: '0xAB',
          integratorFee: '7000',
          lifiFee: '700',
          chainId: 1,
        },
      ])),
      find: vi.fn(() => ({
        exec: vi.fn(() => ([
          {
            _id: 'foobar',
            integrator: '0xB',
            token: '0xA',
            integratorFee: '700',
            lifiFee: '70',
            chainId: 1,
          }
        ]))
      })),
    })),
  }
})

describe('getLastIndexedBlock', async () => {
  it('Should return existing block', async () => {
    const chainId = 1;
    const expectedLastIndexedBlock = 42;
    const result = await feeCollectorService.getLastIndexedBlock(chainId);
    expect(result).toEqual({ lastIndexedBlock: expectedLastIndexedBlock, chainId });    
  });
})

describe('saveLastIndexedBlock', async () => {
  it('Should save expected block and return', async () => {
    const mockChainId = 1;
    const newLastIndexedBlock = 43;
    const result = await feeCollectorService.saveLastIndexedBlock(newLastIndexedBlock, mockChainId);
    expect(result).toEqual({ 
      _id: 'foo',
      lastIndexedBlock: 43,
      chainId: 1, 
    });
  });
});

const mockEventA = {
  integrator: '0xB',
  token: '0xA',
  integratorFee: '700',
  lifiFee: '70',
  chainId: 1,
};
const mockEventB = {
  integrator: '0xAA',
  token: '0xAB',
  integratorFee: '7000',
  lifiFee: '700',
  chainId: 1,
};

describe('createManyEvents', async () => {
  it('Should create more than 1 event and return', async () => {
    const result = await feeCollectorService.createManyEvents([ mockEventA, mockEventB ])
    
    mockEventA["_id"] = 'foobar';
    mockEventB["_id"] = 'bar';

    expect(result).toEqual([mockEventA, mockEventB]);
  });
});

describe('getEventsByIntegrator', async() => {
  it('Should find events by single integrator', async () => {
    const mockChainId = 1;
    const result = await feeCollectorService.getEventsByIntegrator(mockEventA.integrator, mockChainId);
    expect(result).toEqual([mockEventA]);
  });
});