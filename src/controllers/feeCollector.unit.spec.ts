import { Request, Response } from 'express';
import { vi, describe, expect, test, it } from 'vitest'
import { fetchAndSaveLastEvents } from './feeCollector.controller'

vi.mock('@typegoose/typegoose');

describe('fetchAndSaveLastEvents', async () => {
  // @@ WIP

  it('should throw with unsupported chain', async () => {
    expect(true).toBe(false);
  });

  it('should not fetch with invalid block range', async () => {
    expect(true).toBe(false);
  })

  it('should fetch 5 events from given blockrange', async () => {
    expect(true).toBe(false);
  });
})