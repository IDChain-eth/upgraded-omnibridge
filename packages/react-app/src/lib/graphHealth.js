import { gql, request } from 'graphql-request';

import { GRAPH_HEALTH_ENDPOINT, HOME_NETWORK } from './constants';
import { getBridgeNetwork, getSubgraphName, logError } from './helpers';

const FOREIGN_NETWORK = getBridgeNetwork(HOME_NETWORK);

const FOREIGN_SUBGRAPH = getSubgraphName(FOREIGN_NETWORK);

const healthQuery = gql`
  query getHealthStatus($subgraphForeign: String!) {
    foreignHealth: indexingStatusForCurrentVersion(
      subgraphName: $subgraphForeign
    ) {
      synced
      health
      fatalError {
        message
        block {
          number
          hash
        }
        handler
      }
      chains {
        chainHeadBlock {
          number
        }
        latestBlock {
          number
        }
      }
    }
  }
`;

const extractStatus = ({ fatalError, synced, chains }) => ({
  isReachable: true,
  isFailed: !!fatalError,
  isSynced: synced,
  latestBlockNumber: Number(chains[0].latestBlock.number),
});

const failedStatus = {
  isReachable: false,
  isFailed: true,
  isSynced: false,
  latestBlockNumber: 0,
};

export const getHealthStatus = async () => {
  try {
    const data = await request(GRAPH_HEALTH_ENDPOINT, healthQuery, {
      subgraphForeign: FOREIGN_SUBGRAPH,
    });
    return {
      foreignHealth: extractStatus(data.foreignHealth),
    };
  } catch (graphHealthError) {
    logError({ graphHealthError });
  }
  return {
    foreignHealth: failedStatus,
  };
};
