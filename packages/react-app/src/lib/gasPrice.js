import { utils } from 'ethers';
import { GasPriceOracle } from 'gas-price-oracle';

import { isxDaiChain, logError } from './helpers';

const gasPriceOracle = new GasPriceOracle();

const gasPriceFromSupplier = async () => {
  try {
    let json;
    try {
      json = await gasPriceOracle.fetchGasPricesOffChain();
    } catch (e) {
      logError(`Gas Price Oracle not available. ${e.message}`);

      json = {
        rapid: 23463150307,
        fast: 17333603729,
        standard: 17333603729,
        slow: 17333603729,
        timestamp: 1706788121471,
        price: 2267.03,
        priceUSD: 2267.03,
      };
    }

    if (!json) {
      logError(`Response from Oracle didn't include gas price`);
      return null;
    }

    const returnJson = {};
    for (const speedType in json) {
      if (Object.prototype.hasOwnProperty.call(json, speedType)) {
        returnJson[speedType] = utils.parseUnits(
          json[speedType].toFixed(2),
          'gwei',
        );
      }
    }
    if (Object.keys(returnJson).length > 0) {
      return returnJson;
    }
    return null;
  } catch (e) {
    logError(`Gas Price Oracle not available. ${e.message}`);
  }
  return null;
};

const {
  REACT_APP_GAS_PRICE_FALLBACK_GWEI,
  REACT_APP_GAS_PRICE_SPEED_TYPE,
  REACT_APP_GAS_PRICE_UPDATE_INTERVAL,
} = process.env;

const DEFAULT_GAS_PRICE_SPEED_TYPE = 'standard';
const DEFAULT_GAS_PRICE_UPDATE_INTERVAL = 15000;

class GasPriceStore {
  gasPrice = null;

  fastGasPrice = null;

  speedType = null;

  updateInterval = null;

  constructor() {
    this.gasPrice = utils.parseUnits(
      REACT_APP_GAS_PRICE_FALLBACK_GWEI || '0',
      'gwei',
    );
    this.fastGasPrice = utils.parseUnits(
      REACT_APP_GAS_PRICE_FALLBACK_GWEI || '0',
      'gwei',
    );
    this.speedType =
      REACT_APP_GAS_PRICE_SPEED_TYPE || DEFAULT_GAS_PRICE_SPEED_TYPE;
    this.updateInterval =
      REACT_APP_GAS_PRICE_UPDATE_INTERVAL || DEFAULT_GAS_PRICE_UPDATE_INTERVAL;
    this.updateGasPrice();
  }

  async updateGasPrice() {
    const gasPrices = await gasPriceFromSupplier();
    try {
      if (gasPrices) {
        this.gasPrice = gasPrices[this.speedType];
        this.fastGasPrice = gasPrices.fast;
      }
    } catch (gasPriceError) {
      logError({ gasPriceError });
    }

    setTimeout(() => this.updateGasPrice(), this.updateInterval);
  }

  gasPriceInHex() {
    if (this.gasPrice.gt(0)) {
      return this.gasPrice.toHexString();
    }
    return undefined;
  }

  fastGasPriceInBN() {
    if (this.fastGasPrice.gt(0)) {
      return this.fastGasPrice;
    }
    return utils.parseUnits('50', 'gwei').toHexString();
  }
}

const foreignGasStore = new GasPriceStore();

export const getGasPrice = chainId => {
  if (isxDaiChain(chainId)) {
    return utils.parseUnits('11', 'gwei').toHexString();
  }
  return foreignGasStore.gasPriceInHex();
};

export const getFastGasPrice = () => {
  return foreignGasStore.fastGasPriceInBN();
};
