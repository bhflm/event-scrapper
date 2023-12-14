import { Request, Response } from 'express'
import { ethers } from 'ethers'
import {
  parseFeeCollectorEvents,
  loadFeeCollectorEvents,
  loadFeeCollectorEventsInChunks,
  getLastChainBlock,
  parseToEventsModel,
} from '../helpers'
import * as feeCollectorService from '../services/feeCollector.service'
import { FeeCollectorContract } from '../contracts/feeCollector'
import { getChainIdByName } from '../helpers/chain'
import { BLOCKS_RANGE_THRESHOLD } from '../helpers';

const fetchRawEventsWithMultipleProviders = async (
  feeCollector: FeeCollectorContract,
  fromBlock: number,
  toBlock: number
): Promise<ethers.Event[]> => {
  const blockRangeScan = toBlock - fromBlock

  let rawEvents
  try {
    if (blockRangeScan > BLOCKS_RANGE_THRESHOLD) {
      rawEvents = await loadFeeCollectorEventsInChunks(
        feeCollector,
        fromBlock + 1,
        toBlock
      )
    } else {
      rawEvents = await loadFeeCollectorEvents(
        feeCollector,
        fromBlock + 1,
        toBlock
      )
    }

    return rawEvents
  } catch (err) {
    console.log('fetchRawEvents', err)
    throw Error(err)
  }
}

export const fetchAndSaveLastEvents = async (req: Request, res: Response) => {
  try {
    const {
      body: { scanBlock, chain },
    } = req

    if (!chain) {
      const missingChainParameterErrorMessage = 'Need to suply a chain name'
      console.error(missingChainParameterErrorMessage)
      res.status(400).send({ message: missingChainParameterErrorMessage })
    }

    const chainId = getChainIdByName(chain)
    const feeCollector = new FeeCollectorContract(chainId)
    const feeCollectorContract = feeCollector.getFeeCollectorInstance()

    let toBlock

    if (!scanBlock) {
      toBlock = await getLastChainBlock(chainId)
    } else {
      toBlock = scanBlock
    }

    const fromBlock = await feeCollectorService.getLastIndexedBlock(chainId) // + 1;

    if (toBlock <= fromBlock.lastIndexedBlock) {
      const minorBlockRangeErrorMessage = `Invalid block range: ${toBlock} Needs to be > than last indexed block`
      console.log(minorBlockRangeErrorMessage)
      return res.status(400).send({
        message: minorBlockRangeErrorMessage,
        lastIndexedBlock: fromBlock.lastIndexedBlock,
      })
    }

    const rawEvents = await fetchRawEventsWithMultipleProviders(
      feeCollector,
      fromBlock.lastIndexedBlock,
      toBlock
    )

    if (rawEvents.length > 0) {
      const feeCollectorEvents = parseFeeCollectorEvents(
        feeCollectorContract,
        rawEvents
      )
      const events = parseToEventsModel(feeCollectorEvents, chainId)
      await feeCollectorService.createManyEvents(events)
    }

    await feeCollectorService.saveLastIndexedBlock(toBlock, chainId)

    return res.send({ scanned: rawEvents.length })
  } catch (error) {
    console.error('fetchAndSaveLastEvents Error: ', error)
    res.status(400).send({ error })
  }
}

export const getEventsByIntegrator = async (req: Request, res: Response) => {
  const {
    params: { address, chain },
  } = req
  try {
    const chainId = getChainIdByName(chain)

    if (!address) {
      const missingAddressError = 'Need to supply a integrator address.'
      res.status(400).send({ message: missingAddressError }) // FIX: status code
    }

    const rawEventsByIntegrator =
      await feeCollectorService.getEventsByIntegrator(address, chainId)

    const events = rawEventsByIntegrator.map(
      ({ integrator, integratorFee, token, lifiFee }) => ({
        integrator,
        token,
        integratorFee,
        lifiFee,
      })
    )

    res.send({ events, amount: events.length })
  } catch (error) {
    console.error('Error getEventsByIntegrator: ', error.message)
    res.status(400).send({ error })
  }
}
